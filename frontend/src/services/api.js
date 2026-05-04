import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";

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

export default api;
