import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      
      <img 
        src="/images/Home_image.png" 
        alt="ảnh trang chủ"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/30 to-transparent"></div>

      <div className="relative z-10 max-w-322.5 mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center h-full">
        
        <div className="flex flex-col gap-6 max-w-lg">
                    
          <h1 className="text-4xl lg:text-5xl py-2 xl:text-6xl font-bold leading-tight text-primary-light">
            Nền tảng học lập trình trực tuyến <br/>
            <span className="text-primary"> "Từ zero đến heroo"</span>
          </h1>

          <p className="text-primary-light text-xl leading-6">
            Khám phá hàng trăm khóa học chất lượng cao được thiết kế bởi các chuyên gia hàng đầu trong ngành công nghệ.
          </p>

          <div className="flex items-center gap-4 mt-4">
            <Link 
              to="/khoa-hoc"
              className="px-8 py-4 bg-primary text-primary-light font-semibold rounded-full hover:bg-orange-600 transition-colors"
            >
              Khám phá khóa học
            </Link>
            
            <button className="flex items-center gap-3 px-6 py-4 text-primary-light font-semibold hover:text-orange-300 transition-colors">
              <span className="w-10 h-10 rounded-full bg-primary-light/20 backdrop-blur-md flex items-center justify-center">
                <FiPlay size={18} />
              </span>
              Xem giới thiệu
            </button>
          </div>
        </div>

      </div>

      <div className="absolute bottom-12 left-12 bg-primary-light rounded-full shadow-2xl px-6 py-4 hidden xl:flex items-center gap-4">
        <span className="text-4xl font-bold text-[#FF782D]">25K+</span>
        <span className="text-sm text-gray-700">Học viên<br />đang học</span>
      </div>

      <div className="absolute bottom-12 right-12 bg-primary-light rounded-full shadow-2xl px-6 py-4 hidden xl:flex items-center gap-4">
        <span className="text-4xl font-bold text-[#FF782D]">899</span>
        <span className="text-sm text-gray-700">Khóa học<br />chất lượng</span>
      </div>
    </section>
  );
}
