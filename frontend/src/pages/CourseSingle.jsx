import { useState } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiUsers, FiBookOpen, FiBarChart, FiPlay, FiLock, FiCheckCircle, FiChevronDown, FiChevronUp, FiStar } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import CommentForm from "../components/ui/CommentForm";
import CommentList from "../components/ui/CommentList";

const CURRICULUM = [
  {
    title: "Giới thiệu React.js",
    lessonsCount: 5,
    duration: "45 Phút",
    items: [
      { title: "React là gì?", duration: "08:30", type: "video" },
      { title: "Cài đặt môi trường", duration: "12:00", type: "video" },
      { title: "Tạo ứng dụng đầu tiên", duration: "10:15", type: "video" },
      { title: "Cấu trúc thư mục dự án", duration: "07:45", type: "video" },
      { title: "Bài kiểm tra: Giới thiệu", duration: "5 câu", type: "quiz" },
    ],
  },
  {
    title: "React Hooks",
    lessonsCount: 3,
    duration: "45 Phút",
    open: true,
    items: [
      { title: "useState Hook", duration: "12:30", type: "video" },
      { title: "useEffect Hook", duration: "10:05", type: "video", active: true },
      { title: "Xử lý sự kiện trong React", duration: "02:25", type: "video" },
    ],
  },
];

const FAQS = [
  { q: "Khóa học này phù hợp với ai?", a: "Khóa học phù hợp với người mới bắt đầu lập trình web hoặc những ai muốn nâng cao kỹ năng React.js." },
  { q: "Tôi cần kiến thức gì trước khi học?", a: "Bạn cần có kiến thức cơ bản về HTML, CSS và JavaScript." },
  { q: "Khóa học có cập nhật không?", a: "Có, khóa học được cập nhật thường xuyên để theo kịp các phiên bản mới nhất của React." },
];

export default function CourseSingle() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({ 1: true });
  const [expandedFaqs, setExpandedFaqs] = useState({});

  function toggleSection(i) {
    setExpandedSections((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  function toggleFaq(i) {
    setExpandedFaqs((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "curriculum", label: "Chương trình" },
    { id: "instructor", label: "Giảng viên" },
    { id: "faqs", label: "FAQs" },
    { id: "reviews", label: "Đánh giá" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Khóa học", to: "/khoa-hoc" }, { label: "React.js Từ Cơ Bản Đến Nâng Cao" }]} />
      <div className="max-w-[1290px] mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <span className="text-sm font-medium text-primary bg-primary-light px-3 py-1 rounded-full">Web Development</span>
            <h1 className="text-3xl font-heading font-bold text-secondary mt-4">React.js Từ Cơ Bản Đến Nâng Cao</h1>
            <p className="text-gray-600 mt-3">Học React.js từ cơ bản đến nâng cao với các dự án thực tế, được giảng dạy bởi chuyên gia hàng đầu.</p>
            <div className="flex items-center gap-6 mt-5 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiClock size={14} /> 2 Tuần</span>
              <span className="flex items-center gap-1"><FiUsers size={14} /> 156 học viên</span>
              <span className="flex items-center gap-1"><FiBookOpen size={14} /> 20 bài học</span>
              <span className="flex items-center gap-1"><FiBarChart size={14} /> Tất cả cấp độ</span>
            </div>

            <div className="flex gap-1 mt-8 border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {activeTab === "overview" && (
                <div className="prose max-w-none text-gray-600 leading-7">
                  <p>Khóa học React.js từ cơ bản đến nâng cao sẽ giúp bạn nắm vững thư viện phổ biến nhất hiện nay cho phát triển giao diện web. Bạn sẽ học cách xây dựng các ứng dụng web hiện đại, tối ưu hiệu suất và triển khai dự án thực tế.</p>
                  <p className="mt-4">Sau khi hoàn thành khóa học, bạn sẽ có thể tự tin xây dựng các ứng dụng Single Page Application, quản lý state phức tạp, và làm việc với API thực tế.</p>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div className="flex flex-col gap-4">
                  {CURRICULUM.map((section, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button onClick={() => toggleSection(i)} className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div>
                          <span className="text-base font-semibold text-secondary">{section.title}</span>
                          <span className="text-sm text-gray-500 ml-3">{section.lessonsCount} bài - {section.duration}</span>
                        </div>
                        {expandedSections[i] ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                      </button>
                      {expandedSections[i] && (
                        <div className="divide-y divide-gray-100">
                          {section.items.map((item, j) => (
                            <div key={j} className={`flex items-center justify-between px-6 py-3 ${item.active ? "bg-primary-light" : ""}`}>
                              <div className="flex items-center gap-3">
                                {item.type === "video" ? <FiPlay size={14} className="text-primary" /> : <FiCheckCircle size={14} className="text-success" />}
                                <span className={`text-sm ${item.active ? "text-primary font-medium" : "text-gray-600"}`}>{item.title}</span>
                              </div>
                              <span className="text-xs text-gray-500">{item.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "instructor" && (
                <div className="flex items-start gap-6">
                  <img src="https://placehold.co/120/564FFD/fff?text=GV" alt="Giảng viên" className="w-28 h-28 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-xl font-semibold text-secondary">Đinh Thành Nguyên</h3>
                    <p className="text-sm text-gray-500 mt-1">Senior Frontend Developer</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><FiUsers size={14} /> 156 học viên</span>
                      <span className="flex items-center gap-1"><FiBookOpen size={14} /> 20 khóa học</span>
                    </div>
                    <p className="text-gray-600 mt-4 leading-7">Hơn 10 năm kinh nghiệm phát triển phần mềm, chuyên gia React.js và kiến trúc frontend. Từng làm việc tại các công ty công nghệ hàng đầu.</p>
                  </div>
                </div>
              )}

              {activeTab === "faqs" && (
                <div className="flex flex-col gap-4">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button onClick={() => toggleFaq(i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                        <span className="text-base font-medium text-secondary">{faq.q}</span>
                        {expandedFaqs[i] ? <FiChevronUp size={18} className="text-gray-500 shrink-0" /> : <FiChevronDown size={18} className="text-gray-500 shrink-0" />}
                      </button>
                      {expandedFaqs[i] && (
                        <div className="px-6 pb-4 text-sm text-gray-600 leading-7">{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="flex flex-col gap-10">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-4xl font-heading font-bold text-secondary">4.0</span>
                      <div className="flex gap-1 justify-center mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} size={16} className={i < 4 ? "text-warning fill-warning" : "text-gray-200"} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">146.951 đánh giá</p>
                    </div>
                  </div>
                  <CommentList />
                  <CommentForm />
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-28 border border-gray-100 rounded-xl p-6 flex flex-col gap-5">
              <img src="https://placehold.co/320x180" alt="Khóa học" className="w-full rounded-lg" />
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-primary">599.000đ</span>
                <span className="text-sm text-gray-400 line-through">799.000đ</span>
              </div>
              <Link to="/thanh-toan" className="w-full py-3 bg-primary text-white font-semibold rounded-lg text-center hover:bg-orange-600 transition-colors">
                Bắt đầu ngay
              </Link>
              <div className="flex flex-col gap-3 text-sm text-gray-600">
                <div className="flex justify-between"><span>Thời lượng</span><span className="font-medium text-secondary">2 Tuần</span></div>
                <div className="flex justify-between"><span>Bài học</span><span className="font-medium text-secondary">20</span></div>
                <div className="flex justify-between"><span>Bài kiểm tra</span><span className="font-medium text-secondary">3</span></div>
                <div className="flex justify-between"><span>Học viên</span><span className="font-medium text-secondary">156</span></div>
                <div className="flex justify-between"><span>Cấp độ</span><span className="font-medium text-secondary">Tất cả cấp độ</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
