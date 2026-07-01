from fastapi import APIRouter, Depends, HTTPException
from app.db.mongo import get_db, oid, serialize_doc, serialize_docs
from bson import ObjectId
from app.core.deps import require_role

router = APIRouter()


def _roadmap_query(value: str) -> dict:
    if ObjectId.is_valid(value):
        return {"_id": oid(value)}
    return {"slug": value}


def _valid_object_ids(values: list[str]) -> list[ObjectId]:
    return [oid(value) for value in values if ObjectId.is_valid(value)]


async def _roadmap_courses(db, course_ids: list[str]) -> list[dict]:
    object_ids = _valid_object_ids(course_ids)
    if not object_ids:
        return []

    courses = await db["courses"].find({"_id": {"$in": object_ids}}).to_list(length=len(object_ids))
    course_by_id = {str(course["_id"]): serialize_doc(course) for course in courses}
    return [course_by_id[course_id] for course_id in course_ids if course_id in course_by_id]


@router.get("/api/roadmaps")
async def list_roadmaps(db=Depends(get_db)):
    roadmaps = await db["roadmaps"].find({}).sort("order", 1).to_list(length=100)
    return serialize_docs(roadmaps)


@router.get("/api/roadmaps/{roadmap_id}")
async def get_roadmap(roadmap_id: str, db=Depends(get_db)):
    roadmap = await db["roadmaps"].find_one(_roadmap_query(roadmap_id))
    if not roadmap:
        raise HTTPException(status_code=404, detail="Không tìm thấy lộ trình")

    roadmap = serialize_doc(roadmap)
    roadmap["courses"] = await _roadmap_courses(db, roadmap.get("course_ids", []))
    return roadmap


@router.post("/api/roadmaps")
async def create_roadmap(roadmap: dict, db=Depends(get_db), user=Depends(require_role("admin"))):
    result = await db["roadmaps"].insert_one(roadmap)
    created_roadmap = await db["roadmaps"].find_one({"_id": result.inserted_id})
    return serialize_doc(created_roadmap)


@router.put("/api/roadmaps/{roadmap_id}")
async def update_roadmap(roadmap_id: str, roadmap: dict, db=Depends(get_db), user=Depends(require_role("admin"))):
    if not ObjectId.is_valid(roadmap_id):
        raise HTTPException(status_code=400, detail="ID lộ trình không hợp lệ")
    result = await db["roadmaps"].update_one({"_id": oid(roadmap_id)}, {"$set": roadmap})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy lộ trình")
    updated_roadmap = await db["roadmaps"].find_one({"_id": oid(roadmap_id)})
    return serialize_doc(updated_roadmap)


@router.delete("/api/roadmaps/{roadmap_id}")
async def delete_roadmap(roadmap_id: str, db=Depends(get_db), user=Depends(require_role("admin"))):
    if not ObjectId.is_valid(roadmap_id):
        raise HTTPException(status_code=400, detail="ID lộ trình không hợp lệ")
    result = await db["roadmaps"].delete_one({"_id": oid(roadmap_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy lộ trình")
    return {"message": "Đã xóa lộ trình"}
