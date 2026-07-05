"use client";

import { useEffect, useState } from "react";

type ContactMessageStatus = "NEW" | "READ" | "ARCHIVED";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
};

const statusLabels: Record<ContactMessageStatus, string> = {
  NEW: "جديدة",
  READ: "تمت القراءة",
  ARCHIVED: "مؤرشفة",
};

const statusClasses: Record<ContactMessageStatus, string> = {
  NEW: "bg-emerald-500/10 text-emerald-700",
  READ: "bg-sky-500/10 text-sky-700",
  ARCHIVED: "bg-slate-500/10 text-slate-700",
};

export default function ContactMessagesAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState("");

  async function loadMessages(status = statusFilter) {
    setLoading(true);
    setMessage("");

    try {
      const query = status
        ? `?status=${status}&t=${Date.now()}`
        : `?t=${Date.now()}`;

      const response = await fetch(`/api/contact-messages${query}`, {
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "تعذر تحميل رسائل التواصل");
      }

      setMessages(data.messages || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل البيانات"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateMessageStatus(id: string, status: ContactMessageStatus) {
    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "تعذر تحديث الرسالة");
      }

      await loadMessages();
      setMessage("تم تحديث حالة الرسالة.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء التحديث"
      );
    } finally {
      setSavingId(null);
    }
  }

  async function deleteMessage(id: string) {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذه الرسالة؟");
    if (!confirmed) return;

    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "تعذر حذف الرسالة");
      }

      setMessages((current) => current.filter((item) => item.id !== id));
      setMessage("تم حذف الرسالة بنجاح.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "حدث خطأ أثناء الحذف");
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    loadMessages("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="space-y-6" dir="rtl">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black leading-tight text-[var(--text-main)]">
            رسائل تواصل معنا
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-[var(--text-muted)]">
            هذه الصفحة خاصة بإدارة منصة ميزار فقط، وتعرض الرسائل القادمة من
            صفحة تواصل معنا.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              loadMessages(event.target.value);
            }}
            className="input min-w-44"
          >
            <option value="">كل الرسائل</option>
            <option value="NEW">الجديدة</option>
            <option value="READ">تمت القراءة</option>
            <option value="ARCHIVED">المؤرشفة</option>
          </select>

          <button onClick={() => loadMessages()} className="btn-secondary">
            تحديث
          </button>
        </div>
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
      ) : messages.length === 0 ? (
        <section className="glass-card p-8 text-center">
          <h2 className="text-xl font-black text-[var(--text-main)]">
            لا توجد رسائل
          </h2>
          <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">
            عندما يرسل الزوار رسائل من صفحة تواصل معنا ستظهر هنا.
          </p>
        </section>
      ) : (
        <section className="grid gap-5">
          {messages.map((item) => (
            <article key={item.id} className="glass-card p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black leading-8 text-[var(--text-main)]">
                      {item.subject}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        statusClasses[item.status]
                      }`}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm font-semibold leading-7 text-[var(--text-muted)] md:grid-cols-2">
                    <p>الاسم: {item.name}</p>
                    <p>البريد: {item.email}</p>
                    <p>الهاتف: {item.phone || "غير مضاف"}</p>
                    <p>النشاط: {item.company || "غير مضاف"}</p>
                  </div>

                  <p className="mt-5 max-w-4xl whitespace-pre-wrap rounded-2xl bg-[var(--bg-soft)] p-4 text-base font-medium leading-9 text-[var(--text-body)]">
                    {item.message}
                  </p>

                  <p className="mt-4 text-xs font-bold text-[var(--text-muted)]">
                    تاريخ الإرسال:{" "}
                    {new Date(item.createdAt).toLocaleString("ar-EG")}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                  <button
                    onClick={() => updateMessageStatus(item.id, "READ")}
                    disabled={savingId === item.id}
                    className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-black text-white transition hover:bg-sky-600 disabled:opacity-60"
                  >
                    مقروءة
                  </button>

                  <button
                    onClick={() => updateMessageStatus(item.id, "ARCHIVED")}
                    disabled={savingId === item.id}
                    className="rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white transition hover:bg-[var(--navy-soft)] disabled:opacity-60"
                  >
                    أرشفة
                  </button>

                  <a
                    href={`mailto:${item.email}?subject=${encodeURIComponent(
                      `رد على: ${item.subject}`
                    )}`}
                    className="rounded-xl bg-[var(--mint)] px-4 py-3 text-center text-sm font-black text-[var(--primary)] transition hover:bg-[var(--mint-hover)] hover:text-white"
                  >
                    رد بالإيميل
                  </a>

                  <button
                    onClick={() => deleteMessage(item.id)}
                    disabled={savingId === item.id}
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
