from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from bson.errors import InvalidId
from jose import JWTError, jwt

from app.core.config import settings
from app.db.mongo import get_db, oid, serialize_doc

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không hợp lệ") from exc


async def get_user_from_token(token: str) -> dict:
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Dữ liệu token không hợp lệ")

    try:
        user_object_id = oid(user_id)
    except (InvalidId, TypeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Dữ liệu token không hợp lệ") from exc

    db = get_db()
    user = await db.users.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Không tìm thấy người dùng")
    if user.get("is_active") is False:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản đã bị khóa")
    user = serialize_doc(user)
    user.pop("hashed_password", None)
    user.pop("passwordHash", None)
    return user


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return await get_user_from_token(credentials.credentials)


async def get_optional_user(credentials: HTTPAuthorizationCredentials | None = Depends(optional_security)) -> dict | None:
    if credentials is None:
        return None
    try:
        return await get_user_from_token(credentials.credentials)
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            return None
        raise


def require_role(*roles: str):
    async def _role_dependency(user: dict = Depends(get_current_user)) -> dict:
        allowed = {getattr(role, "value", role) for role in roles}
        if user.get("role") not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không đủ quyền thực hiện")
        return user

    return _role_dependency
