import { Link } from "react-router-dom";
import Breadcrumb from "../components/layout/Breadcrumb";

export default function NotFound() {
  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "404" }]} />
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <h1 className="text-8xl font-heading font-bold text-primary">404</h1>
        <h2 className="text-2xl font-heading font-bold text-secondary mt-4">Trang không tồn tại</h2>
        <p className="text-gray-600 mt-3">Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
        <Link to="/" className="inline-block mt-8 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
          Về trang chủ
        </Link>
      </div>
    </>
  );
}
