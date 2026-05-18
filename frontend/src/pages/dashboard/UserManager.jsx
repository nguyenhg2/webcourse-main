import { useEffect, useState } from "react";
import { getAdminUsersAPI, updateAdminUserRoleAPI } from "../../services/api";

const ROLES = ["student", "instructor", "operator", "admin"];

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getAdminUsersAPI().then(setUsers).catch(() => setUsers([]));
  }, []);

  async function updateRole(userId, role) {
    const updated = await updateAdminUserRoleAPI(userId, role);
    setUsers((current) => current.map((item) => (item._id === userId ? updated : item)));
    setMessage("Đã cập nhật vai trò.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-500 mt-1">Quản trị tài khoản và phân quyền 4 vai trò.</p>
      </div>
      {message && <p className="text-sm text-success">{message}</p>}
      <div className="bg-white border border-gray-100 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-4">Tên</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Vai trò</th>
              <th className="text-left p-4">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="p-4 font-medium text-gray-900">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <select value={user.role} onChange={(e) => updateRole(user._id, e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary">
                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </td>
                <td className="p-4">{user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : ""}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">Không tải được danh sách người dùng hoặc chưa có dữ liệu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
