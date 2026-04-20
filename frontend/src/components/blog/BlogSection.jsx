import { Link } from "react-router-dom";
import { FiCalendar, FiArrowRight } from "react-icons/fi";

const POSTS = [
  {
    id: 1,
    title: "5 Ngôn ngữ lập trình nên học năm 2026",
    excerpt: "Khám phá các ngôn ngữ lập trình đang được doanh nghiệp săn đón nhất hiện nay và lộ trình học hiệu quả.",
    date: "24 Tháng 1, 2026",
    image: "https://placehold.co/410x267",
    category: "Lập trình",
  },
  {
    id: 2,
    title: "Hướng dẫn triển khai ứng dụng với Docker",
    excerpt: "Từng bước triển khai ứng dụng web lên môi trường production sử dụng Docker và Docker Compose.",
    date: "20 Tháng 1, 2026",
    image: "https://placehold.co/410x267",
    category: "DevOps",
  },
  {
    id: 3,
    title: "Xu hướng thiết kế UI/UX năm 2026",
    excerpt: "Tổng hợp các xu hướng thiết kế giao diện người dùng nổi bật trong năm 2026.",
    date: "15 Tháng 1, 2026",
    image: "https://placehold.co/410x267",
    category: "Thiết kế",
  },
];

export default function BlogSection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-[1290px] mx-auto px-5">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-heading font-bold text-secondary">Bài viết mới nhất</h2>
            <p className="text-gray-600 mt-3">Cập nhật kiến thức và xu hướng công nghệ mới nhất</p>
          </div>
          <Link to="/blog" className="hidden lg:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            Xem tất cả <FiArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {POSTS.map((post) => (
            <div key={post.id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <img src={post.image} alt={post.title} className="w-full h-52 object-cover" />
              <div className="p-6 flex flex-col gap-3">
                <span className="text-xs font-medium text-primary bg-primary-light px-3 py-1 rounded-full self-start">{post.category}</span>
                <h3 className="text-lg font-semibold text-secondary hover:text-primary transition-colors">
                  <Link to="/blog/bai-viet">{post.title}</Link>
                </h3>
                <p className="text-sm text-gray-600 leading-6">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <FiCalendar size={14} className="text-primary" /> {post.date}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:hidden text-center mt-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-semibold">
            Xem tất cả <FiArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
