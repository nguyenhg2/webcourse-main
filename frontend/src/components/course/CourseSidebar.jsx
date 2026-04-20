import { FiStar } from "react-icons/fi";

const CATEGORIES = [
  { name: "Web Development", count: 15 },
  { name: "Python", count: 15 },
  { name: "Mobile App", count: 15 },
  { name: "JavaScript", count: 15 },
  { name: "DevOps & Cloud", count: 15 },
  { name: "Database & Backend", count: 15 },
  { name: "UI/UX design", count: 15 },
  { name: "AI & Machine Learning", count: 15 },
];

const INSTRUCTORS = [
  { name: "Dinh Thanh Nguyen", count: 15 },
  { name: "Nguyen Phuong Tay", count: 15 },
];

const PRICES = [
  { name: "Tat ca", count: 15 },
  { name: "Mien phi", count: 15 },
  { name: "Tra phi", count: 15 },
];

const LEVELS = [
  { name: "Tat ca cap do", count: 15 },
  { name: "Nguoi moi", count: 15 },
  { name: "Co ban", count: 15 },
  { name: "Chuyen gia", count: 15 },
];

function FilterGroup({ title, items }) {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="text-secondary text-xl font-semibold">{title}</h4>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <label
            key={item.name}
            className="flex items-center gap-1 cursor-pointer"
          >
            <input type="checkbox" className="size-4 accent-primary" />
            <span className="flex-1 text-secondary text-lg">{item.name}</span>
            <span className="text-gray-600 text-lg">{item.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function RatingFilter() {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="text-secondary text-xl font-semibold">Danh gia</h4>
      <div className="flex flex-col gap-2.5">
        {[5, 4, 3, 2, 1].map((stars) => (
          <label key={stars} className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" className="size-4 accent-primary" />
            <div className="flex-1 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  size={16}
                  className={
                    i < stars
                      ? "text-warning fill-warning"
                      : "text-gray-400"
                  }
                />
              ))}
            </div>
            <span className="text-gray-600 text-lg">(1,025)</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function CourseSidebar() {
  return (
    <aside className="w-64 shrink-0 flex flex-col gap-7">
      <FilterGroup title="The loai" items={CATEGORIES} />
      <FilterGroup title="Giang vien" items={INSTRUCTORS} />
      <FilterGroup title="Gia" items={PRICES} />
      <RatingFilter />
      <FilterGroup title="Cap do" items={LEVELS} />
    </aside>
  );
}
