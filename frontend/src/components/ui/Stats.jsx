import { FiUsers, FiBookOpen, FiAward, FiThumbsUp } from "react-icons/fi";
import useSiteContent from "../../hooks/useSiteContent";

const ICONS = {
  users: <FiUsers size={32} />,
  book: <FiBookOpen size={32} />,
  award: <FiAward size={32} />,
  "thumbs-up": <FiThumbsUp size={32} />,
};

export default function Stats() {
  const { content } = useSiteContent("stats", { items: [] });
  const stats = content?.items || [];

  if (!stats.length) {
    return null;
  }

  return (
    <section className="bg-gray-900 py-16">
      <div className="max-w-322.5 mx-auto px-5 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-3 text-center">
            <span className="text-primary">{ICONS[stat.icon] || ICONS.users}</span>
            <span className="text-3xl font-heading font-bold text-white">{stat.value}</span>
            <span className="text-gray-400 text-sm">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
