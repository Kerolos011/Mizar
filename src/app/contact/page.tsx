"use client";

import { PublicPageLayout } from "@/components/public/PublicPageLayout";
import { type FormEvent, useState } from "react";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(key: keyof ContactForm, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSent(false);
    setErrorMessage("");

    const payload: ContactForm = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (!payload.name || payload.name.length < 2) {
      setErrorMessage("من فضلك أدخل الاسم بشكل صحيح.");
      return;
    }

    if (!payload.email || !payload.email.includes("@")) {
      setErrorMessage("من فضلك أدخل بريد إلكتروني صحيح.");
      return;
    }

    if (!payload.subject || payload.subject.length < 3) {
      setErrorMessage("من فضلك أدخل موضوع الرسالة.");
      return;
    }

    if (!payload.message || payload.message.length < 10) {
      setErrorMessage("من فضلك اكتب رسالة واضحة لا تقل عن 10 أحرف.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "تعذر إرسال الرسالة");
      }

      setSent(true);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الرسالة"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">تواصل معنا</div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
              خلينا نساعدك تبدأ مع ميزار
            </h1>

            <p className="mt-5 text-lg font-medium leading-9 text-[var(--text-body)]">
              املأ البيانات وسنرد عليك في أقرب وقت لمساعدتك في إنشاء متجرك أو
              اختيار الخطة المناسبة.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <form onSubmit={submitForm} className="premium-card p-7 md:p-8">
              {sent && (
                <div className="mb-6 rounded-2xl border border-[rgba(46,217,179,0.25)] bg-[var(--mint-soft)] p-4 text-sm font-black leading-7 text-[var(--mint-hover)]">
                  تم استلام رسالتك بنجاح. سنقوم بالتواصل معك قريبًا.
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-black leading-7 text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                    الاسم
                  </label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="اكتب اسمك"
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                    البريد الإلكتروني
                  </label>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="name@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                    رقم الهاتف
                  </label>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="01xxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                    اسم النشاط / الشركة
                  </label>
                  <input
                    className="input"
                    value={form.company}
                    onChange={(event) =>
                      updateField("company", event.target.value)
                    }
                    placeholder="اسم المتجر أو النشاط"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                  الموضوع
                </label>
                <input
                  className="input"
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  placeholder="عايز أبدأ متجر / استفسار عن الباقات / دعم"
                  required
                  minLength={3}
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                  الرسالة
                </label>
                <textarea
                  className="input min-h-40 resize-none leading-8"
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  placeholder="اكتب رسالتك هنا..."
                  required
                  minLength={10}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary mt-6 w-full"
              >
                {sending ? "جاري إرسال الرسالة..." : "إرسال الرسالة"}
              </button>
            </form>

            <aside className="space-y-5">
              <div className="dark-section rounded-[2rem] p-7">
                <span className="gold-dot" />

                <h2 className="mt-6 text-3xl font-black leading-tight text-white">
                  بيانات التواصل
                </h2>

                <p className="mt-4 text-base font-medium leading-8 text-[var(--text-light)]">
                  تقدر تتواصل معنا مباشرة من خلال البريد الإلكتروني أو واتساب،
                  وسنساعدك في تجهيز متجرك خطوة بخطوة.
                </p>
              </div>

              <div className="premium-card p-6">
                <p className="text-sm font-black text-[var(--text-muted)]">
                  البريد الإلكتروني
                </p>
                <a
                  href="mailto:support@mizar.eg"
                  className="mt-2 block text-xl font-black text-[var(--primary)]"
                >
                  support@mizar.eg
                </a>
              </div>

              <div className="premium-card p-6">
                <p className="text-sm font-black text-[var(--text-muted)]">
                  واتساب
                </p>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-xl font-black text-[var(--primary)]"
                >
                  تواصل عبر واتساب
                </a>
              </div>

              <div className="premium-card p-6">
                <p className="text-sm font-black text-[var(--text-muted)]">
                  ساعات العمل
                </p>
                <p className="mt-2 text-base font-bold leading-8 text-[var(--text-body)]">
                  من السبت إلى الخميس — 10 صباحًا حتى 6 مساءً
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}