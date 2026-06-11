import { useEffect, useState } from "react";
import { FiSearch, FiGrid, FiList } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import BlogListCard from "../components/blog/BlogListCard";
import BlogGridCard from "../components/blog/BlogGridCard";
import BlogSidebar from "../components/blog/BlogSidebar";
import Pagination from "../components/ui/Pagination";
import { getBlogsAPI } from "../services/api";

const PER_PAGE = 6;

export default function BlogListing() {
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getBlogsAPI().then(setPosts).catch(() => setPosts([]));
  }, []);

  const filtered = posts.filter((post) => post.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Blog" }]} />
      <div className="max-w-322.5 mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
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
                {visible.map((post, index) => (
                  <BlogListCard key={post._id} post={{ ...post, date: post.created_at, image: post.image || post.thumbnail }} isActive={index === 0} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {visible.map((post, index) => (
                  <BlogGridCard key={post._id} post={{ ...post, date: post.created_at, image: post.image || post.thumbnail }} isActive={index === 0} />
                ))}
              </div>
            )}

            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
          <div className="hidden lg:block">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </>
  );
}
