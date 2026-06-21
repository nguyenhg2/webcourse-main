import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import { getSiteContentSectionAPI, updateSiteContentSectionAPI } from "../../../services/api";

const SECTIONS = [
  { value: "benefits", label: "Lợi ích trang chủ" },
  { value: "faqs", label: "FAQ chung" },
  { value: "course_faqs", label: "FAQ khóa học" },
  { value: "contact_info", label: "Thông tin liên hệ" },
];

const EXAMPLES = {
  benefits: {
    title: "Tại sao chọn CodeCamp?",
    subtitle: "Nội dung được quản lý trong MongoDB",
    items: [{ icon: "monitor", title: "Học mọi lúc", desc: "Truy cập khóa học trên nhiều thiết bị", order: 1, active: true }],
  },
  faqs: {
    groups: [{ category: "Chung", order: 1, active: true, items: [{ q: "CodeCamp là gì?", a: "Nền tảng học lập trình trực tuyến", order: 1, active: true }] }],
  },
  course_faqs: {
    items: [{ q: "Khóa học có chứng chỉ không?", a: "Có, khi hoàn thành 100% tiến độ", order: 1, active: true }],
  },
  contact_info: {
    map: { address: "Hà Nội, Việt Nam", lat: 21.0466213, lon: 105.7864498, bbox: "105.7814498%2C21.0416213%2C105.7914498%2C21.0516213" },
    items: [{ icon: "mail", title: "Email", content: "support@codecamp.vn", order: 1, active: true }],
  },
};

function cleanDoc(doc, section) {
  const { _id, section: _section, created_at, updated_at, ...rest } = doc || EXAMPLES[section];
  return rest;
}

export default function SiteContentManager() {
  const [section, setSection] = useState("benefits");
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMessage("");
    getSiteContentSectionAPI(section)
      .then((data) => setText(JSON.stringify(cleanDoc(data, section), null, 2)))
      .catch(() => setText(JSON.stringify(EXAMPLES[section], null, 2)));
  }, [section]);

  async function handleSave() {
    setMessage("");
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      setMessage("JSON chưa hợp lệ.");
      return;
    }

    setSaving(true);
    try {
      const saved = await updateSiteContentSectionAPI(section, payload);
      setText(JSON.stringify(cleanDoc(saved, section), null, 2));
      setMessage("Đã lưu vào MongoDB.");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Không lưu được dữ liệu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình nội dung</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý dữ liệu trang chủ, FAQ và liên hệ trong collection site_content.</p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <select value={section} onChange={(event) => setSection(event.target.value)} className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary">
            {SECTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            <FiSave size={16} /> {saving ? "Đang lưu..." : "Lưu vào MongoDB"}
          </button>
        </div>

        <textarea value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} className="mt-5 min-h-[480px] w-full rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm outline-none focus:border-primary" />
        {message && <p className={`mt-3 text-sm ${message.includes("Đã lưu") ? "text-success" : "text-red-600"}`}>{message}</p>}
      </section>
    </div>
  );
}
