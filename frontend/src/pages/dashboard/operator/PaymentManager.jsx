import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { getAdminOrdersAPI, getPaymentHistoryAPI } from "../../../services/api";

const currency = (value) => Number(value || 0).toLocaleString("vi-VN") + "đ";

const STATUS_LABELS = {
  all: "Tất cả",
  completed: "Hoàn tất",
  pending: "Đang chờ",
  failed: "Thất bại",
};

const FILTERS = ["all", "completed", "pending"];

function statusLabel(status) {
  return STATUS_LABELS[status] || status || "Không rõ";
}

function paymentAmount(payment) {
  const amount = Number(payment.amount || 0);
  const discount = Number(payment.coupon_discount || 0);
  return Number(payment.final_amount ?? amount - discount);
}

function courseNames(payment) {
  if (payment.courses?.length) {
    return payment.courses.map((course) => course.title).join(", ");
  }
  return `${payment.course_ids?.length || 0} khóa`;
}

function cardText(payment) {
  if (!payment.card_brand) return "Chưa xác nhận";
  return payment.card_last4 ? `${payment.card_brand} ****${payment.card_last4}` : payment.card_brand;
}

function buyerName(payment, user, canSeeAll) {
  if (!canSeeAll) return user?.name || user?.email;
  return payment.user?.name || payment.user?.email || payment.user_id;
}

export default function PaymentManager() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState("all");
  const canSeeAll = user?.role === "admin" || user?.role === "operator";

  async function load() {
    try {
      const data = canSeeAll ? await getAdminOrdersAPI() : await getPaymentHistoryAPI();
      setPayments(Array.isArray(data) ? data : data.payments || []);
    } catch {
      setPayments([]);
    }
  }

  useEffect(() => {
    load();
  }, [canSeeAll]);

  const visible = useMemo(() => {
    if (status === "all") return payments;
    return payments.filter((payment) => payment.status === status);
  }, [payments, status]);

  const completedRevenue = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + paymentAmount(payment), 0);
  const pendingCount = payments.filter((payment) => payment.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{canSeeAll ? "Hỗ trợ thanh toán" : "Thanh toán của tôi"}</h1>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary">
          <FiRefreshCw size={16} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <p className="text-sm text-gray-500">Doanh thu hoàn tất</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{currency(completedRevenue)}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <p className="text-sm text-gray-500">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{payments.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <p className="text-sm text-gray-500">Đang chờ</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{pendingCount}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button key={item} onClick={() => setStatus(item)} className={`px-4 py-2 rounded-lg text-sm font-medium ${status === item ? "bg-primary text-white" : "bg-gray-50 text-gray-600"}`}>
            {statusLabel(item)}
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
              <th className="text-left p-4">Mã giảm giá</th>
              <th className="text-left p-4">Thẻ</th>
              <th className="text-left p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map((payment) => (
              <tr key={payment.id}>
                <td className="p-4 font-medium text-gray-900">{payment.id}</td>
                <td className="p-4">
                  <div>
                    <p className="font-medium text-gray-900">{buyerName(payment, user, canSeeAll)}</p>
                    {canSeeAll && payment.user?.email && <p className="text-xs text-gray-500 mt-1">{payment.user.email}</p>}
                  </div>
                </td>
                <td className="p-4">{courseNames(payment)}</td>
                <td className="p-4">{currency(paymentAmount(payment))}</td>
                <td className="p-4">{payment.coupon_code || "-"}</td>
                <td className="p-4">{cardText(payment)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${payment.status === "completed" ? "bg-success-light text-success" : "bg-orange-50 text-orange-600"}`}>
                    {statusLabel(payment.status)}
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
