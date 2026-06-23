import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiBookOpen, FiClock, FiLayers, FiUsers } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { getRoadmapAPI } from "../services/api";
import { courseImage } from "../utils/courseImages";

const levelText = {
  beginner: "Người mới",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function imageFor(item) {
  return courseImage(item);
}

function priceText(course) {
  if (course.price === 0) return "Miễn phí";
  if (!course.price) return "Liên hệ";
  return Number(course.price).toLocaleString("vi-VN") + "đ";
}

export default function RoadmapDetail() {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getRoadmapAPI(id)
      .then(setRoadmap)
      .catch(() => setError("Không tìm thấy lộ trình."))
      .finally(() => setLoading(false));
  }, [id]);

  const courses = useMemo(() => roadmap?.courses || [], [roadmap]);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-5 py-20">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-24 animate-pulse rounded-lg bg-gray-50" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-lg border border-gray-100 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <main className="max-w-[900px] mx-auto px-5 py-16 text-center">
        <p className="text-gray-500">{error || "Không có dữ liệu lộ trình."}</p>
        <Link to="/lo-trinh" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">
          <FiArrowLeft size={16} /> Quay lại lộ trình
        </Link>
      </main>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Lộ trình", to: "/lo-trinh" }, { label: roadmap.title }]} />
      <main className="max-w-[1180px] mx-auto px-5 py-10">
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div>
            <Link to="/lo-trinh" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <FiArrowLeft size={16} /> Tất cả lộ trình
            </Link>
            <h1 className="mt-4 text-3xl font-heading font-bold text-secondary">{roadmap.title}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-gray-600">{roadmap.description}</p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2">
                <FiLayers size={16} className="text-primary" /> {courses.length} chặng học
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2">
                <FiBookOpen size={16} className="text-primary" /> {courses.length} khóa học
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-6">
            <img src={imageFor(roadmap, 0)} alt={roadmap.title} className="mx-auto h-40 w-full object-contain" />
            <div className="mt-5 border-t border-gray-200 pt-5 text-sm leading-6 text-gray-600">
              Các khóa học bên dưới được sắp xếp theo thứ tự để học viên có thể đi từng bước mà không bỏ sót nền tảng.
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-heading font-bold text-secondary">Các khóa học trong lộ trình</h2>
            {courses[0]?.slug && (
              <Link to={`/khoa-hoc/${courses[0].slug}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600">
                Bắt đầu khóa đầu tiên <FiArrowRight size={16} />
              </Link>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="mt-6 rounded-lg border border-gray-100 p-8 text-center text-gray-500">
              Lộ trình này chưa có khóa học.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {courses.map((course, index) => (
                <article key={course._id || course.slug || index} className="grid grid-cols-[44px_1fr] gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    {index < courses.length - 1 && <span className="mt-2 h-full w-px bg-gray-200" />}
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-white p-4 md:grid md:grid-cols-[160px_1fr_auto] md:items-center md:gap-5">
                    <img src={imageFor(course, index)} alt={course.title} className="h-32 w-full rounded-md bg-gray-50 object-contain p-4 md:h-24" />
                    <div className="mt-4 md:mt-0">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        {course.level && <span className="rounded-md bg-primary-light px-2.5 py-1 text-primary">{levelText[course.level] || course.level}</span>}
                        {course.duration && <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1 text-gray-500"><FiClock size={13} /> {course.duration}</span>}
                        {course.total_students !== undefined && <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1 text-gray-500"><FiUsers size={13} /> {course.total_students} học viên</span>}
                      </div>
                      <h3 className="mt-3 font-semibold text-secondary">{course.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{course.description}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-4 md:mt-0 md:flex-col md:items-end">
                      <span className="font-bold text-primary">{priceText(course)}</span>
                      {course.slug && (
                        <Link to={`/khoa-hoc/${course.slug}`} className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light">
                          Xem khóa <FiArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
