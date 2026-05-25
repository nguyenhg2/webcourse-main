import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
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
import Cart from "./pages/Cart";
import RoadmapListing from "./pages/RoadmapListing";
import RoadmapDetail from "./pages/RoadmapDetail";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import CourseManager from "./pages/dashboard/CourseManager";
import PaymentManager from "./pages/dashboard/PaymentManager";
import CouponManager from "./pages/dashboard/CouponManager";
import UserManager from "./pages/dashboard/UserManager";
import CategoryManager from "./pages/dashboard/CategoryManager";
import StudentCourses from "./pages/dashboard/StudentCourses";
import WorkflowBoard from "./pages/dashboard/WorkflowBoard";
import BlogManager from "./pages/dashboard/BlogManager";
import ContactManager from "./pages/dashboard/ContactManager";
import StudentManager from "./pages/dashboard/StudentManager";
import ReviewManager from "./pages/dashboard/ReviewManager";
import OrderManager from "./pages/dashboard/OrderManager";

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
              <Route path="/gio-hang" element={<Cart />} />
              <Route path="/lo-trinh" element={<RoadmapListing />} />
              <Route path="/lo-trinh/:id" element={<RoadmapDetail />} />
              <Route path="/thanh-toan" element={<Payment />} />
              <Route path="/thanh-toan-thanh-cong" element={<PaymentSuccess />} />
              <Route path="/trang-ca-nhan" element={<Profile />} />
              <Route path="/khoa-hoc-cua-toi" element={<MyCourses />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="my-courses" element={<StudentCourses />} />
              <Route path="courses" element={<CourseManager />} />
              <Route path="students" element={<StudentManager />} />
              <Route path="qa" element={<WorkflowBoard type="qa" />} />
              <Route path="reviews" element={<ReviewManager />} />
              <Route path="payments" element={<OrderManager />} />
              <Route path="complaints" element={<WorkflowBoard type="complaints" />} />
              <Route path="users" element={<UserManager />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="coupons" element={<CouponManager />} />
              <Route path="blogs" element={<BlogManager />} />
              <Route path="contacts" element={<ContactManager />} />
              <Route path="settings" element={<WorkflowBoard type="settings" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
