import { useEffect, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { getCoursesAPI, uploadLessonVideoAPI } from "../../services/api";

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    getCoursesAPI().then(setCourses).catch(() => setCourses([]));
  }, []);

  async function uploadVideo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult("");
    try {
      const data = await uploadLessonVideoAPI(file);
      setResult(data.video_url);
    } catch (err) {
      setResult(err.response?.data?.error || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h1>
        <p className="text-gray-500 mt-1">Theo dõi khóa học và upload video bài giảng lên Cloudinary.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-6">
        <label className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg font-semibold cursor-pointer">
          <FiUploadCloud size={18} /> {uploading ? "Đang upload..." : "Upload video"}
          <input type="file" accept="video/*" onChange={uploadVideo} className="hidden" />
        </label>
        {result && <p className="text-sm text-gray-600 mt-4 break-all">{result}</p>}
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-4">Khóa học</th>
              <th className="text-left p-4">Cấp độ</th>
              <th className="text-left p-4">Giá</th>
              <th className="text-left p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map((course) => (
              <tr key={course._id}>
                <td className="p-4 font-medium text-gray-900">{course.title}</td>
                <td className="p-4">{course.level}</td>
                <td className="p-4">{Number(course.price || 0).toLocaleString("vi-VN")}đ</td>
                <td className="p-4">{course.status || "published"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
