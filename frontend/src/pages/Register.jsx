import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    login({ name: form.username, email: form.email });
    navigate("/");
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Đăng ký" }]} />
      <div className="max-w-md mx-auto px-5 py-16">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-8 text-center">Đăng ký tài khoản</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input name="username" value={form.username} onChange={handleChange} placeholder="Tên đăng nhập *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors" />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors" />
          <div className="relative">
            <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Mật khẩu *" required className="w-full px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors pr-12" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <div className="relative">
            <input name="confirm" type={showCf ? "text" : "password"} value={form.confirm} onChange={handleChange} placeholder="Xác nhận mật khẩu *" required className="w-full px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors pr-12" />
            <button type="button" onClick={() => setShowCf(!showCf)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showCf ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">Đăng ký</button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <Link to="/dang-nhap" className="text-primary font-medium hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </>
  );
}
