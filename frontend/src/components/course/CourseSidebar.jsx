import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import { getCategoriesAPI } from "../../services/api";

const LEVELS = [
  { name: "beginner", label: "Người mới" },
  { name: "intermediate", label: "Trung cấp" },
  { name: "advanced", label: "Nâng cao" },
];

function RatingFilter({ selectedRatings, onToggleRating }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-heading text-secondary text-lg font-semibold">Đánh giá</h4>
      <div className="flex flex-col gap-2.5">
        {[5, 4, 3, 2, 1].map((rating) => (
          <label key={rating} className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedRatings.includes(rating)}
                onChange={() => onToggleRating(rating)}
                className="accent-primary"
              />
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={14}
                    className={i < rating ? "text-warning fill-warning" : "text-gray-200"}
                  />
                ))}
              </span>
              <span className="text-xs text-gray-500">trở lên</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function CourseSidebar({
  selectedCategories = [],
  selectedLevels = [],
  selectedRatings = [],
  onToggleCategory,
  onToggleLevel,
  onToggleRating,
  onClearFilters,
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategoriesAPI().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-heading text-secondary text-lg font-semibold">Thể loại</h4>
          <button type="button" onClick={onClearFilters} className="text-xs text-primary hover:underline">
            Xóa lọc
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {categories.map((item) => (
            <label key={item._id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(item._id)}
                onChange={() => onToggleCategory(item._id)}
                className="accent-primary"
              />
              {item.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h4 className="font-heading text-secondary text-lg font-semibold">Cấp độ</h4>
        <div className="flex flex-col gap-2.5">
          {LEVELS.map((item) => (
            <label key={item.name} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLevels.includes(item.name)}
                onChange={() => onToggleLevel(item.name)}
                className="accent-primary"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <RatingFilter selectedRatings={selectedRatings} onToggleRating={onToggleRating} />
    </aside>
  );
}
