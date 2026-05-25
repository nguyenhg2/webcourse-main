<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboardAPI, getAdminRevenueAPI } from "../../services/api";
import { FiTrendingUp, FiUsers, FiBookOpen, FiDollarSign, FiShoppingCart } from "react-icons/fi";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
=======
import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiCheckCircle, FiDollarSign, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboardAPI, getAllPaymentsAPI, getCoursesAPI, getMyCoursesAPI } from "../../services/api";

const currency = (value) => Number(value || 0).toLocaleString("vi-VN") + "đ";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4">
>>>>>>> df6819dc9fe670909e229ab5a69973dbbdfa8d57
    <div className={`p-4 rounded-lg text-white ${color}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export default function DashboardOverview() {
  const { user } = useAuth();
<<<<<<< HEAD
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
=======
  const role = user?.role || "student";
  const [stats, setStats] = useState({});
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (role === "admin") {
      getAdminDashboardAPI().then(setStats).catch(() => setStats({}));
      return;
    }

    if (role === "operator") {
      getAllPaymentsAPI()
        .then((data) => {
          const payments = data.payments || [];
          setItems(payments.slice(0, 5));
          setStats({
            revenue: payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + Number(p.amount || 0) - Number(p.coupon_discount || 0), 0),
            orders: payments.length,
            completedOrders: payments.filter((p) => p.status === "completed").length,
            pendingOrders: payments.filter((p) => p.status === "pending").length,
          });
        })
        .catch(() => setStats({}));
      return;
    }

    if (role === "instructor") {
      getCoursesAPI()
        .then((courses) => {
          const mine = courses.filter((course) => !user?._id || course.instructor_id === user._id);
          const visible = mine.length ? mine : courses;
          setItems(visible.slice(0, 5));
          setStats({
            courses: visible.length,
            students: visible.reduce((sum, course) => sum + Number(course.total_students || 0), 0),
            rating: visible.length ? (visible.reduce((sum, course) => sum + Number(course.rating || 0), 0) / visible.length).toFixed(1) : "0.0",
            published: visible.filter((course) => course.status === "published").length,
          });
        })
        .catch(() => setStats({}));
      return;
    }

    getMyCoursesAPI()
      .then((courses) => {
        setItems(courses.slice(0, 5));
        setStats({
          courses: courses.length,
          completed: courses.filter((course) => Number(course.progress || 0) >= 100).length,
          progress: courses.length ? Math.round(courses.reduce((sum, course) => sum + Number(course.progress || 0), 0) / courses.length) : 0,
          lessons: courses.reduce((sum, course) => sum + Number(course.completedLessons || 0), 0),
        });
      })
      .catch(() => setStats({}));
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
>>>>>>> df6819dc9fe670909e229ab5a69973dbbdfa8d57

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
<<<<<<< HEAD
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
=======
        <p className="text-gray-500 mt-1">Chào mừng trở lại, {user?.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(([title, value, icon, color]) => (
          <StatCard key={title} title={title} value={value} icon={icon} color={color} />
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
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
>>>>>>> df6819dc9fe670909e229ab5a69973dbbdfa8d57
    </div>
  );
}
