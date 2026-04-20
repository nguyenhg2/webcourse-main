import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Dang nhap thanh cong!");
  };

  return (
    <section className="bg-white">
      <Breadcrumb items={[{ label: "Trang chu", to: "/" }, { label: "Dang nhap" }]} />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[630px] p-7 bg-white rounded-[20px] border border-gray-200 flex flex-col gap-7"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Dang nhap</h2>
              <p className="text-gray-500 text-sm">
                Chua co tai khoan?{" "}
                <Link to="/dang-ky" className="text-primary font-medium hover:underline">
                  Dang ky ngay
                </Link>
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email hoac ten dang nhap *"
                  required
                  className="w-full h-12 px-4 rounded-lg border border-gray-400 text-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mat khau *"
                  required
                  className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-400 text-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-gray-600 text-lg">Ghi nho dang nhap</span>
              </label>

              <button
                type="submit"
                className="h-12 bg-primary text-white text-lg font-medium rounded-full hover:bg-primary/90 transition"
              >
                Dang nhap
              </button>

              <Link to="#" className="text-gray-900 text-lg hover:text-primary transition">
                Quen mat khau?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
