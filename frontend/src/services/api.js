import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/core";
const PAYMENT_API_BASE = import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:8000/payment";
const MEDIA_API_BASE = import.meta.env.VITE_MEDIA_API_URL || "http://localhost:8000/media";
const BLOG_API_BASE = import.meta.env.VITE_BLOG_API_URL || "http://localhost:8000/blog";

function createClient(baseURL) {
  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  });

  return client;
}

const api = createClient(API_BASE);
const paymentApi = createClient(PAYMENT_API_BASE);
const mediaApi = createClient(MEDIA_API_BASE);
const blogApi = createClient(BLOG_API_BASE);

// Auth
export async function loginAPI(email, password, expectedRole) {
  const payload = { email, password };
  if (expectedRole) {
    payload.expected_role = expectedRole;
  }
  const res = await api.post("/api/auth/login", payload);
  return res.data;
}

export async function registerAPI(name, email, password) {
  const res = await api.post("/api/auth/register", { name, email, password });
  return res.data;
}

export async function getMeAPI() {
  const res = await api.get("/api/auth/me");
  return res.data;
}

export async function getProfileAPI() {
  const res = await api.get("/api/auth/profile");
  return res.data;
}

// Courses
export async function getCoursesAPI(params) {
  const res = await api.get("/api/courses", { params });
  return res.data;
}

export async function getCourseBySlugAPI(slug) {
  const res = await api.get("/api/courses/slug/" + slug);
  return res.data;
}

export async function getCourseByIdAPI(id) {
  const res = await api.get("/api/courses/" + id);
  return res.data;
}

export async function createCourseAPI(payload) {
  const res = await api.post("/api/courses", payload);
  return res.data;
}

export async function updateCourseAPI(id, payload) {
  const res = await api.put(`/api/courses/${id}`, payload);
  return res.data;
}

export async function submitCourseAPI(id) {
  const res = await api.patch(`/api/courses/${id}/submit`);
  return res.data;
}

export async function reviewCourseAPI(id, payload) {
  const res = await api.patch(`/api/courses/${id}/review`, payload);
  return res.data;
}

export async function deleteCourseAPI(id) {
  const res = await api.delete(`/api/courses/${id}`);
  return res.data;
}

export async function createSectionAPI(courseId, payload) {
  const res = await api.post(`/api/courses/${courseId}/sections`, payload);
  return res.data;
}

export async function updateSectionAPI(sectionId, payload) {
  const res = await api.put(`/api/sections/${sectionId}`, payload);
  return res.data;
}

export async function createLessonAPI(sectionId, payload) {
  const res = await api.post(`/api/sections/${sectionId}/lessons`, payload);
  return res.data;
}

// Categories
export async function getCategoriesAPI() {
  const res = await api.get("/api/categories");
  return res.data;
}

export async function createCategoryAPI(payload) {
  const res = await api.post("/api/categories", payload);
  return res.data;
}

export async function updateCategoryAPI(id, payload) {
  const res = await api.put(`/api/categories/${id}`, payload);
  return res.data;
}

export async function deleteCategoryAPI(id) {
  const res = await api.delete(`/api/categories/${id}`);
  return res.data;
}

// Enroll & Lessons
export async function enrollCourseAPI(courseId, paymentId) {
  const payload = Array.isArray(courseId)
    ? { course_ids: courseId, payment_id: paymentId }
    : { course_id: courseId, payment_id: paymentId };
  const res = await api.post("/api/enroll", payload);
  return res.data;
}

export async function getLessonAPI(lessonId) {
  const res = await api.get("/api/lessons/" + lessonId);
  return res.data;
}

export async function updateLessonAPI(lessonId, payload) {
  const res = await api.put("/api/lessons/" + lessonId, payload);
  return res.data;
}

// Blog & Contact
export async function getBlogsAPI(params) {
  const res = await blogApi.get("/api/blogs", { params });
  return res.data;
}

export async function getBlogBySlugAPI(slug) {
  const res = await blogApi.get("/api/blogs/" + slug);
  return res.data;
}

export async function sendContactAPI(payload) {
  const res = await blogApi.post("/api/contact", payload);
  return res.data;
}

// Roadmaps
export async function getRoadmapsAPI() {
  const res = await api.get("/api/roadmaps");
  return res.data;
}

export async function getRoadmapAPI(id) {
  const res = await api.get("/api/roadmaps/" + id);
  return res.data;
}

// My courses & cart
export async function getMyCoursesAPI() {
  const res = await api.get("/api/my-courses");
  return res.data;
}

export async function getCartAPI() {
  const res = await api.get("/api/cart");
  return res.data;
}

export async function addCartAPI(courseId) {
  const res = await api.post("/api/cart", { course_id: courseId });
  return res.data;
}

export async function removeCartAPI(courseId) {
  const res = await api.delete("/api/cart/" + courseId);
  return res.data;
}

export async function saveProgressAPI(payload) {
  const res = await api.post("/api/progress", payload);
  return res.data;
}

// Reviews
export async function getCourseReviewsAPI(courseId) {
  const res = await api.get("/api/courses/" + courseId + "/reviews");
  return res.data;
}

export async function getReviewsByCourseAPI(courseId) {
  const res = await api.get(`/api/courses/${courseId}/reviews`);
  return res.data;
}

export async function deleteReviewAPI(reviewId) {
  const res = await api.delete(`/api/reviews/${reviewId}`);
  return res.data;
}

// Payment
export async function createPaymentAPI(payload) {
  const res = await api.post("/api/checkout/pay", payload);
  return res.data;
}

export async function getAllPaymentsAPI() {
  const res = await paymentApi.get("/api/payments");
  return res.data;
}

export async function getPaymentHistoryAPI() {
  const res = await paymentApi.get("/api/payments/history");
  return res.data;
}

export async function validateCouponAPI(code, amount) {
  const res = await paymentApi.post("/api/coupons/validate", { code, amount });
  return res.data;
}

export async function getCouponsAPI() {
  const res = await api.get("/api/coupons");
  return res.data;
}

export async function createCouponAPI(payload) {
  const res = await api.post("/api/coupons", payload);
  return res.data;
}

export async function updateCouponStatusAPI(couponId, active) {
  const res = await api.patch(`/api/coupons/${couponId}/active`, { active });
  return res.data;
}

export async function uploadVideoAPI(file, folder) {
  if (!folder) {
    throw new Error("Vui lòng nhập thư mục Cloudinary");
  }

  const formData = new FormData();
  formData.append("video", file);
  formData.append("folder", folder);
  const res = await mediaApi.post("/api/videos/upload", formData);
  return res.data;
}

export async function deleteVideoAPI(payload) {
  const res = await mediaApi.delete("/api/videos/delete", { data: payload });
  return res.data;
}

export async function uploadLessonVideoAPI(file, folder) {
  return uploadVideoAPI(file, folder);
}

export async function uploadAttachmentAPI(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await mediaApi.post("/api/files/upload", formData);
  return res.data;
}

// Admin APIs
export async function getAdminDashboardAPI() {
  const res = await api.get("/api/admin/dashboard");
  return res.data;
}

export async function getDashboardOverviewAPI() {
  const res = await api.get("/api/dashboard");
  return res.data;
}

export async function getAdminUsersAPI() {
  const res = await api.get("/api/admin/users");
  return res.data;
}

export async function updateAdminUserRoleAPI(userId, role) {
  const res = await api.put(`/api/admin/users/${userId}/role`, { role });
  return res.data;
}

export async function getAdminOrdersAPI() {
  const res = await api.get("/api/admin/orders");
  return res.data;
}

export async function getAdminRevenueAPI() {
  const res = await api.get("/api/admin/revenue");
  return res.data;
}

// Admin Blog & Contact
export async function getAdminBlogsAPI() {
  const res = await blogApi.get("/api/admin/blogs");
  return res.data;
}

export async function createBlogAPI(payload) {
  const res = await blogApi.post("/api/admin/blogs", payload);
  return res.data;
}

export async function updateBlogAPI(id, payload) {
  const res = await blogApi.put(`/api/admin/blogs/${id}`, payload);
  return res.data;
}

export async function deleteBlogAPI(id) {
  const res = await blogApi.delete(`/api/admin/blogs/${id}`);
  return res.data;
}

export async function getAdminContactsAPI() {
  const res = await blogApi.get("/api/admin/contacts");
  return res.data;
}

export async function markContactReadAPI(id) {
  const res = await blogApi.patch(`/api/admin/contacts/${id}/read`, {});
  return res.data;
}

export default api;
