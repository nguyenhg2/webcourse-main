from fastapi import APIRouter, Depends, HTTPException, status
from app.models.common import Level
from app.core.deps import require_role
from app.db.mongo import get_db, serialize_doc, serialize_docs
from app.models.courses import CourseCreate, CourseResponse
from typing import List, Optional
from bson import ObjectId

router = APIRouter()


def _ensure_course_owner(course: dict | None, user: dict):
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Khong tim thay khoa hoc",
        )
    if user.get("role") != "admin" and course.get("instructor_id") != user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")


@router.get("/api/courses", response_model=List[CourseResponse])
async def get_courses(
    category_id: Optional[str] = None,
    level: Optional[Level] = None,
    db=Depends(get_db),
):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if level:
        query["level"] = level
    courses = await db["courses"].find(query).to_list(length=100)
    return serialize_docs(courses)


@router.get("/api/courses/slug/{slug}")
async def get_course_by_slug(slug: str, db=Depends(get_db)):
    course = await db["courses"].find_one({"slug": slug})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khóa học",
        )
    course = serialize_doc(course)

    sections = (
        await db["sections"]
        .find({"course_id": course["_id"]})
        .sort("order", 1)
        .to_list(length=100)
    )
    sections = serialize_docs(sections)

    for section in sections:
        section_lessons = (
            await db["lessons"]
            .find({"section_id": section["_id"]})
            .sort("order", 1)
            .to_list(length=100)
        )
        section["lessons"] = serialize_docs(section_lessons)

    course["sections"] = sections
    return course


@router.get("/api/courses/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str, db=Depends(get_db)):
    course = await db["courses"].find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khóa học",
        )
    return serialize_doc(course)


@router.post("/api/courses", response_model=CourseResponse)
async def create_course(
    payload: CourseCreate,
    db=Depends(get_db),
    user=Depends(require_role("admin", "instructor")),
):
    new_course = payload.model_dump()
    if user.get("role") == "instructor":
        new_course["instructor_id"] = user["_id"]
    result = await db["courses"].insert_one(new_course)
    new_course = await db["courses"].find_one({"_id": result.inserted_id})
    return serialize_doc(new_course)


@router.put("/api/courses/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    payload: CourseCreate,
    db=Depends(get_db),
    user=Depends(require_role("admin", "instructor")),
):
    existing = await db["courses"].find_one({"_id": ObjectId(course_id)})
    _ensure_course_owner(existing, user)
    update_data = payload.model_dump(exclude_unset=True)
    if user.get("role") == "instructor":
        update_data["instructor_id"] = user["_id"]
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="Không có dữ liệu nào được cung cấp để cập nhật",
        )
    result = await db["courses"].update_one(
        {"_id": ObjectId(course_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khóa học",
        )
    updated_course = await db["courses"].find_one({"_id": ObjectId(course_id)})
    return serialize_doc(updated_course)


@router.delete("/api/courses/{course_id}")
async def delete_course(
    course_id: str,
    db=Depends(get_db),
    user=Depends(require_role("admin", "instructor")),
):
    existing = await db["courses"].find_one({"_id": ObjectId(course_id)})
    _ensure_course_owner(existing, user)
    result = await db["courses"].delete_one({"_id": ObjectId(course_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khóa học",
        )
    return {"detail": "Khóa học đã được xóa"}
