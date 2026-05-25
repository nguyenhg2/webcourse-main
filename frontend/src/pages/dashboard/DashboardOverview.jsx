import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboardAPI, getAdminRevenueAPI } from "../../services/api";
import { FiTrendingUp, FiUsers, FiBookOpen, FiDollarSign, FiShoppingCart } from "react-icons/fi";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-lg text-white ${color}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      Promise.all([getAdminDashboardAPI(), getAdminRevenueAPI()])
        .then(([s, r]) => { setStats(s); setRevenue(r); })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-500 mt-1">Chào mừng trở lại, {user?.name}!</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard title="Tổng doanh thu" value={fmt(stats?.revenue) + "đ"} icon={<FiDollarSign size={24} />} color="bg-emerald-500" />
            <StatCard title="Tổng học viên" value={fmt(stats?.students)} icon={<FiUsers size={24} />} color="bg-blue-500" />
            <StatCard title="Tổng khóa học" value={fmt(stats?.courses)} icon={<FiBookOpen size={24} />} color="bg-purple-500" />
            <StatCard title="Tổng đơn hàng" value={fmt(stats?.orders)} icon={<FiShoppingCart size={24} />} color="bg-orange-500" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Doanh thu theo tháng</h2>
              {revenue.length === 0 ? (
                <p className="text-gray-400 text-center py-10">Chưa có dữ liệu</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="text-left p-3">Tháng</th>
                        <th className="text-left p-3">Doanh thu</th>
                        <th className="text-left p-3">Đơn hàng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {revenue.slice().reverse().map((r) => (
                        <tr key={r.month}>
                          <td className="p-3 font-medium">{r.month}</td>
                          <td className="p-3 text-emerald-600 font-semibold">{fmt(r.revenue)}đ</td>
                          <td className="p-3">{r.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Thống kê hệ thống</h2>
              <div className="space-y-4">
                {[
                  { label: "Tổng người dùng", value: fmt(stats?.users) },
                  { label: "Học viên", value: fmt(stats?.students) },
                  { label: "Khóa học", value: fmt(stats?.courses) },
                  { label: "Lượt đăng ký", value: fmt(stats?.enrollments) },
                  { label: "Đơn hoàn thành", value: fmt(stats?.completedOrders) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
