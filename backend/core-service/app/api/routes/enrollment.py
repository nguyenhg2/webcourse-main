from fastapi import APIRouter, Depends, HTTPException
from app.db.mongo import get_db, oid
from app.core.deps import get_current_user
from datetime import datetime, timezone

router=APIRouter()

@router.post("/api/enroll")
async def enroll(course_id: str,db = Depends(get_db),user = Depends(get_current_user)):
    course = await db["courses"].find_one({"_id": oid(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Khóa học không tồn tại")

    existing = await db["enrollments"].find_one({
        "user_id": user["_id"],
        "course_id": course_id,
        "payment_id": {"$exists": True} 
    })

    if existing:
        return {"message": "Bạn đã sở hữu khóa học này rồi"}

    enrollment_doc = {
        "user_id": user["_id"],
        "course_id": course_id,
        "enrolled_at": datetime.now(timezone.utc)
    }
    await db["enrollments"].insert_one(enrollment_doc)
    return {"message": "Đăng ký khóa học thành công"}