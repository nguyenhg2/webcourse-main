from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.deps import require_role
from app.db.mongo import get_db, oid
from app.models.checkout import CheckoutRequest
from app.services import payment_client

router = APIRouter()


@router.post("/api/checkout/pay")
async def create_payment(
    payload: CheckoutRequest,
    request: Request,
    db=Depends(get_db),
    user=Depends(require_role("student")),
):
    course_ids, amount = await checkout_total(db, user["_id"], payload.course_ids)
    payment_payload = {
        "course_ids": course_ids,
        "amount": amount,
        "coupon_code": payload.coupon_code,
        "user_email": user.get("email"),
        "card_last4": payload.card_last4,
        "card_brand": payload.card_brand,
        "billing_address": payload.billing_address or {},
    }

    return await payment_client.create_payment(payment_payload, request)


@router.post("/api/checkout/payments/{payment_id}/sync")
async def sync_payment(
    payment_id: str,
    request: Request,
    user=Depends(require_role("student")),
):
    if not ObjectId.is_valid(payment_id):
        raise HTTPException(status_code=400, detail="payment_id không hợp lệ")
    return await payment_client.sync_payment(payment_id, request)


async def checkout_total(db, user_id: str, raw_course_ids: list[str]) -> tuple[list[str], int]:
    course_ids = parse_course_ids(raw_course_ids)
    await ensure_not_owned(db, user_id, course_ids)

    courses = await db["courses"].find(
        {"_id": {"$in": [oid(course_id) for course_id in course_ids]}, "status": "published"}
    ).to_list(length=len(course_ids))
    prices = {str(course["_id"]): int(float(course.get("price", 0) or 0)) for course in courses}
    if len(prices) != len(course_ids):
        raise HTTPException(status_code=400, detail="Không tìm thấy khóa học hoặc khóa học chưa được xuất bản")
    return course_ids, sum(prices[course_id] for course_id in course_ids)


def parse_course_ids(course_ids: list[str]) -> list[str]:
    ids = []
    for course_id in course_ids:
        course_id = str(course_id or "").strip()
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="course_id không hợp lệ")
        if course_id not in ids:
            ids.append(course_id)
    if not ids:
        raise HTTPException(status_code=400, detail="Vui lòng chọn khóa học cần thanh toán")
    return ids


async def ensure_not_owned(db, user_id: str, course_ids: list[str]):
    owned = await db["enrollments"].find_one(
        {"user_id": user_id, "course_id": {"$in": course_ids}, "payment_id": {"$exists": True}}
    )
    if owned:
        raise HTTPException(status_code=400, detail="Bạn đã sở hữu một khóa học trong đơn hàng")
