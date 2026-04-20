import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiLock,
  FiClock,
  FiFileText,
  FiDownload,
  FiMessageSquare,
  FiThumbsUp,
  FiBookmark,
  FiShare2,
  FiSettings,
} from "react-icons/fi";

const curriculum = [
  {
    id: 1,
    title: "Gioi thieu React.js",
    lessons: [
      { id: "1-1", title: "React la gi va tai sao nen hoc", duration: "12:30", completed: true, type: "video" },
      { id: "1-2", title: "Cai dat moi truong (Node, VS Code)", duration: "08:45", completed: true, type: "video" },
      { id: "1-3", title: "Tao du an React dau tien voi Vite", duration: "15:20", completed: true, type: "video" },
      { id: "1-4", title: "Bai tap: Tao du an React", duration: "10:00", completed: false, type: "quiz" },
    ],
  },
  {
    id: 2,
    title: "JSX va Components",
    lessons: [
      { id: "2-1", title: "Tim hieu JSX", duration: "18:10", completed: true, type: "video" },
      { id: "2-2", title: "Function Components va Class Components", duration: "22:35", completed: false, type: "video", active: true },
      { id: "2-3", title: "Props va truyen du lieu giua cac component", duration: "20:15", completed: false, type: "video" },
      { id: "2-4", title: "Children props va composition", duration: "14:50", completed: false, type: "video" },
      { id: "2-5", title: "Bai kiem tra chuong 2", duration: "15:00", completed: false, type: "quiz" },
    ],
  },
  {
    id: 3,
    title: "State va Lifecycle",
    lessons: [
      { id: "3-1", title: "useState Hook co ban", duration: "19:40", completed: false, type: "video" },
      { id: "3-2", title: "useEffect va vong doi component", duration: "24:10", completed: false, type: "video" },
      { id: "3-3", title: "Quan ly nhieu state phuc tap", duration: "16:30", completed: false, type: "video" },
      { id: "3-4", title: "useReducer cho state nang cao", duration: "21:00", completed: false, type: "video", locked: true },
      { id: "3-5", title: "Bai tap thuc hanh: Todo App", duration: "30:00", completed: false, type: "quiz", locked: true },
    ],
  },
  {
    id: 4,
    title: "React Hooks nang cao",
    lessons: [
      { id: "4-1", title: "useContext va Context API", duration: "25:15", completed: false, type: "video", locked: true },
      { id: "4-2", title: "useMemo va useCallback", duration: "18:20", completed: false, type: "video", locked: true },
      { id: "4-3", title: "useRef va DOM manipulation", duration: "16:45", completed: false, type: "video", locked: true },
      { id: "4-4", title: "Custom Hooks", duration: "22:30", completed: false, type: "video", locked: true },
      { id: "4-5", title: "Bai kiem tra cuoi khoa", duration: "20:00", completed: false, type: "quiz", locked: true },
    ],
  },
];

const notes = [
  { id: 1, time: "02:15", content: "Function component don gian hon class component" },
  { id: 2, time: "08:30", content: "Luon dung PascalCase khi dat ten component" },
  { id: 3, time: "15:40", content: "Props la immutable, khong the thay doi truc tiep" },
];

const comments = [
  {
    id: 1,
    author: "Tran Minh Hieu",
    avatar: "https://placehold.co/40x40",
    time: "2 gio truoc",
    content: "Bai giang rat de hieu, cam on thay!",
    likes: 12,
  },
  {
    id: 2,
    author: "Le Thi Huong",
    avatar: "https://placehold.co/40x40",
    time: "5 gio truoc",
    content: "Cho em hoi su khac biet chinh giua function component va class component la gi a?",
    likes: 8,
    replies: [
      {
        id: 21,
        author: "Dinh Thanh Nguyen",
        avatar: "https://placehold.co/40x40",
        time: "4 gio truoc",
        content: "Function component nhe hon, de doc hon va ho tro Hooks. Class component van hoat dong nhung React khuyen dung function component cho du an moi.",
        likes: 15,
        isInstructor: true,
      },
    ],
  },
  {
    id: 3,
    author: "Pham Van Duc",
    avatar: "https://placehold.co/40x40",
    time: "1 ngay truoc",
    content: "Em da lam theo nhung bi loi 'Component is not defined', thay giup em voi a.",
    likes: 3,
  },
];

const resources = [
  { name: "Slide bai giang - JSX va Components.pdf", size: "2.4 MB", type: "pdf" },
  { name: "Source code bai hoc.zip", size: "1.1 MB", type: "zip" },
  { name: "Bai doc them - React Documentation.pdf", size: "850 KB", type: "pdf" },
];

export default function LessonPlayer() {
  const { slug, lessonId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(80);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState([1, 2]);
  const [activeTab, setActiveTab] = useState("noi-dung");
  const [newComment, setNewComment] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const totalLessons = curriculum.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedLessons = curriculum.reduce((acc, s) => acc + s.lessons.filter((l) => l.completed).length, 0);
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    alert("Binh luan da duoc gui!");
    setNewComment("");
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    alert("Ghi chu da duoc luu!");
    setNewNote("");
  };

  return (
    <section className="bg-gray-900 min-h-screen">
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-full mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/khoa-hoc/${slug || "react-js-tu-co-ban-den-nang-cao"}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <FiChevronLeft size={20} />
              <span className="hidden sm:inline">Quay lai khoa hoc</span>
            </Link>
            <div className="hidden md:block h-6 w-px bg-gray-600" />
            <h1 className="hidden md:block text-white font-semibold text-sm truncate max-w-md">
              React.js Tu Co Ban Den Nang Cao
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <span>{progressPercent}% hoan thanh</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-gray-700 text-sm"
            >
              {sidebarOpen ? "An menu" : "Hien menu"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "mr-0" : ""}`}>
          <div className="relative bg-black aspect-video max-h-[calc(100vh-180px)]">
            <img
              src="https://placehold.co/1280x720/1a1a2e/ffffff?text=Video+Bai+Hoc"
              alt="Video bai hoc"
              className="w-full h-full object-contain"
            />

            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {!isPlaying && (
                <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center group-hover:bg-primary transition group-hover:scale-110">
                  <FiPlay size={32} className="text-white ml-1" />
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="w-full h-1.5 bg-gray-600 rounded-full mb-3 cursor-pointer group">
                <div
                  className="h-full bg-primary rounded-full relative group-hover:h-2.5 transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:text-primary transition"
                  >
                    {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} />}
                  </button>

                  <button className="text-white hover:text-primary transition">
                    <FiChevronLeft size={22} />
                  </button>
                  <button className="text-white hover:text-primary transition">
                    <FiChevronRight size={22} />
                  </button>

                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-primary transition"
                    >
                      {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                      className="w-20 h-1 accent-primary opacity-0 group-hover/vol:opacity-100 transition"
                    />
                  </div>

                  <span className="text-white text-sm ml-2">07:45 / 22:35</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative group/speed">
                    <button className="text-white text-sm hover:text-primary transition px-2 py-1 rounded bg-white/10">
                      {playbackSpeed}x
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition p-1">
                      {speeds.map((s) => (
                        <button
                          key={s}
                          onClick={() => setPlaybackSpeed(s)}
                          className={`block w-full px-4 py-1.5 text-sm text-left rounded transition ${
                            playbackSpeed === s ? "text-primary bg-gray-700" : "text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="text-white hover:text-primary transition">
                    <FiSettings size={20} />
                  </button>
                  <button className="text-white hover:text-primary transition">
                    <FiMaximize size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 px-4 lg:px-8 py-6">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <span className="inline-block bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    Chuong 2 - Bai 2
                  </span>
                  <h2 className="text-white text-xl lg:text-2xl font-bold">
                    Function Components va Class Components
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Giang vien: Dinh Thanh Nguyen &middot; Cap nhat: 10/04/2026
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${
                      isBookmarked ? "bg-primary text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <FiBookmark size={16} />
                    Luu
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-gray-800 text-gray-400 hover:text-white transition">
                    <FiShare2 size={16} />
                    Chia se
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-700 mb-6">
                <div className="flex gap-1 overflow-x-auto">
                  {[
                    { id: "noi-dung", label: "Noi dung", icon: <FiFileText size={16} /> },
                    { id: "tai-lieu", label: "Tai lieu", icon: <FiDownload size={16} /> },
                    { id: "ghi-chu", label: "Ghi chu", icon: <FiBookmark size={16} /> },
                    { id: "hoi-dap", label: "Hoi dap", icon: <FiMessageSquare size={16} /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "noi-dung" && (
                <div className="text-gray-300 space-y-4">
                  <p>
                    Trong bai hoc nay, chung ta se tim hieu ve hai cach chinh de tao component trong React:
                    Function Components va Class Components. Ban se hieu duoc su khac biet, uu nhuoc diem cua
                    tung loai va khi nao nen su dung loai nao.
                  </p>
                  <h3 className="text-white text-lg font-semibold mt-6">Noi dung chinh</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start gap-2">
                      <FiCheck className="text-primary mt-0.5 shrink-0" size={16} />
                      Function Component: cach viet, cu phap, va vi du thuc te
                    </p>
                    <p className="flex items-start gap-2">
                      <FiCheck className="text-primary mt-0.5 shrink-0" size={16} />
                      Class Component: constructor, render method, va lifecycle
                    </p>
                    <p className="flex items-start gap-2">
                      <FiCheck className="text-primary mt-0.5 shrink-0" size={16} />
                      So sanh hieu nang va kha nang doc code
                    </p>
                    <p className="flex items-start gap-2">
                      <FiCheck className="text-primary mt-0.5 shrink-0" size={16} />
                      Khi nao nen dung Function va khi nao dung Class
                    </p>
                    <p className="flex items-start gap-2">
                      <FiCheck className="text-primary mt-0.5 shrink-0" size={16} />
                      Thuc hanh: chuyen doi giua hai dang component
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-700">
                    <Link
                      to="#"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                      <FiChevronLeft size={16} />
                      Bai truoc
                    </Link>
                    <Link
                      to="#"
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm"
                    >
                      Bai tiep theo
                      <FiChevronRight size={16} />
                    </Link>
                    <button className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                      <FiCheck size={16} />
                      Danh dau hoan thanh
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "tai-lieu" && (
                <div className="space-y-3">
                  {resources.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <FiFileText className="text-primary" size={20} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{file.name}</p>
                          <p className="text-gray-500 text-xs">{file.size}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition text-sm">
                        <FiDownload size={14} />
                        Tai xuong
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "ghi-chu" && (
                <div className="space-y-4">
                  <form onSubmit={handleAddNote} className="flex gap-3">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Them ghi chu tai 07:45..."
                      className="flex-1 h-11 px-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm outline-none focus:border-primary placeholder:text-gray-500"
                    />
                    <button
                      type="submit"
                      className="px-5 h-11 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition"
                    >
                      Luu
                    </button>
                  </form>

                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div key={note.id} className="flex gap-3 p-3 bg-gray-800 rounded-lg">
                        <button className="text-primary text-sm font-mono font-medium hover:underline shrink-0">
                          {note.time}
                        </button>
                        <p className="text-gray-300 text-sm">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "hoi-dap" && (
                <div className="space-y-6">
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Dat cau hoi hoac binh luan..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm outline-none focus:border-primary placeholder:text-gray-500 resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition"
                      >
                        Gui binh luan
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {comments.map((c) => (
                      <div key={c.id} className="space-y-3">
                        <div className="flex gap-3">
                          <img src={c.avatar} alt={c.author} className="w-10 h-10 rounded-full shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white text-sm font-semibold">{c.author}</span>
                              <span className="text-gray-500 text-xs">{c.time}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{c.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <button className="flex items-center gap-1 text-gray-500 hover:text-primary transition text-xs">
                                <FiThumbsUp size={14} />
                                {c.likes}
                              </button>
                              <button className="text-gray-500 hover:text-primary transition text-xs">
                                Tra loi
                              </button>
                            </div>
                          </div>
                        </div>

                        {c.replies?.map((r) => (
                          <div key={r.id} className="flex gap-3 ml-12 pl-4 border-l-2 border-gray-700">
                            <img src={r.avatar} alt={r.author} className="w-8 h-8 rounded-full shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white text-sm font-semibold">{r.author}</span>
                                {r.isInstructor && (
                                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                    Giang vien
                                  </span>
                                )}
                                <span className="text-gray-500 text-xs">{r.time}</span>
                              </div>
                              <p className="text-gray-300 text-sm">{r.content}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <button className="flex items-center gap-1 text-gray-500 hover:text-primary transition text-xs">
                                  <FiThumbsUp size={14} />
                                  {r.likes}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <aside className="w-[380px] shrink-0 bg-gray-800 border-l border-gray-700 h-[calc(100vh-56px)] sticky top-14 overflow-y-auto hidden lg:block">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-bold text-sm mb-3">Noi dung khoa hoc</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-gray-400 text-xs shrink-0">
                  {completedLessons}/{totalLessons} bai
                </span>
              </div>
            </div>

            <div>
              {curriculum.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-750 hover:bg-gray-700 transition border-b border-gray-700"
                  >
                    <div className="text-left">
                      <p className="text-white text-sm font-semibold">
                        Chuong {section.id}: {section.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {section.lessons.filter((l) => l.completed).length}/{section.lessons.length} bai hoc
                      </p>
                    </div>
                    {expandedSections.includes(section.id) ? (
                      <FiChevronUp className="text-gray-400 shrink-0" size={18} />
                    ) : (
                      <FiChevronDown className="text-gray-400 shrink-0" size={18} />
                    )}
                  </button>

                  {expandedSections.includes(section.id) && (
                    <div>
                      {section.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          disabled={lesson.locked}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-b border-gray-700/50 ${
                            lesson.active
                              ? "bg-primary/10 border-l-2 border-l-primary"
                              : lesson.locked
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-700/50 cursor-pointer"
                          }`}
                        >
                          <div className="shrink-0">
                            {lesson.completed ? (
                              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                <FiCheck size={14} className="text-white" />
                              </div>
                            ) : lesson.locked ? (
                              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                                <FiLock size={12} className="text-gray-400" />
                              </div>
                            ) : lesson.active ? (
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <FiPlay size={12} className="text-white ml-0.5" />
                              </div>
                            ) : lesson.type === "quiz" ? (
                              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                                <FiFileText size={12} className="text-gray-300" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                                <FiPlay size={12} className="text-gray-300 ml-0.5" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm truncate ${
                                lesson.active ? "text-primary font-medium" : lesson.completed ? "text-gray-400" : "text-gray-300"
                              }`}
                            >
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <FiClock size={12} className="text-gray-500" />
                              <span className="text-gray-500 text-xs">{lesson.duration}</span>
                              {lesson.type === "quiz" && (
                                <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                                  Bai tap
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
