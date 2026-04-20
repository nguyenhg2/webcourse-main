import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";

export default function BlogGridCard({ post, isActive }) {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-72 object-cover"
      />
      <div className="p-5 flex flex-col gap-4">
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
