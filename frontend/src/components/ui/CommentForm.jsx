import { useState } from "react";

export default function CommentForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [save, setSave] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <h3 className="text-secondary text-xl font-semibold">
          De lai binh luan
        </h3>
        <p className="text-gray-600 text-lg">
          Email cua ban se khong duoc hien thi. Cac truong bat buoc duoc danh
          dau *
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-5">
        <input
          type="text"
          placeholder="Ten*"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[200px] h-12 px-4 rounded-lg border border-gray-400 text-lg focus:outline-none focus:border-primary"
        />
        <input
          type="email"
          placeholder="Email*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-[200px] h-12 px-4 rounded-lg border border-gray-400 text-lg focus:outline-none focus:border-primary"
        />
        <textarea
          placeholder="Binh luan"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full h-28 px-4 py-2.5 rounded-lg border border-gray-400 text-lg resize-none focus:outline-none focus:border-primary"
        />
        <label className="w-full flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={save}
            onChange={(e) => setSave(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-gray-600 text-lg">
            Luu ten va email cho lan binh luan tiep theo
          </span>
        </label>
        <button
          type="submit"
          className="h-12 px-6 bg-primary text-white text-lg font-medium rounded-full hover:bg-primary/90 transition-colors"
        >
          Dang binh luan
        </button>
      </form>
    </div>
  );
}
