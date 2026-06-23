import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar } from "react-icons/fi";
import { getBlogsAPI } from "../../services/api";
import { blogImage } from "../../utils/courseImages";

export default function BlogSection() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getBlogsAPI();
        setPosts(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch {
        setPosts([]);
      }
    }

    loadPosts();
  }, []);

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-322.5 mx-auto px-5">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold text-secondary">Bài viết mới nhất</h2>
            <p className="text-gray-600 mt-3">Cập nhật kiến thức và xu hướng công nghệ mới nhất</p>
          </div>

          <Link to="/blog" className="hidden items-center gap-2 font-semibold text-primary transition-all hover:gap-3 lg:flex">
            Xem tất cả <FiArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post._id} className="overflow-hidden rounded-lg border border-gray-100 transition-shadow hover:shadow-md">
              <img src={blogImage(post)} alt={post.title} className="h-52 w-full object-cover" />

              <div className="flex flex-col gap-3 p-6">
                <span className="self-start rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                  Blog
                </span>
                <h3 className="text-lg font-semibold text-secondary transition-colors hover:text-primary">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-sm leading-6 text-gray-600">{post.excerpt}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <FiCalendar size={14} className="text-primary" /> {post.created_at}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center lg:hidden">
          <Link to="/blog" className="inline-flex items-center gap-2 font-semibold text-primary">
            Xem tất cả <FiArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
