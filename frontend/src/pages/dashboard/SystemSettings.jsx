import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

const THEME_OPTIONS = [
  {
    value: "light",
    title: "Giao diện sáng",
    description: "Nền sáng, chữ tối, phù hợp khi làm việc ban ngày.",
    icon: <FiSun size={22} />,
  },
  {
    value: "dark",
    title: "Giao diện tối",
    description: "Nền tối, giảm độ chói khi làm việc trong môi trường thiếu sáng.",
    icon: <FiMoon size={22} />,
  },
];

export default function SystemSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
        <p className="text-gray-500 mt-1">Quản lý giao diện hiển thị của frontend.</p>
      </div>

      <section className="bg-white border border-gray-100 rounded-lg p-6">
        <div className="flex flex-col gap-1 mb-5">
          <h2 className="font-semibold text-gray-900">Chế độ giao diện</h2>
          <p className="text-sm text-gray-500">
            Lựa chọn này được lưu trên trình duyệt và áp dụng ngay cho giao diện frontend.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {THEME_OPTIONS.map((option) => {
            const active = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`text-left border rounded-lg p-5 transition-colors ${
                  active
                    ? "border-primary bg-primary-light text-primary"
                    : "border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      active ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {option.icon}
                  </span>
                  <span>
                    <span className="block font-semibold">{option.title}</span>
                    <span className={`block text-sm mt-1 ${active ? "text-primary" : "text-gray-500"}`}>
                      {option.description}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
