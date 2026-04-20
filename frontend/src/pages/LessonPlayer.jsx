import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiChevronDown, FiChevronUp,
  FiCheckCircle, FiLock, FiArrowLeft, FiSun, FiMoon, FiMenu, FiX,
  FiBookmark, FiDownload, FiSend, FiThumbsUp, FiMessageCircle, FiSettings,
  FiSkipBack, FiSkipForward
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const CURRICULUM = [
  {
    title: "Giới thiệu React.js",
    items: [
      { id: 1, title: "React là gì?", duration: "08:30", completed: true, type: "video" },
      { id: 2, title: "Cài đặt môi trường", duration: "12:00", completed: true, type: "video" },
      { id: 3, title: "Tạo ứng dụng đầu tiên", duration: "10:15", completed: false, type: "video", active: true },
      { id: 4, title: "Cấu trúc thư mục dự án", duration: "07:45", completed: false, type: "video" },
    ],
  },
  {
    title: "JSX và Components",
    items: [
      { id: 5, title: "JSX cơ bản", duration: "09:20", completed: false, type: "video" },
      { id: 6, title: "Functional Components", duration: "11:10", completed: false, type: "video" },
      { id: 7, title: "Props và cách truyền dữ liệu", duration: "08:45", completed: false, type: "video" },
      { id: 8, title: "Bài kiểm tra: JSX", duration: "5 câu", completed: false, type: "quiz", locked: true },
    ],
  },
  {
    title: "State và Lifecycle",
    items: [
      { id: 9, title: "useState Hook", duration: "12:30", completed: false, type: "video", locked: true },
      { id: 10, title: "useEffect Hook", duration: "10:05", completed: false, type: "video", locked: true },
    ],
  },
  {
    title: "React Hooks nâng cao",
    items: [
      { id: 11, title: "useContext", duration: "14:20", completed: false, type: "video", locked: true },
      { id: 12, title: "useReducer", duration: "11:50", completed: false, type: "video", locked: true },
      { id: 13, title: "Custom Hooks", duration: "09:30", completed: false, type: "video", locked: true },
    ],
  },
];

const NOTES = [
  { time: "02:15", content: "React sử dụng Virtual DOM để tối ưu hiệu suất", date: "20/01/2026" },
  { time: "05:30", content: "JSX là cú pháp mở rộng của JavaScript", date: "20/01/2026" },
  { time: "08:10", content: "Component có thể tái sử dụng ở nhiều nơi", date: "19/01/2026" },
];

const COMMENTS_DATA = [
  { author: "Nguyễn Văn An", avatar: "https://placehold.co/40/564FFD/fff?text=A", time: "2 giờ trước", content: "Bài giảng rất dễ hiểu, cảm ơn giảng viên!", likes: 5 },
  { author: "Trần Thị Bích", avatar: "https://placehold.co/40/FF6636/fff?text=B", time: "5 giờ trước", content: "Phần giải thích về Virtual DOM rất hay. Cho mình hỏi thêm về cách React so sánh sự khác biệt giữa Virtual DOM cũ và mới?", likes: 3 },
  {
    author: "Đinh Thành Nguyên",
    avatar: "https://placehold.co/40/23BD33/fff?text=GV",
    time: "3 giờ trước",
    content: "React sử dụng thuật toán Diffing để so sánh. Mình sẽ giải thích chi tiết hơn ở bài tiếp theo nhé!",
    likes: 8,
    isInstructor: true,
  },
];

const RESOURCES = [
  { name: "Slide bài giảng - React cơ bản.pdf", size: "2.4 MB", type: "pdf" },
  { name: "Source code ví dụ.zip", size: "1.1 MB", type: "zip" },
  { name: "Tài liệu tham khảo thêm.pdf", size: "890 KB", type: "pdf" },
];

export default function LessonPlayer() {
  const { slug, lessonId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(80);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({ 0: true, 1: true });
  const [activeTab, setActiveTab] = useState("content");
  const [newComment, setNewComment] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

  const allLessons = CURRICULUM.flatMap((s) => s.items);
  const completedCount = allLessons.filter((l) => l.completed).length;
  const totalCount = allLessons.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  function toggleSection(i) {
    setExpandedSections((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  const bg = isDark ? "bg-[#0f1119]" : "bg-[#f5f7fa]";
  const bgCard = isDark ? "bg-[#1a1d2e]" : "bg-white";
  const bgTopbar = isDark ? "bg-[#1a1d2e]" : "bg-white";
  const textPrimary = isDark ? "text-white" : "text-[#1d2026]";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-600";
  const textMuted = isDark ? "text-gray-400" : "text-gray-500";
  const border = isDark ? "border-gray-700" : "border-gray-200";
  const bgInput = isDark ? "bg-[#252836]" : "bg-white";
  const bgHover = isDark ? "hover:bg-[#252836]" : "hover:bg-gray-50";
  const bgActive = isDark ? "bg-[#2a1f1a]" : "bg-[#ffeee8]";

  const tabItems = [
    { id: "content", label: "Nội dung" },
    { id: "resources", label: "Tài liệu" },
    { id: "notes", label: "Ghi chú" },
    { id: "qa", label: "Hỏi đáp" },
  ];

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <div className={`${bgTopbar} border-b ${border} px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <Link to={`/khoa-hoc/${slug}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <FiArrowLeft size={16} /> Quay lại
          </Link>
          <span className={`text-sm font-medium ${textPrimary}`}>React.js Từ Cơ Bản Đến Nâng Cao</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className={`w-32 h-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
              <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className={`text-xs ${textMuted}`}>{progressPercent}%</span>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-lg ${bgHover} ${textSecondary} transition-colors`}>
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${bgHover} ${textSecondary} transition-colors`}
          >
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      <div className="flex">
        <div className={`flex-1 ${sidebarOpen ? "lg:mr-80" : ""}`}>
          <div className={`${bgCard} mx-5 mt-5 rounded-xl overflow-hidden`}>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center hover:bg-primary transition-colors">
                {isPlaying ? <FiPause size={28} /> : <FiPlay size={28} className="ml-1" />}
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setProgress(((e.clientX - rect.left) / rect.width) * 100); }}>
                  <div className="h-full bg-primary rounded-full relative" style={{ width: `${progress}%` }}>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-primary transition-colors">
                      {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                    </button>
                    <button className="text-white hover:text-primary transition-colors"><FiSkipBack size={16} /></button>
                    <button className="text-white hover:text-primary transition-colors"><FiSkipForward size={16} /></button>
                    <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-primary transition-colors">
                      {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                    </button>
                    <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="w-20 accent-primary" />
                    <span className="text-white text-xs">03:45 / 10:15</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="text-white text-xs font-medium hover:text-primary transition-colors">
                        {playbackSpeed}x
                      </button>
                      {showSpeedMenu && (
                        <div className={`absolute bottom-8 right-0 ${bgCard} rounded-lg shadow-lg border ${border} py-1 z-10`}>
                          {speeds.map((s) => (
                            <button
                              key={s}
                              onClick={() => { setPlaybackSpeed(s); setShowSpeedMenu(false); }}
                              className={`block w-full px-4 py-1.5 text-xs text-left ${bgHover} transition-colors ${s === playbackSpeed ? "text-primary font-medium" : textSecondary}`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="text-white hover:text-primary transition-colors"><FiSettings size={16} /></button>
                    <button className="text-white hover:text-primary transition-colors"><FiMaximize size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${bgCard} mx-5 mt-5 mb-5 rounded-xl p-6`}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className={`text-xl font-heading font-bold ${textPrimary}`}>Tạo ứng dụng đầu tiên</h1>
                <div className={`flex items-center gap-4 mt-2 text-sm ${textMuted}`}>
                  <span>Bài 3 / {totalCount}</span>
                  <span>10:15</span>
                </div>
              </div>
              <button onClick={() => setIsBookmarked(!isBookmarked)} className={`p-2 rounded-lg ${bgHover} transition-colors ${isBookmarked ? "text-primary" : textMuted}`}>
                <FiBookmark size={20} />
              </button>
            </div>

            <div className={`flex gap-1 border-b ${border}`}>
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id ? "border-primary text-primary" : `border-transparent ${textMuted} hover:${textPrimary}`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeTab === "content" && (
                <div className={`${textSecondary} leading-7 text-sm`}>
                  <p>Trong bài học này, bạn sẽ học cách tạo ứng dụng React đầu tiên sử dụng Create React App. Chúng ta sẽ đi qua từng bước từ khởi tạo dự án, hiểu cấu trúc thư mục, đến việc chạy ứng dụng trên trình duyệt.</p>
                  <p className="mt-4">Sau bài học, bạn sẽ nắm được cách khởi tạo dự án React, hiểu cấu trúc file cơ bản, biết cách chạy và debug ứng dụng, và hiểu quy trình phát triển với React.</p>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="flex flex-col gap-3">
                  {RESOURCES.map((res, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-lg border ${border}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${res.type === "pdf" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                          {res.type.toUpperCase()}
                        </span>
                        <div>
                          <p className={`text-sm font-medium ${textPrimary}`}>{res.name}</p>
                          <p className={`text-xs ${textMuted}`}>{res.size}</p>
                        </div>
                      </div>
                      <button className="text-primary hover:underline text-sm flex items-center gap-1">
                        <FiDownload size={14} /> Tải xuống
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "notes" && (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-3">
                    <input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Thêm ghi chú tại thời điểm hiện tại..."
                      className={`flex-1 px-4 py-3 rounded-lg border ${border} ${bgInput} text-sm ${textPrimary} focus:border-primary focus:outline-none`}
                    />
                    <button onClick={() => setNewNote("")} className="px-5 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                      Lưu
                    </button>
                  </div>
                  {NOTES.map((note, i) => (
                    <div key={i} className={`p-4 rounded-lg border ${border}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded">{note.time}</span>
                        <span className={`text-xs ${textMuted}`}>{note.date}</span>
                      </div>
                      <p className={`text-sm ${textSecondary}`}>{note.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "qa" && (
                <div className="flex flex-col gap-6">
                  <div className="flex gap-3">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Đặt câu hỏi..."
                      className={`flex-1 px-4 py-3 rounded-lg border ${border} ${bgInput} text-sm ${textPrimary} focus:border-primary focus:outline-none`}
                    />
                    <button onClick={() => setNewComment("")} className="px-5 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2">
                      <FiSend size={14} /> Gửi
                    </button>
                  </div>
                  {COMMENTS_DATA.map((c, i) => (
                    <div key={i} className={`flex gap-3 ${c.isInstructor ? `p-4 rounded-lg ${bgActive}` : ""}`}>
                      <img src={c.avatar} alt={c.author} className="w-10 h-10 rounded-full shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${textPrimary}`}>{c.author}</span>
                          {c.isInstructor && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">Giảng viên</span>}
                          <span className={`text-xs ${textMuted}`}>{c.time}</span>
                        </div>
                        <p className={`text-sm ${textSecondary} mt-1 leading-6`}>{c.content}</p>
                        <div className={`flex items-center gap-4 mt-2 text-xs ${textMuted}`}>
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <FiThumbsUp size={12} /> {c.likes}
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <FiMessageCircle size={12} /> Trả lời
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <aside className={`fixed right-0 top-[57px] bottom-0 w-80 ${bgCard} border-l ${border} overflow-y-auto z-40`}>
            <div className={`p-5 border-b ${border}`}>
              <h3 className={`text-base font-semibold ${textPrimary}`}>Nội dung khóa học</h3>
              <p className={`text-xs ${textMuted} mt-1`}>{completedCount}/{totalCount} bài đã hoàn thành</p>
            </div>
            <div>
              {CURRICULUM.map((section, i) => (
                <div key={i}>
                  <button onClick={() => toggleSection(i)} className={`w-full flex items-center justify-between px-5 py-3 ${bgHover} transition-colors`}>
                    <span className={`text-sm font-medium ${textPrimary}`}>{section.title}</span>
                    {expandedSections[i] ? <FiChevronUp size={16} className={textMuted} /> : <FiChevronDown size={16} className={textMuted} />}
                  </button>
                  {expandedSections[i] && (
                    <div>
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 px-5 py-2.5 cursor-pointer transition-colors ${
                            item.active ? bgActive : bgHover
                          } ${item.locked ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {item.completed ? (
                            <FiCheckCircle size={16} className="text-success shrink-0" />
                          ) : item.locked ? (
                            <FiLock size={16} className={`${textMuted} shrink-0`} />
                          ) : (
                            <FiPlay size={16} className={`${item.active ? "text-primary" : textMuted} shrink-0`} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${item.active ? "text-primary font-medium" : textSecondary}`}>{item.title}</p>
                            <p className={`text-xs ${textMuted}`}>{item.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
