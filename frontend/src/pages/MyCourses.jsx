import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiBookOpen, FiClock, FiPlay } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Breadcrumb from "../components/layout/Breadcrumb";
import { getMyCoursesAPI } from "../services/api";

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user) {
      getMyCoursesAPI().then(setCourses).catch(() => setCourses([]));
    }
  }, [user]);

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

  const inProgress = courses.filter((course) => course.progress < 100);
  const completed = courses.filter((course) => course.progress === 100);

  function CourseCard({ course, done }) {
    return (
      <div className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <img src={course.thumbnail || "https://placehold.co/600x400"} alt={course.title} className="w-full h-44 object-cover" />
        <div className="p-5 flex flex-col gap-3">
          <Link to={`/khoa-hoc/${course.slug}`} className="text-base font-semibold text-secondary hover:text-primary transition-colors">
            {course.title}
          </Link>
          <p className="text-sm text-gray-500">Đinh Thành Nguyên</p>
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{course.completedLessons}/{course.totalLessons} bài</span>
              <span>{course.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full">
              <div className={`h-full rounded-full ${done ? "bg-success" : "bg-primary"}`} style={{ width: `${course.progress}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiClock size={12} />
            <span>Bài gần nhất: {course.lastLesson}</span>
          </div>
          <Link
            to={!done && course.lastLessonId ? `/khoa-hoc/${course.slug}/hoc/${course.lastLessonId}` : `/khoa-hoc/${course.slug}`}
            className={`mt-1 w-full py-2.5 text-sm font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-2 ${done ? "border border-primary text-primary hover:bg-primary hover:text-white" : "bg-primary text-white hover:bg-orange-600"}`}
          >
            <FiPlay size={14} /> {done ? "Xem lại khóa học" : "Tiếp tục học"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Khóa học của tôi" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-8">Khóa học của tôi</h1>

        {courses.length === 0 && <p className="text-gray-500">Bạn chưa sở hữu khóa học nào.</p>}

        {inProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-secondary mb-5 flex items-center gap-2">
              <FiPlay size={18} className="text-primary" /> Đang học ({inProgress.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgress.map((course) => <CourseCard key={course._id} course={course} />)}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-secondary mb-5 flex items-center gap-2">
              <FiBookOpen size={18} className="text-success" /> Đã hoàn thành ({completed.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map((course) => <CourseCard key={course._id} course={course} done />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
