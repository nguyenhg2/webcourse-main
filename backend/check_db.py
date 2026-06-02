import asyncio
import os
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient


def load_root_env() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip().lstrip("\ufeff"), value.strip().strip('"').strip("'"))


def required_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise RuntimeError(f"{key} is required; set it in the root .env file")
    return value


async def main():
    load_root_env()

    client = AsyncIOMotorClient(required_env("MONGODB_URI"), serverSelectionTimeoutMS=5000)
    await client.admin.command("ping")
    core = client[os.getenv("MONGODB_DB", "codecamp_core")]
    blog = client[os.getenv("BLOG_MONGODB_DB", "codecamp_php")]
    payment = client[os.getenv("PAYMENT_MONGODB_DB", "codecamp_payment")]

    core_collections = [
        "users",
        "categories",
        "courses",
        "sections",
        "lessons",
        "enrollments",
        "progress",
        "reviews",
        "carts",
        "roadmaps",
    ]
    blog_collections = ["blogs", "contacts"]
    payment_collections = ["coupons", "payments"]

    for name in core_collections:
        print(f"{name}: {await core[name].count_documents({})}")
    for name in blog_collections:
        print(f"blog.{name}: {await blog[name].count_documents({})}")
    for name in payment_collections:
        print(f"payment.{name}: {await payment[name].count_documents({})}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
