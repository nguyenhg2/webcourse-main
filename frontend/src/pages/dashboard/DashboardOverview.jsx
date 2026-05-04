import { useAuth } from "../../context/AuthContext";
import { FiTrendingUp, FiUsers, FiBookOpen, FiDollarSign } from "react-icons/fi";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-lg text-white ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export default function DashboardOverview() {
  const { user } = useAuth();
  const role = user?.role || "instructor";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-500 mt-1">Chào mừng trở lại, {user?.name}!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title={role === "admin" ? "Tổng doanh thu" : "Doanh thu (Tháng)"} 
          value="45.000.000đ" 
          icon={<FiDollarSign size={24} />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title={role === "admin" ? "Tổng học viên" : "Học viên của tôi"} 
          value="1,234" 
          icon={<FiUsers size={24} />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title={role === "admin" ? "Tổng khóa học" : "Khóa học của tôi"} 
          value="45" 
          icon={<FiBookOpen size={24} />} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Tỷ lệ hoàn thành" 
          value="85%" 
          icon={<FiTrendingUp size={24} />} 
          color="bg-orange-500" 
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Biểu đồ thống kê đang được cập nhật...</p>
      </div>
    </div>
  );
}
