"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@mizar.com");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setMessage("من فضلك أدخل البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setMessage(data?.message || "بيانات الدخول غير صحيحة");
        return;
      }

      setSuccess(true);
      setMessage("تم تسجيل الدخول بنجاح. جاري فتح لوحة الإدارة...");

      setTimeout(() => {
        window.location.replace("/admin/testimonials");
      }, 400);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تسجيل الدخول"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] px-5 py-10"
      dir="rtl"
    >
      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Link
              href="/"
              className="font-[var(--font-en)] text-3xl font-black tracking-[-0.05em] text-[var(--primary)]"
            >
              MIZAR
            </Link>

            <h1 className="mt-8 max-w-xl text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-5xl">
              تسجيل دخول إدارة منصة ميزار
            </h1>

            <p className="mt-5 max-w-xl text-base font-medium leading-8 text-[var(--text-body)]">
              هذه الصفحة مخصصة لإدارة منصة ميزار فقط. استخدم بريد الأدمن وكلمة
              المرور الخاصة بإدارة المنصة.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="badge">إدارة آراء التجار</span>
              <span className="badge">رسائل التواصل</span>
              <span className="badge">إدارة المنصة</span>
            </div>
          </div>

          <div className="premium-card p-7 md:p-9">
            <form onSubmit={submitLogin}>
              <span className="mb-5 inline-flex rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-black text-white">
                دخول الأدمن
              </span>

              <h2 className="text-3xl font-black leading-10 text-[var(--text-main)]">
                تسجيل دخول الأدمن
              </h2>

              <p className="mt-3 text-sm font-semibold leading-7 text-[var(--text-muted)]">
                أدخل البريد الإلكتروني وكلمة المرور الخاصة بإدارة منصة ميزار.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                    البريد الإلكتروني
                  </label>

                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="input"
                    type="email"
                    placeholder="admin@mizar.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                    كلمة المرور
                  </label>

                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`mt-5 rounded-2xl border p-4 text-sm font-black leading-7 ${
                    success
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                      : "border-red-500/20 bg-red-500/10 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-6 w-full"
              >
                {loading ? "جاري الدخول..." : "تسجيل الدخول"}
              </button>

              {success && (
                <a href="/admin/testimonials" className="btn-secondary mt-3 w-full">
                  فتح لوحة الإدارة يدويًا
                </a>
              )}

              <Link href="/" className="btn-secondary mt-3 w-full">
                الرجوع للصفحة الرئيسية
              </Link>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}