import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ui/ScrollToTop";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useAuth } from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const CourseListingPage = lazy(() => import("./pages/CourseListingPage"));
const CourseSingle = lazy(() => import("./pages/CourseSingle"));
const LessonPlayer = lazy(() => import("./pages/LessonPlayer"));
const BlogListing = lazy(() => import("./pages/BlogListing"));
const BlogSingle = lazy(() => import("./pages/BlogSingle"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Payment = lazy(() => import("./pages/Payment"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const MyCourses = lazy(() => import("./pages/MyCourses"));
const Cart = lazy(() => import("./pages/Cart"));
const RoadmapListing = lazy(() => import("./pages/RoadmapListing"));
const RoadmapDetail = lazy(() => import("./pages/RoadmapDetail"));
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout"));
const BlogManager = lazy(() => import("./pages/dashboard/admin/BlogManager"));
const CategoryManager = lazy(() => import("./pages/dashboard/admin/CategoryManager"));
const ContactManager = lazy(() => import("./pages/dashboard/admin/ContactManager"));
const CouponManager = lazy(() => import("./pages/dashboard/admin/CouponManager"));
const OrderManager = lazy(() => import("./pages/dashboard/admin/OrderManager"));
const ReviewManager = lazy(() => import("./pages/dashboard/admin/ReviewManager"));
const RoadmapManager = lazy(() => import("./pages/dashboard/admin/RoadmapManager"));
const SiteContentManager = lazy(() => import("./pages/dashboard/admin/SiteContentManager"));
const UserManager = lazy(() => import("./pages/dashboard/admin/UserManager"));
const InstructorStudents = lazy(() => import("./pages/dashboard/instructor/InstructorStudents"));
const PaymentManager = lazy(() => import("./pages/dashboard/operator/PaymentManager"));
const CourseManager = lazy(() => import("./pages/dashboard/shared/CourseManager"));
const CourseReviewManager = lazy(() => import("./pages/dashboard/shared/CourseReviewManager"));
const DashboardOverview = lazy(() => import("./pages/dashboard/shared/DashboardOverview"));
const WorkflowBoard = lazy(() => import("./pages/dashboard/shared/WorkflowBoard"));

function PageLoader() {
  return <div className="min-h-[240px] flex items-center justify-center text-gray-500">Đang tải...</div>;
}

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
    return <PageLoader />;
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
    return <PageLoader />;
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
    return <PageLoader />;
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
          <Suspense fallback={<PageLoader />}>
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
              <Route path="instructor-students" element={<RequireDashboardRole roles={["instructor"]}><InstructorStudents /></RequireDashboardRole>} />
              <Route path="course-reviews" element={<RequireDashboardRole roles={["operator"]}><CourseReviewManager /></RequireDashboardRole>} />
              <Route path="reviews" element={<RequireDashboardRole roles={["admin"]}><ReviewManager /></RequireDashboardRole>} />
              <Route path="payments" element={<PaymentsRoute />} />
              <Route path="complaints" element={<RequireDashboardRole roles={["operator"]}><WorkflowBoard type="complaints" /></RequireDashboardRole>} />
              <Route path="users" element={<RequireDashboardRole roles={["admin"]}><UserManager /></RequireDashboardRole>} />
              <Route path="categories" element={<RequireDashboardRole roles={["admin"]}><CategoryManager /></RequireDashboardRole>} />
              <Route path="coupons" element={<RequireDashboardRole roles={["admin"]}><CouponManager /></RequireDashboardRole>} />
              <Route path="blogs" element={<RequireDashboardRole roles={["admin"]}><BlogManager /></RequireDashboardRole>} />
              <Route path="site-content" element={<RequireDashboardRole roles={["admin"]}><SiteContentManager /></RequireDashboardRole>} />
              <Route path="contacts" element={<RequireDashboardRole roles={["admin"]}><ContactManager /></RequireDashboardRole>} />
            </Route>
          </Routes>
          </Suspense>
        </BrowserRouter>
    </AuthProvider>
  );
}
