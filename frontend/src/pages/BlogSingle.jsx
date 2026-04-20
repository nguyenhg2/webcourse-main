import { FiUser, FiCalendar, FiMessageCircle } from "react-icons/fi";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/layout/Breadcrumb";
import BlogSidebar from "../components/blog/BlogSidebar";
import CommentList from "../components/ui/CommentList";
import CommentForm from "../components/ui/CommentForm";

const TAGS = [
  "Khoa hoc mien phi",
  "Marketing",
  "Idea",
  "LMS",
  "LearnPress",
  "Instructor",
];

export default function BlogSingle() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Trang chu", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: "5 Ngon Ngu Lap Trinh Nen Hoc Nam 2026" },
        ]}
      />

      <section className="py-14">
        <div className="max-w-[1290px] mx-auto px-4 flex gap-7">
          <div className="flex-1 flex flex-col gap-14">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-5">
                <h1 className="font-heading text-secondary text-4xl font-semibold capitalize leading-10">
                  5 Ngon Ngu Lap Trinh Nen Hoc Nam 2026
                </h1>
                <div className="flex flex-wrap gap-6">
                  <span className="flex items-center gap-1 text-gray-600 text-base">
                    <FiUser size={16} className="text-primary" />
                    Dinh Thanh Nguyen
                  </span>
                  <span className="flex items-center gap-1 text-gray-600 text-base">
                    <FiCalendar size={16} className="text-primary" />
                    Jan 24, 2026
                  </span>
                  <span className="flex items-center gap-1 text-gray-600 text-base">
                    <FiMessageCircle size={16} className="text-primary" />
                    20 Binh luan
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-7">
                <img
                  src="https://placehold.co/990x603"
                  alt="Blog"
                  className="w-full rounded-2xl object-cover"
                />
                <div className="text-gray-600 text-lg leading-7">
                  <p>
                    Thi truong cong nghe dang thay doi nhanh chong. De khong bi
                    tut hau, viec chon dung ngon ngu lap trinh de dau tu thoi
                    gian hoc la vo cung quan trong. Duoi day la 5 ngon ngu lap
                    trinh duoc cac nha tuyen dung san don nhat nam 2026.
                  </p>
                  <br />
                  <p>
                    JavaScript van la "vua" cua lap trinh web. Voi he sinh thai
                    React, Node.js, Next.js, JavaScript tiep tuc thong tri ca
                    frontend lan backend. Hau het cac cong ty cong nghe deu yeu
                    cau ky nang JavaScript trong cac vi tri tuyen dung.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <span className="text-gray-600 text-lg">Tags:</span>
                <div className="flex-1 flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <span
                      key={tag}
                      className={`px-5 py-2 rounded-lg border border-gray-100 text-lg ${
                        tag === "LearnPress"
                          ? "bg-gray-50 text-secondary"
                          : "text-gray-600"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-5">
                <span className="text-gray-600 text-lg">Share:</span>
                <div className="flex gap-3">
                  <FaFacebookF size={20} className="text-gray-600 hover:text-primary cursor-pointer" />
                  <FaTwitter size={20} className="text-primary" />
                  <FaLinkedinIn size={20} className="text-gray-600 hover:text-primary cursor-pointer" />
                  <FaInstagram size={20} className="text-gray-600 hover:text-primary cursor-pointer" />
                  <FaYoutube size={20} className="text-gray-600 hover:text-primary cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="flex gap-7">
              <Link
                to="/blog"
                className="flex-1 p-7 rounded-2xl border border-gray-100 flex items-center gap-6 hover:border-primary transition-colors"
              >
                <div className="p-3 bg-gray-50 rounded-lg">
                  <FiChevronLeft size={24} className="text-gray-400" />
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <span className="text-gray-600 text-lg">Bai viet truoc</span>
                  <span className="text-secondary text-xl font-semibold">
                    Best LearnPress WordPress Theme Collection for 2026
                  </span>
                </div>
              </Link>
              <Link
                to="/blog"
                className="flex-1 p-7 rounded-2xl border border-gray-100 flex items-center gap-6 hover:border-primary transition-colors"
              >
                <div className="flex-1 flex flex-col gap-3 items-end">
                  <span className="text-gray-600 text-lg">Bai viet ke</span>
                  <span className="text-secondary text-xl font-semibold text-right">
                    Best LearnPress WordPress Theme Collection for 2026
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <FiChevronRight size={24} className="text-primary" />
                </div>
              </Link>
            </div>

            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-3">
                <h3 className="text-secondary text-xl font-semibold">
                  Binh luan
                </h3>
                <p className="text-gray-600 text-lg">20 Binh luan</p>
              </div>
              <CommentList />
            </div>

            <CommentForm />
          </div>

          <div className="hidden lg:block">
            <BlogSidebar />
          </div>
        </div>
      </section>
    </>
  );
}
