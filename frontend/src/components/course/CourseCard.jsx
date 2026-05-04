import { Link } from "react-router-dom";
import { FiClock, FiUsers, FiBarChart, FiBookOpen } from "react-icons/fi";

const LEVEL_MAP = {
  beginner: "Người mới",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

export default function CourseCard({ course }) {
  const levelText = LEVEL_MAP[course.level] || course.level;
  const priceText =
    course.price === 0
      ? "Miễn phí"
      : course.price.toLocaleString("vi-VN") + "đ";

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={course.thumbnail || "https://placehold.co/600x400"}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-white text-secondary shadow">
          {priceText}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <span className="text-xs font-medium text-primary bg-primary-light px-3 py-1 rounded-full self-start">
          {levelText}
        </span>
        <Link
          to={"/khoa-hoc/" + course.slug}
          className="text-base font-semibold text-secondary hover:text-primary transition-colors"
        >
          {course.title}
        </Link>
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
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
      </div>
    </div>
  );
}
