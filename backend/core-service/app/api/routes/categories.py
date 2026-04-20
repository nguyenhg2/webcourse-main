from fastapi import APIRouter, Depends, HTTPException
from app.models.categories import Categories
from app.core.deps import require_role
from app.db.mongo import get_db

router=APIRouter()

@router.get("/api/categories")
async def categories(db=Depends(get_db)):
    categories = await db["categories"].distinct("name")
    return categories

@router.post("/api/categories")
async def create_category(payload: Categories, db=Depends(get_db),user=Depends(require_role("admin"))):
    existing = await db["categories"].find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=400, detail="Danh mục này đã tồn tại")
    category_doc = {
        "name": payload.name,
        "icon": payload.icon or None
    }
    await db["categories"].insert_one(category_doc)
    return {"message": "Danh mục đã được tạo"}

@router.put("/api/categories/{category_id}")
async def update_category(category_id: str, payload: Categories, db=Depends(get_db), user=Depends(require_role("admin"))):
    existing = await db["categories"].find_one({"_id": category_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")

    update_data = payload.model_dump(exclude_unset=True)
    update_data["icon"] = update_data.get("icon") or None

    await db["categories"].update_one({"_id": category_id}, {"$set": update_data})
    return {"message": "Danh mục đã được cập nhật"}

@router.delete("/api/categories/{category_id}")
async def delete_category(category_id: str, db=Depends(get_db), user=Depends(require_role("admin"))):
    result = await db["categories"].delete_one({"_id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    return {"message": "Danh mục đã được xóa"}