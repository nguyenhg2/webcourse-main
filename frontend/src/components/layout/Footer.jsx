import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-[1290px] mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-gray-700">
          <div>
            <Link to="/" className="text-2xl font-heading font-bold text-white">
              CodeCamp
            </Link>
            <p className="mt-4 text-sm leading-6">
              Nền tảng học lập trình trực tuyến hàng đầu Việt Nam với hàng trăm khóa học chất lượng cao.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-5">NHẬN GIÚP ĐỠ</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link to="/lien-he" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Bài viết</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-5">CHƯƠNG TRÌNH</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">CNTT & Phần mềm</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điện toán đám mây</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ứng dụng di động</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-5">LIÊN HỆ</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>236 Hoàng Quốc Việt, Phường Nghĩa Đô, Hà Nội</li>
              <li>+(123) 2500-567-8988</li>
              <li>supportlms@gmail.com</li>
            </ul>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><FaFacebookF size={14} /></a>
              <a href="#" className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><FaTwitter size={14} /></a>
              <a href="#" className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><FaLinkedinIn size={14} /></a>
              <a href="#" className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><FaInstagram size={14} /></a>
              <a href="#" className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><FaYoutube size={14} /></a>
            </div>
          </div>
        </div>
        <div className="pt-6 text-center text-sm text-gray-500">
          &copy; 2026 LearnPress LMS | Powered by Codecamp
        </div>
      </div>
    </footer>
  );
}
