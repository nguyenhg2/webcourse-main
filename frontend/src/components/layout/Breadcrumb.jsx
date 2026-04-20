import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export default function Breadcrumb({ items = [] }) {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <FiChevronRight className="text-gray-400" size={14} />}
              {item.to ? (
                <Link to={item.to} className="text-gray-500 hover:text-primary transition">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
