import { Link } from "react-router-dom";
import { FiUser, FiCalendar, FiMessageCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import Breadcrumb from "../components/layout/Breadcrumb";
import BlogSidebar from "../components/blog/BlogSidebar";
import CommentList from "../components/ui/CommentList";
import CommentForm from "../components/ui/CommentForm";

const TAGS = ["Khóa học miễn phí", "Marketing", "Ý tưởng", "LMS", "LearnPress", "Giảng viên"];

export default function BlogSingle() {
  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Blog", to: "/blog" }, { label: "5 Ngôn ngữ lập trình nên học năm 2026" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-secondary">5 Ngôn ngữ lập trình nên học năm 2026</h1>
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-2"><FiUser size={14} /> Đinh Thành Nguyên</span>
              <span className="flex items-center gap-2"><FiCalendar size={14} /> 24 Tháng 1, 2026</span>
              <span className="flex items-center gap-2"><FiMessageCircle size={14} /> 20 Bình luận</span>
            </div>
            <img src="https://placehold.co/990x603" alt="Bài viết" className="w-full rounded-xl mt-8" />
            <div className="prose max-w-none mt-8 text-gray-600 leading-8">
              <p>Thị trường công nghệ luôn thay đổi nhanh chóng và việc cập nhật các ngôn ngữ lập trình phổ biến là điều cần thiết cho sự nghiệp của bạn. Trong bài viết này, chúng tôi sẽ điểm qua 5 ngôn ngữ lập trình được dự đoán sẽ tiếp tục phát triển mạnh mẽ trong năm 2026.</p>
              <p className="mt-4">JavaScript vẫn giữ vị trí số một trong phát triển web với hệ sinh thái phong phú bao gồm React, Vue, Angular cho frontend và Node.js cho backend. Khả năng full-stack của JavaScript khiến nó trở thành lựa chọn hàng đầu cho nhiều nhà phát triển.</p>
              <p className="mt-4">Python tiếp tục là ngôn ngữ phổ biến nhất trong lĩnh vực AI, Machine Learning và Data Science. Cú pháp đơn giản và thư viện phong phú giúp Python trở thành ngôn ngữ lý tưởng cho người mới bắt đầu.</p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <span key={tag} className={`px-4 py-1.5 rounded-lg border border-gray-100 text-sm ${tag === "LearnPress" ? "bg-gray-50 text-secondary" : "text-gray-600"}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Chia sẻ:</span>
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors"><FaFacebookF size={12} /></a>
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors"><FaTwitter size={12} /></a>
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors"><FaLinkedinIn size={12} /></a>
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors"><FaInstagram size={12} /></a>
                  <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors"><FaYoutube size={12} /></a>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <Link to="/blog/bai-truoc" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                <FiChevronLeft size={16} /> Bài viết trước
              </Link>
              <Link to="/blog/bai-sau" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                Bài viết sau <FiChevronRight size={16} />
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-semibold text-secondary mb-6">Bình luận (20)</h3>
              <CommentList />
              <div className="mt-10">
                <CommentForm />
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </>
  );
}
