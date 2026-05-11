from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import get_current_user
from app.db.mongo import get_db, oid, serialize_doc, serialize_docs
from bson import ObjectId

router = APIRouter()


@router.get("/api/my-courses")
async def my_courses(db=Depends(get_db), user=Depends(get_current_user)):
    enrollments = await db["enrollments"].find({"user_id": user["_id"]}).to_list(length=100)
    items = []
    for enrollment in enrollments:
        course = await db["courses"].find_one({"_id": oid(enrollment["course_id"])})
        if not course:
            continue

        lessons = await db["lessons"].find({"course_id": str(course["_id"])}).to_list(length=200)
        lesson_ids = [str(lesson["_id"]) for lesson in lessons]
        completed = await db["progress"].count_documents({
            "user_id": user["_id"],
            "course_id": str(course["_id"]),
            "lesson_id": {"$in": lesson_ids},
            "completed": True,
        })
        total = len(lessons)
        progress = round(completed * 100 / total) if total else 0
        first_lesson = lessons[0] if lessons else None

        course = serialize_doc(course)
        course["progress"] = progress
        course["totalLessons"] = total
        course["completedLessons"] = completed
        course["lastLesson"] = first_lesson["title"] if first_lesson else "Bài học đầu tiên"
        course["lastLessonId"] = str(first_lesson["_id"]) if first_lesson else "preview"
        items.append(course)
    return items


@router.get("/api/cart")
async def get_cart(db=Depends(get_db), user=Depends(get_current_user)):
    cart = await db["carts"].find_one({"user_id": user["_id"]})
    if not cart:
        return {"items": []}

    courses = []
    for course_id in cart.get("items", []):
        course = await db["courses"].find_one({"_id": oid(course_id)})
        if course:
            courses.append(serialize_doc(course))
    return {"items": courses}


@router.post("/api/cart")
async def add_cart(payload: dict, db=Depends(get_db), user=Depends(get_current_user)):
    course_id = payload.get("course_id")
    if not course_id or not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="course_id không hợp lệ")
    await db["carts"].update_one(
        {"user_id": user["_id"]},
        {"$addToSet": {"items": course_id}},
        upsert=True,
    )
    return {"message": "Đã thêm vào giỏ hàng"}


@router.delete("/api/cart/{course_id}")
async def remove_cart(course_id: str, db=Depends(get_db), user=Depends(get_current_user)):
    await db["carts"].update_one({"user_id": user["_id"]}, {"$pull": {"items": course_id}})
    return {"message": "Đã xóa khỏi giỏ hàng"}


@router.post("/api/progress")
async def save_progress(payload: dict, db=Depends(get_db), user=Depends(get_current_user)):
    doc = {
        "user_id": user["_id"],
        "lesson_id": payload.get("lesson_id"),
        "course_id": payload.get("course_id"),
        "completed": bool(payload.get("completed", True)),
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    await db["progress"].update_one(
        {"user_id": doc["user_id"], "lesson_id": doc["lesson_id"]},
        {"$set": doc},
        upsert=True,
    )
    return doc


@router.get("/api/courses/{course_id}/reviews")
async def course_reviews(course_id: str, db=Depends(get_db)):
    reviews = await db["reviews"].find({"course_id": course_id}).sort("created_at", -1).to_list(length=100)
    return serialize_docs(reviews)


@router.post("/api/reviews")
async def create_review(payload: dict, db=Depends(get_db), user=Depends(get_current_user)):
    payload["user_id"] = user["_id"]
    payload["user_name"] = user.get("name")
    payload["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db["reviews"].insert_one(payload)
    review = await db["reviews"].find_one({"_id": result.inserted_id})
    return serialize_doc(review)
