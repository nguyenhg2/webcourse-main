import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiAward, FiBookOpen, FiClock, FiDownload, FiPlay } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Breadcrumb from "../components/layout/Breadcrumb";
import { createComplaintAPI, downloadCertificateAPI, getMyCoursesAPI } from "../services/api";
import { courseFallbackImage, courseImage, useFallbackImage } from "../utils/courseImages";

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [complaint, setComplaint] = useState({ course_id: "", title: "", description: "" });
  const [complaintMessage, setComplaintMessage] = useState("");

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

  async function downloadCertificate(course) {
    const blob = await downloadCertificateAPI(course._id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificate-${course.slug || course._id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function submitComplaint(event) {
    event.preventDefault();
    setComplaintMessage("");
    await createComplaintAPI(complaint);
    setComplaint({ course_id: "", title: "", description: "" });
    setComplaintMessage("Yêu cầu đã được lưu vào MongoDB và chuyển đến bộ phận vận hành.");
  }

  function CourseCard({ course, done }) {
    return (
      <div className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <img
          src={courseImage(course)}
          alt={course.title}
          onError={(event) => useFallbackImage(event, courseFallbackImage(course))}
          className="h-44 w-full bg-gray-50 object-contain p-2"
        />
        <div className="p-5 flex flex-col gap-3">
          <Link to={`/khoa-hoc/${course.slug}`} className="text-base font-semibold text-secondary hover:text-primary transition-colors">
            {course.title}
          </Link>
          <p className="text-sm text-gray-500">{course.instructor?.name || "Giảng viên chưa cập nhật"}</p>
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
          <div className="mt-1 flex flex-col gap-2">
            <Link
              to={!done && course.lastLessonId ? `/khoa-hoc/${course.slug}/hoc/${course.lastLessonId}` : `/khoa-hoc/${course.slug}`}
              className={`w-full py-2.5 text-sm font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-2 ${done ? "border border-primary text-primary hover:bg-primary hover:text-white" : "bg-primary text-white hover:bg-orange-600"}`}
            >
              <FiPlay size={14} /> {done ? "Xem lại khóa học" : "Tiếp tục học"}
            </Link>
            {done && (
              <button onClick={() => downloadCertificate(course)} className="w-full py-2.5 text-sm font-semibold rounded-lg border border-success text-success hover:bg-success hover:text-white transition-colors flex items-center justify-center gap-2">
                <FiDownload size={14} /> Tải chứng chỉ
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Khóa học của tôi" }]} />
      <div className="max-w-322.5 mx-auto px-5 py-10">
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
              <FiAward size={18} className="text-success" /> Đã hoàn thành ({completed.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map((course) => <CourseCard key={course._id} course={course} done />)}
            </div>
          </div>
        )}

        {courses.length > 0 && (
          <div className="mt-12 rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary">Gửi yêu cầu hỗ trợ</h2>
            <p className="mt-2 text-sm text-gray-500">Yêu cầu sẽ được lưu vào collection complaints để nhân viên vận hành xử lý.</p>
            <form onSubmit={submitComplaint} className="mt-5 grid gap-4 md:grid-cols-2">
              <select value={complaint.course_id} onChange={(e) => setComplaint({ ...complaint, course_id: e.target.value })} className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary">
                <option value="">Chọn khóa học liên quan</option>
                {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
              </select>
              <input value={complaint.title} onChange={(e) => setComplaint({ ...complaint, title: e.target.value })} placeholder="Tiêu đề yêu cầu" required className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
              <textarea value={complaint.description} onChange={(e) => setComplaint({ ...complaint, description: e.target.value })} placeholder="Mô tả vấn đề" required className="min-h-28 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary md:col-span-2" />
              <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-success">{complaintMessage}</p>
                <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white">Gửi yêu cầu</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
