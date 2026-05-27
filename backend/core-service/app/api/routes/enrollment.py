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

    for payment in payments:
        await create_enrollments(
            db,
            user_id,
            payment.get("course_ids", []),
            str(payment["_id"]),
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
        raise HTTPException(status_code=400, detail="course_id khong duoc de trong")
    if not payment_id:
        raise HTTPException(status_code=400, detail="payment_id khong duoc de trong")

    target_course_ids = list(dict.fromkeys(target_course_ids))
    if not await _validate_completed_payment(db, user["_id"], target_course_ids, payment_id):
        raise HTTPException(status_code=403, detail="Thanh toan chua hoan tat")

    result = await create_enrollments(db, user["_id"], target_course_ids, payment_id)
    if result["enrolled"]:
        await db["carts"].update_one(
            {"user_id": user["_id"]},
            {"$pull": {"items": {"$in": result["enrolled"]}}},
        )
    if not result["enrolled"] and result["skipped"]:
        return {"message": "Khong co khoa hoc moi duoc dang ky", **result}
    return {"message": "Dang ky khoa hoc thanh cong", **result}


@router.get("/api/my-courses")
async def my_courses(db=Depends(get_db), user=Depends(get_current_user)):
    await _sync_completed_payment_enrollments(db, user["_id"])

    enrollments = (
        await db["enrollments"]
        .find({"user_id": user["_id"], "payment_id": {"$exists": True}})
        .to_list(length=100)
    )
    items = []
    for enrollment in enrollments:
        if not ObjectId.is_valid(enrollment.get("course_id", "")):
            continue

        course = await db["courses"].find_one({"_id": oid(enrollment["course_id"])})
        if not course:
            continue

        lessons = await db["lessons"].find({"course_id": str(course["_id"])}).to_list(length=200)
        lesson_ids = [str(lesson["_id"]) for lesson in lessons]
        completed = await db["progress"].count_documents(
            {
                "user_id": user["_id"],
                "course_id": str(course["_id"]),
                "lesson_id": {"$in": lesson_ids},
                "completed": True,
            }
        )
        total = len(lessons)
        progress = round(completed * 100 / total) if total else 0
        first_lesson = lessons[0] if lessons else None

        course = serialize_doc(course)
        course["progress"] = progress
        course["totalLessons"] = total
        course["completedLessons"] = completed
        course["lastLesson"] = first_lesson["title"] if first_lesson else "Bai hoc dau tien"
        course["lastLessonId"] = str(first_lesson["_id"]) if first_lesson else "preview"
        course["paymentId"] = enrollment.get("payment_id")
        course["enrolledAt"] = enrollment.get("enrolled_at")
        items.append(course)
    return items


