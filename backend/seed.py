import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from bson import ObjectId
from datetime import datetime, timezone

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB", "codecamp_core")
BLOG_DB_NAME = os.getenv("BLOG_MONGODB_DB", "codecamp_php")
PAYMENT_DB_NAME = os.getenv("PAYMENT_MONGODB_DB", "codecamp_payment")
DEMO_VIDEO_URL = os.getenv(
    "CLOUDINARY_DEMO_VIDEO_URL",
    "https://res.cloudinary.com/ddskipu10/video/upload/v1779970878/eodkpjke6tiwrwsc2prt.mp4",
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed_blog_only():
    client = AsyncIOMotorClient(MONGO_URI)
    blog_db = client[BLOG_DB_NAME]
    now = datetime.now(timezone.utc).isoformat()

    blog_docs = [
        {
            "title": "Lộ trình học lập trình web cho người mới",
            "slug": "lo-trinh-hoc-lap-trinh-web-cho-nguoi-moi",
            "excerpt": "Bắt đầu với HTML, CSS, JavaScript và từng bước tiến đến React, API và database.",
            "content": "Người mới nên học theo từng lớp nền tảng: giao diện, ngôn ngữ lập trình, backend API, database và cách triển khai ứng dụng.",
            "image": "https://placehold.co/410x267/564FFD/fff?text=Web+Dev",
            "author": "CodeCamp Team",
            "is_published": True,
            "created_at": now,
        },
        {
            "title": "Cách chọn khóa học phù hợp với mục tiêu nghề nghiệp",
            "slug": "cach-chon-khoa-hoc-phu-hop-voi-muc-tieu-nghe-nghiep",
            "excerpt": "Đừng chỉ chọn khóa học theo công nghệ hot, hãy bắt đầu từ vai trò bạn muốn theo đuổi.",
            "content": "Nếu muốn làm frontend, hãy ưu tiên HTML, CSS, JavaScript, React và kỹ năng làm việc với API. Nếu muốn làm backend, tập trung vào HTTP, database, xác thực và thiết kế service.",
            "image": "https://placehold.co/410x267/22C55E/fff?text=Career",
            "author": "CodeCamp Team",
            "is_published": True,
            "created_at": now,
        },
        {
            "title": "Docker giúp lập trình viên làm việc ổn định hơn như thế nào",
            "slug": "docker-giup-lap-trinh-vien-lam-viec-on-dinh-hon-nhu-the-nao",
            "excerpt": "Docker giúp đóng gói môi trường chạy, giảm lỗi khác nhau giữa máy dev và server.",
            "content": "Với Docker, mỗi service có thể chạy trong container riêng với dependency riêng. Điều này rất hữu ích cho kiến trúc nhiều service như frontend, core API, payment và blog.",
            "image": "https://placehold.co/410x267/0EA5E9/fff?text=Docker",
            "author": "CodeCamp Team",
            "is_published": True,
            "created_at": now,
        },
    ]

    for blog_doc in blog_docs:
        await blog_db["blogs"].update_one(
            {"slug": blog_doc["slug"]},
            {"$set": blog_doc},
            upsert=True,
        )

    contact_doc = {
        "name": "Người dùng test",
        "email": "test@codecamp.vn",
        "phone": "0123456789",
        "subject": "Tư vấn khóa học",
        "message": "Tôi muốn được tư vấn lộ trình học lập trình web.",
        "is_read": False,
        "created_at": now,
    }

    await blog_db["contacts"].update_one(
        {"email": contact_doc["email"], "subject": contact_doc["subject"]},
        {"$set": contact_doc},
        upsert=True,
    )

    print(f"Seed blog Mongo thành công: {len(blog_docs)} blogs, 1 contact -> {BLOG_DB_NAME}")
    client.close()


async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    blog_db = client[BLOG_DB_NAME]
    payment_db = client[PAYMENT_DB_NAME]

    for col in ["users", "categories", "courses", "sections", "lessons", "enrollments", "progress", "reviews", "carts", "roadmaps"]:
        await db[col].delete_many({})

    admin_id = ObjectId()
    instructor_id = ObjectId()
    operator_id = ObjectId()
    student_id = ObjectId()

    await db["users"].insert_many(
        [
            {
                "_id": admin_id,
                "name": "Quản trị viên",
                "email": "admin@codecamp.vn",
                "hashed_password": pwd_context.hash("admin123"),
                "role": "admin",
                "avatar": None,
                "created_at": datetime.now(timezone.utc),
            },
            {
                "_id": instructor_id,
                "name": "Đinh Thành Nguyên",
                "email": "gv@codecamp.vn",
                "hashed_password": pwd_context.hash("gv123456"),
                "role": "instructor",
                "avatar": None,
                "created_at": datetime.now(timezone.utc),
            },
            {
                "_id": operator_id,
                "name": "Nhan vien van hanh",
                "email": "operator@codecamp.vn",
                "hashed_password": pwd_context.hash("operator123"),
                "role": "operator",
                "avatar": None,
                "created_at": datetime.now(timezone.utc),
            },
            {
                "_id": student_id,
                "name": "Trần Văn Bình",
                "email": "hv@codecamp.vn",
                "hashed_password": pwd_context.hash("hv123456"),
                "role": "student",
                "avatar": None,
                "created_at": datetime.now(timezone.utc),
            },
        ]
    )

    cat_names = [
        "Web Development",
        "Ứng dụng di động",
        "Data Science",
        "DevOps & Cloud",
        "UI/UX Design",
        "Python",
    ]
    cat_ids = {}
    for name in cat_names:
        cid = ObjectId()
        cat_ids[name] = cid
        await db["categories"].insert_one({"_id": cid, "name": name, "icon": None})

    courses_data = [
        {
            "title": "React.js Từ Cơ Bản Đến Nâng Cao",
            "slug": "react-js-tu-co-ban-den-nang-cao",
            "description": "Khóa học đầy đủ về React.js, từ cơ bản đến nâng cao. Học cách xây dựng ứng dụng web hiện đại với React Hooks, Context API, Redux và nhiều hơn nữa.",
            "thumbnail": "https://placehold.co/600x400/564FFD/fff?text=React.js",
            "price": 599000,
            "category_id": str(cat_ids["Web Development"]),
            "instructor_id": str(instructor_id),
            "level": "beginner",
            "rating": 4.8,
            "total_students": 156,
            "status": "published",
            "duration": "2 Tuần",
            "total_lessons": 20,
        },
        {
            "title": "Node.js Và Express Framework",
            "slug": "nodejs-va-express-framework",
            "description": "Xây dựng backend mạnh mẽ với Node.js và Express. Học REST API, xác thực người dùng, tích hợp cơ sở dữ liệu và triển khai ứng dụng.",
            "thumbnail": "https://placehold.co/600x400/22C55E/fff?text=Node.js",
            "price": 499000,
            "category_id": str(cat_ids["Web Development"]),
            "instructor_id": str(instructor_id),
            "level": "intermediate",
            "rating": 4.5,
            "total_students": 89,
            "status": "published",
            "duration": "4 Tuần",
            "total_lessons": 30,
        },
        {
            "title": "Python Cho Người Mới Bắt Đầu",
            "slug": "python-cho-nguoi-moi-bat-dau",
            "description": "Khóa học Python dành cho người mới. Từ cú pháp cơ bản đến lập trình hướng đối tượng, xử lý file và thư viện phổ biến.",
            "thumbnail": "https://placehold.co/600x400/3B82F6/fff?text=Python",
            "price": 0,
            "category_id": str(cat_ids["Python"]),
            "instructor_id": str(instructor_id),
            "level": "beginner",
            "rating": 4.9,
            "total_students": 320,
            "status": "published",
            "duration": "3 Tuần",
            "total_lessons": 25,
        },
        {
            "title": "Flutter Phát Triển Ứng Dụng Di Động",
            "slug": "flutter-phat-trien-ung-dung-di-dong",
            "description": "Phát triển ứng dụng di động đa nền tảng với Flutter và Dart. Học widgets, quản lý trạng thái, tích hợp API.",
            "thumbnail": "https://placehold.co/600x400/06B6D4/fff?text=Flutter",
            "price": 699000,
            "category_id": str(cat_ids["Ứng dụng di động"]),
            "instructor_id": str(instructor_id),
            "level": "intermediate",
            "rating": 4.6,
            "total_students": 67,
            "status": "published",
            "duration": "5 Tuần",
            "total_lessons": 35,
        },
        {
            "title": "Docker Và Kubernetes Thực Chiến",
            "slug": "docker-va-kubernetes-thuc-chien",
            "description": "Làm chủ container hóa với Docker và điều phối với Kubernetes. Từ cơ bản đến triển khai production.",
            "thumbnail": "https://placehold.co/600x400/8B5CF6/fff?text=Docker",
            "price": 799000,
            "category_id": str(cat_ids["DevOps & Cloud"]),
            "instructor_id": str(instructor_id),
            "level": "advanced",
            "rating": 4.7,
            "total_students": 45,
            "status": "published",
            "duration": "3 Tuần",
            "total_lessons": 22,
        },
        {
            "title": "Thiết Kế UI/UX Với Figma",
            "slug": "thiet-ke-uiux-voi-figma",
            "description": "Học thiết kế giao diện người dùng chuyên nghiệp với Figma. Từ wireframe đến prototype và design system.",
            "thumbnail": "https://placehold.co/600x400/F59E0B/fff?text=Figma",
            "price": 399000,
            "category_id": str(cat_ids["UI/UX Design"]),
            "instructor_id": str(instructor_id),
            "level": "beginner",
            "rating": 4.4,
            "total_students": 112,
            "status": "published",
            "duration": "4 Tuần",
            "total_lessons": 28,
        },
    ]

    section_templates = [
        "Giới thiệu và Cài đặt",
        "Kiến thức cơ bản",
        "Thực hành nâng cao",
    ]

    course_ids = {}
    lesson_ids_by_course = {}

    for c in courses_data:
        c["create_at"] = datetime.now(timezone.utc).isoformat()
        course_result = await db["courses"].insert_one(c)
        course_id_str = str(course_result.inserted_id)
        course_ids[c["slug"]] = course_id_str
        lesson_ids_by_course[course_id_str] = []

        for s_order, s_title in enumerate(section_templates, start=1):
            section_result = await db["sections"].insert_one(
                {
                    "course_id": course_id_str,
                    "title": s_title,
                    "order": s_order,
                }
            )
            section_id_str = str(section_result.inserted_id)

            lesson_names = [
                f"Bài {s_order}.1 - Giới thiệu nội dung",
                f"Bài {s_order}.2 - Thực hành bài tập",
            ]
            for l_order, l_title in enumerate(lesson_names, start=1):
                lesson_result = await db["lessons"].insert_one(
                    {
                        "section_id": section_id_str,
                        "course_id": course_id_str,
                        "title": l_title,
                        "video_url": DEMO_VIDEO_URL,
                        "duration": 600 + l_order * 120,
                        "is_free_preview": s_order == 1 and l_order == 1,
                        "attachments": [],
                        "order": l_order,
                    }
                )
                lesson_ids_by_course[course_id_str].append(str(lesson_result.inserted_id))

    await db["enrollments"].insert_many(
        [
            {
                "user_id": str(student_id),
                "course_id": course_ids["react-js-tu-co-ban-den-nang-cao"],
                "payment_id": "seed-payment-react",
                "enrolled_at": datetime.now(timezone.utc),
            },
            {
                "user_id": str(student_id),
                "course_id": course_ids["python-cho-nguoi-moi-bat-dau"],
                "payment_id": "seed-payment-python",
                "enrolled_at": datetime.now(timezone.utc),
            },
        ]
    )

    progress_docs = []
    for course_id in [course_ids["react-js-tu-co-ban-den-nang-cao"], course_ids["python-cho-nguoi-moi-bat-dau"]]:
        for lesson_id in lesson_ids_by_course[course_id][:3]:
            progress_docs.append(
                {
                    "user_id": str(student_id),
                    "course_id": course_id,
                    "lesson_id": lesson_id,
                    "completed": True,
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                }
            )
    await db["progress"].insert_many(progress_docs)

    await db["carts"].insert_one(
        {
            "user_id": str(student_id),
            "items": [course_ids["nodejs-va-express-framework"]],
        }
    )

    await db["roadmaps"].insert_many(
        [
            {
                "slug": "frontend",
                "title": "Frontend Developer",
                "description": "HTML, CSS, JavaScript, React và triển khai giao diện thực tế.",
                "course_ids": [course_ids["react-js-tu-co-ban-den-nang-cao"], course_ids["nodejs-va-express-framework"]],
                "thumbnail": None,
                "order": 1,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "slug": "backend",
                "title": "Backend Developer",
                "description": "API, database, xác thực, thanh toán và triển khai dịch vụ.",
                "course_ids": [course_ids["nodejs-va-express-framework"], course_ids["python-cho-nguoi-moi-bat-dau"]],
                "thumbnail": None,
                "order": 2,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "slug": "devops",
                "title": "DevOps Foundation",
                "description": "Docker, Kubernetes, cloud deployment và quy trình CI/CD.",
                "course_ids": [course_ids["docker-va-kubernetes-thuc-chien"]],
                "thumbnail": None,
                "order": 3,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        ]
    )

    blog_docs = (
        [
            {
                "title": "5 Ngôn ngữ lập trình nên học năm 2026",
                "slug": "5-ngon-ngu-lap-trinh",
                "excerpt": "Khám phá các ngôn ngữ lập trình đang được săn đón nhất hiện nay.",
                "content": "JavaScript, Python, Go, TypeScript và SQL vẫn là các kỹ năng quan trọng cho người học lập trình.",
                "image": "https://placehold.co/410x267/564FFD/fff?text=Blog",
                "author": "Đinh Thành Nguyên",
                "is_published": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "title": "Hướng dẫn triển khai ứng dụng với Docker",
                "slug": "huong-dan-docker",
                "excerpt": "Từng bước triển khai ứng dụng web lên production với Docker.",
                "content": "Docker giúp đóng gói ứng dụng, môi trường chạy và biến môi trường trong một container dễ triển khai.",
                "image": "https://placehold.co/410x267/22C55E/fff?text=Docker",
                "author": "Đinh Thành Nguyên",
                "is_published": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "title": "React Hooks nâng cao",
                "slug": "react-hooks-nang-cao",
                "excerpt": "Tìm hiểu useReducer, useContext và cách tách logic bằng custom hooks.",
                "content": "Hooks giúp component React gọn hơn và dễ tái sử dụng logic hơn trong các dự án lớn.",
                "image": "https://placehold.co/410x267/FF6636/fff?text=React",
                "author": "Đinh Thành Nguyên",
                "is_published": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        ]
    )

    for blog_doc in blog_docs:
        await blog_db["blogs"].update_one(
            {"slug": blog_doc["slug"]},
            {"$set": blog_doc},
            upsert=True,
        )

    await db["reviews"].insert_many(
        [
            {
                "user_id": str(student_id),
                "user_name": "Trần Văn Bình",
                "course_id": course_ids["react-js-tu-co-ban-den-nang-cao"],
                "rating": 5,
                "comment": "Khóa học dễ hiểu, có lộ trình rõ ràng.",
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "user_id": str(student_id),
                "user_name": "Trần Văn Bình",
                "course_id": course_ids["nodejs-va-express-framework"],
                "rating": 4,
                "comment": "Phần API thực hành tốt cho người mới.",
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        ]
    )

    contact_doc = (
        {
            "name": "Người dùng test",
            "email": "test@codecamp.vn",
            "phone": "0123456789",
            "subject": "Tư vấn khóa học",
            "message": "Tôi muốn được tư vấn lộ trình Frontend.",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )

    await blog_db["contacts"].update_one(
        {"email": contact_doc["email"], "subject": contact_doc["subject"]},
        {"$set": contact_doc},
        upsert=True,
    )

    await payment_db["coupons"].delete_many({})
    await payment_db["payments"].delete_many({})
    await payment_db["coupons"].insert_many(
        [
            {
                "code": "SALE50",
                "discount": 50,
                "type": "percentage",
                "max_uses": 100,
                "used": 0,
                "expiry": 1893456000,
                "active": True,
            },
            {
                "code": "CODECAMP",
                "discount": 100000,
                "type": "fixed",
                "max_uses": 100,
                "used": 0,
                "expiry": 1893456000,
                "active": True,
            },
        ]
    )
    await payment_db["payments"].insert_many(
        [
            {
                "user_id": str(student_id),
                "course_ids": [course_ids["react-js-tu-co-ban-den-nang-cao"]],
                "amount": 599000,
                "coupon_code": "",
                "coupon_discount": 0,
                "card_last4": "",
                "card_brand": "",
                "status": "completed",
                "stripe_payment_id": "pi_seed_react",
                "created_at": int(datetime.now(timezone.utc).timestamp()),
                "updated_at": int(datetime.now(timezone.utc).timestamp()),
            },
            {
                "user_id": str(student_id),
                "course_ids": [course_ids["python-cho-nguoi-moi-bat-dau"]],
                "amount": 0,
                "coupon_code": "",
                "coupon_discount": 0,
                "card_last4": "",
                "card_brand": "",
                "status": "completed",
                "stripe_payment_id": "free_seed_python",
                "created_at": int(datetime.now(timezone.utc).timestamp()),
                "updated_at": int(datetime.now(timezone.utc).timestamp()),
            },
        ]
    )

    print("Seed dữ liệu thành công!")
    client.close()


if __name__ == "__main__":
    if "--blog-only" in sys.argv:
        asyncio.run(seed_blog_only())
    else:
        asyncio.run(seed())
