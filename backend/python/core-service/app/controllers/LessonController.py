from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.config import settings
from app.core.deps import get_current_user, get_optional_user, require_role
from app.db.mongo import get_db, oid, serialize_doc, serialize_docs
from app.models.lesson_interactions import LessonCommentCreate, LessonNoteCreate
from app.models.lessons import Lesson, UpdateLesson
from app.services.cloudinary_urls import PlaybackSigningError, signed_video_playback

router = APIRouter()

SECURE_VIDEO_DELIVERY_TYPES = {"authenticated", "private"}


def _clean_optional_text(value):
    if value is None:
        return None
    return str(value).strip()


def _normalize_video_security(payload: dict, existing: dict | None = None) -> dict:
    if "video_public_id" in payload:
        payload["video_public_id"] = _clean_optional_text(payload.get("video_public_id")) or ""
    if "video_url" in payload:
        payload["video_url"] = _clean_optional_text(payload.get("video_url")) or ""
    if "video_delivery_type" in payload:
        payload["video_delivery_type"] = _clean_optional_text(payload.get("video_delivery_type")) or ""

    effective_public_id = payload.get("video_public_id")
    if effective_public_id is None and existing:
        effective_public_id = existing.get("video_public_id")

    effective_video_url = payload.get("video_url")
    if effective_video_url is None and existing:
        effective_video_url = existing.get("video_url")

    effective_delivery_type = payload.get("video_delivery_type")
    if effective_delivery_type is None and existing:
        effective_delivery_type = existing.get("video_delivery_type")

    if effective_public_id:
        delivery_type = effective_delivery_type or "authenticated"
        if delivery_type not in SECURE_VIDEO_DELIVERY_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Video phai dung delivery type authenticated hoac private",
            )
        payload["video_delivery_type"] = delivery_type
        return payload

    if effective_video_url and not settings.allow_legacy_public_video_urls:
        raise HTTPException(
            status_code=400,
            detail="Khong cho phep luu URL video public. Hay upload video qua media-service de tao video_public_id.",
        )

    return payload


async def _lesson_playback_response(lesson: dict, response: Response | None = None) -> dict:
    doc = serialize_doc(lesson)
    doc["has_video"] = bool(lesson.get("video_public_id") or lesson.get("video_url"))
    doc.pop("video_url", None)

    try:
        playback = await signed_video_playback(lesson)
    except PlaybackSigningError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    doc["signed_url"] = playback.url if playback else None
    doc["signed_url_expires_at"] = playback.expires_at if playback else None
    doc["playback_delivery"] = playback.delivery if playback else None

    if response and playback and playback.expires_at:
        now = int(datetime.now(timezone.utc).timestamp())
        max_age = max(min(playback.expires_at - now - 60, 60), 0)
        response.headers["Cache-Control"] = f"private, max-age={max_age}"

    return doc


async def _ensure_can_manage_course(db, course_id: str, user: dict):
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="course_id khong hop le")
    course = await db["courses"].find_one({"_id": oid(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Khong tim thay khoa hoc")
    if user.get("role") != "admin" and course.get("instructor_id") != user["_id"]:
        raise HTTPException(status_code=403, detail="Khong du quyen thuc hien")
    return course


async def _get_lesson_or_404(db, lesson_id: str):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="lesson_id khong hop le")

    lesson = await db["lessons"].find_one({"_id": oid(lesson_id)})
    if not lesson:
        raise HTTPException(status_code=404, detail="Khong tim thay bai hoc")
    return lesson


async def _ensure_can_access_lesson_comments(db, lesson: dict, user: dict):
    course_id = lesson.get("course_id")
    course = None
    if ObjectId.is_valid(course_id or ""):
        course = await db["courses"].find_one({"_id": oid(course_id)})

    if not course:
        raise HTTPException(status_code=404, detail="Khong tim thay khoa hoc")

    if user.get("role") == "admin" or course.get("instructor_id") == user["_id"]:
        return course

    enrollment = await db["enrollments"].find_one({
        "user_id": user["_id"],
        "course_id": course_id,
        "payment_id": {"$exists": True},
    })
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ban can mua khoa hoc nay de xem va gui binh luan",
        )
    return course


@router.post("/api/sections/{section_id}/lessons")
async def create_lesson(
    section_id: str,
    lesson: Lesson,
    db=Depends(get_db),
    user=Depends(require_role("admin", "instructor")),
):
    if not ObjectId.is_valid(section_id):
        raise HTTPException(status_code=400, detail="section_id khong hop le")
    section = await db["sections"].find_one({"_id": oid(section_id)})
    if not section:
        raise HTTPException(status_code=404, detail="Khong tim thay phan hoc")
    if section["course_id"] != lesson.course_id:
        raise HTTPException(status_code=400, detail="course_id khong khop voi phan hoc")
    await _ensure_can_manage_course(db, lesson.course_id, user)

    lesson_data = _normalize_video_security(lesson.model_dump())
    lesson_data["section_id"] = section_id
    result = await db["lessons"].insert_one(lesson_data)
    new_lesson = await db["lessons"].find_one({"_id": result.inserted_id})
    return serialize_doc(new_lesson)


@router.put("/api/lessons/{lesson_id}")
async def update_lesson(
    lesson_id: str,
    lesson: UpdateLesson,
    db=Depends(get_db),
    user=Depends(require_role("admin", "instructor")),
):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="lesson_id khong hop le")
    existing = await db["lessons"].find_one({"_id": oid(lesson_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Khong tim thay bai hoc")
    await _ensure_can_manage_course(db, existing["course_id"], user)

    lesson_data = _normalize_video_security(lesson.model_dump(exclude_unset=True), existing)
    result = await db["lessons"].update_one({"_id": oid(lesson_id)}, {"$set": lesson_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Khong tim thay bai hoc")
    updated_lesson = await db["lessons"].find_one({"_id": oid(lesson_id)})
    return serialize_doc(updated_lesson)


@router.delete("/api/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="lesson_id khong hop le")
    existing = await db["lessons"].find_one({"_id": oid(lesson_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Khong tim thay bai hoc")
    await _ensure_can_manage_course(db, existing["course_id"], user)

    result = await db["lessons"].delete_one({"_id": oid(lesson_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Khong tim thay bai hoc")
    return {"message": "Da xoa bai hoc"}


@router.get("/api/lessons/{lesson_id}")
async def get_lesson_content(
    lesson_id: str,
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_optional_user),
):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="lesson_id khong hop le")

    lesson = await db["lessons"].find_one({"_id": oid(lesson_id)})
    if not lesson:
        raise HTTPException(status_code=404, detail="Khong tim thay bai hoc")

    if lesson.get("is_free_preview"):
        return await _lesson_playback_response(lesson, response)

    if not current_user:
        raise HTTPException(status_code=401, detail="Ban can dang nhap de xem bai hoc nay")

    course = None
    if ObjectId.is_valid(str(lesson.get("course_id", ""))):
        course = await db["courses"].find_one({"_id": oid(lesson["course_id"])})
    if current_user.get("role") == "admin" or (course and course.get("instructor_id") == current_user["_id"]):
        return await _lesson_playback_response(lesson, response)

    enrollment = await db["enrollments"].find_one({
        "user_id": current_user["_id"],
        "course_id": lesson["course_id"],
        "payment_id": {"$exists": True},
    })
    if not enrollment:
        raise HTTPException(status_code=403, detail="Ban can mua khoa hoc nay de xem noi dung")

    return await _lesson_playback_response(lesson, response)


@router.get("/api/lessons/{lesson_id}/comments")
async def get_lesson_comments(lesson_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    lesson = await _get_lesson_or_404(db, lesson_id)
    await _ensure_can_access_lesson_comments(db, lesson, user)

    comments = (
        await db["lesson_comments"]
        .find({"lesson_id": lesson_id})
        .sort("created_at", -1)
        .to_list(length=200)
    )
    return serialize_docs(comments)


@router.post("/api/lessons/{lesson_id}/comments")
async def create_lesson_comment(
    lesson_id: str,
    payload: LessonCommentCreate,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    lesson = await _get_lesson_or_404(db, lesson_id)
    await _ensure_can_access_lesson_comments(db, lesson, user)

    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Noi dung binh luan khong duoc de trong")

    comment_doc = {
        "lesson_id": lesson_id,
        "course_id": lesson["course_id"],
        "user_id": user["_id"],
        "user_name": user.get("name") or user.get("email") or "Nguoi dung",
        "user_role": user.get("role"),
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db["lesson_comments"].insert_one(comment_doc)
    comment = await db["lesson_comments"].find_one({"_id": result.inserted_id})
    return serialize_doc(comment)


@router.get("/api/lessons/{lesson_id}/notes")
async def get_lesson_notes(lesson_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    lesson = await _get_lesson_or_404(db, lesson_id)
    await _ensure_can_access_lesson_comments(db, lesson, user)

    notes = (
        await db["lesson_notes"]
        .find({"lesson_id": lesson_id, "user_id": user["_id"]})
        .sort("timestamp", 1)
        .to_list(length=200)
    )
    return serialize_docs(notes)


@router.post("/api/lessons/{lesson_id}/notes")
async def create_lesson_note(
    lesson_id: str,
    payload: LessonNoteCreate,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    lesson = await _get_lesson_or_404(db, lesson_id)
    await _ensure_can_access_lesson_comments(db, lesson, user)

    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Noi dung ghi chu khong duoc de trong")

    note_doc = {
        "lesson_id": lesson_id,
        "course_id": lesson["course_id"],
        "user_id": user["_id"],
        "content": content,
        "timestamp": max(int(payload.timestamp or 0), 0),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db["lesson_notes"].insert_one(note_doc)
    note = await db["lesson_notes"].find_one({"_id": result.inserted_id})
    return serialize_doc(note)


@router.delete("/api/lesson-notes/{note_id}")
async def delete_lesson_note(note_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(status_code=400, detail="note_id khong hop le")

    note = await db["lesson_notes"].find_one({"_id": oid(note_id)})
    if not note:
        raise HTTPException(status_code=404, detail="Khong tim thay ghi chu")
    if note.get("user_id") != user["_id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Khong du quyen thuc hien")

    await db["lesson_notes"].delete_one({"_id": oid(note_id)})
    return {"message": "Da xoa ghi chu"}
