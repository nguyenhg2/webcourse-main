import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

export default function Register() {
  const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Mat khau xac nhan khong khop!");
      return;
    }
    alert("Dang ky thanh cong!");
  };

  return (
    <section className="bg-white">
      <Breadcrumb items={[{ label: "Trang chu", to: "/" }, { label: "Dang ky" }]} />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[630px] p-7 bg-white rounded-[20px] border border-gray-200 flex flex-col gap-7"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Dang ky</h2>
              <p className="text-gray-500 text-sm">
                Da co tai khoan?{" "}
                <Link to="/dang-nhap" className="text-primary font-medium hover:underline">
                  Dang nhap
                </Link>
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email *"
                  required
                  className="w-full h-12 px-4 rounded-lg border border-gray-400 text-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Ten dang nhap *"
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

              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xac nhan mat khau *"
                  required
                  className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-400 text-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPw ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                className="h-12 bg-primary text-white text-lg font-medium rounded-full hover:bg-primary/90 transition"
              >
                Dang ky
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
