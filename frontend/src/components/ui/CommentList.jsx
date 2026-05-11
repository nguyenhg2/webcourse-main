export default function CommentList({ comments = [] }) {
  if (comments.length === 0) {
    return <p className="text-sm text-gray-500">Chưa có bình luận.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {comments.map((comment) => (
        <div key={comment._id || comment.id} className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-semibold">
            {(comment.user_name || comment.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-secondary">{comment.user_name || comment.name}</span>
              <span className="text-xs text-gray-500">{comment.created_at || comment.date}</span>
            </div>
            <p className="text-sm text-gray-600 leading-6">{comment.comment || comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
