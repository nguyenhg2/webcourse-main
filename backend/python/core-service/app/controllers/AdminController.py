from fastapi import APIRouter, Depends, Request

from app.core.deps import get_current_user, require_role
from app.db.mongo import get_db
from app.models.admin import UserRoleUpdate, UserStatusUpdate
from app.services import admin_service

router = APIRouter()


@router.get("/api/dashboard")
async def dashboard(request: Request, db=Depends(get_db), user=Depends(get_current_user)):
    role = user.get("role")

    if role == "admin":
        return {"stats": await admin_service.admin_dashboard(db, request), "items": []}

    if role == "operator":
        return await admin_service.operator_dashboard(db, request)

    if role == "instructor":
        return await admin_service.instructor_dashboard(db, user)

    return await admin_service.student_dashboard(db, user)


@router.get("/api/admin/dashboard")
async def admin_dashboard(request: Request, db=Depends(get_db), user=Depends(require_role("admin"))):
    return await admin_service.admin_dashboard(db, request)


@router.get("/api/admin/users")
async def admin_users(db=Depends(get_db), user=Depends(require_role("admin"))):
    return await admin_service.list_users(db)


@router.put("/api/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    db=Depends(get_db),
    user=Depends(require_role("admin")),
):
    return await admin_service.update_user_role(db, user_id, payload.role.value)


@router.put("/api/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    db=Depends(get_db),
    user=Depends(require_role("admin")),
):
    return await admin_service.update_user_status(db, user_id, payload.is_active)


@router.get("/api/admin/orders")
async def admin_orders(request: Request, db=Depends(get_db), user=Depends(require_role("admin", "operator"))):
    return await admin_service.list_orders(db, request)


@router.get("/api/admin/revenue")
async def admin_revenue(request: Request, db=Depends(get_db), user=Depends(require_role("admin"))):
    return await admin_service.revenue_by_month(db, request)
