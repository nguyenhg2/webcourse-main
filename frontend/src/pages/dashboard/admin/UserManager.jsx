import { useEffect, useState } from "react";
import { getAdminUsersAPI, updateAdminUserRoleAPI, updateAdminUserStatusAPI } from "../../../services/api";

const ROLES = ["admin", "operator", "instructor", "student"];
const ROLE_LABELS = {
  admin: "Quản trị viên",
  operator: "Vận hành",
  instructor: "Giảng viên",
  student: "Học viên",
};
const ROLE_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "admin", label: ROLE_LABELS.admin },
  { value: "operator", label: ROLE_LABELS.operator },
  { value: "instructor", label: ROLE_LABELS.instructor },
  { value: "student", label: ROLE_LABELS.student },
];
const ROLE_ORDER = {
  admin: 0,
  operator: 1,
  instructor: 2,
  student: 3,
};

function createdAtValue(user) {
  if (!user.created_at) return 0;
  const value = new Date(user.created_at).getTime();
  return Number.isNaN(value) ? 0 : value;
}

function sortUsers(users) {
  return [...users].sort((a, b) => {
    const roleDiff = (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99);
    if (roleDiff !== 0) return roleDiff;
    return createdAtValue(b) - createdAtValue(a);
  });
}

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
  const [activeRole, setActiveRole] = useState("all");

  useEffect(() => {
    getAdminUsersAPI()
      .then((data) => setUsers(sortUsers(data)))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(userId, role) {
    setUpdating(userId);
    try {
      const updated = await updateAdminUserRoleAPI(userId, role);
      setUsers((prev) => sortUsers(prev.map((u) => (u._id === userId ? { ...u, role: updated.role } : u))));
    } catch (err) {
      alert(err.response?.data?.detail || "Cập nhật thất bại");
    } finally {
      setUpdating(null);
    }
  }

  async function changeStatus(userId, isActive) {
    setUpdating(userId);
    try {
      const updated = await updateAdminUserStatusAPI(userId, isActive);
      setUsers((prev) => sortUsers(prev.map((u) => (u._id === userId ? { ...u, is_active: updated.is_active } : u))));
    } catch (err) {
      alert(err.response?.data?.detail || "Cập nhật trạng thái thất bại");
    } finally {
      setUpdating(null);
    }
  }

  const roleCounts = users.reduce(
    (acc, user) => {
      acc.all += 1;
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    },
    { all: 0, admin: 0, operator: 0, instructor: 0, student: 0 }
  );

  const keyword = search.trim().toLowerCase();
  const filtered = users.filter((u) => {
    const matchesRole = activeRole === "all" || u.role === activeRole;
    const matchesSearch =
      !keyword ||
      u.name?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword);

    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary w-72"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-2 flex flex-wrap gap-2 shadow-sm">
        {ROLE_TABS.map((tab) => {
          const active = activeRole === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveRole(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs ${active ? "text-white/80" : "text-gray-400"}`}>
                {roleCounts[tab.value] || 0}
              </span>
            </button>
          );
        })}
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
                <th className="text-left p-4">Trạng thái</th>
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
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {u.is_active === false ? "Đã khóa" : "Đang hoạt động"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={u.role}
                        disabled={u.role === "admin" || updating === u._id}
                        title={u.role === "admin" ? "Không được đổi vai trò của admin" : undefined}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={u.role === "admin" || updating === u._id}
                        onClick={() => changeStatus(u._id, u.is_active === false)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 disabled:opacity-50"
                      >
                        {u.is_active === false ? "Mở khóa" : "Khóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Không tìm thấy người dùng.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
