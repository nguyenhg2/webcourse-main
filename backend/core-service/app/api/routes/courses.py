from fastapi import APIRouter, Depends, HTTPException, status
from app.models.common import Level
from app.core.deps import require_role
from app.db.mongo import get_db, serialize_doc, serialize_docs
from app.models.courses import CourseCreate, CourseResponse
from typing import List, Optional
from bson import ObjectId

router = APIRouter()

@router.get("/api/courses", response_model=List[CourseResponse])
async def get_courses(category_id: Optional[str] = None, level: Optional[Level] = None, db=Depends(get_db)):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if level:
        query["level"] = level
    courses = await db["courses"].find(query).to_list(length=100)
    return serialize_docs(courses)

@router.get("/api/courses/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str, db=Depends(get_db)):
    course = await db["courses"].find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy khóa học")
    return serialize_doc(course)

@router.post("/api/courses", response_model=CourseResponse)
async def create_course(payload: CourseCreate, db=Depends(get_db),user=Depends(require_role("admin"))):
    new_course = payload.model_dump()
    result = await db["courses"].insert_one(new_course)
    new_course = await db["courses"].find_one({"_id": result.inserted_id})
    return serialize_doc(new_course)

@router.put("/api/courses/{course_id}", response_model=CourseResponse)
async def update_course(course_id: str, payload: CourseCreate, db=Depends(get_db),user=Depends(require_role("admin"))):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu nào được cung cấp để cập nhật")
    result = await db["courses"].update_one({"_id": ObjectId(course_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy khóa học")
    updated_course = await db["courses"].find_one({"_id": ObjectId(course_id)})
    return serialize_doc(updated_course)

@router.delete("/api/courses/{course_id}")
async def delete_course(course_id: str, db=Depends(get_db),user=Depends(require_role("admin"))):
    result = await db["courses"].delete_one({"_id": ObjectId(course_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy khóa học")
    return {"detail": "Khóa học đã được xóa"}