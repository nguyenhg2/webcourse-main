import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogsAPI, getCategoriesAPI } from "../../services/api";
import { blogImage } from "../../utils/courseImages";

export default function BlogSidebar() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadSidebar() {
      try {
        const [categoryData, postData] = await Promise.all([getCategoriesAPI(), getBlogsAPI()]);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setPosts(Array.isArray(postData) ? postData.slice(0, 3) : []);
      } catch {
        setCategories([]);
        setPosts([]);
      }
    }

    loadSidebar();
  }, []);

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-7">
      <div className="flex flex-col gap-5">
        <h4 className="font-heading text-secondary text-xl font-semibold">Thể loại</h4>

        <div className="flex flex-col gap-2.5">
          {categories.map((category) => (
            <label key={category._id} className="group flex cursor-pointer items-center gap-2 text-lg text-secondary">
              <input type="checkbox" className="h-4 w-4 accent-primary" />
              <span className="transition-colors group-hover:text-primary">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="text-secondary text-xl font-semibold">Bài đăng gần đây</h4>

        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link key={post._id} to={`/blog/${post.slug}`} className="flex items-start gap-4">
              <img src={blogImage(post)} alt={post.title} className="size-24 shrink-0 rounded-lg object-cover" />
              <span className="text-base font-medium leading-6 text-secondary transition-colors hover:text-primary">
                {post.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
