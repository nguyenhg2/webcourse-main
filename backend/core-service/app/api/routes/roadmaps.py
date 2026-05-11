from fastapi import APIRouter, Depends, HTTPException
from app.db.mongo import get_db, oid, serialize_doc, serialize_docs
from bson import ObjectId

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
