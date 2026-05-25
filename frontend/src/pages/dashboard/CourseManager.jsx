import { useEffect, useMemo, useState } from "react";
import { FiCopy, FiUploadCloud } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getCoursesAPI, uploadLessonVideoAPI } from "../../services/api";

export default function CourseManager() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [upload, setUpload] = useState(null);
  const [message, setMessage] = useState("");
  const canUpload = user?.role === "admin" || user?.role === "instructor";

  useEffect(() => {
    getCoursesAPI().then(setCourses).catch(() => setCourses([]));
  }, []);

  const visibleCourses = useMemo(() => {
    if (user?.role !== "instructor") return courses;
    const mine = courses.filter((course) => course.instructor_id === user._id);
    return mine.length ? mine : courses;
  }, [courses, user]);

  async function uploadVideo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    setUpload(null);
    try {
      const data = await uploadLessonVideoAPI(file);
      setUpload(data);
      setMessage("Upload video thành công.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Upload thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function copy(value) {
    navigator.clipboard?.writeText(value);
    setMessage("Đã sao chép đường dẫn video.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h1>
        <p className="text-gray-500 mt-1">Theo dõi khóa học và upload video bài giảng lên Cloudinary.</p>
      </div>

      {canUpload && (
        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <label className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg font-semibold cursor-pointer">
            <FiUploadCloud size={18} /> {uploading ? "Đang upload..." : "Upload video"}
            <input type="file" accept="video/*" onChange={uploadVideo} className="hidden" />
          </label>
          {message && <p className={`text-sm mt-4 ${upload ? "text-success" : "text-gray-600"}`}>{message}</p>}
          {upload?.video_url && (
            <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-secondary">Video URL</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm text-gray-600 break-all flex-1">{upload.video_url}</p>
                <button onClick={() => copy(upload.video_url)} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-primary">
                  <FiCopy size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                <span>Public ID: {upload.public_id || "-"}</span>
                <span>Duration: {Math.round(upload.duration || 0)}s</span>
                <span>Format: {upload.format || "-"}</span>
                <span>Size: {Math.round((upload.bytes || 0) / 1024)} KB</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-4">Khóa học</th>
              <th className="text-left p-4">Cấp độ</th>
              <th className="text-left p-4">Giá</th>
              <th className="text-left p-4">Học viên</th>
              <th className="text-left p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleCourses.map((course) => (
              <tr key={course._id}>
                <td className="p-4 font-medium text-gray-900">{course.title}</td>
                <td className="p-4">{course.level}</td>
                <td className="p-4">{Number(course.price || 0).toLocaleString("vi-VN")}đ</td>
                <td className="p-4">{course.total_students || 0}</td>
                <td className="p-4">{course.status || "published"}</td>
              </tr>
            ))}
            {visibleCourses.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">Chưa có khóa học.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
