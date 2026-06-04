from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from app.core.deps import get_current_user
from app.db.mongo import get_db, oid
from app.models.progress import ProgressUpdate

router = APIRouter()


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_certificate_pdf(student_name: str, course_title: str) -> bytes:
    issued_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lines = [
        "CERTIFICATE OF COMPLETION",
        f"This certifies that {student_name}",
        "has successfully completed",
        course_title,
        f"Issued on {issued_at}",
    ]
    y_positions = [720, 660, 625, 585, 535]
    font_sizes = [26, 16, 14, 20, 12]

    content_parts = ["BT", "/F1 12 Tf"]
    for text, y, size in zip(lines, y_positions, font_sizes):
        content_parts.append(f"/F1 {size} Tf")
        content_parts.append(f"72 {y} Td ({_pdf_escape(text)}) Tj")
        content_parts.append(f"-72 -{y} Td")
    content_parts.append("ET")
    stream = "\n".join(content_parts).encode("utf-8")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("ascii")
    )
    return bytes(pdf)


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
    return doc


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

    pdf = _build_certificate_pdf(
        student_name=user.get("name") or "Học viên",
        course_title=progress["course"].get("title") or "Khóa học",
    )
    filename = f"certificate-{course_id}.pdf"
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
