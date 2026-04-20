import { FiCalendar, FiArrowRight } from "react-icons/fi";

const POSTS = [
  {
    id: 1,
    title: "10 xu huong lap trinh web noi bat nam 2026",
    excerpt: "Kham pha nhung cong nghe va framework dang dan dau thi truong...",
    date: "10/04/2026",
    image: "https://placehold.co/400x220/564FFD/fff?text=Blog+1",
    category: "Cong nghe",
  },
  {
    id: 2,
    title: "Huong dan bat dau hoc AI cho nguoi moi",
    excerpt: "Lo trinh hoc tri tue nhan tao tu co ban den ung dung thuc te...",
    date: "08/04/2026",
    image: "https://placehold.co/400x220/FF6636/fff?text=Blog+2",
    category: "AI",
  },
  {
    id: 3,
    title: "5 sai lam thuong gap khi hoc lap trinh",
    excerpt: "Nhung sai lam can tranh de qua trinh hoc hieu qua hon...",
    date: "05/04/2026",
    image: "https://placehold.co/400x220/23BD33/fff?text=Blog+3",
    category: "Kinh nghiem",
  },
];

export default function BlogSection() {
  return (
    <section id="blog" className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-heading text-3xl font-bold text-secondary mb-3">
              Bai viet moi nhat
            </h2>
            <p className="text-gray-500">
              Cap nhat kien thuc va xu huong cong nghe moi
            </p>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Xem tat ca <FiArrowRight size={16} />
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {POSTS.map((post) => (
            <a
              key={post.id}
              href="#"
              className="group bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-5">
                <span className="text-xs font-medium text-primary bg-primary-light px-2 py-1 rounded">
                  {post.category}
                </span>
                <h3 className="font-semibold text-secondary mt-3 mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FiCalendar size={12} />
                  {post.date}
                </div>
              </div>
            </a>
          ))}
        </div>
        <div className="md:hidden text-center mt-8">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary font-medium"
          >
            Xem tat ca <FiArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
