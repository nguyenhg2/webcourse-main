import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
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
            <Route
              path="*"
              element={
                <MainLayout>
                  <Routes>
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
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
