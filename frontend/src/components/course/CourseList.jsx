import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";
import { addCartAPI, getCartAPI, getCoursesAPI, getMyCoursesAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function CourseList() {
  const { user, refreshCartCount } = useAuth();
  const [courses, setCourses] = useState([]);
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set());
  const [cartCourseIds, setCartCourseIds] = useState(new Set());
  const [addingCartId, setAddingCartId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoursesAPI()
      .then((data) => setCourses(data.slice(0, 4)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role !== "student") {
      setOwnedCourseIds(new Set());
      setCartCourseIds(new Set());
      return;
    }

    getMyCoursesAPI()
      .then((items) => setOwnedCourseIds(new Set(items.map((item) => item._id))))
      .catch(() => setOwnedCourseIds(new Set()));
    getCartAPI()
      .then((data) => setCartCourseIds(new Set((data.items || []).map((item) => item._id))))
      .catch(() => setCartCourseIds(new Set()));
  }, [user]);

  async function handleAddCart(course) {
    if (!user) {
      window.location.href = "/dang-nhap";
      return;
    }
    if (user.role !== "student" || ownedCourseIds.has(course._id) || cartCourseIds.has(course._id)) {
      return;
    }

    setAddingCartId(course._id);
    try {
      await addCartAPI(course._id);
      setCartCourseIds((current) => new Set([...current, course._id]));
      await refreshCartCount?.();
    } finally {
      setAddingCartId("");
    }
  }

  if (loading) {
    return (
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-322.5 mx-auto px-5 text-center text-gray-500">
          Đang tải khóa học...
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-322.5 mx-auto px-5">
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
            <CourseCard
              key={course._id}
              course={course}
              isOwned={ownedCourseIds.has(course._id)}
              isInCart={cartCourseIds.has(course._id)}
              isAdding={addingCartId === course._id}
              onAddCart={handleAddCart}
            />
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
