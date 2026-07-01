const LEVEL_LABELS = {
  beginner: "Người mới",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

export const COURSE_LEVELS = Object.entries(LEVEL_LABELS).map(([name, label]) => ({
  name,
  label,
}));

export function courseLevelLabel(level) {
  return LEVEL_LABELS[level] || level || "";
}

export function coursePriceLabel(price) {
  return Number(price || 0) === 0
    ? "Miễn phí"
    : Number(price).toLocaleString("vi-VN") + "đ";
}

export function cartButtonLabel(isAdding, isInCart) {
  if (isAdding) return "Đang thêm...";
  if (isInCart) return "Đã có trong giỏ";
  return "Thêm vào giỏ";
}
