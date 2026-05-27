import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { useAuth } from "../context/AuthContext";

const ROLE_LOGIN_CONFIG = {
  student: {
    title: "Đăng nhập học viên",
    breadcrumb: "Đăng nhập học viên",
    path: "/dang-nhap",
    redirect: "/khoa-hoc-cua-toi",
  },
  admin: {
    title: "Đăng nhập quản trị",
    breadcrumb: "Đăng nhập quản trị",
    path: "/admin/dang-nhap",
    redirect: "/dashboard",
  },
  instructor: {
    title: "Đăng nhập giảng viên",
    breadcrumb: "Đăng nhập giảng viên",
    path: "/giang-vien/dang-nhap",
    redirect: "/dashboard",
  },
  operator: {
    title: "Đăng nhập vận hành",
    breadcrumb: "Đăng nhập vận hành",
    path: "/operator/dang-nhap",
    redirect: "/dashboard",
  },
};

export default function Login({ expectedRole = null }) {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const loginConfig = expectedRole
    ? ROLE_LOGIN_CONFIG[expectedRole] || ROLE_LOGIN_CONFIG.student
    : { title: "Đăng nhập", breadcrumb: "Đăng nhập" };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password, expectedRole);
      navigate(ROLE_LOGIN_CONFIG[user.role]?.redirect || "/dashboard");
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? "Tài khoản không có quyền truy cập."
          : err.response?.data?.detail || "Email hoặc mật khẩu không đúng";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Breadcrumb
        items={[{ label: "Trang chủ", to: "/" }, { label: loginConfig.breadcrumb }]}
      />
      <div className="max-w-md mx-auto px-5 py-16">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-8 text-center">
          {loginConfig.title}
        </h1>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email *"
            required
            className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors"
          />
          <div className="relative">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
            placeholder="Mật khẩu *"
              required
              className="w-full px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="accent-primary"
              />
              Ghi nhớ đăng nhập
            </label>
            <Link to="#" className="text-sm text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {submitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Chưa có tài khoản?{" "}
          <Link
            to="/dang-ky"
            className="text-primary font-medium hover:underline"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </>
  );
}
