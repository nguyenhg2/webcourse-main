import Breadcrumb from "../components/layout/Breadcrumb";
import FAQItem from "../components/ui/FAQItem";

const faqData = [
  {
    category: "Chung",
    items: [
      { q: "CodeCamp là gì?", a: "CodeCamp là nền tảng học lập trình trực tuyến hàng đầu Việt Nam, cung cấp hàng trăm khóa học chất lượng cao về lập trình và công nghệ." },
      { q: "Tôi có thể học trên thiết bị nào?", a: "Bạn có thể học trên máy tính, tablet, hoặc điện thoại di động thông qua trình duyệt web." },
      { q: "Khóa học có thời hạn truy cập không?", a: "Không, khi bạn đã đăng ký khóa học, bạn có thể truy cập mãi mãi bao gồm cả các bản cập nhật mới." },
    ],
  },
  {
    category: "Khóa học",
    items: [
      { q: "Làm sao để đăng ký khóa học?", a: "Bạn chỉ cần tạo tài khoản, chọn khóa học mong muốn và tiến hành thanh toán. Sau khi thanh toán thành công, bạn có thể bắt đầu học ngay." },
      { q: "Tôi có nhận được chứng chỉ không?", a: "Có, sau khi hoàn thành khóa học, bạn sẽ nhận được chứng chỉ hoàn thành có thể thêm vào hồ sơ cá nhân." },
      { q: "Tôi có thể hỏi giảng viên không?", a: "Có, mỗi khóa học đều có phần hỏi đáp nơi bạn có thể đặt câu hỏi trực tiếp cho giảng viên." },
    ],
  },
  {
    category: "Thanh toán",
    items: [
      { q: "CodeCamp hỗ trợ phương thức thanh toán nào?", a: "Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng (Visa, Mastercard), PayPal và chuyển khoản ngân hàng." },
      { q: "Tôi có thể hoàn tiền không?", a: "Có, chúng tôi có chính sách hoàn tiền trong vòng 30 ngày kể từ ngày mua nếu bạn không hài lòng với khóa học." },
      { q: "Có ưu đãi cho sinh viên không?", a: "Có, chúng tôi cung cấp mã giảm giá đặc biệt cho sinh viên. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết." },
    ],
  },
];

export default function FAQ() {
  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Câu hỏi thường gặp" }]} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-heading font-bold text-secondary">Câu hỏi thường gặp</h1>
          <p className="text-gray-600 mt-3">Tìm câu trả lời cho những thắc mắc phổ biến nhất</p>
        </div>
        {faqData.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="text-xl font-heading font-semibold text-secondary mb-5">{section.category}</h2>
            <div className="flex flex-col gap-3">
              {section.items.map((item, i) => (
                <FAQItem key={i} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
