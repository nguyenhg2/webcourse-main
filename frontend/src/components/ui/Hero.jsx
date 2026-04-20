import { FiPlay } from "react-icons/fi";

export default function Hero() {
  return (
    <section className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <span className="inline-block bg-primary-light text-primary text-sm font-semibold px-3 py-1 rounded-full mb-4">
            Nen tang hoc truc tuyen #1 Viet Nam
          </span>
          <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-bold text-secondary leading-tight mb-6">
            Hoc lap trinh truc tuyen{" "}
            <span className="text-primary">tu zero den hero</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
            Khoa hoc chat luong cao voi giang vien hang dau, tu co ban den nang
            cao. Bat dau hanh trinh lap trinh cua ban ngay hom nay.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <a
              href="#courses"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors"
            >
              Kham pha khoa hoc
            </a>
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-md text-secondary font-semibold hover:border-primary hover:text-primary transition-colors">
              <FiPlay size={18} />
              Xem gioi thieu
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <img
            src="https://placehold.co/600x450/FF6636/fff?text=CodeCamp"
            alt="Hero"
            className="w-full max-w-lg mx-auto rounded-xl shadow-lg"
          />
          <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-md p-4 hidden lg:flex items-center gap-3">
            <div className="w-10 h-10 bg-success-light rounded-full flex items-center justify-center text-success font-bold">
              25K+
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary">Hoc vien</p>
              <p className="text-xs text-gray-400">dang hoc tren he thong</p>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-md p-4 hidden lg:flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center text-accent font-bold text-sm">
              899
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary">Khoa hoc</p>
              <p className="text-xs text-gray-400">da duoc phat hanh</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
