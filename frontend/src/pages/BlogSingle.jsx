import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiUser, FiCalendar, FiMessageCircle } from "react-icons/fi";
import Breadcrumb from "../components/layout/Breadcrumb";
import BlogSidebar from "../components/blog/BlogSidebar";
import CommentList from "../components/ui/CommentList";
import CommentForm from "../components/ui/CommentForm";
import { getBlogBySlugAPI } from "../services/api";

export default function BlogSingle() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    getBlogBySlugAPI(slug).then(setPost).catch(() => setPost(null));
  }, [slug]);

  if (!post) {
    return <div className="max-w-322.5 mx-auto px-5 py-20 text-center text-gray-500">Đang tải bài viết...</div>;
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Blog", to: "/blog" }, { label: post.title }]} />
      <div className="max-w-322.5 mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-secondary">{post.title}</h1>
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-2"><FiUser size={14} /> {post.author}</span>
              <span className="flex items-center gap-2"><FiCalendar size={14} /> {post.created_at}</span>
              <span className="flex items-center gap-2"><FiMessageCircle size={14} /> Bình luận</span>
            </div>
            <img src={post.image || post.thumbnail} alt={post.title} className="w-full rounded-xl mt-8" />
            <div className="prose max-w-none mt-8 text-gray-600 leading-8">
              <p>{post.content}</p>
            </div>
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-semibold text-secondary mb-6">Bình luận</h3>
              <CommentList />
              <div className="mt-10">
                <CommentForm />
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </>
  );
}
