import { useState } from "react";
import { FiSearch, FiGrid, FiList } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import CourseListCard from "../components/course/CourseListCard";
import CourseGridCard from "../components/course/CourseGridCard";
import CourseSidebar from "../components/course/CourseSidebar";
import Pagination from "../components/ui/Pagination";

const COURSES = [
  {
    id: 1,
    slug: "reactjs-co-ban-nang-cao",
    title: "React.js Tu Co Ban Den Nang Cao",
    category: "Web Development",
    instructor: "Dinh Thanh Nguyen",
    image: "https://placehold.co/480x292",
    duration: "2 Tuan",
    students: 156,
    level: "Tat ca cap do",
    lessons: 20,
    price: 0,
    originalPrice: 399000,
  },
  {
    id: 2,
    slug: "nodejs-express-rest-api",
    title: "Node.js & Express - Xay Dung REST API",
    category: "Web Development",
    instructor: "Dinh Thanh Nguyen",
    image: "https://placehold.co/480x292",
    duration: "2 Tuan",
    students: 156,
    level: "Tat ca cap do",
    lessons: 20,
    price: 0,
    originalPrice: 399000,
  },
  {
    id: 3,
    slug: "android-kotlin",
    title: "Lap Trinh Android Voi Kotlin",
    category: "Mobile App",
    instructor: "Dinh Thanh Nguyen",
    image: "https://placehold.co/480x292",
    duration: "2 Tuan",
    students: 156,
    level: "Tat ca cap do",
    lessons: 20,
    price: 0,
    originalPrice: 399000,
  },
  {
    id: 4,
    slug: "javascript-es6",
    title: "JavaScript ES6+ Hoan Chinh",
    category: "JavaScript",
    instructor: "Dinh Thanh Nguyen",
    image: "https://placehold.co/480x292",
    duration: "2 Tuan",
    students: 156,
    level: "Tat ca cap do",
    lessons: 20,
    price: 0,
    originalPrice: 399000,
  },
  {
    id: 5,
    slug: "html-css-nen-tang",
    title: "HTML & CSS - Nen Tang Web",
    category: "Web Development",
    instructor: "Dinh Thanh Nguyen",
    image: "https://placehold.co/480x292",
    duration: "2 Tuan",
    students: 156,
    level: "Tat ca cap do",
    lessons: 20,
    price: 0,
    originalPrice: 399000,
  },
  {
    id: 6,
    slug: "reactjs-co-ban-2",
    title: "React.js Tu Co Ban Den Nang Cao",
    category: "Web Development",
    instructor: "Dinh Thanh Nguyen",
    image: "https://placehold.co/480x292",
    duration: "2 Tuan",
    students: 156,
    level: "Tat ca cap do",
    lessons: 20,
    price: 0,
    originalPrice: 399000,
  },
];

export default function CourseListingPage() {
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = COURSES.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Trang chu", href: "/" },
          { label: "Khoa hoc" },
        ]}
      />

      <section className="py-14">
        <div className="max-w-[1290px] mx-auto px-4 flex gap-7">
          <div className="flex-1 flex flex-col gap-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-64 pb-1 border-b border-secondary flex justify-between items-center">
                  <input
                    type="text"
                    placeholder="Tim kiem"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 text-lg bg-transparent focus:outline-none"
                  />
                  <FiSearch size={20} className="text-secondary" />
                </div>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`transition-colors ${
                    viewMode === "grid" ? "text-primary" : "text-secondary"
                  }`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`transition-colors ${
                    viewMode === "list" ? "text-primary" : "text-secondary"
                  }`}
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="flex flex-col gap-7">
                {filtered.map((course) => (
                  <CourseListCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {filtered.map((course) => (
                  <CourseGridCard key={course.id} course={course} />
                ))}
              </div>
            )}

            <Pagination
              current={page}
              total={3}
              onChange={setPage}
            />
          </div>

          <div className="hidden lg:block">
            <CourseSidebar />
          </div>
        </div>
      </section>
    </>
  );
}
