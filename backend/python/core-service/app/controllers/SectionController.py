from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.core.deps import require_role
from app.models.sections import Section, UpdateSection
from app.db.mongo import get_db, oid, serialize_doc

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


@router.post("/api/courses/{course_id}/sections")
async def create_section(course_id: str, payload: Section, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    await _ensure_can_manage_course(db, course_id, user)
    new_section = {
        "course_id": course_id,
        "title": payload.title,
        "order": payload.order
    }
    result = await db["sections"].insert_one(new_section)
    new_section = await db["sections"].find_one({"_id": result.inserted_id})
    return serialize_doc(new_section)

@router.put("/api/sections/{section_id}")
async def update_section(section_id: str, payload: UpdateSection, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    if not ObjectId.is_valid(section_id):
        raise HTTPException(status_code=400, detail="section_id không hợp lệ")
    section = await db["sections"].find_one({"_id": oid(section_id)})
    if not section:
        raise HTTPException(status_code=404, detail="Không tìm thấy phần học")
    await _ensure_can_manage_course(db, section["course_id"], user)
    result = await db["sections"].update_one(
        {"_id": oid(section_id)},
        {"$set": {
            "title": payload.title,
            "order": payload.order
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy section")
    updated_section = await db["sections"].find_one({"_id": oid(section_id)})
    return serialize_doc(updated_section)

@router.delete("/api/sections/{section_id}")
async def delete_section(section_id: str, db=Depends(get_db), user=Depends(require_role("admin", "instructor"))):
    if not ObjectId.is_valid(section_id):
        raise HTTPException(status_code=400, detail="section_id không hợp lệ")
    section = await db["sections"].find_one({"_id": oid(section_id)})
    if not section:
        raise HTTPException(status_code=404, detail="Không tìm thấy phần học")
    await _ensure_can_manage_course(db, section["course_id"], user)
    result = await db["sections"].delete_one({"_id": oid(section_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy phần học")
    return {"message": "Phần học đã được xóa"}
