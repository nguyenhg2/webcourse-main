import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import { getBlogsAPI } from "../../services/api";

export default function BlogSection() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getBlogsAPI().then((data) => setPosts(data.slice(0, 3))).catch(() => setPosts([]));
  }, []);

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
          {posts.map((post) => (
            <div key={post._id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <img src={post.image || post.thumbnail} alt={post.title} className="w-full h-52 object-cover" />
              <div className="p-6 flex flex-col gap-3">
                <span className="text-xs font-medium text-primary bg-primary-light px-3 py-1 rounded-full self-start">Blog</span>
                <h3 className="text-lg font-semibold text-secondary hover:text-primary transition-colors">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-sm text-gray-600 leading-6">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <FiCalendar size={14} className="text-primary" /> {post.created_at}
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
