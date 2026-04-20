import {
  FiCode,
  FiSmartphone,
  FiShield,
  FiCloud,
  FiDatabase,
  FiLayout,
  FiCpu,
  FiBarChart2,
} from "react-icons/fi";
import { FaPython, FaJsSquare } from "react-icons/fa";

const CATEGORIES = [
  { icon: FiCode, name: "Web Development", count: 78 },
  { icon: FaPython, name: "Python", count: 64 },
  { icon: FiSmartphone, name: "Mobile App", count: 52 },
  { icon: FaJsSquare, name: "JavaScript", count: 91 },
  { icon: FiShield, name: "Cyber Security", count: 34 },
  { icon: FiCloud, name: "DevOps & Cloud", count: 45 },
  { icon: FiDatabase, name: "Database & Backend", count: 67 },
  { icon: FiLayout, name: "UI/UX Design", count: 38 },
  { icon: FiCpu, name: "AI & Machine Learning", count: 56 },
  { icon: FiBarChart2, name: "Data Science", count: 42 },
];

export default function Categories() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-secondary mb-3">
            Danh muc noi bat
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Khám phá các lĩnh vực công nghệ phổ biến nhất với hàng trăm khóa
            học chất lượng cao
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.name}
                href="#"
                className="group flex flex-col items-center gap-3 p-6 bg-white border border-gray-100 rounded-lg hover:border-primary hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>
                <h3 className="text-sm font-semibold text-secondary text-center">
                  {cat.name}
                </h3>
                <span className="text-xs text-gray-400">
                  {cat.count} khoa hoc
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
