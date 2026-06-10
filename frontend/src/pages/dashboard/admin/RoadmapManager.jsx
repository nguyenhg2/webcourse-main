import { useEffect, useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiEdit2,
  FiMap,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  createRoadmapAPI,
  deleteRoadmapAPI,
  getCoursesAPI,
  getRoadmapsAPI,
  updateRoadmapAPI,
} from "../../../services/api";

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  thumbnail: "",
  order: 1,
  course_ids: [],
};

const STATUS_LABELS = {
  draft: "Nháp",
  pending_review: "Chờ duyệt",
  published: "Đã xuất bản",
  rejected: "Cần sửa",
};

const LEVEL_LABELS = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeRoadmap(roadmap = {}) {
  return {
    ...EMPTY_FORM,
    ...roadmap,
    order: Number(roadmap.order || 1),
    course_ids: Array.isArray(roadmap.course_ids) ? roadmap.course_ids : [],
  };
}

function courseCount(roadmap) {
  return roadmap.course_ids?.length || roadmap.courses?.length || 0;
}

export default function RoadmapManager() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function loadData() {
    setLoading(true);
    setMessage("");
    try {
      const [roadmapData, courseData] = await Promise.all([
        getRoadmapsAPI(),
        getCoursesAPI({ manage: true }),
      ]);
      setRoadmaps(Array.isArray(roadmapData) ? roadmapData : []);
      setCourses(Array.isArray(courseData) ? courseData : []);
    } catch (err) {
      setRoadmaps([]);
      setCourses([]);
      setMessageType("error");
      setMessage(err.response?.data?.detail || "Không tải được dữ liệu lộ trình.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const courseById = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => map.set(course._id, course));
    return map;
  }, [courses]);

  const visibleRoadmaps = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return roadmaps;
    return roadmaps.filter((roadmap) => {
      const text = `${roadmap.title || ""} ${roadmap.description || ""} ${roadmap.slug || ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [roadmaps, search]);

  const visibleCourses = useMemo(() => {
    const keyword = courseSearch.trim().toLowerCase();
    if (!keyword) return courses;
    return courses.filter((course) => {
      const text = `${course.title || ""} ${course.level || ""} ${course.status || ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [courses, courseSearch]);

  function openCreate() {
    setForm({ ...EMPTY_FORM, order: roadmaps.length + 1 });
    setCourseSearch("");
    setModal({ mode: "create" });
  }

  function openEdit(roadmap) {
    setForm(normalizeRoadmap(roadmap));
    setCourseSearch("");
    setModal({ mode: "edit", id: roadmap._id });
  }

  function closeModal() {
    if (saving) return;
    setModal(null);
  }

  function updateForm(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !current.slug.trim()) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  function toggleCourse(courseId) {
    setForm((current) => {
      const selected = new Set(current.course_ids || []);
      if (selected.has(courseId)) {
        selected.delete(courseId);
      } else {
        selected.add(courseId);
      }
      return { ...current, course_ids: Array.from(selected) };
    });
  }

  async function saveRoadmap(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setMessageType("error");
      setMessage("Vui lòng nhập tên lộ trình.");
      return;
    }

    const payload = {
      title,
      slug: form.slug.trim() || slugify(title),
      description: form.description.trim(),
      thumbnail: form.thumbnail.trim(),
      order: Number(form.order || 1),
      course_ids: form.course_ids || [],
    };

    setSaving(true);
    setMessage("");
    try {
      if (modal.mode === "create") {
        await createRoadmapAPI({ ...payload, created_at: new Date().toISOString() });
      } else {
        await updateRoadmapAPI(modal.id, payload);
      }
      setModal(null);
      setMessageType("success");
      setMessage(modal.mode === "create" ? "Đã tạo lộ trình." : "Đã cập nhật lộ trình.");
      await loadData();
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || "Không lưu được lộ trình.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRoadmap(roadmap) {
    if (!confirm(`Xóa lộ trình "${roadmap.title}"?`)) return;
    setMessage("");
    try {
      await deleteRoadmapAPI(roadmap._id);
      setRoadmaps((current) => current.filter((item) => item._id !== roadmap._id));
      setMessageType("success");
      setMessage("Đã xóa lộ trình.");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || "Không xóa được lộ trình.");
    }
  }

  const selectedCourses = (form.course_ids || []).map((id) => courseById.get(id)).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lộ trình</h1>
          <p className="mt-1 text-gray-500">Quản trị viên tạo lộ trình học và sắp xếp các khóa học theo mục tiêu học tập.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
            Làm mới
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <FiPlus size={16} />
            Tạo lộ trình
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${messageType === "error" ? "border-red-100 bg-red-50 text-red-600" : "border-green-100 bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-100 bg-white p-5">
          <p className="text-sm text-gray-500">Lộ trình</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{roadmaps.length}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5">
          <p className="text-sm text-gray-500">Khóa học có thể chọn</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{courses.length}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5">
          <p className="text-sm text-gray-500">Tổng liên kết khóa học</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{roadmaps.reduce((sum, item) => sum + courseCount(item), 0)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, slug hoặc mô tả..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {loading && <div className="col-span-full rounded-lg border border-gray-100 bg-white p-10 text-center text-gray-500">Đang tải dữ liệu...</div>}

        {!loading && visibleRoadmaps.map((roadmap) => {
          const linkedCourses = (roadmap.course_ids || []).map((id) => courseById.get(id)).filter(Boolean);
          return (
            <article key={roadmap._id} className="overflow-hidden rounded-lg border border-gray-100 bg-white">
              <div className="grid gap-4 p-5 sm:grid-cols-[128px_1fr]">
                <div className="flex h-28 items-center justify-center rounded-lg bg-gray-50">
                  {roadmap.thumbnail ? (
                    <img src={roadmap.thumbnail} alt={roadmap.title} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <FiMap size={32} className="text-gray-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-gray-900">{roadmap.title}</h2>
                      <p className="mt-1 truncate text-sm text-gray-500">/{roadmap.slug || roadmap._id}</p>
                    </div>
                    <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">#{roadmap.order || 1}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{roadmap.description || "Chưa có mô tả."}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5"><FiBookOpen size={15} /> {courseCount(roadmap)} khóa học</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {linkedCourses.slice(0, 4).map((course) => (
                    <span key={course._id} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{course.title}</span>
                  ))}
                  {linkedCourses.length > 4 && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">+{linkedCourses.length - 4}</span>}
                  {linkedCourses.length === 0 && <span className="text-sm text-gray-400">Chưa chọn khóa học.</span>}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(roadmap)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
                  >
                    <FiEdit2 size={15} /> Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRoadmap(roadmap)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <FiTrash2 size={15} /> Xóa
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {!loading && visibleRoadmaps.length === 0 && (
          <div className="col-span-full rounded-lg border border-gray-100 bg-white p-10 text-center text-gray-500">Không có lộ trình phù hợp.</div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{modal.mode === "create" ? "Tạo lộ trình" : "Sửa lộ trình"}</h2>
                <p className="mt-1 text-sm text-gray-500">Chọn thông tin hiển thị và danh sách khóa học theo đúng thứ tự học.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Đóng">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={saveRoadmap} className="grid max-h-[calc(92vh-80px)] overflow-y-auto lg:grid-cols-[1fr_420px]">
              <section className="space-y-4 p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Tên lộ trình *</span>
                    <input
                      value={form.title}
                      onChange={(event) => updateForm("title", event.target.value)}
                      placeholder="VD: Frontend Developer"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-sm font-medium text-gray-700">Slug</span>
                    <input
                      value={form.slug}
                      onChange={(event) => updateForm("slug", slugify(event.target.value))}
                      placeholder="frontend-developer"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-sm font-medium text-gray-700">Thứ tự</span>
                    <input
                      type="number"
                      min="1"
                      value={form.order}
                      onChange={(event) => updateForm("order", event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="md:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Ảnh đại diện</span>
                    <input
                      value={form.thumbnail}
                      onChange={(event) => updateForm("thumbnail", event.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="md:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Mô tả</span>
                    <textarea
                      value={form.description}
                      onChange={(event) => updateForm("description", event.target.value)}
                      placeholder="Mục tiêu học tập, đầu ra và nhóm học viên phù hợp..."
                      className="min-h-32 w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Khóa học đã chọn</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedCourses.map((course) => (
                      <button
                        key={course._id}
                        type="button"
                        onClick={() => toggleCourse(course._id)}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-red-600"
                      >
                        {course.title} <FiX size={13} />
                      </button>
                    ))}
                    {selectedCourses.length === 0 && <p className="text-sm text-gray-500">Chưa chọn khóa học nào.</p>}
                  </div>
                </div>
              </section>

              <aside className="border-t border-gray-100 p-5 lg:border-l lg:border-t-0">
                <div className="sticky top-0 space-y-4 bg-white">
                  <div>
                    <h3 className="font-semibold text-gray-900">Chọn khóa học</h3>
                    <p className="mt-1 text-sm text-gray-500">Danh sách lấy từ dữ liệu khóa học quản trị.</p>
                  </div>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      value={courseSearch}
                      onChange={(event) => setCourseSearch(event.target.value)}
                      placeholder="Tìm khóa học..."
                      className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="max-h-[460px] overflow-y-auto rounded-lg border border-gray-100">
                    {visibleCourses.map((course) => {
                      const checked = form.course_ids.includes(course._id);
                      return (
                        <label key={course._id} className={`flex cursor-pointer gap-3 border-b border-gray-100 p-3 last:border-b-0 ${checked ? "bg-primary-light" : "bg-white hover:bg-gray-50"}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleCourse(course._id)} className="mt-1 accent-primary" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-gray-900">{course.title}</span>
                            <span className="mt-1 block text-xs text-gray-500">
                              {LEVEL_LABELS[course.level] || course.level || "Chưa có cấp độ"} · {STATUS_LABELS[course.status] || course.status || "Chưa có trạng thái"}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                    {visibleCourses.length === 0 && <div className="p-6 text-center text-sm text-gray-500">Không có khóa học phù hợp.</div>}
                  </div>
                </div>
              </aside>

              <div className="flex justify-end gap-3 border-t border-gray-100 p-5 lg:col-span-2">
                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  <FiCheck size={16} /> {saving ? "Đang lưu..." : "Lưu lộ trình"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
