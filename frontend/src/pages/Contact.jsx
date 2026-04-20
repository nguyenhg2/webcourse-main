import { useState } from "react";
import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

const contactInfo = [
  {
    icon: <FiMapPin size={24} />,
    title: "Dia chi",
    detail: "268 Ly Thuong Kiet, Quan 10, TP. Ho Chi Minh",
  },
  {
    icon: <FiPhone size={24} />,
    title: "Dien thoai",
    detail: "(028) 3864 7256",
  },
  {
    icon: <FiMail size={24} />,
    title: "Email",
    detail: "contact@codecamp.vn",
  },
  {
    icon: <FiClock size={24} />,
    title: "Gio lam viec",
    detail: "Thu 2 - Thu 6: 8:00 - 17:30",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cam on ban da lien he! Chung toi se phan hoi trong thoi gian som nhat.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <section className="bg-white">
      <Breadcrumb items={[{ label: "Trang chu", to: "/" }, { label: "Lien he" }]} />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lien He Voi Chung Toi</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ban co cau hoi hoac can ho tro? Hay lien he voi chung toi qua form ben duoi hoac thong tin lien lac.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gray-100 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FiMapPin size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="font-medium">Ban do se hien thi tai day</p>
              <p className="text-sm">268 Ly Thuong Kiet, Quan 10, TP.HCM</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ho va ten *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Nhap ho va ten"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Nhap email"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">So dien thoai</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Nhap so dien thoai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chu de</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Nhap chu de"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Noi dung *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                placeholder="Nhap noi dung lien he"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Gui Lien He
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
