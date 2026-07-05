"use client";

import { useEffect, useState } from "react";

type Language = "ar" | "en";
type Theme = "light" | "dark";

export default function ThemeControls() {
  const [language, setLanguage] = useState<Language>("ar");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("mizar-language") as Language | null;
    const savedTheme = localStorage.getItem("mizar-theme") as Theme | null;

    const initialLanguage = savedLanguage || "ar";
    const initialTheme = savedTheme || "dark";

    document.documentElement.lang = initialLanguage;
    document.documentElement.dir = initialLanguage === "ar" ? "rtl" : "ltr";

    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setLanguage(initialLanguage);
    setTheme(initialTheme);
  }, []);

  function toggleLanguage() {
    const nextLanguage: Language = language === "ar" ? "en" : "ar";

    localStorage.setItem("mizar-language", nextLanguage);

    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";

    window.location.reload();
  }

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    localStorage.setItem("mizar-theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setTheme(nextTheme);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleLanguage}
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
      >
        {language === "ar" ? "EN" : "AR"}
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </div>
  );
}