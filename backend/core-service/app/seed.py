import asyncio
import os
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.core.security import get_password_hash


def oid(value: str) -> ObjectId:
    return ObjectId(value)


def image(text: str, color: str = "FF6636") -> str:
    return f"https://placehold.co/640x360/{color}/ffffff?text={text}"


async def upsert_many(db, collection: str, docs: list[dict]) -> None:
    for doc in docs:
        data = {key: value for key, value in doc.items() if key != "_id"}
        await db[collection].update_one({"_id": doc["_id"]}, {"$set": data}, upsert=True)


async def main() -> None:
    client = AsyncIOMotorClient(settings.mongo_url)
    core_db = client[settings.mongo_db]
    payment_db = client[settings.payment_db]
    blog_db = client[os.getenv("BLOG_MONGODB_DB", "codecamp_php")]

    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    now_ts = int(now.timestamp())
    password = get_password_hash("123456")

    users = [
        {"_id": oid("665000000000000000000001"), "name": "Admin CodeCamp", "email": "admin@codecamp.vn", "hashed_password": password, "role": "admin", "avatar": image("AD", "0F1119"), "created_at": now - timedelta(days=90)},
        {"_id": oid("665000000000000000000002"), "name": "Operator CodeCamp", "email": "operator@codecamp.vn", "hashed_password": password, "role": "operator", "avatar": image("OP", "3B82F6"), "created_at": now - timedelta(days=80)},
        {"_id": oid("665000000000000000000003"), "name": "Nguyễn Minh Quân", "email": "instructor@codecamp.vn", "hashed_password": password, "role": "instructor", "avatar": image("GV", "564FFD"), "created_at": now - timedelta(days=70)},
        {"_id": oid("665000000000000000000004"), "name": "Trần Anh Khoa", "email": "khoa.instructor@codecamp.vn", "hashed_password": password, "role": "instructor", "avatar": image("AK", "23BD33"), "created_at": now - timedelta(days=65)},
        {"_id": oid("665000000000000000000005"), "name": "Lê Hà My", "email": "student@codecamp.vn", "hashed_password": password, "role": "student", "avatar": image("MY", "FF6636"), "created_at": now - timedelta(days=50)},
        {"_id": oid("665000000000000000000006"), "name": "Phạm Đức Nam", "email": "nam@student.vn", "hashed_password": password, "role": "student", "avatar": image("DN", "10B981"), "created_at": now - timedelta(days=42)},
        {"_id": oid("665000000000000000000007"), "name": "Vũ Ngọc Linh", "email": "linh@student.vn", "hashed_password": password, "role": "student", "avatar": image("NL", "F97316"), "created_at": now - timedelta(days=35)},
    ]

    categories = [
        {"_id": oid("666000000000000000000001"), "name": "Web Development", "icon": "monitor"},
        {"_id": oid("666000000000000000000002"), "name": "Backend", "icon": "server"},
        {"_id": oid("666000000000000000000003"), "name": "AI & Machine Learning", "icon": "cpu"},
        {"_id": oid("666000000000000000000004"), "name": "DevOps", "icon": "cloud"},
    ]

    courses = [
        {"_id": oid("667000000000000000000001"), "title": "React.js thực chiến từ cơ bản", "slug": "react-thuc-chien", "description": "Xây dựng giao diện hiện đại, quản lý state, routing và tích hợp API cho ứng dụng thực tế.", "thumbnail": image("React.js", "2563EB"), "price": 1299000, "category_id": str(categories[0]["_id"]), "instructor_id": str(users[2]["_id"]), "level": "beginner", "rating": 4.8, "total_students": 1280, "status": "published", "create_at": now_iso, "created_at": now_iso, "cloudinary_folder": "codecamp/courses/react-thuc-chien"},
        {"_id": oid("667000000000000000000002"), "title": "Node.js API với MongoDB", "slug": "nodejs-api-mongodb", "description": "Thiết kế REST API, xác thực JWT, phân quyền và triển khai backend với MongoDB.", "thumbnail": image("Node.js", "16A34A"), "price": 1499000, "category_id": str(categories[1]["_id"]), "instructor_id": str(users[2]["_id"]), "level": "intermediate", "rating": 4.7, "total_students": 920, "status": "published", "create_at": now_iso, "created_at": now_iso, "cloudinary_folder": "codecamp/courses/nodejs-api-mongodb"},
        {"_id": oid("667000000000000000000003"), "title": "Python FastAPI cho Microservices", "slug": "python-fastapi-microservices", "description": "Xây dựng service bất đồng bộ, schema Pydantic, MongoDB Motor và API Gateway.", "thumbnail": image("FastAPI", "0EA5E9"), "price": 1699000, "category_id": str(categories[1]["_id"]), "instructor_id": str(users[3]["_id"]), "level": "advanced", "rating": 4.9, "total_students": 640, "status": "published", "create_at": now_iso, "created_at": now_iso, "cloudinary_folder": "codecamp/courses/python-fastapi-microservices"},
        {"_id": oid("667000000000000000000004"), "title": "Docker và CI/CD căn bản", "slug": "docker-cicd-can-ban", "description": "Đóng gói ứng dụng, viết Dockerfile, docker-compose và pipeline triển khai cơ bản.", "thumbnail": image("Docker", "0891B2"), "price": 999000, "category_id": str(categories[3]["_id"]), "instructor_id": str(users[3]["_id"]), "level": "beginner", "rating": 4.6, "total_students": 520, "status": "published", "create_at": now_iso, "created_at": now_iso, "cloudinary_folder": "codecamp/courses/docker-cicd-can-ban"},
        {"_id": oid("667000000000000000000005"), "title": "Machine Learning nhập môn", "slug": "machine-learning-nhap-mon", "description": "Làm quen với dữ liệu, huấn luyện mô hình, đánh giá và triển khai bài toán dự đoán đầu tiên.", "thumbnail": image("AI", "7C3AED"), "price": 1899000, "category_id": str(categories[2]["_id"]), "instructor_id": str(users[3]["_id"]), "level": "intermediate", "rating": 4.5, "total_students": 310, "status": "pending_review", "review_note": "", "create_at": now_iso, "created_at": now_iso, "cloudinary_folder": "codecamp/courses/machine-learning-nhap-mon"},
        {"_id": oid("667000000000000000000006"), "title": "TypeScript nâng cao", "slug": "typescript-nang-cao", "description": "Generic, utility types, type guard và kiến trúc frontend an toàn kiểu dữ liệu.", "thumbnail": image("TypeScript", "1D4ED8"), "price": 1199000, "category_id": str(categories[0]["_id"]), "instructor_id": str(users[2]["_id"]), "level": "advanced", "rating": 4.4, "total_students": 210, "status": "rejected", "review_note": "Cần bổ sung video cho chương 2 trước khi xuất bản.", "create_at": now_iso, "created_at": now_iso, "cloudinary_folder": "codecamp/courses/typescript-nang-cao"},
    ]

    sections = []
    lessons = []
    lesson_no = 1
    video = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    for index, course in enumerate(courses, start=1):
        for section_order, section_title in enumerate(["Nền tảng", "Dự án thực hành"], start=1):
            section_id = oid(f"668{index:02d}{section_order:02d}{0:017d}")
            sections.append({"_id": section_id, "course_id": str(course["_id"]), "title": section_title, "order": section_order})
            for lesson_order in range(1, 4):
                has_video = not (course["status"] == "rejected" and section_order == 2 and lesson_order == 3)
                lessons.append({
                    "_id": oid(f"669{lesson_no:021d}"),
                    "section_id": str(section_id),
                    "course_id": str(course["_id"]),
                    "title": f"Bài {section_order}.{lesson_order} - {section_title} {lesson_order}",
                    "video_url": video if has_video else "",
                    "video_public_id": f"codecamp/demo/{course['slug']}-{section_order}-{lesson_order}" if has_video else "",
                    "video_asset_folder": course["cloudinary_folder"],
                    "duration": 420 + lesson_order * 90,
                    "is_free_preview": section_order == 1 and lesson_order == 1,
                    "attachments": [{"name": "Source code", "url": "https://github.com/example/codecamp-sample"}, {"name": "Bài tập", "url": "https://example.com/codecamp-practice.pdf"}],
                    "order": lesson_order,
                })
                lesson_no += 1

    enrollments = [
        {"_id": oid("672000000000000000000001"), "user_id": str(users[4]["_id"]), "course_id": str(courses[0]["_id"]), "payment_id": "66a000000000000000000001", "enrolled_at": now - timedelta(days=25)},
        {"_id": oid("672000000000000000000002"), "user_id": str(users[4]["_id"]), "course_id": str(courses[1]["_id"]), "payment_id": "66a000000000000000000001", "enrolled_at": now - timedelta(days=25)},
        {"_id": oid("672000000000000000000003"), "user_id": str(users[5]["_id"]), "course_id": str(courses[2]["_id"]), "payment_id": "66a000000000000000000002", "enrolled_at": now - timedelta(days=16)},
        {"_id": oid("672000000000000000000004"), "user_id": str(users[6]["_id"]), "course_id": str(courses[3]["_id"]), "payment_id": "66a000000000000000000003", "enrolled_at": now - timedelta(days=8)},
    ]

    progress = []
    for idx, lesson in enumerate([item for item in lessons if item["course_id"] in {str(courses[0]["_id"]), str(courses[1]["_id"])}][:8], start=1):
        progress.append({"_id": oid(f"671{idx:021d}"), "user_id": str(users[4]["_id"]), "course_id": lesson["course_id"], "lesson_id": str(lesson["_id"]), "completed": True, "completed_at": now - timedelta(days=idx)})

    reviews = [
        {"_id": oid("66c000000000000000000001"), "user_id": str(users[4]["_id"]), "course_id": str(courses[0]["_id"]), "rating": 5, "comment": "Nội dung rõ ràng, bài tập sát thực tế và dễ áp dụng vào dự án.", "created_at": now - timedelta(days=12)},
        {"_id": oid("66c000000000000000000002"), "user_id": str(users[5]["_id"]), "course_id": str(courses[2]["_id"]), "rating": 5, "comment": "FastAPI được giải thích mạch lạc, phần triển khai microservices rất hữu ích.", "created_at": now - timedelta(days=6)},
        {"_id": oid("66c000000000000000000003"), "user_id": str(users[6]["_id"]), "course_id": str(courses[3]["_id"]), "rating": 4, "comment": "Phần Docker dễ hiểu, nên bổ sung thêm ví dụ pipeline nâng cao.", "created_at": now - timedelta(days=3)},
    ]

    carts = [
        {"_id": oid("670000000000000000000001"), "user_id": str(users[4]["_id"]), "items": [str(courses[3]["_id"])]},
        {"_id": oid("670000000000000000000002"), "user_id": str(users[5]["_id"]), "items": [str(courses[0]["_id"]), str(courses[1]["_id"])]},
    ]

    roadmaps = [
        {"_id": oid("66d000000000000000000001"), "title": "Lộ trình Frontend Developer", "slug": "frontend-developer", "description": "Từ nền tảng giao diện đến React, TypeScript và dự án thực chiến.", "thumbnail": image("Frontend", "F97316"), "course_ids": [str(courses[0]["_id"]), str(courses[5]["_id"])], "order": 1, "created_at": now_iso},
        {"_id": oid("66d000000000000000000002"), "title": "Lộ trình Backend Developer", "slug": "backend-developer", "description": "Xây dựng API, cơ sở dữ liệu, microservices và triển khai backend.", "thumbnail": image("Backend", "10B981"), "course_ids": [str(courses[1]["_id"]), str(courses[2]["_id"]), str(courses[3]["_id"])], "order": 2, "created_at": now_iso},
    ]

    payments = [
        {"_id": oid("66a000000000000000000001"), "user_id": str(users[4]["_id"]), "user_email": users[4]["email"], "course_ids": [str(courses[0]["_id"]), str(courses[1]["_id"])], "amount": 2798000, "original_amount": 2798000, "discount_amount": 280000, "final_amount": 2518000, "coupon_code": "CODECAMP10", "coupon_discount": 280000, "method": "stripe", "status": "completed", "stripe_payment_id": "pi_demo_001", "card_last4": "4242", "card_brand": "Visa", "billing_address": {"name": users[4]["name"], "email": users[4]["email"], "phone": "0901000001", "line1": "Hà Nội", "city": "Hà Nội", "country": "VN"}, "created_at": now_ts - 25 * 86400, "updated_at": now_ts - 25 * 86400},
        {"_id": oid("66a000000000000000000002"), "user_id": str(users[5]["_id"]), "user_email": users[5]["email"], "course_ids": [str(courses[2]["_id"])], "amount": 1699000, "original_amount": 1699000, "discount_amount": 0, "final_amount": 1699000, "coupon_code": "", "coupon_discount": 0, "method": "stripe", "status": "completed", "stripe_payment_id": "pi_demo_002", "card_last4": "5555", "card_brand": "Mastercard", "billing_address": {"name": users[5]["name"], "email": users[5]["email"], "phone": "0901000002", "line1": "Đà Nẵng", "city": "Đà Nẵng", "country": "VN"}, "created_at": now_ts - 16 * 86400, "updated_at": now_ts - 16 * 86400},
        {"_id": oid("66a000000000000000000003"), "user_id": str(users[6]["_id"]), "user_email": users[6]["email"], "course_ids": [str(courses[3]["_id"])], "amount": 999000, "original_amount": 999000, "discount_amount": 0, "final_amount": 999000, "coupon_code": "", "coupon_discount": 0, "method": "stripe", "status": "completed", "stripe_payment_id": "pi_demo_003", "card_last4": "1111", "card_brand": "Visa", "billing_address": {"name": users[6]["name"], "email": users[6]["email"], "phone": "0901000003", "line1": "TP. Hồ Chí Minh", "city": "TP. Hồ Chí Minh", "country": "VN"}, "created_at": now_ts - 8 * 86400, "updated_at": now_ts - 8 * 86400},
        {"_id": oid("66a000000000000000000004"), "user_id": str(users[4]["_id"]), "user_email": users[4]["email"], "course_ids": [str(courses[3]["_id"])], "amount": 999000, "original_amount": 999000, "discount_amount": 0, "final_amount": 999000, "coupon_code": "", "coupon_discount": 0, "method": "stripe", "status": "pending", "stripe_payment_id": "pi_demo_004", "card_last4": "", "card_brand": "", "billing_address": {"name": users[4]["name"], "email": users[4]["email"]}, "created_at": now_ts - 2 * 86400, "updated_at": now_ts - 2 * 86400},
    ]

    coupons = [
        {"_id": oid("66b000000000000000000001"), "code": "CODECAMP10", "type": "percentage", "discount": 10, "active": True, "expiry": now_ts + 45 * 86400, "max_uses": 100, "used_count": 1},
        {"_id": oid("66b000000000000000000002"), "code": "WELCOME200", "type": "fixed", "discount": 200000, "active": True, "expiry": now_ts + 90 * 86400, "max_uses": 50, "used_count": 0},
        {"_id": oid("66b000000000000000000003"), "code": "OLDSTUDENT", "type": "percentage", "discount": 20, "active": False, "expiry": now_ts + 15 * 86400, "max_uses": 30, "used_count": 12},
    ]

    blogs = [
        {"_id": oid("66e000000000000000000001"), "title": "Học React thế nào để không bị ngợp", "slug": "hoc-react-the-nao-de-khong-bi-ngop", "excerpt": "Một lộ trình học React gọn, tập trung vào dự án và tư duy component.", "content": "React dễ học hơn khi bạn bắt đầu từ component nhỏ, state rõ ràng và luồng dữ liệu một chiều.", "image": image("React Blog", "2563EB"), "author": "CodeCamp Team", "is_published": True, "created_at": now_iso},
        {"_id": oid("66e000000000000000000002"), "title": "Checklist trước khi deploy API", "slug": "checklist-truoc-khi-deploy-api", "excerpt": "Các điểm cần kiểm tra về biến môi trường, log, CORS, bảo mật và cơ sở dữ liệu.", "content": "Một API tốt cần có cấu hình rõ ràng, xác thực ổn định, kiểm soát lỗi và dữ liệu seed để kiểm thử.", "image": image("API", "10B981"), "author": "CodeCamp Team", "is_published": True, "created_at": now_iso},
        {"_id": oid("66e000000000000000000003"), "title": "Tối ưu trải nghiệm học video", "slug": "toi-uu-trai-nghiem-hoc-video", "excerpt": "Player, ghi chú, tiến độ và Q&A là các điểm chính của một lớp học trực tuyến tốt.", "content": "Người học cần thấy rõ bài đang học, bài tiếp theo, tiến độ và nơi đặt câu hỏi theo ngữ cảnh.", "image": image("Video", "F97316"), "author": "CodeCamp Team", "is_published": True, "created_at": now_iso},
    ]

    contacts = [
        {"_id": oid("66f000000000000000000001"), "name": "Ngô Thanh Bình", "email": "binh@example.com", "phone": "0912000001", "subject": "Tư vấn lộ trình", "message": "Tôi muốn học để chuyển sang Frontend Developer trong 6 tháng.", "is_read": False, "created_at": now_iso},
        {"_id": oid("66f000000000000000000002"), "name": "Hoàng Minh", "email": "minh@example.com", "phone": "0912000002", "subject": "Hỗ trợ thanh toán", "message": "Tôi cần kiểm tra trạng thái đơn hàng sau khi thanh toán thẻ.", "is_read": True, "created_at": now_iso},
    ]

    lesson_comments = [
        {"_id": oid("673000000000000000000001"), "lesson_id": str(lessons[0]["_id"]), "course_id": str(courses[0]["_id"]), "user_id": str(users[4]["_id"]), "user_name": users[4]["name"], "content": "Em nên tách component form như thế nào để dễ tái sử dụng?", "created_at": now_iso},
        {"_id": oid("673000000000000000000002"), "lesson_id": str(lessons[0]["_id"]), "course_id": str(courses[0]["_id"]), "user_id": str(users[2]["_id"]), "user_name": users[2]["name"], "content": "Em có thể tách theo trách nhiệm: input, validation và submit handler.", "created_at": now_iso},
    ]

    await core_db["users"].delete_many({"email": {"$in": [user["email"] for user in users]}, "_id": {"$nin": [user["_id"] for user in users]}})
    await core_db["categories"].delete_many({"name": {"$in": [category["name"] for category in categories]}, "_id": {"$nin": [category["_id"] for category in categories]}})
    await core_db["courses"].delete_many({"slug": {"$in": [course["slug"] for course in courses]}, "_id": {"$nin": [course["_id"] for course in courses]}})
    await core_db["roadmaps"].delete_many({"slug": {"$in": [roadmap["slug"] for roadmap in roadmaps]}, "_id": {"$nin": [roadmap["_id"] for roadmap in roadmaps]}})
    await blog_db["blogs"].delete_many({"slug": {"$in": [blog["slug"] for blog in blogs]}, "_id": {"$nin": [blog["_id"] for blog in blogs]}})

    await upsert_many(core_db, "users", users)
    await upsert_many(core_db, "categories", categories)
    await upsert_many(core_db, "courses", courses)
    await upsert_many(core_db, "sections", sections)
    await upsert_many(core_db, "lessons", lessons)
    await upsert_many(core_db, "enrollments", enrollments)
    await upsert_many(core_db, "progress", progress)
    await upsert_many(core_db, "reviews", reviews)
    await upsert_many(core_db, "carts", carts)
    await upsert_many(core_db, "roadmaps", roadmaps)
    await upsert_many(core_db, "lesson_comments", lesson_comments)
    await upsert_many(payment_db, "payments", payments)
    await upsert_many(payment_db, "coupons", coupons)
    await upsert_many(blog_db, "blogs", blogs)
    await upsert_many(blog_db, "contacts", contacts)

    print("Seed MongoDB completed")
    print("Demo accounts: admin@codecamp.vn, operator@codecamp.vn, instructor@codecamp.vn, student@codecamp.vn")
    print("Password: 123456")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
