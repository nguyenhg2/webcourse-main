import { FiStar } from "react-icons/fi";

const REVIEWS = [
  {
    name: "Nguyen Minh Tuan",
    role: "Frontend Developer",
    avatar: "https://placehold.co/48/564FFD/fff?text=T",
    content:
      "Khoa hoc React tai CodeCamp rat chat luong. Giang vien giai thich de hieu, bai tap thuc hanh phong phu. Sau khoa hoc minh da tu tin apply thanh cong.",
    rating: 5,
  },
  {
    name: "Le Thi Mai",
    role: "Sinh vien CNTT",
    avatar: "https://placehold.co/48/FF6636/fff?text=M",
    content:
      "Minh hoc Python tu con so, gio da co the tu lam du an nho. Gia khoa hoc rat hop ly, co nhieu khoa mien phi de bat dau.",
    rating: 5,
  },
  {
    name: "Tran Duc Huy",
    role: "DevOps Engineer",
    avatar: "https://placehold.co/48/23BD33/fff?text=H",
    content:
      "Khoa Docker va Kubernetes day du kien thuc can thiet. Minh da ap dung ngay vao cong viec thuc te. Rat dang dong tien.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-secondary mb-3">
            Hoc vien noi gi
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Nhung danh gia chan thuc tu hoc vien da trai nghiem khoa hoc tai
            CodeCamp
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="bg-white p-6 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    className={
                      i < review.rating
                        ? "text-warning fill-warning"
                        : "text-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                "{review.content}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-sm text-secondary">
                    {review.name}
                  </p>
                  <p className="text-xs text-gray-400">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
