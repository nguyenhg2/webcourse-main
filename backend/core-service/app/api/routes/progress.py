import os
from io import BytesIO
from datetime import datetime, timezone

from bson.binary import Binary
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pymongo.errors import DuplicateKeyError
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from app.core.deps import get_current_user
from app.db.mongo import get_db, oid
from app.models.progress import ProgressUpdate

router = APIRouter()

CERTIFICATE_GENERATOR_VERSION = 2
CERTIFICATE_FONT_REGULAR = "CertificateDejaVu"
CERTIFICATE_FONT_BOLD = "CertificateDejaVuBold"


def _find_font_path(filename: str) -> str | None:
    font_dirs = [
        "/usr/share/fonts/truetype/dejavu",
        "/usr/local/share/fonts",
        "C:/Windows/Fonts",
    ]
    for font_dir in font_dirs:
        path = os.path.join(font_dir, filename)
        if os.path.exists(path):
            return path
    return None


def _register_certificate_fonts():
    if CERTIFICATE_FONT_REGULAR in pdfmetrics.getRegisteredFontNames():
        return

    regular_path = _find_font_path("DejaVuSans.ttf") or _find_font_path("arial.ttf")
    bold_path = _find_font_path("DejaVuSans-Bold.ttf") or _find_font_path("arialbd.ttf")
    if not regular_path or not bold_path:
        raise RuntimeError("No Unicode TTF font found for certificate PDF generation")

    pdfmetrics.registerFont(TTFont(CERTIFICATE_FONT_REGULAR, regular_path))
    pdfmetrics.registerFont(TTFont(CERTIFICATE_FONT_BOLD, bold_path))


def _wrap_text(text: str, font_name: str, font_size: int, max_width: int) -> list[str]:
    words = text.split()
    if not words:
        return [""]

    lines = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if pdfmetrics.stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def _build_certificate_pdf(student_name: str, course_title: str, issued_at: str) -> bytes:
    _register_certificate_fonts()

    buffer = BytesIO()
    page = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    center_x = width / 2

    page.setTitle("Certificate of Completion")
    page.setFont(CERTIFICATE_FONT_BOLD, 28)
    page.drawCentredString(center_x, height - 110, "CERTIFICATE OF COMPLETION")

    page.setFont(CERTIFICATE_FONT_REGULAR, 16)
    page.drawCentredString(center_x, height - 185, "This certifies that")

    page.setFont(CERTIFICATE_FONT_BOLD, 22)
    page.drawCentredString(center_x, height - 225, student_name)

    page.setFont(CERTIFICATE_FONT_REGULAR, 15)
    page.drawCentredString(center_x, height - 275, "has successfully completed")

    y = height - 330
    page.setFont(CERTIFICATE_FONT_BOLD, 22)
    for line in _wrap_text(course_title, CERTIFICATE_FONT_BOLD, 22, 460):
        page.drawCentredString(center_x, y, line)
        y -= 30

    page.setFont(CERTIFICATE_FONT_REGULAR, 13)
    page.drawCentredString(center_x, y - 35, f"Issued on {issued_at}")
    page.showPage()
    page.save()

    return buffer.getvalue()


async def _ensure_certificate(db, user: dict, progress: dict) -> dict:
    course_id = progress["course_id"]
    existing = await db["certificates"].find_one(
        {"user_id": user["_id"], "course_id": course_id}
    )
    if existing and existing.get("generator_version") == CERTIFICATE_GENERATOR_VERSION:
        return existing

    issued_at = existing.get("issued_at") if existing else datetime.now(timezone.utc).isoformat()
    issued_date = issued_at[:10]
    student_name = user.get("name") or "Học viên"
    course_title = progress["course"].get("title") or "Khóa học"
    filename = existing.get("filename") if existing else None
    filename = filename or f"certificate-{course_id}.pdf"
    pdf = _build_certificate_pdf(
        student_name=student_name,
        course_title=course_title,
        issued_at=issued_date,
    )
    certificate = {
        "user_id": user["_id"],
        "course_id": course_id,
        "student_name": student_name,
        "course_title": course_title,
        "issued_at": issued_at,
        "filename": filename,
        "content_type": "application/pdf",
        "generator_version": CERTIFICATE_GENERATOR_VERSION,
        "pdf": Binary(pdf),
    }

    if existing:
        await db["certificates"].update_one(
            {"_id": existing["_id"]},
            {"$set": certificate},
        )
        certificate["_id"] = existing["_id"]
        return certificate

    try:
        result = await db["certificates"].insert_one(certificate)
        certificate["_id"] = result.inserted_id
        return certificate
    except DuplicateKeyError:
        existing = await db["certificates"].find_one({"user_id": user["_id"], "course_id": course_id})
        if existing:
            return await _ensure_certificate(db, user, progress)
        raise


async def _get_course_progress(db, user_id: str, course_id: str):
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")

    course = await db["courses"].find_one({"_id": oid(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Không tìm thấy khóa học")

    enrollment = await db["enrollments"].find_one(
        {
            "user_id": user_id,
            "course_id": course_id,
            "payment_id": {"$exists": True},
        }
    )
    if not enrollment:
        raise HTTPException(status_code=403, detail="Bạn chưa mua khóa học này")

    lessons = await db["lessons"].find({"course_id": course_id}).to_list(length=500)
    lesson_ids = [str(lesson["_id"]) for lesson in lessons]
    total_lessons = len(lesson_ids)
    completed_lessons = 0
    completed_lesson_ids = []

    if lesson_ids:
        progress_docs = (
            await db["progress"]
            .find(
                {
                    "user_id": user_id,
                    "course_id": course_id,
                    "lesson_id": {"$in": lesson_ids},
                    "completed": True,
                }
            )
            .to_list(length=500)
        )
        completed_lesson_ids = [doc["lesson_id"] for doc in progress_docs]
        completed_lessons = len(set(completed_lesson_ids))

    percent = round(completed_lessons * 100 / total_lessons) if total_lessons else 0
    return {
        "course": course,
        "course_id": course_id,
        "totalLessons": total_lessons,
        "completedLessons": completed_lessons,
        "completedLessonIds": completed_lesson_ids,
        "progress": percent,
        "isCompleted": percent == 100 and total_lessons > 0,
    }


@router.post("/api/progress")
async def save_progress(
    payload: ProgressUpdate,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    if not ObjectId.is_valid(payload.course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")
    if not ObjectId.is_valid(payload.lesson_id):
        raise HTTPException(status_code=400, detail="lesson_id không hợp lệ")

    enrollment = await db["enrollments"].find_one(
        {
            "user_id": user["_id"],
            "course_id": payload.course_id,
            "payment_id": {"$exists": True},
        }
    )
    if not enrollment:
        raise HTTPException(status_code=403, detail="Bạn chưa mua khóa học này")

    lesson = await db["lessons"].find_one(
        {"_id": oid(payload.lesson_id), "course_id": payload.course_id}
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")

    doc = {
        "user_id": user["_id"],
        "lesson_id": payload.lesson_id,
        "course_id": payload.course_id,
        "completed": payload.completed,
        "completed_at": payload.completed_at or datetime.now(timezone.utc).isoformat(),
    }
    await db["progress"].update_one(
        {"user_id": doc["user_id"], "lesson_id": doc["lesson_id"]},
        {"$set": doc},
        upsert=True,
    )

    result = dict(doc)
    if payload.completed:
        progress = await _get_course_progress(db, user["_id"], payload.course_id)
        if progress["isCompleted"]:
            certificate = await _ensure_certificate(db, user, progress)
            result["certificate"] = {
                "course_id": certificate["course_id"],
                "filename": certificate["filename"],
                "issued_at": certificate["issued_at"],
                "ready": True,
            }
    return result


@router.get("/api/progress/{course_id}")
async def get_progress(course_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    progress = await _get_course_progress(db, user["_id"], course_id)
    progress.pop("course", None)
    return progress


@router.get("/api/certificate/{course_id}")
async def download_certificate(course_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    progress = await _get_course_progress(db, user["_id"], course_id)
    if not progress["isCompleted"]:
        raise HTTPException(status_code=403, detail="Cần hoàn thành 100% khóa học để tải chứng chỉ")

    certificate = await _ensure_certificate(db, user, progress)
    pdf = bytes(certificate["pdf"])
    filename = certificate.get("filename") or f"certificate-{course_id}.pdf"
    return Response(
        content=pdf,
        media_type=certificate.get("content_type") or "application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
