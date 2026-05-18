import { useEffect, useState } from "react";
import { createCategoryAPI, deleteCategoryAPI, getCategoriesAPI, updateCategoryAPI } from "../../services/api";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", icon: "" });
  const [editing, setEditing] = useState(null);

  function load() {
    getCategoriesAPI().then(setCategories).catch(() => setCategories([]));
  }

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    if (editing) {
      await updateCategoryAPI(editing, form);
    } else {
      await createCategoryAPI(form);
    }
    setForm({ name: "", icon: "" });
    setEditing(null);
    load();
  }

  async function remove(id) {
    await deleteCategoryAPI(id);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
        <p className="text-gray-500 mt-1">Tạo, chỉnh sửa và xóa danh mục khóa học.</p>
      </div>
      <form onSubmit={submit} className="bg-white border border-gray-100 rounded-lg p-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên danh mục" required className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
        <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Icon" className="px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-primary" />
        <button className="px-6 py-3 bg-primary text-white rounded-lg font-semibold">{editing ? "Cập nhật" : "Thêm"}</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category._id} className="bg-white border border-gray-100 rounded-lg p-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">{category.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{category.icon || "Không có icon"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(category._id); setForm({ name: category.name, icon: category.icon || "" }); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">Sửa</button>
              <button onClick={() => remove(category._id)} className="px-3 py-2 border border-red-100 text-red-600 rounded-lg text-sm">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
