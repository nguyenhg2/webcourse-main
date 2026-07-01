import { Link } from "react-router-dom";
import { FiClock, FiShoppingCart, FiUsers } from "react-icons/fi";
import { cartButtonLabel, courseLevelLabel, coursePriceLabel } from "../../utils/courseDisplay";
import { courseFallbackImage, courseImage, useFallbackImage } from "../../utils/courseImages";

export default function CourseGridCard({ course, isOwned = false, isInCart = false, isAdding = false, onAddCart }) {
  const levelText = courseLevelLabel(course.level);
  const priceText = coursePriceLabel(course.price);

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={courseImage(course)}
        alt={course.title}
        onError={(event) => useFallbackImage(event, courseFallbackImage(course))}
        className="w-full h-48 bg-gray-50 object-contain p-2"
      />
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
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {course.duration && (
            <span className="flex items-center gap-1">
              <FiClock size={14} /> {course.duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FiUsers size={14} /> {course.total_students} học viên
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {isOwned ? (
            <span className="text-base font-bold text-success">Đã mua</span>
          ) : (
            <span className="text-base font-bold text-primary">{priceText}</span>
          )}
          <Link
            to={"/khoa-hoc/" + course.slug}
            className={`text-sm font-medium hover:underline ${isOwned ? "text-success" : "text-primary"}`}
          >
            {isOwned ? "Vào học" : "Xem thêm"}
          </Link>
        </div>
        {!isOwned && (
          <button
            type="button"
            onClick={() => onAddCart?.(course)}
            disabled={isInCart || isAdding}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <FiShoppingCart size={16} />
            {cartButtonLabel(isAdding, isInCart)}
          </button>
        )}
      </div>
    </div>
  );
}
