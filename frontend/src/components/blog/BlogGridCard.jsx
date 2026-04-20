import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";

export default function BlogGridCard({ post, isActive }) {
  return (
    <div className={`rounded-xl border border-gray-100 overflow-hidden ${isActive ? "shadow-md" : ""}`}>
      <img src={post.image} alt={post.title} className="w-full h-52 object-cover" />
      <div className="p-6 flex flex-col gap-3">
        <Link
          to={`/blog/${post.slug}`}
          className={`text-lg font-semibold hover:text-primary transition-colors ${isActive ? "text-primary" : "text-secondary"}`}
        >
          {post.title}
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiCalendar size={14} className="text-primary" /> {post.date}
        </div>
        <p className="text-sm text-gray-600 leading-6">{post.excerpt}</p>
      </div>
    </div>
  );
}
