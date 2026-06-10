from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.models.lessons import Lesson, LessonCommentCreate, UpdateLesson
from app.db.mongo import get_db, oid, serialize_doc, serialize_docs
from app.core.deps import get_current_user, get_optional_user, require_role

router = APIRouter()


async def _ensure_can_manage_course(db, course_id: str, user: dict):
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")
    course = await db["courses"].find_one({"_id": oid(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Không tìm thấy khóa học")
    if user.get("role") != "admin" and course.get("instructor_id") != user["_id"]:
        raise HTTPException(status_code=403, detail="Không đủ quyền thực hiện")
    return course


async def _get_lesson_or_404(db, lesson_id: str):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="lesson_id không hợp lệ")

    lesson = await db["lessons"].find_one({"_id": oid(lesson_id)})
    if not lesson:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    return lesson


async def _ensure_can_access_lesson_comments(db, lesson: dict, user: dict):
    course_id = lesson.get("course_id")
    course = None
    if ObjectId.is_valid(course_id or ""):
        course = await db["courses"].find_one({"_id": oid(course_id)})

    if not course:
        raise HTTPException(status_code=404, detail="Không tìm thấy khóa học")

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
            detail="Bạn cần mua khóa học này để xem và gửi bình luận",
        )
    return course


@router.post("/api/sections/{section_id}/lessons")
async def create_lesson(section_id: str, lesson: Lesson, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    if not ObjectId.is_valid(section_id):
        raise HTTPException(status_code=400, detail="section_id không hợp lệ")
    section = await db["sections"].find_one({"_id": oid(section_id)})
    if not section:
        raise HTTPException(status_code=404, detail="Không tìm thấy phần học")
    if section["course_id"] != lesson.course_id:
        raise HTTPException(status_code=400, detail="course_id không khớp với phần học")
    await _ensure_can_manage_course(db, lesson.course_id, user)

    lesson_data = lesson.model_dump()
    lesson_data["section_id"] = section_id
    result = await db["lessons"].insert_one(lesson_data)
    new_lesson = await db["lessons"].find_one({"_id": result.inserted_id})
    return serialize_doc(new_lesson)


@router.put("/api/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, lesson: UpdateLesson, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="lesson_id không hợp lệ")
    existing = await db["lessons"].find_one({"_id": oid(lesson_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    await _ensure_can_manage_course(db, existing["course_id"], user)

    lesson_data = lesson.model_dump(exclude_unset=True)
    result = await db["lessons"].update_one({"_id": oid(lesson_id)}, {"$set": lesson_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    updated_lesson = await db["lessons"].find_one({"_id": oid(lesson_id)})
    return serialize_doc(updated_lesson)


@router.delete("/api/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="lesson_id không hợp lệ")
    existing = await db["lessons"].find_one({"_id": oid(lesson_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    await _ensure_can_manage_course(db, existing["course_id"], user)

    result = await db["lessons"].delete_one({"_id": oid(lesson_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    return {"message": "Đã xóa bài học"}


@router.get("/api/lessons/{lesson_id}")
async def get_lesson_content(lesson_id: str, db=Depends(get_db), current_user=Depends(get_optional_user)):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="lesson_id không hợp lệ")

    lesson = await db["lessons"].find_one({"_id": oid(lesson_id)})
    if not lesson:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")

    if lesson.get("is_free_preview"):
        return serialize_doc(lesson)

    if not current_user:
        raise HTTPException(status_code=401, detail="Bạn cần đăng nhập để xem bài học này")

    enrollment = await db["enrollments"].find_one({
        "user_id": current_user["_id"],
        "course_id": lesson["course_id"],
        "payment_id": {"$exists": True},
    })
    if not enrollment:
        raise HTTPException(status_code=403, detail="Bạn cần mua khóa học này để xem nội dung")

    return serialize_doc(lesson)


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
        raise HTTPException(status_code=400, detail="Nội dung bình luận không được để trống")

    comment_doc = {
        "lesson_id": lesson_id,
        "course_id": lesson["course_id"],
        "user_id": user["_id"],
        "user_name": user.get("name") or user.get("email") or "Người dùng",
        "user_role": user.get("role"),
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db["lesson_comments"].insert_one(comment_doc)
    comment = await db["lesson_comments"].find_one({"_id": result.inserted_id})
    return serialize_doc(comment)
