import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiCheckCircle, FiDollarSign, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboardAPI, getCoursesAPI, getDashboardOverviewAPI } from "../../services/api";

const currency = (value) => Number(value || 0).toLocaleString("vi-VN") + "đ";

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
  const role = user?.role || "student";
  const [stats, setStats] = useState({});
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (role === "admin") {
      getAdminDashboardAPI()
        .then((data) => {
          setStats(data || {});
          setItems([]);
        })
        .catch(() => {
          setStats({});
          setItems([]);
        });
      return;
    }

    getDashboardOverviewAPI()
      .then((data) => {
        const nextStats = data.stats || {};
        setStats(nextStats);
        setItems(data.items || []);

        if (role === "instructor" && !nextStats.courses) {
          return getCoursesAPI().then((courses) => {
            const visible = courses.filter((course) => !user?._id || course.instructor_id === user._id);
            const fallback = visible.length ? visible : courses;
            setItems(fallback.slice(0, 5));
            setStats({
              courses: fallback.length,
              students: fallback.reduce((sum, course) => sum + Number(course.total_students || 0), 0),
              rating: fallback.length ? (fallback.reduce((sum, course) => sum + Number(course.rating || 0), 0) / fallback.length).toFixed(1) : "0.0",
              published: fallback.filter((course) => course.status === "published").length,
            });
          });
        }
      })
      .catch(() => {
        if (role !== "instructor") {
          setStats({});
          setItems([]);
          return;
        }

        getCoursesAPI()
          .then((courses) => {
            const visible = courses.filter((course) => !user?._id || course.instructor_id === user._id);
            const fallback = visible.length ? visible : courses;
            setItems(fallback.slice(0, 5));
            setStats({
              courses: fallback.length,
              students: fallback.reduce((sum, course) => sum + Number(course.total_students || 0), 0),
              rating: fallback.length ? (fallback.reduce((sum, course) => sum + Number(course.rating || 0), 0) / fallback.length).toFixed(1) : "0.0",
              published: fallback.filter((course) => course.status === "published").length,
            });
          })
          .catch(() => {
            setStats({});
            setItems([]);
          });
      });
  }, [role, user?._id]);

  const cards = useMemo(() => {
    if (role === "admin") {
      return [
        ["Tổng doanh thu", currency(stats.revenue), <FiDollarSign size={24} />, "bg-emerald-500"],
        ["Học viên", stats.students || 0, <FiUsers size={24} />, "bg-blue-500"],
        ["Khóa học", stats.courses || 0, <FiBookOpen size={24} />, "bg-purple-500"],
        ["Đơn hoàn tất", stats.completedOrders || 0, <FiCheckCircle size={24} />, "bg-orange-500"],
      ];
    }
    if (role === "operator") {
      return [
        ["Doanh thu xử lý", currency(stats.revenue), <FiDollarSign size={24} />, "bg-emerald-500"],
        ["Tổng đơn hàng", stats.orders || 0, <FiBookOpen size={24} />, "bg-blue-500"],
        ["Đã hoàn tất", stats.completedOrders || 0, <FiCheckCircle size={24} />, "bg-purple-500"],
        ["Đang chờ", stats.pendingOrders || 0, <FiTrendingUp size={24} />, "bg-orange-500"],
      ];
    }
    if (role === "instructor") {
      return [
        ["Khóa học", stats.courses || 0, <FiBookOpen size={24} />, "bg-purple-500"],
        ["Học viên", stats.students || 0, <FiUsers size={24} />, "bg-blue-500"],
        ["Điểm trung bình", stats.rating || "0.0", <FiTrendingUp size={24} />, "bg-emerald-500"],
        ["Đã xuất bản", stats.published || 0, <FiCheckCircle size={24} />, "bg-orange-500"],
      ];
    }
    return [
      ["Khóa học của tôi", stats.courses || 0, <FiBookOpen size={24} />, "bg-purple-500"],
      ["Đã hoàn thành", stats.completed || 0, <FiCheckCircle size={24} />, "bg-emerald-500"],
      ["Tiến độ TB", (stats.progress || 0) + "%", <FiTrendingUp size={24} />, "bg-orange-500"],
      ["Bài đã học", stats.lessons || 0, <FiUsers size={24} />, "bg-blue-500"],
    ];
  }, [role, stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-500 mt-1">Chào mừng trở lại, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(([title, value, icon, color]) => (
          <StatCard key={title} title={title} value={value} icon={icon} color={color} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          {role === "operator" ? "Giao dịch gần đây" : role === "student" ? "Khóa học đang học" : "Mục cần theo dõi"}
        </h2>
        <div className="divide-y divide-gray-100">
          {items.length === 0 && <p className="text-sm text-gray-500 py-8">Chưa có dữ liệu hiển thị.</p>}
          {items.map((item) => (
            <div key={item.id || item._id} className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{item.title || item.id || item._id}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {item.status || (item.progress !== undefined ? item.progress + "% hoàn thành" : `${item.course_ids?.length || 0} khóa`)}
                </p>
              </div>
              <span className="text-sm font-semibold text-primary">{item.amount ? currency(item.amount) : item.level || item.card_brand || ""}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
