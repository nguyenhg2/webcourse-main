import { useState, useEffect } from "react";
import {
  FiCode,
  FiSmartphone,
  FiShield,
  FiCloud,
  FiDatabase,
  FiLayout,
  FiCpu,
  FiTrendingUp,
} from "react-icons/fi";
import { getCategoriesAPI } from "../../services/api";

const ICON_MAP = {
  "Web Development": <FiCode size={28} />,
  Python: <FiTrendingUp size={28} />,
  "Ứng dụng di động": <FiSmartphone size={28} />,
  "Data Science": <FiDatabase size={28} />,
  "DevOps & Cloud": <FiCloud size={28} />,
  "UI/UX Design": <FiLayout size={28} />,
  "An ninh mạng": <FiShield size={28} />,
  "AI & Machine Learning": <FiCpu size={28} />,
};

const DEFAULT_ICON = <FiCode size={28} />;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategoriesAPI()
      .then((data) => {
        // API trả về mảng object {_id, name, icon} — chỉ lấy name
        const names = data.map((item) =>
          typeof item === "string" ? item : item.name
        );
        setCategories(names);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-20">
        <div className="max-w-[1290px] mx-auto px-5 text-center text-gray-500">
          Đang tải danh mục...
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-[1290px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">
            Danh mục nổi bật
          </h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Khám phá các lĩnh vực công nghệ đang được săn đón nhất hiện nay
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {categories.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
            >
              <span className="text-primary group-hover:scale-110 transition-transform">
                {ICON_MAP[name] || DEFAULT_ICON}
              </span>
              <span className="text-sm font-semibold text-secondary text-center">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
