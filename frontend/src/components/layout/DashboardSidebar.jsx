import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiAlertCircle,
  FiBarChart2,
  FiBook,
  FiCheckSquare,
  FiDollarSign,
  FiHome,
  FiLogOut,
  FiMap,
  FiMail,
  FiPenTool,
  FiPlus,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";

const MENU_ITEMS = {
  instructor: [
    { title: "Tổng quan", path: "/dashboard", icon: <FiHome /> },
    { title: "Tạo khóa học", path: "/dashboard/courses#create-course", icon: <FiPlus /> },
    { title: "Danh sách học viên", path: "/dashboard/instructor-students", icon: <FiUsers /> },
    { title: "Hồ sơ", path: "/dashboard/profile", icon: <FiUser /> },
  ],
  operator: [
    { title: "Tổng quan", path: "/dashboard", icon: <FiHome /> },
    { title: "Kiểm duyệt khóa học", path: "/dashboard/course-reviews", icon: <FiCheckSquare /> },
    { title: "Hỗ trợ thanh toán", path: "/dashboard/payments", icon: <FiDollarSign /> },
    { title: "Giải quyết khiếu nại", path: "/dashboard/complaints", icon: <FiAlertCircle /> },
    { title: "Hồ sơ", path: "/dashboard/profile", icon: <FiUser /> },
  ],
  admin: [
    { title: "Báo cáo doanh thu", path: "/dashboard", icon: <FiBarChart2 /> },
    { title: "Quản lý người dùng", path: "/dashboard/users", icon: <FiUsers /> },
    { title: "Quản lý lộ trình", path: "/dashboard/roadmaps", icon: <FiMap /> },
    { title: "Đơn hàng", path: "/dashboard/payments", icon: <FiDollarSign /> },
    { title: "Duyệt khóa học", path: "/dashboard/course-reviews", icon: <FiCheckSquare /> },
    { title: "Kiểm duyệt đánh giá", path: "/dashboard/reviews", icon: <FiCheckSquare /> },
    { title: "Quản lý danh mục", path: "/dashboard/categories", icon: <FiTag /> },
    { title: "Mã giảm giá", path: "/dashboard/coupons", icon: <FiAlertCircle /> },
    { title: "Quản lý bài viết", path: "/dashboard/blogs", icon: <FiPenTool /> },
    { title: "Liên hệ", path: "/dashboard/contacts", icon: <FiMail /> },
    { title: "Hồ sơ", path: "/dashboard/profile", icon: <FiUser /> },
  ],
};

const ROLE_LABELS = {
  admin: "Quản trị viên",
  operator: "Vận hành",
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
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="text-xl font-bold text-primary">
            WebCourse
            <span className="text-xs ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{ROLE_LABELS[role] || role}</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-1">
          {menu.map((item) => {
            const itemPath = item.path.split("#")[0];
            const isActive = location.pathname === itemPath || (itemPath !== "/dashboard" && location.pathname.startsWith(itemPath));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-primary-light text-primary font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <FiLogOut className="text-lg" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
