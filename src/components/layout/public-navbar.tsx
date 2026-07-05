"use client";

import Link from "next/link";
import ThemeControls from "@/components/theme-controls";
import { useTranslation } from "@/lib/use-translation";

export default function PublicNavbar() {
  const { t, language } = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_85%,transparent)] backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">

        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)] text-lg font-black text-white shadow-lg">
            M
          </div>

          <div>
            <h1 className="text-lg font-extrabold text-[var(--foreground)]">
              MIZAR
            </h1>

            <p className="text-xs text-[var(--muted-foreground)]">
              {language === "ar"
                ? "منصة التجارة الإلكترونية"
                : "E-Commerce Platform"}
            </p>
          </div>
        </Link>

        {/* Navigation */}

        <nav className="hidden items-center gap-8 lg:flex">

          <Link
            href="/"
            className="font-medium text-[var(--foreground)] transition hover:text-[var(--primary)]"
          >
            {t("navHome")}
          </Link>

          <Link
            href="/pricing"
            className="font-medium text-[var(--foreground)] transition hover:text-[var(--primary)]"
          >
            {t("navPricing")}
          </Link>

          <Link
            href="/features"
            className="font-medium text-[var(--foreground)] transition hover:text-[var(--primary)]"
          >
            {t("navFeatures")}
          </Link>

          <Link
            href="/create-store"
            className="font-medium text-[var(--foreground)] transition hover:text-[var(--primary)]"
          >
            {t("navCreateStore")}
          </Link>

        </nav>

        {/* Actions */}

        <div className="flex items-center gap-3">

          <ThemeControls />

          <Link
            href="/create-store"
            className="btn-primary"
          >
            {t("startFree")}
          </Link>

        </div>

      </div>
    </header>
  );
}