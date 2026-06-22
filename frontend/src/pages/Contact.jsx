import { useEffect, useState } from "react";
import { FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { getSiteContentSectionAPI, sendContactAPI } from "../services/api";

const ICONS = {
  clock: <FiClock size={24} />,
  mail: <FiMail size={24} />,
  "map-pin": <FiMapPin size={24} />,
  phone: <FiPhone size={24} />,
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [content, setContent] = useState(null);

  useEffect(() => {
    getSiteContentSectionAPI("contact_info")
      .then(setContent)
      .catch(() => setContent(null));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendContactAPI(form);
    alert("Tin nhắn đã được lưu vào cơ sở dữ liệu.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  const items = Array.isArray(content?.items) ? content.items : [];
  const map = content?.map;

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Liên hệ" }]} />
      <div className="max-w-322.5 mx-auto px-5 py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-heading font-bold text-secondary">Liên hệ với chúng tôi</h1>
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {items.map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-100">
                <span className="text-primary mb-3">{ICONS[item.icon] || <FiMail size={24} />}</span>
                <h3 className="text-base font-semibold text-secondary">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.content}</p>
              </div>
            ))}
          </div>
        )}

        {map?.lat && map?.lon && map?.bbox && (
          <div className="mb-12 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            <iframe
              title="Bản đồ CodeCamp"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${map.bbox}&layer=mapnik&marker=${map.lat}%2C${map.lon}`}
              className="h-80 w-full border-0"
              loading="lazy"
            />
            <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiMapPin className="text-primary" size={16} />
                {map.address}
              </p>
              <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(map.address || "")}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">
                Mở trên OpenStreetMap
              </a>
            </div>
          </div>
        )}

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
