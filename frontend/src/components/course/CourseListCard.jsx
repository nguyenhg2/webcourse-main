import { Link } from "react-router-dom";
import { FiClock, FiUsers, FiBarChart, FiBookOpen } from "react-icons/fi";

export default function CourseListCard({ course }) {
  return (
    <div className="w-full rounded-xl border border-gray-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow">
      <img src={course.image} alt={course.title} className="w-full md:w-[300px] h-56 object-cover shrink-0" />
      <div className="flex-1 p-6 flex flex-col gap-3">
        <span className="text-xs font-medium text-primary bg-primary-light px-3 py-1 rounded-full self-start">{course.category}</span>
        <Link to={`/khoa-hoc/${course.slug}`} className="text-xl font-semibold text-secondary hover:text-primary transition-colors">
          {course.title}
        </Link>
        <div className="text-sm text-gray-500">{course.instructor}</div>
        <div className="flex items-center gap-5 text-sm text-gray-500">
          <span className="flex items-center gap-1"><FiClock size={14} /> {course.duration}</span>
          <span className="flex items-center gap-1"><FiUsers size={14} /> {course.students} học viên</span>
          <span className="flex items-center gap-1"><FiBarChart size={14} /> {course.level}</span>
          <span className="flex items-center gap-1"><FiBookOpen size={14} /> {course.lessons} bài</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2">
            {course.originalPrice > 0 && (
              <span className="text-sm text-gray-400 line-through">{course.originalPrice.toLocaleString("vi-VN")}đ</span>
            )}
            <span className="text-lg font-bold text-primary">
              {course.price === 0 ? "Miễn phí" : course.price.toLocaleString("vi-VN") + "đ"}
            </span>
          </div>
          <Link to={`/khoa-hoc/${course.slug}`} className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Xem thêm
          </Link>
        </div>
      </div>
    </div>
  );
}
