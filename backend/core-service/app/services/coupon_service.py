from datetime import datetime, timezone

from bson import ObjectId

from app.core.config import settings
from app.db.mongo import serialize_doc

TYPE_PERCENTAGE = "percentage"
TYPE_FIXED = "fixed"


def coupons(db):
    return db.client[settings.payment_db]["coupons"]


def normalize_code(code: str | None) -> str:
    return str(code or "").strip().upper()


def now_ts() -> int:
    return int(datetime.now(timezone.utc).timestamp())


def serialize_coupon(coupon: dict) -> dict:
    item = serialize_doc(coupon)
    item["id"] = item.pop("_id")
    return item


def coupon_id(value: str) -> ObjectId:
    return ObjectId(value)
