import { useEffect, useState } from "react";
import { getAdminUsersAPI, updateAdminUserRoleAPI } from "../../services/api";

const ROLES = ["student", "instructor", "operator", "admin"];

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700",
  operator: "bg-blue-100 text-blue-700",
  instructor: "bg-purple-100 text-purple-700",
  student: "bg-gray-100 text-gray-700",
};

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getAdminUsersAPI()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(userId, role) {
    setUpdating(userId);
    try {
      const updated = await updateAdminUserRoleAPI(userId, role);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: updated.role } : u)));
    } catch {
      alert("Cập nhật thất bại");
    } finally {
      setUpdating(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-500 mt-1">Quản trị tài khoản và phân quyền.</p>
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
                <th className="text-left p-4">Người dùng</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Vai trò</th>
                <th className="text-left p-4">Ngày tạo</th>
                <th className="text-left p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        {u.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || ROLE_COLORS.student}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      disabled={updating === u._id}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">Không tìm thấy người dùng.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
