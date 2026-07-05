"use client";

import { useEffect, useState } from "react";

type TestimonialStatus = "PENDING" | "APPROVED" | "REJECTED";

type Testimonial = {
  id: string;
  name: string;
  businessType?: string | null;
  rating: number;
  message: string;
  status: TestimonialStatus;
  isFeatured: boolean;
  createdAt: string;
  merchant?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
};

const statusLabels: Record<TestimonialStatus, string> = {
  PENDING: "قيد المراجعة",
  APPROVED: "مقبول",
  REJECTED: "مرفوض",
};

const statusClasses: Record<TestimonialStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-700",
  APPROVED: "bg-emerald-500/10 text-emerald-700",
  REJECTED: "bg-red-500/10 text-red-700",
};

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadTestimonials() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/testimonials?scope=all&limit=100&t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "تعذر تحميل آراء التجار");
      }

      setTestimonials(data.testimonials || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل البيانات"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateTestimonial(
    id: string,
    payload: Partial<Pick<Testimonial, "status" | "isFeatured">>
  ) {
    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "تعذر تحديث التعليق");
      }

      await loadTestimonials();
      setMessage("تم تحديث التعليق بنجاح.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء التحديث"
      );
    } finally {
      setSavingId(null);
    }
  }

  async function deleteTestimonial(id: string) {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا التعليق؟");
    if (!confirmed) return;

    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "تعذر حذف التعليق");
      }

      setTestimonials((current) => current.filter((item) => item.id !== id));
      setMessage("تم حذف التعليق بنجاح.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "حدث خطأ أثناء الحذف");
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  return (
    <main className="space-y-6" dir="rtl">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black leading-tight text-[var(--text-main)]">
            إدارة آراء التجار
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-[var(--text-muted)]">
            هذه الصفحة خاصة بإدارة منصة ميزار فقط، لمراجعة تعليقات التجار
            وتحديد ما يظهر في الصفحة الرئيسية.
          </p>
        </div>

        <button onClick={loadTestimonials} className="btn-secondary">
          تحديث البيانات
        </button>
      </section>

      {message && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-4 text-sm font-black leading-7 text-[var(--text-body)]">
          {message}
        </div>
      )}

      {loading ? (
        <section className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card p-6">
              <div className="skeleton h-6 w-48" />
              <div className="skeleton mt-4 h-4 w-full" />
              <div className="skeleton mt-3 h-4 w-3/4" />
            </div>
          ))}
        </section>
      ) : testimonials.length === 0 ? (
        <section className="glass-card p-8 text-center">
          <h2 className="text-xl font-black text-[var(--text-main)]">
            لا توجد تعليقات حتى الآن
          </h2>
          <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">
            عندما يرسل التجار آراءهم ستظهر هنا للمراجعة.
          </p>
        </section>
      ) : (
        <section className="grid gap-5">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="glass-card p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black leading-8 text-[var(--text-main)]">
                      {testimonial.name}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        statusClasses[testimonial.status]
                      }`}
                    >
                      {statusLabels[testimonial.status]}
                    </span>

                    {testimonial.isFeatured && (
                      <span className="rounded-full bg-[var(--mint-soft)] px-3 py-1 text-xs font-black text-[var(--mint-hover)]">
                        ظاهر في الصفحة الرئيسية
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-semibold leading-7 text-[var(--text-muted)]">
                    {testimonial.businessType || "تاجر على ميزار"} —{" "}
                    {testimonial.rating} نجوم
                  </p>

                  {testimonial.merchant?.email && (
                    <p className="mt-1 text-xs font-semibold leading-6 text-[var(--text-muted)]">
                      {testimonial.merchant.email}
                    </p>
                  )}

                  <p className="mt-4 max-w-4xl text-base font-medium leading-9 text-[var(--text-body)]">
                    “{testimonial.message}”
                  </p>

                  <p className="mt-4 text-xs font-bold text-[var(--text-muted)]">
                    تاريخ الإرسال:{" "}
                    {new Date(testimonial.createdAt).toLocaleString("ar-EG")}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                  <button
                    onClick={() =>
                      updateTestimonial(testimonial.id, {
                        status: "APPROVED",
                      })
                    }
                    disabled={savingId === testimonial.id}
                    className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:opacity-60"
                  >
                    قبول
                  </button>

                  <button
                    onClick={() =>
                      updateTestimonial(testimonial.id, {
                        status: "REJECTED",
                        isFeatured: false,
                      })
                    }
                    disabled={savingId === testimonial.id}
                    className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-white transition hover:bg-amber-600 disabled:opacity-60"
                  >
                    رفض
                  </button>

                  <button
                    onClick={() =>
                      updateTestimonial(testimonial.id, {
                        isFeatured: !testimonial.isFeatured,
                        status: testimonial.isFeatured
                          ? testimonial.status
                          : "APPROVED",
                      })
                    }
                    disabled={savingId === testimonial.id}
                    className="rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white transition hover:bg-[var(--navy-soft)] disabled:opacity-60"
                  >
                    {testimonial.isFeatured ? "إخفاء" : "إظهار"}
                  </button>

                  <button
                    onClick={() => deleteTestimonial(testimonial.id)}
                    disabled={savingId === testimonial.id}
                    className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-500/20 disabled:opacity-60"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
