from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

_client = None
_db = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_url)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        _db = get_client()[settings.mongo_db]
    return _db


async def ensure_indexes():
    db = get_db()
    await db["enrollments"].create_index([("user_id", 1), ("payment_id", 1)])
    await db["enrollments"].create_index([("user_id", 1), ("course_id", 1), ("payment_id", 1)])
    await db["lessons"].create_index([("course_id", 1), ("order", 1)])
    await db["lesson_comments"].create_index([("lesson_id", 1), ("created_at", -1)])
    await db["lesson_comments"].create_index([("course_id", 1), ("created_at", -1)])
    await db["progress"].create_index([("user_id", 1), ("course_id", 1), ("lesson_id", 1), ("completed", 1)])


def serialize_doc(doc: dict | None) -> dict | None:
    if not doc:
        return doc
    doc["_id"] = str(doc["_id"])
    return doc


def serialize_docs(docs: list[dict]) -> list[dict]:
    return [serialize_doc(d) for d in docs]


def oid(value: str) -> ObjectId:
    return ObjectId(value)
