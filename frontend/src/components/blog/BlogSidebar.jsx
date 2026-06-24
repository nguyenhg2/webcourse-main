import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogsAPI } from "../../services/api";
import { blogImage } from "../../utils/courseImages";

export default function BlogSidebar() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadSidebar() {
      try {
        const postData = await getBlogsAPI();
        setPosts(Array.isArray(postData) ? postData.slice(0, 3) : []);
      } catch {
        setPosts([]);
      }
    }

    loadSidebar();
  }, []);

  return (
    <aside className="w-64 shrink-0">
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
