"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  TEMPLATE_CATALOG,
  TemplateCatalogItem,
  buildTemplateConfig,
  getActiveTemplateKey,
  parseTemplateConfig,
  themeCssVariables,
} from "@/storefront/templates/theme-catalog";

type Store = {
  id: string;
  name: string;
  slug: string;
  template?: string | null;
  theme?: string | null;
  category?: string | null;
  templateConfig?: Record<string, any> | string | null;
};

const styles = `
.themes-page {
  --primary: #2ED3B7;
  --primary-hover: #18A994;
  --secondary: #0B1F3A;
  --success: #2e7d32;
  --warning: #F7C948;
  --danger: #d32f2f;
  --background: #F5FBFA;
  --card: #FFFFFF;
  --border: #DDEBE8;
  --text: #0B1F3A;
  --muted: #64748B;
  --navy: #0B1F3A;
  --mint: #2ED3B7;
  --mint-soft: rgba(46, 211, 183, 0.12);
  --gold: #F7C948;
  min-height: 100vh;
  color: var(--text);
  background:
    radial-gradient(circle at 9% 0%, rgba(46, 211, 183, 0.16), transparent 28%),
    radial-gradient(circle at 92% 8%, rgba(247, 201, 72, 0.16), transparent 24%),
    #F5FBFA;
}

.themes-page ::selection {
  background: rgba(46, 211, 183, 0.24);
  color: var(--navy);
}

.themes-page button,
.themes-page select,
.theme-preview,
.theme-color-dot,
.theme-badge,
.theme-feature,
.theme-pill {
  -webkit-user-select: none;
  user-select: none;
}

.theme-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 28px;
  background:
    radial-gradient(circle at 10% 0%, rgba(46, 211, 183, 0.16), transparent 30%),
    radial-gradient(circle at 90% 18%, rgba(11,31,58,0.10), transparent 28%),
    linear-gradient(135deg, #ffffff, #fafafa);
  box-shadow: 0 18px 44px rgba(34, 34, 34, 0.06);
}

.theme-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(46, 211, 183, 0.18);
  border-radius: 999px;
  background: rgba(46, 211, 183, 0.10);
  color: var(--primary-hover);
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 900;
}

.theme-pill::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--warning);
  box-shadow: 0 0 0 5px rgba(249, 168, 37, 0.13);
}

.theme-action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 14px;
  padding: 11px 15px;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
}

.theme-action:hover {
  transform: translateY(-1px);
}

.theme-action:focus-visible,
.theme-select:focus-visible,
.theme-card:focus-within {
  outline: none;
  box-shadow: 0 0 0 4px rgba(46, 211, 183, 0.15);
}

.theme-action.primary {
  border: 1px solid rgba(46, 211, 183, 0.34);
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(46, 211, 183, 0.20);
}

.theme-action.primary:hover {
  background: var(--primary-hover);
  box-shadow: 0 16px 30px rgba(46, 211, 183, 0.26);
}

.theme-action.secondary {
  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text);
}

.theme-action.secondary:hover {
  border-color: rgba(46, 211, 183, 0.34);
  color: var(--primary-hover);
  box-shadow: 0 10px 22px rgba(11, 31, 58, 0.06);
}

.theme-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
}

.theme-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--card);
  box-shadow: 0 14px 34px rgba(34, 34, 34, 0.055);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.theme-card:hover {
  transform: translateY(-4px);
  border-color: rgba(46, 211, 183, 0.34);
  box-shadow: 0 22px 54px rgba(11, 31, 58, 0.10);
}

.theme-card.active {
  border-color: rgba(46, 211, 183, 0.72);
  box-shadow: 0 22px 50px rgba(46, 211, 183, 0.16);
}

.theme-card.active::before {
  content: "";
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--mint), var(--gold));
  z-index: 2;
}

.theme-preview {
  min-height: 230px;
  background:
    radial-gradient(circle at 16% 14%, color-mix(in srgb, var(--template-primary) 20%, transparent), transparent 30%),
    radial-gradient(circle at 88% 22%, color-mix(in srgb, var(--template-accent) 18%, transparent), transparent 28%),
    linear-gradient(135deg, var(--template-background), #FFFFFF);
  padding: 18px;
}

.theme-card:hover .theme-preview-shell {
  transform: translateY(-2px) scale(1.01);
}

.theme-preview-shell {
  overflow: hidden;
  border: 1px solid rgba(236, 236, 236, 0.9);
  border-radius: 20px;
  background: rgba(255,255,255,0.92);
  box-shadow: 0 20px 40px rgba(34, 34, 34, 0.08);
  transition: 180ms ease;
}

.theme-preview-shell.sharp { border-radius: 10px; }
.theme-preview-shell.editorial { border-radius: 4px 28px 4px 28px; }
.theme-preview-shell.soft { border-radius: 28px; }

.theme-preview-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--border);
  padding: 10px;
}

.theme-preview-dot {
  width: 11px;
  height: 11px;
  border-radius: 999px;
}

.theme-preview-body {
  display: grid;
  grid-template-columns: 1fr 0.8fr;
  gap: 12px;
  padding: 14px;
}

.theme-preview-main,
.theme-preview-side,
.theme-preview-product {
  border-radius: 16px;
  background: #f6f6f6;
}

.theme-preview-main {
  min-height: 88px;
  padding: 12px;
}

.theme-preview-side {
  min-height: 88px;
  background: linear-gradient(135deg, var(--template-secondary), var(--template-primary));
}

.theme-preview-line {
  height: 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--template-text) 14%, transparent);
  margin-bottom: 9px;
}

.theme-preview-line.short { width: 54%; }
.theme-preview-line.mid { width: 76%; }

.theme-preview-products {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0 14px 14px;
}

.theme-preview-products.compact { gap: 5px; }
.theme-preview-products.spacious { gap: 12px; }

.theme-preview-product {
  min-height: 54px;
  background: color-mix(in srgb, var(--template-primary) 14%, #fff);
  transition: 180ms ease;
}

.theme-card:hover .theme-preview-product:nth-child(2) {
  transform: translateY(-2px);
}

.theme-preview-product:nth-child(2) { background: color-mix(in srgb, var(--template-secondary) 10%, #fff); }
.theme-preview-product:nth-child(3) { background: color-mix(in srgb, var(--template-accent) 22%, #fff); }

.theme-color-dot {
  width: 26px;
  height: 26px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: inset 0 0 0 3px rgba(255,255,255,.35);
  transition: 180ms ease;
}

.theme-color-dot:hover {
  transform: translateY(-2px) scale(1.06);
}

.theme-badge {
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 900;
}

.theme-badge.ready {
  background: rgba(46, 125, 50, 0.10);
  color: var(--success);
}

.theme-badge.soon {
  background: rgba(249, 168, 37, 0.12);
  color: #a16207;
}

.theme-feature {
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #FAFAFA;
  padding: 6px 11px;
  font-size: 12px;
  font-weight: 900;
  color: var(--text);
  transition: 160ms ease;
}

.theme-feature:hover {
  border-color: rgba(46, 211, 183, 0.34);
  background: rgba(46, 211, 183, 0.08);
  color: var(--primary-hover);
}

.theme-notice {
  border-radius: 16px;
  border: 1px solid transparent;
  padding: 13px 15px;
  font-size: 13px;
  font-weight: 900;
}

.theme-notice.success {
  border-color: rgba(46, 125, 50, 0.20);
  background: rgba(46, 125, 50, 0.08);
  color: var(--success);
}

.theme-notice.error {
  border-color: rgba(211, 47, 47, 0.20);
  background: rgba(211, 47, 47, 0.08);
  color: var(--danger);
}

.theme-select {
  min-height: 44px;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #ffffff;
  color: var(--text);
  padding: 10px 13px;
  font-weight: 800;
  outline: none;
  transition: 180ms ease;
}

.theme-select:hover,
.theme-select:focus {
  border-color: rgba(46, 211, 183, 0.62);
  box-shadow: 0 0 0 4px rgba(46, 211, 183, 0.12);
}

.theme-dev-guide {
  border: 1px dashed rgba(46, 211, 183, 0.38);
  border-radius: 22px;
  background: rgba(255,255,255,.72);
  padding: 18px;
}

@media (max-width: 768px) {
  .theme-hero,
  .theme-card { border-radius: 20px; }
  .theme-action { width: 100%; }
  .theme-preview-body { grid-template-columns: 1fr; }
}
`;

function TemplatePreview({ template }: { template: TemplateCatalogItem }) {
  const shape = template.preview.heroShape || "rounded";
  const density = template.preview.density || "normal";
  const vars = themeCssVariables(template);

  return (
    <div className="theme-preview" style={vars}>
      <div className={`theme-preview-shell ${shape}`}>
        <div className="theme-preview-bar">
          {Object.values(template.palette).slice(0, 4).map((color, index) => (
            <span
              key={`${template.key}-preview-dot-${index}-${color}`}
              className="theme-preview-dot"
              style={{ background: color }}
            />
          ))}
          <span className="me-auto h-3 w-24 rounded-full bg-black/10" />
        </div>

        <div className="theme-preview-body">
          <div className="theme-preview-main">
            <div className="theme-preview-line mid" />
            <div className="theme-preview-line short" />
            <div className="mt-5 h-8 w-28 rounded-full" style={{ background: template.palette.primary }} />
          </div>
          <div className="theme-preview-side" />
        </div>

        <div className={`theme-preview-products ${density}`}>
          <div className="theme-preview-product" />
          <div className="theme-preview-product" />
          <div className="theme-preview-product" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardThemesPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) || stores[0] || null,
    [stores, selectedStoreId],
  );

  const activeTemplateKey = getActiveTemplateKey(selectedStore);

  async function loadStores() {
    try {
      setLoading(true);
      setNotice(null);

      const response = await fetch(`/api/stores?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/merchant/login?next=/dashboard/themes";
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل المتاجر");
      }

      const loadedStores = Array.isArray(data.stores) ? data.stores : [];
      setStores(loadedStores);

      const savedStoreId = typeof window !== "undefined" ? localStorage.getItem("mizar-store-id") || "" : "";
      const nextStore = loadedStores.find((store: Store) => store.id === savedStoreId) || loadedStores[0] || null;

      if (nextStore) {
        setSelectedStoreId(nextStore.id);
        localStorage.setItem("mizar-store-id", nextStore.id);
        localStorage.setItem("mizar-store-slug", nextStore.slug);
      }
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "حدث خطأ أثناء تحميل القوالب",
      });
    } finally {
      setLoading(false);
    }
  }

  async function selectTemplate(template: TemplateCatalogItem) {
    if (!selectedStore) {
      setNotice({ type: "error", text: "اختر متجرًا أولًا" });
      return;
    }

    if (template.status !== "ready") {
      setNotice({ type: "error", text: "هذا القالب غير متاح حاليًا" });
      return;
    }

    try {
      setSavingKey(template.key);
      setNotice(null);

      const response = await fetch(`/api/stores/${selectedStore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          template: template.key,
          templateConfig: buildTemplateConfig(template, selectedStore.templateConfig),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل حفظ القالب");
      }

      const updatedStore = data.store as Store;

      setStores((current) =>
        current.map((store) => (store.id === updatedStore.id ? updatedStore : store)),
      );

      setSelectedStoreId(updatedStore.id);
      localStorage.setItem("mizar-store-id", updatedStore.id);
      localStorage.setItem("mizar-store-slug", updatedStore.slug);

      setNotice({ type: "success", text: `تم اختيار قالب ${template.title} بنجاح` });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ القالب",
      });
    } finally {
      setSavingKey("");
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  if (loading) {
    return (
      <main className="themes-page p-6" dir="rtl">
        <style>{styles}</style>
        <section className="theme-hero p-6">
          <span className="theme-pill">قوالب المتجر</span>
          <div className="mt-5 grid gap-3">
            <div className="h-8 w-72 rounded-2xl bg-black/10" />
            <div className="h-4 w-full max-w-xl rounded-full bg-black/10" />
            <div className="h-4 w-2/3 rounded-full bg-black/10" />
          </div>
        </section>
      </main>
    );
  }

  if (stores.length === 0) {
    return (
      <main className="themes-page p-6" dir="rtl">
        <style>{styles}</style>
        <section className="theme-hero p-8 text-center">
          <span className="theme-pill mx-auto">قوالب المتجر</span>
          <h1 className="mt-4 text-2xl font-black">لا يوجد متجر مرتبط بالحساب</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
            أنشئ المتجر الأول ثم ارجع لاختيار القالب المناسب.
          </p>
          <Link href="/merchant/welcome" className="theme-action primary mt-6">
            إعداد المتجر
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="themes-page space-y-5 p-4 md:p-6" dir="rtl">
      <style>{styles}</style>

      {notice ? <div className={`theme-notice ${notice.type}`}>{notice.text}</div> : null}

      <section className="theme-hero p-5 md:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div>
            <span className="theme-pill">قوالب المتجر</span>
            <h1 className="mt-4 text-2xl font-black leading-tight md:text-4xl">
              اختر شكل المتجر الذي يناسب علامتك التجارية
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-8 text-[var(--muted)] md:text-base">
              إدارة القوالب أصبحت أسهل: بيانات القوالب كلها موجودة في ملف مركزي واحد، ومعاينة كل قالب تتغير تلقائيًا من ألوانه وإعداداته.
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-[var(--border)] bg-white/80 p-4">
            <label>
              <span className="mb-2 block text-xs font-black text-[var(--muted)]">المتجر الحالي</span>
              <select
                value={selectedStoreId}
                onChange={(event) => {
                  const storeId = event.target.value;
                  const store = stores.find((item) => item.id === storeId);
                  setSelectedStoreId(storeId);
                  if (store) {
                    localStorage.setItem("mizar-store-id", store.id);
                    localStorage.setItem("mizar-store-slug", store.slug);
                  }
                }}
                className="theme-select"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} — /{store.slug}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/settings" className="theme-action secondary flex-1">
                إعدادات المتجر
              </Link>
              {selectedStore?.slug ? (
                <Link
                  href={`/store/${selectedStore.slug}?preview=1&t=${Date.now()}`}
                  target="_blank"
                  className="theme-action primary flex-1"
                >
                  معاينة المتجر
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="theme-dev-guide">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-lg font-black">إضافة أو تعديل قالب بقى أسهل</h2>
            <p className="mt-2 text-sm font-semibold leading-7 text-[var(--muted)]">
              عدل القوالب من ملف واحد فقط: <b>src/storefront/templates/theme-catalog.ts</b>. لتغيير ألوان أو وصف أو مميزات قالب، عدل بياناته هناك. ولإضافة قالب جديد، أضف عنصر جديد داخل <b>TEMPLATE_CATALOG</b> ثم اربطه بالـ Router عندما تنفذ صفحات القالب.
            </p>
          </div>
          <Link href="/dashboard/settings" className="theme-action secondary">
            ضبط محتوى المتجر
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {TEMPLATE_CATALOG.map((template) => {
          const active = activeTemplateKey === template.key;
          const ready = template.status === "ready";

          return (
            <article key={template.key} className={`theme-card ${active ? "active" : ""}`}>
              <TemplatePreview template={template} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`theme-badge ${template.status}`}>
                      {active ? "القالب الحالي" : template.badge}
                    </span>
                    <h2 className="mt-3 text-xl font-black">{template.title}</h2>
                    <p className="mt-1 text-sm font-bold text-[var(--secondary)]">{template.subtitle}</p>
                  </div>

                  <div className="flex gap-1">
                    {Object.values(template.palette).slice(0, 4).map((color, index) => (
                      <span
                        key={`${template.key}-color-dot-${index}-${color}`}
                        className="theme-color-dot"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-4 min-h-[72px] text-sm font-semibold leading-7 text-[var(--muted)]">
                  {template.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {template.recommendedFor.slice(0, 4).map((item) => (
                    <span key={item} className="theme-feature">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {template.features.map((feature) => (
                    <span key={feature} className="theme-feature">
                      {feature}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!ready || savingKey === template.key || active}
                  onClick={() => selectTemplate(template)}
                  className={`theme-action mt-5 w-full ${ready ? "primary" : "secondary"}`}
                >
                  {savingKey === template.key
                    ? "جاري الحفظ..."
                    : active
                      ? "مفعل حاليًا"
                      : ready
                        ? "اختيار هذا القالب"
                        : "قريبًا"}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
