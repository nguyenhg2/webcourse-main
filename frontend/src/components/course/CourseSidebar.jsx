import { useEffect, useState } from "react";
import { getCategoriesAPI } from "../../services/api";
import RatingStars from "../ui/RatingStars";

const LEVELS = [
  { name: "beginner", label: "Người mới" },
  { name: "intermediate", label: "Trung cấp" },
  { name: "advanced", label: "Nâng cao" },
];

const RATINGS = [5, 4, 3, 2, 1];

function FilterCheckbox({ checked, label, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-primary" />
      {children || label}
    </label>
  );
}

function RatingFilter({ selectedRatings, onToggleRating }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-heading text-secondary text-lg font-semibold">Đánh giá</h4>

      <div className="flex flex-col gap-2.5">
        {RATINGS.map((rating) => (
          <FilterCheckbox
            key={rating}
            checked={selectedRatings.includes(rating)}
            onChange={() => onToggleRating(rating)}
          >
            <span className="flex items-center gap-2">
              <RatingStars value={rating} size={14} />
              <span className="text-xs text-gray-500">trở lên</span>
            </span>
          </FilterCheckbox>
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
    async function loadCategories() {
      try {
        const data = await getCategoriesAPI();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    }

    loadCategories();
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
          {categories.map((category) => (
            <FilterCheckbox
              key={category._id}
              label={category.name}
              checked={selectedCategories.includes(category._id)}
              onChange={() => onToggleCategory(category._id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h4 className="font-heading text-secondary text-lg font-semibold">Cấp độ</h4>

        <div className="flex flex-col gap-2.5">
          {LEVELS.map((level) => (
            <FilterCheckbox
              key={level.name}
              label={level.label}
              checked={selectedLevels.includes(level.name)}
              onChange={() => onToggleLevel(level.name)}
            />
          ))}
        </div>
      </div>

      <RatingFilter selectedRatings={selectedRatings} onToggleRating={onToggleRating} />
    </aside>
  );
}
