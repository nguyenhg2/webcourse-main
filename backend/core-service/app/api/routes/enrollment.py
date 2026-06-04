from collections import defaultdict

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from app.core.config import settings
from app.core.deps import get_current_user
from app.db.mongo import get_db, oid, serialize_doc
from app.models.enrollments import EnrollRequest
from app.services.enrollment_service import create_enrollments

router = APIRouter()


async def _validate_completed_payment(db, user_id: str, course_ids: list[str], payment_id: str) -> bool:
    if not ObjectId.is_valid(payment_id):
        return False

    payment = await db.client[settings.payment_db]["payments"].find_one(
        {
            "_id": oid(payment_id),
            "user_id": user_id,
            "status": "completed",
        }
    )
    if not payment:
        return False

    paid_course_ids = set(payment.get("course_ids", []))
    return set(course_ids).issubset(paid_course_ids)


async def _sync_completed_payment_enrollments(db, user_id: str):
    existing_enrollments = await db["enrollments"].find(
        {"user_id": user_id, "payment_id": {"$exists": True}},
        {"course_id": 1},
    ).to_list(length=500)
    existing_course_ids = {item.get("course_id") for item in existing_enrollments if item.get("course_id")}

    payments = (
        await db.client[settings.payment_db]["payments"]
        .find(
            {
                "user_id": user_id,
                "status": "completed",
                "course_ids": {"$exists": True, "$ne": []},
            }
        )
        .to_list(length=200)
    )

    cart_course_ids = []
    for payment in payments:
        course_ids = [course_id for course_id in payment.get("course_ids", []) if course_id not in existing_course_ids]
        if not course_ids:
            continue

        await create_enrollments(
            db,
            user_id,
            course_ids,
            str(payment["_id"]),
        )
        existing_course_ids.update(course_ids)
        cart_course_ids.extend(course_ids)

    if cart_course_ids:
        await db["carts"].update_one(
            {"user_id": user_id},
            {"$pull": {"items": {"$in": cart_course_ids}}},
        )


@router.post("/api/enroll")
async def enroll(
    payload: EnrollRequest | None = None,
    course_id: str | None = None,
    payment_id: str | None = None,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    target_course_ids = []
    if payload:
        target_course_ids = payload.course_ids or ([payload.course_id] if payload.course_id else [])
        payment_id = payload.payment_id or payment_id
    elif course_id:
        target_course_ids = [course_id]

    if not target_course_ids:
        raise HTTPException(status_code=400, detail="course_id không được để trống")
    if not payment_id:
        raise HTTPException(status_code=400, detail="payment_id không được để trống")

    target_course_ids = list(dict.fromkeys(target_course_ids))
    if not await _validate_completed_payment(db, user["_id"], target_course_ids, payment_id):
        raise HTTPException(status_code=403, detail="Thanh toán chưa hoàn tất")

    result = await create_enrollments(db, user["_id"], target_course_ids, payment_id)
    await db["carts"].update_one(
        {"user_id": user["_id"]},
        {"$pull": {"items": {"$in": target_course_ids}}},
    )
    if not result["enrolled"] and result["skipped"]:
        return {"message": "Không có khóa học mới được đăng ký", **result}
    return {"message": "Đăng ký khóa học thành công", **result}


@router.get("/api/my-courses")
async def my_courses(db=Depends(get_db), user=Depends(get_current_user)):
    enrollments = (
        await db["enrollments"]
        .find({"user_id": user["_id"], "payment_id": {"$exists": True}})
        .to_list(length=100)
    )

    if not enrollments:
        await _sync_completed_payment_enrollments(db, user["_id"])
        enrollments = (
            await db["enrollments"]
            .find({"user_id": user["_id"], "payment_id": {"$exists": True}})
            .to_list(length=100)
        )

    course_ids = []
    enrollment_by_course_id = {}
    for enrollment in enrollments:
        course_id = enrollment.get("course_id", "")
        if not ObjectId.is_valid(course_id) or course_id in enrollment_by_course_id:
            continue
        course_ids.append(course_id)
        enrollment_by_course_id[course_id] = enrollment

    if not course_ids:
        return []

    courses = await db["courses"].find(
        {"_id": {"$in": [oid(course_id) for course_id in course_ids]}}
    ).to_list(length=len(course_ids))
    course_by_id = {str(course["_id"]): course for course in courses}

    lessons = await db["lessons"].find(
        {"course_id": {"$in": course_ids}},
        {"_id": 1, "course_id": 1, "title": 1, "order": 1},
    ).sort([("course_id", 1), ("order", 1), ("_id", 1)]).to_list(length=1000)

    lessons_by_course_id = defaultdict(list)
    for lesson in lessons:
        lessons_by_course_id[lesson.get("course_id")].append(lesson)

    lesson_ids = [str(lesson["_id"]) for lesson in lessons]

    completed_by_course_id = {}
    if lesson_ids:
        progress_rows = await db["progress"].aggregate([
            {
                "$match": {
                    "user_id": user["_id"],
                    "course_id": {"$in": course_ids},
                    "lesson_id": {"$in": lesson_ids},
                    "completed": True,
                }
            },
            {"$group": {"_id": "$course_id", "completed": {"$sum": 1}}},
        ]).to_list(length=len(course_ids))
        completed_by_course_id = {row["_id"]: row["completed"] for row in progress_rows}

    items = []
    for course_id in course_ids:
        course = course_by_id.get(course_id)
        if not course:
            continue

        course_lessons = lessons_by_course_id.get(course_id, [])
        completed = completed_by_course_id.get(course_id, 0)
        total = len(course_lessons)
        progress = round(completed * 100 / total) if total else 0
        first_lesson = course_lessons[0] if course_lessons else None
        enrollment = enrollment_by_course_id[course_id]

        course = serialize_doc(course)
        course["progress"] = progress
        course["totalLessons"] = total
        course["completedLessons"] = completed
        course["lastLesson"] = first_lesson["title"] if first_lesson else "Chưa có bài học"
        course["lastLessonId"] = str(first_lesson["_id"]) if first_lesson else None
        course["paymentId"] = enrollment.get("payment_id")
        course["enrolledAt"] = enrollment.get("enrolled_at")
        items.append(course)
    return items


