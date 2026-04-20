import { FiUsers, FiBookOpen, FiAward, FiThumbsUp } from "react-icons/fi";

const STATS = [
  { icon: <FiUsers size={32} />, value: "25K+", label: "Học viên" },
  { icon: <FiBookOpen size={32} />, value: "899", label: "Tổng khóa học" },
  { icon: <FiAward size={32} />, value: "158", label: "Giảng viên" },
  { icon: <FiThumbsUp size={32} />, value: "100%", label: "Tỷ lệ hài lòng" },
];

export default function Stats() {
  return (
    <section className="bg-gray-900 py-16">
      <div className="max-w-[1290px] mx-auto px-5 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-3 text-center">
            <span className="text-primary">{stat.icon}</span>
            <span className="text-3xl font-heading font-bold text-white">{stat.value}</span>
            <span className="text-gray-400 text-sm">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
