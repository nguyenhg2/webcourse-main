import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiCheckCircle, FiDollarSign, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboardAPI, getAdminOrdersAPI, getCoursesAPI, getDashboardOverviewAPI } from "../../services/api";

const currency = (value) => Number(value || 0).toLocaleString("vi-VN") + "đ";

const STATUS_LABELS = {
  completed: "Hoàn tất",
  pending: "Đang chờ",
  failed: "Thất bại",
  draft: "Nháp",
  pending_review: "Chờ duyệt",
  published: "Đã xuất bản",
  rejected: "Cần sửa",
};

function statusLabel(status) {
  return STATUS_LABELS[status] || status || "";
}

function buildTopPurchasedCourses(orders = []) {
  const byCourse = new Map();

  orders
    .filter((order) => order.status === "completed")
    .forEach((order) => {
      const courses = order.courses || [];
      const revenueShare = courses.length ? Number(order.final_amount || 0) / courses.length : 0;

      courses.forEach((course) => {
        const id = course._id || course.id;
        if (!id) return;

        const current = byCourse.get(id) || {
          _id: id,
          title: course.title || id,
          purchases: 0,
          revenue: 0,
        };
        current.purchases += 1;
        current.revenue += revenueShare;
        byCourse.set(id, current);
      });
    });

  return Array.from(byCourse.values())
    .sort((a, b) => b.purchases - a.purchases)
    .slice(0, 5);
}

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
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (role === "admin") {
      getAdminDashboardAPI()
        .then((data) => {
          setStats(data || {});
          const topCourses = data?.topCourses || [];
          setItems(topCourses);

          return getAdminOrdersAPI()
            .then((orders) => {
              setRecentOrders((orders || []).slice(0, 5));
              if (topCourses.length === 0) {
                setItems(buildTopPurchasedCourses(orders));
              }
            })
            .catch(() => {
              setRecentOrders([]);
              if (topCourses.length === 0) setItems([]);
            });
        })
        .catch(() => {
          setStats({});
          setItems([]);
          setRecentOrders([]);
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

      {role === "admin" ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Khóa học có lượt mua nhiều</h2>
            <div className="divide-y divide-gray-100">
              {items.length === 0 && <p className="text-sm text-gray-500 py-8">Chưa có dữ liệu hiển thị.</p>}
              {items.map((item) => (
                <div key={item.id || item._id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.title || item.id || item._id}</p>
                    <p className="text-sm text-gray-500 mt-1">Doanh thu: {currency(item.revenue)}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{item.purchases || 0} lượt mua</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Đơn hàng gần đây</h2>
            <div className="divide-y divide-gray-100">
              {recentOrders.length === 0 && <p className="text-sm text-gray-500 py-8">Chưa có dữ liệu hiển thị.</p>}
              {recentOrders.map((order) => (
                <div key={order.id || order._id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.user?.name || order.user?.email || order.id || order._id}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.created_at ? new Date(order.created_at * 1000).toLocaleDateString("vi-VN") : "Chưa có ngày"} · {statusLabel(order.status)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{currency(order.final_amount ?? order.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {role === "operator" ? "Giao dịch gần đây" : role === "student" ? "Khóa học đang học" : "Mục cần theo dõi"}
          </h2>
          <div className="divide-y divide-gray-100">
            {items.length === 0 && <p className="text-sm text-gray-500 py-8">Chưa có dữ liệu hiển thị.</p>}
            {items.map((item) => (
              <div key={item.id || item._id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {role === "operator"
                      ? item.user?.name || item.user?.email || "Khách hàng"
                      : item.title || item.id || item._id}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {role === "operator"
                      ? `${(item.courses || []).map((course) => course.title).join(", ") || "Chưa có tên khóa học"} · ${statusLabel(item.status)}`
                      : item.status ? statusLabel(item.status) : (item.progress !== undefined ? item.progress + "% hoàn thành" : `${item.course_ids?.length || 0} khóa`)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {role === "operator" ? currency(item.final_amount ?? item.amount) : item.amount ? currency(item.amount) : item.level || item.card_brand || ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
