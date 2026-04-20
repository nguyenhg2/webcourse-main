import { Link } from "react-router-dom";

const CATEGORIES = [
  { name: "Web Development", count: 15 },
  { name: "Python", count: 15 },
  { name: "Mobile App", count: 15 },
  { name: "JavaScript", count: 15 },
  { name: "DevOps & Cloud", count: 15 },
  { name: "Database & Backend", count: 15 },
];

const RECENT_POSTS = [
  {
    title: "Best LearnPress WordPress Theme Collection for 2026",
    image: "https://placehold.co/90x90",
    slug: "best-learnpress-themes",
  },
  {
    title: "Best LearnPress WordPress Theme Collection for 2026",
    image: "https://placehold.co/90x90",
    slug: "best-learnpress-themes-2",
    active: true,
  },
  {
    title: "Best LearnPress WordPress Theme Collection for 2026",
    image: "https://placehold.co/90x90",
    slug: "best-learnpress-themes-3",
  },
];

const TAGS = [
  "Khoa hoc mien phi",
  "Marketing",
  "Idea",
  "LMS",
  "LearnPress",
  "Instructor",
];

export default function BlogSidebar() {
  return (
    <aside className="w-64 shrink-0 flex flex-col gap-7">
      <div className="flex flex-col gap-5">
        <h4 className="font-heading text-secondary text-xl font-semibold capitalize">
          The loai
        </h4>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="flex justify-between items-center">
              <span className="text-secondary text-lg">{cat.name}</span>
              <span className="text-gray-600 text-lg">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="text-secondary text-xl font-semibold">
          Bai dang gan day
        </h4>
        <div className="flex flex-col gap-4">
          {RECENT_POSTS.map((post, i) => (
            <Link
              key={i}
              to={`/blog/${post.slug}`}
              className="flex gap-4 items-start"
            >
              <img
                src={post.image}
                alt={post.title}
                className="size-24 rounded-xl object-cover shrink-0"
              />
              <span
                className={`text-base font-medium leading-6 ${
                  post.active ? "text-primary" : "text-secondary"
                } hover:text-primary transition-colors`}
              >
                {post.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <h4 className="font-heading text-secondary text-xl font-semibold capitalize">
        Tags
      </h4>
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`px-5 py-2 rounded-lg border border-gray-100 text-lg hover:border-primary hover:text-primary transition-colors ${
              tag === "LearnPress"
                ? "bg-gray-50 text-secondary"
                : "text-gray-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </aside>
  );
}
