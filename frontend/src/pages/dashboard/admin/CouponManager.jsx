import { useEffect, useState } from "react";
import { createCouponAPI, getCouponsAPI, updateCouponStatusAPI, validateCouponAPI } from "../../../services/api";

const DEFAULT_FORM = {
  code: "",
  type: "percentage",
  discount: "",
  maxUses: "",
  expiry: "",
  active: true,
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function formatExpiry(timestamp) {
  if (!timestamp) return "-";
  return new Date(Number(timestamp) * 1000).toLocaleDateString("vi-VN");
}

function parseDateInput(value) {
  if (!value) return 0;
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return NaN;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return NaN;
  }

  return Math.floor(date.getTime() / 1000);
}

function sortCoupons(coupons) {
  return [...coupons].sort((a, b) => Number(b.active) - Number(a.active) || a.code.localeCompare(b.code));
}

export default function CouponManager() {
  const [code, setCode] = useState("SALE50");
  const [amount, setAmount] = useState(599000);
  const [result, setResult] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const data = await getCouponsAPI();
      setCoupons(sortCoupons(data.coupons || []));
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setError("");
    setCreateOpen(true);
  }

  function closeCreateModal() {
    if (saving) return;
    setCreateOpen(false);
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function createCoupon(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const expiry = parseDateInput(form.expiry);
      if (Number.isNaN(expiry)) {
        setError("Ngày hết hạn phải có định dạng dd/mm/yyyy.");
        setSaving(false);
        return;
      }

      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        discount: Number(form.discount),
        max_uses: Number(form.maxUses || 0),
        expiry,
        active: form.active,
      };
      const created = await createCouponAPI(payload);
      setCoupons((prev) => sortCoupons([created, ...prev]));
      setForm(DEFAULT_FORM);
      setCreateOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || "Không tạo được mã giảm giá.");
    } finally {
      setSaving(false);
    }
  }

  async function validate() {
    const data = await validateCouponAPI(code, Number(amount));
    setResult(data);
  }

  async function toggleStatus(coupon) {
    setUpdatingId(coupon.id);
    try {
      const updated = await updateCouponStatusAPI(coupon.id, !coupon.active);
      setCoupons((prev) => sortCoupons(prev.map((item) => (item.id === coupon.id ? updated : item))));
    } catch (err) {
      alert(err.response?.data?.error || "Không cập nhật được trạng thái mã giảm giá.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Tạo mã giảm giá
        </button>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tạo mã giảm giá</h2>
                <p className="text-sm text-gray-500 mt-1">Thiết lập mã, giá trị và trạng thái sử dụng.</p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 text-xl"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <form onSubmit={createCoupon} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="code" value={form.code} onChange={handleFormChange} placeholder="Mã giảm giá" required className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary uppercase" />
                <select name="type" value={form.type} onChange={handleFormChange} className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary">
                  <option value="percentage">Phần trăm</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
                <input name="discount" value={form.discount} onChange={handleFormChange} type="number" min="1" placeholder={form.type === "percentage" ? "Giá trị (%)" : "Giá trị (VNĐ)"} required className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
                <input name="maxUses" value={form.maxUses} onChange={handleFormChange} type="number" min="0" placeholder="Gioi han luot dung" className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-600">Ngày hết hạn</span>
                  <input name="expiry" value={form.expiry} onChange={handleFormChange} type="text" inputMode="numeric" placeholder="dd/mm/yyyy" className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700">
                  <input name="active" type="checkbox" checked={form.active} onChange={handleFormChange} className="accent-primary" />
                  Bật mã sau khi tạo
                </label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeCreateModal} className="px-5 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold disabled:opacity-50">
                  {saving ? "Đang tạo..." : "Tạo mã"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-lg p-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
        <button onClick={validate} className="px-6 py-3 bg-primary text-white rounded-lg font-semibold">Kiểm tra</button>
      </div>

      {result && (
        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <p className="font-semibold text-secondary">{result.valid ? "Mã hợp lệ" : "Mã không hợp lệ"}</p>
          <p className="text-gray-600 mt-2">Số tiền giảm: {formatCurrency(result.discount)}</p>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-4">Mã</th>
              <th className="text-left p-4">Loại</th>
              <th className="text-left p-4">Giá trị</th>
              <th className="text-left p-4">Luot dung</th>
              <th className="text-left p-4">Hết hạn</th>
              <th className="text-left p-4">Trạng thái</th>
              <th className="text-left p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">Đang tải...</td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="p-4 font-semibold text-primary">{coupon.code}</td>
                  <td className="p-4">{coupon.type === "percentage" ? "Phần trăm" : "Cố định"}</td>
                  <td className="p-4">{coupon.type === "percentage" ? coupon.discount + "%" : formatCurrency(coupon.discount)}</td>
                  <td className="p-4">{Number(coupon.used_count || 0)} / {coupon.max_uses ? coupon.max_uses : "unlimited"}</td>
                  <td className="p-4">{formatExpiry(coupon.expiry)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {coupon.active ? "Đang bật" : "Đã tắt"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      disabled={updatingId === coupon.id}
                      onClick={() => toggleStatus(coupon)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
                        coupon.active ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-primary text-white hover:bg-orange-600"
                      }`}
                    >
                      {coupon.active ? "Tắt" : "Bật"}
                    </button>
                  </td>
                </tr>
              ))
            )}
            {!loading && coupons.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">Chưa có mã giảm giá.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
