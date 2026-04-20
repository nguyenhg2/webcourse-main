import { useState } from "react";

export default function CommentForm() {
  const [form, setForm] = useState({ name: "", email: "", comment: "", save: false });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setForm({ name: "", email: "", comment: "", save: false });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h3 className="text-xl font-semibold text-secondary">Để lại bình luận</h3>
      <p className="text-sm text-gray-500">Email của bạn sẽ không được hiển thị công khai.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Tên *"
          required
          className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors"
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email *"
          required
          className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <textarea
        name="comment"
        value={form.comment}
        onChange={handleChange}
        placeholder="Bình luận"
        rows={5}
        required
        className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
      />
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input type="checkbox" name="save" checked={form.save} onChange={handleChange} className="accent-primary" />
        Lưu tên và email cho lần bình luận tiếp theo
      </label>
      <button type="submit" className="self-start px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
        Đăng bình luận
      </button>
    </form>
  );
}
