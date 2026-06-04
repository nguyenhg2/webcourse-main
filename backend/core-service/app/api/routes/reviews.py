from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_current_user, require_role
from app.db.mongo import get_db, oid, serialize_doc, serialize_docs
from app.models.reviews import ReviewCreate

router = APIRouter()

@router.get("/api/courses/{course_id}/reviews")
async def get_course_reviews(course_id: str, db=Depends(get_db)):
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")

    course = await db["courses"].find_one({"_id": oid(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Không tìm thấy khóa học")

    reviews = (
        await db["reviews"]
        .find({"course_id": course_id})
        .sort("created_at", -1)
        .to_list(length=100)
    )
    return serialize_docs(reviews)


@router.post("/api/reviews")
async def create_review(
    payload: ReviewCreate,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    if not ObjectId.is_valid(payload.course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")

    course = await db["courses"].find_one({"_id": oid(payload.course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Không tìm thấy khóa học")

    enrollment = await db["enrollments"].find_one(
        {
            "user_id": user["_id"],
            "course_id": payload.course_id,
            "payment_id": {"$exists": True},
        }
    )
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn cần mua khóa học này trước khi đánh giá",
        )

    existing_review = await db["reviews"].find_one(
        {"user_id": user["_id"], "course_id": payload.course_id}
    )
    if existing_review:
        raise HTTPException(status_code=400, detail="Bạn đã đánh giá khóa học này")

    review_doc = payload.model_dump()
    comment = review_doc["comment"].strip()
    if not comment:
        raise HTTPException(status_code=400, detail="Nội dung nhận xét không được để trống")

    review_doc["user_id"] = user["_id"]
    review_doc["user_name"] = user.get("name")
    review_doc["comment"] = comment
    review_doc["created_at"] = datetime.now(timezone.utc).isoformat()

    result = await db["reviews"].insert_one(review_doc)
    review = await db["reviews"].find_one({"_id": result.inserted_id})
    return serialize_doc(review)


@router.delete("/api/reviews/{review_id}")
async def delete_review(
    review_id: str,
    db=Depends(get_db),
    user=Depends(require_role("admin")),
):
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="review_id không hợp lệ")

    result = await db["reviews"].delete_one({"_id": oid(review_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")

    return {"message": "Đã xóa đánh giá"}
