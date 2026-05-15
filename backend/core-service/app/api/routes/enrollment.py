import asyncio
import logging
from contextlib import suppress
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from redis.asyncio import Redis
from app.core.config import settings
from app.core.deps import get_current_user
from app.db.mongo import get_db, oid, serialize_doc
from app.models.enrollments import EnrollRequest, PaymentSuccessEvent

router = APIRouter()
logger = logging.getLogger(__name__)
payment_success_task: asyncio.Task | None = None

async def _create_enrollments(db, user_id: str, course_ids: list[str], payment_id: str):
    enrolled = []
    skipped = []

    for course_id in course_ids:
        if not ObjectId.is_valid(course_id):
            skipped.append({"course_id": course_id, "reason": "course_id khong hop le"})
            continue

        course = await db["courses"].find_one({"_id": oid(course_id)})
        if not course:
            skipped.append({"course_id": course_id, "reason": "Khoa hoc khong ton tai"})
            continue

        existing = await db["enrollments"].find_one(
            {
                "user_id": user_id,
                "course_id": course_id,
                "payment_id": {"$exists": True},
            }
        )
        if existing:
            skipped.append({"course_id": course_id, "reason": "Da so huu khoa hoc"})
            continue

        enrollment_doc = {
            "user_id": user_id,
            "course_id": course_id,
            "payment_id": payment_id,
            "enrolled_at": datetime.now(timezone.utc),
        }
        await db["enrollments"].update_one(
            {"user_id": user_id, "course_id": course_id},
            {"$set": enrollment_doc},
            upsert=True,
        )
        enrolled.append(course_id)

    return {"enrolled": enrolled, "skipped": skipped}


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

    result = await _create_enrollments(db, user["_id"], target_course_ids, payment_id)
    if not result["enrolled"] and result["skipped"]:
        return {"message": "Khong co khoa hoc moi duoc dang ky", **result}
    return {"message": "Dang ky khoa hoc thanh cong", **result}


@router.get("/api/my-courses")
async def my_courses(db=Depends(get_db), user=Depends(get_current_user)):
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


async def _listen_payment_success():
    while True:
        redis = Redis.from_url(settings.redis_url, decode_responses=True)
        pubsub = redis.pubsub()
        try:
            await pubsub.subscribe("payment.success")
            async for message in pubsub.listen():
                if message.get("type") != "message":
                    continue

                try:
                    event = PaymentSuccessEvent.model_validate_json(message["data"])
                    await _create_enrollments(
                        get_db(),
                        event.user_id,
                        event.course_ids,
                        event.payment_id,
                    )
                except Exception as exc:
                    logger.warning("Cannot process payment.success event: %s", exc)
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            logger.warning("Redis payment listener error: %s", exc)
            await asyncio.sleep(5)
        finally:
            with suppress(Exception):
                await pubsub.unsubscribe("payment.success")
            with suppress(Exception):
                await pubsub.close()
            with suppress(Exception):
                await redis.close()


@router.on_event("startup")
async def start_payment_success_listener():
    global payment_success_task
    if not settings.redis_url:
        return
    payment_success_task = asyncio.create_task(_listen_payment_success())


@router.on_event("shutdown")
async def stop_payment_success_listener():
    global payment_success_task
    if payment_success_task:
        payment_success_task.cancel()
        with suppress(asyncio.CancelledError):
            await payment_success_task
        payment_success_task = None
