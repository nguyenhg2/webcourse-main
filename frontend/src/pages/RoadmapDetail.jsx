import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { getRoadmapAPI } from "../services/api";

export default function RoadmapDetail() {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);

  useEffect(() => {
    getRoadmapAPI(id).then(setRoadmap).catch(() => setRoadmap(null));
  }, [id]);

  if (!roadmap) {
    return <div className="max-w-[1000px] mx-auto px-5 py-20 text-center text-gray-500">Đang tải lộ trình...</div>;
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Lộ trình", to: "/lo-trinh" }, { label: roadmap.title }]} />
      <div className="max-w-[1000px] mx-auto px-5 py-10">
        <h1 className="text-3xl font-heading font-bold text-secondary">{roadmap.title}</h1>
        <p className="text-gray-600 mt-3">{roadmap.description}</p>
        <div className="mt-10 flex flex-col gap-5">
          {(roadmap.courses || []).map((course, index) => (
            <div key={course._id} className="grid grid-cols-[48px_1fr] gap-4">
              <div className="flex flex-col items-center">
                <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">{index + 1}</span>
                {index < roadmap.courses.length - 1 && <span className="w-px flex-1 bg-gray-200 mt-2" />}
              </div>
              <div className="border border-gray-100 rounded-lg p-5 mb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-secondary">{course.title}</h2>
                    <p className="text-sm text-gray-600 mt-2">{course.description}</p>
                    <div className="flex items-center gap-2 text-success text-sm mt-3">
                      <FiCheckCircle size={16} /> Học theo thứ tự này
                    </div>
                  </div>
                  <Link to={`/khoa-hoc/${course.slug}`} className="shrink-0 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                    Xem khóa <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
