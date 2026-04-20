import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export default function Breadcrumb({ items }) {
  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-[1290px] mx-auto px-5 py-5">
        <div className="flex items-center gap-2 text-sm">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <FiChevronRight size={14} className="text-gray-400" />}
              {item.to ? (
                <Link to={item.to} className="text-gray-500 hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-secondary font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
