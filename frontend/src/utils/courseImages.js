const COURSE_IMAGES = [
  { keys: ["react", "frontend", "front-end", "javascript", "js", "web"], src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" },
  { keys: ["python", "django", "flask", "ai", "data"], src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" },
  { keys: ["node", "nodejs", "express", "backend", "back-end"], src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80" },
  { keys: ["docker", "devops", "container", "cloud"], src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80" },
  { keys: ["kotlin", "android", "mobile"], src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" },
];

const COURSE_FALLBACKS = [
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
];

const BLOG_IMAGES = [
  { keys: ["ai", "trí tuệ", "tri tue", "data", "dữ liệu", "du lieu"], src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" },
  { keys: ["web", "frontend", "backend", "lập trình", "lap trinh", "code"], src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80" },
  { keys: ["học", "hoc", "online", "khóa học", "khoa hoc"], src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" },
  { keys: ["career", "nghề nghiệp", "nghe nghiep", "phỏng vấn", "phong van"], src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80" },
  { keys: ["team", "startup", "dự án", "du an"], src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80" },
];

const BLOG_FALLBACKS = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
];

const BUNDLED_PLACEHOLDERS = new Set([
  "/images/blog1.png",
  "/images/blog2.png",
  "/images/blog3.png",
  "/images/react.png",
  "/images/python.png",
  "/images/nodejs.png",
  "/images/docker.png",
  "/images/js.png",
  "/images/kotlin.png",
]);

function usableImage(value) {
  if (!value) return "";

  const src = String(value).trim();
  if (!src || src.includes("placehold.co")) return "";
  if (BUNDLED_PLACEHOLDERS.has(src)) return "";

  return src;
}

function textForCourse(course = {}) {
  return [
    course.title,
    course.slug,
    course.category?.name,
    course.category_name,
    course.level,
    course.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function textForBlog(post = {}) {
  return [
    post.title,
    post.slug,
    post.category?.name,
    post.category_name,
    post.excerpt,
    post.content,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function stableIndex(value = "", list) {
  return Array.from(String(value)).reduce((sum, char) => sum + char.charCodeAt(0), 0) % list.length;
}

export function courseImage(course = {}) {
  const existing = usableImage(course.thumbnail || course.image);
  if (existing) return existing;

  const text = textForCourse(course);
  const matched = COURSE_IMAGES.find((item) => item.keys.some((key) => text.includes(key)));
  if (matched) return matched.src;

  return COURSE_FALLBACKS[stableIndex(course._id || course.id || course.slug || course.title, COURSE_FALLBACKS)];
}

export function blogImage(post = {}) {
  const existing = usableImage(post.image || post.thumbnail);
  if (existing) return existing;

  const text = textForBlog(post);
  const matched = BLOG_IMAGES.find((item) => item.keys.some((key) => text.includes(key)));
  if (matched) return matched.src;

  return BLOG_FALLBACKS[stableIndex(post._id || post.id || post.slug || post.title, BLOG_FALLBACKS)];
}
