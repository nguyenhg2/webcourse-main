import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import { getPublicReviewsAPI } from "../../services/api";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getPublicReviewsAPI()
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  }, []);

  if (!reviews.length) return null;

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-322.5 mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">Học viên nói gì về chúng tôi</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">Nhận xét được lấy từ đánh giá khóa học trong cơ sở dữ liệu.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl p-8 border border-gray-100">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={16} className={i < Number(review.rating || 0) ? "text-warning fill-warning" : "text-gray-200"} />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-7 mb-6">"{review.comment}"</p>
              <div className="flex items-center gap-3">
                <img src={review.user?.avatar || "https://placehold.co/48/564FFD/fff?text=HV"} alt={review.user_name || review.user?.name || "Học viên"} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="text-sm font-semibold text-secondary">{review.user_name || review.user?.name || "Học viên"}</p>
                  <p className="text-xs text-gray-500">{review.course?.title || "Khóa học CodeCamp"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
