import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX, FiSearch, FiPhone, FiMail } from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";

const navLinks = [
  { to: "/", label: "Trang chu" },
  { to: "/khoa-hoc", label: "Khoa hoc" },
  { to: "/blog", label: "Blog" },
  { to: "/lien-he", label: "Lien he" },
  { to: "/faq", label: "FAQ" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="hidden lg:block bg-gray-900 text-gray-300 text-sm">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <FiPhone size={14} />
              (028) 3864 7256
            </span>
            <span className="flex items-center gap-1.5">
              <FiMail size={14} />
              contact@codecamp.vn
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-white transition"><FaFacebookF size={14} /></a>
            <a href="#" className="hover:text-white transition"><FaTwitter size={14} /></a>
            <a href="#" className="hover:text-white transition"><FaInstagram size={14} /></a>
            <a href="#" className="hover:text-white transition"><FaLinkedinIn size={14} /></a>
            <a href="#" className="hover:text-white transition"><FaYoutube size={14} /></a>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            <div className="w-10 h-7 relative">
              <div className="absolute left-0 top-[1px] w-4 h-7 bg-primary rounded-sm" />
              <div className="absolute left-[20px] top-0 w-4 h-7 bg-primary rounded-sm" />
            </div>
            <span className="text-3xl font-bold font-heading text-gray-900">CodeCamp</span>
          </Link>

          <nav className="hidden lg:flex items-center h-16">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `h-16 px-5 flex items-center text-base font-semibold transition ${
                    isActive ? "text-primary bg-gray-50" : "text-gray-900 hover:text-primary"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/dang-nhap"
              className="px-5 py-2 text-primary text-base font-medium border-2 border-primary rounded-full hover:bg-primary hover:text-white transition"
            >
              Dang nhap
            </Link>
            <Link
              to="/dang-ky"
              className="px-5 py-2 bg-primary text-white text-base font-medium rounded-full hover:bg-primary/90 transition"
            >
              Dang ky
            </Link>
            <button className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition">
              <FiSearch size={20} />
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-900"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-semibold transition ${
                      isActive ? "text-primary bg-gray-50" : "text-gray-900 hover:bg-gray-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <Link
                  to="/dang-nhap"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-3 text-primary font-medium border-2 border-primary rounded-full hover:bg-primary hover:text-white transition"
                >
                  Dang nhap
                </Link>
                <Link
                  to="/dang-ky"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition"
                >
                  Dang ky
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
