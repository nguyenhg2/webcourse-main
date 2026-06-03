import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiMap, FiSearch } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { getRoadmapsAPI } from "../services/api";

const fallbackImages = [
  "/images/react.png",
  "/images/nodejs.png",
  "/images/python.png",
  "/images/docker.png",
];

function roadmapImage(roadmap, index) {
  return roadmap.thumbnail || fallbackImages[index % fallbackImages.length];
}

function courseCount(roadmap) {
  return roadmap.course_ids?.length || roadmap.courses?.length || 0;
}

export default function RoadmapListing() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRoadmapsAPI()
      .then((data) => setRoadmaps(Array.isArray(data) ? data : []))
      .catch(() => setError("Không tải được danh sách lộ trình."))
      .finally(() => setLoading(false));
  }, []);

  const visibleRoadmaps = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return roadmaps;

    return roadmaps.filter((roadmap) => {
      const text = `${roadmap.title || ""} ${roadmap.description || ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [roadmaps, search]);

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Lộ trình" }]} />
      <main className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <section>
            <div className="flex items-start justify-between gap-5 flex-wrap">
              <div>
                <span className="inline-flex items-center gap-2 rounded-md bg-primary-light px-3 py-1 text-sm font-semibold text-primary">
                  <FiMap size={16} /> Lộ trình học tập
                </span>
                <h1 className="mt-4 text-3xl font-heading font-bold text-secondary">Chọn lộ trình phù hợp</h1>
                <p className="mt-3 max-w-2xl leading-7 text-gray-600">
                  Mỗi lộ trình sắp xếp các khóa học theo thứ tự để người học đi từ nền tảng đến thực hành.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm lộ trình..."
                  className="w-full rounded-lg border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            {loading && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-64 animate-pulse rounded-lg border border-gray-100 bg-gray-50" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="mt-8 rounded-lg border border-error/20 bg-red-50 p-5 text-sm text-error">{error}</div>
            )}

            {!loading && !error && visibleRoadmaps.length === 0 && (
              <div className="mt-8 rounded-lg border border-gray-100 p-8 text-center text-gray-500">
                Không có lộ trình phù hợp.
              </div>
            )}

            {!loading && !error && visibleRoadmaps.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleRoadmaps.map((roadmap, index) => (
                  <Link
                    key={roadmap._id || roadmap.slug}
                    to={`/lo-trinh/${roadmap.slug || roadmap._id}`}
                    className="group overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="h-44 bg-gray-50 p-6">
                      <img src={roadmapImage(roadmap, index)} alt={roadmap.title} className="h-full w-full object-contain" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="inline-flex items-center gap-2 text-primary font-semibold">
                          <FiBookOpen size={16} /> {courseCount(roadmap)} khóa học
                        </span>
                        <span className="text-gray-400">#{index + 1}</span>
                      </div>
                      <h2 className="mt-4 text-lg font-semibold text-secondary transition-colors group-hover:text-primary">
                        {roadmap.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{roadmap.description}</p>
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Xem chi tiết <FiArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-gray-100 bg-gray-50 p-6">
            <h2 className="font-semibold text-secondary">Tổng quan</h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-primary">{roadmaps.length}</p>
                <p className="mt-1 text-sm text-gray-500">Lộ trình</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {roadmaps.reduce((total, item) => total + courseCount(item), 0)}
                </p>
                <p className="mt-1 text-sm text-gray-500">Khóa học</p>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-5 text-sm leading-6 text-gray-600">
              Lộ trình giúp nhóm các khóa học theo mục tiêu nghề nghiệp, tránh học rời rạc và dễ theo dõi tiến độ hơn.
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
