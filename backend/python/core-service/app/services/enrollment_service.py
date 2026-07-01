from datetime import datetime, timezone

from bson import ObjectId

from app.db.mongo import oid


def _valid_course_ids(course_ids: list[str]) -> list[str]:
    return [course_id for course_id in course_ids if ObjectId.is_valid(course_id)]


async def _course_ids_that_exist(db, course_ids: list[str]) -> set[str]:
    valid_ids = _valid_course_ids(course_ids)
    if not valid_ids:
        return set()

    courses = await db["courses"].find({"_id": {"$in": [oid(course_id) for course_id in valid_ids]}}).to_list(length=len(valid_ids))
    return {str(course["_id"]) for course in courses}


async def _owned_course_ids(db, user_id: str, course_ids: list[str]) -> set[str]:
    valid_ids = _valid_course_ids(course_ids)
    if not valid_ids:
        return set()

    rows = await db["enrollments"].find(
        {
            "user_id": user_id,
            "course_id": {"$in": valid_ids},
            "payment_id": {"$exists": True},
        }
    ).to_list(length=len(valid_ids))
    return {row["course_id"] for row in rows}


async def create_enrollments(db, user_id: str, course_ids: list[str], payment_id: str):
    enrolled = []
    skipped = []
    existing_courses = await _course_ids_that_exist(db, course_ids)
    owned_courses = await _owned_course_ids(db, user_id, course_ids)

    for course_id in course_ids:
        if not ObjectId.is_valid(course_id):
            skipped.append({"course_id": course_id, "reason": "course_id không hợp lệ"})
            continue

        if course_id not in existing_courses:
            skipped.append({"course_id": course_id, "reason": "Khóa học không tồn tại"})
            continue

        if course_id in owned_courses:
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
