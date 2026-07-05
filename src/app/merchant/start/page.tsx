"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const startStyles = `
.merchant-start-page {
  min-height: 100vh;
  color: var(--text-main);
  background:
    radial-gradient(circle at 14% 12%, rgba(46, 217, 179, 0.12), transparent 30%),
    radial-gradient(circle at 86% 20%, rgba(245, 158, 11, 0.08), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.merchant-start-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 80px rgba(24, 33, 63, 0.10);
}

.merchant-start-dark {
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  background:
    radial-gradient(circle at 20% 18%, rgba(46, 217, 179, 0.24), transparent 34%),
    radial-gradient(circle at 82% 82%, rgba(245, 158, 11, 0.14), transparent 34%),
    linear-gradient(145deg, #18213f 0%, #0f172a 100%);
}

.merchant-start-dark::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.45;
  background-image:
    linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
  background-size: 48px 48px;
}

.merchant-start-orb {
  position: absolute;
  width: 230px;
  height: 230px;
  left: -80px;
  top: -80px;
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.18);
  filter: blur(36px);
  animation: startFloat 7s ease-in-out infinite;
}

@keyframes startFloat {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(18px, -20px, 0) scale(1.06); }
}
`;

export default function MerchantStartPage() {
  const [errorMessage, setErrorMessage] = useState("");

  async function checkStatus() {
    try {
      const response = await fetch(`/api/merchant/onboarding/status?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/merchant/login?next=/merchant/start";
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "تعذر قراءة حالة الحساب");
      }

      window.location.href = data.redirectTo || "/merchant/welcome";
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تجهيز حسابك"
      );
    }
  }

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="merchant-start-page" dir="rtl">
      <style>{startStyles}</style>

      <main className="section-shell flex min-h-screen items-center justify-center py-10">
        <div className="merchant-start-card mx-auto grid max-w-4xl gap-6 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
          <aside className="merchant-start-dark p-6 text-white md:p-8">
            <span className="merchant-start-orb" />

            <div className="relative z-10">
              <span className="badge-dark border-white/10 bg-white/10 text-white">
                MIZAR
              </span>

              <h1 className="mt-6 text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                بنجهز حسابك الآن
              </h1>

              <p className="mt-4 text-sm font-semibold leading-8 text-[var(--text-light)]">
                هنراجع هل متجرك جاهز، وبعدها هنوجهك للمكان المناسب تلقائيًا.
              </p>
            </div>
          </aside>

          <section className="flex items-center justify-center p-4 md:p-8">
            <div className="w-full text-center">
              {!errorMessage ? (
                <>
                  <div className="mizar-loader mx-auto" />
                  <p className="loader-text">جاري توجيهك...</p>
                </>
              ) : (
                <>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-red-50 text-2xl font-black text-red-600">
                    !
                  </div>

                  <h2 className="mt-5 text-2xl font-black text-[var(--text-main)]">
                    حدث خطأ
                  </h2>

                  <p className="mt-3 text-sm font-bold leading-7 text-red-600">
                    {errorMessage}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={checkStatus}
                      className="btn-primary justify-center"
                    >
                      حاول مرة أخرى
                    </button>

                    <Link href="/" className="btn-secondary justify-center">
                      الرجوع للرئيسية
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}