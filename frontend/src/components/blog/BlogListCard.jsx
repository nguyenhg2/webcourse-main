import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";

export default function BlogListCard({ post, isActive }) {
  return (
    <div
      className={`w-full rounded-2xl border border-gray-100 flex flex-col md:flex-row overflow-hidden ${
        isActive ? "bg-gray-50 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]" : ""
      }`}
    >
      <img
        src={post.image}
        alt={post.title}
        className="w-full md:w-[410px] h-64 object-cover shrink-0"
      />
      <div className="flex-1 px-7 py-5 flex flex-col gap-4">
        <Link
          to={`/blog/${post.slug}`}
          className={`text-xl font-semibold hover:text-primary transition-colors ${
            isActive ? "text-primary" : "text-secondary"
          }`}
        >
          {post.title}
        </Link>
        <div className="flex items-center gap-2 text-gray-600 text-base">
          <FiCalendar size={16} className="text-primary" />
          {post.date}
        </div>
        <p className="text-gray-600 text-lg leading-7">{post.excerpt}</p>
      </div>
    </div>
  );
}
