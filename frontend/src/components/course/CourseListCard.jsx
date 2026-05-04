import { Link } from "react-router-dom";
import { FiClock, FiUsers, FiBarChart, FiBookOpen } from "react-icons/fi";

const LEVEL_MAP = {
  beginner: "Người mới",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

export default function CourseListCard({ course }) {
  const levelText = LEVEL_MAP[course.level] || course.level;
  const priceText =
    course.price === 0
      ? "Miễn phí"
      : course.price.toLocaleString("vi-VN") + "đ";

  return (
    <div className="w-full rounded-xl border border-gray-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={course.thumbnail || "https://placehold.co/600x400"}
        alt={course.title}
        className="w-full md:w-[300px] h-56 object-cover shrink-0"
      />
      <div className="flex-1 p-6 flex flex-col gap-3">
        <span className="text-xs font-medium text-primary bg-primary-light px-3 py-1 rounded-full self-start">
          {levelText}
        </span>
        <Link
          to={"/khoa-hoc/" + course.slug}
          className="text-xl font-semibold text-secondary hover:text-primary transition-colors"
        >
          {course.title}
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center gap-5 text-sm text-gray-500">
          {course.duration && (
            <span className="flex items-center gap-1">
              <FiClock size={14} /> {course.duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FiUsers size={14} /> {course.total_students} học viên
          </span>
          <span className="flex items-center gap-1">
            <FiBarChart size={14} /> {levelText}
          </span>
          {course.total_lessons && (
            <span className="flex items-center gap-1">
              <FiBookOpen size={14} /> {course.total_lessons} bài
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <span className="text-lg font-bold text-primary">{priceText}</span>
          <Link
            to={"/khoa-hoc/" + course.slug}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Xem thêm
          </Link>
        </div>
      </div>
    </div>
  );
}
