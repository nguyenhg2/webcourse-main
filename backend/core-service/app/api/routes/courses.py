from fastapi import APIRouter, Depends, HTTPException, status
from app.models.common import Level
from app.core.deps import get_optional_user, require_role
from app.db.mongo import get_db, serialize_doc, serialize_docs
from app.models.courses import CourseCreate, CourseResponse
from typing import List, Optional
from bson import ObjectId
import re
import unicodedata

router = APIRouter()


def _can_view_unpublished(course: dict, user: dict | None) -> bool:
    if not user:
        return False
    if user.get("role") in {"admin", "operator"}:
        return True
    return user.get("role") == "instructor" and course.get("instructor_id") == user["_id"]


def _course_list_query(user: dict | None, review_status: Optional[str] = None, manage: bool = False) -> dict:
    if review_status:
        if not user or user.get("role") not in {"admin", "operator"}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không đủ quyền thực hiện")
        return {"status": review_status}
    if not manage:
        return {"status": "published"}
    if not user or user.get("role") == "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không đủ quyền thực hiện")
    if user.get("role") in {"admin", "operator"}:
        return {}
    if user.get("role") == "instructor":
        return {"$or": [{"status": "published"}, {"instructor_id": user["_id"]}]}
    return {"status": "published"}


def _normalize_course_status(payload: dict, user: dict, existing: dict | None = None) -> dict:
    if user.get("role") != "instructor":
        return payload
    current_status = (existing or {}).get("status")
    requested_status = payload.get("status")

    if not existing:
        payload["status"] = "draft"
    elif requested_status == "draft" or current_status == "rejected":
        payload["status"] = "draft"
    else:
        payload["status"] = current_status or "draft"
    return payload


def _ensure_course_owner(course: dict | None, user: dict):
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khóa học",
        )
    if user.get("role") != "admin" and course.get("instructor_id") != user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không đủ quyền thực hiện")

def _cloudinary_folder_for_course(payload: dict) -> str:
    slug = str(payload.get("slug") or payload.get("title") or "course").strip()
    slug = unicodedata.normalize("NFD", slug).encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9-]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-") or "course"
    return f"codecamp/courses/{slug}"


@router.get("/api/courses", response_model=List[CourseResponse])
async def get_courses(
    category_id: Optional[str] = None,
    level: Optional[Level] = None,
    review_status: Optional[str] = None,
    manage: bool = False,
    db=Depends(get_db),
    user=Depends(get_optional_user),
):
    query = _course_list_query(user, review_status, manage)
    if category_id:
        query["category_id"] = category_id
    if level:
        query["level"] = level
    courses = await db["courses"].find(query).to_list(length=100)
    return serialize_docs(courses)


@router.get("/api/courses/slug/{slug}")
async def get_course_by_slug(slug: str, db=Depends(get_db), user=Depends(get_optional_user)):
    course = await db["courses"].find_one({"slug": slug})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khóa học",
        )
    if course.get("status") != "published" and not _can_view_unpublished(course, user):
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
async def get_course(course_id: str, db=Depends(get_db), user=Depends(get_optional_user)):
    course = await db["courses"].find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khóa học",
        )
    if course.get("status") != "published" and not _can_view_unpublished(course, user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy khóa học")
    return serialize_doc(course)


@router.post("/api/courses", response_model=CourseResponse)
async def create_course(
    payload: CourseCreate,
    db=Depends(get_db),
    user=Depends(require_role("admin", "instructor")),
):
    new_course = payload.model_dump()
    if not new_course.get("cloudinary_folder"):
        new_course["cloudinary_folder"] = _cloudinary_folder_for_course(new_course)
    if user.get("role") == "instructor":
        new_course["instructor_id"] = user["_id"]
    new_course = _normalize_course_status(new_course, user)
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
    update_data = _normalize_course_status(update_data, user, existing)
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


@router.patch("/api/courses/{course_id}/review", response_model=CourseResponse)
async def review_course(
    course_id: str,
    payload: dict,
    db=Depends(get_db),
    user=Depends(require_role("operator", "admin")),
):
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")

    existing = await db["courses"].find_one({"_id": ObjectId(course_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Không tìm thấy khóa học")

    decision = payload.get("status")
    if decision not in {"published", "rejected"}:
        raise HTTPException(status_code=400, detail="Trạng thái duyệt không hợp lệ")

    update_data = {
        "status": decision,
        "review_note": str(payload.get("review_note") or "").strip(),
        "reviewed_by": user["_id"],
    }
    await db["courses"].update_one({"_id": ObjectId(course_id)}, {"$set": update_data})
    updated_course = await db["courses"].find_one({"_id": ObjectId(course_id)})
    return serialize_doc(updated_course)


@router.patch("/api/courses/{course_id}/submit", response_model=CourseResponse)
async def submit_course_for_review(
    course_id: str,
    db=Depends(get_db),
    user=Depends(require_role("instructor")),
):
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")

    course = await db["courses"].find_one({"_id": ObjectId(course_id)})
    _ensure_course_owner(course, user)

    if course.get("status") not in {"draft", "rejected"}:
        raise HTTPException(status_code=400, detail="Chỉ có thể gửi duyệt khóa học nháp hoặc cần sửa")

    sections = await db["sections"].find({"course_id": course_id}).to_list(length=100)
    if not sections:
        raise HTTPException(status_code=400, detail="Cần thêm ít nhất một phần trước khi gửi duyệt")

    section_ids = [str(section["_id"]) for section in sections]
    lesson_counts = await db["lessons"].aggregate([
        {"$match": {"section_id": {"$in": section_ids}}},
        {"$group": {"_id": "$section_id", "count": {"$sum": 1}}},
    ]).to_list(length=100)
    counts_by_section = {item["_id"]: item["count"] for item in lesson_counts}
    empty_sections = [section for section in sections if counts_by_section.get(str(section["_id"]), 0) == 0]
    if empty_sections:
        raise HTTPException(status_code=400, detail="Mỗi phần cần có ít nhất một bài học trước khi gửi duyệt")

    await db["courses"].update_one(
        {"_id": ObjectId(course_id)},
        {"$set": {"status": "pending_review", "submitted_by": user["_id"]}},
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
