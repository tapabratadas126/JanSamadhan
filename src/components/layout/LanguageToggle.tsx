"use client";

import { useLanguage } from "@/context/LanguageContext";

/**
 * LanguageToggle
 * Renders a pill-style EN | हि toggle button in the Navbar.
 * Reads and updates the global language context.
 */
export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
      aria-label={lang === "en" ? "Switch to Hindi" : "Switch to English"}
      className="
        inline-flex items-center gap-0 rounded-full border border-gray-200
        bg-white text-xs font-bold overflow-hidden shadow-sm
        hover:shadow-md transition-all select-none
      "
    >
      <span
        className={`
          px-2.5 py-1.5 transition-colors
          ${lang === "en"
            ? "bg-gradient-to-r from-[#14B8A6] to-[#6366F1] text-white"
            : "text-gray-400 hover:text-gray-700"}
        `}
      >
        EN
      </span>
      <span
        className={`
          px-2.5 py-1.5 transition-colors
          ${lang === "hi"
            ? "bg-gradient-to-r from-[#14B8A6] to-[#6366F1] text-white"
            : "text-gray-400 hover:text-gray-700"}
        `}
      >
        हि
      </span>
    </button>
  );
}
