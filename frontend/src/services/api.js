import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";
const PAYMENT_API_BASE = import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:8002";
const BLOG_API_BASE = import.meta.env.VITE_BLOG_API_URL || "http://localhost:8003";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export async function loginAPI(email, password) {
  const res = await api.post("/api/auth/login", { email, password });
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

export async function getCategoriesAPI() {
  const res = await api.get("/api/categories");
  return res.data;
}

export async function enrollCourseAPI(courseId) {
  const res = await api.post("/api/enroll?course_id=" + courseId);
  return res.data;
}

export async function getLessonAPI(lessonId) {
  const res = await api.get("/api/lessons/" + lessonId);
  return res.data;
}

export async function getBlogsAPI(params) {
  const res = await axios.get(BLOG_API_BASE + "/api/blogs", { params });
  return res.data;
}

export async function getBlogBySlugAPI(slug) {
  const res = await axios.get(BLOG_API_BASE + "/api/blogs/" + slug);
  return res.data;
}

export async function sendContactAPI(payload) {
  const res = await axios.post(BLOG_API_BASE + "/api/contact", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function getRoadmapsAPI() {
  const res = await api.get("/api/roadmaps");
  return res.data;
}

export async function getRoadmapAPI(id) {
  const res = await api.get("/api/roadmaps/" + id);
  return res.data;
}

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

export async function getCourseReviewsAPI(courseId) {
  const res = await api.get("/api/courses/" + courseId + "/reviews");
  return res.data;
}

export async function createPaymentAPI(payload) {
  const res = await axios.post(PAYMENT_API_BASE + "/api/payments", payload, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function confirmTestPaymentAPI(paymentId) {
  const res = await axios.post(
    PAYMENT_API_BASE + "/api/payments/confirm-test",
    { payment_id: paymentId },
    { headers: authHeaders() }
  );
  return res.data;
}

export async function uploadVideoAPI(file) {
  const formData = new FormData();
  formData.append("video", file);
  const res = await axios.post(PAYMENT_API_BASE + "/api/videos/upload", formData, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function getPreviewVideoAPI() {
  const res = await axios.get(PAYMENT_API_BASE + "/api/videos/preview", {
    headers: authHeaders(),
  });
  return res.data;
}

export async function getSignedVideoAPI(lessonId) {
  const res = await axios.get(PAYMENT_API_BASE + "/api/video/" + lessonId + "/signed-url", {
    headers: authHeaders(),
  });
  return res.data;
}

export async function validateCouponAPI(code, amount) {
  const res = await axios.post(
    PAYMENT_API_BASE + "/api/coupons/validate",
    { code, amount },
    { headers: authHeaders() }
  );
  return res.data;
}

export async function getPaymentHistoryAPI() {
  const res = await axios.get(PAYMENT_API_BASE + "/api/payments/history", {
    headers: authHeaders(),
  });
  return res.data;
}

export async function uploadLessonVideoAPI(file) {
  return uploadVideoAPI(file);
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

// Admin APIs
export async function getAdminDashboardAPI() {
  const res = await api.get("/api/admin/dashboard");
  return res.data;
}

export async function getAdminUsersAPI() {
  const res = await api.get("/api/admin/users");
  return res.data;
}

export async function updateUserRoleAPI(userId, role) {
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

export async function getCategoriesAdminAPI() {
  const res = await api.get("/api/categories");
  return res.data;
}

export async function createCategoryAPI(payload) {
  const res = await api.post("/api/categories", payload);
  return res.data;
}

export async function deleteCategoryAPI(id) {
  const res = await api.delete(`/api/categories/${id}`);
  return res.data;
}

export async function updateCategoryAPI(id, payload) {
  const res = await api.put(`/api/categories/${id}`, payload);
  return res.data;
}

export async function deleteReviewAPI(reviewId) {
  const res = await api.delete(`/api/reviews/${reviewId}`);
  return res.data;
}

export async function getReviewsByCourseAPI(courseId) {
  const res = await api.get(`/api/courses/${courseId}/reviews`);
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

export async function deleteCourseAPI(id) {
  const res = await api.delete(`/api/courses/${id}`);
  return res.data;
}

// Blog admin APIs (PHP service port 8003)
export async function getAdminBlogsAPI() {
  const res = await axios.get(BLOG_API_BASE + "/api/admin/blogs", { headers: authHeaders() });
  return res.data;
}

export async function createBlogAPI(payload) {
  const res = await axios.post(BLOG_API_BASE + "/api/admin/blogs", payload, { headers: authHeaders() });
  return res.data;
}

export async function updateBlogAPI(id, payload) {
  const res = await axios.put(BLOG_API_BASE + `/api/admin/blogs/${id}`, payload, { headers: authHeaders() });
  return res.data;
}

export async function deleteBlogAPI(id) {
  const res = await axios.delete(BLOG_API_BASE + `/api/admin/blogs/${id}`, { headers: authHeaders() });
  return res.data;
}

// Contact admin APIs (PHP service port 8003)
export async function getAdminContactsAPI() {
  const res = await axios.get(BLOG_API_BASE + "/api/admin/contacts", { headers: authHeaders() });
  return res.data;
}

export async function markContactReadAPI(id) {
  const res = await axios.patch(BLOG_API_BASE + `/api/admin/contacts/${id}/read`, {}, { headers: authHeaders() });
  return res.data;
}

export default api;
