import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiClock, FiRefreshCw } from "react-icons/fi";
import { getComplaintsAPI, updateComplaintAPI } from "../../../services/api";

const STATUS_LABELS = {
  open: "Đang mở",
  pending: "Đang xử lý",
  resolved: "Đã xử lý",
};

const PRIORITY_LABELS = {
  low: "Thấp",
  normal: "Bình thường",
  high: "Cao",
};

const FILTERS = [
  { value: "open", label: "Đang mở" },
  { value: "pending", label: "Đang xử lý" },
  { value: "resolved", label: "Đã xử lý" },
  { value: "all", label: "Tất cả" },
];

function EmptyState({ text }) {
  return <div className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">{text}</div>;
}

export default function WorkflowBoard() {
  const [active, setActive] = useState("open");
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const counts = useMemo(() => {
    return rows.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        acc.all += 1;
        return acc;
      },
      { all: 0 }
    );
  }, [rows]);

  const visible = active === "all" ? rows : rows.filter((row) => row.status === active);

  function loadComplaints() {
    setLoading(true);
    getComplaintsAPI({ status: "all" })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setRows(list);
        setNotes(Object.fromEntries(list.map((item) => [item._id, item.operator_note || ""])));
      })
      .catch(() => {
        setRows([]);
        setNotes({});
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  function updateLocal(item) {
    setRows((current) => current.map((row) => (row._id === item._id ? item : row)));
    setNotes((current) => ({ ...current, [item._id]: item.operator_note || "" }));
  }

  function handleUpdate(item, payload) {
    setSavingId(item._id);
    updateComplaintAPI(item._id, payload)
      .then(updateLocal)
      .finally(() => setSavingId(""));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Vận hành</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Giải quyết khiếu nại</h1>
          </div>
          <button onClick={loadComplaints} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary">
            <FiRefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Đang mở</p>
            <FiAlertCircle className="text-orange-500" size={20} />
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{counts.open || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Đang xử lý</p>
            <FiClock className="text-blue-500" size={20} />
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{counts.pending || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Đã xử lý</p>
            <FiCheckCircle className="text-emerald-500" size={20} />
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{counts.resolved || 0}</p>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button key={item.value} onClick={() => setActive(item.value)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${active === item.value ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:text-primary"}`}>
              {item.label} ({counts[item.value] || 0})
            </button>
          ))}
        </div>
      </section>

      {loading ? <EmptyState text="Đang tải dữ liệu khiếu nại..." /> : visible.length === 0 ? <EmptyState text="Không có khiếu nại phù hợp." /> : (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visible.map((item) => (
            <article key={item._id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">#{item._id.slice(-6)}</p>
                  <h2 className="mt-2 text-lg font-semibold text-gray-900">{item.title}</h2>
                </div>
                <span className="shrink-0 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{STATUS_LABELS[item.status] || item.status}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
                <p><span className="font-semibold text-gray-900">Học viên:</span> {item.student?.name || item.student_name || "Chưa rõ"}</p>
                <p><span className="font-semibold text-gray-900">Ưu tiên:</span> {PRIORITY_LABELS[item.priority] || item.priority}</p>
                <p><span className="font-semibold text-gray-900">Khóa học:</span> {item.course?.title || "Không gắn khóa học"}</p>
                <p><span className="font-semibold text-gray-900">Thanh toán:</span> {item.payment?.status || "Không gắn giao dịch"}</p>
              </div>

              <textarea
                value={notes[item._id] || ""}
                onChange={(event) => setNotes((current) => ({ ...current, [item._id]: event.target.value }))}
                className="mt-4 h-24 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-primary"
                placeholder="Ghi chú xử lý"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <select value={item.status} onChange={(event) => handleUpdate(item, { status: event.target.value, operator_note: notes[item._id] || "" })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <select value={item.priority || "normal"} onChange={(event) => handleUpdate(item, { priority: event.target.value, operator_note: notes[item._id] || "" })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary">
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <button onClick={() => handleUpdate(item, { operator_note: notes[item._id] || "" })} disabled={savingId === item._id} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {savingId === item._id ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
