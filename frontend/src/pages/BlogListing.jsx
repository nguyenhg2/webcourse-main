import { useState } from "react";
import { FiSearch, FiGrid, FiList } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import BlogListCard from "../components/blog/BlogListCard";
import BlogGridCard from "../components/blog/BlogGridCard";
import BlogSidebar from "../components/blog/BlogSidebar";
import Pagination from "../components/ui/Pagination";

const POSTS = [
  {
    id: 1,
    slug: "5-ngon-ngu-lap-trinh-2026",
    title: "5 Ngon Ngu Lap Trinh Nen Hoc Nam 2026",
    date: "Jan 24, 2026",
    image: "https://placehold.co/480x292",
    excerpt:
      "Tong hop cac ngon ngu lap trinh duoc san don nhat tren thi truong viec lam hien nay...",
  },
  {
    id: 2,
    slug: "lo-trinh-frontend-tu-zero",
    title: "Lo Trinh Hoc Frontend Tu Zero",
    date: "Jan 24, 2026",
    image: "https://placehold.co/480x292",
    excerpt:
      "Huong dan chi tiet cho nguoi moi bat dau muon tro thanh Frontend Developer chuyen nghiep...",
    active: true,
  },
  {
    id: 3,
    slug: "tai-sao-nen-hoc-docker",
    title: "Tai Sao Nen Hoc Docker Trong Nam Nay?",
    date: "Jan 24, 2026",
    image: "https://placehold.co/480x292",
    excerpt:
      "Docker dang tro thanh ky nang bat buoc voi moi developer. Tim hieu ly do va cach bat dau...",
  },
  {
    id: 4,
    slug: "react-vs-vue-vs-angular",
    title: "So Sanh React vs Vue vs Angular",
    date: "Jan 24, 2026",
    image: "https://placehold.co/480x292",
    excerpt:
      "Phan tich chi tiet uu nhuoc diem cua 3 framework frontend pho bien nhat hien nay...",
  },
  {
    id: 5,
    slug: "10-meo-debug-javascript",
    title: "10 Meo Debug JavaScript Hieu Qua",
    date: "Jan 24, 2026",
    image: "https://placehold.co/480x292",
    excerpt:
      "Nhung ky thuat debug giup ban tiet kiem hang gio tim loi trong code JavaScript...",
  },
  {
    id: 6,
    slug: "rest-api-la-gi",
    title: "REST API La Gi? Huong Dan Cho Nguoi Moi",
    date: "Jan 24, 2026",
    image: "https://placehold.co/480x292",
    excerpt:
      "Tim hieu ve REST API, cach hoat dong va xay dung API dau tien voi Node.js va Express...",
  },
];

export default function BlogListing() {
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = POSTS.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Trang chu", href: "/" },
          { label: "Blog" },
        ]}
      />

      <section className="py-14">
        <div className="max-w-[1290px] mx-auto px-4 flex gap-7">
          <div className="flex-1 flex flex-col gap-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-64 pb-1 border-b border-secondary flex justify-between items-center">
                  <input
                    type="text"
                    placeholder="Tim kiem"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 text-lg bg-transparent focus:outline-none"
                  />
                  <FiSearch size={20} className="text-secondary" />
                </div>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`transition-colors ${
                    viewMode === "grid" ? "text-primary" : "text-secondary"
                  }`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`transition-colors ${
                    viewMode === "list" ? "text-primary" : "text-secondary"
                  }`}
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="flex flex-col gap-7">
                {filtered.map((post) => (
                  <BlogListCard
                    key={post.id}
                    post={post}
                    isActive={post.active}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {filtered.map((post) => (
                  <BlogGridCard
                    key={post.id}
                    post={post}
                    isActive={post.active}
                  />
                ))}
              </div>
            )}

            <Pagination current={page} total={3} onChange={setPage} />
          </div>

          <div className="hidden lg:block">
            <BlogSidebar />
          </div>
        </div>
      </section>
    </>
  );
}
