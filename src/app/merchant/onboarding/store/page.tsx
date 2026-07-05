"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";

type StoreOnboardingForm = {
  storeName: string;
  businessType: string;
  description: string;
  tagline: string;
  contactPhone: string;
  whatsapp: string;
  contactEmail: string;
  city: string;
  area: string;
  address: string;
  logoUrl: string;
  coverUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  websiteUrl: string;
};

const businessTypes = [
  {
    label: "ملابس وأزياء",
    value: "ملابس وأزياء",
    hint: "مقاسات، ألوان، خامات، وجدول مقاسات.",
  },
  {
    label: "عطور وتجميل",
    value: "عطور وتجميل",
    hint: "حجم العبوة، التركيز، نوع الرائحة، والثبات.",
  },
  {
    label: "إكسسوارات",
    value: "إكسسوارات",
    hint: "خامة، لون، مقاس، وستايل.",
  },
  {
    label: "منتجات هاند ميد",
    value: "منتجات هاند ميد",
    hint: "خامة، تخصيص، ومدة التنفيذ.",
  },
  {
    label: "مطعم أو كافيه",
    value: "مطعم أو كافيه",
    hint: "قائمة منتجات، مكونات، أحجام، وملاحظات.",
  },
  {
    label: "إلكترونيات",
    value: "إلكترونيات",
    hint: "ماركة، موديل، ضمان، ومواصفات.",
  },
  {
    label: "منتجات منزلية",
    value: "منتجات منزلية",
    hint: "أبعاد، خامات، ألوان، واستخدام.",
  },
  {
    label: "أخرى",
    value: "أخرى",
    hint: "تصميم عام مناسب لأي نشاط.",
  },
];

const onboardingStyles = `
.store-onboarding-page {
  min-height: 100vh;
  color: var(--text-main);
  background:
    radial-gradient(circle at 14% 12%, rgba(46, 217, 179, 0.12), transparent 30%),
    radial-gradient(circle at 86% 20%, rgba(245, 158, 11, 0.08), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.store-onboarding-header {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid rgba(226, 232, 240, 0.78);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
}

.store-onboarding-card {
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 80px rgba(24, 33, 63, 0.09);
}

.store-onboarding-side {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 100%;
  background:
    radial-gradient(circle at 20% 18%, rgba(46, 217, 179, 0.24), transparent 34%),
    radial-gradient(circle at 82% 82%, rgba(245, 158, 11, 0.14), transparent 34%),
    linear-gradient(145deg, #18213f 0%, #0f172a 100%);
}

.store-onboarding-side::before {
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

.store-onboarding-orb {
  position: absolute;
  z-index: -1;
  border-radius: 999px;
  filter: blur(36px);
  opacity: 0.78;
  animation: storeOrb 7s ease-in-out infinite;
}

.store-onboarding-orb.one {
  width: 230px;
  height: 230px;
  top: 8%;
  left: -88px;
  background: rgba(46, 217, 179, 0.20);
}

.store-onboarding-orb.two {
  width: 170px;
  height: 170px;
  right: -70px;
  bottom: 18%;
  background: rgba(245, 158, 11, 0.13);
  animation-delay: -2.4s;
}

.store-preview {
  margin-top: 34px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.075);
  padding: 18px;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(16px);
  animation: storeFloat 5.8s ease-in-out infinite;
}

.store-preview-cover {
  height: 94px;
  overflow: hidden;
  border-radius: 22px;
  background:
    radial-gradient(circle at 20% 20%, rgba(46, 217, 179, 0.28), transparent 40%),
    linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06));
}

.store-preview-logo {
  display: grid;
  width: 58px;
  height: 58px;
  margin-top: -28px;
  margin-inline-start: 16px;
  place-items: center;
  border: 4px solid rgba(24, 33, 63, 0.8);
  border-radius: 22px;
  background: var(--mint);
  color: var(--primary);
  font-family: var(--font-en);
  font-size: 20px;
  font-weight: 900;
}

.store-template-card {
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: #ffffff;
  padding: 16px;
  transition:
    transform 220ms var(--ease-premium),
    border-color 220ms var(--ease-premium),
    box-shadow 220ms var(--ease-premium),
    background 220ms var(--ease-premium);
}

.store-template-card:hover {
  transform: translateY(-3px);
  border-color: rgba(46, 217, 179, 0.55);
  box-shadow: 0 14px 32px rgba(24, 33, 63, 0.08);
}

.store-template-card.active {
  border-color: var(--mint);
  background: var(--mint-soft);
  box-shadow: 0 14px 32px rgba(46, 217, 179, 0.14);
}

.store-section {
  border: 1px solid #f1f5f9;
  border-radius: 26px;
  background: #ffffff;
  padding: 20px;
}

.store-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-main);
  font-size: 17px;
  font-weight: 900;
  line-height: 1.6;
}

.store-section-title span {
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

.store-section-description {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.8;
}

.store-field {
  display: block;
}

.store-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 9px;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 900;
}

.store-required {
  color: #ef4444;
}

.store-input {
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
    box-shadow 220ms var(--ease-premium);
}

.store-input::placeholder {
  color: #94a3b8;
  font-weight: 700;
}

.store-input:focus {
  border-color: rgba(46, 217, 179, 0.75);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.13);
}

.store-textarea {
  min-height: 120px;
  resize: vertical;
  padding-block: 14px;
}

.store-input-ltr {
  direction: ltr;
  text-align: left;
}

.store-select {
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

.store-footer {
  border-top: 1px solid rgba(226, 232, 240, 0.72);
  background: rgba(255, 255, 255, 0.72);
}

@keyframes storeOrb {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(18px, -22px, 0) scale(1.05); }
}

@keyframes storeFloat {
  0%, 100% { transform: translateY(0) rotate(-0.4deg); }
  50% { transform: translateY(-12px) rotate(0.6deg); }
}

@media (max-width: 768px) {
  .store-onboarding-card {
    border-radius: 24px;
  }

  .store-section {
    border-radius: 22px;
    padding: 16px;
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

export default function StoreOnboardingPage() {
  const [form, setForm] = useState<StoreOnboardingForm>({
    storeName: "",
    businessType: "",
    description: "",
    tagline: "",
    contactPhone: "",
    whatsapp: "",
    contactEmail: "",
    city: "",
    area: "",
    address: "",
    logoUrl: "",
    coverUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    websiteUrl: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  const selectedBusiness = useMemo(() => {
    return businessTypes.find((item) => item.value === form.businessType);
  }, [form.businessType]);

  const storeInitial = useMemo(() => {
    return form.storeName.trim().slice(0, 1).toUpperCase() || "M";
  }, [form.storeName]);

  function updateField<K extends keyof StoreOnboardingForm>(
    key: K,
    value: StoreOnboardingForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateForm() {
    if (!form.storeName.trim()) return "من فضلك أدخل اسم المتجر.";
    if (!form.businessType.trim()) return "من فضلك اختر نوع النشاط.";

    if (!form.description.trim() || form.description.trim().length < 10) {
      return "من فضلك اكتب وصفًا واضحًا للمتجر لا يقل عن 10 أحرف.";
    }

    if (!form.contactPhone.trim()) return "من فضلك أدخل رقم التواصل.";
    if (!form.whatsapp.trim()) return "من فضلك أدخل رقم واتساب.";

    const email = form.contactEmail.trim().toLowerCase();

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "البريد التجاري غير صحيح.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    try {
      const response = await fetch("/api/merchant/store/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          contactPhone: normalizeEgyptianPhone(form.contactPhone),
          whatsapp: normalizeEgyptianPhone(form.whatsapp),
          contactEmail: form.contactEmail.trim().toLowerCase(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "تعذر إعداد المتجر. راجع البيانات وحاول مرة أخرى."
        );
      }

      setMessage("تم إعداد المتجر بنجاح. جاري تحويلك إلى لوحة التحكم...");
      setMessageType("success");

      setTimeout(() => {
        window.location.href = data?.redirectTo || "/dashboard";
      }, 750);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء إعداد المتجر."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="store-onboarding-page" dir="rtl">
      <style>{onboardingStyles}</style>

      <header className="store-onboarding-header">
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
            href="/merchant/welcome"
            className="rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-black text-[var(--primary)] transition hover:-translate-y-1 hover:border-[var(--mint)] hover:text-[var(--mint-hover)]"
          >
            الرجوع للترحيب
          </Link>
        </div>
      </header>

      <main className="section-shell py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="section-eyebrow mx-auto">إعداد المتجر</div>

            <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-5xl">
              جهّز متجرك ليظهر للعملاء
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-8 text-[var(--text-body)]">
              اكتب بيانات المتجر الأساسية، وميزار سيختار شكل المتجر المناسب حسب
              نوع نشاطك.
            </p>
          </div>

          <div className="store-onboarding-card grid lg:grid-cols-[0.86fr_1.14fr]">
            <aside className="store-onboarding-side p-6 text-white md:p-8 lg:p-10">
              <span className="store-onboarding-orb one" />
              <span className="store-onboarding-orb two" />

              <div className="relative z-10">
                <span className="badge-dark border-white/10 bg-white/10 text-white">
                  Store Setup
                </span>

                <h2 className="mt-6 text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                  المتجر بيتبني حسب نوع نشاطك
                </h2>

                <p className="mt-4 text-sm font-semibold leading-8 text-[var(--text-light)] md:text-base">
                  لو اخترت ملابس، هنجهز المنتج للمقاسات والألوان. ولو اخترت
                  عطور، هنجهز خصائص الحجم والتركيز ونوع الرائحة.
                </p>

                <div className="store-preview">
                  <div className="store-preview-cover" />
                  <div className="store-preview-logo">{storeInitial}</div>

                  <div className="mt-4">
                    <p className="text-xl font-black text-white">
                      {form.storeName || "اسم المتجر"}
                    </p>
                    <p className="mt-2 text-sm font-bold leading-7 text-[var(--text-light)]">
                      {form.tagline ||
                        selectedBusiness?.hint ||
                        "اختَر نوع النشاط لتهيئة شكل المتجر والمنتجات."}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {["منتجات", "طلبات", "عملاء"].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl bg-white/10 p-3 text-center"
                      >
                        <p className="text-xs font-black text-[var(--text-light)]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "بيانات تظهر للعميل في المتجر.",
                    "تصميم تلقائي حسب النشاط.",
                    "خصائص منتجات مناسبة لنوع التجارة.",
                    "بعدها تدخل لوحة التحكم مباشرة.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-sm font-bold text-[var(--text-light)]">
                        {item}
                      </span>
                      <strong className="grid h-6 w-6 place-items-center rounded-full bg-[var(--mint)] text-xs font-black text-[var(--primary)]">
                        ✓
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="p-5 md:p-7 lg:p-9">
              <form onSubmit={handleSubmit} className="space-y-5">
                <StoreSection
                  number="01"
                  title="بيانات المتجر الأساسية"
                  description="هذه البيانات ستظهر للعملاء في صفحة المتجر."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="اسم المتجر" required>
                      <input
                        value={form.storeName}
                        onChange={(event) =>
                          updateField("storeName", event.target.value)
                        }
                        className="store-input"
                        placeholder="مثال: Cairo Fashion"
                      />
                    </Field>

                    <Field label="نوع النشاط" required>
                      <select
                        value={form.businessType}
                        onChange={(event) =>
                          updateField("businessType", event.target.value)
                        }
                        className="store-input store-select"
                      >
                        <option value="">اختر نوع النشاط</option>
                        {businessTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="وصف المتجر" required>
                      <textarea
                        value={form.description}
                        onChange={(event) =>
                          updateField("description", event.target.value)
                        }
                        className="store-input store-textarea"
                        placeholder="اكتب وصفًا مختصرًا يوضح ماذا يبيع متجرك ولماذا يشتري العملاء منك."
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="جملة قصيرة تحت اسم المتجر">
                      <input
                        value={form.tagline}
                        onChange={(event) =>
                          updateField("tagline", event.target.value)
                        }
                        className="store-input"
                        placeholder="مثال: أزياء عصرية بجودة عالية"
                      />
                    </Field>
                  </div>
                </StoreSection>

                <StoreSection
                  number="02"
                  title="نوع النشاط وتجربة المنتجات"
                  description="اختيارك هنا سيحدد شكل المتجر وحقول المنتجات المناسبة."
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    {businessTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateField("businessType", type.value)}
                        className={`store-template-card text-right ${
                          form.businessType === type.value ? "active" : ""
                        }`}
                      >
                        <p className="text-sm font-black text-[var(--text-main)]">
                          {type.label}
                        </p>
                        <p className="mt-2 text-xs font-bold leading-6 text-[var(--text-muted)]">
                          {type.hint}
                        </p>
                      </button>
                    ))}
                  </div>
                </StoreSection>

                <StoreSection
                  number="03"
                  title="بيانات التواصل"
                  description="سيستخدمها العميل للتواصل معك وطلب المنتجات."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="رقم التواصل" required>
                      <input
                        value={form.contactPhone}
                        onChange={(event) =>
                          updateField("contactPhone", event.target.value)
                        }
                        className="store-input store-input-ltr"
                        placeholder="01012345678"
                        inputMode="tel"
                      />
                    </Field>

                    <Field label="رقم واتساب" required>
                      <input
                        value={form.whatsapp}
                        onChange={(event) =>
                          updateField("whatsapp", event.target.value)
                        }
                        className="store-input store-input-ltr"
                        placeholder="01012345678"
                        inputMode="tel"
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="البريد التجاري">
                      <input
                        value={form.contactEmail}
                        onChange={(event) =>
                          updateField("contactEmail", event.target.value)
                        }
                        className="store-input store-input-ltr"
                        placeholder="store@example.com"
                        type="email"
                      />
                    </Field>
                  </div>
                </StoreSection>

                <StoreSection
                  number="04"
                  title="الموقع والصور"
                  description="يمكنك ترك الصور والروابط فارغة حاليًا وتعديلها لاحقًا من الإعدادات."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="المدينة">
                      <input
                        value={form.city}
                        onChange={(event) =>
                          updateField("city", event.target.value)
                        }
                        className="store-input"
                        placeholder="القاهرة"
                      />
                    </Field>

                    <Field label="المنطقة">
                      <input
                        value={form.area}
                        onChange={(event) =>
                          updateField("area", event.target.value)
                        }
                        className="store-input"
                        placeholder="مدينة نصر"
                      />
                    </Field>

                    <Field label="العنوان">
                      <input
                        value={form.address}
                        onChange={(event) =>
                          updateField("address", event.target.value)
                        }
                        className="store-input"
                        placeholder="العنوان التفصيلي"
                      />
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="رابط لوجو المتجر">
                      <input
                        value={form.logoUrl}
                        onChange={(event) =>
                          updateField("logoUrl", event.target.value)
                        }
                        className="store-input store-input-ltr"
                        placeholder="https://..."
                      />
                    </Field>

                    <Field label="رابط صورة الغلاف">
                      <input
                        value={form.coverUrl}
                        onChange={(event) =>
                          updateField("coverUrl", event.target.value)
                        }
                        className="store-input store-input-ltr"
                        placeholder="https://..."
                      />
                    </Field>
                  </div>
                </StoreSection>

                <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-soft)] p-5">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((current) => !current)}
                    className="flex w-full items-center justify-between gap-4 text-right"
                  >
                    <span>
                      <span className="block text-base font-black text-[var(--text-main)]">
                        إعدادات متقدمة
                      </span>
                      <span className="mt-1 block text-sm font-bold text-[var(--text-muted)]">
                        روابط السوشيال والموقع الإلكتروني.
                      </span>
                    </span>

                    <span className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-[var(--primary)]">
                      {showAdvanced ? "إخفاء" : "إظهار"}
                    </span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <Field label="Facebook">
                        <input
                          value={form.facebookUrl}
                          onChange={(event) =>
                            updateField("facebookUrl", event.target.value)
                          }
                          className="store-input store-input-ltr"
                          placeholder="https://facebook.com/..."
                        />
                      </Field>

                      <Field label="Instagram">
                        <input
                          value={form.instagramUrl}
                          onChange={(event) =>
                            updateField("instagramUrl", event.target.value)
                          }
                          className="store-input store-input-ltr"
                          placeholder="https://instagram.com/..."
                        />
                      </Field>

                      <Field label="TikTok">
                        <input
                          value={form.tiktokUrl}
                          onChange={(event) =>
                            updateField("tiktokUrl", event.target.value)
                          }
                          className="store-input store-input-ltr"
                          placeholder="https://tiktok.com/@..."
                        />
                      </Field>

                      <Field label="Website">
                        <input
                          value={form.websiteUrl}
                          onChange={(event) =>
                            updateField("websiteUrl", event.target.value)
                          }
                          className="store-input store-input-ltr"
                          placeholder="https://..."
                        />
                      </Field>
                    </div>
                  )}
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
                  {loading ? "جاري إعداد المتجر..." : "إنشاء المتجر والانتقال للوحة التحكم"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

function StoreSection({
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
    <section className="store-section">
      <div className="mb-5">
        <h3 className="store-section-title">
          <span>{number}</span>
          {title}
        </h3>

        <p className="store-section-description">{description}</p>
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
    <label className="store-field">
      <span className="store-label">
        {label}
        {required && <span className="store-required">*</span>}
      </span>

      {children}
    </label>
  );
}

function StoreFooter() {
  return (
    <footer className="store-footer" dir="rtl">
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