import { useState } from "react";
import { validateCouponAPI } from "../../services/api";

const SAMPLE_CODES = [
  { code: "SALE50", description: "Giảm 50% đơn hàng trong môi trường demo" },
  { code: "CODECAMP", description: "Giảm cố định 100.000đ" },
];

export default function CouponManager() {
  const [code, setCode] = useState("SALE50");
  const [amount, setAmount] = useState(599000);
  const [result, setResult] = useState(null);

  async function validate() {
    const data = await validateCouponAPI(code, Number(amount));
    setResult(data);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
        <p className="text-gray-500 mt-1">Kiểm tra mã giảm giá qua Payment Service.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
        <input value={code} onChange={(e) => setCode(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
        <button onClick={validate} className="px-6 py-3 bg-primary text-white rounded-lg font-semibold">Kiểm tra</button>
      </div>

      {result && (
        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <p className="font-semibold text-secondary">{result.valid ? "Mã hợp lệ" : "Mã không hợp lệ"}</p>
          <p className="text-gray-600 mt-2">Số tiền giảm: {Number(result.discount || 0).toLocaleString("vi-VN")}đ</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_CODES.map((item) => (
          <div key={item.code} className="bg-white border border-gray-100 rounded-lg p-5">
            <h2 className="font-bold text-primary">{item.code}</h2>
            <p className="text-sm text-gray-600 mt-2">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
