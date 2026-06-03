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

function responseData(request) {
  return request.then((res) => res.data);
}

const get = (client, url, config) => responseData(client.get(url, config));
const post = (client, url, data, config) => responseData(client.post(url, data, config));
const put = (client, url, data, config) => responseData(client.put(url, data, config));
const patch = (client, url, data, config) => responseData(client.patch(url, data, config));
const remove = (client, url, config) => responseData(client.delete(url, config));

function makeFormData(fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
}

const api = createClient(API_BASE);
const paymentApi = createClient(PAYMENT_API_BASE);
const mediaApi = createClient(MEDIA_API_BASE);
const blogApi = createClient(BLOG_API_BASE);

// Auth
export function loginAPI(email, password, expectedRole) {
  const payload = { email, password };
  if (expectedRole) {
    payload.expected_role = expectedRole;
  }
  return post(api, "/api/auth/login", payload);
}

export function registerAPI(name, email, password) {
  return post(api, "/api/auth/register", { name, email, password });
}

export function getMeAPI() {
  return get(api, "/api/auth/me");
}

export function getProfileAPI() {
  return get(api, "/api/auth/profile");
}

// Courses
export function getCoursesAPI(params) {
  return get(api, "/api/courses", { params });
}

export function getCourseBySlugAPI(slug) {
  return get(api, "/api/courses/slug/" + slug);
}

export function getCourseByIdAPI(id) {
  return get(api, "/api/courses/" + id);
}

export function createCourseAPI(payload) {
  return post(api, "/api/courses", payload);
}

export function updateCourseAPI(id, payload) {
  return put(api, `/api/courses/${id}`, payload);
}

export function submitCourseAPI(id) {
  return patch(api, `/api/courses/${id}/submit`);
}

export function reviewCourseAPI(id, payload) {
  return patch(api, `/api/courses/${id}/review`, payload);
}

export function deleteCourseAPI(id) {
  return remove(api, `/api/courses/${id}`);
}

export function createSectionAPI(courseId, payload) {
  return post(api, `/api/courses/${courseId}/sections`, payload);
}

export function updateSectionAPI(sectionId, payload) {
  return put(api, `/api/sections/${sectionId}`, payload);
}

export function createLessonAPI(sectionId, payload) {
  return post(api, `/api/sections/${sectionId}/lessons`, payload);
}

// Categories
export function getCategoriesAPI() {
  return get(api, "/api/categories");
}

export function createCategoryAPI(payload) {
  return post(api, "/api/categories", payload);
}

export function updateCategoryAPI(id, payload) {
  return put(api, `/api/categories/${id}`, payload);
}

export function deleteCategoryAPI(id) {
  return remove(api, `/api/categories/${id}`);
}

// Enroll & Lessons
export function enrollCourseAPI(courseId, paymentId) {
  const payload = Array.isArray(courseId)
    ? { course_ids: courseId, payment_id: paymentId }
    : { course_id: courseId, payment_id: paymentId };
  return post(api, "/api/enroll", payload);
}

export function getLessonAPI(lessonId) {
  return get(api, "/api/lessons/" + lessonId);
}

export function updateLessonAPI(lessonId, payload) {
  return put(api, "/api/lessons/" + lessonId, payload);
}

// Blog & Contact
export function getBlogsAPI(params) {
  return get(blogApi, "/api/blogs", { params });
}

export function getBlogBySlugAPI(slug) {
  return get(blogApi, "/api/blogs/" + slug);
}

export function sendContactAPI(payload) {
  return post(blogApi, "/api/contact", payload);
}

// Roadmaps
export function getRoadmapsAPI() {
  return get(api, "/api/roadmaps");
}

export function getRoadmapAPI(id) {
  return get(api, "/api/roadmaps/" + id);
}

// My courses & cart
export function getMyCoursesAPI() {
  return get(api, "/api/my-courses");
}

export function getCartAPI() {
  return get(api, "/api/cart");
}

export function addCartAPI(courseId) {
  return post(api, "/api/cart", { course_id: courseId });
}

export function removeCartAPI(courseId) {
  return remove(api, "/api/cart/" + courseId);
}

export function saveProgressAPI(payload) {
  return post(api, "/api/progress", payload);
}

// Reviews
export function getCourseReviewsAPI(courseId) {
  return get(api, "/api/courses/" + courseId + "/reviews");
}

export function getReviewsByCourseAPI(courseId) {
  return get(api, `/api/courses/${courseId}/reviews`);
}

export function deleteReviewAPI(reviewId) {
  return remove(api, `/api/reviews/${reviewId}`);
}

// Payment
export function createPaymentAPI(payload) {
  return post(api, "/api/checkout/pay", payload);
}

export function getAllPaymentsAPI() {
  return get(paymentApi, "/api/payments");
}

export function getPaymentHistoryAPI() {
  return get(paymentApi, "/api/payments/history");
}

export function validateCouponAPI(code, amount) {
  return post(paymentApi, "/api/coupons/validate", { code, amount });
}

export function getCouponsAPI() {
  return get(paymentApi, "/api/coupons");
}

export function createCouponAPI(payload) {
  return post(paymentApi, "/api/coupons", payload);
}

export function updateCouponStatusAPI(couponId, active) {
  return patch(paymentApi, `/api/coupons/${couponId}/active`, { active });
}

export function uploadVideoAPI(file, folder) {
  if (!folder) {
    throw new Error("Vui long nhap thu muc Cloudinary");
  }

  const formData = makeFormData({ video: file, folder });
  return post(mediaApi, "/api/videos/upload", formData);
}

export function deleteVideoAPI(payload) {
  return remove(mediaApi, "/api/videos/delete", { data: payload });
}

export function uploadLessonVideoAPI(file, folder) {
  return uploadVideoAPI(file, folder);
}

export function uploadAttachmentAPI(file) {
  const formData = makeFormData({ file });
  return post(mediaApi, "/api/files/upload", formData);
}

// Admin APIs
export function getAdminDashboardAPI() {
  return get(api, "/api/admin/dashboard");
}

export function getDashboardOverviewAPI() {
  return get(api, "/api/dashboard");
}

export function getAdminUsersAPI() {
  return get(api, "/api/admin/users");
}

export function updateAdminUserRoleAPI(userId, role) {
  return put(api, `/api/admin/users/${userId}/role`, { role });
}

export function getAdminOrdersAPI() {
  return get(api, "/api/admin/orders");
}

export function getAdminRevenueAPI() {
  return get(api, "/api/admin/revenue");
}

// Admin Blog & Contact
export function getAdminBlogsAPI() {
  return get(blogApi, "/api/admin/blogs");
}

export function createBlogAPI(payload) {
  return post(blogApi, "/api/admin/blogs", payload);
}

export function updateBlogAPI(id, payload) {
  return put(blogApi, `/api/admin/blogs/${id}`, payload);
}

export function deleteBlogAPI(id) {
  return remove(blogApi, `/api/admin/blogs/${id}`);
}

export function getAdminContactsAPI() {
  return get(blogApi, "/api/admin/contacts");
}

export function markContactReadAPI(id) {
  return patch(blogApi, `/api/admin/contacts/${id}/read`, {});
}

export default api;
