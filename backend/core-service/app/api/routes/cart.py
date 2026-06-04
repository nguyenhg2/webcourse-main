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

    courses = []
    for course_id in cart.get("items", []):
        if not ObjectId.is_valid(course_id):
            continue

        course = await db["courses"].find_one({"_id": oid(course_id), "status": "published"})
        if course:
            courses.append(serialize_doc(course))
    return {"items": courses}


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
