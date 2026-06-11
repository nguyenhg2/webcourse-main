import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiAward, FiBookOpen, FiCalendar, FiEdit2, FiMail, FiUser } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { useAuth } from "../context/AuthContext";
import { getProfileAPI } from "../services/api";

const ROLE_LABELS = {
  student: "Học viên",
  instructor: "Giảng viên",
  operator: "Vận hành",
  admin: "Quản trị viên",
};

function buildStats(role, stats = {}) {
  if (role === "instructor") {
    return [
      { icon: <FiBookOpen size={20} />, value: stats.courses || 0, label: "Khóa học phụ trách" },
      { icon: <FiUser size={20} />, value: stats.students || 0, label: "Học viên theo học" },
      { icon: <FiAward size={20} />, value: stats.average_rating || 0, label: "Đánh giá trung bình" },
    ];
  }

  if (role === "operator") {
    return [
      { icon: <FiBookOpen size={20} />, value: stats.orders || 0, label: "Giao dịch xử lý" },
      { icon: <FiAward size={20} />, value: stats.completed_orders || 0, label: "Đơn hoàn tất" },
      { icon: <FiCalendar size={20} />, value: stats.pending_orders || 0, label: "Đơn đang chờ" },
    ];
  }

  if (role === "admin") {
    return [
      { icon: <FiUser size={20} />, value: stats.roles || 0, label: "Vai trò quản lý" },
      { icon: <FiBookOpen size={20} />, value: stats.courses || 0, label: "Khóa học hệ thống" },
      { icon: <FiAward size={20} />, value: stats.users || 0, label: "Người dùng" },
    ];
  }

  return [
    { icon: <FiBookOpen size={20} />, value: stats.enrolled_courses || 0, label: "Khóa học đã đăng ký" },
    { icon: <FiAward size={20} />, value: stats.completed_courses || 0, label: "Khóa học hoàn thành" },
    { icon: <FiCalendar size={20} />, value: stats.learning_days || 0, label: "Ngày có tiến độ học" },
  ];
}

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    getProfileAPI()
      .then((data) => {
        if (mounted) {
          setProfile(data);
          setError("");
        }
      })
      .catch(() => {
        if (mounted) {
      setError("Không tải được dữ liệu hồ sơ từ cơ sở dữ liệu.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const user = profile?.user || authUser;
  const roleLabel = ROLE_LABELS[user?.role] || user?.role;
  const stats = useMemo(() => buildStats(user?.role, profile?.stats), [user?.role, profile?.stats]);
  const joinedAt = user?.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "Chưa có dữ liệu";

  if (loading) {
    return (
      <>
        <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Trang cá nhân" }]} />
        <div className="max-w-lg mx-auto px-5 py-20 text-center text-gray-600">Đang tải dữ liệu hồ sơ...</div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Trang cá nhân" }]} />
        <div className="max-w-lg mx-auto px-5 py-20 text-center">
          <FiUser size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold text-secondary">Bạn chưa đăng nhập</h2>
          <p className="text-gray-600 mt-3">Vui lòng đăng nhập để xem trang cá nhân.</p>
          <Link to="/dang-nhap" className="inline-block mt-6 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Trang cá nhân" }]} />
      <div className="max-w-322.5 mx-auto px-5 py-10">
        {error && <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-80 shrink-0">
            <div className="border border-gray-100 rounded-xl p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mx-auto overflow-hidden">
                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name?.charAt(0)?.toUpperCase()}
              </div>
              <h2 className="text-xl font-heading font-bold text-secondary mt-4">{user.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-semibold">
                {roleLabel}
              </span>
              <button className="mt-5 px-6 py-2.5 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-primary-light transition-colors flex items-center gap-2 mx-auto">
                <FiEdit2 size={14} /> Chỉnh sửa hồ sơ
              </button>
              {user.role !== "student" && (
                <Link to="/dashboard" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                  {"V\u00e0o b\u1ea3ng \u0111i\u1ec1u khi\u1ec3n"}
                </Link>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className="border border-gray-100 rounded-xl p-6 text-center">
                  <span className="text-primary mx-auto flex justify-center">{stat.icon}</span>
                  <p className="text-2xl font-heading font-bold text-secondary mt-3">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="border border-gray-100 rounded-xl p-8">
              <h3 className="text-lg font-heading font-semibold text-secondary mb-6">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Họ và tên</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FiUser size={16} className="text-gray-400" />
                    <span className="text-sm text-secondary">{user.name}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Email</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FiMail size={16} className="text-gray-400" />
                    <span className="text-sm text-secondary">{user.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Ngày tham gia</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FiCalendar size={16} className="text-gray-400" />
                    <span className="text-sm text-secondary">{joinedAt}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Vai trò</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FiAward size={16} className="text-gray-400" />
                    <span className="text-sm text-secondary">{roleLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
