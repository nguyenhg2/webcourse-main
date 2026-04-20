import { Link } from "react-router-dom";
import { FiBookOpen, FiClock, FiPlay } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Breadcrumb from "../components/layout/Breadcrumb";

const MY_COURSES = [
  {
    id: 1,
    slug: "react-js-tu-co-ban-den-nang-cao",
    title: "React.js Từ Cơ Bản Đến Nâng Cao",
    instructor: "Đinh Thành Nguyên",
    image: "https://placehold.co/410x230",
    progress: 35,
    totalLessons: 20,
    completedLessons: 7,
    lastLesson: "Tạo ứng dụng đầu tiên",
    lastLessonId: 3,
  },
  {
    id: 2,
    slug: "python-cho-nguoi-moi-bat-dau",
    title: "Python Cho Người Mới Bắt Đầu",
    instructor: "Nguyễn Phương Tây",
    image: "https://placehold.co/410x230",
    progress: 60,
    totalLessons: 25,
    completedLessons: 15,
    lastLesson: "Vòng lặp trong Python",
    lastLessonId: 10,
  },
  {
    id: 3,
    slug: "javascript-nang-cao",
    title: "JavaScript Nâng Cao và Design Patterns",
    instructor: "Nguyễn Phương Tây",
    image: "https://placehold.co/410x230",
    progress: 100,
    totalLessons: 28,
    completedLessons: 28,
    lastLesson: "Tổng kết khóa học",
    lastLessonId: 28,
  },
];

export default function MyCourses() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Khóa học của tôi" }]} />
        <div className="max-w-lg mx-auto px-5 py-20 text-center">
          <FiBookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold text-secondary">Bạn chưa đăng nhập</h2>
          <p className="text-gray-600 mt-3">Vui lòng đăng nhập để xem khóa học của bạn.</p>
          <Link to="/dang-nhap" className="inline-block mt-6 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </>
    );
  }

  const inProgress = MY_COURSES.filter((c) => c.progress < 100);
  const completed = MY_COURSES.filter((c) => c.progress === 100);

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Khóa học của tôi" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-8">Khóa học của tôi</h1>

        {inProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-secondary mb-5 flex items-center gap-2">
              <FiPlay size={18} className="text-primary" /> Đang học ({inProgress.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgress.map((course) => (
                <div key={course.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <img src={course.image} alt={course.title} className="w-full h-44 object-cover" />
                  <div className="p-5 flex flex-col gap-3">
                    <Link to={`/khoa-hoc/${course.slug}`} className="text-base font-semibold text-secondary hover:text-primary transition-colors">
                      {course.title}
                    </Link>
                    <p className="text-sm text-gray-500">{course.instructor}</p>
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>{course.completedLessons}/{course.totalLessons} bài</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FiClock size={12} />
                      <span>Bài gần nhất: {course.lastLesson}</span>
                    </div>
                    <Link
                      to={`/khoa-hoc/${course.slug}/hoc/${course.lastLessonId}`}
                      className="mt-1 w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg text-center hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiPlay size={14} /> Tiếp tục học
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-secondary mb-5 flex items-center gap-2">
              <FiBookOpen size={18} className="text-success" /> Đã hoàn thành ({completed.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map((course) => (
                <div key={course.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img src={course.image} alt={course.title} className="w-full h-44 object-cover" />
                    <span className="absolute top-3 right-3 bg-success text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Hoàn thành
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <Link to={`/khoa-hoc/${course.slug}`} className="text-base font-semibold text-secondary hover:text-primary transition-colors">
                      {course.title}
                    </Link>
                    <p className="text-sm text-gray-500">{course.instructor}</p>
                    <div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-success rounded-full" style={{ width: "100%" }} />
                      </div>
                      <p className="text-xs text-success mt-1.5">{course.totalLessons}/{course.totalLessons} bài đã hoàn thành</p>
                    </div>
                    <Link
                      to={`/khoa-hoc/${course.slug}`}
                      className="mt-1 w-full py-2.5 border border-primary text-primary text-sm font-semibold rounded-lg text-center hover:bg-primary hover:text-white transition-colors"
                    >
                      Xem lại khóa học
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
