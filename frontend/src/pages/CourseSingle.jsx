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
  FiStar,
} from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import CommentForm from "../components/ui/CommentForm";
import CommentList from "../components/ui/CommentList";
import { addCartAPI, getCourseBySlugAPI, getCourseReviewsAPI, getMyCoursesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import useSiteContent from "../hooks/useSiteContent";

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
  const [reviews, setReviews] = useState([]);
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set());
  const [cartMessage, setCartMessage] = useState("");
  const { content: courseFaqContent } = useSiteContent("course_faqs", { items: [] });
  const faqs = courseFaqContent?.items || [];

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
                    src="https://placehold.co/120/564FFD/fff?text=GV"
                    alt="Giảng viên"
                    className="w-28 h-28 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-secondary">
                      Đinh Thành Nguyên
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Senior Frontend Developer
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
                      Hơn 10 năm kinh nghiệm phát triển phần mềm, chuyên gia
                      về kiến trúc frontend. Từng làm việc tại các công ty công
                      nghệ hàng đầu Việt Nam.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "faqs" && (
                <div className="flex flex-col gap-4">
                  {faqs.map((faq, i) => (
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
                        {course.rating || "4.0"}
                      </span>
                      <div className="flex gap-1 justify-center mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar
                            key={i}
                            size={16}
                            className={
                              i < Math.round(course.rating || 4)
                                ? "text-warning fill-warning"
                                : "text-gray-200"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {course.total_students} đánh giá
                      </p>
                    </div>
                  </div>
                  <CommentList comments={reviews} />
                  <CommentForm />
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-28 border border-gray-100 rounded-xl p-6 flex flex-col gap-5">
              <img
                src={course.thumbnail || "https://placehold.co/320x180"}
                alt={course.title}
                className="w-full rounded-lg"
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
                state={{ courseId: course._id, title: course.title, price: course.price, thumbnail: course.thumbnail }}
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
                      <FiStar size={12} className="text-warning fill-warning" />
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
