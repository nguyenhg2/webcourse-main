import { useEffect, useState } from "react";
import { getCoursesAPI, getReviewsByCourseAPI, deleteReviewAPI } from "../../../services/api";
import { FiTrash2, FiStar, FiChevronDown } from "react-icons/fi";

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={13}
          className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export default function ReviewManager() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    getCoursesAPI().then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingReviews(true);
    getReviewsByCourseAPI(selected)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [selected]);

  async function handleDelete(reviewId) {
    if (!confirm("Xóa đánh giá này?")) return;
    await deleteReviewAPI(reviewId);
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kiểm duyệt đánh giá</h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khóa học</label>
        <div className="relative max-w-md">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary pr-10"
          >
            <option value="">-- Chọn khóa học --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
          <FiChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {selected && (
        <div className="space-y-4">
          {avgRating && (
            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
              <div>
                <Stars rating={Math.round(avgRating)} />
                <p className="text-sm text-gray-500 mt-1">{reviews.length} đánh giá</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            {loadingReviews ? (
              <div className="text-center py-20 text-gray-400">Đang tải...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20 text-gray-400">Chưa có đánh giá nào.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left p-4">Học viên</th>
                    <th className="text-left p-4">Đánh giá</th>
                    <th className="text-left p-4">Nhận xét</th>
                    <th className="text-left p-4">Ngày</th>
                    <th className="text-left p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{r.user_name || "Ẩn danh"}</td>
                      <td className="p-4"><Stars rating={r.rating} /></td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{r.comment}</td>
                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
