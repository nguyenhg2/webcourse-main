import { FiStar } from "react-icons/fi";

const REVIEWS = [
  {
    name: "Nguyễn Minh Tuấn",
    role: "Frontend Developer",
    avatar: "https://placehold.co/48/564FFD/fff?text=T",
    content: "Khóa học React trên CodeCamp thực sự tuyệt vời. Giảng viên giải thích rất dễ hiểu, bài tập thực hành phong phú. Tôi đã tìm được công việc mơ ước sau khi hoàn thành khóa học.",
    rating: 5,
  },
  {
    name: "Lê Thị Mai",
    role: "Sinh viên CNTT",
    avatar: "https://placehold.co/48/FF6636/fff?text=M",
    content: "Mình là sinh viên năm 3, nhờ CodeCamp mà mình đã nắm vững kiến thức lập trình web. Giao diện học rất thân thiện và dễ sử dụng.",
    rating: 5,
  },
  {
    name: "Trần Đức Huy",
    role: "DevOps Engineer",
    avatar: "https://placehold.co/48/23BD33/fff?text=H",
    content: "Các khóa học DevOps và Cloud trên CodeCamp rất chất lượng, cập nhật công nghệ mới nhất. Giá cả hợp lý so với nội dung nhận được.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-[1290px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">Học viên nói gì về chúng tôi</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Hàng nghìn học viên đã tin tưởng và đạt được kết quả tuyệt vời
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review) => (
            <div key={review.name} className="bg-white rounded-xl p-8 border border-gray-100">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    className={i < review.rating ? "text-warning fill-warning" : "text-gray-200"}
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-7 mb-6">"{review.content}"</p>
              <div className="flex items-center gap-3">
                <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="text-sm font-semibold text-secondary">{review.name}</p>
                  <p className="text-xs text-gray-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
