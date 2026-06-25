from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from app.models.cart import CartItemRequest

from app.core.deps import require_role
from app.db.mongo import get_db, oid, serialize_doc

router = APIRouter()

@router.get("/api/cart")
async def get_cart(db=Depends(get_db), user=Depends(require_role("student"))):
    cart = await db["carts"].find_one({"user_id": user["_id"]})
    if not cart:
        return {"items": []}

    course_ids = [course_id for course_id in cart.get("items", []) if ObjectId.is_valid(course_id)]
    if not course_ids:
        return {"items": []}

    course_filter = {
        "_id": {"$in": [oid(course_id) for course_id in course_ids]},
        "status": "published",
    }
    courses = await db["courses"].find(course_filter).to_list(length=len(course_ids))
    course_by_id = {str(course["_id"]): serialize_doc(course) for course in courses}
    items = [course_by_id[course_id] for course_id in course_ids if course_id in course_by_id]
    return {"items": items}


@router.post("/api/cart")
async def add_cart(
    payload: CartItemRequest,
    db=Depends(get_db),
    user=Depends(require_role("student")),
):
    if not ObjectId.is_valid(payload.course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")

    course = await db["courses"].find_one({"_id": oid(payload.course_id), "status": "published"})
    if not course:
        raise HTTPException(status_code=404, detail="Không tìm thấy khóa học")

    enrollment = await db["enrollments"].find_one(
        {
            "user_id": user["_id"],
            "course_id": payload.course_id,
            "payment_id": {"$exists": True},
        }
    )
    if enrollment:
        raise HTTPException(status_code=400, detail="Bạn đã sở hữu khóa học này")

    existing_cart = await db["carts"].find_one(
        {"user_id": user["_id"], "items": payload.course_id}
    )
    if existing_cart:
        raise HTTPException(status_code=400, detail="Khóa học đã có trong giỏ hàng")

    await db["carts"].update_one(
        {"user_id": user["_id"]},
        {"$addToSet": {"items": payload.course_id}},
        upsert=True,
    )
    return {"message": "Đã thêm vào giỏ hàng"}


@router.delete("/api/cart/{course_id}")
async def remove_cart(course_id: str, db=Depends(get_db), user=Depends(require_role("student"))):
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")

    result = await db["carts"].update_one(
        {"user_id": user["_id"]},
        {"$pull": {"items": course_id}},
    )
    if result.matched_count == 0:
        return {"message": "Giỏ hàng đang trống"}

    return {"message": "Đã xóa khỏi giỏ hàng"}
