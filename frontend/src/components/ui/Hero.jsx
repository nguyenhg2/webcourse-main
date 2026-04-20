import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";

export default function Hero() {
  return (
    <section className="bg-gray-50">
      <div className="max-w-[1290px] mx-auto px-5 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col gap-6">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Nền tảng học trực tuyến #1 Việt Nam
          </span>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-secondary leading-tight">
            Học lập trình trực tuyến từ zero đến hero
          </h1>
          <p className="text-gray-600 text-lg leading-8 max-w-lg">
            Khám phá hàng trăm khóa học chất lượng cao được thiết kế bởi các chuyên gia hàng đầu trong ngành công nghệ.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Link
              to="/khoa-hoc"
              className="px-8 py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Khám phá khóa học
            </Link>
            <button className="flex items-center gap-2 px-6 py-3.5 text-secondary font-semibold hover:text-primary transition-colors">
              <span className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
                <FiPlay size={16} />
              </span>
              Xem giới thiệu
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <img
            src="https://placehold.co/600x450"
            alt="Học lập trình trực tuyến"
            className="rounded-2xl w-full"
          />
          <div className="hidden lg:flex absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg px-5 py-4 items-center gap-3">
            <span className="text-3xl font-heading font-bold text-primary">25K+</span>
            <span className="text-sm text-gray-600">Học viên<br />đang học</span>
          </div>
          <div className="hidden lg:flex absolute -top-6 -right-6 bg-white rounded-xl shadow-lg px-5 py-4 items-center gap-3">
            <span className="text-3xl font-heading font-bold text-accent">899</span>
            <span className="text-sm text-gray-600">Khóa học<br />chất lượng</span>
          </div>
        </div>
      </div>
    </section>
  );
}
