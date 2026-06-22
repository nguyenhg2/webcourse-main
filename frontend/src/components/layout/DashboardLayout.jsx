import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { FiBell, FiExternalLink, FiMenu, FiSearch } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import DashboardSidebar from "./DashboardSidebar";

const ROLE_LABELS = {
  admin: "Quản trị viên",
  operator: "Nhân viên vận hành",
  instructor: "Giảng viên",
};

const PAGE_TITLES = {
  "/dashboard": "Tổng quan",
  "/dashboard/profile": "Hồ sơ",
  "/dashboard/courses": "Quản lý khóa học",
  "/dashboard/roadmaps": "Quản lý lộ trình",
  "/dashboard/instructor-students": "Học viên theo khóa",
  "/dashboard/course-reviews": "Kiểm duyệt khóa học",
  "/dashboard/reviews": "Kiểm duyệt đánh giá",
  "/dashboard/payments": "Thanh toán",
  "/dashboard/complaints": "Khiếu nại",
  "/dashboard/users": "Người dùng",
  "/dashboard/categories": "Danh mục",
  "/dashboard/coupons": "Mã giảm giá",
  "/dashboard/blogs": "Blog",
  "/dashboard/site-content": "Cấu hình nội dung",
  "/dashboard/contacts": "Liên hệ",
};

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setSidebarOpen(false);
  }, [location.pathname]);

  const pageTitle = useMemo(() => PAGE_TITLES[location.pathname] || "Bảng điều khiển", [location.pathname]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (user.role === "student") {
    return <Navigate to="/khoa-hoc-cua-toi" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-primary lg:hidden">
                <FiMenu size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">{pageTitle}</h1>
                <p className="hidden text-xs font-medium text-gray-500 sm:block">{ROLE_LABELS[user.role] || user.role} · {user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm nhanh trong dashboard"
                  className="h-10 w-72 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                />
              </div>
              <button type="button" className="relative grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary" title="Thông báo">
                <FiBell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </button>
              <Link to="/" className="hidden h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary sm:inline-flex">
                Website
                <FiExternalLink size={15} />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
