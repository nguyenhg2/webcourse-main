import { useState } from "react";
import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import { sendContactAPI } from "../services/api";
import useSiteContent from "../hooks/useSiteContent";

const CONTACT_ICONS = {
  "map-pin": <FiMapPin size={24} />,
  phone: <FiPhone size={24} />,
  mail: <FiMail size={24} />,
  clock: <FiClock size={24} />,
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const { content } = useSiteContent("contact_info", { items: [] });
  const contactInfo = content?.items || [];
  const map = content?.map || {};
  const address = map.address || "";
  const mapQuery = encodeURIComponent(address);
  const mapLat = map.lat || 21.0466213;
  const mapLon = map.lon || 105.7864498;
  const mapBbox = map.bbox || "105.7814498%2C21.0416213%2C105.7914498%2C21.0516213";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await sendContactAPI(form);
    alert("Tin nhắn đã được lưu vào cơ sở dữ liệu.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Liên hệ" }]} />
      <div className="max-w-322.5 mx-auto px-5 py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-heading font-bold text-secondary">Liên hệ với chúng tôi</h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-100">
              <span className="text-primary mb-3">{CONTACT_ICONS[item.icon] || CONTACT_ICONS["map-pin"]}</span>
              <h3 className="text-base font-semibold text-secondary">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.content}</p>
            </div>
          ))}
        </div>

        <div className="mb-12 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
          <iframe
            title="Bản đồ CodeCamp"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik&marker=${mapLat}%2C${mapLon}`}
            className="h-80 w-full border-0"
            loading="lazy"
          />
          <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiMapPin className="text-primary" size={16} />
              {address}
            </p>
            <a
              href={`https://www.openstreetmap.org/search?query=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Mở trên OpenStreetMap
            </a>
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
