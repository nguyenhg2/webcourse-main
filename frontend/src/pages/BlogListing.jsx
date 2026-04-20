import { useState } from "react";
import { FiSearch, FiGrid, FiList } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import BlogListCard from "../components/blog/BlogListCard";
import BlogGridCard from "../components/blog/BlogGridCard";
import BlogSidebar from "../components/blog/BlogSidebar";
import Pagination from "../components/ui/Pagination";

const POSTS = [
  { id: 1, slug: "5-ngon-ngu-lap-trinh", title: "5 Ngôn ngữ lập trình nên học năm 2026", date: "24 Tháng 1, 2026", image: "https://placehold.co/410x267", excerpt: "Khám phá các ngôn ngữ lập trình đang được săn đón nhất hiện nay.", active: true },
  { id: 2, slug: "huong-dan-docker", title: "Hướng dẫn triển khai ứng dụng với Docker", date: "20 Tháng 1, 2026", image: "https://placehold.co/410x267", excerpt: "Từng bước triển khai ứng dụng web lên production với Docker." },
  { id: 3, slug: "xu-huong-uiux", title: "Xu hướng thiết kế UI/UX năm 2026", date: "15 Tháng 1, 2026", image: "https://placehold.co/410x267", excerpt: "Tổng hợp xu hướng thiết kế giao diện người dùng nổi bật." },
  { id: 4, slug: "react-hooks-nang-cao", title: "React Hooks nâng cao: useReducer và useContext", date: "10 Tháng 1, 2026", image: "https://placehold.co/410x267", excerpt: "Tìm hiểu cách quản lý state phức tạp với useReducer và useContext." },
  { id: 5, slug: "ci-cd-github-actions", title: "CI/CD với GitHub Actions cho dự án Node.js", date: "5 Tháng 1, 2026", image: "https://placehold.co/410x267", excerpt: "Thiết lập pipeline CI/CD tự động cho dự án Node.js." },
  { id: 6, slug: "typescript-cho-nguoi-moi", title: "TypeScript cho người mới bắt đầu", date: "1 Tháng 1, 2026", image: "https://placehold.co/410x267", excerpt: "Làm quen với TypeScript và lợi ích của việc sử dụng type safety." },
];

export default function BlogListing() {
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = POSTS.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Blog" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-lg border transition-colors ${viewMode === "grid" ? "border-primary text-primary bg-primary-light" : "border-gray-200 text-gray-500"}`}>
                  <FiGrid size={18} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-lg border transition-colors ${viewMode === "list" ? "border-primary text-primary bg-primary-light" : "border-gray-200 text-gray-500"}`}>
                  <FiList size={18} />
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="flex flex-col gap-6">
                {filtered.map((post) => (
                  <BlogListCard key={post.id} post={post} isActive={post.active} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filtered.map((post) => (
                  <BlogGridCard key={post.id} post={post} isActive={post.active} />
                ))}
              </div>
            )}

            <Pagination current={page} total={3} onChange={setPage} />
          </div>
          <div className="hidden lg:block">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </>
  );
}
