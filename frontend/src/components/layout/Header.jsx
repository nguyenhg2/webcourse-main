import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiPhone, FiMail, FiSearch, FiMenu, FiX, FiChevronDown, FiUser, FiBookOpen, FiLogOut } from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/khoa-hoc", label: "Khóa học" },
  { to: "/blog", label: "Blog" },
  { to: "/lien-he", label: "Liên hệ" },
  { to: "/faq", label: "FAQ" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="bg-gray-900 text-white text-sm hidden lg:block">
        <div className="max-w-[1290px] mx-auto px-5 flex items-center justify-between h-12">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <FiPhone size={14} /> +(123) 2500-567-8988
            </span>
            <span className="flex items-center gap-2">
              <FiMail size={14} /> supportlms@gmail.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors"><FaFacebookF size={14} /></a>
            <a href="#" className="hover:text-primary transition-colors"><FaTwitter size={14} /></a>
            <a href="#" className="hover:text-primary transition-colors"><FaLinkedinIn size={14} /></a>
            <a href="#" className="hover:text-primary transition-colors"><FaInstagram size={14} /></a>
          </div>
        </div>
      </div>

      <div className="max-w-[1290px] mx-auto px-5 flex items-center justify-between h-20">
        <Link to="/" className="text-2xl font-heading font-bold text-primary">
          CodeCamp
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-base font-medium transition-colors ${
                  isActive ? "text-primary" : "text-secondary hover:text-primary"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-primary transition-colors">
            <FiSearch size={20} />
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-primary transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-secondary">{user.name}</span>
                <FiChevronDown size={16} className="text-gray-500" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50">
                  <Link
                    to="/trang-ca-nhan"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-gray-50 transition-colors"
                  >
                    <FiUser size={16} /> Trang cá nhân
                  </Link>
                  <Link
                    to="/khoa-hoc-cua-toi"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-gray-50 transition-colors"
                  >
                    <FiBookOpen size={16} /> Khóa học của tôi
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <FiLogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/dang-nhap"
                className="px-5 py-2.5 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-orange-600 transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 text-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-5 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `text-base font-medium py-2 ${
                  isActive ? "text-primary" : "text-secondary"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <hr className="border-gray-100" />
          {user ? (
            <>
              <div className="flex items-center gap-3 py-2">
                <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
                <span className="font-medium text-secondary">{user.name}</span>
              </div>
              <Link to="/trang-ca-nhan" onClick={() => setMobileOpen(false)} className="text-sm text-secondary py-2">
                Trang cá nhân
              </Link>
              <Link to="/khoa-hoc-cua-toi" onClick={() => setMobileOpen(false)} className="text-sm text-secondary py-2">
                Khóa học của tôi
              </Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="text-sm text-error py-2 text-left"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/dang-nhap"
                onClick={() => setMobileOpen(false)}
                className="text-center px-5 py-2.5 text-sm font-semibold text-primary border border-primary rounded-lg"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                onClick={() => setMobileOpen(false)}
                className="text-center px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
