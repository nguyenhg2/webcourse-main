import { Link } from "react-router-dom";
import { FiClock, FiUsers, FiBarChart, FiBookOpen } from "react-icons/fi";

export default function CourseListCard({ course }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col md:flex-row overflow-hidden">
      <div className="relative md:w-[410px] shrink-0">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-64 object-cover"
        />
        <span className="absolute top-5 left-5 bg-secondary text-white text-base font-medium px-3 py-2 rounded-lg">
          {course.category}
        </span>
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-gray-600 text-base">
              boi {course.instructor}
            </span>
            <h3 className="text-secondary text-xl font-semibold">
              {course.title}
            </h3>
          </div>
          <div className="flex flex-wrap gap-6">
            <span className="flex items-center gap-2 text-gray-600 text-base">
              <FiClock size={16} className="text-primary" />
              {course.duration}
            </span>
            <span className="flex items-center gap-2 text-gray-600 text-base">
              <FiUsers size={16} className="text-primary" />
              {course.students} Hoc vien
            </span>
            <span className="flex items-center gap-2 text-gray-600 text-base">
              <FiBarChart size={16} className="text-primary" />
              {course.level}
            </span>
            <span className="flex items-center gap-2 text-gray-600 text-base">
              <FiBookOpen size={16} className="text-primary" />
              {course.lessons} Tiet
            </span>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-4">
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
