"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Home",
  "Food",
  "Sports",
  "Books",
  "General",
];

const THEMES = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
];

export default function CreateStorePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("General");
  const [theme, setTheme] = useState("modern");

  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [shippingFee, setShippingFee] = useState("0");
  const [shippingPolicy, setShippingPolicy] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const finalSlug = useMemo(() => {
    return normalizeSlug(slug || name);
  }, [slug, name]);

  async function createStore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      if (!name.trim()) {
        throw new Error("اسم المتجر مطلوب");
      }

      if (!finalSlug) {
        throw new Error("رابط المتجر غير صالح");
      }

      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug: finalSlug,
          category,
          theme,
          description,
          whatsapp,
          shippingFee: Number(shippingFee || 0),
          shippingPolicy,
          primaryColor,
          isActive,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل إنشاء المتجر");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("mizar-store-id", data.store.id);
        localStorage.setItem("mizar-store-slug", data.store.slug);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء المتجر"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6" dir="rtl">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)]">
            إنشاء متجر جديد
          </h1>

          <p className="mt-2 text-[var(--muted-foreground)]">
            أنشئ متجر مرتبط بحساب التاجر الحالي وابدأ إضافة المنتجات والطلبات.
          </p>
        </div>

        <Link href="/dashboard" className="btn-secondary">
          العودة للوحة التحكم
        </Link>
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600">
          {errorMessage}
        </div>
      )}

      <form onSubmit={createStore} className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-2xl font-black text-[var(--foreground)]">
              البيانات الأساسية
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  اسم المتجر
                </label>

                <input
                  className="input"
                  value={name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setName(value);

                    if (!slug.trim()) {
                      setSlug(normalizeSlug(value));
                    }
                  }}
                  placeholder="مثال: Fashion Store"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  رابط المتجر
                </label>

                <input
                  className="input"
                  value={slug}
                  onChange={(event) => setSlug(normalizeSlug(event.target.value))}
                  placeholder="fashion-store"
                  disabled={loading}
                  dir="ltr"
                />

                <p className="mt-2 text-xs font-bold text-[var(--muted-foreground)]">
                  الرابط النهائي: /store/{finalSlug || "store-slug"}
                </p>
              </div>

              <div>
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  التصنيف
                </label>

                <select
                  className="input"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  disabled={loading}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  شكل المتجر
                </label>

                <select
                  className="input"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  disabled={loading}
                >
                  {THEMES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  وصف المتجر
                </label>

                <textarea
                  className="input"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="اكتب وصف مختصر يظهر في صفحة المتجر..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-2xl font-black text-[var(--foreground)]">
              التواصل والشحن
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  رقم واتساب المتجر
                </label>

                <input
                  className="input"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="201000000000"
                  disabled={loading}
                  dir="ltr"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  رسوم الشحن
                </label>

                <input
                  className="input"
                  type="number"
                  min="0"
                  value={shippingFee}
                  onChange={(event) => setShippingFee(event.target.value)}
                  placeholder="0"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  سياسة الشحن
                </label>

                <textarea
                  className="input"
                  rows={4}
                  value={shippingPolicy}
                  onChange={(event) => setShippingPolicy(event.target.value)}
                  placeholder="مثال: التوصيل خلال 2-5 أيام عمل..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-2xl font-black text-[var(--foreground)]">
              المظهر والحالة
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  اللون الأساسي
                </label>

                <div className="flex gap-3">
                  <input
                    className="h-12 w-16 cursor-pointer rounded-xl border border-[var(--border)] bg-transparent"
                    type="color"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    disabled={loading}
                  />

                  <input
                    className="input"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    placeholder="#2563EB"
                    disabled={loading}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-bold text-[var(--foreground)]">
                  حالة المتجر
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3">
                  <span className="font-black text-[var(--foreground)]">
                    المتجر نشط
                  </span>

                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    disabled={loading}
                    className="h-5 w-5"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-2xl font-black text-[var(--foreground)]">
              معاينة سريعة
            </h2>

            <div
              className="mt-6 overflow-hidden rounded-[2rem] border border-[var(--border)]"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}22, transparent 70%)`,
              }}
            >
              <div className="p-6">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  {(name || "M").slice(0, 1)}
                </div>

                <p className="text-sm font-black text-[var(--primary)]">
                  {category}
                </p>

                <h3 className="mt-2 text-3xl font-black text-[var(--foreground)]">
                  {name || "اسم المتجر"}
                </h3>

                <p className="mt-3 leading-7 text-[var(--muted-foreground)]">
                  {description || "وصف المتجر سيظهر هنا للعملاء."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-black text-[var(--foreground)]">
                    الشحن: {Number(shippingFee || 0).toLocaleString("ar-EG")} ج.م
                  </span>

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-black ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {isActive ? "نشط" : "متوقف"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[var(--muted)] p-4">
              <p className="text-sm font-bold text-[var(--muted-foreground)]">
                رابط المتجر
              </p>

              <p className="mt-2 break-all font-black text-[var(--foreground)]" dir="ltr">
                /store/{finalSlug || "store-slug"}
              </p>
            </div>
          </div>

          <div className="glass-card p-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "جاري إنشاء المتجر..." : "إنشاء المتجر"}
            </button>

            <Link href="/dashboard" className="btn-secondary mt-3 w-full text-center">
              إلغاء
            </Link>

            <p className="mt-4 text-center text-xs leading-6 text-[var(--muted-foreground)]">
              بعد إنشاء المتجر سيتم ربطه تلقائيًا بحساب التاجر الحالي.
            </p>
          </div>
        </aside>
      </form>
    </main>
  );
}