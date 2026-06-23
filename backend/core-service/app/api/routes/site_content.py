from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_role
from app.db.mongo import get_db
from app.models.site_content import SiteContentUpdate, normalize_site_content
from app.services.stats_service import public_platform_stats

router = APIRouter()


@router.get("/api/site-content")
async def get_site_content(db=Depends(get_db)):
    docs = await db["site_content"].find().to_list(100)
    normalized = []
    has_stats = False
    for doc in docs:
        if doc.get("section") == "stats":
            normalized.append(await public_platform_stats(db))
            has_stats = True
        else:
            normalized.append(normalize_site_content(doc))
    if not has_stats:
        normalized.append(await public_platform_stats(db))
    return [item for item in normalized if item]


@router.get("/api/site-content/{section}")
async def get_site_content_section(section: str, db=Depends(get_db)):
    if section == "stats":
        return await public_platform_stats(db)
    return normalize_site_content(await db["site_content"].find_one({"section": section}))


@router.put("/api/site-content/{section}")
async def update_site_content(section: str, payload: SiteContentUpdate, db=Depends(get_db), user=Depends(require_role("admin"))):
    if section == "stats":
        raise HTTPException(status_code=400, detail="Thống kê được tính tự động từ cơ sở dữ liệu")

    now = datetime.now(timezone.utc).isoformat()
    payload_data = payload.model_dump(exclude_unset=True)
    data = {key: value for key, value in payload_data.items() if key not in {"_id", "section", "created_at", "updated_at"}}
    data.update({"section": section, "updated_at": now})
    existing = await db["site_content"].find_one({"section": section})
    if not existing:
        data["created_at"] = now

    await db["site_content"].update_one({"section": section}, {"$set": data}, upsert=True)
    return normalize_site_content(await db["site_content"].find_one({"section": section}))
