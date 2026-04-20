import { FiUsers, FiBook, FiAward, FiHeart } from "react-icons/fi";

const STATS = [
  { icon: FiUsers, value: "25K+", label: "Hoc vien" },
  { icon: FiBook, value: "899", label: "Tong khoa hoc" },
  { icon: FiAward, value: "158", label: "Giang vien" },
  { icon: FiHeart, value: "100%", label: "Ty le hai long" },
];

export default function Stats() {
  return (
    <section className="py-16 bg-secondary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <Icon size={24} className="text-primary" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
