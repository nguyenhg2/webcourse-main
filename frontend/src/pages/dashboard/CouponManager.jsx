import { useEffect, useState } from "react";
import { getCouponsAPI, validateCouponAPI } from "../../services/api";

export default function CouponManager() {
  const [code, setCode] = useState("SALE50");
  const [amount, setAmount] = useState(599000);
  const [result, setResult] = useState(null);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    getCouponsAPI().then((data) => setCoupons(data.coupons || [])).catch(() => setCoupons([]));
  }, []);

  async function validate() {
    const data = await validateCouponAPI(code, Number(amount));
    setResult(data);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
        <p className="text-gray-500 mt-1">Kiểm tra hiệu lực và theo dõi coupon từ Payment Service.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
        <button onClick={validate} className="px-6 py-3 bg-primary text-white rounded-lg font-semibold">Kiểm tra</button>
      </div>

      {result && (
        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <p className="font-semibold text-secondary">{result.valid ? "Mã hợp lệ" : "Mã không hợp lệ"}</p>
          <p className="text-gray-600 mt-2">Số tiền giảm: {Number(result.discount || 0).toLocaleString("vi-VN")}đ</p>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-4">Mã</th>
              <th className="text-left p-4">Loại</th>
              <th className="text-left p-4">Giá trị</th>
              <th className="text-left p-4">Đã dùng</th>
              <th className="text-left p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="p-4 font-semibold text-primary">{coupon.code}</td>
                <td className="p-4">{coupon.type}</td>
                <td className="p-4">{coupon.type === "percentage" ? coupon.discount + "%" : Number(coupon.discount).toLocaleString("vi-VN") + "đ"}</td>
                <td className="p-4">{coupon.used}/{coupon.max_uses || "∞"}</td>
                <td className="p-4">{coupon.active ? "Đang bật" : "Đã tắt"}</td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">Chưa có coupon active trong Payment Service.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
