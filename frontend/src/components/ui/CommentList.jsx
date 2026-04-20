import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const COMMENTS = [
  {
    id: 1,
    name: "Tran Minh Khoa",
    date: "October 03, 2026",
    avatar: "https://placehold.co/60x60",
    content:
      "Khoa hoc rat chi tiet va de hieu. Giang vien giai thich tung buoc mot, minh da ap dung duoc vao du an cong ty ngay. Rat dang tien!",
  },
  {
    id: 2,
    name: "Le Thi Mai",
    date: "October 03, 2026",
    avatar: "https://placehold.co/60x60",
    content:
      "Noi dung hay, cau truc ro rang. Minh tu zero ma gio da tu code duoc app React. Chi mong co them bai tap thuc hanh.",
  },
  {
    id: 3,
    name: "Pham Hoang Long",
    date: "October 03, 2026",
    avatar: "https://placehold.co/60x60",
    content:
      "Day la khoa React tot nhat minh tung hoc. Video chat luong cao, vi du thuc te, va giang vien rat nhiet tinh ho tro.",
  },
];

export default function CommentList() {
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col gap-5">
      {COMMENTS.map((c) => (
        <div
          key={c.id}
          className="pt-5 border-t border-gray-100 flex gap-5"
        >
          <img
            src={c.avatar}
            alt={c.name}
            className="size-14 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-secondary text-base font-semibold">
                {c.name}
              </span>
              <span className="text-gray-600 text-base">{c.date}</span>
            </div>
            <p className="text-gray-600 text-lg leading-7">{c.content}</p>
            <button className="flex items-center gap-2 text-secondary text-base hover:text-primary transition-colors">
              Tra loi
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 mt-4">
        <button className="size-12 rounded-full border border-gray-100 flex items-center justify-center hover:border-primary transition-colors">
          <FiChevronLeft size={20} />
        </button>
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`size-12 rounded-full flex items-center justify-center text-lg font-medium transition-colors ${
              p === page
                ? "bg-secondary text-white"
                : "border border-gray-100 text-secondary hover:border-primary"
            }`}
          >
            {p}
          </button>
        ))}
        <button className="size-12 rounded-full border border-gray-100 flex items-center justify-center hover:border-primary transition-colors">
          <FiChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
