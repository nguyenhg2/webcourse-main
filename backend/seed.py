import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from bson import ObjectId
from datetime import datetime, timezone

MONGO_URI = "mongodb+srv://nguyendzjj:nguyenhg2@cluster0.mzobyt1.mongodb.net/?appName=Cluster0"
DB_NAME = "codecamp_core"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    for col in ["users", "categories", "courses", "sections", "lessons", "enrollments"]:
        await db[col].delete_many({})

    admin_id = ObjectId()
    instructor_id = ObjectId()
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
            "slug": "reactjs-tu-co-ban-den-nang-cao",
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

    for c in courses_data:
        c["create_at"] = datetime.now(timezone.utc).isoformat()
        course_result = await db["courses"].insert_one(c)
        course_id_str = str(course_result.inserted_id)

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
                await db["lessons"].insert_one(
                    {
                        "section_id": section_id_str,
                        "course_id": course_id_str,
                        "title": l_title,
                        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                        "duration": 600 + l_order * 120,
                        "is_free_preview": s_order == 1 and l_order == 1,
                        "attachments": [],
                        "order": l_order,
                    }
                )

    print("Seed dữ liệu thành công!")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
