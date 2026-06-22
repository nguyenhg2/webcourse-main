import { useEffect, useState } from "react";
import Breadcrumb from "../components/layout/Breadcrumb";
import FAQItem from "../components/ui/FAQItem";
import { getSiteContentSectionAPI } from "../services/api";

export default function FAQ() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    getSiteContentSectionAPI("faqs")
      .then((data) => setGroups(Array.isArray(data?.groups) ? data.groups : []))
      .catch(() => setGroups([]));
  }, []);

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Câu hỏi thường gặp" }]} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-heading font-bold text-secondary">Câu hỏi thường gặp</h1>
        </div>

        {groups.length === 0 && <p className="text-center text-gray-500">Chưa có FAQ trong cơ sở dữ liệu.</p>}

        {groups.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="text-xl font-heading font-semibold text-secondary mb-5">{section.category}</h2>
            <div className="flex flex-col gap-3">
              {(section.items || []).map((item, index) => (
                <FAQItem key={index} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
