"use client";

import { useLanguage } from "@/context/LanguageContext";

/**
 * LanguageToggle
 * Renders a segmented flat EN | हिं toggle button.
 * Uses flat navy (#17254A) for the active segment and no gradients.
 */
export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      type="button"
      title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
      aria-label={lang === "en" ? "Switch to Hindi" : "Switch to English"}
      className="
        inline-flex items-center rounded-full border border-[#E5DFD0]
        bg-[#FFFFFF] text-xs font-semibold overflow-hidden
        hover:border-[#CBC3AE] transition-all select-none p-0.5
      "
    >
      <span
        className={`
          px-2.5 py-1 rounded-full transition-colors
          ${lang === "en"
            ? "bg-[#17254A] text-[#FFFFFF]"
            : "text-[#5E5C54] hover:text-[#1C1B18]"}
        `}
      >
        EN
      </span>
      <span
        className={`
          px-2.5 py-1 rounded-full transition-colors
          ${lang === "hi"
            ? "bg-[#17254A] text-[#FFFFFF]"
            : "text-[#5E5C54] hover:text-[#1C1B18]"}
        `}
      >
        हिं
      </span>
    </button>
  );
}
