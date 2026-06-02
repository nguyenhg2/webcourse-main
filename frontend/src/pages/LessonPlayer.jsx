import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiCheckCircle, FiDownload, FiLock, FiMessageCircle, FiMoon, FiPlay, FiSun } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getCourseBySlugAPI, getCourseReviewsAPI, getLessonAPI, getMyCoursesAPI, saveProgressAPI } from "../services/api";

function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function displayLessonTitle(section, lesson) {
  const sectionOrder = Number(section?.order || 1);
  const lessonOrder = Number(lesson?.order || 1);
  const cleanTitle = String(lesson?.title || "")
    .replace(/^(Bài|Bai|Lesson)\s+\d+(?:\.\d+)+\s*[-–—:]\s*/i, "")
    .replace(/^(Bài|Bai|Lesson)\s+\d+(?:\.\d+)+\s*/i, "")
    .trim();

  return cleanTitle
    ? `Bài ${sectionOrder}.${lessonOrder} - ${cleanTitle}`
    : `Bài ${sectionOrder}.${lessonOrder}`;
}

export default function LessonPlayer() {
  const { slug, lessonId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, logout } = useAuth();
  const isDark = theme === "dark";

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("content");
  const [message, setMessage] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set());
  const [ownershipLoaded, setOwnershipLoaded] = useState(false);
  const savedLessonsRef = useRef(new Set());

  useEffect(() => {
    getCourseBySlugAPI(slug)
      .then((data) => {
        setCourse(data);
        return getCourseReviewsAPI(data._id);
      })
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [slug]);

  useEffect(() => {
    if (!user) {
      setOwnedCourseIds(new Set());
      setOwnershipLoaded(true);
      return;
    }

    setOwnershipLoaded(false);
    getMyCoursesAPI()
      .then((courses) => setOwnedCourseIds(new Set(courses.map((item) => item._id))))
      .catch(() => setOwnedCourseIds(new Set()))
      .finally(() => setOwnershipLoaded(true));
  }, [user]);

  useEffect(() => {
    setMessage("");
    if (!/^[a-f\d]{24}$/i.test(lessonId || "")) {
      setLesson(null);
      setMessage("Bài học không hợp lệ");
      return;
    }

    let cancelled = false;

    async function loadLesson() {
      try {
        const data = await getLessonAPI(lessonId);
        if (!cancelled) setLesson(data);
      } catch (error) {
        const status = error.response?.status;
        const detail = error.response?.data?.detail;

        if (status === 401) {
          if (!cancelled) {
            setLesson(null);
            setMessage(detail || "Vui lòng đăng nhập để xem bài học này.");
          }
          return;
        }

        if (status === 403) {
          if (!cancelled) {
            setLesson(null);
            setMessage(detail || "Bạn cần mua khóa học này để xem nội dung.");
          }
          return;
        }

        if (!cancelled) {
          setLesson(null);
          setMessage(detail || "Không tải được video bài học");
        }
      }
    }

    loadLesson();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const lessons = useMemo(() => (course?.sections || []).flatMap((section) => section.lessons || []), [course]);
  const currentLessonSection = useMemo(
    () => (course?.sections || []).find((section) => (section.lessons || []).some((item) => item._id === lessonId)),
    [course, lessonId]
  );
  const totalLessons = lessons.length;
  const activeIndex = Math.max(lessons.findIndex((item) => item._id === lessonId), 0);
  const progressPercent = totalLessons ? Math.round(((activeIndex + 1) / totalLessons) * 100) : 0;
  const videoUrl = lesson?.video_url || lesson?.signed_url;

  async function markCompleted() {
    if (!lesson?._id || !lesson?.course_id) return;

    if (authLoading) {
      setMessage("Đang kiểm tra đăng nhập...");
      return;
    }

    if (!user && !localStorage.getItem("token")) {
      setMessage("Vui lòng đăng nhập để lưu tiến độ.");
      return;
    }

    if (!ownershipLoaded) {
      setMessage("Đang kiểm tra quyền truy cập khóa học...");
      return;
    }

    if (!ownedCourseIds.has(lesson.course_id)) {
      setMessage("Bạn chưa mua khóa học này nên chưa thể lưu tiến độ.");
      return;
    }

    setSavingProgress(true);
    try {
      await saveProgressAPI({ lesson_id: lesson._id, course_id: lesson.course_id, completed: true });
      setMessage("Đã lưu tiến độ vào database");
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 401) {
        logout();
        setMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else if (status === 403) {
        setMessage(detail || "Bạn chưa mua khóa học này nên chưa thể lưu tiến độ.");
      } else {
        setMessage(detail || "Không lưu được tiến độ. Vui lòng thử lại.");
      }
    } finally {
      setSavingProgress(false);
    }
  }

  function autoSaveCompleted() {
    if (!lesson?._id || savedLessonsRef.current.has(lesson._id)) return;
    savedLessonsRef.current.add(lesson._id);
    markCompleted();
  }

  function handleVideoProgress(event) {
    const video = event.currentTarget;
    if (!video.duration || Number.isNaN(video.duration)) return;
    if (video.currentTime / video.duration >= 0.9) {
      autoSaveCompleted();
    }
  }

  const bg = isDark ? "bg-[#0f1119]" : "bg-[#f5f7fa]";
  const panel = isDark ? "bg-[#1a1d2e] border-gray-700" : "bg-white border-gray-100";
  const text = isDark ? "text-white" : "text-secondary";
  const muted = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      <div className={`${panel} border-b px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <Link to={`/khoa-hoc/${slug}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <FiArrowLeft size={16} /> Quay lại
          </Link>
          <span className="text-sm font-medium">{course?.title || "Đang tải khóa học..."}</span>
        </div>
        <button onClick={toggleTheme} className={`p-2 rounded-lg ${muted}`}>
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 p-5">
        <main className="space-y-5">
          <section className={`${panel} border rounded-lg overflow-hidden`}>
            <div className="aspect-video bg-black flex items-center justify-center">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                  onTimeUpdate={handleVideoProgress}
                  onEnded={autoSaveCompleted}
                />
              ) : (
                <p className="text-white text-sm">{message || "Đang tải video..."}</p>
              )}
            </div>
          </section>

          <section className={`${panel} border rounded-lg p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-heading font-bold">
                  {lesson ? displayLessonTitle(currentLessonSection, lesson) : "Bài học"}
                </h1>
                <p className={`text-sm ${muted} mt-2`}>Bài {activeIndex + 1} / {totalLessons || 1}</p>
              </div>
              <button
                onClick={markCompleted}
                disabled={savingProgress || !lesson?._id || !lesson?.course_id}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiCheckCircle size={16} /> {savingProgress ? "Đang lưu..." : "Hoàn thành"}
              </button>
            </div>
            {message && <p className="text-sm text-success mt-4">{message}</p>}

            <div className="flex gap-1 border-b border-gray-100 mt-6">
              {[
                ["content", "Nội dung"],
                ["resources", "Tài liệu"],
                ["qa", "Đánh giá"],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === id ? "border-primary text-primary" : "border-transparent " + muted}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeTab === "content" && (
                <p className={`${muted} leading-7 text-sm`}>
                  Nội dung bài học được lấy từ database. Video được phát từ đường dẫn Cloudinary của bài học hiện tại.
                </p>
              )}

              {activeTab === "resources" && (
                <div className="flex flex-col gap-3">
                  {(lesson?.attachments || []).length === 0 && <p className={`text-sm ${muted}`}>Bài học chưa có tài liệu đính kèm.</p>}
                  {(lesson?.attachments || []).map((item, index) => (
                    <a key={index} href={item.url || "#"} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                      <span className="text-sm font-medium">{item.name || "Tài liệu"}</span>
                      <span className="text-primary flex items-center gap-1 text-sm"><FiDownload size={14} /> Tải xuống</span>
                    </a>
                  ))}
                </div>
              )}

              {activeTab === "qa" && (
                <div className="flex flex-col gap-4">
                  {reviews.length === 0 && <p className={`text-sm ${muted}`}>Chưa có đánh giá cho khóa học này.</p>}
                  {reviews.map((review) => (
                    <div key={review._id} className="p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <FiMessageCircle size={14} className="text-primary" /> {review.user_name || "Học viên"}
                      </div>
                      <p className={`text-sm ${muted} mt-2`}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className={`${panel} border rounded-lg h-fit overflow-hidden`}>
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold flex items-center gap-2"><FiBookOpen size={16} /> Nội dung khóa học</h3>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-4">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className={`text-xs ${muted} mt-2`}>{progressPercent}% tiến độ hiện tại</p>
          </div>

          <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
            {(course?.sections || []).map((section) => (
              <div key={section._id} className="border-b border-gray-100">
                <div className="px-5 py-3 font-medium text-sm">{section.title}</div>
                {(section.lessons || []).map((item) => {
                  const locked = !item.is_free_preview && !videoUrl && item._id !== lessonId;
                  return (
                    <Link
                      key={item._id}
                      to={`/khoa-hoc/${slug}/hoc/${item._id}`}
                      className={`flex items-center gap-3 px-5 py-3 text-sm hover:bg-primary-light ${item._id === lessonId ? "text-primary bg-primary-light" : muted}`}
                    >
                      {locked ? <FiLock size={14} /> : <FiPlay size={14} />}
                      <span className="flex-1 truncate">{displayLessonTitle(section, item)}</span>
                      <span className="text-xs">{formatDuration(item.duration)}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
