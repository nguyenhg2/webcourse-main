import { FiClock, FiUsers, FiBarChart, FiBookOpen } from "react-icons/fi";

export default function CourseCard({ course }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.price === 0 && (
          <span className="absolute top-3 left-3 bg-success text-white text-xs font-bold px-2 py-1 rounded">
            Mien phi
          </span>
        )}
        {course.price > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
            {course.price.toLocaleString("vi-VN")}d
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded font-medium">
            {course.category}
          </span>
        </div>
        <h3 className="font-semibold text-secondary mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <img
            src={course.instructorAvatar}
            alt={course.instructor}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-xs text-gray-500">{course.instructor}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-3">
          <span className="flex items-center gap-1">
            <FiClock size={12} /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <FiUsers size={12} /> {course.students}
          </span>
          <span className="flex items-center gap-1">
            <FiBarChart size={12} /> {course.level}
          </span>
          <span className="flex items-center gap-1">
            <FiBookOpen size={12} /> {course.lessons} bai
          </span>
        </div>
      </div>
    </div>
  );
}
