import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCreditCard } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { createPaymentAPI, enrollCourseAPI, removeCartAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCardNumber(value) {
  return onlyNumbers(value).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
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

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " VND";
}

function courseIdsFromState(course) {
  if (course.items?.length) return course.items.map((item) => item._id).filter(Boolean);
  return course.courseId ? [course.courseId] : [];
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCartCount } = useAuth();
  const course = location.state || {};

  const [billing, setBilling] = useState({ country: "VN", address: "", city: "", zip: "" });
  const [card, setCard] = useState({ name: "", number: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const courseIds = courseIdsFromState(course);
      if (!courseIds.length) throw new Error("Khong tim thay khoa hoc can thanh toan");

      const payment = await createPaymentAPI({
        course_ids: courseIds,
        coupon_code: course.couponCode || "",
        card_last4: cardLast4(card.number),
        card_brand: detectCardBrand(card.number),
        billing_address: {
          name: card.name,
          line1: billing.address,
          city: billing.city,
          postal_code: billing.zip,
          country: billing.country,
        },
      });

      if (payment.status !== "completed") {
        setMessage("Da tao Stripe PaymentIntent. Can Stripe Elements de hoan tat thanh toan.");
        return;
      }

      sessionStorage.setItem("pendingPaymentEnrollment", JSON.stringify({ paymentId: payment.payment_id, courseIds }));
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
      setMessage(err.response?.data?.error || err.response?.data?.detail || err.message || "Thanh toan that bai");
    } finally {
      setLoading(false);
    }
  }

  const price = Number(course.price || 0);
  const discount = Number(course.discount || 0);
  const finalPrice = course.finalTotal ?? Math.max(price - discount, 0);
  const title = course.title || "Khoa hoc";

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chu", to: "/" }, { label: "Thanh toan" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-heading font-semibold text-secondary mb-5">Dia chi thanh toan</h2>
              <div className="flex flex-col gap-5">
                <select value={billing.country} onChange={(e) => setBilling({ ...billing, country: e.target.value })} className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none">
                  <option value="VN">Viet Nam</option>
                  <option value="US">United States</option>
                  <option value="JP">Japan</option>
                </select>
                <input value={billing.address} onChange={(e) => setBilling({ ...billing, address: e.target.value })} placeholder="Dia chi *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} placeholder="Thanh pho *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                  <input value={billing.zip} onChange={(e) => setBilling({ ...billing, zip: onlyNumbers(e.target.value).slice(0, 8) })} placeholder="Ma buu chinh" className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-secondary mb-5">Thong tin the</h2>
              <div className="flex flex-col gap-5">
                <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} placeholder="Ten tren the *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                <input value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} inputMode="numeric" placeholder="So the *" required minLength={19} className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              <FiCreditCard size={18} /> {loading ? "Dang xu ly..." : "Tao thanh toan Stripe"}
            </button>
            {message && <p className="text-sm text-red-500">{message}</p>}
          </form>

          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-28 border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-secondary mb-5">Don hang</h3>
              <div className="flex gap-4 mb-5">
                {course.thumbnail && <img src={course.thumbnail} alt="Khoa hoc" className="w-24 h-16 rounded-lg object-cover" />}
                <p className="text-sm font-medium text-secondary">{title}</p>
              </div>
              <div className="flex flex-col gap-3 text-sm border-t border-gray-100 pt-5">
                <div className="flex justify-between"><span className="text-gray-500">Gia goc</span><span>{formatPrice(price)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Giam gia</span><span className="text-success">-{formatPrice(discount)}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-3"><span className="font-semibold text-secondary">Tong cong</span><span className="font-bold text-primary text-lg">{formatPrice(finalPrice)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
