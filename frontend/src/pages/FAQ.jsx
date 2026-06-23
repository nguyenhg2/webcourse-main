import { useEffect, useState } from "react";
import Breadcrumb from "../components/layout/Breadcrumb";
import FAQItem from "../components/ui/FAQItem";
import { getSiteContentSectionAPI } from "../services/api";

export default function FAQ() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const data = await getSiteContentSectionAPI("faqs");
        setGroups(Array.isArray(data?.groups) ? data.groups : []);
      } catch {
        setGroups([]);
      }
    }

    loadFaqs();
  }, []);

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Câu hỏi thường gặp" }]} />

      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-heading font-bold text-secondary">Câu hỏi thường gặp</h1>
        </div>

        {!groups.length && <p className="text-center text-gray-500">Chưa có FAQ trong cơ sở dữ liệu.</p>}

        {groups.map((group) => (
          <section key={group.category} className="mb-10">
            <h2 className="text-xl font-heading font-semibold text-secondary mb-5">{group.category}</h2>
            <div className="flex flex-col gap-3">
              {(group.items || []).map((item) => (
                <FAQItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
