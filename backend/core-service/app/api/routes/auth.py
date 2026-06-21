from fastapi import APIRouter, Depends, HTTPException
from app.models.users import LoginRequest, RegisterRequest, TokenResponse, UserUpdate
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.mongo import get_db, oid, serialize_doc
from datetime import datetime, timedelta, timezone
from app.core.config import settings
from app.core.deps import get_current_user as get_current_user_dependency
from app.services.stats_service import course_rating

router=APIRouter()


def _sanitize_user(user: dict | None) -> dict | None:
    user = serialize_doc(user)
    if not user:
        return user
    user.pop("hashed_password", None)
    user.pop("passwordHash", None)
    return user


async def _count_completed_courses(db, user_id: str) -> int:
    enrollments = await db["enrollments"].find(
        {"user_id": user_id, "payment_id": {"$exists": True}}
    ).to_list(length=500)
    completed_courses = 0

    for enrollment in enrollments:
        course_id = enrollment.get("course_id")
        lessons = await db["lessons"].find({"course_id": course_id}).to_list(length=500)
        lesson_ids = [str(lesson["_id"]) for lesson in lessons]
        if not lesson_ids:
            continue

        completed_lessons = await db["progress"].count_documents(
            {
                "user_id": user_id,
                "course_id": course_id,
                "lesson_id": {"$in": lesson_ids},
                "completed": True,
            }
        )
        if completed_lessons >= len(lesson_ids):
            completed_courses += 1

    return completed_courses


async def _build_profile_stats(db, user: dict) -> dict:
    user_id = user["_id"]
    role = user.get("role", "student")

    if role == "student":
        enrolled_courses = await db["enrollments"].count_documents(
            {"user_id": user_id, "payment_id": {"$exists": True}}
        )
        completed_courses = await _count_completed_courses(db, user_id)
        progress_docs = await db["progress"].find(
            {"user_id": user_id, "completed": True},
            {"completed_at": 1},
        ).to_list(length=1000)
        learned_days = {
            str(doc.get("completed_at", ""))[:10]
            for doc in progress_docs
            if doc.get("completed_at")
        }
        return {
            "enrolled_courses": enrolled_courses,
            "completed_courses": completed_courses,
            "learning_days": len(learned_days),
        }

    if role == "instructor":
        course_filter = {"instructor_id": user_id}
        courses = await db["courses"].find(course_filter).to_list(length=500)
        course_ids = [str(course["_id"]) for course in courses]
        students = await db["enrollments"].distinct(
            "user_id",
            {"course_id": {"$in": course_ids}, "payment_id": {"$exists": True}},
        ) if course_ids else []
        return {
            "courses": len(courses),
            "students": len(students),
            "average_rating": await course_rating(db, course_ids),
        }

    if role == "operator":
        payment_db = db.client[settings.payment_db]
        return {
            "orders": await payment_db["payments"].count_documents({}),
            "completed_orders": await payment_db["payments"].count_documents({"status": "completed"}),
            "pending_orders": await payment_db["payments"].count_documents({"status": "pending"}),
        }

    if role == "admin":
        return {
            "users": await db["users"].count_documents({}),
            "courses": await db["courses"].count_documents({}),
            "roles": len(await db["users"].distinct("role")),
        }

    return {}

@router.post("/api/auth/register")
async def register(payload: RegisterRequest, db=Depends(get_db)):
    user_email=payload.email
    if (await db.users.find_one({"email": user_email})):
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")
    hashed_pwd=get_password_hash(payload.password)
    user_doc={
        "name": payload.name,
        "email": user_email,
        "hashed_password": hashed_pwd,
        "role": "student",
        "avatar": payload.avatar or None,
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(user_doc)
    return {"message": "Đăng ký thành công"}

@router.post("/api/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db=Depends(get_db)):
    user=await db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không đúng")
    if user.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Tài khoản đã bị khóa")
    if not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không đúng")
    
    expected_role = payload.expected_role.value if payload.expected_role else None
    if expected_role and user.get("role") != expected_role:
        raise HTTPException(status_code=403, detail="Tài khoản không đúng vai trò đăng nhập")

    user=serialize_doc(user)
    token=create_access_token(
        {
            "user_id": user["_id"],
            "email": user["email"],
            "role": user["role"]
        },
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    return TokenResponse(access_token=token, expires_in=settings.access_token_expire_minutes * 60)

@router.get("/api/auth/me")
async def get_current_user(user=Depends(get_current_user_dependency)):
    return user

@router.get("/api/auth/profile")
async def get_profile(db=Depends(get_db), user=Depends(get_current_user_dependency)):
    return {
        "user": user,
        "stats": await _build_profile_stats(db, user),
    }

@router.put("/api/auth/me")
async def update_current_user(payload: UserUpdate, db=Depends(get_db), user=Depends(get_current_user_dependency)):
    update_data = payload.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    result = await db.users.update_one({"_id": oid(user["_id"])}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    updated_user = await db.users.find_one({"_id": oid(user["_id"])})
    return _sanitize_user(updated_user)
