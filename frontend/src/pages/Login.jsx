import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    login({ name: form.email.split("@")[0], email: form.email });
    navigate("/");
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Đăng nhập" }]} />
      <div className="max-w-md mx-auto px-5 py-16">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-8 text-center">Đăng nhập</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email hoặc tên đăng nhập *"
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
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="accent-primary" />
              Ghi nhớ đăng nhập
            </label>
            <Link to="#" className="text-sm text-primary hover:underline">Quên mật khẩu?</Link>
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Đăng nhập
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Chưa có tài khoản?{" "}
          <Link to="/dang-ky" className="text-primary font-medium hover:underline">Đăng ký</Link>
        </p>
      </div>
    </>
  );
}
