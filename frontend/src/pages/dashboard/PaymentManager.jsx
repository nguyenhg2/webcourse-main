import { useEffect, useState } from "react";
import { getPaymentHistoryAPI } from "../../services/api";

export default function PaymentManager() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    getPaymentHistoryAPI()
      .then((data) => setPayments(data.payments || []))
      .catch(() => setPayments([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-500 mt-1">Danh sách giao dịch thanh toán từ Payment Service.</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-4">Mã thanh toán</th>
              <th className="text-left p-4">Khóa học</th>
              <th className="text-left p-4">Số tiền</th>
              <th className="text-left p-4">Thẻ</th>
              <th className="text-left p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="p-4 font-medium text-gray-900">{payment.id}</td>
                <td className="p-4">{payment.course_ids?.length || 0} khóa</td>
                <td className="p-4">{Number(payment.amount || 0).toLocaleString("vi-VN")}đ</td>
                <td className="p-4">{payment.card_brand ? `${payment.card_brand} ****${payment.card_last4}` : "Chưa xác nhận"}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-success-light text-success">{payment.status}</span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">Chưa có giao dịch trong phiên hiện tại.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
