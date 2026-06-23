import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiDownload, FiExternalLink, FiLoader, FiPaperclip, FiPlayCircle, FiRefreshCw, FiUser, FiXCircle } from "react-icons/fi";
import { getCourseBySlugAPI, getCoursesAPI, reviewCourseAPI } from "../../../services/api";
import { courseImage } from "../../../utils/courseImages";

const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "pending_review", label: "Chờ duyệt" },
  { value: "draft", label: "Nháp" },
  { value: "rejected", label: "Cần sửa" },
  { value: "published", label: "Đã xuất bản" },
];

const LEVEL_LABELS = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function formatDuration(seconds) {
  const total = Number(seconds || 0);
  if (!total) return "--";
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

function statusLabel(status) {
  if (status === "pending_review") return "Chờ duyệt";
  if (status === "published") return "Đã xuất bản";
  if (status === "rejected") return "Cần sửa";
  if (status === "draft") return "Nháp";
  return "Nháp";
}

export default function CourseReviewManager() {
  const [status, setStatus] = useState("pending_review");
  const [courses, setCourses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function loadCourses(nextStatus = status) {
    setLoading(true);
    setMessage("");
    try {
      const data = await getCoursesAPI({ review_status: nextStatus });
      const list = nextStatus === "all"
        ? (Array.isArray(data) ? data : [])
        : (Array.isArray(data) ? data : []).filter((course) => course.status === nextStatus);
      setCourses(list);
      setSelectedId((current) => (list.some((course) => course._id === current) ? current : list[0]?._id || ""));
    } catch (err) {
      setCourses([]);
      setSelectedId("");
      setMessageType("error");
      setMessage(err.response?.data?.detail || "Không tải được danh sách khóa học cần kiểm duyệt.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course._id === selectedId),
    [courses, selectedId]
  );

  async function loadDetail(course = selectedCourse) {
    if (!course?.slug) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    setMessage("");
    try {
      const data = await getCourseBySlugAPI(course.slug);
      setDetail(data);
      setNote(data.review_note || "");
    } catch (err) {
      setDetail(null);
      setMessageType("error");
      setMessage(err.response?.data?.detail || "Không tải được nội dung khóa học.");
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadDetail(selectedCourse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function submitReview(nextStatus) {
    if (!selectedCourse?._id) return;
    setSaving(nextStatus);
    setMessage("");
    try {
      const updated = await reviewCourseAPI(selectedCourse._id, {
        status: nextStatus,
        review_note: note,
      });
      setCourses((current) => {
        const next = current.filter((course) => course._id !== updated._id);
        setSelectedId((currentId) => (currentId === updated._id ? next[0]?._id || "" : currentId));
        return next;
      });
      setDetail(null);
      setMessageType("success");
      setMessage(nextStatus === "published" ? "Đã duyệt và xuất bản khóa học." : "Đã từ chối và gửi khóa học về trạng thái cần sửa.");
      await loadCourses(status);
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || "Cập nhật kiểm duyệt thất bại.");
    } finally {
      setSaving("");
    }
  }

  const sections = detail?.sections || [];
  const lessons = sections.flatMap((section) => section.lessons || []);
  const missingVideoCount = lessons.filter((lesson) => !(lesson.has_video || lesson.video_url || lesson.video_public_id)).length;
  const attachmentCount = lessons.reduce((sum, lesson) => sum + (lesson.attachments || []).length, 0);
  const canReviewSelected = selectedCourse && selectedCourse.status !== "published";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kiểm duyệt khóa học</h1>
        </div>
        <button
          type="button"
          onClick={() => loadCourses(status)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
          Làm mới
        </button>
      </div>

      {message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${messageType === "error" ? "border-red-100 bg-red-50 text-red-600" : "border-green-100 bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-lg border border-gray-100 bg-white p-4">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatus(item.value)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${status === item.value ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:text-primary"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-lg border border-gray-100 bg-white">
          <div className="border-b border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-900">Danh sách khóa học</p>
            <p className="mt-1 text-xs text-gray-500">{loading ? "Đang tải..." : `${courses.length} khóa học`}</p>
          </div>
          <div className="max-h-[640px] overflow-y-auto p-2">
            {courses.map((course) => {
              const active = course._id === selectedId;
              return (
                <button
                  key={course._id}
                  type="button"
                  onClick={() => setSelectedId(course._id)}
                  className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${active ? "bg-primary-light text-primary" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <span className="block text-sm font-semibold">{course.title}</span>
                  <span className="mt-1 block text-xs text-gray-500">{LEVEL_LABELS[course.level] || course.level} · {formatCurrency(course.price)}</span>
                  <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{statusLabel(course.status)}</span>
                </button>
              );
            })}
            {!loading && courses.length === 0 && <div className="p-6 text-center text-sm text-gray-500">Không có khóa học trong trạng thái này.</div>}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            {selectedCourse ? (
              <div className="flex flex-col gap-5 xl:flex-row">
                <img src={courseImage(selectedCourse)} alt={selectedCourse.title} className="h-36 w-full rounded-lg bg-gray-50 object-contain p-2 xl:w-56" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h2>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{statusLabel(selectedCourse.status)}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{selectedCourse.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1"><FiUser size={13} /> {detail?.instructor?.name || selectedCourse.instructor?.name || "Chưa có giảng viên"}</span>
                    <span className="rounded-full bg-gray-50 px-2.5 py-1">{detail?.category?.name || selectedCourse.category?.name || selectedCourse.category_id || "Chưa có danh mục"}</span>
                    <span className="rounded-full bg-gray-50 px-2.5 py-1">{LEVEL_LABELS[selectedCourse.level] || selectedCourse.level}</span>
                    <span className="rounded-full bg-gray-50 px-2.5 py-1">{formatCurrency(selectedCourse.price)}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Phần</p><p className="mt-1 text-lg font-bold text-gray-900">{sections.length}</p></div>
                    <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Bài học</p><p className="mt-1 text-lg font-bold text-gray-900">{lessons.length}</p></div>
                    <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Thiếu video</p><p className="mt-1 text-lg font-bold text-gray-900">{missingVideoCount}</p></div>
                    <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Tệp học liệu</p><p className="mt-1 text-lg font-bold text-gray-900">{attachmentCount}</p></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chọn một khóa học để kiểm duyệt.</p>
            )}
          </div>

          {selectedCourse && (
            <div className="rounded-lg border border-gray-100 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Nội dung khóa học</h3>
                </div>
                {loadingDetail && <span className="inline-flex items-center gap-2 text-sm text-gray-500"><FiLoader className="animate-spin" /> Đang tải</span>}
              </div>

              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section._id} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-gray-900">{section.title}</h4>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">Phần {section.order || "-"}</span>
                    </div>
                    <div className="mt-3 divide-y divide-gray-100">
                      {(section.lessons || []).map((lesson) => (
                        <div key={lesson._id} className="py-4 text-sm">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <FiPlayCircle className="text-primary" size={17} />
                                <p className="font-semibold text-gray-900">{lesson.title}</p>
                                {lesson.is_free_preview && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Xem thử</span>}
                              </div>
                              <p className="mt-1 text-xs text-gray-500">Thứ tự {lesson.order || "-"} · Thời lượng {formatDuration(lesson.duration)} · ID {lesson._id}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${(lesson.has_video || lesson.video_public_id || lesson.video_url) ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                              {(lesson.has_video || lesson.video_public_id || lesson.video_url) ? "Co video" : "Thieu video"}
                            </span>
                          </div>

                          <div className="mt-3 rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-600">Video bài giảng</p>
                            {lesson.video_url ? (
                              <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                <p className="min-w-0 break-all text-xs text-gray-600">{lesson.video_url}</p>
                                <a href={lesson.video_url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline">
                                  Mở video <FiExternalLink size={13} />
                                </a>
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-red-600">Bài học chưa có video.</p>
                            )}
                            {lesson.video_public_id && <p className="mt-2 break-all text-xs text-gray-400">Cloudinary public id: {lesson.video_public_id}</p>}
                          </div>

                          {(lesson.attachments || []).length > 0 && (
                            <div className="mt-3 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
                                <FiPaperclip size={14} /> PDF, source code và tệp thực hành
                              </div>
                              <div className="divide-y divide-gray-100">
                                {(lesson.attachments || []).map((attachment, index) => (
                                  <a
                                    key={`${attachment.url || attachment.name}-${index}`}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-primary"
                                  >
                                    <span className="min-w-0 truncate">{attachment.name || "Tài liệu"}</span>
                                    <FiDownload className="shrink-0" size={14} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {(section.lessons || []).length === 0 && <p className="py-3 text-sm text-gray-500">Phần này chưa có bài học.</p>}
                    </div>
                  </div>
                ))}
                {!loadingDetail && sections.length === 0 && <div className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">Khóa học chưa có phần hoặc bài học.</div>}
              </div>
            </div>
          )}

          {canReviewSelected && (
            <div className="rounded-lg border border-gray-100 bg-white p-5">
              <h3 className="font-semibold text-gray-900">Ghi chú kiểm duyệt</h3>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Nhập yêu cầu chỉnh sửa hoặc ghi chú nội bộ..."
                className="mt-4 min-h-28 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => submitReview("published")}
                  disabled={Boolean(saving)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {saving === "published" ? <FiLoader className="animate-spin" /> : <FiCheckCircle size={16} />}
                  Duyệt và xuất bản
                </button>
                <button
                  type="button"
                  onClick={() => submitReview("rejected")}
                  disabled={Boolean(saving)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {saving === "rejected" ? <FiLoader className="animate-spin" /> : <FiXCircle size={16} />}
                  Từ chối
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

