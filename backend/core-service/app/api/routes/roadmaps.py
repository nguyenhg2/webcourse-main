from fastapi import APIRouter, Depends, HTTPException
from app.db.mongo import get_db, oid, serialize_doc, serialize_docs
from bson import ObjectId
from app.core.deps import require_role

router = APIRouter()


@router.get("/api/roadmaps")
async def list_roadmaps(db=Depends(get_db)):
    roadmaps = await db["roadmaps"].find({}).sort("order", 1).to_list(length=100)
    return serialize_docs(roadmaps)


@router.get("/api/roadmaps/{roadmap_id}")
async def get_roadmap(roadmap_id: str, db=Depends(get_db)):
    query = {"slug": roadmap_id}
    if ObjectId.is_valid(roadmap_id):
        query = {"_id": oid(roadmap_id)}

    roadmap = await db["roadmaps"].find_one(query)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Không tìm thấy lộ trình")

    roadmap = serialize_doc(roadmap)
    courses = []
    for course_id in roadmap.get("course_ids", []):
        course = await db["courses"].find_one({"_id": oid(course_id)})
        if course:
            courses.append(serialize_doc(course))
    roadmap["courses"] = courses
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
