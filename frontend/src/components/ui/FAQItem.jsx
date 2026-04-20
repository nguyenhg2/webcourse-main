import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function FAQItem({ question, answer, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);

  return (
    <div className="bg-gray-50 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-7 py-5 flex justify-between items-center gap-4"
      >
        <span
          className={`text-left text-base font-semibold ${
            open ? "text-primary" : "text-secondary"
          }`}
        >
          {question}
        </span>
        {open ? (
          <FiChevronUp size={24} className="text-gray-400 shrink-0" />
        ) : (
          <FiChevronDown size={24} className="text-gray-400 shrink-0" />
        )}
      </button>
      {open && answer && (
        <div className="px-7 pb-5">
          <p className="text-gray-600 text-lg leading-7">{answer}</p>
        </div>
      )}
    </div>
  );
}
