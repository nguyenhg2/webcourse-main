from fastapi import APIRouter, Depends, HTTPException
from app.models.users import LoginRequest, RegisterRequest, TokenResponse, UserUpdate
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.mongo import get_db, serialize_doc
from datetime import timedelta
from app.core.config import settings
from app.core.deps import get_current_user

router=APIRouter()
@router.post("/api/auth/register")
async def register(payload: RegisterRequest):
    db=get_db()
    user_email=payload.email
    if (await db.users.find_one({"email": user_email})):
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")
    hashed_pwd=get_password_hash(payload.password)
    user_doc={
        "name": payload.name,
        "email": user_email,
        "hashed_password": hashed_pwd,
        "role": "student",
        "avatar": payload.avatar or None
    }
    await db.users.insert_one(user_doc)
    return {"message": "Đăng ký thành công"}

@router.post("/api/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    db=get_db()
    user=await db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không đúng")
    if not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không đúng")
    
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
async def get_current_user(user=Depends(get_current_user)):
    return user

@router.put("/api/auth/me")
async def update_current_user(payload: UserUpdate, db=Depends(get_db), user=Depends(get_current_user)):
    update_data = payload.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    result = await db.users.update_one({"_id": user["_id"]}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    updated_user = await db.users.find_one({"_id": user["_id"]})
    return serialize_doc(updated_user)