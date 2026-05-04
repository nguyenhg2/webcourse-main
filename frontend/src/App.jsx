import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ScrollToTop from "./components/ui/ScrollToTop";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import CourseListingPage from "./pages/CourseListingPage";
import CourseSingle from "./pages/CourseSingle";
import LessonPlayer from "./pages/LessonPlayer";
import BlogListing from "./pages/BlogListing";
import BlogSingle from "./pages/BlogSingle";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MyCourses from "./pages/MyCourses";

// Dashboard Components
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import PlaceholderPage from "./pages/dashboard/PlaceholderPage";

function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/khoa-hoc/:slug/hoc/:lessonId" element={<LessonPlayer />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/khoa-hoc" element={<CourseListingPage />} />
              <Route path="/khoa-hoc/:slug" element={<CourseSingle />} />
              <Route path="/blog" element={<BlogListing />} />
              <Route path="/blog/:slug" element={<BlogSingle />} />
              <Route path="/lien-he" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/dang-nhap" element={<Login />} />
              <Route path="/dang-ky" element={<Register />} />
              <Route path="/thanh-toan" element={<Payment />} />
              <Route path="/thanh-toan-thanh-cong" element={<PaymentSuccess />} />
              <Route path="/trang-ca-nhan" element={<Profile />} />
              <Route path="/khoa-hoc-cua-toi" element={<MyCourses />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Dashboard Routes for Admin, Operator, Instructor */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              
              {/* Instructor Routes */}
              <Route path="courses" element={<PlaceholderPage title="Quản lý khóa học" description="Thêm, sửa, xóa khóa học và bài giảng." />} />
              <Route path="students" element={<PlaceholderPage title="Quản lý học viên" description="Xem danh sách học viên và tiến độ học tập." />} />
              <Route path="qa" element={<PlaceholderPage title="Giải đáp Q&A" description="Trả lời các câu hỏi của học viên." />} />
              
              {/* Operator Routes */}
              <Route path="reviews" element={<PlaceholderPage title="Kiểm duyệt khóa học" description="Phê duyệt nội dung trước khi xuất bản." />} />
              <Route path="payments" element={<PlaceholderPage title="Hỗ trợ thanh toán" description="Kiểm tra và xử lý các giao dịch lỗi." />} />
              <Route path="complaints" element={<PlaceholderPage title="Giải quyết khiếu nại" description="Xử lý khiếu nại từ học viên và giảng viên." />} />
              
              {/* Admin Routes */}
              <Route path="users" element={<PlaceholderPage title="Quản lý người dùng" description="Quản trị tài khoản toàn hệ thống." />} />
              <Route path="categories" element={<PlaceholderPage title="Quản lý danh mục" description="Thiết lập danh mục khóa học và blog." />} />
              <Route path="coupons" element={<PlaceholderPage title="Mã giảm giá" description="Tạo và quản lý các mã khuyến mãi." />} />
              <Route path="blogs" element={<PlaceholderPage title="Quản lý Blog" description="Đăng và chỉnh sửa bài viết trên Blog." />} />
              <Route path="settings" element={<PlaceholderPage title="Cấu hình hệ thống" description="Thiết lập các thông số chung cho website." />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
