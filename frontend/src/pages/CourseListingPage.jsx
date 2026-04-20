import { useState } from "react";
import { FiSearch, FiGrid, FiList } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import CourseListCard from "../components/course/CourseListCard";
import CourseGridCard from "../components/course/CourseGridCard";
import CourseSidebar from "../components/course/CourseSidebar";
import Pagination from "../components/ui/Pagination";

const COURSES = [
  { id: 1, slug: "react-js-tu-co-ban-den-nang-cao", title: "React.js Từ Cơ Bản Đến Nâng Cao", category: "Web Development", instructor: "Đinh Thành Nguyên", image: "https://placehold.co/410x230", duration: "2 Tuần", students: 156, level: "Tất cả cấp độ", lessons: 20, price: 0, originalPrice: 399000 },
  { id: 2, slug: "python-cho-nguoi-moi-bat-dau", title: "Python Cho Người Mới Bắt Đầu", category: "Python", instructor: "Nguyễn Phương Tây", image: "https://placehold.co/410x230", duration: "3 Tuần", students: 234, level: "Người mới", lessons: 25, price: 299000, originalPrice: 599000 },
  { id: 3, slug: "nodejs-va-express", title: "Node.js và Express Framework", category: "Web Development", instructor: "Đinh Thành Nguyên", image: "https://placehold.co/410x230", duration: "4 Tuần", students: 98, level: "Cơ bản", lessons: 30, price: 0, originalPrice: 499000 },
  { id: 4, slug: "lap-trinh-android-voi-kotlin", title: "Lập Trình Android Với Kotlin", category: "Ứng dụng di động", instructor: "Nguyễn Phương Tây", image: "https://placehold.co/410x230", duration: "5 Tuần", students: 120, level: "Cơ bản", lessons: 35, price: 499000, originalPrice: 799000 },
  { id: 5, slug: "docker-va-kubernetes", title: "Docker và Kubernetes Thực Chiến", category: "DevOps & Cloud", instructor: "Đinh Thành Nguyên", image: "https://placehold.co/410x230", duration: "3 Tuần", students: 87, level: "Chuyên gia", lessons: 22, price: 599000, originalPrice: 899000 },
  { id: 6, slug: "javascript-nang-cao", title: "JavaScript Nâng Cao và Design Patterns", category: "JavaScript", instructor: "Nguyễn Phương Tây", image: "https://placehold.co/410x230", duration: "4 Tuần", students: 145, level: "Cơ bản", lessons: 28, price: 0, originalPrice: 499000 },
];

export default function CourseListingPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = COURSES.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Khóa học" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="hidden lg:block">
            <CourseSidebar />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm khóa học..."
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg border transition-colors ${viewMode === "grid" ? "border-primary text-primary bg-primary-light" : "border-gray-200 text-gray-500"}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg border transition-colors ${viewMode === "list" ? "border-primary text-primary bg-primary-light" : "border-gray-200 text-gray-500"}`}
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="flex flex-col gap-6">
                {filtered.map((course) => (
                  <CourseListCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((course) => (
                  <CourseGridCard key={course.id} course={course} />
                ))}
              </div>
            )}

            <Pagination current={page} total={3} onChange={setPage} />
          </div>
        </div>
      </div>
    </>
  );
}
