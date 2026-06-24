import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FiCreditCard, FiShield } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { createPaymentAPI, enrollCourseAPI, syncPaymentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { courseFallbackImage, courseImage, useFallbackImage } from "../utils/courseImages";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " VND";
}

function courseIdsFromState(course) {
  if (course.items?.length) return course.items.map((item) => item._id).filter(Boolean);
  return course.courseId ? [course.courseId] : [];
}

function orderLines(course) {
  if (course.items?.length) return course.items;
  return [
    {
      _id: course.courseId || "course",
      title: course.title || "Khóa học",
      price: course.price || 0,
      thumbnail: course.thumbnail,
    },
  ];
}

function OrderSummary({ course }) {
  const lines = orderLines(course);
  const price = Number(course.price || lines.reduce((sum, item) => sum + Number(item.price || 0), 0));
  const discount = Number(course.discount || 0);
  const finalPrice = Number(course.finalTotal ?? Math.max(price - discount, 0));

  return (
    <aside className="w-full lg:w-[390px] shrink-0">
      <div className="sticky top-28 border border-gray-100 rounded-xl p-6 bg-white">
        <h3 className="text-lg font-semibold text-secondary mb-5">Đơn hàng</h3>
        <div className="flex flex-col gap-4 mb-5">
          {lines.map((item) => (
            <div key={item._id} className="flex gap-4">
              <img
                src={courseImage(item)}
                alt={item.title}
                onError={(event) => useFallbackImage(event, courseFallbackImage(item))}
                className="h-16 w-24 rounded-lg bg-gray-50 object-contain p-1"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-secondary leading-5">{item.title}</p>
                <p className="text-sm text-gray-500 mt-1">{formatPrice(item.price)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 text-sm border-t border-gray-100 pt-5">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Giá gốc</span>
            <span className="text-right">{formatPrice(price)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Giảm giá</span>
            <span className="text-success text-right">-{formatPrice(discount)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
            <span className="font-semibold text-secondary">Tổng cộng</span>
            <span className="font-bold text-primary text-lg text-right">{formatPrice(finalPrice)}</span>
          </div>
        </div>

        <div className="mt-5 border border-primary-light bg-primary-light rounded-lg p-4 text-sm text-secondary">
          <div className="flex items-start gap-3">
            <FiShield className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Stripe test mode</p>
              <p className="text-gray-600 mt-1">Thẻ demo: 4242 4242 4242 4242</p>
              <p className="text-gray-500 mt-1">Ngày hết hạn bất kỳ trong tương lai, CVC bất kỳ.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ManualCardCheckout({ course, courseIds, finalPrice, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [cardBrand, setCardBrand] = useState("");
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    line1: "",
    postal_code: "",
  });

  const billingComplete = Boolean(
    billingDetails.name.trim() && billingDetails.line1.trim() && billingDetails.postal_code.trim()
  );

  function handleBillingChange(e) {
    const { name, value } = e.target;
    setBillingDetails((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!courseIds.length) throw new Error("Không tìm thấy khóa học cần thanh toán");
      if (finalPrice > 0 && (!stripe || !elements)) throw new Error("Stripe chưa sẵn sàng, vui lòng thử lại");

      if (!billingComplete) throw new Error("Vui lòng nhập đầy đủ tên chủ thẻ, địa chỉ và mã postcode");
      const billingAddress = {
        name: billingDetails.name.trim(),
        line1: billingDetails.line1.trim(),
        postal_code: billingDetails.postal_code.trim(),
        country: "VN",
      };

      const payment = await createPaymentAPI({
        course_ids: courseIds,
        coupon_code: course.couponCode || "",
        card_brand: cardBrand,
        billing_address: billingAddress,
      });

      if (payment.status === "completed") {
        await onSuccess(payment.payment_id, courseIds);
        return;
      }

      const card = elements.getElement(CardElement);
      if (!payment.client_secret || !card) throw new Error("Không thể khởi tạo xác nhận thẻ");

      const result = await stripe.confirmCardPayment(payment.client_secret, {
        payment_method: {
          card,
          billing_details: {
            name: billingAddress.name,
            address: {
              line1: billingAddress.line1,
              postal_code: billingAddress.postal_code,
              country: billingAddress.country,
            },
          },
        },
      });

      if (result.error) {
        setMessage(result.error.message || "Stripe không xác nhận được thanh toán");
        return;
      }

      const synced = await syncPaymentAPI(payment.payment_id);
      if (synced.status !== "completed") {
        setMessage("Stripe đã xử lý nhưng đơn hàng chưa được xác nhận hoàn tất.");
        return;
      }

      await onSuccess(payment.payment_id, courseIds);
    } catch (err) {
      setMessage(err.response?.data?.error || err.response?.data?.detail || err.message || "Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <FiCreditCard className="text-primary" size={26} />
          <h2 className="text-2xl font-heading font-semibold text-secondary">Thông tin thẻ</h2>
        </div>
        <div className="border border-gray-100 rounded-xl p-6 md:p-7 bg-white flex flex-col gap-5 shadow-sm">
          <div>
            <label className="block text-base font-medium text-secondary mb-2.5" htmlFor="cardholder-name">
              Tên chủ thẻ
            </label>
            <input
              id="cardholder-name"
              name="name"
              value={billingDetails.name}
              onChange={handleBillingChange}
              placeholder="Nguyễn Văn A"
              className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-base text-secondary outline-none focus:border-primary"
              autoComplete="cc-name"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-secondary mb-2.5" htmlFor="billing-address">
              Địa chỉ thanh toán
            </label>
            <input
              id="billing-address"
              name="line1"
              value={billingDetails.line1}
              onChange={handleBillingChange}
              placeholder="Số nhà, đường, phường/xã"
              className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-base text-secondary outline-none focus:border-primary"
              autoComplete="billing address-line1"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-secondary mb-2.5" htmlFor="billing-postcode">
              Mã postcode
            </label>
            <input
              id="billing-postcode"
              name="postal_code"
              value={billingDetails.postal_code}
              onChange={handleBillingChange}
              placeholder="100000"
              className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-base text-secondary outline-none focus:border-primary"
              autoComplete="billing postal-code"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-secondary mb-2.5">Số thẻ</label>
            <div className="border border-gray-200 rounded-lg px-4 py-4 focus-within:border-primary">
              <CardElement
                onChange={(event) => {
                  setCardComplete(event.complete);
                  setCardBrand(event.brand || "");
                  setMessage(event.error?.message || "");
                }}
                onReady={(element) => element.focus()}
                options={{
                  hidePostalCode: true,
                  disableLink: true,
                  style: {
                    base: {
                      color: "#1d2026",
                      fontFamily: "Be Vietnam Pro, system-ui, sans-serif",
                      fontSize: "18px",
                      "::placeholder": { color: "#8c94a3" },
                    },
                    invalid: { color: "#e53935" },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <button
        disabled={loading || !billingComplete || (finalPrice > 0 && (!stripe || !elements || !cardComplete))}
        type="submit"
        className="w-full py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
      >
        <FiCreditCard size={18} /> {loading ? "Đang xử lý..." : `Thanh toán ${formatPrice(finalPrice)}`}
      </button>
      {message && <p className="text-sm text-red-500">{message}</p>}
    </form>
  );
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCartCount } = useAuth();
  const course = location.state || {};
  const courseIds = useMemo(() => courseIdsFromState(course), [course]);

  const lines = orderLines(course);
  const price = Number(course.price || lines.reduce((sum, item) => sum + Number(item.price || 0), 0));
  const discount = Number(course.discount || 0);
  const finalPrice = Number(course.finalTotal ?? Math.max(price - discount, 0));

  async function finishPayment(paymentId, paidCourseIds) {
    await enrollCourseAPI(paidCourseIds, paymentId);
    await refreshCartCount?.();
    navigate("/thanh-toan-thanh-cong", { state: { paymentId, courseIds: paidCourseIds } });
  }

  const stripeOptions = useMemo(
    () => ({
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#ff6636",
          colorText: "#1d2026",
          borderRadius: "8px",
          fontFamily: "Be Vietnam Pro, system-ui, sans-serif",
        },
      },
    }),
    []
  );

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Thanh toán" }]} />
      <div className="max-w-322.5 mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-secondary">Thanh toán khóa học</h1>
          <p className="text-gray-500 mt-2">Nhập thông tin thẻ để hoàn tất thanh toán.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {stripePromise ? (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <ManualCardCheckout course={course} courseIds={courseIds} finalPrice={finalPrice} onSuccess={finishPayment} />
            </Elements>
          ) : (
            <div className="flex-1 border border-error rounded-lg p-5 text-sm text-red-500">
              Thiếu VITE_STRIPE_PUBLISHABLE_KEY để hiển thị form thẻ Stripe.
            </div>
          )}

          <OrderSummary course={course} />
        </div>
      </div>
    </>
  );
}
