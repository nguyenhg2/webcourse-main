import { useEffect, useState } from "react";
import { getAdminContactsAPI, markContactReadAPI } from "../../services/api";
import { FiMail, FiCheckCircle } from "react-icons/fi";

export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAdminContactsAPI()
      .then(setContacts)
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkRead(id) {
    const updated = await markContactReadAPI(id);
    setContacts((prev) => prev.map((c) => (c._id === id ? updated : c)));
    if (selected?._id === id) setSelected(updated);
  }

  const unread = contacts.filter((c) => !c.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý liên hệ</h1>
          <p className="text-gray-500 mt-1">
            {unread > 0 ? <span className="text-primary font-medium">{unread} tin chưa đọc</span> : "Tất cả đã đọc"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Đang tải...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Chưa có liên hệ nào.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {contacts.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${selected?._id === c._id ? "bg-primary-light" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {!c.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      <span className={`font-medium text-gray-900 text-sm ${!c.is_read ? "font-semibold" : ""}`}>
                        {c.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("vi-VN") : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{c.subject}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{c.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.subject}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selected.name} — {selected.email}</p>
                  {selected.phone && <p className="text-sm text-gray-500">{selected.phone}</p>}
                </div>
                {!selected.is_read && (
                  <button
                    onClick={() => handleMarkRead(selected._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    <FiCheckCircle size={15} /> Đánh dấu đã đọc
                  </button>
                )}
                {selected.is_read && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs">
                    <FiCheckCircle size={13} /> Đã đọc
                  </span>
                )}
              </div>
              <hr className="border-gray-100" />
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              <p className="text-xs text-gray-400">
                {selected.created_at ? new Date(selected.created_at).toLocaleString("vi-VN") : ""}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
              <FiMail size={40} className="mb-3" />
              <p>Chọn một liên hệ để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
