import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiCopy,
  FiDownload,
  FiEdit2,
  FiFilm,
  FiLoader,
  FiPaperclip,
  FiPlus,
  FiPlayCircle,
  FiRefreshCw,
  FiSend,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  createCourseAPI,
  createLessonAPI,
  createSectionAPI,
  deleteVideoAPI,
  getCategoriesAPI,
  getCourseBySlugAPI,
  getCoursesAPI,
  submitCourseAPI,
  updateCourseAPI,
  updateLessonAPI,
  updateSectionAPI,
  uploadAttachmentAPI,
  uploadLessonVideoAPI,
} from "../../services/api";

const emptyCourseForm = {
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

const LEVEL_LABELS = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const COURSE_STATUS_LABELS = {
  draft: "Nháp",
  pending_review: "Chờ duyệt",
  published: "Đã xuất bản",
  rejected: "Cần chỉnh sửa",
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function formatDuration(seconds) {
  const total = Number(seconds || 0);
  if (!total) return "--";
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

function shortUrl(url) {
  if (!url) return "Chưa có video";
  return url.replace(/^https?:\/\//, "");
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function courseFolderFromSlug(slug) {
  const cleanSlug = slugify(slug || "course") || "course";
  return `${COURSE_VIDEO_ROOT}/${cleanSlug}`;
}

function emptyLessonForm(nextOrder = 1) {
  return {
    title: "",
    video_url: "",
    video_public_id: "",
    video_asset_folder: "",
    duration: 0,
    is_free_preview: false,
    attachmentsText: "",
    order: nextOrder,
  };
}

function parseAttachments(value) {
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

function formatAttachments(attachments) {
  return (attachments || [])
    .map((item) => `${item.name || "Tài liệu"} | ${item.url || ""}`)
    .join("\n");
}

function appendAttachmentLine(current, attachment) {
  const line = `${attachment.name || "Tài liệu"} | ${attachment.url}`;
  return [current, line].filter(Boolean).join("\n");
}

function displayLessonTitle(section, lesson) {
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

export default function CourseManager() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseDetail, setCourseDetail] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [editingCourse, setEditingCourse] = useState(false);
  const [editingCourseForm, setEditingCourseForm] = useState(emptyCourseForm);
  const [sectionForm, setSectionForm] = useState({ title: "", order: 1 });
  const [editingSectionId, setEditingSectionId] = useState("");
  const [editingSectionForm, setEditingSectionForm] = useState({ title: "", order: 1 });
  const [editingLessonId, setEditingLessonId] = useState("");
  const [editingLessonForm, setEditingLessonForm] = useState(emptyLessonForm());
  const [lessonForms, setLessonForms] = useState({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingEditCourse, setSavingEditCourse] = useState(false);
  const [cancelingSubmission, setCancelingSubmission] = useState(false);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingEditSection, setSavingEditSection] = useState(false);
  const [savingEditLesson, setSavingEditLesson] = useState(false);
  const [savingLessonSectionId, setSavingLessonSectionId] = useState("");
  const [uploadingLessonId, setUploadingLessonId] = useState("");
  const [deletingLessonVideoId, setDeletingLessonVideoId] = useState("");
  const [uploadingAttachmentKey, setUploadingAttachmentKey] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const canManage = user?.role === "admin" || user?.role === "instructor";

  async function loadCourses() {
    setLoadingCourses(true);
    try {
      const data = await getCoursesAPI({ manage: true });
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
      setMessageType("error");
      setMessage("Không tải được danh sách khóa học.");
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    loadCourses();
    getCategoriesAPI()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        setCourseForm((current) => ({ ...current, category_id: current.category_id || list[0]?._id || "" }));
      })
      .catch(() => setCategories([]));
  }, []);

  const visibleCourses = useMemo(() => {
    if (user?.role !== "instructor") return courses;
    return courses.filter((course) => course.instructor_id === user._id);
  }, [courses, user]);

  useEffect(() => {
    if (!selectedCourseId && visibleCourses.length) {
      setSelectedCourseId(visibleCourses[0]._id);
    }
  }, [selectedCourseId, visibleCourses]);

  const selectedCourse = useMemo(
    () => visibleCourses.find((course) => course._id === selectedCourseId),
    [selectedCourseId, visibleCourses]
  );

  const selectedCourseFolder = useMemo(() => {
    const folder = courseDetail?.cloudinary_folder || selectedCourse?.cloudinary_folder;
    return folder || (selectedCourse?.slug ? courseFolderFromSlug(selectedCourse.slug) : "");
  }, [courseDetail, selectedCourse]);

  async function loadCourseDetail(course = selectedCourse) {
    if (!course?.slug) {
      setCourseDetail(null);
      return;
    }

    setLoadingDetail(true);
    setMessage("");
    try {
      const data = await getCourseBySlugAPI(course.slug);
      setCourseDetail(data);
      setSectionForm({ title: "", order: (data.sections || []).length + 1 });
      setLessonForms(
        Object.fromEntries(
          (data.sections || []).map((section) => [
            section._id,
            emptyLessonForm((section.lessons || []).length + 1),
          ])
        )
      );
      setEditingSectionId("");
      setEditingLessonId("");
    } catch (err) {
      setCourseDetail(null);
      setMessageType("error");
      setMessage(err.response?.data?.detail || "Không tải được nội dung khóa học.");
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadCourseDetail(selectedCourse);
    // selectedCourse is derived from selectedCourseId and visibleCourses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  async function handleCreateCourse(event) {
    event.preventDefault();
    if (!canManage) return;

    const title = courseForm.title.trim();
    if (!title || !courseForm.category_id) {
      setMessageType("error");
      setMessage("Vui lòng nhập tên khóa học và chọn danh mục.");
      return;
    }

    setSavingCourse(true);
    setMessage("");
    try {
      const slug = courseForm.slug.trim() || slugify(title);
      const cloudinaryFolder = courseForm.cloudinary_folder.trim() || courseFolderFromSlug(slug);
      const created = await createCourseAPI({
        ...courseForm,
        title,
        slug,
        description: courseForm.description.trim() || title,
        thumbnail: courseForm.thumbnail.trim() || null,
        price: Number(courseForm.price || 0),
        instructor_id: user._id,
        status: user?.role === "instructor" ? "draft" : courseForm.status,
        rating: 0,
        total_students: 0,
        cloudinary_folder: cloudinaryFolder,
      });
      setCourseForm({ ...emptyCourseForm, category_id: categories[0]?._id || "" });
      await loadCourses();
      setSelectedCourseId(created._id);
      setMessageType("success");
      setMessage("Đã tạo khóa học nháp. Thêm phần và bài học rồi gửi duyệt khi hoàn tất.");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || err.message || "Tạo khóa học thất bại.");
    } finally {
      setSavingCourse(false);
    }
  }

  function startEditCourse() {
    if (!selectedCourse) return;
    setEditingCourse(true);
    setEditingCourseForm({
      title: selectedCourse.title || "",
      slug: selectedCourse.slug || "",
      description: selectedCourse.description || "",
      thumbnail: selectedCourse.thumbnail || "",
      price: selectedCourse.price || 0,
      category_id: selectedCourse.category_id || categories[0]?._id || "",
      level: selectedCourse.level || "beginner",
      status: selectedCourse.status || "draft",
      cloudinary_folder: selectedCourse.cloudinary_folder || courseFolderFromSlug(selectedCourse.slug),
    });
  }

  async function handleUpdateCourse(event) {
    event.preventDefault();
    if (!canManage || !selectedCourseId) return;

    const title = editingCourseForm.title.trim();
    if (!title || !editingCourseForm.category_id) {
      setMessageType("error");
      setMessage("Vui lòng nhập tên khóa học và chọn danh mục.");
      return;
    }

    setSavingEditCourse(true);
    setMessage("");
    try {
      const payload = {
        ...selectedCourse,
        ...editingCourseForm,
        title,
        slug: editingCourseForm.slug.trim() || slugify(title),
        description: editingCourseForm.description.trim() || title,
        thumbnail: editingCourseForm.thumbnail.trim() || null,
        price: Number(editingCourseForm.price || 0),
        category_id: editingCourseForm.category_id,
        instructor_id: selectedCourse.instructor_id || user._id,
        rating: Number(selectedCourse.rating || 0),
        total_students: Number(selectedCourse.total_students || 0),
      };
      delete payload._id;

      const updated = await updateCourseAPI(selectedCourseId, payload);
      await loadCourses();
      setSelectedCourseId(updated._id || selectedCourseId);
      setEditingCourse(false);
      setMessageType("success");
      setMessage("Đã cập nhật khóa học.");
      await loadCourseDetail({ ...selectedCourse, ...updated, slug: updated.slug || payload.slug });
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || err.message || "Cập nhật khóa học thất bại.");
    } finally {
      setSavingEditCourse(false);
    }
  }

  async function handleCancelCourseSubmission() {
    if (!selectedCourseId || !selectedCourse || user?.role !== "instructor" || selectedCourse.status !== "pending_review") {
      return;
    }

    setCancelingSubmission(true);
    setMessage("");
    try {
      const payload = {
        ...selectedCourse,
        status: "draft",
        instructor_id: selectedCourse.instructor_id || user._id,
        rating: Number(selectedCourse.rating || 0),
        total_students: Number(selectedCourse.total_students || 0),
      };
      delete payload._id;

      const updated = await updateCourseAPI(selectedCourseId, payload);
      await loadCourses();
      setSelectedCourseId(updated._id || selectedCourseId);
      setEditingCourse(false);
      setMessageType("success");
      setMessage("Đã hủy đăng khóa học. Khóa học đã quay về trạng thái nháp.");
      await loadCourseDetail({ ...selectedCourse, ...updated, slug: updated.slug || selectedCourse.slug });
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || err.message || "Hủy đăng khóa học thất bại.");
    } finally {
      setCancelingSubmission(false);
    }
  }

  async function handleSubmitCourseForReview() {
    if (!selectedCourseId || !selectedCourse || user?.role !== "instructor") {
      return;
    }

    if (!sections.length || !lessonCount) {
      setMessageType("error");
      setMessage("Cần thêm phần và bài học trước khi gửi operator duyệt.");
      return;
    }

    const hasEmptySection = sections.some((section) => !(section.lessons || []).length);
    if (hasEmptySection) {
      setMessageType("error");
      setMessage("Mỗi phần cần có ít nhất một bài học trước khi gửi duyệt.");
      return;
    }

    setSubmittingCourse(true);
    setMessage("");
    try {
      let updated;
      try {
        updated = await submitCourseAPI(selectedCourseId);
      } catch (err) {
        if (err.response?.status !== 404) {
          throw err;
        }

        const fallbackPayload = {
          ...selectedCourse,
          status: "pending_review",
          instructor_id: selectedCourse.instructor_id || user._id,
          rating: Number(selectedCourse.rating || 0),
          total_students: Number(selectedCourse.total_students || 0),
        };
        delete fallbackPayload._id;
        updated = await updateCourseAPI(selectedCourseId, fallbackPayload);
      }
      await loadCourses();
      setSelectedCourseId(updated._id || selectedCourseId);
      setEditingCourse(false);
      setMessageType("success");
      setMessage("Đã gửi khóa học cho operator duyệt xuất bản.");
      await loadCourseDetail({ ...selectedCourse, ...updated, slug: updated.slug || selectedCourse.slug });
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || err.message || "Gửi duyệt khóa học thất bại.");
    } finally {
      setSubmittingCourse(false);
    }
  }

  async function handleCreateSection(event) {
    event.preventDefault();
    if (!selectedCourseId) return;

    setSavingSection(true);
    setMessage("");
    try {
      await createSectionAPI(selectedCourseId, {
        course_id: selectedCourseId,
        title: sectionForm.title.trim(),
        order: Number(sectionForm.order || 1),
      });
      await loadCourseDetail();
      setMessageType("success");
      setMessage("Đã thêm phần mới.");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || err.message || "Thêm phần thất bại.");
    } finally {
      setSavingSection(false);
    }
  }

  async function handleCreateLesson(section) {
    const form = lessonForms[section._id] || emptyLessonForm();
    if (!form.title.trim()) {
      setMessageType("error");
      setMessage("Vui lòng nhập tên bài học.");
      return;
    }

    setSavingLessonSectionId(section._id);
    setMessage("");
    try {
      await createLessonAPI(section._id, {
        section_id: section._id,
        course_id: selectedCourseId,
        title: form.title.trim(),
        video_url: form.video_url.trim(),
        video_public_id: form.video_public_id || "",
        video_asset_folder: form.video_asset_folder || selectedCourseFolder || "",
        duration: Number(form.duration || 0),
        is_free_preview: Boolean(form.is_free_preview),
        attachments: parseAttachments(form.attachmentsText),
        order: Number(form.order || 1),
      });
      await loadCourseDetail();
      setMessageType("success");
      setMessage("Đã thêm bài học mới.");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || err.message || "Thêm bài học thất bại.");
    } finally {
      setSavingLessonSectionId("");
    }
  }

  function startEditSection(section) {
    setEditingSectionId(section._id);
    setEditingSectionForm({
      title: section.title || "",
      order: section.order || 1,
    });
  }

  async function handleUpdateSection(sectionId) {
    if (!canManage || !editingSectionForm.title.trim()) return;

    setSavingEditSection(true);
    setMessage("");
    try {
      await updateSectionAPI(sectionId, {
        title: editingSectionForm.title.trim(),
        order: Number(editingSectionForm.order || 1),
      });
      await loadCourseDetail();
      setMessageType("success");
      setMessage("Đã cập nhật phần.");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || err.message || "Cập nhật phần thất bại.");
    } finally {
      setSavingEditSection(false);
    }
  }

  function startEditLesson(lesson) {
    setEditingLessonId(lesson._id);
    setEditingLessonForm({
      title: lesson.title || "",
      video_url: lesson.video_url || "",
      video_public_id: lesson.video_public_id || "",
      video_asset_folder: lesson.video_asset_folder || selectedCourseFolder || "",
      duration: lesson.duration || 0,
      is_free_preview: Boolean(lesson.is_free_preview),
      attachmentsText: formatAttachments(lesson.attachments),
      order: lesson.order || 1,
    });
  }

  async function handleUpdateLesson(lessonId) {
    if (!canManage) {
      setMessageType("error");
      setMessage("Bạn không có quyền chỉnh sửa bài học.");
      return;
    }

    if (!editingLessonForm.title || !editingLessonForm.title.trim()) {
      setMessageType("error");
      setMessage("Vui lòng nhập tên bài học.");
      return;
    }

    setSavingEditLesson(true);
    setMessage("");
    try {
      await updateLessonAPI(lessonId, {
        title: editingLessonForm.title.trim(),
        video_url: editingLessonForm.video_url.trim(),
        video_public_id: editingLessonForm.video_public_id || "",
        video_asset_folder: editingLessonForm.video_asset_folder || selectedCourseFolder || "",
        duration: Number(editingLessonForm.duration || 0),
        is_free_preview: Boolean(editingLessonForm.is_free_preview),
        attachments: parseAttachments(editingLessonForm.attachmentsText),
        order: Number(editingLessonForm.order || 1),
      });
      await loadCourseDetail();
      setMessageType("success");
      setMessage("Đã cập nhật bài học.");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.detail || err.message || "Cập nhật bài học thất bại.");
    } finally {
      setSavingEditLesson(false);
    }
  }

  async function uploadVideoForLesson(lesson, file) {
    if (!file || !lesson?._id) return;
    if (!selectedCourseFolder) {
      setMessageType("error");
      setMessage("Chưa có thư mục Cloudinary cho khóa học.");
      return;
    }

    setUploadingLessonId(lesson._id);
    setMessage("");

    try {
      const upload = await uploadLessonVideoAPI(file, selectedCourseFolder);
      const videoUrl = upload.video_url;
      if (!videoUrl) throw new Error("Cloudinary không trả về video_url");

      const updatedLesson = await updateLessonAPI(lesson._id, {
        video_url: videoUrl,
        video_public_id: upload.public_id || "",
        video_asset_folder: upload.asset_folder || selectedCourseFolder,
        duration: Math.round(upload.duration || lesson.duration || 0),
      });

      setCourseDetail((current) => {
        if (!current) return current;
        return {
          ...current,
          sections: (current.sections || []).map((section) => ({
            ...section,
            lessons: (section.lessons || []).map((item) =>
              item._id === lesson._id ? { ...item, ...updatedLesson } : item
            ),
          })),
        };
      });

      setMessageType("success");
      setMessage(`Đã cập nhật video cho bài "${lesson.title}".`);
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.error || err.response?.data?.detail || err.message || "Tải video lên thất bại.");
    } finally {
      setUploadingLessonId("");
    }
  }

  async function deleteVideoForLesson(lesson) {
    if (!lesson?._id || !lesson.video_url) return;

    setDeletingLessonVideoId(lesson._id);
    setMessage("");
    try {
      if (lesson.video_public_id) {
        await deleteVideoAPI({ public_id: lesson.video_public_id });
      }

      const updatedLesson = await updateLessonAPI(lesson._id, {
        video_url: "",
        video_public_id: "",
        video_asset_folder: selectedCourseFolder || lesson.video_asset_folder || "",
      });

      setCourseDetail((current) => {
        if (!current) return current;
        return {
          ...current,
          sections: (current.sections || []).map((section) => ({
            ...section,
            lessons: (section.lessons || []).map((item) =>
              item._id === lesson._id ? { ...item, ...updatedLesson } : item
            ),
          })),
        };
      });

      setMessageType("success");
      setMessage("Đã xóa video khỏi Cloudinary và bài học.");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.error || err.response?.data?.detail || err.message || "Xóa video thất bại.");
    } finally {
      setDeletingLessonVideoId("");
    }
  }

  async function uploadAttachmentForNewLesson(sectionId, file) {
    if (!file || !sectionId) return;

    setUploadingAttachmentKey(`new-${sectionId}`);
    setMessage("");
    try {
      const upload = await uploadAttachmentAPI(file);
      setLessonForms((current) => {
        const form = current[sectionId] || emptyLessonForm();
        return {
          ...current,
          [sectionId]: {
            ...form,
            attachmentsText: appendAttachmentLine(form.attachmentsText, upload),
          },
        };
      });
      setMessageType("success");
      setMessage(`Đã tải tệp "${upload.name || file.name}" lên.`);
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.error || err.response?.data?.detail || err.message || "Tải tệp đính kèm lên thất bại.");
    } finally {
      setUploadingAttachmentKey("");
    }
  }

  async function uploadAttachmentForEditingLesson(lessonId, file) {
    if (!file || !lessonId) return;

    setUploadingAttachmentKey(`edit-${lessonId}`);
    setMessage("");
    try {
      const upload = await uploadAttachmentAPI(file);
      setEditingLessonForm((current) => ({
        ...current,
        attachmentsText: appendAttachmentLine(current.attachmentsText, upload),
      }));
      setMessageType("success");
      setMessage(`Đã tải tệp "${upload.name || file.name}" lên.`);
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.error || err.response?.data?.detail || err.message || "Tải tệp đính kèm lên thất bại.");
    } finally {
      setUploadingAttachmentKey("");
    }
  }

  function copy(value) {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setMessageType("success");
    setMessage("Đã sao chép đường dẫn video.");
  }

  const sections = courseDetail?.sections || [];
  const lessons = sections.flatMap((section) => section.lessons || []);
  const lessonCount = lessons.length;
  const videoCount = lessons.filter((lesson) => lesson.video_url).length;
  const canSubmitForReview =
    user?.role === "instructor" &&
    selectedCourse &&
    ["draft", "rejected"].includes(selectedCourse.status || "draft");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-gray-500 mt-1">Tạo khóa học, chia phần, thêm bài học và tải video bài học lên Cloudinary.</p>
        </div>

        <button
          type="button"
          onClick={() => loadCourseDetail()}
          disabled={!selectedCourse || loadingDetail}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <FiRefreshCw className={loadingDetail ? "animate-spin" : ""} size={16} />
          Làm mới
        </button>
      </div>

      {message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${messageType === "error" ? "border-red-100 bg-red-50 text-red-600" : "border-green-100 bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleCreateCourse} className="rounded-lg border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">Thêm khóa học</h2>
            <p className="mt-1 text-xs text-gray-500">Khóa học mới của giảng viên sẽ ở trạng thái nháp. Sau khi thêm đủ phần và bài học mới gửi duyệt.</p>
          </div>
          <button disabled={savingCourse || !canManage} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
            {savingCourse ? <FiLoader className="animate-spin" /> : <FiPlus size={16} />}
            Tạo khóa học
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value, slug: courseForm.slug || slugify(e.target.value) })} placeholder="Tên khóa học" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input value={courseForm.slug} onChange={(e) => setCourseForm({ ...courseForm, slug: slugify(e.target.value) })} placeholder="slug" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <select value={courseForm.category_id} onChange={(e) => setCourseForm({ ...courseForm, category_id: e.target.value })} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary">
            <option value="">Chọn danh mục</option>
            {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
          <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary">
            <option value="beginner">Cơ bản</option>
            <option value="intermediate">Trung cấp</option>
            <option value="advanced">Nâng cao</option>
          </select>
          <input type="number" min="0" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} placeholder="Giá" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input value={courseForm.thumbnail} onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })} placeholder="URL ảnh khóa học" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary lg:col-span-2" />
          {user?.role === "admin" && (
            <select value={courseForm.status} onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary">
              <option value="draft">Nháp</option>
              <option value="published">Đã xuất bản</option>
            </select>
          )}
          <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Mô tả khóa học" className="min-h-24 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary lg:col-span-4" />
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-gray-100 bg-white">
          <div className="border-b border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-900">Khóa học của giảng viên</p>
            <p className="mt-1 text-xs text-gray-500">{loadingCourses ? "Đang tải..." : `${visibleCourses.length} khóa học`}</p>
          </div>

          <div className="max-h-[620px] overflow-y-auto p-2">
            {visibleCourses.map((course) => {
              const active = course._id === selectedCourseId;
              return (
                <button key={course._id} type="button" onClick={() => setSelectedCourseId(course._id)} className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${active ? "bg-primary-light text-primary" : "text-gray-700 hover:bg-gray-50"}`}>
                  <span className="block text-sm font-semibold">{course.title}</span>
                  <span className="mt-1 block text-xs text-gray-500">{LEVEL_LABELS[course.level] || course.level} · {formatCurrency(course.price)}</span>
                  <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{COURSE_STATUS_LABELS[course.status] || course.status || "Nháp"}</span>
                </button>
              );
            })}

            {!loadingCourses && visibleCourses.length === 0 && <div className="p-6 text-center text-sm text-gray-500">Chưa có khóa học nào.</div>}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            {selectedCourse ? (
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
              <img src={selectedCourse.thumbnail || "https://placehold.co/160x96?text=Khoa+hoc"} alt={selectedCourse.title} className="h-32 w-full rounded-lg object-cover xl:h-24 xl:w-40" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">{selectedCourse.description}</p>
                  {selectedCourseFolder && (
                    <div className="mt-3 flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                      <FiUploadCloud className="shrink-0 text-primary" size={15} />
                      <p className="truncate text-xs text-gray-600">{selectedCourseFolder}</p>
                      <button type="button" onClick={() => copy(selectedCourseFolder)} className="ml-auto rounded-md p-1.5 text-gray-500 hover:bg-white hover:text-primary" title="Sao chép thư mục"><FiCopy size={14} /></button>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={startEditCourse}
                      disabled={!canManage}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      <FiEdit2 size={16} /> Sửa khóa học
                    </button>
                    {user?.role === "instructor" && ["draft", "rejected"].includes(selectedCourse.status || "draft") && (
                      <button
                        type="button"
                        onClick={handleSubmitCourseForReview}
                        disabled={!canSubmitForReview || submittingCourse}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                        title="Gửi operator duyệt xuất bản"
                      >
                        {submittingCourse ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
                        Gửi duyệt
                      </button>
                    )}
                    {user?.role === "instructor" && selectedCourse.status === "pending_review" && (
                      <button
                        type="button"
                        onClick={handleCancelCourseSubmission}
                        disabled={cancelingSubmission}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {cancelingSubmission ? <FiLoader className="animate-spin" size={16} /> : <FiX size={16} />}
                        Hủy đăng
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center xl:w-72">
                  <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Phần</p><p className="mt-1 text-lg font-bold text-gray-900">{sections.length}</p></div>
                  <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Bài học</p><p className="mt-1 text-lg font-bold text-gray-900">{lessonCount}</p></div>
                  <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Video</p><p className="mt-1 text-lg font-bold text-gray-900">{videoCount}</p></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chọn hoặc tạo một khóa học để quản lý nội dung.</p>
            )}
          </div>

          {selectedCourse && editingCourse && (
            <form onSubmit={handleUpdateCourse} className="rounded-lg border border-gray-100 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Sửa khóa học</h3>
                  <p className="mt-1 text-xs text-gray-500">Cập nhật thông tin khóa học đang chọn.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCourse(false)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600"
                  >
                    <FiX size={16} /> Hủy
                  </button>
                  <button disabled={savingEditCourse || !canManage} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                    {savingEditCourse ? <FiLoader className="animate-spin" /> : <FiCheckCircle size={16} />}
                    Lưu khóa học
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <input value={editingCourseForm.title} onChange={(e) => setEditingCourseForm({ ...editingCourseForm, title: e.target.value, slug: editingCourseForm.slug || slugify(e.target.value) })} placeholder="Tên khóa học" required className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <input value={editingCourseForm.slug} onChange={(e) => setEditingCourseForm({ ...editingCourseForm, slug: slugify(e.target.value) })} placeholder="slug" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <select value={editingCourseForm.category_id} onChange={(e) => setEditingCourseForm({ ...editingCourseForm, category_id: e.target.value })} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select>
                <select value={editingCourseForm.level} onChange={(e) => setEditingCourseForm({ ...editingCourseForm, level: e.target.value })} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="beginner">Cơ bản</option>
                  <option value="intermediate">Trung cấp</option>
                  <option value="advanced">Nâng cao</option>
                </select>
                <input type="number" min="0" value={editingCourseForm.price} onChange={(e) => setEditingCourseForm({ ...editingCourseForm, price: e.target.value })} placeholder="Giá" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <input value={editingCourseForm.thumbnail} onChange={(e) => setEditingCourseForm({ ...editingCourseForm, thumbnail: e.target.value })} placeholder="URL ảnh khóa học" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary lg:col-span-2" />
                {user?.role === "admin" && (
                  <select value={editingCourseForm.status} onChange={(e) => setEditingCourseForm({ ...editingCourseForm, status: e.target.value })} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary">
                    <option value="draft">Nháp</option>
                    <option value="published">Đã xuất bản</option>
                  </select>
                )}
                <textarea value={editingCourseForm.description} onChange={(e) => setEditingCourseForm({ ...editingCourseForm, description: e.target.value })} placeholder="Mô tả khóa học" className="min-h-24 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary lg:col-span-4" />
              </div>
            </form>
          )}

          {selectedCourse && (
            <form onSubmit={handleCreateSection} className="rounded-lg border border-gray-100 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Thêm phần</h3>
                  <p className="mt-1 text-xs text-gray-500">Phần là nhóm bài học trong khóa học đang chọn.</p>
                </div>
                <button disabled={savingSection} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                  {savingSection ? <FiLoader className="animate-spin" /> : <FiPlus size={16} />}
                  Thêm phần
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <input value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} placeholder="Tên phần" required className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <input type="number" min="1" value={sectionForm.order} onChange={(e) => setSectionForm({ ...sectionForm, order: e.target.value })} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            </form>
          )}

          <div className="rounded-lg border border-gray-100 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="font-semibold text-gray-900">Phần và bài học</p>
                <p className="mt-1 text-xs text-gray-500">Thêm bài học trong từng phần, sau đó tải video lên Cloudinary.</p>
              </div>
              {loadingDetail && <span className="inline-flex items-center gap-2 text-sm text-gray-500"><FiLoader className="animate-spin" /> Đang tải</span>}
            </div>

            <div className="divide-y divide-gray-100">
              {!loadingDetail && sections.map((section) => {
                const lessonForm = lessonForms[section._id] || emptyLessonForm();
                const savingLesson = savingLessonSectionId === section._id;
                return (
                  <div key={section._id} className="p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      {editingSectionId === section._id ? (
                        <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_120px_auto]">
                          <input value={editingSectionForm.title} onChange={(e) => setEditingSectionForm({ ...editingSectionForm, title: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                          <input type="number" min="1" value={editingSectionForm.order} onChange={(e) => setEditingSectionForm({ ...editingSectionForm, order: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleUpdateSection(section._id)} disabled={savingEditSection} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Lưu</button>
                            <button type="button" onClick={() => setEditingSectionId("")} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600">Hủy</button>
                          </div>
                        </div>
                      ) : (
                      <>
                      <div>
                        <h3 className="font-semibold text-gray-900">{section.title}</h3>
                        <p className="mt-1 text-xs text-gray-500">{(section.lessons || []).length} bài học</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">Phần {section.order || "-"}</span>
                        <button type="button" onClick={() => startEditSection(section)} disabled={!canManage} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary disabled:opacity-50">Sửa</button>
                      </div>
                      </>
                      )}
                    </div>

                    <div className="mb-4 grid gap-3 rounded-lg bg-gray-50 p-4 lg:grid-cols-[1fr_110px_120px_160px]">
                      <input value={lessonForm.title} onChange={(e) => setLessonForms({ ...lessonForms, [section._id]: { ...lessonForm, title: e.target.value } })} placeholder="Tên bài học" className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                      <input type="number" min="0" value={lessonForm.duration} onChange={(e) => setLessonForms({ ...lessonForms, [section._id]: { ...lessonForm, duration: e.target.value } })} placeholder="Giây" className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                      <input type="number" min="1" value={lessonForm.order} onChange={(e) => setLessonForms({ ...lessonForms, [section._id]: { ...lessonForm, order: e.target.value } })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={lessonForm.is_free_preview} onChange={(e) => setLessonForms({ ...lessonForms, [section._id]: { ...lessonForm, is_free_preview: e.target.checked } })} />
                        Xem thử
                      </label>
                      <input value={lessonForm.video_url} onChange={(e) => setLessonForms({ ...lessonForms, [section._id]: { ...lessonForm, video_url: e.target.value } })} placeholder="URL video nếu có" className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary lg:col-span-3" />
                      <textarea
                        value={lessonForm.attachmentsText}
                        onChange={(e) => setLessonForms({ ...lessonForms, [section._id]: { ...lessonForm, attachmentsText: e.target.value } })}
                        placeholder="Tài liệu đính kèm, mỗi dòng: Tên tài liệu | URL"
                        className="min-h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary lg:col-span-3"
                      />
                      <label className={`inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold ${uploadingAttachmentKey === `new-${section._id}` ? "cursor-wait text-gray-400" : "cursor-pointer text-gray-700 hover:border-primary hover:text-primary"}`}>
                        {uploadingAttachmentKey === `new-${section._id}` ? <FiLoader className="animate-spin" /> : <FiPaperclip size={16} />}
                        {uploadingAttachmentKey === `new-${section._id}` ? "Đang tải lên..." : "Chọn tệp"}
                        <input
                          type="file"
                          disabled={uploadingAttachmentKey === `new-${section._id}` || !canManage}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            uploadAttachmentForNewLesson(section._id, file);
                            event.target.value = "";
                          }}
                          className="hidden"
                        />
                      </label>
                      <button type="button" onClick={() => handleCreateLesson(section)} disabled={savingLesson} className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light disabled:opacity-60">
                        {savingLesson ? <FiLoader className="animate-spin" /> : <FiPlus size={16} />}
                        Thêm bài học
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(section.lessons || []).map((lesson) => {
                        const isUploading = uploadingLessonId === lesson._id;
                        const isDeletingVideo = deletingLessonVideoId === lesson._id;
                        return (
                          <div key={lesson._id} className="grid gap-4 rounded-lg border border-gray-100 p-4 lg:grid-cols-[1fr_300px]">
                            {editingLessonId === lesson._id ? (
                              <div className="min-w-0 space-y-3">
                                <div className="grid gap-3 md:grid-cols-[1fr_110px_110px_140px]">
                                  <input value={editingLessonForm.title} onChange={(e) => setEditingLessonForm({ ...editingLessonForm, title: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                                  <input type="number" min="0" value={editingLessonForm.duration} onChange={(e) => setEditingLessonForm({ ...editingLessonForm, duration: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                                  <input type="number" min="1" value={editingLessonForm.order} onChange={(e) => setEditingLessonForm({ ...editingLessonForm, order: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                                  <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="checkbox" checked={editingLessonForm.is_free_preview} onChange={(e) => setEditingLessonForm({ ...editingLessonForm, is_free_preview: e.target.checked })} />
                                    Xem thử
                                  </label>
                                </div>
                                <input value={editingLessonForm.video_url} onChange={(e) => setEditingLessonForm({ ...editingLessonForm, video_url: e.target.value })} placeholder="URL video" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                                <textarea
                                  value={editingLessonForm.attachmentsText}
                                  onChange={(e) => setEditingLessonForm({ ...editingLessonForm, attachmentsText: e.target.value })}
                                  placeholder="Tài liệu đính kèm, mỗi dòng: Tên tài liệu | URL"
                                  className="min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                                />
                                <label className={`inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold ${uploadingAttachmentKey === `edit-${lesson._id}` ? "cursor-wait text-gray-400" : "cursor-pointer text-gray-700 hover:border-primary hover:text-primary"}`}>
                                  {uploadingAttachmentKey === `edit-${lesson._id}` ? <FiLoader className="animate-spin" /> : <FiPaperclip size={16} />}
                                  {uploadingAttachmentKey === `edit-${lesson._id}` ? "Đang tải lên..." : "Chọn tệp từ máy"}
                                  <input
                                    type="file"
                                    disabled={uploadingAttachmentKey === `edit-${lesson._id}` || !canManage}
                                    onChange={(event) => {
                                      const file = event.target.files?.[0];
                                      uploadAttachmentForEditingLesson(lesson._id, file);
                                      event.target.value = "";
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => handleUpdateLesson(lesson._id)} disabled={savingEditLesson} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Lưu bài học</button>
                                  <button type="button" onClick={() => setEditingLessonId("")} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600">Hủy</button>
                                </div>
                              </div>
                            ) : (
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <FiPlayCircle className="text-primary" size={18} />
                                <p className="font-semibold text-gray-900">{displayLessonTitle(section, lesson)}</p>
                                {lesson.is_free_preview && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Xem thử</span>}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span>Thứ tự {lesson.order || "-"}</span>
                                <span>Thời lượng {formatDuration(lesson.duration)}</span>
                              </div>
                              <div className="mt-3 flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                                {lesson.video_url ? <FiCheckCircle className="shrink-0 text-green-600" size={16} /> : <FiFilm className="shrink-0 text-gray-400" size={16} />}
                                <p className="truncate text-xs text-gray-600">{shortUrl(lesson.video_url)}</p>
                                {lesson.video_url && <button type="button" onClick={() => copy(lesson.video_url)} className="ml-auto rounded-md p-1.5 text-gray-500 hover:bg-white hover:text-primary" title="Sao chép URL"><FiCopy size={14} /></button>}
                              </div>
                              {(lesson.attachments || []).length > 0 && (
                                <div className="mt-3 rounded-lg border border-gray-100 bg-white">
                                  <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
                                    <FiPaperclip size={14} /> Tệp thực hành / mã nguồn
                                  </div>
                                  <div className="divide-y divide-gray-100">
                                    {(lesson.attachments || []).map((attachment, index) => (
                                      <a
                                        key={`${attachment.url || attachment.name}-${index}`}
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-primary"
                                      >
                                        <span className="min-w-0 truncate">{attachment.name || "Tài liệu"}</span>
                                        <FiDownload className="shrink-0" size={14} />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            )}

                            <div className="flex flex-col justify-center gap-2">
                              {editingLessonId !== lesson._id && (
                                <button type="button" onClick={() => startEditLesson(lesson)} disabled={!canManage} className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:opacity-50">
                                  Sửa bài học
                                </button>
                              )}
                              <label className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${isUploading ? "cursor-wait bg-gray-400" : "cursor-pointer bg-primary hover:bg-orange-600"}`}>
                                {isUploading ? <FiLoader className="animate-spin" /> : <FiUploadCloud size={16} />}
                                {isUploading ? "Đang tải lên..." : lesson.video_url ? "Thay video" : "Tải video lên"}
                                <input type="file" accept="video/*" disabled={isUploading || !canManage} onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  uploadVideoForLesson(lesson, file);
                                  event.target.value = "";
                                }} className="hidden" />
                              </label>

                              {lesson.video_url && <a href={lesson.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary">Xem video</a>}
                              {lesson.video_url && (
                                <button
                                  type="button"
                                  onClick={() => deleteVideoForLesson(lesson)}
                                  disabled={isDeletingVideo || !canManage}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                                >
                                  {isDeletingVideo ? <FiLoader className="animate-spin" size={16} /> : <FiX size={16} />}
                                  {isDeletingVideo ? "Đang xóa..." : "Xóa video"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {(section.lessons || []).length === 0 && <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Phần này chưa có bài học.</div>}
                    </div>
                  </div>
                );
              })}

              {!loadingDetail && selectedCourse && sections.length === 0 && <div className="p-8 text-center text-sm text-gray-500">Khóa học này chưa có phần hoặc bài học.</div>}
              {!selectedCourse && <div className="p-8 text-center text-sm text-gray-500">Chưa có khóa học để hiển thị.</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
