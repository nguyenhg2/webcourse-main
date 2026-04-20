import { Link } from "react-router-dom";
import { FiClock, FiUsers } from "react-icons/fi";

export default function CourseGridCard({ course }) {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-72 object-cover"
        />
        <span className="absolute top-5 left-5 bg-secondary text-white text-base font-medium px-3 py-2 rounded-lg">
          {course.category}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <span className="text-gray-600 text-base">
            boi {course.instructor}
          </span>
          <h3 className="text-secondary text-xl font-semibold">
            {course.title}
          </h3>
        </div>
        <div className="flex gap-6">
          <span className="flex items-center gap-2 text-gray-600 text-base">
            <FiClock size={16} className="text-primary" />
            {course.duration}
          </span>
          <span className="flex items-center gap-2 text-gray-600 text-base">
            <FiUsers size={16} className="text-primary" />
            {course.students} Hoc vien
          </span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {course.originalPrice > 0 && (
              <span className="text-gray-400 text-lg line-through">
                {course.originalPrice.toLocaleString("vi-VN")} VND
              </span>
            )}
            <span className="text-success text-lg font-medium">
              {course.price === 0
                ? "Mien phi"
                : `${course.price.toLocaleString("vi-VN")} VND`}
            </span>
          </div>
          <Link
            to={`/khoa-hoc/${course.slug}`}
            className="text-secondary text-lg font-medium hover:text-primary transition-colors"
          >
            Xem them
          </Link>
        </div>
      </div>
    </div>
  );
}
