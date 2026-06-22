export const emptyCourseForm = {
  title: "",
  slug: "",
  description: "",
  thumbnail: "",
  price: 0,
  category_id: "",
  level: "beginner",
  status: "draft",
  cloudinary_folder: "",
};

const COURSE_VIDEO_ROOT = "codecamp/courses";

export const ATTACHMENT_ACCEPT =
  ".pdf,.zip,.rar,.7z,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.json,.js,.jsx,.ts,.tsx,.html,.css,.py,.java,.c,.cpp,.cs";

export const LEVEL_LABELS = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

export const COURSE_STATUS_LABELS = {
  draft: "Nháp",
  pending_review: "Chờ duyệt",
  published: "Đã xuất bản",
  rejected: "Cần chỉnh sửa",
};

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

export function formatDuration(seconds) {
  const total = Number(seconds || 0);
  if (!total) return "--";
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

export function shortUrl(url) {
  if (!url) return "Chưa có video";
  return url.replace(/^https?:\/\//, "");
}

export function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function courseFolderFromSlug(slug) {
  const cleanSlug = slugify(slug || "course") || "course";
  return `${COURSE_VIDEO_ROOT}/${cleanSlug}`;
}

export function emptyLessonForm(nextOrder = 1) {
  return {
    title: "",
    video_url: "",
    video_public_id: "",
    video_asset_folder: "",
    content: "",
    duration: 0,
    is_free_preview: false,
    attachmentsText: "",
    order: nextOrder,
  };
}

export function parseAttachments(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...urlParts] = line.split("|").map((part) => part.trim());
      const url = urlParts.join("|").trim();
      return url ? { name: name || "Tài liệu", url } : { name: "Tài liệu", url: name };
    })
    .filter((item) => item.url);
}

export function formatAttachments(attachments) {
  return (attachments || [])
    .map((item) => `${item.name || "Tài liệu"} | ${item.url || ""}`)
    .join("\n");
}

export function appendAttachmentLine(current, attachment) {
  const line = `${attachment.name || "Tài liệu"} | ${attachment.url}`;
  return [current, line].filter(Boolean).join("\n");
}

export function displayLessonTitle(section, lesson) {
  const sectionOrder = Number(section?.order || 1);
  const lessonOrder = Number(lesson?.order || 1);
  const cleanTitle = String(lesson?.title || "")
    .replace(/^(Bài|Bai|Lesson)\s+\d+(?:\.\d+)+\s*[-–—:]\s*/i, "")
    .replace(/^(Bài|Bai|Lesson)\s+\d+(?:\.\d+)+\s*/i, "")
    .trim();

  return cleanTitle
    ? `Bài ${sectionOrder}.${lessonOrder} - ${cleanTitle}`
    : `Bài ${sectionOrder}.${lessonOrder}`;
}
