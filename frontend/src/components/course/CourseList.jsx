import { useState } from "react";
import CourseCard from "./CourseCard";
import Pagination from "../ui/Pagination";
import { FiSearch } from "react-icons/fi";

const COURSES = [
  {
    id: 1,
    title: "React tu co ban den nang cao 2026",
    category: "Web Development",
    instructor: "Nguyen Van A",
    instructorAvatar: "https://placehold.co/40/564FFD/fff?text=A",
    image: "https://placehold.co/400x220/564FFD/fff?text=React",
    duration: "24h",
    students: 1250,
    level: "Trung binh",
    lessons: 86,
    price: 599000,
  },
  {
    id: 2,
    title: "Python cho nguoi moi bat dau",
    category: "Python",
    instructor: "Tran Thi B",
    instructorAvatar: "https://placehold.co/40/23BD33/fff?text=B",
    image: "https://placehold.co/400x220/23BD33/fff?text=Python",
    duration: "18h",
    students: 2300,
    level: "Co ban",
    lessons: 64,
    price: 0,
  },
  {
    id: 3,
    title: "Flutter - Xay dung ung dung da nen tang",
    category: "Mobile App",
    instructor: "Le Van C",
    instructorAvatar: "https://placehold.co/40/FF6636/fff?text=C",
    image: "https://placehold.co/400x220/FF6636/fff?text=Flutter",
    duration: "32h",
    students: 870,
    level: "Trung binh",
    lessons: 102,
    price: 799000,
  },
  {
    id: 4,
    title: "JavaScript ES6+ toan tap",
    category: "JavaScript",
    instructor: "Pham Thi D",
    instructorAvatar: "https://placehold.co/40/FFC107/333?text=D",
    image: "https://placehold.co/400x220/FFC107/333?text=JS+ES6",
    duration: "20h",
    students: 3100,
    level: "Co ban",
    lessons: 72,
    price: 0,
  },
  {
    id: 5,
    title: "Docker va Kubernetes tu A den Z",
    category: "DevOps & Cloud",
    instructor: "Hoang Van E",
    instructorAvatar: "https://placehold.co/40/1D2026/fff?text=E",
    image: "https://placehold.co/400x220/1D2026/fff?text=Docker",
    duration: "28h",
    students: 560,
    level: "Nang cao",
    lessons: 90,
    price: 899000,
  },
  {
    id: 6,
    title: "Thiet ke UI/UX voi Figma",
    category: "UI/UX Design",
    instructor: "Mai Thi F",
    instructorAvatar: "https://placehold.co/40/E53935/fff?text=F",
    image: "https://placehold.co/400x220/E53935/fff?text=Figma",
    duration: "15h",
    students: 1800,
    level: "Co ban",
    lessons: 48,
    price: 399000,
  },
  {
    id: 7,
    title: "Machine Learning voi Python",
    category: "AI & Machine Learning",
    instructor: "Do Van G",
    instructorAvatar: "https://placehold.co/40/564FFD/fff?text=G",
    image: "https://placehold.co/400x220/564FFD/fff?text=ML",
    duration: "36h",
    students: 920,
    level: "Nang cao",
    lessons: 110,
    price: 999000,
  },
  {
    id: 8,
    title: "SQL va PostgreSQL toan dien",
    category: "Database & Backend",
    instructor: "Vu Thi H",
    instructorAvatar: "https://placehold.co/40/23BD33/fff?text=H",
    image: "https://placehold.co/400x220/23BD33/fff?text=SQL",
    duration: "16h",
    students: 1450,
    level: "Trung binh",
    lessons: 56,
    price: 0,
  },
  {
    id: 9,
    title: "An ninh mang can ban",
    category: "Cyber Security",
    instructor: "Bui Van I",
    instructorAvatar: "https://placehold.co/40/FF6636/fff?text=I",
    image: "https://placehold.co/400x220/FF6636/fff?text=Security",
    duration: "22h",
    students: 430,
    level: "Co ban",
    lessons: 68,
    price: 499000,
  },
];

const FILTERS = ["Tat ca", "Web Development", "Python", "JavaScript", "Mobile App", "DevOps & Cloud"];

export default function CourseList() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tat ca");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = COURSES.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "Tat ca" || c.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <section id="courses" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold text-secondary mb-2">
              Tat ca khoa hoc
            </h2>
            <p className="text-gray-500">
              Hien co {COURSES.length} khoa hoc dang san sang
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tim kiem khoa hoc..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setActiveFilter(f);
                setPage(1);
              }}
              className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                activeFilter === f
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {paged.length === 0 ? (
          <p className="text-center text-gray-400 py-16">
            Khong tim thay khoa hoc phu hop
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paged.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            current={page}
            total={totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </section>
  );
}
