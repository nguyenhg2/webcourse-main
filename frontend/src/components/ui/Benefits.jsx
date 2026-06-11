import { FiMonitor, FiClock, FiAward, FiHeadphones } from "react-icons/fi";
import useSiteContent from "../../hooks/useSiteContent";

const ICONS = {
  monitor: <FiMonitor size={32} />,
  clock: <FiClock size={32} />,
  award: <FiAward size={32} />,
  headphones: <FiHeadphones size={32} />,
};

export default function Benefits() {
  const { content } = useSiteContent("benefits", { items: [] });
  const items = content?.items || [];

  if (!items.length) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-322.5 mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary">{content.title}</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">{content.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-4 p-8 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-primary">{ICONS[item.icon] || ICONS.monitor}</span>
              <h3 className="text-lg font-semibold text-secondary">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-6">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
