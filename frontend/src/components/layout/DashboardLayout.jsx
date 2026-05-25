import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FiBell, FiMenu, FiSearch } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
              <FiMenu size={24} />
            </button>
            <div className="hidden sm:flex relative items-center">
              <FiSearch className="absolute left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all"
              />
            </div>
          </div>

          <button className="relative p-2 text-gray-500 hover:text-primary transition-colors">
            <FiBell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
