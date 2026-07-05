"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";

type Gender = "MALE" | "FEMALE" | "";

type RegisterForm = {
  firstName: string;
  secondName: string;
  thirdName: string;
  gender: Gender;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  marketingConsent: boolean;
};

const registerStyles = `
.register-page {
  min-height: 100vh;
  color: var(--text-main);
  background:
    radial-gradient(circle at 14% 12%, rgba(46, 217, 179, 0.11), transparent 30%),
    radial-gradient(circle at 86% 20%, rgba(245, 158, 11, 0.08), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.register-header {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid rgba(226, 232, 240, 0.78);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
}

.register-header-inner {
  min-height: 76px;
}

.register-logo-card {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.register-home-button,
.register-login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border-radius: 16px;
  padding-inline: 18px;
  font-size: 14px;
  font-weight: 900;
  transition:
    transform 220ms var(--ease-premium),
    border-color 220ms var(--ease-premium),
    color 220ms var(--ease-premium),
    background 220ms var(--ease-premium),
    box-shadow 220ms var(--ease-premium);
}

.register-home-button {
  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--primary);
  box-shadow: 0 6px 16px rgba(24, 33, 63, 0.04);
}

.register-home-button:hover {
  transform: translateY(-2px);
  border-color: var(--mint);
  color: var(--mint-hover);
  box-shadow: 0 12px 26px rgba(24, 33, 63, 0.08);
}

.register-login-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #ffffff !important;
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.16);
}

.register-login-button:hover {
  transform: translateY(-2px);
  border-color: var(--mint);
  background: var(--navy-soft);
  color: var(--mint) !important;
}

.register-main-card {
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 80px rgba(24, 33, 63, 0.08);
}

.register-side {
  position: relative;
  isolation: isolate;
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 18%, rgba(46, 217, 179, 0.24), transparent 34%),
    radial-gradient(circle at 82% 82%, rgba(245, 158, 11, 0.14), transparent 34%),
    linear-gradient(145deg, #18213f 0%, #0f172a 100%);
}

.register-side::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -3;
  opacity: 0.48;
  background-image:
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 48px 48px;
}

.register-orb {
  position: absolute;
  z-index: -1;
  border-radius: 999px;
  filter: blur(34px);
  opacity: 0.78;
  animation: floatingOrb 7s ease-in-out infinite;
}

.register-orb.one {
  width: 220px;
  height: 220px;
  top: 8%;
  left: -80px;
  background: rgba(46, 217, 179, 0.20);
}

.register-orb.two {
  width: 180px;
  height: 180px;
  right: -70px;
  bottom: 18%;
  background: rgba(245, 158, 11, 0.14);
  animation-delay: -2.4s;
}

.register-visual {
  position: relative;
  margin-top: 34px;
  min-height: 250px;
}

.register-mini-card {
  position: relative;
  z-index: 2;
  margin-inline: auto;
  max-width: 290px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.075);
  padding: 18px;
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(16px);
  animation: visualFloat 5.8s ease-in-out infinite;
}

.register-mini-badge {
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.14);
  padding: 8px 12px;
  color: var(--mint);
  font-size: 11px;
  font-weight: 900;
}

.register-mini-lines {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.register-mini-line {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.register-mini-line span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--mint), rgba(46, 217, 179, 0.22));
  animation: linePulse 2.8s ease-in-out infinite;
}

.register-path {
  position: absolute;
  inset-inline: 0;
  bottom: 4px;
  display: flex;
  justify-content: center;
  gap: 13px;
}

.register-path span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.38);
  animation: dotWave 1.8s ease-in-out infinite;
}

.register-path span:nth-child(2) { animation-delay: 0.15s; }
.register-path span:nth-child(3) { animation-delay: 0.30s; }
.register-path span:nth-child(4) { animation-delay: 0.45s; }
.register-path span:nth-child(5) { animation-delay: 0.60s; }

.register-feature-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  padding: 12px 14px;
}

.register-feature-pill span {
  color: var(--text-light);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.7;
}

.register-feature-pill strong {
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

.register-field {
  display: block;
}

.register-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 9px;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 900;
}

.register-required {
  color: #ef4444;
}

.register-input {
  width: 100%;
  height: 54px;
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

.register-input::placeholder {
  color: #94a3b8;
  font-weight: 700;
}

.register-input:focus {
  border-color: rgba(46, 217, 179, 0.75);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.13);
}

.register-input-ltr {
  direction: ltr;
  text-align: left;
}

.register-password-input {
  padding-left: 82px;
}

.register-select {
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #64748b 50%),
    linear-gradient(135deg, #64748b 50%, transparent 50%);
  background-position:
    left 20px center,
    left 14px center;
  background-size:
    6px 6px,
    6px 6px;
  background-repeat: no-repeat;
}

.register-password-toggle {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  min-width: 58px;
  height: 34px;
  border: 0;
  border-radius: 12px;
  background: #f8fafc;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 900;
}

.register-password-toggle:hover {
  background: var(--mint-soft);
  color: var(--mint-hover);
}

.register-section {
  border: 1px solid #f1f5f9;
  border-radius: 26px;
  background: #ffffff;
  padding: 20px;
}

.register-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-main);
  font-size: 17px;
  font-weight: 900;
  line-height: 1.6;
}

.register-section-title span {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 13px;
  background: var(--mint-soft);
  color: var(--mint-hover);
  font-family: var(--font-en);
  font-size: 13px;
  font-weight: 900;
}

.register-section-description {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.8;
}

.register-footer {
  border-top: 1px solid rgba(226, 232, 240, 0.72);
  background: rgba(255, 255, 255, 0.72);
}

@keyframes floatingOrb {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(18px, -22px, 0) scale(1.05); }
}

@keyframes visualFloat {
  0%, 100% { transform: translateY(0) rotate(-0.4deg); }
  50% { transform: translateY(-12px) rotate(0.6deg); }
}

@keyframes linePulse {
  0%, 100% { width: 38%; opacity: 0.75; }
  50% { width: 86%; opacity: 1; }
}

@keyframes dotWave {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-8px); opacity: 1; }
}

@media (max-width: 768px) {
  .register-main-card {
    border-radius: 24px;
  }

  .register-section {
    border-radius: 22px;
    padding: 16px;
  }

  .register-header-inner {
    min-height: 68px;
  }

  .register-home-button,
  .register-login-button {
    min-height: 42px;
    border-radius: 14px;
    padding-inline: 13px;
    font-size: 12px;
  }
}
`;

function normalizeEgyptianPhone(phone: string) {
  const clean = phone.replace(/\s+/g, "").replace(/-/g, "");

  if (clean.startsWith("+20")) {
    return `0${clean.slice(3)}`;
  }

  if (clean.startsWith("20")) {
    return `0${clean.slice(2)}`;
  }

  return clean;
}

function isValidEgyptianPhone(phone: string) {
  const normalized = normalizeEgyptianPhone(phone);
  return /^01[0125][0-9]{8}$/.test(normalized);
}

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return {
      label: "اكتب كلمة مرور قوية",
      width: "0%",
      barClass: "bg-slate-200",
      textClass: "text-[var(--text-muted)]",
    };
  }

  if (score <= 2) {
    return {
      label: "ضعيفة",
      width: "34%",
      barClass: "bg-red-500",
      textClass: "text-red-600",
    };
  }

  if (score <= 4) {
    return {
      label: "متوسطة",
      width: "68%",
      barClass: "bg-[var(--gold)]",
      textClass: "text-amber-700",
    };
  }

  return {
    label: "قوية",
    width: "100%",
    barClass: "bg-[var(--mint)]",
    textClass: "text-[var(--mint-hover)]",
  };
}

export default function MerchantRegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    secondName: "",
    thirdName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    marketingConsent: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [loading, setLoading] = useState(false);

  const fullName = useMemo(() => {
    return [form.firstName, form.secondName, form.thirdName]
      .map((item) => item.trim())
      .filter(Boolean)
      .join(" ");
  }, [form.firstName, form.secondName, form.thirdName]);

  const passwordStrength = getPasswordStrength(form.password);

  function updateField<K extends keyof RegisterForm>(
    key: K,
    value: RegisterForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateForm() {
    const email = form.email.trim().toLowerCase();
    const phone = normalizeEgyptianPhone(form.phone);

    if (!form.firstName.trim()) return "من فضلك أدخل الاسم الأول.";
    if (!form.secondName.trim()) return "من فضلك أدخل الاسم الثاني.";
    if (!form.thirdName.trim()) return "من فضلك أدخل الاسم الثالث.";
    if (!form.gender) return "من فضلك اختر الجنس.";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "من فضلك أدخل بريد إلكتروني صحيح.";
    }

    if (!isValidEgyptianPhone(phone)) {
      return "من فضلك أدخل رقم هاتف مصري صحيح مثل 01012345678.";
    }

    if (form.password.length < 8) {
      return "كلمة المرور يجب ألا تقل عن 8 أحرف.";
    }

    if (form.password !== form.confirmPassword) {
      return "كلمة المرور وتأكيد كلمة المرور غير متطابقين.";
    }

    if (!form.acceptTerms) {
      return "يجب الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة.";
    }

    return "";
  }

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("info");

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setLoading(true);

    const normalizedPhone = normalizeEgyptianPhone(form.phone);
    const email = form.email.trim().toLowerCase();

    try {
      const response = await fetch("/api/auth/merchant/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          role: "MERCHANT",
          name: fullName,
          firstName: form.firstName.trim(),
          secondName: form.secondName.trim(),
          thirdName: form.thirdName.trim(),
          gender: form.gender,
          email,
          phone: normalizedPhone,
          password: form.password,
          confirmPassword: form.confirmPassword,
          acceptedTerms: form.acceptTerms,
          marketingConsent: form.marketingConsent,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "تعذر إنشاء الحساب. راجع البيانات وحاول مرة أخرى."
        );
      }

      setMessage("تم إنشاء الحساب بنجاح. جاري تجهيز صفحة الترحيب...");
      setMessageType("success");

      setTimeout(() => {
        window.location.href = data?.redirectTo || "/merchant/welcome";
      }, 650);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إنشاء الحساب."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page" dir="rtl">
      <style>{registerStyles}</style>

      <RegisterHeader />

      <main className="section-shell py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="section-eyebrow mx-auto">إنشاء حساب تاجر</div>

            <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-5xl">
              ابدأ رحلتك التجارية مع ميزار
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-8 text-[var(--text-body)]">
              سجّل بياناتك الشخصية أولًا، وبعدها سنساعدك خطوة بخطوة في إعداد
              متجرك.
            </p>
          </div>

          <div className="register-main-card grid lg:grid-cols-[0.86fr_1.14fr]">
            <aside className="register-side p-6 text-white md:p-8 lg:p-10">
              <span className="register-orb one" />
              <span className="register-orb two" />

              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div>
                  <span className="badge-dark border-white/10 bg-white/10 text-white">
                    MIZAR Merchant
                  </span>

                  <h2 className="mt-6 text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                    حسابك أولًا، ثم متجرك خطوة بخطوة
                  </h2>

                  <p className="mt-4 text-sm font-semibold leading-8 text-[var(--text-light)] md:text-base">
                    بعد إنشاء الحساب، ستظهر لك صفحة ترحيبية ثم تبدأ إعداد بيانات
                    متجرك وتصميمه حسب نوع نشاطك.
                  </p>
                </div>

                <RegisterAnimatedVisual />

                <div className="grid gap-3">
                  {[
                    "تسجيل سريع ببيانات التاجر فقط",
                    "صفحة ترحيب قبل إعداد المتجر",
                    "إعداد متجر حسب نوع النشاط",
                    "لوحة تحكم لإدارة المنتجات والعملاء",
                  ].map((item) => (
                    <div key={item} className="register-feature-pill">
                      <span>{item}</span>
                      <strong>✓</strong>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="p-5 md:p-7 lg:p-9">
              <div className="mb-7 flex flex-col gap-4 border-b border-[var(--border-soft)] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black leading-9 text-[var(--text-main)]">
                    بيانات التاجر
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-7 text-[var(--text-muted)]">
                    لا تقلق، بيانات المتجر سنضيفها في الخطوة التالية.
                  </p>
                </div>

                <Link
                  href="/merchant/login"
                  className="rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-black text-[var(--primary)] transition hover:-translate-y-1 hover:border-[var(--mint)] hover:text-[var(--mint-hover)]"
                >
                  لدي حساب بالفعل
                </Link>
              </div>

              <form onSubmit={submitRegister} className="space-y-5">
                <RegisterSection
                  number="01"
                  title="البيانات الشخصية"
                  description="اكتب اسمك ورقم هاتفك بشكل واضح."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="الاسم الأول" required>
                      <input
                        value={form.firstName}
                        onChange={(event) =>
                          updateField("firstName", event.target.value)
                        }
                        className="register-input"
                        placeholder="أحمد"
                        autoComplete="given-name"
                      />
                    </Field>

                    <Field label="الاسم الثاني" required>
                      <input
                        value={form.secondName}
                        onChange={(event) =>
                          updateField("secondName", event.target.value)
                        }
                        className="register-input"
                        placeholder="محمد"
                        autoComplete="additional-name"
                      />
                    </Field>

                    <Field label="الاسم الثالث" required>
                      <input
                        value={form.thirdName}
                        onChange={(event) =>
                          updateField("thirdName", event.target.value)
                        }
                        className="register-input"
                        placeholder="علي"
                        autoComplete="family-name"
                      />
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="الجنس" required>
                      <select
                        value={form.gender}
                        onChange={(event) =>
                          updateField("gender", event.target.value as Gender)
                        }
                        className="register-input register-select"
                      >
                        <option value="">اختر الجنس</option>
                        <option value="MALE">ذكر</option>
                        <option value="FEMALE">أنثى</option>
                      </select>
                    </Field>

                    <Field label="رقم الهاتف المصري" required>
                      <input
                        value={form.phone}
                        onChange={(event) =>
                          updateField("phone", event.target.value)
                        }
                        className="register-input register-input-ltr"
                        placeholder="01012345678"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>
                </RegisterSection>

                <RegisterSection
                  number="02"
                  title="بيانات الدخول"
                  description="استخدم بريدًا صحيحًا وكلمة مرور لا تقل عن 8 أحرف."
                >
                  <Field label="البريد الإلكتروني" required>
                    <input
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      className="register-input register-input-ltr"
                      placeholder="example@email.com"
                      type="email"
                      autoComplete="email"
                    />
                  </Field>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="كلمة المرور" required>
                      <PasswordInput
                        value={form.password}
                        placeholder="اكتب كلمة المرور"
                        show={showPassword}
                        onToggle={() => setShowPassword((current) => !current)}
                        onChange={(value) => updateField("password", value)}
                      />
                    </Field>

                    <Field label="تأكيد كلمة المرور" required>
                      <PasswordInput
                        value={form.confirmPassword}
                        placeholder="أعد كتابة كلمة المرور"
                        show={showConfirmPassword}
                        onToggle={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        onChange={(value) =>
                          updateField("confirmPassword", value)
                        }
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--border-soft)]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.barClass}`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>

                    <p
                      className={`mt-2 text-xs font-black ${passwordStrength.textClass}`}
                    >
                      قوة كلمة المرور: {passwordStrength.label}
                    </p>
                  </div>
                </RegisterSection>

                <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-soft)] p-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.acceptTerms}
                      onChange={(event) =>
                        updateField("acceptTerms", event.target.checked)
                      }
                      className="mt-1 h-5 w-5 accent-[var(--mint)]"
                    />

                    <span className="text-sm font-bold leading-7 text-[var(--text-body)]">
                      أوافق على{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="font-black text-[var(--mint-hover)] hover:underline"
                      >
                        الشروط والأحكام
                      </Link>{" "}
                      وقرأت{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="font-black text-[var(--mint-hover)] hover:underline"
                      >
                        سياسة الخصوصية
                      </Link>
                      .
                    </span>
                  </label>

                  <label className="mt-4 flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.marketingConsent}
                      onChange={(event) =>
                        updateField("marketingConsent", event.target.checked)
                      }
                      className="mt-1 h-5 w-5 accent-[var(--mint)]"
                    />

                    <span className="text-sm font-bold leading-7 text-[var(--text-muted)]">
                      أوافق على استلام تحديثات ونصائح عن تطوير متجري على ميزار.
                    </span>
                  </label>
                </div>

                {message && (
                  <div
                    className={`rounded-3xl border p-4 text-sm font-black leading-7 ${
                      messageType === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : messageType === "error"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-body)]"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب تاجر"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>

      <RegisterFooter />
    </div>
  );
}

function RegisterHeader() {
  return (
    <header className="register-header" dir="rtl">
      <div className="section-shell register-header-inner flex items-center justify-between gap-4">
        <Link href="/" className="register-logo-card">
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

        <div className="flex items-center gap-3">
          <Link href="/" className="register-home-button">
            الرجوع للرئيسية
          </Link>

          <Link href="/merchant/login" className="register-login-button">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </header>
  );
}

function RegisterAnimatedVisual() {
  return (
    <div className="register-visual" aria-hidden="true">
      <div className="register-mini-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-[var(--text-light)]">
              خطوة 1
            </p>
            <p className="mt-1 text-lg font-black leading-7 text-white">
              حساب التاجر
            </p>
          </div>

          <span className="register-mini-badge">Ready</span>
        </div>

        <div className="register-mini-lines">
          <div className="register-mini-line">
            <span />
          </div>
          <div className="register-mini-line">
            <span style={{ animationDelay: "0.25s" }} />
          </div>
          <div className="register-mini-line">
            <span style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
      </div>

      <div className="register-path">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function RegisterFooter() {
  return (
    <footer className="register-footer" dir="rtl">
      <div className="section-shell flex flex-col justify-between gap-4 py-6 text-sm font-bold text-[var(--text-muted)] md:flex-row md:items-center">
        <p>© 2026 MIZAR. جميع الحقوق محفوظة.</p>

        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="transition hover:text-[var(--mint-hover)]">
            الشروط والأحكام
          </Link>
          <Link href="/privacy" className="transition hover:text-[var(--mint-hover)]">
            سياسة الخصوصية
          </Link>
          <Link href="/contact" className="transition hover:text-[var(--mint-hover)]">
            تواصل معنا
          </Link>
        </div>
      </div>
    </footer>
  );
}

function RegisterSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="register-section">
      <div className="mb-5">
        <h3 className="register-section-title">
          <span>{number}</span>
          {title}
        </h3>

        <p className="register-section-description">{description}</p>
      </div>

      {children}
    </section>
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
    <label className="register-field">
      <span className="register-label">
        {label}
        {required && <span className="register-required">*</span>}
      </span>

      {children}
    </label>
  );
}

function PasswordInput({
  value,
  placeholder,
  show,
  onToggle,
  onChange,
}: {
  value: string;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="register-input register-password-input register-input-ltr"
        placeholder={placeholder}
        type={show ? "text" : "password"}
        autoComplete="new-password"
      />

      <button
        type="button"
        onClick={onToggle}
        className="register-password-toggle"
      >
        {show ? "إخفاء" : "إظهار"}
      </button>
    </div>
  );
}