import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";
const PAYMENT_API_BASE = import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:8002";

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
  const res = await api.get("/api/blogs", { params });
  return res.data;
}

export async function getBlogBySlugAPI(slug) {
  const res = await api.get("/api/blogs/" + slug);
  return res.data;
}

export async function sendContactAPI(payload) {
  const res = await api.post("/api/contact", payload);
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

export default api;
