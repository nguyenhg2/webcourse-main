import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiAlertCircle,
  FiBarChart2,
  FiCheckSquare,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiMap,
  FiMail,
  FiPenTool,
  FiPlus,
  FiSettings,
  FiTag,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

const MENU_ITEMS = {
  instructor: [
    { title: "Tổng quan", desc: "Hiệu quả giảng dạy", path: "/dashboard", icon: <FiGrid /> },
    { title: "Tạo khóa học", desc: "Chương, bài học, học liệu", path: "/dashboard/courses#create-course", icon: <FiPlus /> },
    { title: "Học viên", desc: "Theo dõi từng khóa", path: "/dashboard/instructor-students", icon: <FiUsers /> },
    { title: "Hồ sơ", desc: "Thông tin cá nhân", path: "/dashboard/profile", icon: <FiUser /> },
  ],
  operator: [
    { title: "Tổng quan", desc: "Công việc vận hành", path: "/dashboard", icon: <FiGrid /> },
    { title: "Kiểm duyệt khóa học", desc: "Duyệt nội dung mới", path: "/dashboard/course-reviews", icon: <FiCheckSquare /> },
    { title: "Hỗ trợ thanh toán", desc: "Đối soát giao dịch", path: "/dashboard/payments", icon: <FiDollarSign /> },
    { title: "Khiếu nại", desc: "Tiếp nhận và xử lý", path: "/dashboard/complaints", icon: <FiAlertCircle /> },
    { title: "Hồ sơ", desc: "Thông tin cá nhân", path: "/dashboard/profile", icon: <FiUser /> },
  ],
  admin: [
    { title: "Báo cáo", desc: "Doanh thu và tăng trưởng", path: "/dashboard", icon: <FiBarChart2 /> },
    { title: "Người dùng", desc: "Tài khoản và vai trò", path: "/dashboard/users", icon: <FiUsers /> },
    { title: "Lộ trình", desc: "Chuỗi kỹ năng", path: "/dashboard/roadmaps", icon: <FiMap /> },
    { title: "Đơn hàng", desc: "Thanh toán và doanh thu", path: "/dashboard/payments", icon: <FiDollarSign /> },
    { title: "Đánh giá", desc: "Nhận xét học viên", path: "/dashboard/reviews", icon: <FiCheckSquare /> },
    { title: "Danh mục", desc: "Nhóm khóa học", path: "/dashboard/categories", icon: <FiTag /> },
    { title: "Mã giảm giá", desc: "Chiến dịch bán hàng", path: "/dashboard/coupons", icon: <FiAlertCircle /> },
    { title: "Blog", desc: "Bài viết và bản nháp", path: "/dashboard/blogs", icon: <FiPenTool /> },
    { title: "Cấu hình", desc: "FAQ, liên hệ, nội dung", path: "/dashboard/site-content", icon: <FiSettings /> },
    { title: "Liên hệ", desc: "Tin nhắn khách hàng", path: "/dashboard/contacts", icon: <FiMail /> },
    { title: "Hồ sơ", desc: "Thông tin cá nhân", path: "/dashboard/profile", icon: <FiUser /> },
  ],
};

const ROLE_LABELS = {
  admin: "Quản trị viên",
  operator: "Nhân viên vận hành",
  instructor: "Giảng viên",
};

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role;
  const menu = MENU_ITEMS[role] || [];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <Link to="/dashboard" className="min-w-0">
            <span className="block text-xl font-bold text-gray-900">CodeCamp</span>
            <span className="block truncate text-xs font-medium text-primary">{ROLE_LABELS[role] || role}</span>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 lg:hidden">
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menu.map((item) => {
              const itemPath = item.path.split("#")[0];
              const active = location.pathname === itemPath || (itemPath !== "/dashboard" && location.pathname.startsWith(itemPath));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex min-h-14 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg ${active ? "bg-white/15" : "bg-gray-100 text-gray-500"}`}>
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.title}</span>
                    <span className={`block truncate text-xs ${active ? "text-white/75" : "text-gray-400"}`}>{item.desc}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            <FiLogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
