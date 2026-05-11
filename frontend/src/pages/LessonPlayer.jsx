import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiCheckCircle, FiDownload, FiLock, FiMessageCircle, FiMoon, FiPlay, FiSun } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { getCourseBySlugAPI, getCourseReviewsAPI, getLessonAPI, getPreviewVideoAPI, getSignedVideoAPI, saveProgressAPI } from "../services/api";

function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

export default function LessonPlayer() {
  const { slug, lessonId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("content");
  const [message, setMessage] = useState("");

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
    setMessage("");
    if (!/^[a-f\d]{24}$/i.test(lessonId || "")) {
      getPreviewVideoAPI().then(setLesson).catch(() => setMessage("Không tải được video xem thử"));
      return;
    }

    getLessonAPI(lessonId)
      .then(setLesson)
      .catch(() => getSignedVideoAPI(lessonId).then(setLesson))
      .catch(() => getPreviewVideoAPI().then(setLesson))
      .catch(() => setMessage("Không tải được video bài học"));
  }, [lessonId]);

  const lessons = useMemo(() => (course?.sections || []).flatMap((section) => section.lessons || []), [course]);
  const totalLessons = lessons.length;
  const activeIndex = Math.max(lessons.findIndex((item) => item._id === lessonId), 0);
  const progressPercent = totalLessons ? Math.round(((activeIndex + 1) / totalLessons) * 100) : 0;
  const videoUrl = lesson?.video_url || lesson?.signed_url;

  async function markCompleted() {
    if (!lesson?._id || !lesson?.course_id) return;
    await saveProgressAPI({ lesson_id: lesson._id, course_id: lesson.course_id, completed: true });
    setMessage("Đã lưu tiến độ vào database");
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
                <video src={videoUrl} controls className="w-full h-full" />
              ) : (
                <p className="text-white text-sm">{message || "Đang tải video..."}</p>
              )}
            </div>
          </section>

          <section className={`${panel} border rounded-lg p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-heading font-bold">{lesson?.title || "Bài học"}</h1>
                <p className={`text-sm ${muted} mt-2`}>Bài {activeIndex + 1} / {totalLessons || 1}</p>
              </div>
              <button onClick={markCompleted} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                <FiCheckCircle size={16} /> Hoàn thành
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
                  Nội dung bài học được lấy từ database. Video được phát từ đường dẫn Cloudinary của lesson hiện tại.
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
                      <span className="flex-1 truncate">{item.title}</span>
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
