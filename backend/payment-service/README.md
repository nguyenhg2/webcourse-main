# Payment Service

Service Go này xử lý thanh toán, mã giảm giá và video Cloudinary.

## Cấu trúc đơn giản

```text
cmd/main.go              Khởi động app, kết nối MongoDB/Redis, load config
internal/router          Khai báo toàn bộ route HTTP
internal/payment         Thanh toán
internal/coupon          Mã giảm giá
internal/video           Upload/xóa/lấy video Cloudinary
internal/middleware      JWT, phân quyền, CORS
internal/config          Đọc biến môi trường
```

## Cách đọc code

1. Mở `cmd/main.go` để xem app được khởi động như thế nào.
2. Mở `internal/router/router.go` để xem URL nào gọi module nào.
3. Mở module cần sửa, ví dụ `internal/payment`:
   - `types.go`: dữ liệu request/response và Mongo document.
   - `store.go`: thao tác MongoDB.
   - `service.go`: xử lý nghiệp vụ.
   - `handler.go`: nhận HTTP request và trả HTTP response.

## Kiểm tra

```bash
go test ./...
```
