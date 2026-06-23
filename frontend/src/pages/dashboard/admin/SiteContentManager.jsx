import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiEye,
  FiHelpCircle,
  FiHome,
  FiMail,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import { getSiteContentSectionAPI, updateSiteContentSectionAPI } from "../../../services/api";

const SECTION_GROUPS = [
  {
    title: "Trang chủ",
    desc: "Nội dung xuất hiện ở trang đầu tiên người dùng nhìn thấy.",
    items: [
      {
        value: "benefits",
        label: "Lợi ích học tập",
        publicPath: "/",
        surface: "Khối lợi ích dưới danh sách khóa học",
        icon: <FiHome />,
      },
      {
        value: "stats",
        label: "Thống kê nền tảng",
        publicPath: "/",
        surface: "Hero và khối thống kê trang chủ",
        icon: <FiCheckCircle />,
        readonly: true,
      },
    ],
  },
  {
    title: "Hỏi đáp",
    desc: "Các câu hỏi giúp người dùng tự xử lý thắc mắc trước khi liên hệ.",
    items: [
      {
        value: "faqs",
        label: "FAQ chung",
        publicPath: "/faq",
        surface: "Trang câu hỏi thường gặp",
        icon: <FiHelpCircle />,
      },
      {
        value: "course_faqs",
        label: "FAQ khóa học",
        publicPath: "/khoa-hoc/:slug",
        surface: "Tab câu hỏi thường gặp trong chi tiết khóa học",
        icon: <FiHelpCircle />,
      },
    ],
  },
  {
    title: "Liên hệ",
    desc: "Thông tin doanh nghiệp và bản đồ trên trang liên hệ.",
    items: [
      {
        value: "contact_info",
        label: "Thông tin liên hệ",
        publicPath: "/lien-he",
        surface: "Các ô liên hệ và bản đồ",
        icon: <FiMail />,
      },
    ],
  },
];

const SECTIONS = SECTION_GROUPS.flatMap((group) => group.items);

const BENEFIT_ICONS = [
  { value: "monitor", label: "Màn hình" },
  { value: "award", label: "Chứng nhận" },
  { value: "clock", label: "Thời gian" },
  { value: "headphones", label: "Hỗ trợ" },
];

const CONTACT_ICONS = [
  { value: "mail", label: "Email" },
  { value: "phone", label: "Điện thoại" },
  { value: "clock", label: "Thời gian" },
  { value: "map-pin", label: "Địa chỉ" },
];

const DEFAULTS = {
  benefits: {
    title: "Tại sao chọn CodeCamp?",
    subtitle: "Học theo lộ trình rõ ràng, thực hành liên tục và nhận hỗ trợ khi cần.",
    items: [
      {
        icon: "monitor",
        title: "Học mọi lúc",
        desc: "Truy cập khóa học trên nhiều thiết bị.",
        order: 1,
        active: true,
      },
    ],
  },
  stats: {
    items: [
      { icon: "users", value: "0", label: "Học viên", order: 1, active: true },
      { icon: "book", value: "0", label: "Khóa học đã xuất bản", order: 2, active: true },
    ],
  },
  faqs: {
    groups: [
      {
        category: "Chung",
        order: 1,
        active: true,
        items: [
          {
            q: "CodeCamp là gì?",
            a: "Nền tảng học lập trình trực tuyến.",
            order: 1,
            active: true,
          },
        ],
      },
    ],
  },
  course_faqs: {
    items: [
      {
        q: "Khóa học có chứng chỉ không?",
        a: "Có, hệ thống tự tạo chứng chỉ khi học viên hoàn thành 100% tiến độ.",
        order: 1,
        active: true,
      },
    ],
  },
  contact_info: {
    map: {
      address: "Hà Nội, Việt Nam",
      lat: 21.0466213,
      lon: 105.7864498,
      bbox: "105.7814498%2C21.0416213%2C105.7914498%2C21.0516213",
    },
    items: [
      {
        icon: "mail",
        title: "Email",
        content: "support@codecamp.vn",
        order: 1,
        active: true,
      },
    ],
  },
};

function cleanDoc(doc, section) {
  const { _id, section: _section, created_at, updated_at, ...rest } = doc || DEFAULTS[section];
  return rest;
}

function nextOrder(items = []) {
  return items.length ? Math.max(...items.map((item) => Number(item.order || 0))) + 1 : 1;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary ${props.className || ""}`}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-24 w-full resize-y rounded-lg border border-gray-200 px-4 py-3 text-sm leading-6 outline-none focus:border-primary ${props.className || ""}`}
    />
  );
}

function SelectInput({ options, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label = "Hiển thị" }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}

function RemoveButton({ onClick, label = "Xóa" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
    >
      <FiTrash2 size={15} /> {label}
    </button>
  );
}

function EmptyState({ text }) {
  return <div className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">{text}</div>;
}

export default function SiteContentManager() {
  const [section, setSection] = useState("benefits");
  const [content, setContent] = useState(DEFAULTS.benefits);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const activeSection = useMemo(
    () => SECTIONS.find((item) => item.value === section) || SECTIONS[0],
    [section]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");

    getSiteContentSectionAPI(section)
      .then((data) => {
        if (!cancelled) {
          setContent(cleanDoc(data, section));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContent(DEFAULTS[section]);
          setMessage("Chưa tải được dữ liệu hiện tại, đang hiển thị mẫu nội dung.");
          setMessageType("error");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [section]);

  function replaceContent(next) {
    setContent(next);
  }

  function updateField(key, value) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function resetExample() {
    setContent(DEFAULTS[section]);
    setMessage("Đã nạp mẫu nội dung. Kiểm tra lại trước khi lưu.");
    setMessageType("info");
  }

  async function handleSave() {
    if (activeSection.readonly) {
      setMessage("Phần này được hệ thống tự tính, không cần lưu thủ công.");
      setMessageType("info");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const saved = await updateSiteContentSectionAPI(section, content);
      setContent(cleanDoc(saved, section));
      setMessage("Đã lưu nội dung hiển thị cho người dùng.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Không lưu được dữ liệu.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  function renderBenefits() {
    const items = Array.isArray(content.items) ? content.items : [];

    function updateItem(index, key, value) {
      const nextItems = items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item);
      updateField("items", nextItems);
    }

    function addItem() {
      updateField("items", [
        ...items,
        { icon: "monitor", title: "", desc: "", order: nextOrder(items), active: true },
      ]);
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tiêu đề khối">
            <TextInput value={content.title || ""} onChange={(event) => updateField("title", event.target.value)} />
          </Field>
          <Field label="Mô tả ngắn">
            <TextInput value={content.subtitle || ""} onChange={(event) => updateField("subtitle", event.target.value)} />
          </Field>
        </div>

        <ListHeader title="Các lợi ích" onAdd={addItem} addLabel="Thêm lợi ích" />
        {items.length === 0 ? <EmptyState text="Chưa có lợi ích nào." /> : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-100 p-4">
                <div className="grid gap-4 md:grid-cols-[160px_1fr_120px_auto] md:items-end">
                  <Field label="Biểu tượng">
                    <SelectInput options={BENEFIT_ICONS} value={item.icon || "monitor"} onChange={(event) => updateItem(index, "icon", event.target.value)} />
                  </Field>
                  <Field label="Tiêu đề">
                    <TextInput value={item.title || ""} onChange={(event) => updateItem(index, "title", event.target.value)} />
                  </Field>
                  <Field label="Thứ tự">
                    <TextInput type="number" min="1" value={item.order || 1} onChange={(event) => updateItem(index, "order", Number(event.target.value))} />
                  </Field>
                  <RemoveButton onClick={() => updateField("items", items.filter((_, itemIndex) => itemIndex !== index))} />
                </div>
                <div className="mt-4">
                  <Field label="Mô tả">
                    <TextArea value={item.desc || ""} onChange={(event) => updateItem(index, "desc", event.target.value)} />
                  </Field>
                </div>
                <div className="mt-3">
                  <Toggle checked={item.active !== false} onChange={(value) => updateItem(index, "active", value)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderFaqGroups() {
    const groups = Array.isArray(content.groups) ? content.groups : [];

    function updateGroup(index, key, value) {
      updateField("groups", groups.map((group, groupIndex) => groupIndex === index ? { ...group, [key]: value } : group));
    }

    function updateQuestion(groupIndex, questionIndex, key, value) {
      const nextGroups = groups.map((group, index) => {
        if (index !== groupIndex) return group;
        const items = Array.isArray(group.items) ? group.items : [];
        return {
          ...group,
          items: items.map((item, itemIndex) => itemIndex === questionIndex ? { ...item, [key]: value } : item),
        };
      });
      updateField("groups", nextGroups);
    }

    function addGroup() {
      updateField("groups", [
        ...groups,
        { category: "", order: nextOrder(groups), active: true, items: [] },
      ]);
    }

    function addQuestion(groupIndex) {
      const nextGroups = groups.map((group, index) => {
        if (index !== groupIndex) return group;
        const items = Array.isArray(group.items) ? group.items : [];
        return {
          ...group,
          items: [...items, { q: "", a: "", order: nextOrder(items), active: true }],
        };
      });
      updateField("groups", nextGroups);
    }

    return (
      <div className="space-y-5">
        <ListHeader title="Nhóm câu hỏi" onAdd={addGroup} addLabel="Thêm nhóm" />
        {groups.length === 0 ? <EmptyState text="Chưa có nhóm câu hỏi nào." /> : (
          groups.map((group, groupIndex) => {
            const questions = Array.isArray(group.items) ? group.items : [];
            return (
              <section key={groupIndex} className="rounded-lg border border-gray-100 p-4">
                <div className="grid gap-4 md:grid-cols-[1fr_120px_auto] md:items-end">
                  <Field label="Tên nhóm">
                    <TextInput value={group.category || ""} onChange={(event) => updateGroup(groupIndex, "category", event.target.value)} />
                  </Field>
                  <Field label="Thứ tự">
                    <TextInput type="number" min="1" value={group.order || 1} onChange={(event) => updateGroup(groupIndex, "order", Number(event.target.value))} />
                  </Field>
                  <RemoveButton onClick={() => updateField("groups", groups.filter((_, index) => index !== groupIndex))} label="Xóa nhóm" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Toggle checked={group.active !== false} onChange={(value) => updateGroup(groupIndex, "active", value)} />
                  <button type="button" onClick={() => addQuestion(groupIndex)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary">
                    <FiPlus size={15} /> Thêm câu hỏi
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {questions.length === 0 ? <EmptyState text="Nhóm này chưa có câu hỏi." /> : questions.map((item, questionIndex) => (
                    <QuestionEditor
                      key={questionIndex}
                      item={item}
                      onChange={(key, value) => updateQuestion(groupIndex, questionIndex, key, value)}
                      onRemove={() => {
                        const nextGroups = groups.map((currentGroup, index) => {
                          if (index !== groupIndex) return currentGroup;
                          return { ...currentGroup, items: questions.filter((_, itemIndex) => itemIndex !== questionIndex) };
                        });
                        updateField("groups", nextGroups);
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    );
  }

  function renderCourseFaqs() {
    const items = Array.isArray(content.items) ? content.items : [];

    function updateItem(index, key, value) {
      updateField("items", items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
    }

    function addItem() {
      updateField("items", [...items, { q: "", a: "", order: nextOrder(items), active: true }]);
    }

    return (
      <div className="space-y-5">
        <ListHeader title="Câu hỏi trong trang chi tiết khóa học" onAdd={addItem} addLabel="Thêm câu hỏi" />
        {items.length === 0 ? <EmptyState text="Chưa có câu hỏi nào." /> : items.map((item, index) => (
          <QuestionEditor
            key={index}
            item={item}
            onChange={(key, value) => updateItem(index, key, value)}
            onRemove={() => updateField("items", items.filter((_, itemIndex) => itemIndex !== index))}
          />
        ))}
      </div>
    );
  }

  function renderContactInfo() {
    const items = Array.isArray(content.items) ? content.items : [];
    const map = content.map || {};

    function updateMap(key, value) {
      updateField("map", { ...map, [key]: value });
    }

    function updateItem(index, key, value) {
      updateField("items", items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
    }

    function addItem() {
      updateField("items", [...items, { icon: "mail", title: "", content: "", order: nextOrder(items), active: true }]);
    }

    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-gray-100 p-4">
          <h3 className="text-base font-bold text-gray-900">Bản đồ</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Địa chỉ">
              <TextInput value={map.address || ""} onChange={(event) => updateMap("address", event.target.value)} />
            </Field>
            <Field label="Vùng bản đồ">
              <TextInput value={map.bbox || ""} onChange={(event) => updateMap("bbox", event.target.value)} />
            </Field>
            <Field label="Vĩ độ">
              <TextInput type="number" step="any" value={map.lat || ""} onChange={(event) => updateMap("lat", Number(event.target.value))} />
            </Field>
            <Field label="Kinh độ">
              <TextInput type="number" step="any" value={map.lon || ""} onChange={(event) => updateMap("lon", Number(event.target.value))} />
            </Field>
          </div>
        </section>

        <ListHeader title="Các ô thông tin liên hệ" onAdd={addItem} addLabel="Thêm thông tin" />
        {items.length === 0 ? <EmptyState text="Chưa có thông tin liên hệ nào." /> : items.map((item, index) => (
          <div key={index} className="rounded-lg border border-gray-100 p-4">
            <div className="grid gap-4 md:grid-cols-[160px_1fr_120px_auto] md:items-end">
              <Field label="Biểu tượng">
                <SelectInput options={CONTACT_ICONS} value={item.icon || "mail"} onChange={(event) => updateItem(index, "icon", event.target.value)} />
              </Field>
              <Field label="Nhãn">
                <TextInput value={item.title || ""} onChange={(event) => updateItem(index, "title", event.target.value)} />
              </Field>
              <Field label="Thứ tự">
                <TextInput type="number" min="1" value={item.order || 1} onChange={(event) => updateItem(index, "order", Number(event.target.value))} />
              </Field>
              <RemoveButton onClick={() => updateField("items", items.filter((_, itemIndex) => itemIndex !== index))} />
            </div>
            <div className="mt-4">
              <Field label="Nội dung">
                <TextInput value={item.content || ""} onChange={(event) => updateItem(index, "content", event.target.value)} />
              </Field>
            </div>
            <div className="mt-3">
              <Toggle checked={item.active !== false} onChange={(value) => updateItem(index, "active", value)} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderStats() {
    const items = Array.isArray(content.items) ? content.items : [];
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
          Số liệu này được lấy trực tiếp từ database, admin không cần nhập tay.
        </div>
        {items.length === 0 ? <EmptyState text="Chưa có dữ liệu thống kê." /> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-100 p-4">
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderEditor() {
    if (loading) return <EmptyState text="Đang tải nội dung..." />;
    if (section === "benefits") return renderBenefits();
    if (section === "faqs") return renderFaqGroups();
    if (section === "course_faqs") return renderCourseFaqs();
    if (section === "contact_info") return renderContactInfo();
    if (section === "stats") return renderStats();
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Quản trị nội dung hiển thị</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Cấu hình nội dung người dùng nhìn thấy</h1>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || activeSection.readonly}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiSave size={16} />
            {saving ? "Đang lưu..." : activeSection.readonly ? "Tự động cập nhật" : "Lưu nội dung"}
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          {SECTION_GROUPS.map((group) => (
            <section key={group.title} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900">{group.title}</h2>
              <p className="mt-1 text-xs leading-5 text-gray-500">{group.desc}</p>
              <div className="mt-4 space-y-2">
                {group.items.map((item) => {
                  const active = item.value === section;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSection(item.value)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                        active ? "border-primary bg-primary-light text-primary" : "border-gray-100 text-gray-700 hover:border-primary/50 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? "bg-white text-primary" : "bg-gray-100 text-gray-500"}`}>
                        {item.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className="block truncate text-xs text-gray-500">{item.publicPath}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </aside>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{activeSection.label}</h2>
                  {activeSection.readonly && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Tự động</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">{activeSection.surface}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1">
                    <FiEye size={13} /> Hiển thị tại {activeSection.publicPath}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={resetExample}
                disabled={loading || activeSection.readonly}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRefreshCw size={15} /> Nạp nội dung mẫu
              </button>
            </div>
          </div>

          <div className="p-5">
            {renderEditor()}
            {message && (
              <p className={`mt-4 text-sm ${
                messageType === "success" ? "text-success" : messageType === "error" ? "text-red-600" : "text-gray-500"
              }`}>
                {message}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ListHeader({ title, onAdd, addLabel }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
      >
        <FiPlus size={15} /> {addLabel}
      </button>
    </div>
  );
}

function QuestionEditor({ item, onChange, onRemove }) {
  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_120px_auto] md:items-end">
        <Field label="Câu hỏi">
          <TextInput value={item.q || ""} onChange={(event) => onChange("q", event.target.value)} />
        </Field>
        <Field label="Thứ tự">
          <TextInput type="number" min="1" value={item.order || 1} onChange={(event) => onChange("order", Number(event.target.value))} />
        </Field>
        <RemoveButton onClick={onRemove} />
      </div>
      <div className="mt-4">
        <Field label="Câu trả lời">
          <TextArea value={item.a || ""} onChange={(event) => onChange("a", event.target.value)} />
        </Field>
      </div>
      <div className="mt-3">
        <Toggle checked={item.active !== false} onChange={(value) => onChange("active", value)} />
      </div>
    </div>
  );
}
