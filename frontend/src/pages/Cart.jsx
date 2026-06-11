import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiShoppingCart, FiTag } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { getCartAPI, removeCartAPI, validateCouponAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

export default function Cart() {
  const navigate = useNavigate();
  const { setCartCount, refreshCartCount } = useAuth();
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getCartAPI()
      .then((data) => {
        const nextItems = data.items || [];
        setItems(nextItems);
        setCartCount(nextItems.length);
      })
      .catch(() => {
        setItems([]);
        setCartCount(0);
      });
  }, [setCartCount]);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items]);
  const finalTotal = Math.max(total - discount, 0);

  async function removeItem(courseId) {
    await removeCartAPI(courseId);
    setItems((current) => {
      const nextItems = current.filter((item) => item._id !== courseId);
      setCartCount(nextItems.length);
      return nextItems;
    });
    refreshCartCount();
  }

  async function applyCoupon() {
    setMessage("");
    const result = await validateCouponAPI(coupon, total);
    if (!result.valid) {
      setDiscount(0);
      setMessage("Mã giảm giá không hợp lệ");
      return;
    }
    setDiscount(result.discount || 0);
    setMessage("Đã áp dụng mã giảm giá");
  }

  function checkout() {
    navigate("/thanh-toan", {
      state: {
        items,
        courseId: items[0]?._id,
        title: items.length === 1 ? items[0].title : items.length + " khóa học",
        thumbnail: items[0]?.thumbnail,
        price: total,
        discount,
        finalTotal,
        couponCode: discount > 0 ? coupon : "",
      },
    });
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Giỏ hàng" }]} />
      <div className="max-w-322.5 mx-auto px-5 py-10">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-8">Giỏ hàng</h1>
        {items.length === 0 ? (
          <div className="text-center py-20 border border-gray-100 rounded-lg">
            <FiShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Giỏ hàng đang trống.</p>
            <Link to="/khoa-hoc" className="inline-block mt-5 px-6 py-3 bg-primary text-white rounded-lg font-semibold">
              Xem khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item._id} className="flex gap-4 border border-gray-100 rounded-lg p-4">
                  <img src={item.thumbnail || "https://placehold.co/160x90"} alt={item.title} className="w-36 h-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h2 className="font-semibold text-secondary">{item.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{item.level || "beginner"}</p>
                    <p className="text-primary font-bold mt-3">{formatPrice(item.price)}</p>
                  </div>
                  <button onClick={() => removeItem(item._id)} className="text-gray-400 hover:text-error">
                    <FiTrash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            <aside className="border border-gray-100 rounded-lg p-6 h-fit">
              <h2 className="font-semibold text-secondary mb-4">Tóm tắt đơn hàng</h2>
              <div className="flex gap-2 mb-4">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="SALE50 hoặc CODECAMP" className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" />
                <button onClick={applyCoupon} className="px-4 py-2 border border-primary text-primary rounded-lg">
                  <FiTag />
                </button>
              </div>
              {message && <p className="text-sm text-gray-500 mb-4">{message}</p>}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between"><span>Giảm giá</span><span className="text-success">-{formatPrice(discount)}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-3 font-bold text-lg"><span>Tổng</span><span className="text-primary">{formatPrice(finalTotal)}</span></div>
              </div>
              <button onClick={checkout} className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-semibold">
                Thanh toán
              </button>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
