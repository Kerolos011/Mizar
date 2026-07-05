"use client";

import { useEffect, useState } from "react";
import { translations, type Language, type TranslationKey } from "@/lib/i18n";

export function useTranslation() {
  const [language, setLanguage] = useState<Language>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("mizar-language") as Language | null;
    setLanguage(saved || "ar");
  }, []);

  function t(key: TranslationKey) {
    return translations[language][key] || translations.ar[key];
  }

  return {
    language,
    t,
  };
}