"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { Lang } from "@/lib/i18n";
import { t, TranslationKey } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  /** Translate a key using the current language. */
  tr: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  toggleLang: () => {},
  tr: (key) => t(key, "en"),
});

const STORAGE_KEY = "jansamadhan_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Persist preference in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === "en" || saved === "hi") setLang(saved);
  }, []);

  function toggleLang() {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "hi" : "en";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  const tr = (key: TranslationKey) => t(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook to access the current language and translate strings. */
export function useLanguage() {
  return useContext(LanguageContext);
}
