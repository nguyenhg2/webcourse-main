import {
  FiCode, FiSmartphone, FiShield, FiCloud, FiDatabase, FiLayout, FiCpu, FiTrendingUp
} from "react-icons/fi";
import { SiPython, SiJavascript } from "react-icons/si";

const CATEGORIES = [
  { icon: <FiCode size={28} />, name: "Web Development", count: 78 },
  { icon: <SiPython size={28} />, name: "Python", count: 64 },
  { icon: <FiSmartphone size={28} />, name: "Ứng dụng di động", count: 52 },
  { icon: <SiJavascript size={28} />, name: "JavaScript", count: 91 },
  { icon: <FiShield size={28} />, name: "An ninh mạng", count: 34 },
  { icon: <FiCloud size={28} />, name: "DevOps & Cloud", count: 45 },
  { icon: <FiDatabase size={28} />, name: "Database & Backend", count: 67 },
  { icon: <FiLayout size={28} />, name: "UI/UX Design", count: 38 },
  { icon: <FiCpu size={28} />, name: "AI & Machine Learning", count: 56 },
  { icon: <FiTrendingUp size={28} />, name: "Data Science", count: 42 },
];

export default function Categories() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-[1290px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">Danh mục nổi bật</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Khám phá các lĩnh vực công nghệ đang được săn đón nhất hiện nay
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
            >
              <span className="text-primary group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-sm font-semibold text-secondary text-center">{cat.name}</span>
              <span className="text-xs text-gray-500">{cat.count} khóa học</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
