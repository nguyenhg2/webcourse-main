# Webcourse

Web app bán và quản lý khóa học lập trình.

## Cấu trúc

Code backend được tách theo ngôn ngữ để dễ đọc, dễ giao việc và dễ deploy:

```text
backend/
  python/
    core-service/       FastAPI: course, lesson, enrollment, user, admin
    api-gateway/        FastAPI: gateway gom API cho frontend
  go/
    payment-service/    Go: payment, coupon, webhook
    media-service/      Go: Cloudflare R2 upload/delete/signed URL
  php/
    blog-service/       Laravel: blog, contact
frontend/               React/Vite app
```

## Luồng request

```text
frontend/src/services/api.js
  -> backend/python/api-gateway/app/routes/ApiRoute.py
  -> backend/<language>/<service>/.../controllers/*Controller.*
```

Mỗi service là một biên độc lập:

```text
Core Service      sở hữu course, lesson, enrollment, user, complaint
Payment Service   sở hữu payment, coupon
Media Service     sở hữu upload/delete media và signed URL qua Cloudflare R2
Blog Service      sở hữu blog, contact
```

Service này không đọc trực tiếp database hoặc import code của service khác. Khi cần dữ liệu liên service, chỉ dùng HTTP API qua gateway/service URL hoặc event Redis như `payment.success`.

Ví dụ:

```text
CourseManager.jsx
  -> getCoursesAPI()
  -> http://localhost:8000/core/api/courses
  -> core-service/app/controllers/CourseController.py
```

Trong `backend/python/core-service/app`, code đi theo mô hình MVC thực dụng cho API:

```text
controllers/            Controller: khai báo endpoint, dependency, gọi service
models/                 Model/schema: dữ liệu request/response
services/               Service: nghiệp vụ, thống kê, tích hợp collection khác
db/                     Database adapter
core/                   Config, security, dependency chung
```

Trong các service Go, code cũng đi theo luồng route -> controller:

```text
internal/routes/        ApiRoute.go: khai báo endpoint và middleware
internal/controllers/   *Controller.go: xử lý request theo nghiệp vụ
internal/middleware/    Middleware dùng chung
internal/config/        Config service
```

Ví dụ:

```text
backend/go/payment-service/internal/routes/ApiRoute.go
  -> internal/controllers/payment/PaymentController.go
  -> internal/controllers/coupon/CouponController.go
```

Trong PHP Laravel, giữ đúng cấu trúc MVC mặc định của framework:

```text
routes/api.php          API routes
app/Http/Controllers/   BlogController.php, ContactController.php
app/Models/             Blog.php, Contact.php
```

Quy ước đặt tên:

```text
*Controller.py          Ví dụ: AdminController.py, CourseController.py
*Controller.go          Ví dụ: PaymentController.go, MediaController.go
*Controller.php         Ví dụ: BlogController.php, ContactController.php
*_service.py            Ví dụ: admin_service.py, enrollment_service.py
models/*.py             Schema/model theo từng nghiệp vụ
```

## Cần có `.env`

Tạo file `.env` ở thư mục gốc:

```env
MONGODB_URI=
MONGODB_DB=webcourse_core
PAYMENT_MONGODB_DB=webcourse_payment
BLOG_MONGODB_DB=webcourse_blog
JWT_SECRET=
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=

MEDIA_INTERNAL_TOKEN=dev-internal-token
MEDIA_SIGNED_URL_TTL_SECONDS=600

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ENDPOINT=
R2_PUBLIC_BASE_URL=
```

Với Stripe local demo, chỉ dùng test key: `sk_test...` cho `STRIPE_SECRET_KEY` và `pk_test...` cho `VITE_STRIPE_PUBLISHABLE_KEY`. Có thể dùng thẻ test `4242 4242 4242 4242`, ngày hết hạn bất kỳ trong tương lai và CVC bất kỳ.

## Chạy bằng Docker

```bash
docker compose up --build
```

Mở app tại:

```text
http://localhost:5173
```

Gateway:

```text
http://localhost:8000/core
http://localhost:8000/payment
http://localhost:8000/media
http://localhost:8000/blog
```

Service chạy nội bộ:

```text
core-service      http://localhost:8001
payment-service   http://localhost:8002
blog-service      http://localhost:8003
media-service     http://localhost:8004
```

## Seed MongoDB

```bash
cd backend/python/core-service
python -m pip install -r requirements.txt
python -m app.seed
```

Tài khoản demo dùng mật khẩu `123456`:

```text
admin@codecamp.vn
operator@codecamp.vn
instructor@codecamp.vn
student@codecamp.vn
```

## Build frontend

```bash
cd frontend
npm install
npm run build
```
