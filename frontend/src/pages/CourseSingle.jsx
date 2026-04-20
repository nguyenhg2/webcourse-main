import { useState } from "react";
import {
  FiClock,
  FiUsers,
  FiBarChart,
  FiBookOpen,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiPlay,
  FiLock,
} from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube, FiStar } from "react-icons/fa";
import Breadcrumb from "../components/layout/Breadcrumb";
import CommentForm from "../components/ui/CommentForm";
import CommentList from "../components/ui/CommentList";

const TABS = ["Tong quan", "Chuong trinh", "Giang vien", "FAQs", "Danh gia"];

const CURRICULUM = [
  {
    title: "Gioi thieu React.js",
    lessons: 5,
    duration: "45 Mins",
    open: false,
    items: [],
  },
  {
    title: "React Hooks",
    lessons: 3,
    duration: "45 Mins",
    open: true,
    items: [
      { title: "useState Hook", time: "12:30", type: "video" },
      { title: "useEffect Hook", time: "10:05", type: "video", active: true },
      { title: "Xu ly su kien trong React", time: "2:25", type: "video" },
    ],
  },
  {
    title: "Quan ly State nang cao",
    lessons: 5,
    duration: "45 Mins",
    open: false,
    items: [],
  },
];

const FAQS = [
  {
    q: "Khoa hoc nay phu hop voi ai?",
    a: "Khoa hoc phu hop cho nguoi moi bat dau muon hoc React.js, sinh vien CNTT muon thuc hanh du an thuc te, va developer muon nang cao ky nang frontend.",
  },
  {
    q: "Toi can kien thuc gi truoc khi hoc?",
    a: null,
  },
  {
    q: "Hoc xong co duoc chung chi khong?",
    a: null,
  },
];

export default function CourseSingle() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Trang chu", href: "/" },
          { label: "Khoa hoc", href: "/khoa-hoc" },
          { label: "React.js Tu Co Ban Den Nang Cao" },
        ]}
      />

      <section className="bg-secondary py-12">
        <div className="max-w-[1290px] mx-auto px-4 flex flex-col lg:flex-row gap-10">
          <div className="flex-1 flex flex-col gap-5 lg:pr-96">
            <div className="flex items-center gap-5">
              <span className="px-3 py-2 bg-gray-700 text-white text-base font-medium rounded-lg">
                Web Development
              </span>
              <span className="text-gray-500 text-lg">
                boi Dinh Thanh Nguyen
              </span>
            </div>
            <h1 className="font-heading text-white text-4xl font-semibold capitalize leading-10">
              React.js Tu Co Ban Den Nang Cao
            </h1>
            <div className="flex flex-wrap gap-6">
              <span className="flex items-center gap-2 text-gray-400 text-base">
                <FiClock size={16} className="text-primary" /> 2 Tuan
              </span>
              <span className="flex items-center gap-2 text-gray-400 text-base">
                <FiUsers size={16} className="text-primary" /> 156 Hoc vien
              </span>
              <span className="flex items-center gap-2 text-gray-400 text-base">
                <FiBarChart size={16} className="text-primary" /> Tat ca cap do
              </span>
              <span className="flex items-center gap-2 text-gray-400 text-base">
                <FiBookOpen size={16} className="text-primary" /> 20 Tiet
              </span>
              <span className="flex items-center gap-2 text-gray-400 text-base">
                <FiFileText size={16} className="text-primary" /> 3 Bai kiem tra
              </span>
            </div>
          </div>

          <div className="lg:w-[410px] shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <img
              src="https://placehold.co/410x250"
              alt="Course"
              className="w-full h-64 object-cover"
            />
            <div className="p-7 flex items-center justify-center gap-7">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-base line-through">
                  799.000 VND
                </span>
                <span className="text-error text-xl font-semibold">
                  599.000 VND
                </span>
              </div>
              <button className="h-12 px-6 bg-primary text-white text-lg font-medium rounded-full hover:bg-primary/90 transition-colors">
                Bat dau ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-[1290px] mx-auto px-4 flex flex-col lg:flex-row gap-12">
          <div className="flex-1 flex flex-col gap-10 lg:max-w-[850px]">
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`flex-1 px-7 py-5 text-xl font-semibold text-center border-b transition-colors ${
                      activeTab === i
                        ? "bg-gray-50 text-primary border-primary"
                        : "text-secondary border-gray-100 hover:text-primary"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-7 bg-gray-50">
                {activeTab === 0 && (
                  <p className="text-gray-600 text-lg leading-7">
                    React.js la thu vien JavaScript pho bien nhat de xay dung
                    giao dien nguoi dung. Khoa hoc nay se giup ban nam vung
                    React tu co ban den nang cao, bao gom Hooks, Context API,
                    Redux Toolkit, React Router va trien khai du an thuc te.
                    Ban se hoc qua video bai giang chat luong cao va thuc hanh
                    tren cac du an thuc te.
                  </p>
                )}

                {activeTab === 1 && (
                  <div className="flex flex-col gap-3">
                    {CURRICULUM.map((section, i) => (
                      <div key={i} className="rounded-lg overflow-hidden">
                        <div className="px-5 py-4 bg-white flex items-center gap-2">
                          {section.open ? (
                            <FiChevronUp size={16} className="text-gray-600" />
                          ) : (
                            <FiChevronDown
                              size={16}
                              className="text-gray-600"
                            />
                          )}
                          <span
                            className={`flex-1 text-base font-semibold ${
                              section.open ? "text-primary" : "text-secondary"
                            }`}
                          >
                            {section.title}
                          </span>
                          <span className="text-gray-600 text-base">
                            {section.lessons} Tiet
                          </span>
                          <span className="text-gray-600 text-base">
                            {section.duration}
                          </span>
                        </div>
                        {section.open &&
                          section.items.map((item, j) => (
                            <div
                              key={j}
                              className="pl-11 pr-5 py-3 bg-white flex items-center gap-2"
                            >
                              <FiPlay
                                size={16}
                                className="text-gray-600 shrink-0"
                              />
                              <span
                                className={`flex-1 text-lg ${
                                  item.active
                                    ? "text-primary"
                                    : "text-secondary"
                                }`}
                              >
                                {item.title}
                              </span>
                              <span className="px-3 py-1 bg-info text-white text-base rounded-lg">
                                Danh gia
                              </span>
                              <span className="w-16 text-right text-gray-600 text-base">
                                {item.time}
                              </span>
                              <FiLock size={16} className="text-gray-600" />
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="flex gap-6">
                    <img
                      src="https://placehold.co/200x112"
                      alt="Instructor"
                      className="w-48 h-28 object-cover rounded"
                    />
                    <div className="flex-1 flex flex-col gap-3">
                      <h3 className="font-heading text-secondary text-xl font-semibold">
                        React.js
                      </h3>
                      <p className="text-gray-600 text-lg leading-7">
                        React.js la thu vien JavaScript pho bien nhat de xay
                        dung giao dien nguoi dung. Khoa hoc nay se giup ban nam
                        vung React tu co ban den nang cao.
                      </p>
                      <span className="flex items-center gap-2 text-gray-600 text-base">
                        <FiUsers size={16} className="text-secondary" /> 156 Hoc
                        vien
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 text-base">
                        <FiBookOpen size={16} className="text-secondary" /> 20
                        Tiet
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 3 && (
                  <div className="flex flex-col gap-5">
                    {FAQS.map((faq, i) => (
                      <div key={i} className="px-7 py-5 bg-white rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-secondary text-base font-semibold">
                            {faq.q}
                          </span>
                          <FiChevronDown
                            size={24}
                            className="text-gray-400 shrink-0"
                          />
                        </div>
                        {faq.a && (
                          <p className="text-gray-600 text-lg leading-7 mt-5">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 4 && (
                  <div className="flex flex-col gap-5">
                    <h3 className="font-heading text-secondary text-xl font-semibold">
                      Binh luan
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-secondary text-4xl font-semibold">
                        4.0
                      </span>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className="size-5 bg-warning rounded"
                            />
                          ))}
                        </div>
                        <span className="text-gray-600 text-base">
                          dua tren 146,951 ratings
                        </span>
                      </div>
                    </div>
                    <CommentList />
                  </div>
                )}
              </div>
            </div>

            <CommentForm />
          </div>
        </div>
      </section>
    </>
  );
}
