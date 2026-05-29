import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { enrollCourseAPI, removeCartAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PaymentSuccess() {
  const [countdown, setCountdown] = useState(5);
  const [enrollStatus, setEnrollStatus] = useState("idle");
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshCartCount } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function unlockCourses() {
      let fallback = {};
      const stored = sessionStorage.getItem("pendingPaymentEnrollment");
      if (stored) {
        try {
          fallback = JSON.parse(stored);
        } catch {
          sessionStorage.removeItem("pendingPaymentEnrollment");
        }
      }

      const paymentId = location.state?.paymentId || fallback.paymentId;
      const courseIds = location.state?.courseIds || fallback.courseIds || [];
      if (!paymentId || !courseIds.length) return;

      setEnrollStatus("loading");
      try {
        await enrollCourseAPI(courseIds, paymentId);
        await Promise.allSettled(courseIds.map((courseId) => removeCartAPI(courseId)));
        await refreshCartCount?.();
        sessionStorage.removeItem("pendingPaymentEnrollment");
        if (!cancelled) setEnrollStatus("success");
      } catch {
        if (!cancelled) setEnrollStatus("error");
      }
    }

    unlockCourses();
    return () => {
      cancelled = true;
    };
  }, [location.state]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      navigate("/khoa-hoc-cua-toi");
    }
  }, [countdown, navigate]);

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Thanh toán thành công" }]} />
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <FiCheckCircle size={64} className="text-success mx-auto mb-6" />
        <h1 className="text-3xl font-heading font-bold text-secondary">Thanh toán thành công</h1>
        <p className="text-gray-600 mt-4">
          Cảm ơn bạn đã mua khóa học. Bạn có thể bắt đầu học ngay bây giờ.
        </p>
        {enrollStatus === "loading" && <p className="text-sm text-gray-500 mt-3">Đang mở khóa khóa học...</p>}
        {enrollStatus === "success" && <p className="text-sm text-success mt-3">Khóa học đã được mở khóa.</p>}
        {enrollStatus === "error" && (
          <p className="text-sm text-red-500 mt-3">
            Chưa thể mở khóa tự động. Vui lòng tải lại trang hoặc kiểm tra lại sau.
          </p>
        )}
        <p className="text-sm text-gray-500 mt-3">
          Tự động chuyển về khóa học của tôi sau {countdown} giây
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link to="/khoa-hoc-cua-toi" className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Vào học ngay
          </Link>
          <Link to="/khoa-hoc" className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
            Xem khóa học
          </Link>
        </div>
      </div>
    </>
  );
}
