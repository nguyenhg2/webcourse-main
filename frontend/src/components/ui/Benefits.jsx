import { FiMonitor, FiAward, FiRefreshCw, FiHeadphones } from "react-icons/fi";

const ITEMS = [
  {
    icon: FiMonitor,
    title: "Hoc moi luc moi noi",
    desc: "Truy cap khoa hoc 24/7 tren moi thiet bi, hoc theo toc do cua rieng ban.",
  },
  {
    icon: FiAward,
    title: "Chung chi hoan thanh",
    desc: "Nhan chung chi sau khi hoan thanh khoa hoc, nang cao gia tri ho so ca nhan.",
  },
  {
    icon: FiRefreshCw,
    title: "Cap nhat lien tuc",
    desc: "Noi dung khoa hoc duoc cap nhat thuong xuyen theo xu huong cong nghe moi nhat.",
  },
  {
    icon: FiHeadphones,
    title: "Ho tro tan tinh",
    desc: "Doi ngu giang vien va mentor san sang ho tro ban trong suot qua trinh hoc.",
  },
];

export default function Benefits() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-secondary mb-3">
            Tai sao chon CodeCamp?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Chung toi mang den trai nghiem hoc tap tuyet voi voi nhieu uu diem
            vuot troi
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="text-center p-6 bg-white border border-gray-100 rounded-lg hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-light rounded-xl flex items-center justify-center">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
