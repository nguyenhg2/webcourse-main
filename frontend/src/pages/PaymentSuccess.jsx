import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

export default function PaymentSuccess() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Thanh toán thành công" }]} />
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <FiCheckCircle size={64} className="text-success mx-auto mb-6" />
        <h1 className="text-3xl font-heading font-bold text-secondary">Thanh toán thành công</h1>
        <p className="text-gray-600 mt-4">Cảm ơn bạn đã mua khóa học. Bạn có thể bắt đầu học ngay bây giờ.</p>
        <p className="text-sm text-gray-500 mt-3">Tự động chuyển về trang chủ sau {countdown} giây</p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link to="/" className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Về trang chủ
          </Link>
          <Link to="/khoa-hoc" className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
            Xem khóa học
          </Link>
        </div>
      </div>
    </>
  );
}
