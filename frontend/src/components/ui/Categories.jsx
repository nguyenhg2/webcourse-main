import { useState, useEffect } from "react";
import {
  FiArrowRight,
  FiCloud,
  FiCode,
  FiDatabase,
  FiLayout,
  FiServer,
  FiShield,
  FiSmartphone,
  FiTrendingUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { getCategoriesAPI } from "../../services/api";

const CATEGORY_VISUALS = {
  code: { Icon: FiCode, tone: "bg-orange-50 text-primary ring-orange-100" },
  python: { Icon: FiTrendingUp, tone: "bg-blue-50 text-blue-600 ring-blue-100" },
  react: { Icon: FiLayout, tone: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
  server: { Icon: FiServer, tone: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
  docker: { Icon: FiCloud, tone: "bg-cyan-50 text-cyan-700 ring-cyan-100" },
  smartphone: { Icon: FiSmartphone, tone: "bg-pink-50 text-pink-600 ring-pink-100" },
  database: { Icon: FiDatabase, tone: "bg-violet-50 text-violet-600 ring-violet-100" },
  shield: { Icon: FiShield, tone: "bg-rose-50 text-rose-600 ring-rose-100" },
};

function normalize(value) {
  return String(value || "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCategoryVisual(category) {
  const iconKey = normalize(category.icon).replace(/[^a-z0-9]+/g, "");
  if (CATEGORY_VISUALS[iconKey]) return CATEGORY_VISUALS[iconKey];

  const name = normalize(category.name);
  if (name.includes("python")) return CATEGORY_VISUALS.python;
  if (name.includes("frontend") || name.includes("react")) return CATEGORY_VISUALS.react;
  if (name.includes("backend") || name.includes("server")) return CATEGORY_VISUALS.server;
  if (name.includes("devops") || name.includes("docker") || name.includes("cloud")) return CATEGORY_VISUALS.docker;
  if (name.includes("di dong") || name.includes("mobile")) return CATEGORY_VISUALS.smartphone;
  if (name.includes("du lieu") || name.includes("data")) return CATEGORY_VISUALS.database;
  if (name.includes("bao mat") || name.includes("an ninh")) return CATEGORY_VISUALS.shield;
  return CATEGORY_VISUALS.code;
}

function desktopSpanClass(index, total) {
  const remainder = total % 4;
  const finalRowStart = total - remainder;
  if (!remainder || index < finalRowStart) return "lg:col-span-3";
  if (remainder === 1) return "lg:col-span-12";
  if (remainder === 2) return "lg:col-span-6";
  return "lg:col-span-4";
}

function categoryLink(category) {
  return category._id ? `/khoa-hoc?category=${encodeURIComponent(category._id)}` : "/khoa-hoc";
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getCategoriesAPI()
      .then((data) => {
        if (!mounted) return;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-14 lg:py-18 bg-white">
      <div className="max-w-322.5 mx-auto px-5">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Danh mục học tập</span>
            <h2 className="mt-2 text-3xl font-heading font-bold text-secondary">Danh mục nổi bật</h2>
            <p className="mt-3 text-gray-600">Chọn nhanh lĩnh vực phù hợp và chuyển thẳng đến danh sách khóa học tương ứng.</p>
          </div>
          <Link
            to="/khoa-hoc"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-secondary hover:border-primary hover:text-primary md:self-auto"
          >
            Tất cả khóa học
            <FiArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {loading
            ? Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className={`min-h-[132px] rounded-lg border border-gray-100 bg-gray-50 p-5 ${desktopSpanClass(index, 7)}`}
                >
                  <div className="h-12 w-12 rounded-lg bg-gray-100" />
                  <div className="mt-5 h-4 w-2/3 rounded bg-gray-100" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
                </div>
              ))
            : categories.length === 0 ? (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-sm text-gray-500 lg:col-span-12">
                  Chưa có danh mục trong cơ sở dữ liệu.
                </div>
              ) : categories.map((category, index) => {
                const visual = getCategoryVisual(category);
                const Icon = visual.Icon;
                const courseCount = Number(category.courseCount || 0);

                return (
                  <Link
                    key={category._id || category.name}
                    to={categoryLink(category)}
                    className={`group min-h-[132px] rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md ${desktopSpanClass(index, categories.length)}`}
                  >
                    <div className="flex h-full items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ring-1 ${visual.tone}`}>
                          <Icon size={22} />
                        </span>
                        <h3 className="mt-5 line-clamp-2 text-base font-semibold text-secondary">{category.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{courseCount > 0 ? `${courseCount} khóa học` : "Đang cập nhật khóa học"}</p>
                      </div>
                      <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-100 text-gray-400 transition-colors group-hover:border-primary group-hover:text-primary">
                        <FiArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
