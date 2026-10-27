"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function DashboardModule({
  title,
  description,
  icon: Icon,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  children,
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      {/* Module Header — clickable to toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center justify-between hover:shadow-lg transition-all duration-300 group"
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`text-xl ${iconColor}`} />
            </div>
          )}
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen ? "bg-blue-600 text-white rotate-0" : "bg-gray-100 text-gray-500 rotate-0"
        }`}>
          {isOpen ? (
            <FaChevronUp className="text-xs" />
          ) : (
            <FaChevronDown className="text-xs" />
          )}
        </div>
      </button>

      {/* Module Content — expands/collapses */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[5000px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        {isOpen && children}
      </div>
    </div>
  );
}