from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import require_role
from app.models.sections import Section, UpdateSection
from app.db.mongo import get_db, serialize_doc

router=APIRouter()

@router.post("/api/courses/{course_id}/sections")
async def create_section(course_id: str, payload: Section, db=Depends(get_db),user=Depends(require_role("admin"))):
    new_section = {
        "course_id": course_id,
        "title": payload.title,
        "order": payload.order
    }
    result = await db["sections"].insert_one(new_section)
    new_section = await db["sections"].find_one({"_id": result.inserted_id})
    return serialize_doc(new_section)

@router.put("/api/sections/{section_id}")
async def update_section(section_id: str, payload: UpdateSection, db=Depends(get_db), user=Depends(require_role("admin"))):
    result = await db["sections"].update_one(
        {"_id": section_id},
        {"$set": {
            "title": payload.title,
            "order": payload.order
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy section")
    updated_section = await db["sections"].find_one({"_id": section_id})
    return serialize_doc(updated_section)

@router.delete("/api/sections/{section_id}")
async def delete_section(section_id: str, db=Depends(get_db), user=Depends(require_role("admin"))):
    result = await db["sections"].delete_one({"_id": section_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy section")
    return {"message": "Section đã được xóa"}