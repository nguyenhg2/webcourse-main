import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBookOpen } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { getRoadmapsAPI } from "../services/api";

export default function RoadmapListing() {
  const [roadmaps, setRoadmaps] = useState([]);

  useEffect(() => {
    getRoadmapsAPI().then(setRoadmaps).catch(() => setRoadmaps([]));
  }, []);

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Lộ trình" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <h1 className="text-2xl font-heading font-bold text-secondary">Lộ trình học tập</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">Dữ liệu lộ trình được đọc từ MongoDB qua Core Service.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {roadmaps.map((roadmap) => (
            <Link key={roadmap._id} to={`/lo-trinh/${roadmap.slug || roadmap._id}`} className="border border-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary-light text-primary">
                <FiBookOpen size={22} />
              </div>
              <h2 className="text-lg font-semibold text-secondary mt-5">{roadmap.title}</h2>
              <p className="text-sm text-gray-600 mt-2 leading-6">{roadmap.description}</p>
              <div className="flex items-center gap-2 text-primary text-sm font-semibold mt-5">
                Xem chi tiết <FiArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
