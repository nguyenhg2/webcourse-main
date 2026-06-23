import { useEffect, useState } from "react";
import { getPublicReviewsAPI } from "../../services/api";
import RatingStars from "./RatingStars";

const FALLBACK_AVATAR = "https://placehold.co/48/564FFD/fff?text=HV";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getPublicReviewsAPI();
        setReviews(Array.isArray(data) ? data : []);
      } catch {
        setReviews([]);
      }
    }

    loadReviews();
  }, []);

  if (!reviews.length) return null;

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-322.5 mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">Học viên nói gì về chúng tôi</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Nhận xét được lấy từ đánh giá khóa học trong cơ sở dữ liệu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => {
            const name = review.user_name || review.user?.name || "Học viên";
            const courseTitle = review.course?.title || "Khóa học CodeCamp";

            return (
              <div key={review._id} className="bg-white rounded-lg p-8 border border-gray-100">
                <div className="mb-4">
                  <RatingStars value={review.rating} />
                </div>

                <p className="text-gray-600 text-sm leading-7 mb-6">"{review.comment}"</p>

                <div className="flex items-center gap-3">
                  <img
                    src={review.user?.avatar || FALLBACK_AVATAR}
                    alt={name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold text-secondary">{name}</p>
                    <p className="text-xs text-gray-500">{courseTitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
