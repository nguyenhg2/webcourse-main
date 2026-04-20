import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const COMMENTS = [
  {
    name: "Nguyễn Văn An",
    date: "20 Tháng 1, 2026",
    avatar: "https://placehold.co/48/564FFD/fff?text=A",
    content: "Bài viết rất hữu ích, cảm ơn tác giả đã chia sẻ kiến thức chi tiết và dễ hiểu như vậy.",
  },
  {
    name: "Trần Thị Bích",
    date: "18 Tháng 1, 2026",
    avatar: "https://placehold.co/48/FF6636/fff?text=B",
    content: "Mình đã áp dụng được ngay vào dự án thực tế. Mong tác giả viết thêm nhiều bài nữa nhé!",
  },
  {
    name: "Phạm Quốc Hùng",
    date: "15 Tháng 1, 2026",
    avatar: "https://placehold.co/48/23BD33/fff?text=H",
    content: "Nội dung chất lượng, trình bày khoa học. Đây là một trong những bài viết hay nhất mình từng đọc.",
  },
];

const PER_PAGE = 3;

export default function CommentList() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(COMMENTS.length / PER_PAGE);
  const visible = COMMENTS.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex flex-col gap-8">
      {visible.map((c, i) => (
        <div key={i} className="flex gap-4">
          <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-secondary">{c.name}</span>
              <span className="text-xs text-gray-500">{c.date}</span>
            </div>
            <p className="text-sm text-gray-600 leading-6">{c.content}</p>
            <button className="text-xs text-primary font-medium self-start">Trả lời</button>
          </div>
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 disabled:opacity-40"
          >
            <FiChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium ${
                page === i + 1 ? "bg-primary text-white" : "border border-gray-200 text-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 disabled:opacity-40"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
