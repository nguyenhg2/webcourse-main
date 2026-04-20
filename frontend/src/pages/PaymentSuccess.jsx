import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

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
    <section className="bg-white">
      <Breadcrumb items={[{ label: "Trang chu", to: "/" }, { label: "Thanh toan thanh cong" }]} />

      <div className="max-w-3xl mx-auto px-4 py-24">
        <div className="bg-white rounded-[20px] border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-6">
            <FiCheckCircle className="text-green-600" size={56} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">Thanh toan thanh cong</h1>

          <p className="text-gray-600 text-lg mb-2">
            Cam on ban da mua khoa hoc. Ban co the bat dau hoc ngay bay gio.
          </p>

          <p className="text-gray-500 mb-8">
            Dang chuyen huong ve trang chinh trong <span className="font-bold text-primary">{countdown}</span> giay...
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition"
            >
              Ve trang chu
            </button>
            <button
              onClick={() => navigate("/khoa-hoc")}
              className="px-8 py-3 bg-white text-primary font-semibold rounded-full border-2 border-primary hover:bg-primary/5 transition"
            >
              Xem khoa hoc
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
