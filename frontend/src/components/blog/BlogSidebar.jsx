import { Link } from "react-router-dom";
import { useState } from "react";

const CATEGORIES = [
  { name: "Web Development", count: 15 },
  { name: "Python", count: 15 },
  { name: "Ứng dụng di động", count: 15 },
  { name: "JavaScript", count: 15 },
  { name: "DevOps & Cloud", count: 15 },
  { name: "Database & Backend", count: 15 },
];

const RECENT_POSTS = [
  { title: "Tổng hợp giao diện WordPress tốt nhất cho LearnPress 2026", image: "https://placehold.co/90x90", slug: "tong-hop-giao-dien-wordpress" },
  { title: "Hướng dẫn tối ưu hiệu suất ứng dụng React", image: "https://placehold.co/90x90", slug: "toi-uu-hieu-suat-react", active: true },
  { title: "Cách xây dựng API RESTful với Node.js và Express", image: "https://placehold.co/90x90", slug: "xay-dung-api-restful" },
];

const TAGS = ["Khóa học miễn phí", "Marketing", "Ý tưởng", "LMS", "LearnPress", "Giảng viên"];

export default function BlogSidebar() {
  const [selectedCats, setSelectedCats] = useState([]);

  function toggleCat(name) {
    setSelectedCats((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-7">
      <div className="flex flex-col gap-5">
        <h4 className="font-heading text-secondary text-xl font-semibold">Thể loại</h4>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((cat) => (
            <label key={cat.name} className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-2 text-secondary text-lg">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat.name)}
                  onChange={() => toggleCat(cat.name)}
                  className="accent-primary w-4 h-4"
                />
                <span className="group-hover:text-primary transition-colors">{cat.name}</span>
              </span>
              <span className="text-gray-600 text-lg">{cat.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="text-secondary text-xl font-semibold">Bài đăng gần đây</h4>
        <div className="flex flex-col gap-4">
          {RECENT_POSTS.map((post, i) => (
            <Link key={i} to={`/blog/${post.slug}`} className="flex gap-4 items-start">
              <img src={post.image} alt={post.title} className="size-24 rounded-xl object-cover shrink-0" />
              <span className={`text-base font-medium leading-6 ${post.active ? "text-primary" : "text-secondary"} hover:text-primary transition-colors`}>
                {post.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <h4 className="font-heading text-secondary text-xl font-semibold">Thẻ</h4>
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`px-5 py-2 rounded-lg border border-gray-100 text-lg hover:border-primary hover:text-primary transition-colors ${tag === "LearnPress" ? "bg-gray-50 text-secondary" : "text-gray-600"}`}
          >
            {tag}
          </button>
        ))}
      </div>
    </aside>
  );
}
