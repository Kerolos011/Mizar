"use client";

import { type ReactNode } from "react";
import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";

export function PublicPageLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]"
      dir="rtl"
    >
      <PublicHeader />

      <div className="h-[78px]" />

      <main>{children}</main>

      <PublicFooter />
    </div>
  );
}