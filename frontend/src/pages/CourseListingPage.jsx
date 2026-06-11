import { useState, useEffect } from "react";
import { FiSearch, FiGrid, FiList } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/layout/Breadcrumb";
import CourseListCard from "../components/course/CourseListCard";
import CourseGridCard from "../components/course/CourseGridCard";
import CourseSidebar from "../components/course/CourseSidebar";
import Pagination from "../components/ui/Pagination";
import { addCartAPI, getCartAPI, getCoursesAPI, getMyCoursesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const PER_PAGE = 6;

export default function CourseListingPage() {
  const { user, refreshCartCount } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set());
  const [cartCourseIds, setCartCourseIds] = useState(new Set());
  const [addingCartId, setAddingCartId] = useState("");

  useEffect(() => {
    getCoursesAPI()
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role !== "student") {
      setOwnedCourseIds(new Set());
      setCartCourseIds(new Set());
      return;
    }

    getMyCoursesAPI()
      .then((items) => setOwnedCourseIds(new Set(items.map((item) => item._id))))
      .catch(() => setOwnedCourseIds(new Set()));
    getCartAPI()
      .then((data) => setCartCourseIds(new Set((data.items || []).map((item) => item._id))))
      .catch(() => setCartCourseIds(new Set()));
  }, [user]);

  async function handleAddCart(course) {
    if (!user) {
      window.location.href = "/dang-nhap";
      return;
    }
    if (user.role !== "student" || ownedCourseIds.has(course._id) || cartCourseIds.has(course._id)) {
      return;
    }

    setAddingCartId(course._id);
    try {
      await addCartAPI(course._id);
      setCartCourseIds((current) => new Set([...current, course._id]));
      await refreshCartCount?.();
    } finally {
      setAddingCartId("");
    }
  }

  useEffect(() => {
    const categories = searchParams.get("category");
    setSelectedCategories(categories ? categories.split(",").filter(Boolean) : []);
    setPage(1);
  }, [searchParams]);

  function toggleValue(setter, value) {
    setter((current) => {
      setPage(1);
      return current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
    });
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedRatings([]);
    setSearchParams({});
    setPage(1);
  }

  const sidebarProps = {
    selectedCategories,
    selectedLevels,
    selectedRatings,
    onToggleCategory: (id) => {
      const nextCategories = selectedCategories.includes(id)
        ? selectedCategories.filter((item) => item !== id)
        : [...selectedCategories, id];
      setSelectedCategories(nextCategories);
      setPage(1);
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (nextCategories.length) {
          next.set("category", nextCategories.join(","));
        } else {
          next.delete("category");
        }
        return next;
      });
    },
    onToggleLevel: (level) => toggleValue(setSelectedLevels, level),
    onToggleRating: (rating) => toggleValue(setSelectedRatings, rating),
    onClearFilters: clearFilters,
  };

  const minRating = selectedRatings.length ? Math.min(...selectedRatings) : 0;
  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(c.category_id);
    const matchesLevel =
      selectedLevels.length === 0 || selectedLevels.includes(c.level);
    const matchesRating = !minRating || Number(c.rating || 0) >= minRating;
    return matchesSearch && matchesCategory && matchesLevel && matchesRating;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <Breadcrumb
        items={[{ label: "Trang chủ", to: "/" }, { label: "Khóa học" }]}
      />
      <div className="max-w-322.5 mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="hidden lg:block">
            <CourseSidebar {...sidebarProps} />
          </div>
          <div className="flex-1">
            <div className="lg:hidden mb-6 border border-gray-100 rounded-lg p-4">
              <CourseSidebar {...sidebarProps} />
            </div>
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
                  <CourseListCard
                    key={course._id}
                    course={course}
                    isOwned={ownedCourseIds.has(course._id)}
                    isInCart={cartCourseIds.has(course._id)}
                    isAdding={addingCartId === course._id}
                    onAddCart={handleAddCart}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((course) => (
                  <CourseGridCard
                    key={course._id}
                    course={course}
                    isOwned={ownedCourseIds.has(course._id)}
                    isInCart={cartCourseIds.has(course._id)}
                    isAdding={addingCartId === course._id}
                    onAddCart={handleAddCart}
                  />
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
