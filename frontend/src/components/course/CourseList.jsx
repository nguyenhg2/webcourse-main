import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";
import { getCoursesAPI } from "../../services/api";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoursesAPI()
      .then((data) => setCourses(data.slice(0, 4)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-[1290px] mx-auto px-5 text-center text-gray-500">
          Đang tải khóa học...
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-[1290px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">
            Khóa học nổi bật
          </h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Các khóa học được yêu thích nhất tại CodeCamp
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/khoa-hoc"
            className="inline-block px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            Xem tất cả khóa học
          </Link>
        </div>
      </div>
    </section>
  );
}
