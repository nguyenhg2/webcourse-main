from datetime import datetime, timezone

from bson import ObjectId

from app.db.mongo import oid


async def create_enrollments(db, user_id: str, course_ids: list[str], payment_id: str):
    enrolled = []
    skipped = []

    for course_id in course_ids:
        if not ObjectId.is_valid(course_id):
            skipped.append({"course_id": course_id, "reason": "course_id không hợp lệ"})
            continue

        course = await db["courses"].find_one({"_id": oid(course_id)})
        if not course:
            skipped.append({"course_id": course_id, "reason": "Khóa học không tồn tại"})
            continue

        existing = await db["enrollments"].find_one(
            {
                "user_id": user_id,
                "course_id": course_id,
                "payment_id": {"$exists": True},
            }
        )
        if existing:
            skipped.append({"course_id": course_id, "reason": "Đã sở hữu khóa học"})
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
