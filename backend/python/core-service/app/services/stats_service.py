from bson import ObjectId
import asyncio

from app.db.mongo import oid, serialize_doc


async def empty_list():
    return []


async def course_rating(db, course_ids: list[str]) -> float:
    ids = [str(course_id) for course_id in course_ids if course_id]
    if not ids:
        return 0

    rows = await db["reviews"].aggregate([
        {"$match": {"course_id": {"$in": ids}}},
        {"$group": {"_id": None, "rating": {"$avg": "$rating"}}},
    ]).to_list(length=1)
    return round(float(rows[0]["rating"]), 1) if rows else 0


async def course_student_count(db, course_id: str) -> int:
    if not course_id:
        return 0
    students = await db["enrollments"].distinct(
        "user_id",
        {"course_id": str(course_id), "payment_id": {"$exists": True}},
    )
    return len(students)


async def course_stats_map(db, course_ids: list[str]) -> dict[str, dict]:
    ids = [str(course_id) for course_id in course_ids if course_id]
    stats = {course_id: {"rating": 0, "review_count": 0, "total_students": 0} for course_id in ids}
    if not ids:
        return stats

    review_query = db["reviews"].aggregate([
        {"$match": {"course_id": {"$in": ids}}},
        {"$group": {"_id": "$course_id", "rating": {"$avg": "$rating"}, "review_count": {"$sum": 1}}},
    ]).to_list(length=len(ids))

    student_query = db["enrollments"].aggregate([
        {"$match": {"course_id": {"$in": ids}, "payment_id": {"$exists": True}}},
        {"$group": {"_id": {"course_id": "$course_id", "user_id": "$user_id"}}},
        {"$group": {"_id": "$_id.course_id", "total_students": {"$sum": 1}}},
    ]).to_list(length=len(ids))

    review_rows, student_rows = await asyncio.gather(review_query, student_query)

    for row in review_rows:
        course_id = str(row["_id"])
        stats[course_id]["rating"] = round(float(row.get("rating") or 0), 1)
        stats[course_id]["review_count"] = int(row.get("review_count") or 0)

    for row in student_rows:
        course_id = str(row["_id"])
        stats[course_id]["total_students"] = int(row.get("total_students") or 0)

    return stats


async def enrich_course_stats(db, course: dict | None) -> dict | None:
    if not course:
        return course

    course_id = str(course["_id"])
    course.update((await course_stats_map(db, [course_id]))[course_id])
    return course


async def enrich_courses_stats(db, courses: list[dict]) -> list[dict]:
    stats = await course_stats_map(db, [str(course["_id"]) for course in courses])
    for course in courses:
        course.update(stats.get(str(course["_id"]), {}))
    return courses


async def attach_course_relations(db, course: dict) -> dict:
    category_id = course.get("category_id")
    instructor_id = course.get("instructor_id")

    if ObjectId.is_valid(str(category_id or "")):
        category = await db["categories"].find_one({"_id": oid(str(category_id))})
        if category:
            course["category"] = serialize_doc(category)

    if ObjectId.is_valid(str(instructor_id or "")):
        instructor = await db["users"].find_one({"_id": oid(str(instructor_id))})
        if instructor:
            instructor = serialize_doc(instructor)
            instructor.pop("hashed_password", None)
            instructor.pop("passwordHash", None)
            course["instructor"] = instructor

    return course


async def attach_courses_relations(db, courses: list[dict]) -> list[dict]:
    category_ids = {
        oid(str(course.get("category_id")))
        for course in courses
        if ObjectId.is_valid(str(course.get("category_id") or ""))
    }
    instructor_ids = {
        oid(str(course.get("instructor_id")))
        for course in courses
        if ObjectId.is_valid(str(course.get("instructor_id") or ""))
    }

    categories_query = db["categories"].find({"_id": {"$in": list(category_ids)}}).to_list(length=len(category_ids)) if category_ids else empty_list()
    instructors_query = db["users"].find({"_id": {"$in": list(instructor_ids)}}).to_list(length=len(instructor_ids)) if instructor_ids else empty_list()
    categories, instructors = await asyncio.gather(categories_query, instructors_query)

    category_by_id = {str(item["_id"]): serialize_doc(item) for item in categories}
    instructor_by_id = {}
    for item in instructors:
        user = serialize_doc(item)
        user.pop("hashed_password", None)
        user.pop("passwordHash", None)
        instructor_by_id[user["_id"]] = user

    for course in courses:
        category = category_by_id.get(str(course.get("category_id")))
        instructor = instructor_by_id.get(str(course.get("instructor_id")))
        if category:
            course["category"] = category
        if instructor:
            course["instructor"] = instructor
    return courses


async def public_platform_stats(db) -> dict:
    students, instructors, courses, rating_rows = await asyncio.gather(
        db["users"].count_documents({"role": "student"}),
        db["users"].count_documents({"role": "instructor"}),
        db["courses"].count_documents({"status": "published"}),
        db["reviews"].aggregate([
            {"$group": {"_id": None, "rating": {"$avg": "$rating"}}},
        ]).to_list(length=1),
    )
    satisfaction = round(float(rating_rows[0]["rating"]) * 100 / 5) if rating_rows else 0

    return {
        "section": "stats",
        "items": [
            {"icon": "users", "value": str(students), "label": "Học viên", "order": 1, "active": True},
            {"icon": "book", "value": str(courses), "label": "Khóa học đã xuất bản", "order": 2, "active": True},
            {"icon": "award", "value": str(instructors), "label": "Giảng viên", "order": 3, "active": True},
            {"icon": "thumbs-up", "value": f"{satisfaction}%", "label": "Tỷ lệ hài lòng", "order": 4, "active": True},
        ],
    }
