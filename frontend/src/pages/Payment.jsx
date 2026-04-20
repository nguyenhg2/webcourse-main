import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCreditCard } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

const METHODS = [
  { id: "mastercard", label: "Mastercard" },
  { id: "visa", label: "Visa" },
  { id: "paypal", label: "PayPal" },
  { id: "stripe", label: "Stripe" },
];

export default function Payment() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("visa");
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [billing, setBilling] = useState({ country: "Việt Nam", address: "", city: "", zip: "" });
  const [card, setCard] = useState({ name: "", number: "", month: "", year: "", cvv: "" });

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/thanh-toan-thanh-cong");
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Thanh toán" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-heading font-semibold text-secondary mb-5">Phương thức thanh toán</h2>
              <div className="flex flex-wrap gap-3">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`px-6 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      method === m.id ? "border-primary text-primary bg-primary-light" : "border-gray-200 text-gray-600 hover:border-primary"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-secondary mb-5">Thông tin liên hệ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} type="email" placeholder="Email *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="Điện thoại" className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
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
                  <input value={billing.zip} onChange={(e) => setBilling({ ...billing, zip: e.target.value })} placeholder="Mã bưu chính" className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-secondary mb-5">Thông tin thẻ</h2>
              <div className="flex flex-col gap-5">
                <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Tên trên thẻ *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="Số thẻ *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                <div className="grid grid-cols-3 gap-5">
                  <input value={card.month} onChange={(e) => setCard({ ...card, month: e.target.value })} placeholder="Tháng" className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                  <input value={card.year} onChange={(e) => setCard({ ...card, year: e.target.value })} placeholder="Năm" className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                  <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="Mã bảo mật" className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
              <FiCreditCard size={18} /> Hoàn tất thanh toán
            </button>
          </form>

          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-28 border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-secondary mb-5">Đơn hàng của bạn</h3>
              <div className="flex gap-4 mb-5">
                <img src="https://placehold.co/100x60" alt="Khóa học" className="w-24 h-16 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-medium text-secondary">React.js Từ Cơ Bản Đến Nâng Cao</p>
                  <p className="text-xs text-gray-500 mt-1">Đinh Thành Nguyên</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-sm border-t border-gray-100 pt-5">
                <div className="flex justify-between"><span className="text-gray-500">Giá gốc</span><span className="text-gray-400 line-through">799.000đ</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Giảm giá</span><span className="text-success">-200.000đ</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-3"><span className="font-semibold text-secondary">Tổng cộng</span><span className="font-bold text-primary text-lg">599.000đ</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
