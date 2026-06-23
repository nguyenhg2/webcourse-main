from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.db.mongo import serialize_doc


class OrderedActiveItem(BaseModel):
    order: int = 0
    active: bool = True


class BenefitItem(OrderedActiveItem):
    icon: str = "monitor"
    title: str = ""
    desc: str = ""


class FaqItem(OrderedActiveItem):
    q: str = ""
    a: str = ""


class FaqGroup(OrderedActiveItem):
    category: str = ""
    items: List[FaqItem] = Field(default_factory=list)


class ContactMap(BaseModel):
    address: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    bbox: Optional[str] = None


class ContactItem(OrderedActiveItem):
    icon: str = "mail"
    title: str = ""
    content: str = ""


class SiteContentUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: Optional[str] = None
    subtitle: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None
    groups: Optional[List[Dict[str, Any]]] = None
    map: Optional[Dict[str, Any]] = None


def sort_active(items: list[dict]) -> list[dict]:
    return sorted(
        [item for item in items if item.get("active", True)],
        key=lambda item: item.get("order", 0),
    )


def normalize_site_content(doc: dict | None) -> dict | None:
    if not doc:
        return None

    if "items" in doc and isinstance(doc["items"], list):
        doc["items"] = sort_active(doc["items"])

    if "groups" in doc and isinstance(doc["groups"], list):
        groups = sort_active(doc["groups"])
        for group in groups:
            if isinstance(group.get("items"), list):
                group["items"] = sort_active(group["items"])
        doc["groups"] = groups

    return serialize_doc(doc)
