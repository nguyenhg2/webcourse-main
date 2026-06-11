import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiBookOpen, FiRefreshCw, FiSearch, FiStar, FiUsers } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { getCoursesAPI } from "../../../services/api";

const LEVEL_LABELS = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const STATUS_LABELS = {
  draft: "Nháp",
  pending_review: "Chờ duyệt",
  published: "Đã xuất bản",
  rejected: "Cần sửa",
};

export default function InstructorStudents() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function loadCourses() {
    setLoading(true);
    setMessage("");
    try {
      const data = await getCoursesAPI({ manage: true });
      const list = Array.isArray(data) ? data : [];
      setCourses(list.filter((course) => course.instructor_id === user?._id));
    } catch (err) {
      setCourses([]);
      setMessage(err.response?.data?.detail || "Không tải được dữ liệu học viên theo khóa.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const visibleCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return courses;
    return courses.filter((course) => {
      const text = `${course.title || ""} ${course.level || ""} ${course.status || ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [courses, search]);

  const totalStudents = courses.reduce((sum, course) => sum + Number(course.total_students || 0), 0);
  const publishedCourses = courses.filter((course) => course.status === "published").length;
  const averageRating = courses.length
    ? (courses.reduce((sum, course) => sum + Number(course.rating || 0), 0) / courses.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Học viên theo khóa</h1>
          <p className="mt-1 text-gray-500">Theo dõi lượng học viên, trạng thái xuất bản và đánh giá của từng khóa bạn phụ trách.</p>
        </div>
        <button
          type="button"
          onClick={loadCourses}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
          Làm mới
        </button>
      </div>

      {message && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{message}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3 text-gray-500"><FiBookOpen size={18} /> Khóa học</div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{courses.length}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3 text-gray-500"><FiUsers size={18} /> Học viên</div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalStudents}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3 text-gray-500"><FiBookOpen size={18} /> Đã xuất bản</div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{publishedCourses}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3 text-gray-500"><FiStar size={18} /> Đánh giá TB</div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{averageRating}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm khóa học..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-4 text-left">Khóa học</th>
              <th className="p-4 text-left">Cấp độ</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Học viên</th>
              <th className="p-4 text-left">Đánh giá</th>
              <th className="p-4 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : visibleCourses.map((course) => (
              <tr key={course._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={course.thumbnail || "https://placehold.co/80x52?text=Kh%C3%B3a+h%E1%BB%8Dc"} alt={course.title} className="h-12 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-gray-900">{course.title}</p>
                      <p className="mt-1 text-xs text-gray-500">/{course.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{LEVEL_LABELS[course.level] || course.level || "-"}</td>
                <td className="p-4">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{STATUS_LABELS[course.status] || course.status || "-"}</span>
                </td>
                <td className="p-4 font-semibold text-gray-900">{course.total_students || 0}</td>
                <td className="p-4 text-gray-600">{Number(course.rating || 0).toFixed(1)}</td>
                <td className="p-4">
                  <Link to="/dashboard/courses" className="font-semibold text-primary hover:underline">Quản lý nội dung</Link>
                </td>
              </tr>
            ))}
            {!loading && visibleCourses.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chưa có khóa học phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
