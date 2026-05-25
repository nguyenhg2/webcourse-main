import { useMemo, useState } from "react";

const DATA = {
  students: {
    title: "Quản lý học viên",
    description: "Theo dõi học viên, tiến độ và trạng thái hỗ trợ.",
    items: ["Trần Văn Bình - React.js - 55%", "Nguyễn Minh Anh - Python - 80%", "Lê Hoàng Nam - Docker - 20%"],
  },
  qa: {
    title: "Giải đáp Q&A",
    description: "Tiếp nhận và phản hồi câu hỏi trong khóa học.",
    items: ["useEffect chạy hai lần trong React", "Cách xác thực JWT với API", "Deploy Docker Compose lên VPS"],
  },
  reviews: {
    title: "Kiểm duyệt khóa học",
    description: "Duyệt nội dung, video và trạng thái xuất bản.",
    items: ["React.js nâng cao - chờ duyệt", "Flutter cơ bản - cần sửa thumbnail", "Docker thực chiến - đạt yêu cầu"],
  },
  complaints: {
    title: "Giải quyết khiếu nại",
    description: "Theo dõi phản hồi từ người học và điều phối xử lý.",
    items: ["Thanh toán chưa ghi nhận", "Video bài 2 bị lỗi", "Yêu cầu hoàn tiền"],
  },
  blogs: {
    title: "Quản lý Blog",
    description: "Lập lịch, kiểm tra và biên tập bài viết.",
    items: ["5 ngôn ngữ lập trình nên học", "React Hooks nâng cao", "Triển khai ứng dụng với Docker"],
  },
  settings: {
    title: "Cấu hình hệ thống",
    description: "Thiết lập thông số vận hành phía frontend.",
    items: ["CORS frontend", "Cloudinary upload", "Payment callback"],
  },
};

export default function WorkflowBoard({ type }) {
  const config = DATA[type] || DATA.qa;
  const [active, setActive] = useState("open");
  const rows = useMemo(() => config.items.map((title, index) => ({ id: index + 1, title, status: index % 2 ? "pending" : "open" })), [config]);
  const visible = active === "all" ? rows : rows.filter((row) => row.status === active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
        <p className="text-gray-500 mt-1">{config.description}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-lg p-4 flex gap-2">
        {["open", "pending", "all"].map((item) => (
          <button key={item} onClick={() => setActive(item)} className={`px-4 py-2 rounded-lg text-sm font-medium ${active === item ? "bg-primary text-white" : "bg-gray-50 text-gray-600"}`}>
            {item === "all" ? "Tất cả" : item === "open" ? "Đang mở" : "Đang chờ"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {visible.map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">#{item.id}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{item.status}</span>
            </div>
            <h2 className="font-semibold text-gray-900 mt-4">{item.title}</h2>
            <textarea className="mt-4 w-full h-24 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-primary resize-none" placeholder="Ghi chú xử lý..." />
            <button className="mt-4 w-full py-2.5 bg-primary text-white rounded-lg font-semibold">Cập nhật</button>
          </div>
        ))}
      </div>
    </div>
  );
}
