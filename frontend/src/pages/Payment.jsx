import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCreditCard, FiLock } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

const paymentMethods = [
  { id: "mastercard", label: "Mastercard", color: "bg-red-600" },
  { id: "visa", label: "Visa", color: "bg-blue-600" },
  { id: "paypal", label: "PayPal", color: "bg-sky-500" },
  { id: "stripe", label: "Stripe", color: "bg-indigo-600" },
];

export default function Payment() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("visa");

  const [contact, setContact] = useState({ email: "", phone: "" });
  const [billing, setBilling] = useState({ country: "", address: "", city: "", zip: "" });
  const [card, setCard] = useState({ name: "", number: "", month: "", year: "", cvv: "" });

  const handleContactChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleBillingChange = (e) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCard({ ...card, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/thanh-toan-thanh-cong");
  };

  return (
    <section className="bg-white">
      <Breadcrumb items={[{ label: "Trang chu", to: "/" }, { label: "Thanh toan" }]} />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 order-2 lg:order-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Don hang cua ban</h3>

                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                  <img
                    src="https://placehold.co/120x80"
                    alt="Khoa hoc"
                    className="w-[120px] h-[80px] object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">React.js Tu Co Ban Den Nang Cao</h4>
                    <p className="text-gray-500 text-xs mb-2">Dinh Thanh Nguyen</p>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">599.000 VND</span>
                      <span className="text-gray-400 line-through text-sm">799.000 VND</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tam tinh</span>
                    <span className="text-gray-900">599.000 VND</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giam gia</span>
                    <span className="text-green-600">-200.000 VND</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thue</span>
                    <span className="text-gray-900">0 VND</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg mb-6">
                  <span className="text-gray-900">Tong cong</span>
                  <span className="text-primary">599.000 VND</span>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  <FiLock size={16} />
                  Thanh toan
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Thong tin thanh toan cua ban duoc bao mat tuyet doi
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 order-1 lg:order-2 space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Phuong thuc thanh toan</h3>
                <p className="text-sm text-gray-500 mb-5">Chon phuong thuc thanh toan phu hop</p>
                <div className="flex gap-3">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      className={`w-20 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold transition ${m.color} ${
                        selectedMethod === m.id
                          ? "ring-2 ring-offset-2 ring-primary"
                          : "opacity-60 hover:opacity-80"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Thong tin lien he</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={contact.email}
                      onChange={handleContactChange}
                      placeholder="Email"
                      required
                      className="w-full h-14 px-4 pt-5 pb-2 rounded border border-gray-300 text-base outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Dien thoai</label>
                    <input
                      type="tel"
                      name="phone"
                      value={contact.phone}
                      onChange={handleContactChange}
                      placeholder="So dien thoai"
                      className="w-full h-14 px-4 pt-5 pb-2 rounded border border-gray-300 text-base outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Dia chi thanh toan</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Quoc gia</label>
                    <select
                      name="country"
                      value={billing.country}
                      onChange={handleBillingChange}
                      className="w-full h-14 px-4 rounded border border-gray-300 text-base outline-none focus:border-primary bg-white"
                    >
                      <option value="">Chon quoc gia</option>
                      <option value="vn">Viet Nam</option>
                      <option value="us">United States</option>
                      <option value="jp">Japan</option>
                      <option value="kr">Korea</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Dia chi</label>
                    <input
                      type="text"
                      name="address"
                      value={billing.address}
                      onChange={handleBillingChange}
                      placeholder="Dia chi"
                      className="w-full h-14 px-4 pt-5 pb-2 rounded border border-gray-300 text-base outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Thanh pho</label>
                      <input
                        type="text"
                        name="city"
                        value={billing.city}
                        onChange={handleBillingChange}
                        placeholder="Thanh pho"
                        className="w-full h-14 px-4 pt-5 pb-2 rounded border border-gray-300 text-base outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Ma buu chinh</label>
                      <input
                        type="text"
                        name="zip"
                        value={billing.zip}
                        onChange={handleBillingChange}
                        placeholder="Ma buu chinh"
                        className="w-full h-14 px-4 pt-5 pb-2 rounded border border-gray-300 text-base outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Thong tin the</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Ten tren the</label>
                    <input
                      type="text"
                      name="name"
                      value={card.name}
                      onChange={handleCardChange}
                      placeholder="Ten tren the"
                      required
                      className="w-full h-14 px-4 pt-5 pb-2 rounded border border-gray-300 text-base outline-none focus:border-primary"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-900 mb-1">So the</label>
                    <input
                      type="text"
                      name="number"
                      value={card.number}
                      onChange={handleCardChange}
                      placeholder="0000 0000 0000 0000"
                      required
                      maxLength={19}
                      className="w-full h-14 px-4 pr-12 pt-5 pb-2 rounded border border-gray-300 text-base outline-none focus:border-primary"
                    />
                    <FiCreditCard className="absolute right-4 top-9 text-gray-400" size={20} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Thang</label>
                      <select
                        name="month"
                        value={card.month}
                        onChange={handleCardChange}
                        required
                        className="w-full h-14 px-4 rounded border border-gray-300 text-base outline-none focus:border-primary bg-white"
                      >
                        <option value="">Thang</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                            {String(i + 1).padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Nam</label>
                      <select
                        name="year"
                        value={card.year}
                        onChange={handleCardChange}
                        required
                        className="w-full h-14 px-4 rounded border border-gray-300 text-base outline-none focus:border-primary bg-white"
                      >
                        <option value="">Nam</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i} value={2026 + i}>
                            {2026 + i}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Ma bao mat</label>
                      <input
                        type="text"
                        name="cvv"
                        value={card.cvv}
                        onChange={handleCardChange}
                        placeholder="CVV"
                        required
                        maxLength={4}
                        className="w-full h-14 px-4 pt-5 pb-2 rounded border border-gray-300 text-base outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
