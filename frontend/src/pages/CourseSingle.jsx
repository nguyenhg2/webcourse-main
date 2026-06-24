import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiClock,
  FiUsers,
  FiBookOpen,
  FiBarChart,
  FiPlay,
  FiLock,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import CommentList from "../components/ui/CommentList";
import RatingStars from "../components/ui/RatingStars";
import { addCartAPI, createReviewAPI, getCourseBySlugAPI, getCourseReviewsAPI, getMyCoursesAPI, getSiteContentSectionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { courseFallbackImage, courseImage, useFallbackImage } from "../utils/courseImages";

const LEVEL_MAP = {
  beginner: "Người mới",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

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

export default function CourseSingle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, refreshCartCount } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [courseFaqs, setCourseFaqs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set());
  const [cartMessage, setCartMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMessage, setReviewMessage] = useState("");
  useEffect(() => {
    getSiteContentSectionAPI("course_faqs")
      .then((data) => setCourseFaqs(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setCourseFaqs([]));
  }, []);

  useEffect(() => {
    getCourseBySlugAPI(slug)
      .then((data) => {
        setCourse(data);
        getCourseReviewsAPI(data._id).then(setReviews).catch(() => setReviews([]));
        if (data.sections && data.sections.length > 0) {
          setExpandedSections({ 0: true });
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!user) {
      setOwnedCourseIds(new Set());
      return;
    }

    getMyCoursesAPI()
      .then((courses) => setOwnedCourseIds(new Set(courses.map((item) => item._id))))
      .catch(() => setOwnedCourseIds(new Set()));
  }, [user]);

  function toggleSection(i) {
    setExpandedSections((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  function toggleFaq(i) {
    setExpandedFaqs((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  async function addToCart() {
    setCartMessage("");

    if (!user) {
      navigate("/dang-nhap");
      return;
    }

    if (user.role !== "student") {
      setCartMessage("Chỉ tài khoản học viên mới có thể thêm khóa học vào giỏ hàng.");
      return;
    }

    try {
      await addCartAPI(course._id);
      await refreshCartCount();
      navigate("/gio-hang");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/dang-nhap");
        return;
      }
      setCartMessage(err.response?.data?.detail || "Không thêm được khóa học vào giỏ hàng.");
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    setReviewMessage("");

    if (!user) {
      setReviewMessage("Vui lòng đăng nhập để đánh giá khóa học.");
      return;
    }
    if (!hasCourseAccess) {
      setReviewMessage("Bạn cần mua khóa học trước khi đánh giá.");
      return;
    }

    try {
      const created = await createReviewAPI({
        course_id: course._id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });
      setReviews((items) => [created, ...items]);
      setReviewForm({ rating: 5, comment: "" });
      setReviewMessage("Đã lưu đánh giá vào cơ sở dữ liệu.");
    } catch (err) {
      setReviewMessage(err.response?.data?.detail || "Không gửi được đánh giá.");
    }
  }

  if (loading) {
    return (
      <div className="max-w-322.5 mx-auto px-5 py-20 text-center text-gray-500">
        Đang tải khóa học...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-322.5 mx-auto px-5 py-20 text-center text-gray-500">
        Không tìm thấy khóa học.
      </div>
    );
  }

  const levelText = LEVEL_MAP[course.level] || course.level;
  const priceText =
    course.price === 0
      ? "Miễn phí"
      : course.price.toLocaleString("vi-VN") + "đ";

  const totalLessons = course.sections
    ? course.sections.reduce(
        (sum, s) => sum + (s.lessons ? s.lessons.length : 0),
        0
      )
    : 0;
  const firstLesson = (course.sections || []).flatMap((section) => section.lessons || [])[0];
  const hasCourseAccess = ownedCourseIds.has(course._id);
  const learnPath = firstLesson ? `/khoa-hoc/${slug}/hoc/${firstLesson._id}` : `/khoa-hoc/${slug}`;
  const reviewCount = course.review_count ?? reviews.length;
  const ratingValue = Number(course.rating || 0);

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "curriculum", label: "Chương trình" },
    { id: "instructor", label: "Giảng viên" },
    { id: "faqs", label: "Câu hỏi thường gặp" },
    { id: "reviews", label: "Đánh giá" },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Trang chủ", to: "/" },
          { label: "Khóa học", to: "/khoa-hoc" },
          { label: course.title },
        ]}
      />
      <div className="max-w-322.5 mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <span className="text-sm font-medium text-primary bg-primary-light px-3 py-1 rounded-full">
              {levelText}
            </span>
            <h1 className="text-3xl font-heading font-bold text-secondary mt-4">
              {course.title}
            </h1>
            <p className="text-gray-600 mt-3">{course.description}</p>
            <div className="flex items-center gap-6 mt-5 text-sm text-gray-500">
              {course.duration && (
                <span className="flex items-center gap-1">
                  <FiClock size={14} /> {course.duration}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FiUsers size={14} /> {course.total_students} học viên
              </span>
              <span className="flex items-center gap-1">
                <FiBookOpen size={14} /> {totalLessons} bài học
              </span>
              <span className="flex items-center gap-1">
                <FiBarChart size={14} /> {levelText}
              </span>
            </div>

            <div className="flex gap-1 mt-8 border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    "px-5 py-3 text-sm font-medium border-b-2 transition-colors " +
                    (activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-secondary")
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {activeTab === "overview" && (
                <div className="prose max-w-none text-gray-600 leading-7">
                  <p>{course.description}</p>
                  <p className="mt-4">
                    Sau khi hoàn thành khóa học, bạn sẽ có thể tự tin áp dụng
                    kiến thức vào các dự án thực tế, nâng cao kỹ năng chuyên môn
                    và mở rộng cơ hội nghề nghiệp.
                  </p>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div className="flex flex-col gap-4">
                  {course.sections && course.sections.length > 0 ? (
                    course.sections.map((section, i) => (
                      <div
                        key={section._id}
                        className="border border-gray-100 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleSection(i)}
                          className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <span className="text-base font-semibold text-secondary">
                              {section.title}
                            </span>
                            <span className="text-sm text-gray-500 ml-3">
                              {section.lessons ? section.lessons.length : 0} bài
                            </span>
                          </div>
                          {expandedSections[i] ? (
                            <FiChevronUp size={18} />
                          ) : (
                            <FiChevronDown size={18} />
                          )}
                        </button>
                        {expandedSections[i] && section.lessons && (
                          <div className="divide-y divide-gray-100">
                            {section.lessons.map((lesson) => {
                              const canOpenLesson = hasCourseAccess || lesson.is_free_preview;
                              return (
                              <div
                                key={lesson._id}
                                className="flex items-center justify-between px-6 py-3"
                              >
                                <div className="flex items-center gap-3">
                                  {canOpenLesson ? (
                                    <FiPlay
                                      size={14}
                                      className="text-primary"
                                    />
                                  ) : (
                                    <FiLock
                                      size={14}
                                      className="text-gray-400"
                                    />
                                  )}
                                  {canOpenLesson ? (
                                    <Link to={`/khoa-hoc/${slug}/hoc/${lesson._id}`} className="text-sm text-gray-600 hover:text-primary">
                                      {displayLessonTitle(section, lesson)}
                                    </Link>
                                  ) : (
                                    <span className="text-sm text-gray-600">
                                      {displayLessonTitle(section, lesson)}
                                    </span>
                                  )}
                                  {lesson.is_free_preview && (
                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                      Xem thử
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDuration(lesson.duration)}
                                </span>
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      Chưa có nội dung chương trình.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "instructor" && (
                <div className="flex items-start gap-6">
                  <img
                    src={course.instructor?.avatar || "https://placehold.co/120/564FFD/fff?text=GV"}
                    alt={course.instructor?.name || "Giảng viên"}
                    className="w-28 h-28 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-secondary">
                      {course.instructor?.name || "Giảng viên chưa cập nhật"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {course.instructor?.title || course.instructor?.role || "Chưa cập nhật vai trò"}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiUsers size={14} /> {course.total_students} học viên
                      </span>
                      <span className="flex items-center gap-1">
                        <FiBookOpen size={14} /> {totalLessons} bài học
                      </span>
                    </div>
                    <p className="text-gray-600 mt-4 leading-7">
                      {course.instructor?.bio || "Chưa cập nhật thông tin giảng viên."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "faqs" && (
                <div className="flex flex-col gap-4">
                  {courseFaqs.length === 0 && <p className="text-sm text-gray-500">Chưa có FAQ khóa học trong cơ sở dữ liệu.</p>}
                  {courseFaqs.map((faq, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(i)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-base font-medium text-secondary">
                          {faq.q}
                        </span>
                        {expandedFaqs[i] ? (
                          <FiChevronUp
                            size={18}
                            className="text-gray-500 shrink-0"
                          />
                        ) : (
                          <FiChevronDown
                            size={18}
                            className="text-gray-500 shrink-0"
                          />
                        )}
                      </button>
                      {expandedFaqs[i] && (
                        <div className="px-6 pb-4 text-sm text-gray-600 leading-7">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="flex flex-col gap-10">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-4xl font-heading font-bold text-secondary">
                        {ratingValue.toFixed(1)}
                      </span>
                      <div className="flex justify-center mt-2">
                        <RatingStars value={ratingValue} />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                         {reviewCount} đánh giá
                      </p>
                    </div>
                  </div>
                  <CommentList comments={reviews} />
                  <form onSubmit={submitReview} className="rounded-xl border border-gray-100 p-5">
                    <h3 className="text-lg font-semibold text-secondary">Đánh giá khóa học</h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr]">
                      <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })} className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary">
                        {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} sao</option>)}
                      </select>
                      <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={4} required placeholder="Nhận xét sau khi học khóa này" className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className={`text-sm ${reviewMessage.includes("Đã lưu") ? "text-success" : "text-gray-500"}`}>{reviewMessage || "Chỉ học viên đã mua khóa học mới có thể đánh giá."}</p>
                      <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white">Gửi đánh giá</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-28 border border-gray-100 rounded-xl p-6 flex flex-col gap-5">
              <img
                src={courseImage(course)}
                alt={course.title}
                onError={(event) => useFallbackImage(event, courseFallbackImage(course))}
                className="aspect-video w-full rounded-lg bg-gray-50 object-contain p-2"
              />
              {!hasCourseAccess && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-primary">
                    {priceText}
                  </span>
                </div>
              )}
              {hasCourseAccess && (
                <Link
                  to={learnPath}
                  className="w-full py-3 bg-success text-white font-semibold rounded-lg text-center hover:bg-green-600 transition-colors"
                >
                  Vào học
                </Link>
              )}
              {!hasCourseAccess && (!user || user.role === "student") && (
                <>
              <Link
                to={user ? "/thanh-toan" : "/dang-nhap"}
                state={{ courseId: course._id, title: course.title, price: course.price, thumbnail: courseImage(course) }}
                className="w-full py-3 bg-primary text-white font-semibold rounded-lg text-center hover:bg-orange-600 transition-colors"
              >
                Bắt đầu ngay
              </Link>
              <button onClick={addToCart} className="w-full py-3 border border-primary text-primary font-semibold rounded-lg text-center hover:bg-primary-light transition-colors">
                Thêm vào giỏ hàng
              </button>
                </>
              )}
              {user && user.role !== "student" && (
                <p className="text-sm text-gray-500">
                  Tài khoản quản trị/giảng viên/vận hành không thể mua khóa học.
                </p>
              )}
              {cartMessage && <p className="text-sm text-red-500">{cartMessage}</p>}
              <div className="flex flex-col gap-3 text-sm text-gray-600">
                {course.duration && (
                  <div className="flex justify-between">
                    <span>Thời lượng</span>
                    <span className="font-medium text-secondary">
                      {course.duration}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Bài học</span>
                  <span className="font-medium text-secondary">
                    {totalLessons}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Học viên</span>
                  <span className="font-medium text-secondary">
                    {course.total_students}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cấp độ</span>
                  <span className="font-medium text-secondary">
                    {levelText}
                  </span>
                </div>
                {course.rating > 0 && (
                  <div className="flex justify-between">
                    <span>Đánh giá</span>
                    <span className="font-medium text-secondary flex items-center gap-1">
                      <RatingStars value={1} size={12} max={1} />
                      {course.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
