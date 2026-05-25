import { useEffect, useState } from "react";
import { getAdminUsersAPI } from "../../services/api";

const LEVEL_COLORS = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function StudentManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminUsersAPI()
      .then((users) => setStudents(users.filter((u) => u.role === "student")))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="text-gray-500 mt-1">Tổng cộng <strong>{students.length}</strong> học viên.</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary w-72"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left p-4">Học viên</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {s.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{s.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{s.email}</td>
                  <td className="p-4 text-gray-500">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="3" className="p-8 text-center text-gray-400">Không tìm thấy học viên.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
