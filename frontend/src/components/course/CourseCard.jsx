import { Link } from "react-router-dom";
import { FiClock, FiUsers, FiBarChart, FiBookOpen } from "react-icons/fi";

export default function CourseCard({ course }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
        <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-white text-secondary shadow">
          {course.price === 0 ? "Miễn phí" : course.price.toLocaleString("vi-VN") + "đ"}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <span className="text-xs font-medium text-primary bg-primary-light px-3 py-1 rounded-full self-start">{course.category}</span>
        <Link to={`/khoa-hoc/${course.slug}`} className="text-base font-semibold text-secondary hover:text-primary transition-colors">
          {course.title}
        </Link>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <img src="https://placehold.co/24/564FFD/fff?text=G" alt={course.instructor} className="w-6 h-6 rounded-full" />
          <span>{course.instructor}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1"><FiClock size={14} /> {course.duration}</span>
          <span className="flex items-center gap-1"><FiUsers size={14} /> {course.students}</span>
          <span className="flex items-center gap-1"><FiBarChart size={14} /> {course.level}</span>
          <span className="flex items-center gap-1"><FiBookOpen size={14} /> {course.lessons} bài</span>
        </div>
      </div>
    </div>
  );
}
