"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "MERCHANT" | "CUSTOMER";
  firstName?: string | null;
};

const welcomeStyles = `
.welcome-page {
  min-height: 100vh;
  color: var(--text-main);
  background:
    radial-gradient(circle at 14% 12%, rgba(46, 217, 179, 0.13), transparent 30%),
    radial-gradient(circle at 86% 20%, rgba(245, 158, 11, 0.10), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.welcome-header {
  border-bottom: 1px solid rgba(226, 232, 240, 0.78);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
}

.welcome-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 36px;
  background:
    radial-gradient(circle at 18% 20%, rgba(46, 217, 179, 0.13), transparent 32%),
    radial-gradient(circle at 84% 80%, rgba(245, 158, 11, 0.10), transparent 32%),
    #ffffff;
  box-shadow: 0 24px 80px rgba(24, 33, 63, 0.10);
}

.welcome-dark {
  position: relative;
  overflow: hidden;
  border-radius: 32px;
  background:
    radial-gradient(circle at 20% 18%, rgba(46, 217, 179, 0.22), transparent 34%),
    radial-gradient(circle at 82% 82%, rgba(245, 158, 11, 0.14), transparent 34%),
    linear-gradient(145deg, #18213f 0%, #0f172a 100%);
}

.welcome-dark::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.45;
  background-image:
    linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
  background-size: 48px 48px;
}

.welcome-orb {
  position: absolute;
  width: 240px;
  height: 240px;
  left: -80px;
  top: -80px;
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.18);
  filter: blur(36px);
  animation: welcomeFloat 7s ease-in-out infinite;
}

.welcome-step {
  border: 1px solid var(--border-soft);
  border-radius: 24px;
  background: #ffffff;
  padding: 20px;
}

@keyframes welcomeFloat {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(18px, -20px, 0) scale(1.06); }
}
`;

export default function MerchantWelcomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success || !data?.user) {
        window.location.href = "/merchant/login?next=/merchant/welcome";
        return;
      }

      if (data.user.role !== "MERCHANT") {
        window.location.href = "/";
        return;
      }

      setUser(data.user);
    } catch {
      window.location.href = "/merchant/login?next=/merchant/welcome";
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const displayName = user?.firstName || user?.name?.split(" ")[0] || "تاجرنا";

  return (
    <div className="welcome-page" dir="rtl">
      <style>{welcomeStyles}</style>

      <header className="welcome-header">
        <div className="section-shell flex min-h-[76px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="mizar-mark">
              <span className="mizar-mark-text">M</span>
            </span>

            <span>
              <span className="block font-[var(--font-en)] text-xl font-black leading-none tracking-[-0.05em] text-[var(--primary)]">
                MIZAR
              </span>
              <span className="mt-1 block text-xs font-extrabold leading-none text-[var(--mint-hover)]">
                ميزار
              </span>
            </span>
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-black text-[var(--primary)] transition hover:-translate-y-1 hover:border-[var(--mint)] hover:text-[var(--mint-hover)]"
          >
            الرجوع للرئيسية
          </Link>
        </div>
      </header>

      <main className="section-shell py-10 md:py-16">
        <div className="welcome-card mx-auto max-w-5xl p-6 md:p-10">
          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <div className="text-center">
                <div className="mizar-loader mx-auto" />
                <p className="loader-text">جاري تجهيز صفحة الترحيب...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <section>
                <div className="section-eyebrow">مرحبًا بك في ميزار</div>

                <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
                  مرحبًا يا {displayName}
                </h1>

                <p className="mt-6 text-xl font-black leading-10 text-[var(--primary)]">
                  بارك الله لك في رزقك وتجارتك، وجعلها بداية خير ونمو.
                </p>

                <p className="mt-5 max-w-2xl text-base font-semibold leading-9 text-[var(--text-body)]">
                  تم إنشاء حسابك بنجاح. الخطوة التالية هي إعداد بيانات متجرك
                  التي ستظهر للعملاء: اسم المتجر، نوع النشاط، وسائل التواصل،
                  والصور الأساسية.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/merchant/onboarding/store"
                    className="btn-primary justify-center"
                  >
                    ابدأ إعداد متجرك
                  </Link>

                  <Link
  href="/merchant/onboarding/store"
  className="btn-secondary justify-center"
>
  تخطي الترحيب والبدء
</Link>
                </div>
              </section>

              <aside className="welcome-dark p-6 text-white md:p-8">
                <span className="welcome-orb" />

                <div className="relative z-10">
                  <span className="badge-dark border-white/10 bg-white/10 text-white">
                    الخطوة التالية
                  </span>

                  <h2 className="mt-6 text-3xl font-black leading-tight tracking-[-0.04em]">
                    جهّز متجرك ليظهر بشكل احترافي
                  </h2>

                  <div className="mt-7 space-y-4">
                    {[
                      "إضافة اسم المتجر ووصفه.",
                      "اختيار نوع النشاط والتصميم المناسب.",
                      "إضافة وسائل التواصل وصور المتجر.",
                      "الانتقال بعدها لإدارة المنتجات والعملاء.",
                    ].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[rgba(46,217,179,0.16)] font-[var(--font-en)] text-sm font-black text-[var(--mint)]">
                          {index + 1}
                        </span>
                        <span className="text-sm font-bold leading-7 text-[var(--text-light)]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}