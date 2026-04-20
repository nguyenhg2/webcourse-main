import { Link } from "react-router-dom";
import { FiClock, FiUsers } from "react-icons/fi";

export default function CourseGridCard({ course }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
      <div className="p-5 flex flex-col gap-3">
        <span className="text-xs font-medium text-primary bg-primary-light px-3 py-1 rounded-full self-start">{course.category}</span>
        <Link to={`/khoa-hoc/${course.slug}`} className="text-base font-semibold text-secondary hover:text-primary transition-colors">
          {course.title}
        </Link>
        <div className="text-sm text-gray-500">{course.instructor}</div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><FiClock size={14} /> {course.duration}</span>
          <span className="flex items-center gap-1"><FiUsers size={14} /> {course.students} học viên</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {course.originalPrice > 0 && (
              <span className="text-sm text-gray-400 line-through">{course.originalPrice.toLocaleString("vi-VN")}đ</span>
            )}
            <span className="text-base font-bold text-primary">
              {course.price === 0 ? "Miễn phí" : course.price.toLocaleString("vi-VN") + "đ"}
            </span>
          </div>
          <Link to={`/khoa-hoc/${course.slug}`} className="text-sm font-medium text-primary hover:underline">Xem thêm</Link>
        </div>
      </div>
    </div>
  );
}
