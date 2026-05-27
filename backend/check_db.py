import asyncio
import os

from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
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
