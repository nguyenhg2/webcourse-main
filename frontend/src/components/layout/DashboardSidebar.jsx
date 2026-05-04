import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiHome,
  FiBook,
  FiUsers,
  FiMessageCircle,
  FiCheckSquare,
  FiDollarSign,
  FiAlertCircle,
  FiBarChart2,
  FiSettings,
  FiTag,
  FiLogOut,
  FiPenTool,
} from "react-icons/fi";

const MENU_ITEMS = {
  instructor: [
    { title: "Tổng quan", path: "/dashboard", icon: <FiHome /> },
    { title: "Khóa học của tôi", path: "/dashboard/courses", icon: <FiBook /> },
    { title: "Học viên", path: "/dashboard/students", icon: <FiUsers /> },
    { title: "Giải đáp Q&A", path: "/dashboard/qa", icon: <FiMessageCircle /> },
  ],
  operator: [
    { title: "Tổng quan", path: "/dashboard", icon: <FiHome /> },
    { title: "Kiểm duyệt khóa học", path: "/dashboard/reviews", icon: <FiCheckSquare /> },
    { title: "Hỗ trợ thanh toán", path: "/dashboard/payments", icon: <FiDollarSign /> },
    { title: "Giải quyết khiếu nại", path: "/dashboard/complaints", icon: <FiAlertCircle /> },
  ],
  admin: [
    { title: "Báo cáo doanh thu", path: "/dashboard", icon: <FiBarChart2 /> },
    { title: "Quản lý người dùng", path: "/dashboard/users", icon: <FiUsers /> },
    { title: "Quản lý danh mục", path: "/dashboard/categories", icon: <FiTag /> },
    { title: "Mã giảm giá", path: "/dashboard/coupons", icon: <FiDollarSign /> },
    { title: "Quản lý Blog", path: "/dashboard/blogs", icon: <FiPenTool /> },
    { title: "Cấu hình hệ thống", path: "/dashboard/settings", icon: <FiSettings /> },
  ],
};

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Mặc định role là học viên nếu chưa có, nhưng vào dashboard thì ít nhất phải là admin/operator/instructor
  const role = user?.role || "instructor"; 
  const menu = MENU_ITEMS[role] || MENU_ITEMS.instructor; // Fallback for dev

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* Overlay cho mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="text-xl font-bold text-primary">
            WebCourse
            <span className="text-xs ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
              {role}
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-1">
          {menu.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary-light text-primary font-medium" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="text-lg" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
