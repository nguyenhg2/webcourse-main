import { Link } from "react-router-dom";
import { FiClock, FiUsers, FiBarChart, FiBookOpen, FiShoppingCart } from "react-icons/fi";
import { courseFallbackImage, courseImage, useFallbackImage } from "../../utils/courseImages";

const LEVEL_MAP = {
  beginner: "Người mới",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

export default function CourseListCard({ course, isOwned = false, isInCart = false, isAdding = false, onAddCart }) {
  const levelText = LEVEL_MAP[course.level] || course.level;
  const priceText =
    course.price === 0
      ? "Miễn phí"
      : course.price.toLocaleString("vi-VN") + "đ";

  return (
    <div className="w-full rounded-xl border border-gray-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={courseImage(course)}
        alt={course.title}
        onError={(event) => useFallbackImage(event, courseFallbackImage(course))}
        className="w-full h-56 shrink-0 bg-gray-50 object-contain p-2 md:w-[300px]"
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
          {isOwned ? (
            <span className="text-lg font-bold text-success">Đã mua</span>
          ) : (
            <span className="text-lg font-bold text-primary">{priceText}</span>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isOwned && (
              <button
                type="button"
                onClick={() => onAddCart?.(course)}
                disabled={isInCart || isAdding}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <FiShoppingCart size={16} />
                {isAdding ? "Đang thêm..." : isInCart ? "Đã có trong giỏ" : "Thêm vào giỏ"}
              </button>
            )}
            <Link
              to={"/khoa-hoc/" + course.slug}
              className={`px-6 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors ${isOwned ? "bg-success hover:bg-green-600" : "bg-gray-700 hover:bg-gray-900"}`}
            >
              {isOwned ? "Vào học" : "Xem thêm"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
