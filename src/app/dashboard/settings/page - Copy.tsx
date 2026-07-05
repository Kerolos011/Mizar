"use client";

import Link from "next/link";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type Store = {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
  category?: string | null;
  theme?: string | null;
  template?: string | null;
  description?: string | null;

  logoUrl?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;

  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  contactEmail?: string | null;
  website?: string | null;

  country?: string | null;
  governorate?: string | null;
  city?: string | null;
  address?: string | null;

  shippingFee?: number | string | null;
  freeShippingThreshold?: number | string | null;
  shippingPolicy?: string | null;

  paymentMethod?: string | null;
  paymentMethods?: string[] | string | null;
  currency?: string | null;

  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;

  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  snapchat?: string | null;
  x?: string | null;

  isActive?: boolean | null;
  createdAt?: string;
  updatedAt?: string;

  _count?: {
    products?: number;
    orders?: number;
    customers?: number;
  };
};

type IconName =
  | "settings"
  | "store"
  | "palette"
  | "contact"
  | "location"
  | "shipping"
  | "payment"
  | "social"
  | "advanced"
  | "image"
  | "link"
  | "copy"
  | "save"
  | "refresh"
  | "external"
  | "check"
  | "warning"
  | "close"
  | "money"
  | "products"
  | "orders"
  | "customers"
  | "calendar"
  | "phone"
  | "mail"
  | "whatsapp"
  | "globe"
  | "eye"
  | "chevron";

const CATEGORIES = [
  { value: "Fashion", label: "أزياء وملابس" },
  { value: "Electronics", label: "إلكترونيات" },
  { value: "Beauty", label: "جمال وعناية" },
  { value: "Home", label: "منزل ومعيشة" },
  { value: "Food", label: "مطاعم وأغذية" },
  { value: "Sports", label: "رياضة" },
  { value: "Books", label: "كتب ومحتوى" },
  { value: "General", label: "متجر عام" },
];

const THEMES = [
  { value: "modern", label: "Modern — عصري" },
  { value: "classic", label: "Classic — كلاسيكي" },
  { value: "minimal", label: "Minimal — بسيط" },
];

const TEMPLATES = [
  { value: "GENERAL", label: "عام" },
  { value: "FASHION", label: "أزياء" },
  { value: "ELECTRONICS", label: "إلكترونيات" },
  { value: "BEAUTY", label: "جمال وعناية" },
  { value: "FOOD", label: "مطاعم وأغذية" },
  { value: "HOME", label: "منزل ومعيشة" },
];

const CURRENCIES = [
  { value: "EGP", label: "جنيه مصري — EGP" },
  { value: "SAR", label: "ريال سعودي — SAR" },
  { value: "KWD", label: "دينار كويتي — KWD" },
  { value: "AED", label: "درهم إماراتي — AED" },
  { value: "USD", label: "دولار أمريكي — USD" },
];

const PAYMENT_METHODS = [
  { value: "CASH_ON_DELIVERY", label: "الدفع عند الاستلام", note: "الأكثر استخدامًا للمتاجر الجديدة" },
  { value: "BANK_TRANSFER", label: "تحويل بنكي", note: "يعرض بيانات التحويل للعميل" },
  { value: "WALLET", label: "محفظة إلكترونية", note: "Vodafone Cash / STC Pay / المحافظ" },
  { value: "CARD", label: "بطاقة بنكية", note: "للدفع الإلكتروني عند تفعيله" },
];

const settingsPageStyles = `
.settings-page {
  color: var(--text-main);
}

.settings-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.settings-hero {
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

.settings-pill {
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

.settings-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.settings-action {
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

.settings-action:hover {
  transform: translateY(-1px);
}

.settings-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.settings-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.settings-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.settings-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.settings-action.danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
}

.settings-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.settings-icon.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.settings-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.settings-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.settings-icon.blue {
  background: rgba(59, 130, 246, 0.09);
  color: #2563eb;
}

.settings-icon.purple {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
}

.settings-stat-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.settings-input,
.settings-select,
.settings-textarea {
  width: 100%;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  background: #ffffff;
  color: var(--foreground);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  transition:
    border-color 180ms var(--ease-premium),
    box-shadow 180ms var(--ease-premium),
    background 180ms var(--ease-premium);
}

.settings-input,
.settings-select {
  min-height: 44px;
  padding: 10px 13px;
}

.settings-textarea {
  min-height: 118px;
  resize: vertical;
  padding: 12px 13px;
  line-height: 1.8;
}

.settings-input:focus,
.settings-select:focus,
.settings-textarea:focus {
  border-color: rgba(46, 217, 179, 0.52);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.10);
}

.settings-label {
  display: block;
  margin-bottom: 7px;
  color: var(--muted-foreground);
  font-size: 12px;
  font-weight: 700;
}

.settings-help {
  margin-top: 6px;
  color: var(--muted-foreground);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.7;
}

.settings-modern-select-wrap {
  position: relative;
}

.settings-modern-select-wrap::before {
  content: "";
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  width: 22px;
  height: 22px;
  border-radius: 9px;
  transform: translateY(-50%);
  background:
    radial-gradient(circle at 40% 35%, rgba(46, 217, 179, 0.9), rgba(46, 217, 179, 0.18));
  box-shadow: 0 0 0 5px rgba(46, 217, 179, 0.08);
}

.settings-modern-select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 48px;
  padding-left: 42px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: var(--foreground);
  box-shadow: 0 8px 20px rgba(24, 33, 63, 0.035);
}

.settings-select-chevron {
  pointer-events: none;
  position: absolute;
  left: 14px;
  top: 50%;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 10px;
  transform: translateY(-50%);
  color: rgba(24, 33, 63, 0.72);
  background: rgba(24, 33, 63, 0.045);
}

.settings-nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  padding: 12px 14px;
  color: var(--muted-foreground);
  font-size: 13px;
  font-weight: 800;
  transition:
    background 180ms var(--ease-premium),
    color 180ms var(--ease-premium),
    transform 180ms var(--ease-premium);
}

.settings-nav-link:hover {
  transform: translateX(-2px);
  background: rgba(216, 255, 245, 0.64);
  color: var(--mint-hover);
}

.settings-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 800;
}

.settings-status-pill.active {
  background: rgba(16, 185, 129, 0.10);
  color: #047857;
}

.settings-status-pill.inactive {
  background: rgba(239, 68, 68, 0.10);
  color: #dc2626;
}

.settings-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.settings-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
}

.settings-switch-track {
  position: relative;
  width: 54px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.5);
  transition: background 180ms var(--ease-premium);
}

.settings-switch-track.active {
  background: var(--mint);
}

.settings-switch-thumb {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.16);
  transition: transform 180ms var(--ease-premium);
}

.settings-switch-track.active .settings-switch-thumb {
  transform: translateX(-24px);
}

.settings-color-dot {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 15px;
  border: 1px solid rgba(226, 232, 240, 0.96);
  box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.45);
}

.settings-payment-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
  cursor: pointer;
  transition:
    border-color 180ms var(--ease-premium),
    background 180ms var(--ease-premium),
    transform 180ms var(--ease-premium);
}

.settings-payment-card:hover {
  transform: translateY(-1px);
  border-color: rgba(46, 217, 179, 0.32);
  background: #ffffff;
}

.settings-payment-card.active {
  border-color: rgba(46, 217, 179, 0.45);
  background: rgba(216, 255, 245, 0.50);
}

.settings-preview {
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 28px;
  background:
    radial-gradient(circle at 0% 0%, var(--preview-primary-soft), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.settings-logo-preview {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  overflow: hidden;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--preview-primary), var(--preview-secondary));
  color: #ffffff;
  font-family: var(--font-en);
  font-size: 26px;
  font-weight: 800;
  box-shadow: 0 18px 34px rgba(24, 33, 63, 0.14);
}

.settings-logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: inherit;
}

.settings-cover-preview {
  overflow: hidden;
  border-radius: 22px;
  min-height: 120px;
  background:
    radial-gradient(circle at 18% 20%, var(--preview-primary-soft), transparent 30%),
    linear-gradient(135deg, var(--preview-primary), var(--preview-secondary));
}

.settings-cover-preview img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.settings-mini-card {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
}

.settings-danger-zone {
  border: 1px solid rgba(239, 68, 68, 0.18);
  border-radius: 20px;
  background:
    radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.08), transparent 32%),
    #ffffff;
}

.settings-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.settings-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
  animation: settings-skeleton-shimmer 1.25s infinite;
}

@keyframes settings-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@media (max-width: 768px) {
  .settings-card,
  .settings-hero {
    border-radius: 18px;
  }

  .settings-action {
    width: 100%;
  }

  .settings-stat-value {
    font-size: 24px;
  }

  .settings-switch {
    align-items: flex-start;
  }
}
`;

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value: number | string | null | undefined) {
  return toNumber(value, 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function formatMoney(value: number | string | null | undefined, currency = "EGP") {
  const labels: Record<string, string> = {
    EGP: "ج.م",
    SAR: "ر.س",
    KWD: "د.ك",
    AED: "د.إ",
    USD: "$",
  };

  return `${formatNumber(value)} ${labels[currency] || currency || "ج.م"}`;
}

function formatDate(value?: string) {
  if (!value) return "غير متوفر";

  return new Date(value).toLocaleString("ar-EG-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizePaymentMethods(value: Store["paymentMethods"], fallback?: string | null) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    const cleanValue = value.trim();

    if (!cleanValue) return fallback ? [fallback] : ["CASH_ON_DELIVERY"];

    try {
      const parsed = JSON.parse(cleanValue);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      return cleanValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return fallback ? [fallback] : ["CASH_ON_DELIVERY"];
}

function getStoreUrl(slug: string) {
  if (typeof window === "undefined") return `/store/${slug}`;

  return `${window.location.origin}/store/${slug}`;
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

  if (name === "settings") {
    return (
      <svg {...props}>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19 12h2" />
        <path d="M3 12h2" />
        <path d="M12 3v2" />
        <path d="M12 19v2" />
        <path d="M18.4 5.6 17 7" />
        <path d="M7 17l-1.4 1.4" />
        <path d="M18.4 18.4 17 17" />
        <path d="M7 7 5.6 5.6" />
      </svg>
    );
  }

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

  if (name === "palette") {
    return (
      <svg {...props}>
        <path d="M12 3a9 9 0 0 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12h-3Z" />
        <path d="M7.5 10h.01" />
        <path d="M9.5 6.8h.01" />
        <path d="M14 6.5h.01" />
        <path d="M16.5 9.5h.01" />
      </svg>
    );
  }

  if (name === "contact") {
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

  if (name === "payment" || name === "money") {
    return (
      <svg {...props}>
        <path d="M3 6h18v12H3z" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </svg>
    );
  }

  if (name === "social" || name === "globe") {
    return (
      <svg {...props}>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path d="M3.6 9h16.8" />
        <path d="M3.6 15h16.8" />
        <path d="M12 3a14 14 0 0 1 0 18" />
        <path d="M12 3a14 14 0 0 0 0 18" />
      </svg>
    );
  }

  if (name === "advanced") {
    return (
      <svg {...props}>
        <path d="M4 7h16" />
        <path d="M7 12h10" />
        <path d="M10 17h4" />
      </svg>
    );
  }

  if (name === "image") {
    return (
      <svg {...props}>
        <path d="M4 5h16v14H4z" />
        <path d="m4 15 4-4 4 4 2-2 6 6" />
        <path d="M15 9h.01" />
      </svg>
    );
  }

  if (name === "link" || name === "copy") {
    return (
      <svg {...props}>
        <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1 1" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1-1" />
      </svg>
    );
  }

  if (name === "save" || name === "check") {
    return (
      <svg {...props}>
        <path d="M20 6 9 17l-5-5" />
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

  if (name === "external") {
    return (
      <svg {...props}>
        <path d="M14 4h6v6" />
        <path d="M10 14L20 4" />
        <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
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

  if (name === "close") {
    return (
      <svg {...props}>
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
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
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
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

  if (name === "phone" || name === "whatsapp") {
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

  if (name === "eye") {
    return (
      <svg {...props}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...props}>
        <path d="M6 9l6 6 6-6" />
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

export default function DashboardSettingsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("General");
  const [theme, setTheme] = useState("modern");
  const [template, setTemplate] = useState("GENERAL");
  const [description, setDescription] = useState("");

  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");

  const [country, setCountry] = useState("Egypt");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [shippingFee, setShippingFee] = useState("0");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [shippingPolicy, setShippingPolicy] = useState("");

  const [currency, setCurrency] = useState("EGP");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["CASH_ON_DELIVERY"]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState("CASH_ON_DELIVERY");


  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [snapchat, setSnapchat] = useState("");
  const [x, setX] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeStore = useMemo(() => {
    return stores.find((store) => store.id === activeStoreId) || stores[0] || null;
  }, [stores, activeStoreId]);

  const finalSlug = useMemo(() => {
    return normalizeSlug(slug || name);
  }, [slug, name]);

  const storePreviewStyle = {
    "--preview-primary": "var(--mint)",
    "--preview-secondary": "var(--primary)",
    "--preview-accent": "var(--gold)",
    "--preview-primary-soft": "rgba(46, 217, 179, 0.14)",
  } as CSSProperties;

  function fillForm(store: Store) {
    const methods = normalizePaymentMethods(store.paymentMethods, store.paymentMethod);

    setName(store.name || "");
    setSlug(store.slug || "");
    setCategory(store.category || "General");
    setTheme(store.theme || "modern");
    setTemplate(store.template || "GENERAL");
    setDescription(store.description || "");

    setLogoUrl(store.logoUrl || "");
    setCoverUrl(store.coverUrl || "");
    setBannerUrl(store.bannerUrl || "");

    setWhatsapp(store.whatsapp || "");
    setPhone(store.phone || "");
    setEmail(store.email || "");
    setContactEmail(store.contactEmail || "");
    setWebsite(store.website || "");

    setCountry(store.country || "Egypt");
    setGovernorate(store.governorate || "");
    setCity(store.city || "");
    setAddress(store.address || "");

    setShippingFee(String(store.shippingFee ?? 0));
    setFreeShippingThreshold(
      store.freeShippingThreshold === null || store.freeShippingThreshold === undefined
        ? ""
        : String(store.freeShippingThreshold)
    );
    setShippingPolicy(store.shippingPolicy || "");

    setCurrency(store.currency || "EGP");
    setPaymentMethods(methods);
    setDefaultPaymentMethod(store.paymentMethod || methods[0] || "CASH_ON_DELIVERY");


    setFacebook(store.facebook || "");
    setInstagram(store.instagram || "");
    setTiktok(store.tiktok || "");
    setSnapchat(store.snapchat || "");
    setX(store.x || "");

    setIsActive(store.isActive !== false);
  }

  async function loadStores() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/stores?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/merchant/login?next=/dashboard/settings";
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل إعدادات المتجر");
      }

      const loadedStores = Array.isArray(data.stores) ? (data.stores as Store[]) : [];

      setStores(loadedStores);

      if (loadedStores.length === 0) {
        setActiveStoreId("");
        return;
      }

      const savedStoreId =
        typeof window !== "undefined" ? localStorage.getItem("mizar-store-id") : "";

      const selectedStore =
        loadedStores.find((store) => store.id === savedStoreId) || loadedStores[0];

      setActiveStoreId(selectedStore.id);
      fillForm(selectedStore);

      if (typeof window !== "undefined") {
        localStorage.setItem("mizar-store-id", selectedStore.id);
        localStorage.setItem("mizar-store-slug", selectedStore.slug);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل الإعدادات"
      );
    } finally {
      setLoading(false);
    }
  }

  function selectStore(storeId: string) {
    const selectedStore = stores.find((store) => store.id === storeId);

    if (!selectedStore) return;

    setActiveStoreId(selectedStore.id);
    fillForm(selectedStore);
    setErrorMessage("");
    setSuccessMessage("");

    if (typeof window !== "undefined") {
      localStorage.setItem("mizar-store-id", selectedStore.id);
      localStorage.setItem("mizar-store-slug", selectedStore.slug);
    }
  }

  function togglePaymentMethod(value: string) {
    setPaymentMethods((current) => {
      const exists = current.includes(value);
      const next = exists ? current.filter((item) => item !== value) : [...current, value];

      if (next.length === 0) {
        setDefaultPaymentMethod("");
        return [];
      }

      if (!next.includes(defaultPaymentMethod)) {
        setDefaultPaymentMethod(next[0]);
      }

      return next;
    });
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeStore) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!name.trim()) throw new Error("اسم المتجر مطلوب");
      if (!finalSlug) throw new Error("رابط المتجر غير صالح");

      const shippingFeeNumber = Number(shippingFee || 0);
      const freeShippingThresholdNumber = freeShippingThreshold
        ? Number(freeShippingThreshold)
        : null;

      if (!Number.isFinite(shippingFeeNumber) || shippingFeeNumber < 0) {
        throw new Error("رسوم الشحن يجب أن تكون رقم صحيح أكبر من أو يساوي صفر");
      }

      if (
        freeShippingThresholdNumber !== null &&
        (!Number.isFinite(freeShippingThresholdNumber) || freeShippingThresholdNumber < 0)
      ) {
        throw new Error("حد الشحن المجاني يجب أن يكون رقم صحيح أكبر من أو يساوي صفر");
      }

      if (paymentMethods.length === 0) {
        throw new Error("اختر طريقة دفع واحدة على الأقل");
      }

      const selectedDefaultPaymentMethod =
        defaultPaymentMethod && paymentMethods.includes(defaultPaymentMethod)
          ? defaultPaymentMethod
          : paymentMethods[0];

      const payload = {
        name: name.trim(),
        slug: finalSlug,
        category,
        theme,
        template,
        description: description.trim() || null,

        logoUrl: logoUrl.trim() || null,
        coverUrl: coverUrl.trim() || null,
        bannerUrl: bannerUrl.trim() || null,

        whatsapp: whatsapp.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        contactEmail: contactEmail.trim() || null,
        website: website.trim() || null,

        country: country.trim() || null,
        governorate: governorate.trim() || null,
        city: city.trim() || null,
        address: address.trim() || null,

        shippingFee: shippingFeeNumber,
        freeShippingThreshold: freeShippingThresholdNumber,
        shippingPolicy: shippingPolicy.trim() || null,

        currency,
        paymentMethods,
        paymentMethod: selectedDefaultPaymentMethod,


        facebook: facebook.trim() || null,
        instagram: instagram.trim() || null,
        tiktok: tiktok.trim() || null,
        snapchat: snapchat.trim() || null,
        x: x.trim() || null,

        isActive,
      };

      const response = await fetch(`/api/stores/${activeStore.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل حفظ إعدادات المتجر");
      }

      const updatedStore = data.store as Store;

      setStores((currentStores) =>
        currentStores.map((store) => (store.id === updatedStore.id ? updatedStore : store))
      );

      setActiveStoreId(updatedStore.id);
      fillForm(updatedStore);

      if (typeof window !== "undefined") {
        localStorage.setItem("mizar-store-id", updatedStore.id);
        localStorage.setItem("mizar-store-slug", updatedStore.slug);
      }

      setSuccessMessage("تم حفظ إعدادات المتجر بنجاح");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء حفظ الإعدادات"
      );
    } finally {
      setSaving(false);
    }
  }

  async function copyStoreLink() {
    if (!activeStore) return;

    try {
      await navigator.clipboard.writeText(getStoreUrl(finalSlug || activeStore.slug));
      setSuccessMessage("تم نسخ رابط المتجر");
    } catch {
      setErrorMessage("تعذر نسخ رابط المتجر");
    }
  }

  async function copyStoreId() {
    if (!activeStore) return;

    try {
      await navigator.clipboard.writeText(activeStore.id);
      setSuccessMessage("تم نسخ كود المتجر");
    } catch {
      setErrorMessage("تعذر نسخ كود المتجر");
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  if (loading) {
    return (
      <main className="settings-page space-y-5" dir="rtl">
        <style>{settingsPageStyles}</style>
        <SettingsSkeleton />
      </main>
    );
  }

  if (stores.length === 0) {
    return (
      <main className="settings-page space-y-5" dir="rtl">
        <style>{settingsPageStyles}</style>

        <section className="settings-card p-8 text-center">
          <div className="settings-icon red mx-auto">
            <Icon name="warning" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            لا يوجد متجر مرتبط بحسابك
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
            إعدادات المتجر تظهر بعد إعداد المتجر الأول للحساب.
          </p>

          <Link href="/merchant/welcome" className="settings-action primary mt-6">
            إعداد المتجر
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="settings-page space-y-5" dir="rtl">
      <style>{settingsPageStyles}</style>

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

      <section className="settings-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <span className="settings-pill">إعدادات المتجر</span>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
                إعدادات {name || activeStore?.name || "المتجر"}
              </h1>

              <span className={`settings-status-pill ${isActive ? "active" : "inactive"}`}>
                <span className="settings-status-dot" />
                {isActive ? "المتجر نشط" : "المتجر متوقف"}
              </span>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              تحكم في بيانات المتجر، الصور، التواصل، الموقع، الشحن، الدفع،
              الروابط الاجتماعية، والإعدادات المتقدمة من مكان واحد.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                متجر واحد مرتبط بالحساب
              </span>

              <span
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"
                dir="ltr"
              >
                /store/{finalSlug || activeStore?.slug}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="button"
              onClick={() => document.getElementById("settings-form")?.requestSubmit()}
              disabled={saving}
              className="settings-action primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="save" />
              {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </button>

            <button type="button" onClick={loadStores} className="settings-action secondary">
              <Icon name="refresh" />
              تحديث البيانات
            </button>

            <button type="button" onClick={copyStoreLink} className="settings-action secondary">
              <Icon name="copy" />
              نسخ رابط المتجر
            </button>

            <Link
              href={`/store/${finalSlug || activeStore?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="settings-action secondary"
            >
              <Icon name="external" />
              معاينة المتجر
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="المنتجات"
          value={formatNumber(activeStore?._count?.products || 0)}
          note="إجمالي منتجات المتجر"
          icon="products"
        />

        <StatCard
          title="الطلبات"
          value={formatNumber(activeStore?._count?.orders || 0)}
          note="إجمالي الطلبات"
          icon="orders"
          tone="blue"
        />

        <StatCard
          title="العملاء"
          value={formatNumber(activeStore?._count?.customers || 0)}
          note="إجمالي العملاء"
          icon="customers"
          tone="purple"
        />

        <StatCard
          title="آخر تحديث"
          value={activeStore?.updatedAt ? "OK" : "-"}
          note={formatDate(activeStore?.updatedAt)}
          icon="calendar"
          tone="gold"
        />
      </section>

      <form id="settings-form" onSubmit={saveSettings} className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_390px]">
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          {stores.length > 1 && (
            <section className="settings-card p-5">
              <SectionHeader icon="store" title="المتجر الحالي" small />

              <div className="settings-modern-select-wrap mt-4">
                <select
                  className="settings-select settings-modern-select"
                  value={activeStoreId}
                  onChange={(event) => selectStore(event.target.value)}
                  disabled={saving}
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>

                <span className="settings-select-chevron">
                  <Icon name="chevron" className="h-4 w-4" />
                </span>
              </div>
            </section>
          )}

          <section className="settings-card p-4">
            <nav className="grid gap-1">
              <NavLink href="#basic" icon="store" label="البيانات الأساسية" />
              <NavLink href="#brand" icon="palette" label="الصور والمظهر" />
              <NavLink href="#contact" icon="contact" label="التواصل والموقع" />
              <NavLink href="#shipping" icon="shipping" label="الشحن والتوصيل" />
              <NavLink href="#payment" icon="payment" label="الدفع والعملة" />
              <NavLink href="#social" icon="social" label="السوشيال ميديا" />
              <NavLink href="#advanced" icon="advanced" label="الإعدادات المتقدمة" />
            </nav>
          </section>
        </aside>

        <section className="space-y-5">
          <SettingsSection
            id="basic"
            icon="store"
            title="البيانات الأساسية"
            description="البيانات التي تظهر للعملاء وتحدد هوية المتجر العامة."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="اسم المتجر">
                <input
                  className="settings-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={saving}
                  placeholder="مثال: Mizar Store"
                />
              </Field>

              <Field label="رابط المتجر">
                <input
                  className="settings-input"
                  value={slug}
                  onChange={(event) => setSlug(normalizeSlug(event.target.value))}
                  disabled={saving}
                  dir="ltr"
                  placeholder="my-store"
                />

                <p className="settings-help" dir="ltr">
                  /store/{finalSlug || "store-slug"}
                </p>
              </Field>

              <Field label="تصنيف المتجر">
                <ModernSelect value={category} onChange={setCategory} disabled={saving}>
                  {CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </ModernSelect>
              </Field>

              <Field label="نوع القالب">
                <ModernSelect value={template} onChange={setTemplate} disabled={saving}>
                  {TEMPLATES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </ModernSelect>
              </Field>

              <Field label="ستايل الواجهة">
                <ModernSelect value={theme} onChange={setTheme} disabled={saving}>
                  {THEMES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </ModernSelect>
              </Field>

              <SwitchRow
                title="حالة المتجر"
                description="إيقاف المتجر يخفيه أو يمنع استقبال الطلبات حسب إعدادات الـ API."
                checked={isActive}
                onChange={setIsActive}
                disabled={saving}
              />

              <div className="md:col-span-2">
                <Field label="وصف المتجر">
                  <textarea
                    className="settings-textarea"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    disabled={saving}
                    placeholder="اكتب وصف مختصر وواضح عن المتجر وما يقدمه للعملاء..."
                  />
                </Field>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id="brand"
            icon="palette"
            title="الصور والمظهر"
            description="تحكم في اللوجو وصور الغلاف فقط. ألوان واجهة المتجر أصبحت ثابتة داخل القالب المختار."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="رابط اللوجو">
                <input
                  className="settings-input"
                  value={logoUrl}
                  onChange={(event) => setLogoUrl(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="https://..."
                />
              </Field>

              <Field label="رابط صورة الغلاف">
                <input
                  className="settings-input"
                  value={coverUrl}
                  onChange={(event) => setCoverUrl(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="https://..."
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="رابط بانر المتجر">
                  <input
                    className="settings-input"
                    value={bannerUrl}
                    onChange={(event) => setBannerUrl(event.target.value)}
                    disabled={saving}
                    dir="ltr"
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <div className="md:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <div className="flex items-start gap-3">
                  <span className="settings-icon shrink-0">
                    <Icon name="palette" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[var(--foreground)]">
                      ألوان المتجر مرتبطة بالقالب المختار
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                      تم إلغاء تعديل الألوان من صفحة الإعدادات حتى يحتفظ كل قالب بهويته الخاصة.
                      لتغيير شكل وألوان المتجر انتقل إلى صفحة قوالب المتجر واختر قالبًا مختلفًا.
                    </p>
                    <Link
                      href="/dashboard/themes"
                      className="settings-action secondary mt-4"
                    >
                      <Icon name="palette" />
                      فتح قوالب المتجر
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id="contact"
            icon="contact"
            title="التواصل والموقع"
            description="بيانات التواصل والعنوان التي تساعد العميل على الوصول لك بسهولة."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="واتساب">
                <input
                  className="settings-input"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="+201000000000"
                />
              </Field>

              <Field label="رقم الهاتف">
                <input
                  className="settings-input"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="+201000000000"
                />
              </Field>

              <Field label="البريد الإلكتروني العام">
                <input
                  className="settings-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="store@example.com"
                />
              </Field>

              <Field label="بريد خدمة العملاء">
                <input
                  className="settings-input"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="support@example.com"
                />
              </Field>

              <Field label="الموقع الإلكتروني">
                <input
                  className="settings-input"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="https://example.com"
                />
              </Field>

              <Field label="الدولة">
                <input
                  className="settings-input"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  disabled={saving}
                  placeholder="Egypt"
                />
              </Field>

              <Field label="المحافظة / المنطقة">
                <input
                  className="settings-input"
                  value={governorate}
                  onChange={(event) => setGovernorate(event.target.value)}
                  disabled={saving}
                  placeholder="القاهرة"
                />
              </Field>

              <Field label="المدينة">
                <input
                  className="settings-input"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  disabled={saving}
                  placeholder="مدينة نصر"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="العنوان التفصيلي">
                  <textarea
                    className="settings-textarea"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    disabled={saving}
                    placeholder="اكتب عنوان المتجر أو نقطة الاستلام..."
                  />
                </Field>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id="shipping"
            icon="shipping"
            title="الشحن والتوصيل"
            description="حدد رسوم الشحن، حد الشحن المجاني، وسياسة التوصيل التي يراها العميل."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="رسوم الشحن الأساسية">
                <input
                  className="settings-input"
                  type="number"
                  min="0"
                  value={shippingFee}
                  onChange={(event) => setShippingFee(event.target.value)}
                  disabled={saving}
                />

                <p className="settings-help">
                  تظهر على الطلبات كرسوم شحن افتراضية.
                </p>
              </Field>

              <Field label="حد الشحن المجاني">
                <input
                  className="settings-input"
                  type="number"
                  min="0"
                  value={freeShippingThreshold}
                  onChange={(event) => setFreeShippingThreshold(event.target.value)}
                  disabled={saving}
                  placeholder="اختياري"
                />

                <p className="settings-help">
                  اتركه فارغًا إذا لم يكن هناك شحن مجاني.
                </p>
              </Field>

              <div className="md:col-span-2">
                <Field label="سياسة الشحن">
                  <textarea
                    className="settings-textarea"
                    value={shippingPolicy}
                    onChange={(event) => setShippingPolicy(event.target.value)}
                    disabled={saving}
                    placeholder="مثال: يتم التوصيل خلال 2-5 أيام عمل حسب المدينة..."
                  />
                </Field>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id="payment"
            icon="payment"
            title="الدفع والعملة"
            description="حدد العملة وطرق الدفع المتاحة للعميل داخل المتجر."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="عملة المتجر">
                <ModernSelect value={currency} onChange={setCurrency} disabled={saving}>
                  {CURRENCIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </ModernSelect>
              </Field>

              <Field label="طريقة الدفع الافتراضية">
                <ModernSelect
                  value={defaultPaymentMethod}
                  onChange={setDefaultPaymentMethod}
                  disabled={saving || paymentMethods.length === 0}
                >
                  {paymentMethods.map((method) => {
                    const info = PAYMENT_METHODS.find((item) => item.value === method);

                    return (
                      <option key={method} value={method}>
                        {info?.label || method}
                      </option>
                    );
                  })}
                </ModernSelect>
              </Field>

              <div className="md:col-span-2">
                <p className="settings-label">طرق الدفع المتاحة</p>

                <div className="grid gap-3 md:grid-cols-2">
                  {PAYMENT_METHODS.map((method) => {
                    const checked = paymentMethods.includes(method.value);

                    return (
                      <label
                        key={method.value}
                        className={`settings-payment-card ${checked ? "active" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePaymentMethod(method.value)}
                          disabled={saving}
                          className="mt-1 h-4 w-4"
                        />

                        <span>
                          <span className="block text-sm font-semibold text-[var(--foreground)]">
                            {method.label}
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                            {method.note}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id="social"
            icon="social"
            title="السوشيال ميديا"
            description="روابط حسابات المتجر الرسمية التي تظهر في واجهة المتجر."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Facebook">
                <input
                  className="settings-input"
                  value={facebook}
                  onChange={(event) => setFacebook(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="https://facebook.com/..."
                />
              </Field>

              <Field label="Instagram">
                <input
                  className="settings-input"
                  value={instagram}
                  onChange={(event) => setInstagram(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="https://instagram.com/..."
                />
              </Field>

              <Field label="TikTok">
                <input
                  className="settings-input"
                  value={tiktok}
                  onChange={(event) => setTiktok(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="https://tiktok.com/@..."
                />
              </Field>

              <Field label="Snapchat">
                <input
                  className="settings-input"
                  value={snapchat}
                  onChange={(event) => setSnapchat(event.target.value)}
                  disabled={saving}
                  dir="ltr"
                  placeholder="https://snapchat.com/..."
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="X / Twitter">
                  <input
                    className="settings-input"
                    value={x}
                    onChange={(event) => setX(event.target.value)}
                    disabled={saving}
                    dir="ltr"
                    placeholder="https://x.com/..."
                  />
                </Field>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id="advanced"
            icon="advanced"
            title="الإعدادات المتقدمة"
            description="تحكم في الرابط، الحالة، الكود الداخلي، وبيانات التشغيل."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="كود المتجر" value={activeStore?.id || "غير متوفر"} dir="ltr" />
              <InfoRow label="تاريخ الإنشاء" value={formatDate(activeStore?.createdAt)} />
              <InfoRow label="آخر تحديث" value={formatDate(activeStore?.updatedAt)} />
              <InfoRow label="الرابط النهائي" value={`/store/${finalSlug || activeStore?.slug}`} dir="ltr" />

              <div className="md:col-span-2">
                <div className="settings-danger-zone p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        إيقاف المتجر مؤقتًا
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                        استخدم هذا الاختيار عند الصيانة أو عدم الرغبة في استقبال طلبات جديدة.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsActive((current) => !current)}
                      disabled={saving}
                      className={`settings-action ${isActive ? "danger" : "primary"}`}
                    >
                      <Icon name={isActive ? "close" : "check"} />
                      {isActive ? "إيقاف المتجر" : "تشغيل المتجر"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        </section>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="settings-card p-5">
            <SectionHeader icon="eye" title="معاينة سريعة" description="شكل تقريبي لواجهة المتجر بعد التعديل." small />

            <div className="settings-preview mt-5" style={storePreviewStyle}>
              <div className="settings-cover-preview">
                {coverUrl || bannerUrl ? (
                  <img src={coverUrl || bannerUrl} alt={name || "Store cover"} />
                ) : null}
              </div>

              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="settings-logo-preview">
                    {logoUrl ? (
                      <img src={logoUrl} alt={name || "Store logo"} />
                    ) : (
                      (name || "M").slice(0, 1).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--muted-foreground)]">
                      {CATEGORIES.find((item) => item.value === category)?.label || category}
                    </p>

                    <h3 className="mt-1 truncate text-xl font-semibold text-[var(--foreground)]">
                      {name || "اسم المتجر"}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-xs leading-6 text-[var(--muted-foreground)]">
                      {description || "وصف المتجر سيظهر هنا للعملاء بشكل مختصر وواضح."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  <button
                    type="button"
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-white"
                    style={{ background: "var(--preview-primary)" }}
                  >
                    تصفح المنتجات
                  </button>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--foreground)] ring-1 ring-[var(--border)]">
                      الشحن: {formatMoney(shippingFee, currency)}
                    </span>

                    {freeShippingThreshold && (
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--foreground)] ring-1 ring-[var(--border)]">
                        مجاني فوق {formatMoney(freeShippingThreshold, currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="settings-card p-5">
            <SectionHeader icon="settings" title="ملخص الإعدادات" small />

            <div className="mt-5 grid gap-3">
              <SummaryItem label="الحالة" value={isActive ? "نشط" : "متوقف"} />
              <SummaryItem label="العملة" value={currency} />
              <SummaryItem label="طرق الدفع" value={formatNumber(paymentMethods.length)} />
              <SummaryItem label="الشحن الأساسي" value={formatMoney(shippingFee, currency)} />
              <SummaryItem label="القالب" value={template} />
              <SummaryItem label="الستايل" value={theme} />
            </div>
          </section>

          <section className="settings-card p-5">
            <button
              type="submit"
              disabled={saving}
              className="settings-action primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="save" />
              {saving ? "جاري حفظ الإعدادات..." : "حفظ كل الإعدادات"}
            </button>

            <button
              type="button"
              onClick={copyStoreLink}
              disabled={saving}
              className="settings-action secondary mt-3 w-full"
            >
              <Icon name="copy" />
              نسخ رابط المتجر
            </button>

            <button
              type="button"
              onClick={copyStoreId}
              disabled={saving}
              className="settings-action secondary mt-3 w-full"
            >
              <Icon name="link" />
              نسخ كود المتجر
            </button>

            <Link
              href="/dashboard/stores"
              className="settings-action secondary mt-3 w-full"
            >
              <Icon name="store" />
              صفحة المتجر
            </Link>
          </section>
        </aside>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="settings-label">{label}</span>
      {children}
    </label>
  );
}

function ModernSelect({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="settings-modern-select-wrap">
      <select
        className="settings-select settings-modern-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {children}
      </select>

      <span className="settings-select-chevron">
        <Icon name="chevron" className="h-4 w-4" />
      </span>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  small,
}: {
  icon: IconName;
  title: string;
  description?: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="settings-icon">
        <Icon name={icon} />
      </span>

      <div>
        <h2 className={`font-semibold text-[var(--foreground)] ${small ? "text-lg" : "text-xl"}`}>
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function SettingsSection({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="settings-card scroll-mt-24 p-5">
      <SectionHeader icon={icon} title={title} description={description} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: IconName; label: string }) {
  return (
    <a href={href} className="settings-nav-link">
      <Icon name={icon} />
      {label}
    </a>
  );
}

function SwitchRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className="settings-switch text-start disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span>
        <span className="block text-sm font-semibold text-[var(--foreground)]">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
          {description}
        </span>
      </span>

      <span className={`settings-switch-track ${checked ? "active" : ""}`}>
        <span className="settings-switch-thumb" />
      </span>
    </button>
  );
}

function StatCard({
  title,
  value,
  note,
  icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: IconName;
  tone?: "gold" | "red" | "blue" | "purple";
}) {
  const iconClass =
    tone === "red"
      ? "settings-icon red"
      : tone === "gold"
        ? "settings-icon gold"
        : tone === "blue"
          ? "settings-icon blue"
          : tone === "purple"
            ? "settings-icon purple"
            : "settings-icon";

  return (
    <article className="settings-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="settings-stat-value mt-4" dir="ltr">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {note}
          </p>
        </div>

        <span className={iconClass}>
          <Icon name={icon} />
        </span>
      </div>
    </article>
  );
}

function InfoRow({
  label,
  value,
  dir = "rtl",
}: {
  label: string;
  value: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="settings-mini-card">
      <p className="text-xs font-semibold text-[var(--muted-foreground)]">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-[var(--foreground)]" dir={dir}>
        {value}
      </p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-white p-3">
      <span className="text-sm font-semibold text-[var(--muted-foreground)]">
        {label}
      </span>

      <strong className="font-[var(--font-en)] text-sm font-bold text-[var(--foreground)]">
        {value}
      </strong>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <>
      <section className="settings-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <div className="settings-skeleton h-8 w-36" />
            <div className="settings-skeleton mt-5 h-9 w-72 max-w-full" />
            <div className="settings-skeleton mt-4 h-4 w-[560px] max-w-full" />
            <div className="settings-skeleton mt-3 h-4 w-[440px] max-w-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="settings-skeleton h-11 w-full" />
            <div className="settings-skeleton h-11 w-full" />
            <div className="settings-skeleton h-11 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="settings-card p-5">
            <div className="settings-skeleton h-4 w-28" />
            <div className="settings-skeleton mt-4 h-8 w-20" />
            <div className="settings-skeleton mt-3 h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_390px]">
        <div className="settings-card p-5">
          <div className="settings-skeleton h-10 w-full" />
          <div className="settings-skeleton mt-3 h-10 w-full" />
          <div className="settings-skeleton mt-3 h-10 w-full" />
        </div>

        <div className="space-y-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="settings-card p-5">
              <div className="settings-skeleton h-7 w-44" />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="settings-skeleton h-11 w-full" />
                <div className="settings-skeleton h-11 w-full" />
                <div className="settings-skeleton h-28 w-full md:col-span-2" />
              </div>
            </div>
          ))}
        </div>

        <div className="settings-card p-5">
          <div className="settings-skeleton h-7 w-44" />
          <div className="settings-skeleton mt-6 h-[300px] w-full rounded-[28px]" />
        </div>
      </section>
    </>
  );
}