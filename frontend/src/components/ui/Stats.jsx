import { useEffect, useState } from "react";
import { FiAward, FiBookOpen, FiThumbsUp, FiUsers } from "react-icons/fi";
import { getSiteContentSectionAPI } from "../../services/api";

const ICONS = {
  users: FiUsers,
  book: FiBookOpen,
  award: FiAward,
  "thumbs-up": FiThumbsUp,
};

export default function Stats() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getSiteContentSectionAPI("stats");
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch {
        setItems([]);
      }
    }

    loadStats();
  }, []);

  if (!items.length) return null;

  return (
    <section className="bg-gray-900 py-16">
      <div className="max-w-322.5 mx-auto grid grid-cols-2 gap-8 px-5 lg:grid-cols-4">
        {items.map((stat) => {
          const Icon = ICONS[stat.icon] || FiBookOpen;

          return (
            <div key={stat.label} className="flex flex-col items-center gap-3 text-center">
              <Icon size={32} className="text-primary" />
              <span className="text-3xl font-heading font-bold text-white">{stat.value}</span>
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
