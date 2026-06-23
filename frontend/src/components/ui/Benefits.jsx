import { useEffect, useState } from "react";
import { FiAward, FiClock, FiHeadphones, FiMonitor } from "react-icons/fi";
import { getSiteContentSectionAPI } from "../../services/api";

const ICONS = {
  award: FiAward,
  clock: FiClock,
  headphones: FiHeadphones,
  monitor: FiMonitor,
};

export default function Benefits() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    async function loadBenefits() {
      try {
        setContent(await getSiteContentSectionAPI("benefits"));
      } catch {
        setContent(null);
      }
    }

    loadBenefits();
  }, []);

  const items = Array.isArray(content?.items) ? content.items : [];
  if (!items.length) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-322.5 mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">{content.title}</h2>
          {content.subtitle && <p className="text-gray-600 mt-3 max-w-xl mx-auto">{content.subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || FiMonitor;

            return (
              <div
                key={item.title}
                className="flex flex-col items-center gap-4 rounded-lg border border-gray-100 p-8 text-center transition-shadow hover:shadow-md"
              >
                <Icon size={32} className="text-primary" />
                <h3 className="text-lg font-semibold text-secondary">{item.title}</h3>
                <p className="text-sm leading-6 text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
