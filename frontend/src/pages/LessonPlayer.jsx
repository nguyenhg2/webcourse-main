import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiCheckCircle, FiDownload, FiLock, FiMessageCircle, FiPlay } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { createLessonCommentAPI, getCourseBySlugAPI, getLessonAPI, getLessonCommentsAPI, getMyCoursesAPI, saveProgressAPI } from "../services/api";

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

function formatCommentDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function LessonPlayer() {
  const { slug, lessonId } = useParams();
  const { user, loading: authLoading, logout } = useAuth();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessonComments, setLessonComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [message, setMessage] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set());
  const [ownershipLoaded, setOwnershipLoaded] = useState(false);
  const savedLessonsRef = useRef(new Set());

  useEffect(() => {
    getCourseBySlugAPI(slug)
      .then(setCourse)
      .catch(() => setCourse(null));
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
    setCommentMessage("");
    setLessonComments([]);
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

  useEffect(() => {
    if (!lesson?._id || !user) {
      setLessonComments([]);
      return;
    }

    let cancelled = false;
    getLessonCommentsAPI(lesson._id)
      .then((items) => {
        if (!cancelled) setLessonComments(items);
      })
      .catch(() => {
        if (!cancelled) setLessonComments([]);
      });

    return () => {
      cancelled = true;
    };
  }, [lesson?._id, user]);

  const lessons = useMemo(() => (course?.sections || []).flatMap((section) => section.lessons || []), [course]);
  const currentLessonSection = useMemo(
    () => (course?.sections || []).find((section) => (section.lessons || []).some((item) => item._id === lessonId)),
    [course, lessonId]
  );
  const totalLessons = lessons.length;
  const activeIndex = Math.max(lessons.findIndex((item) => item._id === lessonId), 0);
  const progressPercent = totalLessons ? Math.round(((activeIndex + 1) / totalLessons) * 100) : 0;
  const videoUrl = lesson?.video_url || lesson?.signed_url;
  const currentCourseId = course?._id || lesson?.course_id;
  const hasCourseAccess = Boolean(currentCourseId && ownedCourseIds.has(currentCourseId));

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
      setMessage("Đã lưu tiến độ vào cơ sở dữ liệu");
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

  async function handleSubmitComment(event) {
    event.preventDefault();
    setCommentMessage("");

    const content = commentContent.trim();
    if (!content) {
      setCommentMessage("Vui lòng nhập nội dung câu hỏi.");
      return;
    }

    if (!lesson?._id || !lesson?.course_id) {
      setCommentMessage("Chưa tải được bài học hiện tại.");
      return;
    }

    if (!user) {
      setCommentMessage("Vui lòng đăng nhập để gửi câu hỏi.");
      return;
    }

    if (!ownershipLoaded) {
      setCommentMessage("Đang kiểm tra quyền truy cập khóa học...");
      return;
    }

    if (user.role === "student" && !ownedCourseIds.has(lesson.course_id)) {
      setCommentMessage("Bạn cần mua khóa học này để gửi câu hỏi cho giảng viên.");
      return;
    }

    setSavingComment(true);
    try {
      const created = await createLessonCommentAPI(lesson._id, content);
      setLessonComments((prev) => [created, ...prev]);
      setCommentContent("");
      setCommentMessage("Đã gửi câu hỏi.");
    } catch (error) {
      const detail = error.response?.data?.detail;
      setCommentMessage(detail || "Không gửi được câu hỏi. Vui lòng thử lại.");
    } finally {
      setSavingComment(false);
    }
  }

  const bg = "bg-[#f5f7fa]";
  const panel = "bg-white border-gray-100";
  const text = "text-secondary";
  const muted = "text-gray-500";

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      <div className={`${panel} border-b px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <Link to={`/khoa-hoc/${slug}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <FiArrowLeft size={16} /> Quay lại
          </Link>
          <span className="text-sm font-medium">{course?.title || "Đang tải khóa học..."}</span>
        </div>
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
                ["qa", "Hỏi đáp"],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === id ? "border-primary text-primary" : "border-transparent " + muted}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeTab === "content" && (
                <p className={`${muted} leading-7 text-sm`}>
                      Nội dung bài học được lấy từ cơ sở dữ liệu. Video được phát từ đường dẫn Cloudinary của bài học hiện tại.
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
                  <form onSubmit={handleSubmitComment} className="rounded-lg border border-gray-100 p-4">
                    <label htmlFor="lesson-comment" className="text-sm font-semibold text-gray-900">
                      Hỏi giảng viên về bài học này
                    </label>
                    <textarea
                      id="lesson-comment"
                      value={commentContent}
                      onChange={(event) => setCommentContent(event.target.value)}
                      rows={4}
                      className="mt-3 w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                      placeholder="Nhập câu hỏi hoặc vấn đề bạn gặp trong video..."
                      disabled={savingComment}
                    />
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className={`text-sm ${commentMessage === "Đã gửi câu hỏi." ? "text-success" : muted}`}>
                        {commentMessage || "Giảng viên sẽ thấy câu hỏi trong luồng thảo luận của bài học."}
                      </p>
                      <button
                        type="submit"
                        disabled={savingComment || !commentContent.trim()}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        <FiMessageCircle size={16} /> {savingComment ? "Đang gửi..." : "Gửi câu hỏi"}
                      </button>
                    </div>
                  </form>

                  {lessonComments.length === 0 && <p className={`text-sm ${muted}`}>Chưa có câu hỏi nào cho bài học này.</p>}
                  {lessonComments.map((comment) => (
                    <div key={comment._id} className="p-4 rounded-lg border border-gray-100">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <FiMessageCircle size={14} className="text-primary" />
                        <span className="font-semibold text-gray-900">{comment.user_name || "Học viên"}</span>
                        {comment.user_role === "instructor" && <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">Giảng viên</span>}
                        <span className={muted}>{formatCommentDate(comment.created_at)}</span>
                      </div>
                      <p className={`text-sm ${muted} mt-2 whitespace-pre-line`}>{comment.content}</p>
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
                  const accessPending = Boolean(user && !ownershipLoaded);
                  const locked = !accessPending && !hasCourseAccess && !item.is_free_preview;
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
