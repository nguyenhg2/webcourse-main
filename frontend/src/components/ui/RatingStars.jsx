import { FiStar } from "react-icons/fi";

export default function RatingStars({ value = 0, size = 16, max = 5 }) {
  const rating = Math.round(Number(value) || 0);
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <span className="flex gap-0.5">
      {stars.map((star) => (
        <FiStar
          key={star}
          size={size}
          className={star <= rating ? "text-warning fill-warning" : "text-gray-200"}
        />
      ))}
    </span>
  );
}
