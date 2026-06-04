from fastapi import APIRouter, Depends, HTTPException
from app.models.categories import Categories
from app.core.deps import require_role
from app.db.mongo import get_db, serialize_docs, serialize_doc, oid

router = APIRouter()


@router.get("/api/categories")
async def get_categories(db=Depends(get_db)):
    cats = await db["categories"].find().to_list(100)
    return serialize_docs(cats)


@router.post("/api/categories")
async def create_category(
    payload: Categories,
    db=Depends(get_db),
    user=Depends(require_role("admin")),
):
    existing = await db["categories"].find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=400, detail="Danh mục đã tồn tại")
    doc = {"name": payload.name, "icon": payload.icon or None}
    await db["categories"].insert_one(doc)
    return {"message": "Danh mục đã được tạo"}


@router.put("/api/categories/{category_id}")
async def update_category(
    category_id: str,
    payload: Categories,
    db=Depends(get_db),
    user=Depends(require_role("admin")),
):
    existing = await db["categories"].find_one({"_id": oid(category_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    update_data = payload.model_dump(exclude_unset=True)
    await db["categories"].update_one({"_id": oid(category_id)}, {"$set": update_data})
    return {"message": "Danh mục đã được cập nhật"}


@router.delete("/api/categories/{category_id}")
async def delete_category(
    category_id: str,
    db=Depends(get_db),
    user=Depends(require_role("admin")),
):
    result = await db["categories"].delete_one({"_id": oid(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    return {"message": "Danh mục đã được xóa"}
