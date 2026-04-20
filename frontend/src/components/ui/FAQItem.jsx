import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-base font-medium text-secondary">{question}</span>
        {open ? <FiChevronUp size={18} className="text-gray-500 shrink-0" /> : <FiChevronDown size={18} className="text-gray-500 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-4 text-sm text-gray-600 leading-7">{answer}</div>
      )}
    </div>
  );
}
