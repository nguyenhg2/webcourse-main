import { FiMonitor, FiClock, FiAward, FiHeadphones } from "react-icons/fi";

const ITEMS = [
  {
    icon: <FiMonitor size={32} />,
    title: "Học mọi lúc mọi nơi",
    desc: "Truy cập khóa học trên mọi thiết bị, học theo tốc độ của riêng bạn.",
  },
  {
    icon: <FiClock size={32} />,
    title: "Truy cập trọn đời",
    desc: "Một lần đăng ký, truy cập mãi mãi với tất cả cập nhật mới nhất.",
  },
  {
    icon: <FiAward size={32} />,
    title: "Chứng chỉ hoàn thành",
    desc: "Nhận chứng chỉ sau khi hoàn thành khóa học để nâng cao hồ sơ cá nhân.",
  },
  {
    icon: <FiHeadphones size={32} />,
    title: "Hỗ trợ tận tâm",
    desc: "Đội ngũ giảng viên và hỗ trợ luôn sẵn sàng giải đáp thắc mắc của bạn.",
  },
];

export default function Benefits() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-[1290px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">Tại sao chọn CodeCamp?</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Chúng tôi mang đến trải nghiệm học tập tốt nhất cho bạn
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-4 p-8 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-primary">{item.icon}</span>
              <h3 className="text-lg font-semibold text-secondary">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-6">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
