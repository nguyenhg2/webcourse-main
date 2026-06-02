import asyncio
import os
from datetime import datetime, timezone
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


load_root_env()

MONGO_URI = required_env("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB", "codecamp_core")
BLOG_DB_NAME = os.getenv("BLOG_MONGODB_DB", "codecamp_php")


COURSES = {
    "react-js-tu-co-ban-den-nang-cao": {
        "title": "React.js Từ Cơ Bản Đến Nâng Cao",
        "description": "Khóa học đầy đủ về React.js, từ cơ bản đến nâng cao. Học cách xây dựng ứng dụng web hiện đại với React Hooks, Context API, Redux và nhiều hơn nữa.",
        "duration": "2 Tuần",
    },
    "nodejs-va-express-framework": {
        "title": "Node.js Và Express Framework",
        "description": "Xây dựng backend mạnh mẽ với Node.js và Express. Học REST API, xác thực người dùng, tích hợp cơ sở dữ liệu và triển khai ứng dụng.",
        "duration": "4 Tuần",
    },
    "python-cho-nguoi-moi-bat-dau": {
        "title": "Python Cho Người Mới Bắt Đầu",
        "description": "Khóa học Python dành cho người mới. Từ cú pháp cơ bản đến lập trình hướng đối tượng, xử lý file và thư viện phổ biến.",
        "duration": "3 Tuần",
    },
    "flutter-phat-trien-ung-dung-di-dong": {
        "title": "Flutter Phát Triển Ứng Dụng Di Động",
        "description": "Phát triển ứng dụng di động đa nền tảng với Flutter và Dart. Học widgets, quản lý trạng thái, tích hợp API.",
        "duration": "5 Tuần",
    },
    "docker-va-kubernetes-thuc-chien": {
        "title": "Docker Và Kubernetes Thực Chiến",
        "description": "Làm chủ container hóa với Docker và điều phối với Kubernetes. Từ cơ bản đến triển khai production.",
        "duration": "3 Tuần",
    },
    "thiet-ke-uiux-voi-figma": {
        "title": "Thiết Kế UI/UX Với Figma",
        "description": "Học thiết kế giao diện người dùng chuyên nghiệp với Figma. Từ wireframe đến prototype và design system.",
        "duration": "4 Tuần",
    },
}


BLOGS = {
    "5-ngon-ngu-lap-trinh": {
        "title": "5 Ngôn Ngữ Lập Trình Nên Học Năm 2026",
        "excerpt": "Khám phá các ngôn ngữ lập trình đang được săn đón nhất hiện nay.",
        "content": "JavaScript, Python, Go, TypeScript và SQL vẫn là các kỹ năng quan trọng cho người học lập trình.",
        "author": "Đinh Thành Nguyên",
    },
    "huong-dan-docker": {
        "title": "Hướng Dẫn Triển Khai Ứng Dụng Với Docker",
        "excerpt": "Từng bước triển khai ứng dụng web lên production với Docker.",
        "content": "Docker giúp đóng gói ứng dụng, môi trường chạy và biến môi trường trong một container dễ triển khai.",
        "author": "Đinh Thành Nguyên",
    },
    "react-hooks-nang-cao": {
        "title": "React Hooks Nâng Cao",
        "excerpt": "Tìm hiểu useReducer, useContext và cách tách logic bằng custom hooks.",
        "content": "Hooks giúp component React gọn hơn và dễ tái sử dụng logic hơn trong các dự án lớn.",
        "author": "Đinh Thành Nguyên",
    },
}


async def main():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    blog_db = client[BLOG_DB_NAME]

    await db.users.update_one({"email": "admin@codecamp.vn"}, {"$set": {"name": "Quản trị viên"}})
    await db.users.update_one({"email": "gv@codecamp.vn"}, {"$set": {"name": "Đinh Thành Nguyên"}})
    await db.users.update_one({"email": "hv@codecamp.vn"}, {"$set": {"name": "Trần Văn Bình"}})
    await db.users.update_one({"email": "operator@codecamp.vn"}, {"$set": {"name": "Nhân viên vận hành"}})

    await db.categories.delete_many(
        {"name": {"$in": ["Web Development", "Data Science", "UI/UX Design"]}}
    )

    for slug, payload in COURSES.items():
        await db.courses.update_one({"slug": slug}, {"$set": payload})

    section_titles = ["Giới thiệu và Cài đặt", "Kiến thức cơ bản", "Thực hành nâng cao"]
    async for section in db.sections.find({}):
        order = int(section.get("order") or 1)
        title = section_titles[order - 1] if 1 <= order <= len(section_titles) else "Nội dung khóa học"
        await db.sections.update_one({"_id": section["_id"]}, {"$set": {"title": title}})

    async for lesson in db.lessons.find({}):
        section = await db.sections.find_one({"_id": lesson.get("section_id")})
        section_order = int(section.get("order") or 1) if section else 1
        lesson_order = int(lesson.get("order") or 1)
        await db.lessons.update_one(
            {"_id": lesson["_id"]},
            {"$set": {"title": f"Bài {section_order}.{lesson_order} - Nội dung bài học"}},
        )

    await db.reviews.update_many(
        {"user_name": {"$exists": True}},
        {"$set": {"user_name": "Trần Văn Bình", "comment": "Khóa học dễ hiểu, có lộ trình rõ ràng."}},
    )

    await db.roadmaps.update_one(
        {"slug": "frontend"},
        {"$set": {"title": "Frontend Developer", "description": "HTML, CSS, JavaScript, React và triển khai giao diện thực tế."}},
    )
    await db.roadmaps.update_one(
        {"slug": "backend"},
        {"$set": {"title": "Backend Developer", "description": "API, database, xác thực, thanh toán và triển khai dịch vụ."}},
    )
    await db.roadmaps.update_one(
        {"slug": "devops"},
        {"$set": {"title": "DevOps Foundation", "description": "Docker, Kubernetes, cloud deployment và quy trình CI/CD."}},
    )

    now = datetime.now(timezone.utc).isoformat()
    for slug, payload in BLOGS.items():
        await blog_db.blogs.update_one({"slug": slug}, {"$set": {**payload, "created_at": now}}, upsert=True)

    await blog_db.contacts.update_many(
        {},
        {"$set": {"name": "Người dùng test", "subject": "Tư vấn khóa học", "message": "Tôi muốn được tư vấn lộ trình Frontend."}},
    )

    print("Updated display data to Vietnamese with accents.")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
