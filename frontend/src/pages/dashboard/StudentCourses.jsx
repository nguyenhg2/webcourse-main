import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import { getMyCoursesAPI } from "../../services/api";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getMyCoursesAPI().then(setCourses).catch(() => setCourses([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
        <p className="text-gray-500 mt-1">Tiếp tục học và theo dõi tiến độ cá nhân.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white border border-gray-100 rounded-lg overflow-hidden">
            <img src={course.thumbnail || "https://placehold.co/600x400"} alt={course.title} className="w-full h-40 object-cover" />
            <div className="p-5">
              <h2 className="font-semibold text-gray-900">{course.title}</h2>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{course.completedLessons}/{course.totalLessons} bài</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress || 0}%` }} />
                </div>
              </div>
              <Link to={course.lastLessonId ? `/khoa-hoc/${course.slug}/hoc/${course.lastLessonId}` : `/khoa-hoc/${course.slug}`} className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg font-semibold">
                <FiPlay size={14} /> Tiếp tục học
              </Link>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="text-gray-500">Bạn chưa sở hữu khóa học nào.</p>}
      </div>
    </div>
  );
}
