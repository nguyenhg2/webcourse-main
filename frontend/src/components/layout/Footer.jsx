import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-24 pb-8">
      <div className="max-w-[1290px] mx-auto px-4">
        <div className="flex flex-wrap gap-7 mb-24">
          <div className="w-full md:w-96 flex flex-col gap-8">
            <Link to="/" className="flex items-center gap-1">
              <div className="w-10 h-7 relative">
                <div className="w-4 h-7 absolute left-0 top-[1px] bg-primary" />
                <div className="w-4 h-7 absolute left-[20px] top-0 bg-primary" />
              </div>
              <span className="font-heading font-bold text-3xl text-secondary">
                CodeCamp
              </span>
            </Link>
          </div>
          <div className="w-48 flex flex-col gap-8">
            <h4 className="font-heading text-secondary text-xl font-semibold capitalize">
              NHAN GIUP DO
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/lien-he" className="text-gray-600 text-lg font-medium hover:text-primary transition-colors">
                Lien he chung toi
              </Link>
              <Link to="/blog" className="text-gray-600 text-lg font-medium hover:text-primary transition-colors">
                Bai viet gan nhat
              </Link>
              <Link to="/faq" className="text-gray-600 text-lg font-medium hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>
          </div>
          <div className="w-48 flex flex-col gap-8">
            <h4 className="font-heading text-secondary text-xl font-semibold capitalize">
              CHUONG TRINH
            </h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-gray-600 text-lg font-medium hover:text-primary transition-colors">
                Security
              </a>
              <a href="#" className="text-gray-600 text-lg font-medium hover:text-primary transition-colors">
                IT & Software
              </a>
              <a href="#" className="text-gray-600 text-lg font-medium hover:text-primary transition-colors">
                Cloud
              </a>
              <a href="#" className="text-gray-600 text-lg font-medium hover:text-primary transition-colors">
                Mobile App
              </a>
            </div>
          </div>
          <div className="w-full md:w-96 flex flex-col gap-8">
            <h4 className="font-heading text-secondary text-xl font-semibold capitalize">
              LIEN HE CHUNG TOI
            </h4>
            <div className="flex flex-col gap-4">
              <p className="text-gray-600 text-lg">
                Dia chi: 236 Hoang Quoc Viet, phuong Nghia Do, Ha Noi
              </p>
              <p className="text-gray-600 text-lg">
                So dien thoai: + (123) 2500-567-8988
                <br />
                Mail: supportlms@gmail.com
              </p>
              <div className="flex gap-3">
                <FaFacebookF size={20} className="text-gray-600 hover:text-primary cursor-pointer transition-colors" />
                <FaTwitter size={20} className="text-primary" />
                <FaLinkedinIn size={20} className="text-gray-600 hover:text-primary cursor-pointer transition-colors" />
                <FaInstagram size={20} className="text-gray-600 hover:text-primary cursor-pointer transition-colors" />
                <FaYoutube size={20} className="text-gray-600 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-600 text-lg">
            Copyright &copy; 2026 LearnPress LMS | Powered by Codecamp
          </p>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 size-14 bg-secondary rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors shadow-lg"
      >
        <svg width="14" height="24" viewBox="0 0 14 24" fill="currentColor">
          <path d="M7 0L0 8h5v16h4V8h5L7 0z" />
        </svg>
      </button>
    </footer>
  );
}
