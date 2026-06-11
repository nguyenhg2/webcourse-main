import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiBookOpen, FiChevronDown, FiLogOut, FiMenu, FiSearch, FiShoppingCart, FiUser, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/khoa-hoc", label: "Khóa học" },
  { to: "/lo-trinh", label: "Lộ trình" },
  { to: "/blog", label: "Chia sẻ" },
  { to: "/lien-he", label: "Liên hệ" },
  { to: "/faq", label: "Câu hỏi" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, cartCount } = useAuth();
  const isStudent = !user || user.role === "student";

  const linkClass = ({ isActive }) =>
    `text-base font-medium transition-colors ${isActive ? "text-primary" : "text-secondary hover:text-primary"}`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-322.5 mx-auto px-5 flex items-center justify-between h-15">
        <Link to="/" className="text-2xl font-heading font-bold text-primary">
          CodeCamp
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-primary transition-colors">
            <FiSearch size={20} />
          </button>
          {isStudent && (
            <Link to="/gio-hang" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[11px] font-semibold flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-secondary">{user.name}</span>
                <FiChevronDown size={16} className="text-gray-500" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-100 shadow-lg py-2 z-50">
                  <Link to="/trang-ca-nhan" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-gray-50">
                    <FiUser size={16} /> Trang cá nhân
                  </Link>
                  <Link to="/khoa-hoc-cua-toi" onClick={() => setDropdownOpen(false)} className={`${user.role === "student" ? "flex" : "hidden"} items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-gray-50`}>
                    <FiBookOpen size={16} /> Khóa học của tôi
                  </Link>
                  {user.role !== "student" && (
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-gray-50">
                      <FiBookOpen size={16} /> Bảng điều khiển
                    </Link>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => { logout(); setDropdownOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-gray-50 w-full text-left">
                    <FiLogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/dang-nhap" className="px-5 py-2.5 text-sm font-semibold text-primary rounded-full hover:bg-primary-light transition-colors">
                Đăng nhập
              </Link>
              <Link to="/dang-ky" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-orange-600 transition-colors">
                Đăng ký
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden p-2 text-secondary" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-5 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} onClick={() => setMobileOpen(false)} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          {isStudent && <Link to="/gio-hang" onClick={() => setMobileOpen(false)} className="text-base font-medium text-secondary">
            Giỏ hàng
          </Link>}
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link to="/trang-ca-nhan" onClick={() => setMobileOpen(false)} className="text-sm text-secondary py-2">Trang cá nhân</Link>
              {user.role === "student" && <Link to="/khoa-hoc-cua-toi" onClick={() => setMobileOpen(false)} className="text-sm text-secondary py-2">Khóa học của tôi</Link>}
              {user.role !== "student" && <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm text-secondary py-2">Bảng điều khiển</Link>}
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm text-error py-2 text-left">Đăng xuất</button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/dang-nhap" onClick={() => setMobileOpen(false)} className="text-center px-5 py-2.5 font-semibold text-primary rounded-full">Đăng nhập</Link>
              <Link to="/dang-ky" onClick={() => setMobileOpen(false)} className="text-center px-5 py-2.5 font-semibold text-white bg-primary rounded-full">Đăng ký</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
