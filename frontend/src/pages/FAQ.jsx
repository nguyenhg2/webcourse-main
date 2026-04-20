import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";

const faqData = [
  {
    category: "Chung",
    items: [
      {
        q: "CodeCamp la gi?",
        a: "CodeCamp la nen tang hoc lap trinh truc tuyen hang dau Viet Nam, cung cap cac khoa hoc tu co ban den nang cao ve lap trinh web, mobile, data science va nhieu linh vuc cong nghe khac.",
      },
      {
        q: "Lam the nao de dang ky tai khoan?",
        a: "Ban chi can nhan vao nut Dang ky o goc phai phia tren trang web, dien day du thong tin ca nhan va xac nhan email de hoan tat qua trinh dang ky.",
      },
      {
        q: "Toi co the hoc tren dien thoai duoc khong?",
        a: "Co, nen tang cua chung toi ho tro responsive hoan toan. Ban co the hoc tren moi thiet bi: may tinh, tablet, dien thoai thong minh.",
      },
      {
        q: "Co duoc hoan tien neu khong hai long?",
        a: "Chung toi co chinh sach hoan tien trong vong 7 ngay ke tu ngay mua khoa hoc neu ban khong hai long voi noi dung.",
      },
    ],
  },
  {
    category: "Khoa hoc",
    items: [
      {
        q: "Cac khoa hoc co thoi han truy cap khong?",
        a: "Khong, khi ban da mua khoa hoc, ban co quyen truy cap vinh vien va co the xem lai bat cu luc nao.",
      },
      {
        q: "Toi co nhan duoc chung chi sau khi hoan thanh khong?",
        a: "Co, sau khi hoan thanh khoa hoc va vuot qua bai kiem tra cuoi khoa, ban se nhan duoc chung chi hoan thanh co the tai ve va chia se.",
      },
      {
        q: "Co ho tro giang vien truc tiep khong?",
        a: "Co, moi khoa hoc deu co phan hoi dap voi giang vien. Ngoai ra, cac khoa hoc premium con co ho tro 1-1 qua video call.",
      },
      {
        q: "Noi dung khoa hoc co duoc cap nhat khong?",
        a: "Co, chung toi thuong xuyen cap nhat noi dung khoa hoc de dam bao kien thuc luon moi va phu hop voi xu huong cong nghe hien tai.",
      },
    ],
  },
  {
    category: "Thanh toan",
    items: [
      {
        q: "Cac hinh thuc thanh toan nao duoc ho tro?",
        a: "Chung toi ho tro thanh toan qua the ngan hang, vi dien tu (MoMo, ZaloPay, VNPay), chuyen khoan ngan hang va the Visa/Mastercard.",
      },
      {
        q: "Co chuong trinh giam gia nao khong?",
        a: "Co, chung toi thuong xuyen co cac chuong trinh khuyen mai, giam gia dac biet. Hay theo doi trang web va dang ky nhan email de khong bo lo.",
      },
      {
        q: "Toi co the mua khoa hoc tang nguoi khac khong?",
        a: "Co, ban co the mua khoa hoc lam qua tang. Chon khoa hoc, chon Mua lam qua tang va nhap email nguoi nhan.",
      },
    ],
  },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        {open ? (
          <FiChevronUp className="text-primary shrink-0" size={20} />
        ) : (
          <FiChevronDown className="text-gray-400 shrink-0" size={20} />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="bg-white">
      <Breadcrumb items={[{ label: "Trang chu", to: "/" }, { label: "Cau hoi thuong gap" }]} />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cau Hoi Thuong Gap</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tim cau tra loi cho nhung thac mac pho bien nhat ve CodeCamp va cac khoa hoc cua chung toi.
          </p>
        </div>

        <div className="space-y-10">
          {faqData.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((item, j) => (
                  <FAQItem key={j} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
