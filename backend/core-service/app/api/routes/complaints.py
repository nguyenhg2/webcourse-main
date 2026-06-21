from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.config import settings
from app.core.deps import get_current_user, require_role
from app.db.mongo import get_db, oid, serialize_doc

router = APIRouter()


class ComplaintCreate(BaseModel):
    title: str
    description: str
    course_id: str | None = None
    payment_id: str | None = None


class ComplaintUpdate(BaseModel):
    status: str | None = None
    priority: str | None = None
    operator_note: str | None = None


def _payment_db(db):
    return db.client[settings.payment_db]


def _sanitize_user(user: dict | None) -> dict | None:
    user = serialize_doc(user)
    if not user:
        return user
    user.pop("hashed_password", None)
    user.pop("passwordHash", None)
    return user


async def _enrich_complaint(db, complaint: dict) -> dict:
    item = serialize_doc(complaint)

    student = None
    if ObjectId.is_valid(str(item.get("student_id", ""))):
        student = await db["users"].find_one({"_id": oid(item["student_id"])})
    item["student"] = _sanitize_user(student)

    course = None
    if ObjectId.is_valid(str(item.get("course_id", ""))):
        course = await db["courses"].find_one({"_id": oid(item["course_id"])})
    item["course"] = serialize_doc(course)

    payment = None
    if ObjectId.is_valid(str(item.get("payment_id", ""))):
        payment = await _payment_db(db)["payments"].find_one({"_id": oid(item["payment_id"])})
    item["payment"] = serialize_doc(payment)

    return item


@router.get("/api/complaints")
async def get_complaints(
    status: str | None = Query(default=None),
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    query = {}
    if status and status != "all":
        query["status"] = status
    if user.get("role") == "student":
        query["student_id"] = user["_id"]
    elif user.get("role") != "operator":
        raise HTTPException(status_code=403, detail="Không đủ quyền thực hiện")

    complaints = await db["complaints"].find(query).sort("created_at", -1).to_list(length=500)
    return [await _enrich_complaint(db, complaint) for complaint in complaints]


@router.post("/api/complaints")
async def create_complaint(
    payload: ComplaintCreate,
    db=Depends(get_db),
    user=Depends(require_role("student")),
):
    now = datetime.now(timezone.utc)
    complaint = {
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "status": "open",
        "priority": "normal",
        "student_id": user["_id"],
        "student_name": user.get("name", ""),
        "course_id": payload.course_id or "",
        "payment_id": payload.payment_id or "",
        "operator_note": "",
        "created_at": now,
        "updated_at": now,
    }
    if not complaint["title"] or not complaint["description"]:
        raise HTTPException(status_code=400, detail="Vui lòng nhập đầy đủ nội dung khiếu nại")

    result = await db["complaints"].insert_one(complaint)
    created = await db["complaints"].find_one({"_id": result.inserted_id})
    return await _enrich_complaint(db, created)


@router.patch("/api/complaints/{complaint_id}")
async def update_complaint(
    complaint_id: str,
    payload: ComplaintUpdate,
    db=Depends(get_db),
    user=Depends(require_role("operator")),
):
    if not ObjectId.is_valid(complaint_id):
        raise HTTPException(status_code=400, detail="complaint_id không hợp lệ")

    allowed_statuses = {"open", "pending", "resolved"}
    allowed_priorities = {"low", "normal", "high"}
    data = payload.model_dump(exclude_unset=True)

    if "status" in data and data["status"] not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Trạng thái khiếu nại không hợp lệ")
    if "priority" in data and data["priority"] not in allowed_priorities:
        raise HTTPException(status_code=400, detail="Mức ưu tiên không hợp lệ")

    data["handled_by"] = user["_id"]
    data["handled_by_name"] = user.get("name", "")
    data["updated_at"] = datetime.now(timezone.utc)

    result = await db["complaints"].update_one({"_id": oid(complaint_id)}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy khiếu nại")

    complaint = await db["complaints"].find_one({"_id": oid(complaint_id)})
    return await _enrich_complaint(db, complaint)
