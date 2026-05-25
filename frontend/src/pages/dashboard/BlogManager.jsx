import { useEffect, useState } from "react";
import { getAdminBlogsAPI, createBlogAPI, updateBlogAPI, deleteBlogAPI } from "../../services/api";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";

const EMPTY = { title: "", slug: "", excerpt: "", content: "", image: "", author: "", is_published: false };

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: "create"|"edit", data }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  function fetchBlogs() {
    setLoading(true);
    getAdminBlogsAPI()
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }

  function openCreate() {
    setForm(EMPTY);
    setModal({ mode: "create" });
  }

  function openEdit(blog) {
    setForm({ ...blog });
    setModal({ mode: "edit", id: blog._id });
  }

  async function handleSave() {
    if (!form.title || !form.excerpt || !form.content || !form.author) {
      alert("Vui lòng điền đủ các trường bắt buộc");
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === "create") {
        await createBlogAPI(form);
      } else {
        await updateBlogAPI(modal.id, form);
      }
      setModal(null);
      fetchBlogs();
    } catch {
      alert("Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xóa bài viết này?")) return;
    await deleteBlogAPI(id);
    fetchBlogs();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Blog</h1>
          <p className="text-gray-500 mt-1">Đăng và chỉnh sửa bài viết.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm">
          <FiPlus /> Thêm bài viết
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left p-4">Tiêu đề</th>
                <th className="text-left p-4">Tác giả</th>
                <th className="text-left p-4">Trạng thái</th>
                <th className="text-left p-4">Ngày tạo</th>
                <th className="text-left p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.map((b) => (
                <tr key={b._id}>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{b.title}</p>
                    <p className="text-xs text-gray-400">{b.slug}</p>
                  </td>
                  <td className="p-4 text-gray-600">{b.author}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {b.is_published ? "Đã đăng" : "Nháp"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {b.created_at ? new Date(b.created_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Chưa có bài viết nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {modal.mode === "create" ? "Thêm bài viết mới" : "Chỉnh sửa bài viết"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <FiX size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { name: "title", label: "Tiêu đề *", type: "text" },
                { name: "slug", label: "Slug (tự sinh nếu trống)", type: "text" },
                { name: "author", label: "Tác giả *", type: "text" },
                { name: "image", label: "URL ảnh bìa", type: "text" },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[name] || ""}
                    onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt *</label>
                <textarea
                  rows={2}
                  value={form.excerpt || ""}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                <textarea
                  rows={6}
                  value={form.content || ""}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.is_published}
                  onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-gray-700">Đăng bài ngay</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium">
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                <FiCheck /> {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
