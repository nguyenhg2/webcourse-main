import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import { getSiteContentSectionAPI } from "../../services/api";

function StatBadge({ stat, className = "" }) {
  if (!stat) return null;

  return (
    <div className={`absolute bottom-12 hidden xl:flex items-center gap-4 rounded-full bg-primary-light px-6 py-4 shadow-2xl ${className}`}>
      <span className="text-4xl font-bold text-[#FF782D]">{stat.value}</span>
      <span className="text-sm text-gray-700">{stat.label}</span>
    </div>
  );
}

export default function Hero() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getSiteContentSectionAPI("stats");
        setStats(Array.isArray(data?.items) ? data.items : []);
      } catch {
        setStats([]);
      }
    }

    loadStats();
  }, []);

  const studentStat = stats.find((item) => item.icon === "users");
  const courseStat = stats.find((item) => item.icon === "book");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <img src="/images/Home_image.png" alt="Ảnh trang chủ" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/30 to-transparent" />

      <div className="relative z-10 max-w-322.5 mx-auto px-5 lg:px-8">
        <div className="flex max-w-lg flex-col gap-6">
          <h1 className="py-2 text-4xl font-bold leading-tight text-primary-light lg:text-5xl xl:text-6xl">
            Nền tảng học lập trình trực tuyến
            <br />
            <span className="text-primary">Từ zero đến hero</span>
          </h1>

          <p className="text-xl leading-7 text-primary-light">
            Khám phá các khóa học chất lượng cao được thiết kế bởi chuyên gia trong ngành công nghệ.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link
              to="/khoa-hoc"
              className="rounded-full bg-primary px-8 py-4 font-semibold text-primary-light transition-colors hover:bg-orange-600"
            >
              Khám phá khóa học
            </Link>

            <button className="flex items-center gap-3 px-6 py-4 font-semibold text-primary-light transition-colors hover:text-orange-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light/20 backdrop-blur-md">
                <FiPlay size={18} />
              </span>
              Xem giới thiệu
            </button>
          </div>
        </div>
      </div>

      <StatBadge stat={studentStat} className="left-12" />
      <StatBadge stat={courseStat} className="right-12" />
    </section>
  );
}
