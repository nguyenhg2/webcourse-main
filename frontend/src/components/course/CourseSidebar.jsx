import { FiStar } from "react-icons/fi";

const CATEGORIES = [
  { name: "Web Development", count: 15 },
  { name: "Python", count: 15 },
  { name: "Ứng dụng di động", count: 15 },
  { name: "JavaScript", count: 15 },
  { name: "DevOps & Cloud", count: 15 },
  { name: "Database & Backend", count: 15 },
  { name: "UI/UX Design", count: 15 },
  { name: "AI & Machine Learning", count: 15 },
];

const INSTRUCTORS = [
  { name: "Đinh Thành Nguyên", count: 15 },
  { name: "Nguyễn Phương Tây", count: 15 },
];

const PRICES = [
  { name: "Tất cả", count: 15 },
  { name: "Miễn phí", count: 15 },
  { name: "Trả phí", count: 15 },
];

const LEVELS = [
  { name: "Tất cả cấp độ", count: 15 },
  { name: "Người mới", count: 15 },
  { name: "Cơ bản", count: 15 },
  { name: "Chuyên gia", count: 15 },
];

function FilterGroup({ title, items }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-heading text-secondary text-lg font-semibold">{title}</h4>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <label key={item.name} className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="accent-primary" />
              {item.name}
            </span>
            <span className="text-sm text-gray-400">{item.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function RatingFilter() {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-heading text-secondary text-lg font-semibold">Đánh giá</h4>
      <div className="flex flex-col gap-2.5">
        {[5, 4, 3, 2, 1].map((rating) => (
          <label key={rating} className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <input type="checkbox" className="accent-primary" />
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={14} className={i < rating ? "text-warning fill-warning" : "text-gray-200"} />
                ))}
              </span>
            </span>
            <span className="text-sm text-gray-400">(1.025)</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function CourseSidebar() {
  return (
    <aside className="w-64 shrink-0 flex flex-col gap-7">
      <FilterGroup title="Thể loại" items={CATEGORIES} />
      <FilterGroup title="Giảng viên" items={INSTRUCTORS} />
      <FilterGroup title="Giá" items={PRICES} />
      <RatingFilter />
      <FilterGroup title="Cấp độ" items={LEVELS} />
    </aside>
  );
}
