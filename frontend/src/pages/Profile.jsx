import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FiUser, FiMail, FiCalendar, FiBookOpen, FiAward, FiEdit2 } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

export default function Profile() {
  const { user } = useAuth();

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

  const stats = [
    { icon: <FiBookOpen size={20} />, value: "3", label: "Khóa học đã đăng ký" },
    { icon: <FiAward size={20} />, value: "1", label: "Chứng chỉ đạt được" },
    { icon: <FiCalendar size={20} />, value: "15", label: "Ngày học liên tiếp" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Trang cá nhân" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-80 shrink-0">
            <div className="border border-gray-100 rounded-xl p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mx-auto">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <h2 className="text-xl font-heading font-bold text-secondary mt-4">{user.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              <button className="mt-5 px-6 py-2.5 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-primary-light transition-colors flex items-center gap-2 mx-auto">
                <FiEdit2 size={14} /> Chỉnh sửa hồ sơ
              </button>
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
                    <span className="text-sm text-secondary">20 Tháng 4, 2026</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Vai trò</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FiAward size={16} className="text-gray-400" />
                    <span className="text-sm text-secondary">Học viên</span>
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
