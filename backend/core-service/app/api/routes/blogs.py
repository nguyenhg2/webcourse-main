from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from app.db.mongo import get_db, serialize_doc, serialize_docs

router = APIRouter()


@router.get("/api/blogs")
async def list_blogs(q: str | None = None, db=Depends(get_db)):
    query = {"is_published": True}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"excerpt": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
        ]
    blogs = await db["blogs"].find(query).sort("created_at", -1).to_list(length=100)
    return serialize_docs(blogs)


@router.get("/api/blogs/{slug}")
async def get_blog(slug: str, db=Depends(get_db)):
    blog = await db["blogs"].find_one({"slug": slug})
    if not blog:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    return serialize_doc(blog)


@router.post("/api/contact")
async def create_contact(payload: dict, db=Depends(get_db)):
    payload["created_at"] = datetime.now(timezone.utc).isoformat()
    payload["is_read"] = False
    result = await db["contacts"].insert_one(payload)
    contact = await db["contacts"].find_one({"_id": result.inserted_id})
    return serialize_doc(contact)
