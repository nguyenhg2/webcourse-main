from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_role
from app.db.mongo import get_db
from app.services.coupon_service import (
    TYPE_FIXED,
    TYPE_PERCENTAGE,
    coupon_id,
    coupons,
    normalize_code,
    now_ts,
    serialize_coupon,
)

router = APIRouter()

@router.get("/api/coupons")
async def list_coupons(db=Depends(get_db), user=Depends(require_role("admin"))):
    items = await coupons(db).find({}).sort([("active", -1), ("code", 1)]).to_list(length=500)
    return {"coupons": [serialize_coupon(item) for item in items]}


@router.post("/api/coupons")
async def create_coupon(payload: dict, db=Depends(get_db), user=Depends(require_role("admin"))):
    coupon = normalize_coupon(payload)
    if await coupons(db).count_documents({"code": coupon["code"]}):
        raise HTTPException(status_code=400, detail="Mã giảm giá đã tồn tại")

    result = await coupons(db).insert_one(coupon)
    coupon["_id"] = result.inserted_id
    return serialize_coupon(coupon)


@router.patch("/api/coupons/{coupon_id_value}/active")
async def set_coupon_active(
    coupon_id_value: str,
    payload: dict,
    db=Depends(get_db),
    user=Depends(require_role("admin")),
):
    await coupons(db).update_one(
        {"_id": coupon_id(coupon_id_value)},
        {"$set": {"active": bool(payload.get("active"))}},
    )
    coupon = await coupons(db).find_one({"_id": coupon_id(coupon_id_value)})
    if not coupon:
        raise HTTPException(status_code=404, detail="Không tìm thấy mã giảm giá")
    return serialize_coupon(coupon)


def normalize_coupon(payload: dict) -> dict:
    code = normalize_code(payload.get("code"))
    coupon_type = str(payload.get("type") or "")
    discount = int(payload.get("discount", 0) or 0)

    if not code:
        raise HTTPException(status_code=400, detail="Vui lòng nhập mã giảm giá")
    if coupon_type not in {TYPE_PERCENTAGE, TYPE_FIXED}:
        raise HTTPException(status_code=400, detail="Loại mã giảm giá phải là percentage hoặc fixed")
    if discount <= 0:
        raise HTTPException(status_code=400, detail="Giá trị giảm phải lớn hơn 0")
    if coupon_type == TYPE_PERCENTAGE and discount > 100:
        raise HTTPException(status_code=400, detail="Phần trăm giảm giá không được lớn hơn 100")

    return {
        "code": code,
        "type": coupon_type,
        "discount": discount,
        "max_uses": int(payload.get("max_uses", 0) or 0),
        "used": 0,
        "expiry": int(payload.get("expiry", 0) or 0) or now_ts() + 365 * 24 * 60 * 60,
        "active": bool(payload.get("active")),
    }
