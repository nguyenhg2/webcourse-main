import Breadcrumb from "../components/layout/Breadcrumb";
import FAQItem from "../components/ui/FAQItem";
import useSiteContent from "../hooks/useSiteContent";

export default function FAQ() {
  const { content } = useSiteContent("faqs", { groups: [] });
  const faqData = content?.groups || [];

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Câu hỏi thường gặp" }]} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-heading font-bold text-secondary">Câu hỏi thường gặp</h1>
          <p className="text-gray-600 mt-3">Tìm câu trả lời cho những thắc mắc phổ biến nhất</p>
        </div>
        {faqData.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="text-xl font-heading font-semibold text-secondary mb-5">{section.category}</h2>
            <div className="flex flex-col gap-3">
              {section.items.map((item, i) => (
                <FAQItem key={i} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
