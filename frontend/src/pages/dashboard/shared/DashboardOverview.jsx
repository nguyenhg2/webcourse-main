import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiCheckCircle, FiClock, FiDollarSign, FiStar, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { getAdminDashboardAPI, getCoursesAPI, getDashboardOverviewAPI } from "../../../services/api";

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

const ROLE_META = {
  admin: {
    title: "Báo cáo điều hành CodeCamp",
    actions: [
      { label: "Quản lý người dùng", to: "/dashboard/users" },
      { label: "Xem đơn hàng", to: "/dashboard/payments" },
      { label: "Tạo mã giảm giá", to: "/dashboard/coupons" },
    ],
  },
  operator: {
    title: "Không gian vận hành",
    actions: [
      { label: "Kiểm duyệt khóa học", to: "/dashboard/course-reviews" },
      { label: "Hỗ trợ thanh toán", to: "/dashboard/payments" },
      { label: "Xử lý khiếu nại", to: "/dashboard/complaints" },
    ],
  },
  instructor: {
    title: "Trung tâm giảng viên",
    actions: [
      { label: "Tạo khóa học", to: "/dashboard/courses#create-course" },
      { label: "Quản lý bài học", to: "/dashboard/courses" },
      { label: "Xem học viên", to: "/dashboard/instructor-students" },
    ],
  },
};

function statusLabel(status) {
  return STATUS_LABELS[status] || status || "Không rõ";
}

function statValue(value, fallback = 0) {
  return value === undefined || value === null || value === "" ? fallback : value;
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
        const current = byCourse.get(id) || { _id: id, title: course.title || id, purchases: 0, revenue: 0 };
        current.purchases += 1;
        current.revenue += revenueShare;
        byCourse.set(id, current);
      });
    });

  return Array.from(byCourse.values()).sort((a, b) => b.purchases - a.purchases).slice(0, 5);
}

function StatCard({ title, value, icon, tone }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>{icon}</span>
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function EmptyState({ text = "Chưa có dữ liệu hiển thị." }) {
  return <div className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">{text}</div>;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const role = user?.role;
  const meta = ROLE_META[role] || ROLE_META.instructor;
  const [stats, setStats] = useState({});
  const [items, setItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!["admin", "operator", "instructor"].includes(role)) {
      setLoading(false);
      return;
    }

    setLoading(true);

    if (role === "admin") {
      getAdminDashboardAPI()
        .then((data) => {
          setStats(data || {});
          const topCourses = data?.topCourses || [];
          setItems(topCourses);
          const orders = Array.isArray(data?.recentOrders) ? data.recentOrders : [];
          setRecentOrders(orders);
          if (!topCourses.length) setItems(buildTopPurchasedCourses(orders));
        })
        .catch(() => {
          setStats({});
          setItems([]);
          setRecentOrders([]);
        })
        .finally(() => setLoading(false));
      return;
    }

    getDashboardOverviewAPI()
      .then((data) => {
        const nextStats = data?.stats || {};
        setStats(nextStats);
        setItems(data?.items || []);

        if (role === "instructor" && !nextStats.courses) {
          return getCoursesAPI({ manage: true }).then((courses) => {
            const list = Array.isArray(courses) ? courses : [];
            const visible = list.filter((course) => !user?._id || course.instructor_id === user._id);
            const fallback = visible.length ? visible : list;
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
        setStats({});
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [role, user?._id]);

  const cards = useMemo(() => {
    if (role === "admin") {
      return [
        ["Tổng doanh thu", currency(stats.revenue), <FiDollarSign size={20} />, "bg-emerald-50 text-emerald-600"],
        ["Học viên", statValue(stats.students), <FiUsers size={20} />, "bg-blue-50 text-blue-600"],
        ["Khóa học", statValue(stats.courses), <FiBookOpen size={20} />, "bg-violet-50 text-violet-600"],
        ["Đơn hoàn tất", statValue(stats.completedOrders), <FiCheckCircle size={20} />, "bg-orange-50 text-orange-600"],
      ];
    }
    if (role === "operator") {
      return [
        ["Doanh thu xử lý", currency(stats.revenue), <FiDollarSign size={20} />, "bg-emerald-50 text-emerald-600"],
        ["Tổng giao dịch", statValue(stats.orders), <FiBookOpen size={20} />, "bg-blue-50 text-blue-600"],
        ["Hoàn tất", statValue(stats.completedOrders), <FiCheckCircle size={20} />, "bg-violet-50 text-violet-600"],
        ["Cần xử lý", statValue(stats.openComplaints ?? stats.pendingOrders), <FiClock size={20} />, "bg-orange-50 text-orange-600"],
      ];
    }
    return [
      ["Khóa học", statValue(stats.courses), <FiBookOpen size={20} />, "bg-violet-50 text-violet-600"],
      ["Học viên", statValue(stats.students), <FiUsers size={20} />, "bg-blue-50 text-blue-600"],
      ["Điểm trung bình", statValue(stats.rating, "0.0"), <FiStar size={20} />, "bg-emerald-50 text-emerald-600"],
      ["Đã xuất bản", statValue(stats.published), <FiCheckCircle size={20} />, "bg-orange-50 text-orange-600"],
    ];
  }, [role, stats]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Xin chào, {user?.name}</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{meta.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {meta.actions.map((action) => (
              <Link key={action.to} to={action.to} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary">
                {action.label}
                <FiArrowRight size={15} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, value, icon, tone]) => (
          <StatCard key={title} title={title} value={value} icon={icon} tone={tone} />
        ))}
      </section>

      {role === "admin" ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">Khóa học bán chạy</h2>
              <Link to="/dashboard/payments" className="text-sm font-semibold text-primary">Xem đơn hàng</Link>
            </div>
            {loading ? <EmptyState text="Đang tải dữ liệu..." /> : items.length === 0 ? <EmptyState /> : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id || item._id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{item.title || item.id || item._id}</p>
                      <p className="mt-1 text-sm text-gray-500">Doanh thu: {currency(item.revenue)}</p>
                    </div>
                    <span className="rounded-lg bg-primary-light px-3 py-1 text-sm font-semibold text-primary">{item.purchases || 0} lượt mua</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
              <Link to="/dashboard/payments" className="text-sm font-semibold text-primary">Quản lý</Link>
            </div>
            {loading ? <EmptyState text="Đang tải dữ liệu..." /> : recentOrders.length === 0 ? <EmptyState /> : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div key={order.id || order._id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{order.user?.name || order.user?.email || order.id || order._id}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {order.created_at ? new Date(order.created_at * 1000).toLocaleDateString("vi-VN") : "Chưa có ngày"} · {statusLabel(order.status)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{currency(order.final_amount ?? order.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">
              {role === "operator" ? "Giao dịch cần theo dõi" : "Khóa học cần theo dõi"}
            </h2>
            <FiTrendingUp className="text-primary" size={18} />
          </div>
          {loading ? <EmptyState text="Đang tải dữ liệu..." /> : items.length === 0 ? <EmptyState /> : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id || item._id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {role === "operator" ? item.user?.name || item.user?.email || "Khách hàng" : item.title || item.id || item._id}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {role === "operator"
                        ? `${(item.courses || []).map((course) => course.title).join(", ") || "Chưa có tên khóa học"} · ${statusLabel(item.status)}`
                        : item.progress !== undefined ? item.progress + "% hoàn thành" : item.status ? statusLabel(item.status) : `${item.course_ids?.length || 0} khóa`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {role === "operator" ? currency(item.final_amount ?? item.amount) : item.amount ? currency(item.amount) : item.level || item.card_brand || ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
