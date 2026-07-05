"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

type LoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const loginStyles = `
.login-page {
  min-height: 100vh;
  color: var(--text-main);
  background:
    radial-gradient(circle at 12% 12%, rgba(46, 217, 179, 0.10), transparent 30%),
    radial-gradient(circle at 86% 16%, rgba(245, 158, 11, 0.08), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.login-header {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid rgba(226, 232, 240, 0.78);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
}

.login-header-inner {
  min-height: 74px;
}

.login-logo-card {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.login-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-soft-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: #ffffff;
  padding-inline: 17px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(24, 33, 63, 0.04);
  transition:
    transform 220ms var(--ease-premium),
    border-color 220ms var(--ease-premium),
    color 220ms var(--ease-premium),
    box-shadow 220ms var(--ease-premium);
}

.login-soft-button:hover {
  transform: translateY(-2px);
  border-color: var(--mint);
  color: var(--mint-hover);
  box-shadow: 0 14px 28px rgba(24, 33, 63, 0.08);
}

.login-dark-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--primary);
  border-radius: 15px;
  background: var(--primary);
  padding-inline: 18px;
  color: #ffffff !important;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 12px 28px rgba(24, 33, 63, 0.16);
  transition:
    transform 220ms var(--ease-premium),
    border-color 220ms var(--ease-premium),
    background 220ms var(--ease-premium),
    color 220ms var(--ease-premium),
    box-shadow 220ms var(--ease-premium);
}

.login-dark-button:hover {
  transform: translateY(-2px);
  border-color: var(--mint);
  background: var(--navy-soft);
  color: var(--mint) !important;
  box-shadow: 0 16px 34px rgba(24, 33, 63, 0.20);
}

.login-shell {
  padding-block: 42px 70px;
}

.login-layout {
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 80px rgba(24, 33, 63, 0.09);
}

.login-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 100%;
  background:
    radial-gradient(circle at 20% 18%, rgba(46, 217, 179, 0.22), transparent 34%),
    radial-gradient(circle at 82% 82%, rgba(245, 158, 11, 0.14), transparent 34%),
    linear-gradient(145deg, #18213f 0%, #0f172a 100%);
}

.login-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -4;
  opacity: 0.46;
  background-image:
    linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
  background-size: 48px 48px;
}

.login-hero::after {
  content: "";
  position: absolute;
  inset: auto -110px -150px -110px;
  z-index: -3;
  height: 340px;
  background:
    radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.12), transparent 58%),
    radial-gradient(circle at 32% 36%, rgba(46, 217, 179, 0.18), transparent 58%);
  filter: blur(20px);
  animation: loginGlow 7s ease-in-out infinite;
}

.login-orb {
  position: absolute;
  z-index: -2;
  border-radius: 999px;
  filter: blur(36px);
  opacity: 0.76;
  animation: loginOrb 7s ease-in-out infinite;
}

.login-orb.one {
  width: 220px;
  height: 220px;
  top: 8%;
  left: -84px;
  background: rgba(46, 217, 179, 0.20);
}

.login-orb.two {
  width: 170px;
  height: 170px;
  right: -72px;
  bottom: 18%;
  background: rgba(245, 158, 11, 0.13);
  animation-delay: -2.5s;
}

.login-visual {
  position: relative;
  margin-top: 34px;
  min-height: 268px;
}

.login-preview {
  position: relative;
  z-index: 2;
  margin-inline: auto;
  max-width: 320px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.075);
  padding: 18px;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(16px);
  animation: visualFloat 5.8s ease-in-out infinite;
}

.login-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.login-live-badge {
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.14);
  padding: 8px 12px;
  color: var(--mint);
  font-size: 11px;
  font-weight: 900;
}

.login-bars {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.login-bar {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.login-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--mint), rgba(46, 217, 179, 0.20));
  animation: linePulse 2.8s ease-in-out infinite;
}

.login-preview-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.login-preview-stat {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  padding: 12px 8px;
  text-align: center;
}

.login-preview-stat strong {
  display: block;
  color: #ffffff;
  font-family: var(--font-en);
  font-size: 18px;
  font-weight: 900;
}

.login-preview-stat span {
  display: block;
  margin-top: 4px;
  color: var(--text-light);
  font-size: 10px;
  font-weight: 800;
}

.login-wave {
  position: absolute;
  inset-inline: 0;
  bottom: 4px;
  display: flex;
  justify-content: center;
  gap: 13px;
}

.login-wave span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.38);
  animation: dotWave 1.8s ease-in-out infinite;
}

.login-wave span:nth-child(2) { animation-delay: 0.15s; }
.login-wave span:nth-child(3) { animation-delay: 0.30s; }
.login-wave span:nth-child(4) { animation-delay: 0.45s; }
.login-wave span:nth-child(5) { animation-delay: 0.60s; }

.login-feature-list {
  display: grid;
  gap: 12px;
}

.login-feature {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  padding: 12px 14px;
}

.login-feature span {
  color: var(--text-light);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.7;
}

.login-feature strong {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--mint);
  color: var(--primary);
  font-size: 12px;
  font-weight: 900;
}

.login-form-area {
  background:
    radial-gradient(circle at 20% 10%, rgba(46, 217, 179, 0.055), transparent 26%),
    #ffffff;
}

.login-form-card {
  margin-inline: auto;
  max-width: 520px;
}

.login-field {
  display: block;
}

.login-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 9px;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 900;
}

.login-required {
  color: #ef4444;
}

.login-input {
  width: 100%;
  height: 56px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  padding-inline: 16px;
  color: var(--text-main);
  font-size: 14px;
  font-weight: 800;
  outline: none;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
  transition:
    border-color 220ms var(--ease-premium),
    box-shadow 220ms var(--ease-premium),
    background 220ms var(--ease-premium);
}

.login-input::placeholder {
  color: #94a3b8;
  font-weight: 700;
}

.login-input:focus {
  border-color: rgba(46, 217, 179, 0.75);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.13);
}

.login-input:disabled {
  cursor: not-allowed;
  background: #f8fafc;
  color: #94a3b8;
}

.login-input-ltr {
  direction: ltr;
  text-align: left;
}

.login-password-input {
  padding-left: 82px;
}

.login-password-toggle {
  position: absolute;
  left: 10px;
  top: 50%;
  min-width: 58px;
  height: 34px;
  transform: translateY(-50%);
  border: 0;
  border-radius: 12px;
  background: #f8fafc;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 900;
  transition:
    background 200ms var(--ease-premium),
    color 200ms var(--ease-premium);
}

.login-password-toggle:hover {
  background: var(--mint-soft);
  color: var(--mint-hover);
}

.login-password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.login-helper-card {
  border: 1px solid var(--border-soft);
  border-radius: 24px;
  background: var(--bg-soft);
  padding: 16px;
}

.login-footer {
  border-top: 1px solid rgba(226, 232, 240, 0.72);
  background: rgba(255, 255, 255, 0.72);
}

@keyframes loginGlow {
  0%, 100% {
    opacity: 0.72;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-16px) scale(1.04);
  }
}

@keyframes loginOrb {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(18px, -22px, 0) scale(1.05);
  }
}

@keyframes visualFloat {
  0%, 100% {
    transform: translateY(0) rotate(-0.4deg);
  }
  50% {
    transform: translateY(-12px) rotate(0.6deg);
  }
}

@keyframes linePulse {
  0%, 100% {
    width: 40%;
    opacity: 0.76;
  }
  50% {
    width: 88%;
    opacity: 1;
  }
}

@keyframes dotWave {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .login-layout {
    grid-template-columns: 1fr;
  }

  .login-hero {
    min-height: auto;
  }

  .login-visual {
    min-height: 238px;
  }
}

@media (max-width: 768px) {
  .login-shell {
    padding-block: 28px 56px;
  }

  .login-layout {
    border-radius: 24px;
  }

  .login-header-inner {
    min-height: 68px;
  }

  .login-soft-button,
  .login-dark-button {
    min-height: 42px;
    border-radius: 14px;
    padding-inline: 13px;
    font-size: 12px;
  }

  .login-preview {
    max-width: 280px;
  }
}
`;

function MerchantLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/merchant/start";

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const registered = searchParams.get("registered");

    if (registered === "success") {
      setSuccessMessage("تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.");
    }
  }, [searchParams]);

  function updateField<K extends keyof LoginForm>(
    key: K,
    value: LoginForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const email = form.email.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("من فضلك أدخل بريد إلكتروني صحيح.");
      setLoading(false);
      return;
    }

    if (!form.password) {
      setErrorMessage("من فضلك أدخل كلمة المرور.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/merchant/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password: form.password,
          rememberMe: form.rememberMe,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "بيانات الدخول غير صحيحة");
      }

      router.push(next);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تسجيل الدخول"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page" dir="rtl">
      <style>{loginStyles}</style>

      <LoginHeader />

      <main className="section-shell login-shell">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="section-eyebrow mx-auto">دخول التاجر</div>

            <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-5xl">
              أهلاً برجوعك إلى ميزار
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-8 text-[var(--text-body)]">
              ادخل للوحة التحكم وتابع متجرك ومنتجاتك وطلباتك من مكان واحد.
            </p>
          </div>

          <div className="login-layout lg:grid-cols-[0.88fr_1.12fr]">
            <aside className="login-hero p-6 text-white md:p-8 lg:p-10">
              <span className="login-orb one" />
              <span className="login-orb two" />

              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div>
                  <span className="badge-dark border-white/10 bg-white/10 text-white">
                    MIZAR Dashboard
                  </span>

                  <h2 className="mt-6 text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                    رجّع التحكم لتجارتك في ثواني
                  </h2>

                  <p className="mt-4 text-sm font-semibold leading-8 text-[var(--text-light)] md:text-base">
                    تابع الطلبات، حدّث المنتجات، راقب المبيعات، وشارك روابط
                    متجرك من لوحة واحدة واضحة.
                  </p>
                </div>

                <LoginAnimatedVisual />

                <div className="login-feature-list">
                  {[
                    "متابعة الطلبات الجديدة",
                    "إدارة المنتجات والمخزون",
                    "تحليل المبيعات والعملاء",
                    "روابط جاهزة للبيع",
                  ].map((item) => (
                    <div key={item} className="login-feature">
                      <span>{item}</span>
                      <strong>✓</strong>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="login-form-area p-5 md:p-8 lg:p-10">
              <div className="login-form-card">
                <div className="mb-7 flex flex-col gap-4 border-b border-[var(--border-soft)] pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black leading-9 text-[var(--text-main)]">
                      تسجيل الدخول
                    </h2>

                    <p className="mt-1 text-sm font-semibold leading-7 text-[var(--text-muted)]">
                      استخدم بريدك وكلمة المرور الخاصة بحساب التاجر.
                    </p>
                  </div>

                  <Link
                    href="/merchant/register"
                    className="rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-black text-[var(--primary)] transition hover:-translate-y-1 hover:border-[var(--mint)] hover:text-[var(--mint-hover)]"
                  >
                    إنشاء حساب جديد
                  </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {successMessage && (
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black leading-7 text-emerald-700">
                      {successMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-black leading-7 text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  <Field label="البريد الإلكتروني" required>
                    <input
                      className="login-input login-input-ltr"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="merchant@example.com"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="كلمة المرور" required>
                    <PasswordInput
                      value={form.password}
                      show={showPassword}
                      disabled={loading}
                      onToggle={() => setShowPassword((current) => !current)}
                      onChange={(value) => updateField("password", value)}
                    />
                  </Field>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.rememberMe}
                        onChange={(event) =>
                          updateField("rememberMe", event.target.checked)
                        }
                        className="h-5 w-5 accent-[var(--mint)]"
                      />

                      <span className="text-sm font-bold text-[var(--text-body)]">
                        تذكرني على هذا الجهاز
                      </span>
                    </label>

                    <Link
                      href="/contact"
                      className="text-sm font-black text-[var(--mint-hover)] transition hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "جاري تسجيل الدخول..." : "دخول لوحة التحكم"}
                  </button>

                  <div className="login-helper-card">
                    <p className="text-sm font-bold leading-7 text-[var(--text-body)]">
                      ليس لديك حساب تاجر؟{" "}
                      <Link
                        href="/merchant/register"
                        className="font-black text-[var(--mint-hover)] hover:underline"
                      >
                        أنشئ حسابك الآن
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>

      <LoginFooter />
    </div>
  );
}

export default function MerchantLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-soft)]" dir="rtl">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mizar-loader mx-auto" />
              <p className="loader-text">جاري تجهيز صفحة الدخول...</p>
            </div>
          </div>
        </div>
      }
    >
      <MerchantLoginContent />
    </Suspense>
  );
}

function LoginHeader() {
  return (
    <header className="login-header" dir="rtl">
      <div className="section-shell login-header-inner flex items-center justify-between gap-4">
        <Link href="/" className="login-logo-card">
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

        <div className="login-header-actions">
          <Link href="/" className="login-soft-button">
            الرجوع للرئيسية
          </Link>

          <Link href="/merchant/register" className="login-dark-button">
            إنشاء حساب
          </Link>
        </div>
      </div>
    </header>
  );
}

function LoginAnimatedVisual() {
  return (
    <div className="login-visual" aria-hidden="true">
      <div className="login-preview">
        <div className="login-preview-head">
          <div>
            <p className="text-xs font-black text-[var(--text-light)]">
              لوحة التاجر
            </p>

            <p className="mt-1 text-lg font-black leading-7 text-white">
              نشاط اليوم
            </p>
          </div>

          <span className="login-live-badge">Live</span>
        </div>

        <div className="login-bars">
          <div className="login-bar">
            <span />
          </div>

          <div className="login-bar">
            <span style={{ animationDelay: "0.25s" }} />
          </div>

          <div className="login-bar">
            <span style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        <div className="login-preview-grid">
          <div className="login-preview-stat">
            <strong>24</strong>
            <span>طلب</span>
          </div>

          <div className="login-preview-stat">
            <strong>18k</strong>
            <span>مبيعات</span>
          </div>

          <div className="login-preview-stat">
            <strong>7</strong>
            <span>منتجات</span>
          </div>
        </div>
      </div>

      <div className="login-wave">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function LoginFooter() {
  return (
    <footer className="login-footer" dir="rtl">
      <div className="section-shell flex flex-col justify-between gap-4 py-6 text-sm font-bold text-[var(--text-muted)] md:flex-row md:items-center">
        <p>© 2026 MIZAR. جميع الحقوق محفوظة.</p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/terms"
            className="transition hover:text-[var(--mint-hover)]"
          >
            الشروط والأحكام
          </Link>

          <Link
            href="/privacy"
            className="transition hover:text-[var(--mint-hover)]"
          >
            سياسة الخصوصية
          </Link>

          <Link
            href="/contact"
            className="transition hover:text-[var(--mint-hover)]"
          >
            تواصل معنا
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="login-field">
      <span className="login-label">
        {label}
        {required && <span className="login-required">*</span>}
      </span>

      {children}
    </label>
  );
}

function PasswordInput({
  value,
  show,
  disabled,
  onToggle,
  onChange,
}: {
  value: string;
  show: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        className="login-input login-password-input login-input-ltr"
        type={show ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="اكتب كلمة المرور"
        disabled={disabled}
        autoComplete="current-password"
      />

      <button
        type="button"
        onClick={onToggle}
        className="login-password-toggle"
        disabled={disabled}
      >
        {show ? "إخفاء" : "إظهار"}
      </button>
    </div>
  );
}