import { useEffect, useState } from "react";
import { getAdminOrdersAPI } from "../../../services/api";
import { FiSearch } from "react-icons/fi";

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  completed: "Hoàn tất",
  pending: "Đang chờ",
  failed: "Thất bại",
};

function statusLabel(status) {
  return STATUS_LABELS[status] || status || "Không rõ";
}

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAdminOrdersAPI()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.id?.toLowerCase().includes(q)
    );
  });

  const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + (o.final_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-500 mt-1">
            {orders.length} đơn hàng — Doanh thu: <span className="text-emerald-600 font-semibold">{fmt(totalRevenue)}đ</span>
          </p>
        </div>
        <div className="relative">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Đang tải...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left p-4">Khách hàng</th>
                  <th className="text-left p-4">Số tiền</th>
                  <th className="text-left p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === o.id ? "bg-primary-light" : ""}`}
                  >
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{o.user?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{o.user?.email}</p>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">{fmt(o.final_amount)}đ</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="3" className="p-8 text-center text-gray-400">Chưa có đơn hàng.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          {selected ? (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900">Chi tiết đơn hàng</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Mã đơn</span>
                  <span className="font-mono text-xs text-gray-700 truncate max-w-[180px]">{selected.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Khách hàng</span>
                  <span className="font-medium">{selected.user?.name || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Email</span>
                  <span>{selected.user?.email || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Tổng tiền gốc</span>
                  <span>{fmt(selected.amount)}đ</span>
                </div>
                {selected.coupon_code && (
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">Mã giảm giá</span>
                    <span className="text-orange-600">{selected.coupon_code} (-{fmt(selected.coupon_discount)}đ)</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Thực thu</span>
                  <span className="font-bold text-emerald-600">{fmt(selected.final_amount)}đ</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Thẻ thanh toán</span>
                  <span>{selected.card_brand ? `${selected.card_brand} ****${selected.card_last4}` : "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Trạng thái</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selected.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusLabel(selected.status)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Ngày tạo</span>
                  <span>{selected.created_at ? new Date(selected.created_at * 1000).toLocaleString("vi-VN") : "—"}</span>
                </div>
              </div>
              {selected.courses?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Khóa học ({selected.courses.length})</p>
                  <div className="space-y-2">
                    {selected.courses.map((c) => (
                      <div key={c._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {c.thumbnail && <img src={c.thumbnail} className="w-10 h-10 rounded object-cover" alt="" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.title}</p>
                          <p className="text-xs text-gray-500">{fmt(c.price)}đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
              <p>Chọn một đơn hàng để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
