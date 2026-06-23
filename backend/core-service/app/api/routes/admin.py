from datetime import datetime, timezone
import asyncio
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from app.core.config import settings
from app.core.deps import get_current_user, require_role
from app.db.mongo import get_db, oid, serialize_doc
from app.models.admin import UserRoleUpdate, UserStatusUpdate
from app.services.stats_service import course_stats_map

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


async def _orders_from_payments(db, payments: list[dict]) -> list[dict]:
    user_ids = {
        oid(str(payment.get("user_id")))
        for payment in payments
        if ObjectId.is_valid(str(payment.get("user_id", "")))
    }
    course_ids = {
        oid(str(course_id))
        for payment in payments
        for course_id in (payment.get("course_ids") or [])
        if ObjectId.is_valid(str(course_id))
    }

    users_query = db["users"].find({"_id": {"$in": list(user_ids)}}).to_list(length=len(user_ids)) if user_ids else asyncio.sleep(0, result=[])
    courses_query = db["courses"].find({"_id": {"$in": list(course_ids)}}).to_list(length=len(course_ids)) if course_ids else asyncio.sleep(0, result=[])
    users, courses = await asyncio.gather(users_query, courses_query)

    user_lookup = {str(user["_id"]): _sanitize_user(user) for user in users}
    course_lookup = {str(course["_id"]): serialize_doc(course) for course in courses}

    orders = []
    for payment in payments:
        order = serialize_doc(payment)
        order_courses = [course_lookup[str(course_id)] for course_id in (order.get("course_ids") or []) if str(course_id) in course_lookup]
        order["user"] = user_lookup.get(str(order.get("user_id", "")))
        order["courses"] = order_courses
        course_total = sum(int(float(course.get("price", 0) or 0)) for course in order_courses)
        stored_amount = int(payment.get("amount", 0) or 0)
        coupon_discount = int(payment.get("coupon_discount", 0) or 0)
        if course_total > stored_amount and coupon_discount > 0:
            order["amount"] = course_total
            order["final_amount"] = stored_amount
        else:
            order["final_amount"] = _payment_revenue(payment)
        orders.append(order)

    return orders


async def _top_purchased_courses(db, payments: list[dict], limit: int = 5) -> list[dict]:
    purchases_by_course: dict[str, dict] = {}

    for payment in payments:
        course_ids = [
            str(course_id)
            for course_id in payment.get("course_ids", [])
            if ObjectId.is_valid(str(course_id))
        ]
        if not course_ids:
            continue

        for course_id in course_ids:
            item = purchases_by_course.setdefault(
                course_id,
                {"_id": course_id, "purchases": 0, "revenue": 0},
            )
            item["purchases"] += 1
            item["revenue"] += _payment_revenue(payment) / len(course_ids)

    if not purchases_by_course:
        return []

    courses = await db["courses"].find(
        {"_id": {"$in": [oid(course_id) for course_id in purchases_by_course]}}
    ).to_list(length=len(purchases_by_course))
    course_lookup = {str(course["_id"]): serialize_doc(course) for course in courses}

    items = []
    for course_id, stats in purchases_by_course.items():
        course = course_lookup.get(course_id)
        if not course:
            continue
        items.append(
            {
                "_id": course_id,
                "title": course.get("title", course_id),
                "purchases": stats["purchases"],
                "amount": stats["purchases"],
                "revenue": round(stats["revenue"]),
                "level": course.get("level", ""),
            }
        )

    return sorted(items, key=lambda item: item["purchases"], reverse=True)[:limit]


def _instructor_course_query(user: dict) -> dict:
    user_id = user["_id"]
    values = [user_id]
    if ObjectId.is_valid(user_id):
        values.append(oid(user_id))
    return {"instructor_id": {"$in": values}}


async def _instructor_dashboard(db, user: dict):
    courses = await db["courses"].find(_instructor_course_query(user)).to_list(length=500)
    if not courses and await db["users"].count_documents({"role": "instructor"}) == 1:
        courses = await db["courses"].find({}).to_list(length=500)

    course_ids = [str(course["_id"]) for course in courses]
    stats_by_course_query = course_stats_map(db, course_ids)
    students_query = db["enrollments"].distinct(
        "user_id",
        {"course_id": {"$in": course_ids}, "payment_id": {"$exists": True}},
    ) if course_ids else asyncio.sleep(0, result=[])
    stats_by_course, students = await asyncio.gather(stats_by_course_query, students_query)

    items = []
    for course in courses[:5]:
        course = serialize_doc(course)
        course.update(stats_by_course.get(course["_id"], {}))
        items.append(course)

    ratings = [stats.get("rating", 0) for stats in stats_by_course.values() if stats.get("review_count", 0)]
    return {
        "stats": {
            "courses": len(courses),
            "students": len(students),
            "rating": round(sum(ratings) / len(ratings), 1) if ratings else 0,
            "published": len([course for course in courses if course.get("status") == "published"]),
        },
        "items": items,
    }


async def _student_dashboard(db, user: dict):
    enrollments = await db["enrollments"].find(
        {"user_id": user["_id"], "payment_id": {"$exists": True}}
    ).to_list(length=500)

    items = []
    progress_values = []
    completed_courses = 0
    completed_lessons_total = 0

    for enrollment in enrollments:
        course_id = enrollment.get("course_id")
        if not ObjectId.is_valid(course_id):
            continue

        course = await db["courses"].find_one({"_id": oid(course_id)})
        if not course:
            continue

        lessons = await db["lessons"].find({"course_id": course_id}).to_list(length=500)
        lesson_ids = [str(lesson["_id"]) for lesson in lessons]
        completed_lessons = await db["progress"].count_documents(
            {
                "user_id": user["_id"],
                "course_id": course_id,
                "lesson_id": {"$in": lesson_ids},
                "completed": True,
            }
        ) if lesson_ids else 0
        progress = round(completed_lessons * 100 / len(lesson_ids)) if lesson_ids else 0
        progress_values.append(progress)
        completed_lessons_total += completed_lessons
        if progress >= 100:
            completed_courses += 1

        item = serialize_doc(course)
        item["progress"] = progress
        items.append(item)

    return {
        "stats": {
            "courses": len(items),
            "completed": completed_courses,
            "progress": round(sum(progress_values) / len(progress_values)) if progress_values else 0,
            "lessons": completed_lessons_total,
        },
        "items": items[:5],
    }


@router.get("/api/dashboard")
async def dashboard(db=Depends(get_db), user=Depends(get_current_user)):
    role = user.get("role")

    if role == "admin":
        stats = await admin_dashboard(db, user)
        return {"stats": stats, "items": []}

    if role == "operator":
        payment_db = _payment_db(db)
        payments = await payment_db["payments"].find({}).sort("created_at", -1).to_list(length=500)
        completed_payments = [payment for payment in payments if payment.get("status") == "completed"]
        items = await _orders_from_payments(db, payments[:5])

        return {
            "stats": {
                "revenue": sum(_payment_revenue(payment) for payment in completed_payments),
                "orders": len(payments),
                "completedOrders": len(completed_payments),
                "pendingOrders": len([payment for payment in payments if payment.get("status") == "pending"]),
                "openComplaints": await db["complaints"].count_documents({"status": {"$in": ["open", "pending"]}}),
            },
            "items": items,
        }

    if role == "instructor":
        return await _instructor_dashboard(db, user)

    return await _student_dashboard(db, user)


@router.get("/api/admin/dashboard")
async def admin_dashboard(db=Depends(get_db), user=Depends(require_role("admin"))):
    payment_db = _payment_db(db)
    completed_query = payment_db["payments"].find({"status": "completed"}).to_list(length=1000)
    recent_query = payment_db["payments"].find({}).sort("created_at", -1).to_list(length=5)
    completed_payments, recent_payments = await asyncio.gather(completed_query, recent_query)

    revenue = sum(_payment_revenue(payment) for payment in completed_payments)
    students, courses, enrollments, users, orders, top_courses, recent_orders = await asyncio.gather(
        db["users"].count_documents({"role": "student"}),
        db["courses"].count_documents({}),
        db["enrollments"].count_documents({"payment_id": {"$exists": True}}),
        db["users"].count_documents({}),
        payment_db["payments"].count_documents({}),
        _top_purchased_courses(db, completed_payments),
        _orders_from_payments(db, recent_payments),
    )

    return {
        "revenue": revenue,
        "students": students,
        "courses": courses,
        "enrollments": enrollments,
        "users": users,
        "orders": orders,
        "completedOrders": len(completed_payments),
        "topCourses": top_courses,
        "recentOrders": recent_orders,
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
        raise HTTPException(status_code=400, detail="user_id không hợp lệ")

    target_user = await db["users"].find_one({"_id": oid(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    if target_user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Không được đổi vai trò của quản trị viên")

    result = await db["users"].update_one(
        {"_id": oid(user_id)},
        {"$set": {"role": payload.role.value}},
    )

    updated_user = await db["users"].find_one({"_id": oid(user_id)})
    return _sanitize_user(updated_user)


@router.put("/api/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    db=Depends(get_db),
    user=Depends(require_role("admin")),
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="user_id không hợp lệ")

    target_user = await db["users"].find_one({"_id": oid(user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    if target_user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Không được khóa tài khoản quản trị viên")

    await db["users"].update_one({"_id": oid(user_id)}, {"$set": {"is_active": payload.is_active}})
    updated_user = await db["users"].find_one({"_id": oid(user_id)})
    return _sanitize_user(updated_user)


@router.get("/api/admin/orders")
async def admin_orders(db=Depends(get_db), user=Depends(require_role("admin", "operator"))):
    payment_db = _payment_db(db)
    payments = await payment_db["payments"].find({}).sort("created_at", -1).to_list(length=500)
    return await _orders_from_payments(db, payments)


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
