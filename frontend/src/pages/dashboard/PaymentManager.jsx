import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getAllPaymentsAPI, getPaymentHistoryAPI } from "../../services/api";

const currency = (value) => Number(value || 0).toLocaleString("vi-VN") + "đ";

export default function PaymentManager() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState("all");
  const canSeeAll = user?.role === "admin" || user?.role === "operator";

  function load() {
    const request = canSeeAll ? getAllPaymentsAPI() : getPaymentHistoryAPI();
    request.then((data) => setPayments(data.payments || [])).catch(() => setPayments([]));
  }

  useEffect(() => {
    load();
  }, [canSeeAll]);

  const visible = useMemo(() => {
    if (status === "all") return payments;
    return payments.filter((payment) => payment.status === status);
  }, [payments, status]);

  const total = payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + Number(payment.amount || 0) - Number(payment.coupon_discount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{canSeeAll ? "Hỗ trợ thanh toán" : "Thanh toán của tôi"}</h1>
          <p className="text-gray-500 mt-1">{canSeeAll ? "Theo dõi và đối soát giao dịch từ Payment Service." : "Lịch sử giao dịch của tài khoản hiện tại."}</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary">
          <FiRefreshCw size={16} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <p className="text-sm text-gray-500">Doanh thu hoàn tất</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{currency(total)}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <p className="text-sm text-gray-500">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{payments.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <p className="text-sm text-gray-500">Đang chờ</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{payments.filter((payment) => payment.status === "pending").length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-4 flex flex-wrap gap-2">
        {["all", "completed", "pending"].map((item) => (
          <button key={item} onClick={() => setStatus(item)} className={`px-4 py-2 rounded-lg text-sm font-medium ${status === item ? "bg-primary text-white" : "bg-gray-50 text-gray-600"}`}>
            {item === "all" ? "Tất cả" : item}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-4">Mã thanh toán</th>
              <th className="text-left p-4">Người dùng</th>
              <th className="text-left p-4">Khóa học</th>
              <th className="text-left p-4">Số tiền</th>
              <th className="text-left p-4">Coupon</th>
              <th className="text-left p-4">Thẻ</th>
              <th className="text-left p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map((payment) => (
              <tr key={payment.id}>
                <td className="p-4 font-medium text-gray-900">{payment.id}</td>
                <td className="p-4">{canSeeAll ? payment.user_id : user?.email}</td>
                <td className="p-4">{payment.course_ids?.length || 0} khóa</td>
                <td className="p-4">{currency(Number(payment.amount || 0) - Number(payment.coupon_discount || 0))}</td>
                <td className="p-4">{payment.coupon_code || "-"}</td>
                <td className="p-4">{payment.card_brand ? `${payment.card_brand} ${payment.card_last4 ? "****" + payment.card_last4 : ""}` : "Chưa xác nhận"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${payment.status === "completed" ? "bg-success-light text-success" : "bg-orange-50 text-orange-600"}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">Chưa có giao dịch.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
