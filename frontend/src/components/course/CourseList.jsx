import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";

const COURSES = [
  { id: 1, slug: "react-js-tu-co-ban-den-nang-cao", title: "React.js Từ Cơ Bản Đến Nâng Cao", category: "Web Development", instructor: "Đinh Thành Nguyên", image: "https://placehold.co/410x230", duration: "2 Tuần", students: 156, level: "Tất cả cấp độ", lessons: 20, price: 0, originalPrice: 399000 },
  { id: 2, slug: "python-cho-nguoi-moi-bat-dau", title: "Python Cho Người Mới Bắt Đầu", category: "Python", instructor: "Nguyễn Phương Tây", image: "https://placehold.co/410x230", duration: "3 Tuần", students: 234, level: "Người mới", lessons: 25, price: 299000, originalPrice: 599000 },
  { id: 3, slug: "nodejs-va-express", title: "Node.js và Express Framework", category: "Web Development", instructor: "Đinh Thành Nguyên", image: "https://placehold.co/410x230", duration: "4 Tuần", students: 98, level: "Cơ bản", lessons: 30, price: 0, originalPrice: 499000 },
  { id: 4, slug: "lap-trinh-android-voi-kotlin", title: "Lập Trình Android Với Kotlin", category: "Ứng dụng di động", instructor: "Nguyễn Phương Tây", image: "https://placehold.co/410x230", duration: "5 Tuần", students: 120, level: "Cơ bản", lessons: 35, price: 499000, originalPrice: 799000 },
];

export default function CourseList() {
  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-[1290px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">Khóa học nổi bật</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">Các khóa học được yêu thích nhất tại CodeCamp</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/khoa-hoc" className="inline-block px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
            Xem tất cả khóa học
          </Link>
        </div>
      </div>
    </section>
  );
}
