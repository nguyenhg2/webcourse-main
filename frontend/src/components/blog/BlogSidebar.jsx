import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBlogsAPI, getCategoriesAPI } from "../../services/api";

export default function BlogSidebar() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getCategoriesAPI().then(setCategories).catch(() => setCategories([]));
    getBlogsAPI().then((data) => setPosts(data.slice(0, 3))).catch(() => setPosts([]));
  }, []);

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-7">
      <div className="flex flex-col gap-5">
        <h4 className="font-heading text-secondary text-xl font-semibold">Thể loại</h4>
        <div className="flex flex-col gap-2.5">
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-2 text-secondary text-lg">
                <input type="checkbox" className="accent-primary w-4 h-4" />
                <span className="group-hover:text-primary transition-colors">{cat.name}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="text-secondary text-xl font-semibold">Bài đăng gần đây</h4>
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link key={post._id} to={`/blog/${post.slug}`} className="flex gap-4 items-start">
              <img src={post.image || post.thumbnail} alt={post.title} className="size-24 rounded-xl object-cover shrink-0" />
              <span className="text-base font-medium leading-6 text-secondary hover:text-primary transition-colors">
                {post.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
