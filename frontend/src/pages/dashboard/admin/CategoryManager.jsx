import { useEffect, useState } from "react";
import { getCategoriesAPI, createCategoryAPI, updateCategoryAPI, deleteCategoryAPI } from "../../../services/api";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";

const EMPTY = { name: "", icon: "" };

export default function CategoryManager() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCats();
  }, []);

  function fetchCats() {
    setLoading(true);
    getCategoriesAPI()
      .then(setCats)
      .catch(() => setCats([]))
      .finally(() => setLoading(false));
  }

  function openCreate() {
    setForm(EMPTY);
    setModal({ mode: "create" });
  }

  function openEdit(cat) {
    setForm({ name: cat.name, icon: cat.icon || "" });
    setModal({ mode: "edit", id: cat._id });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    setSaving(true);
    try {
      if (modal.mode === "create") {
        await createCategoryAPI(form);
      } else {
        await updateCategoryAPI(modal.id, form);
      }
      setModal(null);
      fetchCats();
    } catch (e) {
      alert(e.response?.data?.detail || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xóa danh mục này?")) return;

    try {
      await deleteCategoryAPI(id);
      fetchCats();
    } catch (e) {
      alert(e.response?.data?.detail || "Xóa thất bại");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-500 mt-1">Thiết lập danh mục cho khóa học.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm">
          <FiPlus /> Thêm danh mục
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <p className="col-span-4 text-center py-20 text-gray-400">Đang tải...</p>
        ) : cats.map((cat) => (
          <div key={cat._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {cat.icon && <span className="text-2xl">{cat.icon}</span>}
              <span className="font-medium text-gray-900">{cat.name}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <FiEdit2 size={14} />
              </button>
              <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {!loading && cats.length === 0 && (
          <p className="col-span-4 text-center py-20 text-gray-400">Chưa có danh mục nào.</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{modal.mode === "create" ? "Thêm danh mục" : "Sửa danh mục"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <FiX size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  placeholder="VD: Lập trình Web"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  placeholder="VD: laptop"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                <FiCheck /> {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
