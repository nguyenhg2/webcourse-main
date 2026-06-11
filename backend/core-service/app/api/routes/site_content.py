from datetime import datetime
from fastapi import APIRouter, Depends
from app.db.mongo import get_db, serialize_doc, serialize_docs

router = APIRouter()

DEFAULT_SITE_CONTENT = {
    "benefits": {
        "section": "benefits",
        "title": "Tại sao chọn CodeCamp?",
        "subtitle": "Chúng tôi mang đến trải nghiệm học tập tốt nhất cho bạn",
        "items": [
            {"icon": "monitor", "title": "Học mọi lúc mọi nơi", "desc": "Truy cập khóa học trên mọi thiết bị, học theo tốc độ của riêng bạn.", "order": 1, "active": True},
            {"icon": "clock", "title": "Truy cập trọn đời", "desc": "Một lần đăng ký, truy cập mãi mãi với tất cả cập nhật mới nhất.", "order": 2, "active": True},
            {"icon": "award", "title": "Chứng chỉ hoàn thành", "desc": "Nhận chứng chỉ sau khi hoàn thành khóa học để nâng cao hồ sơ cá nhân.", "order": 3, "active": True},
            {"icon": "headphones", "title": "Hỗ trợ tận tâm", "desc": "Đội ngũ giảng viên và hỗ trợ luôn sẵn sàng giải đáp thắc mắc của bạn.", "order": 4, "active": True},
        ],
    },
    "stats": {
        "section": "stats",
        "items": [
            {"icon": "users", "value": "25K+", "label": "Học viên", "order": 1, "active": True},
            {"icon": "book", "value": "899", "label": "Tổng khóa học", "order": 2, "active": True},
            {"icon": "award", "value": "158", "label": "Giảng viên", "order": 3, "active": True},
            {"icon": "thumbs-up", "value": "100%", "label": "Tỷ lệ hài lòng", "order": 4, "active": True},
        ],
    },
    "testimonials": {
        "section": "testimonials",
        "title": "Học viên nói gì về chúng tôi",
        "subtitle": "Hàng nghìn học viên đã tin tưởng và đạt được kết quả tuyệt vời",
        "items": [
            {"name": "Nguyễn Minh Tuấn", "role": "Frontend Developer", "avatar": "https://placehold.co/48/564FFD/fff?text=T", "content": "Khóa học React trên CodeCamp thực sự tuyệt vời. Giảng viên giải thích rất dễ hiểu, bài tập thực hành phong phú. Tôi đã tìm được công việc mơ ước sau khi hoàn thành khóa học.", "rating": 5, "order": 1, "active": True},
            {"name": "Lê Thị Mai", "role": "Sinh viên CNTT", "avatar": "https://placehold.co/48/FF6636/fff?text=M", "content": "Mình là sinh viên năm 3, nhờ CodeCamp mà mình đã nắm vững kiến thức lập trình web. Giao diện học rất thân thiện và dễ sử dụng.", "rating": 5, "order": 2, "active": True},
            {"name": "Trần Đức Huy", "role": "DevOps Engineer", "avatar": "https://placehold.co/48/23BD33/fff?text=H", "content": "Các khóa học DevOps và Cloud trên CodeCamp rất chất lượng, cập nhật công nghệ mới nhất. Giá cả hợp lý so với nội dung nhận được.", "rating": 4, "order": 3, "active": True},
        ],
    },
    "contact_info": {
        "section": "contact_info",
        "map": {"address": "H? N?i, Vi?t Nam", "lat": 21.0466213, "lon": 105.7864498, "bbox": "105.7814498%2C21.0416213%2C105.7914498%2C21.0516213"},
        "items": [
            {"icon": "phone", "title": "Điện thoại", "content": "0123 456 789", "order": 1, "active": True},
            {"icon": "mail", "title": "Email", "content": "support@codecamp.vn", "order": 2, "active": True},
            {"icon": "map-pin", "title": "Địa chỉ", "content": "Hà Nội, Việt Nam", "order": 3, "active": True},
        ],
    },
    "faqs": {
        "section": "faqs",
        "groups": [
            {"category": "Chung", "order": 1, "active": True, "items": [
                {"q": "CodeCamp là gì?", "a": "CodeCamp là nền tảng học lập trình trực tuyến, cung cấp các khóa học về lập trình và công nghệ.", "order": 1, "active": True},
                {"q": "Tôi có thể học trên thiết bị nào?", "a": "Bạn có thể học trên máy tính, tablet hoặc điện thoại thông qua trình duyệt web.", "order": 2, "active": True},
                {"q": "Khóa học có thời hạn truy cập không?", "a": "Không, sau khi đăng ký bạn có thể truy cập khóa học lâu dài.", "order": 3, "active": True},
            ]},
            {"category": "Khóa học", "order": 2, "active": True, "items": [
                {"q": "Làm sao để đăng ký khóa học?", "a": "Bạn tạo tài khoản, chọn khóa học và thanh toán. Sau khi thanh toán thành công, bạn có thể học ngay.", "order": 1, "active": True},
                {"q": "Tôi có nhận được chứng chỉ không?", "a": "Có, sau khi hoàn thành khóa học bạn có thể nhận chứng chỉ hoàn thành.", "order": 2, "active": True},
            ]},
            {"category": "Thanh toán", "order": 3, "active": True, "items": [
                {"q": "CodeCamp hỗ trợ phương thức thanh toán nào?", "a": "Hệ thống hỗ trợ thanh toán trực tuyến qua cổng thanh toán được cấu hình.", "order": 1, "active": True},
                {"q": "Tôi có thể dùng mã giảm giá không?", "a": "Có, nếu mã giảm giá còn hiệu lực bạn có thể nhập khi thanh toán.", "order": 2, "active": True},
            ]},
        ],
    },
    "course_faqs": {
        "section": "course_faqs",
        "items": [
            {"q": "Tôi có thể học khóa này trong bao lâu?", "a": "Bạn được truy cập trọn đời sau khi đăng ký khóa học.", "order": 1, "active": True},
            {"q": "Khóa học có bài tập thực hành không?", "a": "Có, bài học được thiết kế kèm ví dụ và nội dung thực hành.", "order": 2, "active": True},
            {"q": "Tôi có nhận chứng chỉ không?", "a": "Có, bạn có thể nhận chứng chỉ sau khi hoàn thành khóa học.", "order": 3, "active": True},
        ],
    },
}


def sort_active(items):
    return sorted([item for item in items if item.get("active", True)], key=lambda item: item.get("order", 0))


def normalize_content(doc):
    if not doc:
        return doc
    if "items" in doc and isinstance(doc["items"], list):
        doc["items"] = sort_active(doc["items"])
    if "groups" in doc and isinstance(doc["groups"], list):
        groups = sort_active(doc["groups"])
        for group in groups:
            if isinstance(group.get("items"), list):
                group["items"] = sort_active(group["items"])
        doc["groups"] = groups
    return serialize_doc(doc)


async def seed_site_content(db):
    now = datetime.utcnow().isoformat()
    for section, doc in DEFAULT_SITE_CONTENT.items():
        existing = await db["site_content"].find_one({"section": section})
        if not existing:
            await db["site_content"].insert_one({**doc, "created_at": now, "updated_at": now})
            continue

        missing_fields = {
            key: value
            for key, value in doc.items()
            if key not in existing and key != "section"
        }
        if missing_fields:
            missing_fields["updated_at"] = now
            await db["site_content"].update_one({"section": section}, {"$set": missing_fields})


@router.get("/api/site-content")
async def get_site_content(db=Depends(get_db)):
    await seed_site_content(db)
    docs = await db["site_content"].find().to_list(100)
    return serialize_docs([normalize_content(doc) for doc in docs])


@router.get("/api/site-content/{section}")
async def get_site_content_section(section: str, db=Depends(get_db)):
    await seed_site_content(db)
    return normalize_content(await db["site_content"].find_one({"section": section}))
