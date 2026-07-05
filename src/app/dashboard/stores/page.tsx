"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type Store = {
  id: string;
  name: string;
  slug: string;

  category?: string | null;
  theme?: string | null;
  template?: string | null;
  description?: string | null;

  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  contactEmail?: string | null;

  logoUrl?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;

  shippingFee?: number | string | null;
  shippingPolicy?: string | null;
  freeShippingThreshold?: number | string | null;

  paymentMethods?: string[] | string | null;
  paymentMethod?: string | null;
  currency?: string | null;

  isActive?: boolean | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;

  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  snapchat?: string | null;
  x?: string | null;
  website?: string | null;

  address?: string | null;
  city?: string | null;
  governorate?: string | null;
  country?: string | null;

  createdAt?: string;
  updatedAt?: string;

  _count?: {
    products?: number;
    orders?: number;
    customers?: number;
  };
};

type IconName =
  | "store"
  | "external"
  | "copy"
  | "settings"
  | "products"
  | "orders"
  | "customers"
  | "shipping"
  | "palette"
  | "calendar"
  | "phone"
  | "mail"
  | "location"
  | "link"
  | "power"
  | "check"
  | "warning"
  | "info"
  | "refresh"
  | "tag"
  | "payment";

const storesPageStyles = `
.store-profile-page {
  color: var(--text-main);
}

.store-profile-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.store-profile-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 24px;
  background:
    radial-gradient(circle at 12% 10%, rgba(46, 217, 179, 0.16), transparent 30%),
    radial-gradient(circle at 92% 20%, rgba(245, 158, 11, 0.08), transparent 24%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 14px 44px rgba(24, 33, 63, 0.06);
}

.store-profile-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border: 1px solid rgba(46, 217, 179, 0.22);
  border-radius: 999px;
  background: rgba(216, 255, 245, 0.74);
  color: var(--mint-hover);
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 700;
}

.store-profile-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.store-hero-identity {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  direction: rtl;
}

.store-hero-content {
  min-width: 0;
}

.store-hero-title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.store-profile-logo {
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 28px;
  color: #ffffff;
  font-family: var(--font-en);
  font-size: 30px;
  font-weight: 800;
  box-shadow: 0 18px 34px rgba(24, 33, 63, 0.14);
}

.store-profile-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.08);
}

.store-profile-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.store-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 700;
}

.store-status-pill.active {
  background: rgba(16, 185, 129, 0.10);
  color: #047857;
}

.store-status-pill.inactive {
  background: rgba(239, 68, 68, 0.10);
  color: #dc2626;
}

.store-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.12);
}

.store-status-pill.inactive .store-status-dot {
  box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.12);
}

.store-profile-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 42px;
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  transition:
    transform 180ms var(--ease-premium),
    border-color 180ms var(--ease-premium),
    background 180ms var(--ease-premium),
    color 180ms var(--ease-premium),
    box-shadow 180ms var(--ease-premium);
}

.store-profile-action:hover {
  transform: translateY(-1px);
}

.store-profile-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.store-profile-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.store-profile-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.store-profile-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.store-profile-action.danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
}

.store-profile-action.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.store-profile-action.success {
  border: 1px solid rgba(16, 185, 129, 0.24);
  background: rgba(16, 185, 129, 0.10);
  color: #047857;
}

.store-profile-action.success:hover {
  background: rgba(16, 185, 129, 0.15);
}

.store-profile-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.store-profile-icon.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.store-profile-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.store-profile-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.store-profile-value {
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--text-main);
}

.store-info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid var(--border-soft);
  padding: 14px 0;
}

.store-info-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.store-info-label {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 140px;
  color: var(--muted-foreground);
  font-size: 13px;
  font-weight: 600;
}

.store-info-value {
  min-width: 0;
  color: var(--foreground);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.8;
  text-align: left;
  direction: ltr;
  word-break: break-word;
}

.store-info-value.rtl {
  text-align: right;
  direction: rtl;
}

.store-color-swatch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  direction: ltr;
}

.store-color-dot {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12);
}

.store-profile-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.store-profile-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.72),
    transparent
  );
  animation: store-profile-skeleton-shimmer 1.25s infinite;
}

@keyframes store-profile-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@media (max-width: 768px) {
  .store-profile-card,
  .store-profile-hero {
    border-radius: 18px;
  }

  .store-hero-identity {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .store-hero-content {
    width: 100%;
  }

  .store-hero-title-line {
    justify-content: center;
  }

  .store-profile-tags {
    justify-content: center;
  }

  .store-profile-action {
    width: 100%;
  }

  .store-info-row {
    display: block;
  }

  .store-info-label {
    min-width: 0;
  }

  .store-info-value {
    margin-top: 8px;
    text-align: right;
    direction: rtl;
  }

  .store-profile-value {
    font-size: 24px;
  }
}
`;

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value: number | string | null | undefined) {
  return toNumber(value, 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function formatMoney(value: number | string | null | undefined) {
  return `${formatNumber(value)} ج.م`;
}

function formatDate(value?: string) {
  if (!value) return "غير متوفر";

  return new Date(value).toLocaleString("ar-EG-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getSafeColor(value?: string | null, fallback = "#2ED9B3") {
  const color = String(value || "").trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color;
  }

  return fallback;
}

function displayValue(value?: string | number | null) {
  const clean = String(value ?? "").trim();

  return clean || "غير مسجل";
}

function normalizePaymentMethods(value: Store["paymentMethods"], fallback?: string | null) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("، ") || displayValue(fallback);
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return displayValue(fallback);
}

function getStoreUrl(store: Store | null) {
  if (!store?.slug) return "";

  if (typeof window === "undefined") {
    return `/store/${store.slug}`;
  }

  return `${window.location.origin}/store/${store.slug}`;
}

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const props = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  if (name === "store") {
    return (
      <svg {...props}>
        <path d="M4 10h16" />
        <path d="M5 10l1-5h12l1 5" />
        <path d="M6 10v9h12v-9" />
        <path d="M9 19v-5h6v5" />
      </svg>
    );
  }

  if (name === "external") {
    return (
      <svg {...props}>
        <path d="M14 4h6v6" />
        <path d="M10 14L20 4" />
        <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
      </svg>
    );
  }

  if (name === "copy") {
    return (
      <svg {...props}>
        <path d="M9 9h10v10H9z" />
        <path d="M5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...props}>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19 12h2" />
        <path d="M3 12h2" />
        <path d="M12 3v2" />
        <path d="M12 19v2" />
      </svg>
    );
  }

  if (name === "products") {
    return (
      <svg {...props}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "orders") {
    return (
      <svg {...props}>
        <path d="M7 7h10" />
        <path d="M7 12h10" />
        <path d="M7 17h6" />
        <path d="M5 3h14a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }

  if (name === "customers") {
    return (
      <svg {...props}>
        <path d="M16 11a4 4 0 1 0-8 0" />
        <path d="M6 21a6 6 0 0 1 12 0" />
        <path d="M19 8a3 3 0 0 1 2 2.8" />
        <path d="M21 21a4.5 4.5 0 0 0-3-4.2" />
      </svg>
    );
  }

  if (name === "shipping") {
    return (
      <svg {...props}>
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7" />
        <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    );
  }

  if (name === "palette") {
    return (
      <svg {...props}>
        <path d="M12 21a9 9 0 1 1 8.5-6" />
        <path d="M7.5 10.5h.01" />
        <path d="M10 7.5h.01" />
        <path d="M14 7.5h.01" />
        <path d="M16.5 11h.01" />
        <path d="M17 16h3v3h-3z" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...props}>
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4 8h16" />
        <path d="M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...props}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg {...props}>
        <path d="M4 5h16v14H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...props}>
        <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" />
        <path d="M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    );
  }

  if (name === "link") {
    return (
      <svg {...props}>
        <path d="M9.5 14.5l5-5" />
        <path d="M8.2 10.7 6.8 12.1a4 4 0 0 0 5.7 5.7l1.4-1.4" />
        <path d="M10.1 7.6l1.4-1.4a4 4 0 0 1 5.7 5.7l-1.4 1.4" />
      </svg>
    );
  }

  if (name === "power") {
    return (
      <svg {...props}>
        <path d="M12 2v10" />
        <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...props}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (name === "warning") {
    return (
      <svg {...props}>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...props}>
        <path d="M20 6v5h-5" />
        <path d="M4 18v-5h5" />
        <path d="M6.2 9a7 7 0 0 1 11.6-2.6L20 11" />
        <path d="M17.8 15a7 7 0 0 1-11.6 2.6L4 13" />
      </svg>
    );
  }

  if (name === "tag") {
    return (
      <svg {...props}>
        <path d="M20 12 12 20 4 12V4h8l8 8Z" />
        <path d="M8 8h.01" />
      </svg>
    );
  }

  if (name === "payment") {
    return (
      <svg {...props}>
        <path d="M3 6h18v12H3z" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 17h.01" />
      <path d="M12 13v-2" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </svg>
  );
}

export default function DashboardStoresPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStore, setUpdatingStore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadStore() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/stores?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل بيانات المتجر");
      }

      const stores = Array.isArray(data.stores) ? (data.stores as Store[]) : [];
      const selectedStore = stores[0] || null;

      setStore(selectedStore);

      if (selectedStore && typeof window !== "undefined") {
        localStorage.setItem("mizar-store-id", selectedStore.id);
        localStorage.setItem("mizar-store-slug", selectedStore.slug);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل بيانات المتجر"
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleStoreStatus() {
    if (!store?.id) return;

    setUpdatingStore(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isActive: store.isActive === false ? true : false,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحديث حالة المتجر");
      }

      setSuccessMessage(
        store.isActive === false
          ? "تم تشغيل المتجر بنجاح"
          : "تم إيقاف المتجر بنجاح"
      );

      await loadStore();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحديث حالة المتجر"
      );
    } finally {
      setUpdatingStore(false);
    }
  }

  async function copyStoreLink() {
    if (!store) return;

    try {
      await navigator.clipboard.writeText(getStoreUrl(store));
      setSuccessMessage("تم نسخ رابط المتجر");
    } catch {
      setErrorMessage("تعذر نسخ رابط المتجر");
    }
  }

  async function copyStoreId() {
    if (!store?.id) return;

    try {
      await navigator.clipboard.writeText(store.id);
      setSuccessMessage("تم نسخ كود المتجر");
    } catch {
      setErrorMessage("تعذر نسخ كود المتجر");
    }
  }

  useEffect(() => {
    loadStore();
  }, []);

  const primaryColor = useMemo(() => {
    return getSafeColor(store?.primaryColor, "#2ED9B3");
  }, [store?.primaryColor]);

  const secondaryColor = useMemo(() => {
    return getSafeColor(store?.secondaryColor || store?.accentColor, "#18213F");
  }, [store?.secondaryColor, store?.accentColor]);

  const stats = useMemo(() => {
    return {
      products: Number(store?._count?.products || 0),
      orders: Number(store?._count?.orders || 0),
      customers: Number(store?._count?.customers || 0),
      shippingFee: toNumber(store?.shippingFee, 0),
    };
  }, [store]);

  if (loading) {
    return (
      <main className="store-profile-page space-y-5" dir="rtl">
        <style>{storesPageStyles}</style>
        <StoreProfileSkeleton />
      </main>
    );
  }

  if (!store) {
    return (
      <main className="store-profile-page space-y-5" dir="rtl">
        <style>{storesPageStyles}</style>

        <section className="store-profile-card p-8 text-center">
          <div className="store-profile-icon red mx-auto">
            <Icon name="warning" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            لا يوجد متجر مرتبط بالحساب
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
            المتجر يتم إنشاؤه مرة واحدة أثناء التسجيل. لو الحساب مكتمل ولسه
            المتجر مش ظاهر، راجع بيانات التسجيل أو جرّب تحديث الصفحة.
          </p>

          <button
            type="button"
            onClick={loadStore}
            className="store-profile-action secondary mt-6"
          >
            <Icon name="refresh" />
            تحديث البيانات
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="store-profile-page space-y-5" dir="rtl">
      <style>{storesPageStyles}</style>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      <section className="store-profile-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <span className="store-profile-pill">بيانات المتجر الواحد</span>

            <div className="store-hero-identity mt-5">
              <div
                className="store-profile-logo"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} />
                ) : (
                  store.name.slice(0, 1).toUpperCase()
                )}
              </div>

              <div className="store-hero-content">
                <div className="store-hero-title-line">
                  <h1 className="min-w-0 text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
                    {store.name}
                  </h1>

                  <span
                    className={`store-status-pill ${
                      store.isActive === false ? "inactive" : "active"
                    }`}
                  >
                    <span className="store-status-dot" />
                    {store.isActive === false ? "متجر متوقف" : "متجر نشط"}
                  </span>
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
                  {store.description ||
                    "هنا تقدر تراجع كل بيانات متجرك الأساسية، رابط المتجر، إعدادات التواصل، الشحن، الهوية البصرية، وحالة التشغيل."}
                </p>

                <div className="store-profile-tags mt-4">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                    {displayValue(store.category)}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                    {displayValue(store.theme || store.template)}
                  </span>

                  <span
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"
                    dir="ltr"
                  >
                    /store/{store.slug}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="store-profile-action primary"
            >
              <Icon name="external" />
              معاينة المتجر
            </Link>

            <button
              type="button"
              onClick={copyStoreLink}
              className="store-profile-action secondary"
            >
              <Icon name="copy" />
              نسخ رابط المتجر
            </button>

            <Link
              href="/dashboard/settings"
              className="store-profile-action secondary"
            >
              <Icon name="settings" />
              تعديل بيانات المتجر
            </Link>

            <button
              type="button"
              onClick={toggleStoreStatus}
              disabled={updatingStore}
              className={`store-profile-action ${
                store.isActive === false ? "success" : "danger"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <Icon name="power" />
              {updatingStore
                ? "جاري التحديث..."
                : store.isActive === false
                  ? "تشغيل المتجر"
                  : "إيقاف المتجر"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="المنتجات"
          value={formatNumber(stats.products)}
          note="إجمالي المنتجات داخل المتجر"
          icon="products"
        />

        <StatCard
          title="الطلبات"
          value={formatNumber(stats.orders)}
          note="إجمالي الطلبات المسجلة"
          icon="orders"
        />

        <StatCard
          title="العملاء"
          value={formatNumber(stats.customers)}
          note="عدد العملاء المرتبطين بالمتجر"
          icon="customers"
        />

        <StatCard
          title="رسوم الشحن"
          value={formatMoney(stats.shippingFee)}
          note="القيمة الحالية للشحن"
          icon="shipping"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <DataSection
            title="البيانات الأساسية"
            description="المعلومات الرئيسية التي تظهر للعملاء وتحدد هوية المتجر."
          >
            <InfoRow icon="store" label="اسم المتجر" value={displayValue(store.name)} rtl />
            <InfoRow icon="link" label="رابط المتجر" value={getStoreUrl(store)} />
            <InfoRow icon="tag" label="رابط مختصر" value={`/store/${store.slug}`} />
            <InfoRow icon="tag" label="التصنيف" value={displayValue(store.category)} rtl />
            <InfoRow icon="palette" label="القالب / الثيم" value={displayValue(store.theme || store.template)} rtl />
            <InfoRow
              icon="info"
              label="وصف المتجر"
              value={displayValue(store.description)}
              rtl
            />
          </DataSection>

          <DataSection
            title="التواصل وبيانات الخدمة"
            description="البيانات التي تساعد العميل على التواصل مع المتجر."
          >
            <InfoRow icon="phone" label="واتساب" value={displayValue(store.whatsapp)} />
            <InfoRow icon="phone" label="رقم الهاتف" value={displayValue(store.phone)} />
            <InfoRow
              icon="mail"
              label="البريد الإلكتروني"
              value={displayValue(store.email || store.contactEmail)}
            />
            <InfoRow
              icon="location"
              label="العنوان"
              value={displayValue(store.address)}
              rtl
            />
            <InfoRow
              icon="location"
              label="المدينة"
              value={displayValue(store.city || store.governorate)}
              rtl
            />
            <InfoRow
              icon="location"
              label="الدولة"
              value={displayValue(store.country)}
              rtl
            />
          </DataSection>

          <DataSection
            title="الشحن والدفع"
            description="إعدادات مهمة تؤثر مباشرة على تجربة الشراء."
          >
            <InfoRow icon="shipping" label="رسوم الشحن" value={formatMoney(store.shippingFee)} />
            <InfoRow
              icon="shipping"
              label="حد الشحن المجاني"
              value={
                store.freeShippingThreshold !== undefined &&
                store.freeShippingThreshold !== null
                  ? formatMoney(store.freeShippingThreshold)
                  : "غير محدد"
              }
            />
            <InfoRow
              icon="info"
              label="سياسة الشحن"
              value={displayValue(store.shippingPolicy)}
              rtl
            />
            <InfoRow
              icon="payment"
              label="وسائل الدفع"
              value={normalizePaymentMethods(store.paymentMethods, store.paymentMethod)}
              rtl
            />
            <InfoRow
              icon="payment"
              label="العملة"
              value={displayValue(store.currency || "EGP")}
            />
          </DataSection>
        </div>

        <aside className="space-y-5">
          <DataSection
            title="حالة التشغيل"
            description="مؤشر سريع عن جاهزية المتجر للعمل."
          >
            <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`store-profile-icon ${
                    store.isActive === false ? "red" : ""
                  }`}
                >
                  <Icon name={store.isActive === false ? "warning" : "check"} />
                </span>

                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {store.isActive === false ? "المتجر متوقف" : "المتجر يعمل"}
                  </p>

                  <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">
                    {store.isActive === false
                      ? "العملاء قد لا يتمكنون من استخدام المتجر بشكل طبيعي."
                      : "المتجر متاح للمعاينة والاستقبال الطبيعي للطلبات."}
                  </p>
                </div>
              </div>
            </div>

            <InfoRow icon="calendar" label="تاريخ الإنشاء" value={formatDate(store.createdAt)} />
            <InfoRow icon="calendar" label="آخر تحديث" value={formatDate(store.updatedAt)} />
            <InfoRow icon="info" label="كود المتجر" value={store.id} />
          </DataSection>

          <DataSection
            title="الهوية البصرية"
            description="ألوان المتجر الحالية التي يمكن استخدامها في الواجهة."
          >
            <ColorRow label="اللون الأساسي" color={primaryColor} />
            <ColorRow label="اللون الثانوي" color={secondaryColor} />
            <InfoRow
              icon="palette"
              label="رابط الشعار"
              value={displayValue(store.logoUrl)}
            />
            <InfoRow
              icon="palette"
              label="رابط الغلاف"
              value={displayValue(store.coverUrl || store.bannerUrl)}
            />
          </DataSection>

          <DataSection
            title="القنوات والروابط"
            description="روابط خارجية يمكن ربطها بواجهة المتجر لاحقًا."
          >
            <InfoRow icon="link" label="الموقع الإلكتروني" value={displayValue(store.website)} />
            <InfoRow icon="link" label="Facebook" value={displayValue(store.facebook)} />
            <InfoRow icon="link" label="Instagram" value={displayValue(store.instagram)} />
            <InfoRow icon="link" label="TikTok" value={displayValue(store.tiktok)} />
            <InfoRow icon="link" label="Snapchat" value={displayValue(store.snapchat)} />
            <InfoRow icon="link" label="X" value={displayValue(store.x)} />
          </DataSection>

          <section className="store-profile-card p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              إجراءات سريعة
            </h2>

            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={copyStoreLink}
                className="store-profile-action secondary justify-start"
              >
                <Icon name="copy" />
                نسخ رابط المتجر
              </button>

              <button
                type="button"
                onClick={copyStoreId}
                className="store-profile-action secondary justify-start"
              >
                <Icon name="copy" />
                نسخ كود المتجر
              </button>

              <button
                type="button"
                onClick={loadStore}
                className="store-profile-action secondary justify-start"
              >
                <Icon name="refresh" />
                تحديث البيانات
              </button>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  note,
  icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: "products" | "orders" | "customers" | "shipping";
}) {
  return (
    <article className="store-profile-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="store-profile-value mt-4" dir="ltr">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {note}
          </p>
        </div>

        <span className="store-profile-icon">
          <Icon name={icon} />
        </span>
      </div>
    </article>
  );
}

function DataSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="store-profile-card p-5">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {description}
          </p>
        )}
      </div>

      <div>{children}</div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
  rtl,
}: {
  icon: IconName;
  label: string;
  value: string;
  rtl?: boolean;
}) {
  return (
    <div className="store-info-row">
      <span className="store-info-label">
        <Icon name={icon} className="h-4 w-4" />
        {label}
      </span>

      <span className={`store-info-value ${rtl ? "rtl" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function ColorRow({ label, color }: { label: string; color: string }) {
  return (
    <div className="store-info-row">
      <span className="store-info-label">
        <Icon name="palette" className="h-4 w-4" />
        {label}
      </span>

      <span className="store-info-value">
        <span className="store-color-swatch">
          <span
            className="store-color-dot"
            style={{
              backgroundColor: color,
            }}
          />
          {color}
        </span>
      </span>
    </div>
  );
}

function StoreProfileSkeleton() {
  return (
    <>
      <section className="store-profile-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <div className="store-profile-skeleton h-8 w-36" />

            <div className="store-hero-identity mt-5">
              <div className="store-profile-skeleton h-[92px] w-[92px] rounded-[28px]" />

              <div className="w-full">
                <div className="store-profile-skeleton h-9 w-72 max-w-full" />
                <div className="store-profile-skeleton mt-4 h-4 w-[520px] max-w-full" />
                <div className="store-profile-skeleton mt-3 h-4 w-[390px] max-w-full" />

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="store-profile-skeleton h-8 w-24 rounded-full" />
                  <div className="store-profile-skeleton h-8 w-28 rounded-full" />
                  <div className="store-profile-skeleton h-8 w-36 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="store-profile-skeleton h-11 w-full" />
            <div className="store-profile-skeleton h-11 w-full" />
            <div className="store-profile-skeleton h-11 w-full" />
            <div className="store-profile-skeleton h-11 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="store-profile-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="w-full">
                <div className="store-profile-skeleton h-4 w-28" />
                <div className="store-profile-skeleton mt-4 h-8 w-24" />
                <div className="store-profile-skeleton mt-3 h-3 w-36" />
              </div>

              <div className="store-profile-skeleton h-10 w-10 rounded-[14px]" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          {[1, 2, 3].map((section) => (
            <div key={section} className="store-profile-card p-5">
              <div className="store-profile-skeleton h-6 w-40" />
              <div className="store-profile-skeleton mt-3 h-4 w-72 max-w-full" />

              <div className="mt-6 space-y-4">
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="flex justify-between gap-5">
                    <div className="store-profile-skeleton h-4 w-28" />
                    <div className="store-profile-skeleton h-4 w-44" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-5">
          {[1, 2, 3].map((section) => (
            <div key={section} className="store-profile-card p-5">
              <div className="store-profile-skeleton h-6 w-36" />
              <div className="store-profile-skeleton mt-3 h-4 w-56" />

              <div className="mt-6 space-y-4">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="store-profile-skeleton h-12 w-full" />
                ))}
              </div>
            </div>
          ))}
        </aside>
      </section>
    </>
  );
}