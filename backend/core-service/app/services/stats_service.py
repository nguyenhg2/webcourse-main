from bson import ObjectId

from app.db.mongo import oid, serialize_doc


async def course_rating(db, course_ids: list[str]) -> float:
    ids = [str(course_id) for course_id in course_ids if course_id]
    if not ids:
        return 0

    reviews = await db["reviews"].find({"course_id": {"$in": ids}}).to_list(length=1000)
    ratings = [float(review.get("rating", 0) or 0) for review in reviews]
    return round(sum(ratings) / len(ratings), 1) if ratings else 0


async def course_student_count(db, course_id: str) -> int:
    if not course_id:
        return 0
    students = await db["enrollments"].distinct(
        "user_id",
        {"course_id": str(course_id), "payment_id": {"$exists": True}},
    )
    return len(students)


async def enrich_course_stats(db, course: dict | None) -> dict | None:
    if not course:
        return course

    course_id = str(course["_id"])
    course["total_students"] = await course_student_count(db, course_id)
    course["rating"] = await course_rating(db, [course_id])
    course["review_count"] = await db["reviews"].count_documents({"course_id": course_id})
    return course


async def enrich_courses_stats(db, courses: list[dict]) -> list[dict]:
    for course in courses:
        await enrich_course_stats(db, course)
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


async def public_platform_stats(db) -> dict:
    students = await db["users"].count_documents({"role": "student"})
    instructors = await db["users"].count_documents({"role": "instructor"})
    courses = await db["courses"].count_documents({"status": "published"})
    reviews = await db["reviews"].find({}).to_list(length=1000)

    if reviews:
        average = sum(float(review.get("rating", 0) or 0) for review in reviews) / len(reviews)
        satisfaction = round(average * 100 / 5)
    else:
        satisfaction = 0

    return {
        "section": "stats",
        "items": [
            {"icon": "users", "value": str(students), "label": "Học viên", "order": 1, "active": True},
            {"icon": "book", "value": str(courses), "label": "Khóa học đã xuất bản", "order": 2, "active": True},
            {"icon": "award", "value": str(instructors), "label": "Giảng viên", "order": 3, "active": True},
            {"icon": "thumbs-up", "value": f"{satisfaction}%", "label": "Tỷ lệ hài lòng", "order": 4, "active": True},
        ],
    }
