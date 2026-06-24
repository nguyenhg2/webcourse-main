import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setSubmitting(true);

    try {
      const user = await register(form.username, form.email, form.password);
      if (user.role === "student") {
        navigate("/khoa-hoc-cua-toi");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Đăng ký thất bại";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Breadcrumb
        items={[{ label: "Trang chủ", to: "/" }, { label: "Đăng ký" }]}
      />
      <div className="max-w-md mx-auto px-5 py-16">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-8 text-center">
          Đăng ký
        </h1>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Tên người dùng *"
            required
            className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors"
          />
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
          <div className="relative">
            <input
              name="confirm"
              type={showCf ? "text" : "password"}
              value={form.confirm}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu *"
              required
              className="w-full px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowCf(!showCf)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showCf ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {submitting ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <Link
            to="/dang-nhap"
            className="text-primary font-medium hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </>
  );
}
