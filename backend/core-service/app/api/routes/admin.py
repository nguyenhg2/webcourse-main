from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from app.core.config import settings
from app.core.deps import require_role
from app.db.mongo import get_db, oid, serialize_doc
from app.models.admin import UserRoleUpdate

router = APIRouter()

def _sanitize_user(user: dict | None) -> dict | None:
    user = serialize_doc(user)
    if not user:
        return user
    user.pop("hashed_password", None)
    user.pop("passwordHash", None)
    return user


def _month_key(timestamp: int | float | None) -> str:
    if not timestamp:
        return "unknown"
    return datetime.fromtimestamp(timestamp, timezone.utc).strftime("%Y-%m")


def _payment_db(db):
    return db.client[settings.payment_db]


def _payment_revenue(payment: dict) -> int:
    amount = int(payment.get("amount", 0))
    discount = int(payment.get("coupon_discount", 0))
    return max(amount - discount, 0)


@router.get("/api/admin/dashboard")
async def admin_dashboard(db=Depends(get_db), user=Depends(require_role("admin"))):
    payment_db = _payment_db(db)
    completed_payments = await payment_db["payments"].find({"status": "completed"}).to_list(length=1000)

    revenue = sum(_payment_revenue(payment) for payment in completed_payments)
    students = await db["users"].count_documents({"role": "student"})
    courses = await db["courses"].count_documents({})
    enrollments = await db["enrollments"].count_documents({"payment_id": {"$exists": True}})
    users = await db["users"].count_documents({})
    orders = await payment_db["payments"].count_documents({})

    return {
        "revenue": revenue,
        "students": students,
        "courses": courses,
        "enrollments": enrollments,
        "users": users,
        "orders": orders,
        "completedOrders": len(completed_payments),
    }


@router.get("/api/admin/users")
async def admin_users(db=Depends(get_db), user=Depends(require_role("admin"))):
    users = await db["users"].find({}).sort("created_at", -1).to_list(length=500)
    return [_sanitize_user(item) for item in users]


@router.put("/api/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    db=Depends(get_db),
    user=Depends(require_role("admin")),
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="user_id khong hop le")

    target_user = await db["users"].find_one({"_id": oid(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="Khong tim thay nguoi dung")
    if target_user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Khong duoc doi vai tro cua admin")

    result = await db["users"].update_one(
        {"_id": oid(user_id)},
        {"$set": {"role": payload.role.value}},
    )

    updated_user = await db["users"].find_one({"_id": oid(user_id)})
    return _sanitize_user(updated_user)


@router.get("/api/admin/orders")
async def admin_orders(db=Depends(get_db), user=Depends(require_role("admin"))):
    payment_db = _payment_db(db)
    payments = await payment_db["payments"].find({}).sort("created_at", -1).to_list(length=500)

    orders = []
    for payment in payments:
        order = serialize_doc(payment)
        buyer = await db["users"].find_one({"_id": oid(order["user_id"])}) if ObjectId.is_valid(order.get("user_id", "")) else None
        courses = []
        for course_id in order.get("course_ids", []):
            if not ObjectId.is_valid(course_id):
                continue
            course = await db["courses"].find_one({"_id": oid(course_id)})
            if course:
                courses.append(serialize_doc(course))

        order["user"] = _sanitize_user(buyer)
        order["courses"] = courses
        order["final_amount"] = _payment_revenue(payment)
        orders.append(order)

    return orders


@router.get("/api/admin/revenue")
async def admin_revenue(db=Depends(get_db), user=Depends(require_role("admin"))):
    payment_db = _payment_db(db)
    payments = await payment_db["payments"].find({"status": "completed"}).to_list(length=1000)

    revenue_by_month: dict[str, dict] = {}
    for payment in payments:
        month = _month_key(payment.get("created_at"))
        item = revenue_by_month.setdefault(month, {"month": month, "revenue": 0, "orders": 0})
        item["revenue"] += _payment_revenue(payment)
        item["orders"] += 1

    return sorted(revenue_by_month.values(), key=lambda item: item["month"])
