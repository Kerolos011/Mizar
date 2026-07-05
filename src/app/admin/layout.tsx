"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
};

const adminLinks = [
  {
    href: "/admin/testimonials",
    label: "آراء التجار",
  },
  {
    href: "/admin/contact-messages",
    label: "رسائل التواصل",
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  async function loadAdmin() {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/me?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success || !data?.admin) {
        window.location.replace(
          `/admin/login?next=${encodeURIComponent(
            pathname || "/admin/testimonials"
          )}`
        );
        return;
      }

      setAdmin(data.admin);
    } catch {
      window.location.replace(
        `/admin/login?next=${encodeURIComponent(
          pathname || "/admin/testimonials"
        )}`
      );
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.replace("/admin/login");
  }

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    loadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-soft)] p-6" dir="rtl">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="glass-card p-6">
            <div className="skeleton h-8 w-56" />
            <div className="skeleton mt-4 h-4 w-80 max-w-full" />
          </div>

          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
            <div className="glass-card p-5">
              <div className="skeleton h-10 w-full" />
              <div className="skeleton mt-4 h-10 w-full" />
            </div>

            <div className="glass-card p-6">
              <div className="skeleton h-7 w-48" />
              <div className="skeleton mt-5 h-4 w-full" />
              <div className="skeleton mt-3 h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-soft)]" dir="rtl">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <div>
            <Link
              href="/"
              className="font-[var(--font-en)] text-2xl font-black tracking-[-0.04em] text-[var(--primary)]"
            >
              MIZAR
            </Link>

            <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">
              لوحة إدارة منصة ميزار
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--mint-soft)] px-4 py-2 text-sm font-black text-[var(--mint-hover)]">
              {admin.name}
            </span>

            <Link href="/" className="btn-secondary">
              الصفحة الرئيسية
            </Link>

            <button
              onClick={logout}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-500/20"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-3xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="px-3 pb-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
            إدارة المنصة
          </p>

          <nav className="space-y-2">
            {adminLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${
                    active
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--text-body)] hover:bg-[var(--bg-soft)] hover:text-[var(--primary)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}