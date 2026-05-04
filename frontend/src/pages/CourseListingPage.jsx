import { useState, useEffect } from "react";
import { FiSearch, FiGrid, FiList } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import CourseListCard from "../components/course/CourseListCard";
import CourseGridCard from "../components/course/CourseGridCard";
import CourseSidebar from "../components/course/CourseSidebar";
import Pagination from "../components/ui/Pagination";
import { getCoursesAPI } from "../services/api";

const PER_PAGE = 6;

export default function CourseListingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCoursesAPI()
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <Breadcrumb
        items={[{ label: "Trang chủ", to: "/" }, { label: "Khóa học" }]}
      />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="hidden lg:block">
            <CourseSidebar />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <FiSearch
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm kiếm khóa học..."
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={
                    "p-2.5 rounded-lg border transition-colors " +
                    (viewMode === "grid"
                      ? "border-primary text-primary bg-primary-light"
                      : "border-gray-200 text-gray-500")
                  }
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={
                    "p-2.5 rounded-lg border transition-colors " +
                    (viewMode === "list"
                      ? "border-primary text-primary bg-primary-light"
                      : "border-gray-200 text-gray-500")
                  }
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-20">
                Đang tải khóa học...
              </p>
            ) : visible.length === 0 ? (
              <p className="text-center text-gray-500 py-20">
                Không tìm thấy khóa học nào.
              </p>
            ) : viewMode === "list" ? (
              <div className="flex flex-col gap-6">
                {visible.map((course) => (
                  <CourseListCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((course) => (
                  <CourseGridCard key={course._id} course={course} />
                ))}
              </div>
            )}

            <Pagination
              current={page}
              total={totalPages}
              onChange={setPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
