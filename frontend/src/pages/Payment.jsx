import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCreditCard } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { confirmTestPaymentAPI, createPaymentAPI, enrollCourseAPI, removeCartAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const METHODS = [
  { id: "visa", label: "Visa" },
  { id: "mastercard", label: "Mastercard" },
];

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value) {
  return onlyNumbers(value).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function cardLast4(cardNumber) {
  return onlyNumbers(cardNumber).slice(-4);
}

function detectCardBrand(cardNumber) {
  const number = onlyNumbers(cardNumber);
  if (/^4/.test(number)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "mastercard";
  return "";
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCartCount } = useAuth();
  const course = location.state || {};
  const [method, setMethod] = useState("visa");
  const [billing, setBilling] = useState({ country: "Việt Nam", address: "", city: "", zip: "" });
  const [card, setCard] = useState({ name: "", number: "", month: "", year: "", cvv: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const courseIds = course.items?.length
        ? course.items.map((item) => item._id)
        : course.courseId
          ? [course.courseId]
          : [];

      if (!courseIds.length) {
        throw new Error("Không tìm thấy khóa học cần thanh toán");
      }

      const enteredCard = {
        card_last4: cardLast4(card.number),
        card_brand: detectCardBrand(card.number) || method,
      };

      const payment = await createPaymentAPI({
        course_ids: courseIds,
        amount: course.price ?? 599000,
        coupon_code: course.couponCode || "",
        method,
        ...enteredCard,
      });
      sessionStorage.setItem(
        "pendingPaymentEnrollment",
        JSON.stringify({ paymentId: payment.payment_id, courseIds })
      );
      if (payment.status !== "completed") {
        await confirmTestPaymentAPI(payment.payment_id, enteredCard);
      }
      try {
        await enrollCourseAPI(courseIds, payment.payment_id);
        await Promise.allSettled(courseIds.map((courseId) => removeCartAPI(courseId)));
        await refreshCartCount?.();
        sessionStorage.removeItem("pendingPaymentEnrollment");
      } catch {
        // Keep pendingPaymentEnrollment so the success page can retry enrollment.
      }
      navigate("/thanh-toan-thanh-cong", { state: { paymentId: payment.payment_id, courseIds } });
    } catch (err) {
      setMessage(err.response?.data?.error || err.response?.data?.detail || err.message || "Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  }

  const price = course.price ?? 599000;
  const discount = Number(course.discount || 0);
  const finalPrice = course.finalTotal ?? Math.max(price - discount, 0);
  const title = course.title || "React.js Từ Cơ Bản Đến Nâng Cao";

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Thanh toán" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-heading font-semibold text-secondary mb-5">Phương thức thanh toán</h2>
              <div className="flex flex-wrap gap-3">
                {METHODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    className={`px-6 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      method === item.id ? "border-primary text-primary bg-primary-light" : "border-gray-200 text-gray-600 hover:border-primary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-secondary mb-5">Địa chỉ thanh toán</h2>
              <div className="flex flex-col gap-5">
                <select value={billing.country} onChange={(e) => setBilling({ ...billing, country: e.target.value })} className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none">
                  <option>Việt Nam</option>
                  <option>Hoa Kỳ</option>
                  <option>Nhật Bản</option>
                </select>
                <input value={billing.address} onChange={(e) => setBilling({ ...billing, address: e.target.value })} placeholder="Địa chỉ *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} placeholder="Thành phố *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                  <input value={billing.zip} onChange={(e) => setBilling({ ...billing, zip: onlyNumbers(e.target.value).slice(0, 8) })} placeholder="Mã bưu chính" className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-secondary mb-5">Thông tin thẻ</h2>
              <div className="flex flex-col gap-5">
                <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} placeholder="Tên trên thẻ *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                <input value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} inputMode="numeric" placeholder="Số thẻ *" required minLength={19} className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                <div className="grid grid-cols-3 gap-5">
                  <input value={card.month} onChange={(e) => setCard({ ...card, month: onlyNumbers(e.target.value).slice(0, 2) })} inputMode="numeric" placeholder="Tháng" required minLength={2} className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                  <input value={card.year} onChange={(e) => setCard({ ...card, year: onlyNumbers(e.target.value).slice(0, 2) })} inputMode="numeric" placeholder="Năm" required minLength={2} className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                  <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: onlyNumbers(e.target.value).slice(0, 3) })} inputMode="numeric" placeholder="CVC" required minLength={3} className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              <FiCreditCard size={18} /> {loading ? "Đang xử lý..." : "Hoàn tất thanh toán"}
            </button>
            {message && <p className="text-sm text-red-500">{message}</p>}
          </form>

          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-28 border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-secondary mb-5">Đơn hàng của bạn</h3>
              <div className="flex gap-4 mb-5">
                <img src={course.thumbnail || "https://placehold.co/100x60"} alt="Khóa học" className="w-24 h-16 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-medium text-secondary">{title}</p>
                  <p className="text-xs text-gray-500 mt-1">Đinh Thành Nguyên</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-sm border-t border-gray-100 pt-5">
                <div className="flex justify-between"><span className="text-gray-500">Giá gốc</span><span>{formatPrice(price)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Giảm giá</span><span className="text-success">-{formatPrice(discount)}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-3"><span className="font-semibold text-secondary">Tổng cộng</span><span className="font-bold text-primary text-lg">{formatPrice(finalPrice)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
