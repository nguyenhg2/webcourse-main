import { useState } from "react";
import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

const contactInfo = [
  { icon: <FiMapPin size={24} />, title: "Địa chỉ", detail: "236 Hoàng Quốc Việt, Phường Nghĩa Đô, Hà Nội" },
  { icon: <FiPhone size={24} />, title: "Điện thoại", detail: "+(123) 2500-567-8988" },
  { icon: <FiMail size={24} />, title: "Email", detail: "supportlms@gmail.com" },
  { icon: <FiClock size={24} />, title: "Giờ làm việc", detail: "Thứ 2 - Thứ 6: 8:00 - 17:30" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Liên hệ" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-heading font-bold text-secondary">Liên hệ với chúng tôi</h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-100">
              <span className="text-primary mb-3">{item.icon}</span>
              <h3 className="text-base font-semibold text-secondary">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-8 mb-12 flex items-center justify-center h-64">
          <div className="text-center text-gray-400">
            <FiMapPin size={40} className="mx-auto mb-3" />
            <p className="text-sm">236 Hoàng Quốc Việt, Phường Nghĩa Đô, Hà Nội</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-secondary text-center mb-8">Gửi tin nhắn cho chúng tôi</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Họ và tên *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors" />
              <input name="subject" value={form.subject} onChange={handleChange} placeholder="Chủ đề *" required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors" />
            </div>
            <textarea name="message" value={form.message} onChange={handleChange} placeholder="Nội dung tin nhắn *" rows={5} required className="px-5 py-3 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors resize-none" />
            <button type="submit" className="self-center px-10 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              Gửi liên hệ
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
