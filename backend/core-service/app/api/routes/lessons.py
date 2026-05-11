from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.models.lessons import Lesson, UpdateLesson
from app.db.mongo import get_db, oid, serialize_doc
from app.core.deps import get_optional_user, require_role

router = APIRouter()


@router.post("/api/sections/{section_id}/lessons")
async def create_lesson(section_id: str, lesson: Lesson, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    lesson_data = lesson.model_dump()
    lesson_data["section_id"] = section_id
    result = await db["lessons"].insert_one(lesson_data)
    new_lesson = await db["lessons"].find_one({"_id": result.inserted_id})
    return serialize_doc(new_lesson)


@router.put("/api/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, lesson: UpdateLesson, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="ID bài học không hợp lệ")
    lesson_data = lesson.model_dump(exclude_unset=True)
    result = await db["lessons"].update_one({"_id": oid(lesson_id)}, {"$set": lesson_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    updated_lesson = await db["lessons"].find_one({"_id": oid(lesson_id)})
    return serialize_doc(updated_lesson)


@router.delete("/api/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="ID bài học không hợp lệ")
    result = await db["lessons"].delete_one({"_id": oid(lesson_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    return {"message": "Đã xóa bài học"}


@router.get("/api/lessons/{lesson_id}")
async def get_lesson_content(lesson_id: str, db=Depends(get_db), current_user=Depends(get_optional_user)):
    if not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="ID bài học không hợp lệ")

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
