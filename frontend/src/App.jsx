import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
import BlogManager from "./pages/dashboard/admin/BlogManager";
import CategoryManager from "./pages/dashboard/admin/CategoryManager";
import ContactManager from "./pages/dashboard/admin/ContactManager";
import CouponManager from "./pages/dashboard/admin/CouponManager";
import OrderManager from "./pages/dashboard/admin/OrderManager";
import ReviewManager from "./pages/dashboard/admin/ReviewManager";
import RoadmapManager from "./pages/dashboard/admin/RoadmapManager";
import StudentManager from "./pages/dashboard/admin/StudentManager";
import UserManager from "./pages/dashboard/admin/UserManager";
import InstructorStudents from "./pages/dashboard/instructor/InstructorStudents";
import PaymentManager from "./pages/dashboard/operator/PaymentManager";
import CourseManager from "./pages/dashboard/shared/CourseManager";
import CourseReviewManager from "./pages/dashboard/shared/CourseReviewManager";
import DashboardOverview from "./pages/dashboard/shared/DashboardOverview";
import WorkflowBoard from "./pages/dashboard/shared/WorkflowBoard";
import { useAuth } from "./context/AuthContext";

function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function RequireDashboardRole({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-[240px] flex items-center justify-center text-gray-500">Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function RequireRole({ roles, children, fallback = "/" }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-[240px] flex items-center justify-center text-gray-500">Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}

function PaymentsRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-[240px] flex items-center justify-center text-gray-500">Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (user.role === "admin") {
    return <OrderManager />;
  }

  if (user.role === "operator") {
    return <PaymentManager />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
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
              <Route path="/admin/dang-nhap" element={<Navigate to="/dang-nhap" replace />} />
              <Route path="/giang-vien/dang-nhap" element={<Navigate to="/dang-nhap" replace />} />
              <Route path="/operator/dang-nhap" element={<Navigate to="/dang-nhap" replace />} />
              <Route path="/dang-ky" element={<Register />} />
              <Route path="/gio-hang" element={<RequireRole roles={["student"]} fallback="/dashboard"><Cart /></RequireRole>} />
              <Route path="/lo-trinh" element={<RoadmapListing />} />
              <Route path="/lo-trinh/:id" element={<RoadmapDetail />} />
              <Route path="/thanh-toan" element={<RequireRole roles={["student"]} fallback="/dashboard"><Payment /></RequireRole>} />
              <Route path="/thanh-toan-thanh-cong" element={<RequireRole roles={["student"]} fallback="/dashboard"><PaymentSuccess /></RequireRole>} />
              <Route path="/trang-ca-nhan" element={<Profile />} />
              <Route path="/khoa-hoc-cua-toi" element={<RequireRole roles={["student"]} fallback="/dashboard"><MyCourses /></RequireRole>} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="profile" element={<RequireDashboardRole roles={["admin", "operator", "instructor"]}><Profile /></RequireDashboardRole>} />
              <Route path="courses" element={<RequireDashboardRole roles={["instructor"]}><CourseManager /></RequireDashboardRole>} />
              <Route path="roadmaps" element={<RequireDashboardRole roles={["admin"]}><RoadmapManager /></RequireDashboardRole>} />
              <Route path="students" element={<RequireDashboardRole roles={["admin"]}><StudentManager /></RequireDashboardRole>} />
              <Route path="instructor-students" element={<RequireDashboardRole roles={["instructor"]}><InstructorStudents /></RequireDashboardRole>} />
              <Route path="course-reviews" element={<RequireDashboardRole roles={["admin", "operator"]}><CourseReviewManager /></RequireDashboardRole>} />
              <Route path="reviews" element={<RequireDashboardRole roles={["admin"]}><ReviewManager /></RequireDashboardRole>} />
              <Route path="payments" element={<PaymentsRoute />} />
              <Route path="complaints" element={<RequireDashboardRole roles={["operator"]}><WorkflowBoard type="complaints" /></RequireDashboardRole>} />
              <Route path="users" element={<RequireDashboardRole roles={["admin"]}><UserManager /></RequireDashboardRole>} />
              <Route path="categories" element={<RequireDashboardRole roles={["admin"]}><CategoryManager /></RequireDashboardRole>} />
              <Route path="coupons" element={<RequireDashboardRole roles={["admin"]}><CouponManager /></RequireDashboardRole>} />
              <Route path="blogs" element={<RequireDashboardRole roles={["admin"]}><BlogManager /></RequireDashboardRole>} />
              <Route path="contacts" element={<RequireDashboardRole roles={["admin"]}><ContactManager /></RequireDashboardRole>} />
            </Route>
          </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}
