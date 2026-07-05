"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type StoreSummary = {
  id: string;
  name: string;
  slug: string;
};

type Subscriber = {
  id: string;
  email: string;
  source?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function extractStores(payload: any): StoreSummary[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.stores)) return payload.stores;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.store) return [payload.store];
  return [];
}

function formatDate(value: string) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

const styles = `
.newsletter-page {
  --mizar-primary: var(--primary, #18213f);
  --mizar-mint: var(--mint, #2ed9b3);
  --mizar-mint-hover: var(--mint-hover, #14b897);
  --mizar-gold: var(--gold, #f59e0b);
  --mizar-border: var(--border, #e2e8f0);
  --mizar-surface: #ffffff;
  --mizar-soft: #f8fafc;
  --mizar-text: var(--text-main, #18213f);
  --mizar-muted: var(--muted-foreground, #64748b);
  min-height: 100vh;
  padding: 24px;
  color: var(--mizar-text);
}

.newsletter-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 26px;
  padding: 28px;
  background:
    radial-gradient(circle at 12% 10%, rgba(46, 217, 179, 0.16), transparent 30%),
    radial-gradient(circle at 92% 20%, rgba(245, 158, 11, 0.08), transparent 24%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 14px 44px rgba(24, 33, 63, 0.06);
}

.newsletter-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border: 1px solid rgba(46, 217, 179, 0.22);
  border-radius: 999px;
  padding: 7px 11px;
  color: var(--mizar-mint-hover);
  background: rgba(216, 255, 245, 0.74);
  font-size: 12px;
  font-weight: 900;
}

.newsletter-kicker::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--mizar-gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.newsletter-hero h1 {
  margin: 14px 0 8px;
  font-size: clamp(24px, 3vw, 38px);
  line-height: 1.25;
}

.newsletter-hero p {
  margin: 0;
  color: var(--mizar-muted);
  line-height: 1.9;
  font-weight: 650;
}

.newsletter-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.newsletter-btn {
  border: 0;
  border-radius: 14px;
  min-height: 44px;
  padding: 11px 16px;
  font-weight: 900;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.newsletter-btn.primary {
  background: linear-gradient(135deg, var(--mizar-primary), #253057);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(24, 33, 63, 0.14);
}

.newsletter-btn.light {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--mizar-primary);
}

.newsletter-notice {
  margin-top: 16px;
  border-radius: 16px;
  padding: 13px 15px;
  font-weight: 900;
}

.newsletter-notice.error {
  border: 1px solid rgba(211, 47, 47, 0.22);
  background: rgba(211, 47, 47, 0.07);
  color: #d32f2f;
}

.newsletter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0;
}

.newsletter-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(24, 33, 63, 0.05);
}

.newsletter-card span {
  color: var(--mizar-muted);
  font-size: 13px;
  font-weight: 800;
}

.newsletter-card strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
  line-height: 1;
}

.newsletter-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: end;
  margin-bottom: 18px;
}

.newsletter-field {
  display: grid;
  gap: 8px;
}

.newsletter-field span {
  color: var(--mizar-muted);
  font-size: 13px;
  font-weight: 900;
}

.newsletter-field select {
  min-height: 44px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  background: #ffffff;
  color: var(--mizar-text);
  padding: 10px 13px;
  font-weight: 900;
  outline: none;
}

.newsletter-table-wrap {
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(24, 33, 63, 0.05);
}

.newsletter-table {
  width: 100%;
  border-collapse: collapse;
}

.newsletter-table th,
.newsletter-table td {
  padding: 15px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.78);
  text-align: right;
  font-size: 13px;
}

.newsletter-table th {
  background: #f8fafc;
  color: var(--mizar-muted);
  font-weight: 900;
}

.newsletter-table td {
  color: var(--mizar-text);
  font-weight: 750;
}

.newsletter-status {
  display: inline-flex;
  border-radius: 999px;
  padding: 6px 10px;
  background: rgba(46, 217, 179, 0.14);
  color: var(--mizar-mint-hover);
  font-weight: 900;
}

.newsletter-empty {
  display: grid;
  place-items: center;
  gap: 10px;
  min-height: 220px;
  color: var(--mizar-muted);
  text-align: center;
}

@media (max-width: 900px) {
  .newsletter-hero,
  .newsletter-toolbar { grid-template-columns: 1fr; display: grid; }
  .newsletter-grid { grid-template-columns: 1fr; }
}
`;

export default function DashboardNewsletterPage() {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) || null,
    [stores, selectedStoreId],
  );

  const activeSubscribers = subscribers.filter((item) => item.status !== "UNSUBSCRIBED").length;

  useEffect(() => {
    let mounted = true;

    async function loadStores() {
      try {
        setLoadingStores(true);

        const response = await fetch(`/api/stores?t=${Date.now()}`, {
          cache: "no-store",
          credentials: "include",
        });

        const payload = await response.json().catch(() => null);
        const rows = extractStores(payload);

        if (!mounted) return;

        setStores(rows);

        const savedStoreId =
          typeof window !== "undefined" ? localStorage.getItem("mizar-store-id") || "" : "";

        const nextSelected = rows.find((store) => store.id === savedStoreId)?.id || rows[0]?.id || "";

        setSelectedStoreId(nextSelected);
      } catch (error) {
        console.error(error);
        setNotice({ type: "error", text: "تعذر تحميل المتاجر. تأكد من تسجيل الدخول كتاجر." });
      } finally {
        if (mounted) setLoadingStores(false);
      }
    }

    loadStores();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;

    let mounted = true;

    async function loadSubscribers() {
      try {
        setLoadingSubscribers(true);
        setNotice(null);

        const response = await fetch(
          `/api/dashboard/newsletter?storeId=${encodeURIComponent(selectedStoreId)}&t=${Date.now()}`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.message || "تعذر تحميل مشتركي النشرة البريدية");
        }

        if (!mounted) return;

        setSubscribers(Array.isArray(payload?.subscribers) ? payload.subscribers : []);
      } catch (error) {
        console.error(error);
        if (mounted) {
          setSubscribers([]);
          setNotice({
            type: "error",
            text: error instanceof Error ? error.message : "تعذر تحميل مشتركي النشرة البريدية",
          });
        }
      } finally {
        if (mounted) setLoadingSubscribers(false);
      }
    }

    loadSubscribers();

    return () => {
      mounted = false;
    };
  }, [selectedStoreId]);

  function exportCsv() {
    const header = ["Email", "Status", "Source", "Created At"];
    const rows = subscribers.map((item) => [item.email, item.status, item.source || "", item.createdAt || ""]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `newsletter-${selectedStore?.slug || "store"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="newsletter-page" dir="rtl">
      <style>{styles}</style>

      <section className="newsletter-hero">
        <div>
          <span className="newsletter-kicker">النشرة البريدية</span>
          <h1>مشتركو النشرة البريدية</h1>
          <p>
            تابع العملاء الذين تركوا بريدهم من واجهة المتجر. يمكنك تصدير القائمة CSV لاستخدامها في حملات التسويق.
          </p>
        </div>

        <div className="newsletter-actions">
          {selectedStore?.slug ? (
            <Link href={`/store/${selectedStore.slug}`} target="_blank" className="newsletter-btn light">
              فتح المتجر
            </Link>
          ) : null}
          <button className="newsletter-btn primary" onClick={exportCsv} disabled={!subscribers.length}>
            تصدير CSV
          </button>
        </div>
      </section>

      {notice ? <div className={`newsletter-notice ${notice.type}`}>{notice.text}</div> : null}

      <section className="newsletter-grid">
        <div className="newsletter-card">
          <span>إجمالي المشتركين</span>
          <strong>{subscribers.length}</strong>
        </div>
        <div className="newsletter-card">
          <span>مشتركون نشطون</span>
          <strong>{activeSubscribers}</strong>
        </div>
        <div className="newsletter-card">
          <span>المتجر الحالي</span>
          <strong style={{ fontSize: 20 }}>{selectedStore?.name || "-"}</strong>
        </div>
      </section>

      <section className="newsletter-card">
        <div className="newsletter-toolbar">
          <label className="newsletter-field">
            <span>المتجر</span>
            <select
              value={selectedStoreId}
              disabled={loadingStores}
              onChange={(event) => {
                const id = event.target.value;
                const store = stores.find((item) => item.id === id);
                setSelectedStoreId(id);
                if (typeof window !== "undefined") {
                  localStorage.setItem("mizar-store-id", id);
                  if (store?.slug) localStorage.setItem("mizar-store-slug", store.slug);
                }
              }}
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} — /{store.slug}
                </option>
              ))}
            </select>
          </label>

          <button className="newsletter-btn light" onClick={() => selectedStoreId && setSelectedStoreId(selectedStoreId)}>
            تحديث القائمة
          </button>
        </div>

        <div className="newsletter-table-wrap">
          {loadingSubscribers ? (
            <div className="newsletter-empty">جاري تحميل المشتركين...</div>
          ) : subscribers.length ? (
            <table className="newsletter-table">
              <thead>
                <tr>
                  <th>البريد الإلكتروني</th>
                  <th>الحالة</th>
                  <th>المصدر</th>
                  <th>تاريخ الاشتراك</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((item) => (
                  <tr key={item.id}>
                    <td>{item.email}</td>
                    <td><span className="newsletter-status">{item.status}</span></td>
                    <td>{item.source || "Storefront"}</td>
                    <td>{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="newsletter-empty">
              <strong>لا يوجد مشتركون بعد</strong>
              <span>عند إدخال عميل لبريده من واجهة المتجر سيظهر هنا مباشرة.</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
