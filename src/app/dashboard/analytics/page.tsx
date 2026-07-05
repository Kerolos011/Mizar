"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type Store = {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
  category?: string | null;
};

type AnalyticsSummary = {
  totalSales: number;
  totalOrders: number;
  activeOrders: number;
  newOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  completedOnlyOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  customersCount: number;
  productsCount: number;
};

type StatusSummary = {
  status: string;
  label: string;
  count: number;
  total: number;
};

type TopProduct = {
  productId: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  sales: number;
};

type SalesDay = {
  date: string;
  label: string;
  total: number;
  orders: number;
};

type LatestOrder = {
  id: string;
  total: number;
  status: string;
  statusLabel: string;
  createdAt: string;
  itemsCount: number;
  store?: {
    id: string;
    name: string;
    slug: string;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
    city: string;
  };
};

type AnalyticsData = {
  summary: AnalyticsSummary;
  stats?: AnalyticsSummary;
  statusSummary: StatusSummary[];
  topProducts: TopProduct[];
  salesLast7Days: SalesDay[];
  latestOrders: LatestOrder[];
};

type IconName =
  | "analytics"
  | "refresh"
  | "external"
  | "orders"
  | "customers"
  | "products"
  | "sales"
  | "average"
  | "active"
  | "new"
  | "processing"
  | "truck"
  | "check"
  | "close"
  | "chart"
  | "donut"
  | "trophy"
  | "clock"
  | "store"
  | "warning"
  | "spark"
  | "money"
  | "eye"
  | "calendar"
  | "trendUp"
  | "trendDown"
  | "empty"
  | "chevron";

const analyticsStyles = `
.analytics-page {
  color: var(--text-main);
}

.analytics-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.analytics-hero {
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

.analytics-pill {
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

.analytics-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.analytics-action {
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

.analytics-action:hover {
  transform: translateY(-1px);
}

.analytics-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.analytics-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.analytics-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.analytics-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.analytics-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.analytics-icon.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.analytics-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.analytics-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.analytics-icon.blue {
  background: rgba(59, 130, 246, 0.09);
  color: #2563eb;
}

.analytics-icon.purple {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
}

.analytics-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.analytics-small-value {
  font-family: var(--font-en);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.analytics-select {
  width: 100%;
  min-height: 44px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  background: #ffffff;
  color: var(--foreground);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  padding: 10px 13px;
  transition:
    border-color 180ms var(--ease-premium),
    box-shadow 180ms var(--ease-premium),
    background 180ms var(--ease-premium);
}

.analytics-select:focus {
  border-color: rgba(46, 217, 179, 0.52);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.10);
}

.analytics-modern-select-wrap {
  position: relative;
}

.analytics-modern-select-wrap::before {
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

.analytics-modern-select {
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

.analytics-select-chevron {
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

.analytics-mini-bars {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 28px;
}

.analytics-mini-bar {
  width: 6px;
  min-height: 5px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(46, 217, 179, 0.95), rgba(46, 217, 179, 0.22));
  animation: analytics-bar-rise 900ms var(--ease-premium) both;
}

.analytics-mini-bar.gold {
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.92), rgba(245, 158, 11, 0.18));
}

.analytics-mini-bar.blue {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.9), rgba(59, 130, 246, 0.16));
}

.analytics-chart-card {
  position: relative;
  overflow: hidden;
}

.analytics-chart-card::before {
  content: "";
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(46, 217, 179, 0.42), transparent);
}

.analytics-chart-svg {
  width: 100%;
  height: auto;
  min-height: 240px;
  overflow: visible;
}

.analytics-area-fill {
  opacity: 0;
  animation: analytics-fade-up 900ms var(--ease-premium) 250ms both;
}

.analytics-line-path {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: analytics-draw-line 1.25s var(--ease-premium) forwards;
}

.analytics-point {
  opacity: 0;
  transform-origin: center;
  animation: analytics-pop 520ms var(--ease-premium) forwards;
}

.analytics-grid-line {
  stroke: rgba(148, 163, 184, 0.22);
  stroke-width: 1;
}

.analytics-axis-label {
  fill: rgba(100, 116, 139, 0.9);
  font-size: 11px;
  font-weight: 700;
}

.analytics-donut-segment {
  transition: stroke-dashoffset 700ms var(--ease-premium);
  animation: analytics-donut-draw 1s var(--ease-premium) both;
}

.analytics-donut-bg {
  stroke: rgba(226, 232, 240, 0.95);
}

.analytics-horizontal-bar-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.78);
}

.analytics-horizontal-bar {
  height: 100%;
  width: var(--bar-width);
  border-radius: 999px;
  background: linear-gradient(90deg, var(--primary), var(--mint));
  animation: analytics-grow-width 900ms var(--ease-premium) both;
}

.analytics-horizontal-bar.gold {
  background: linear-gradient(90deg, #b45309, var(--gold));
}

.analytics-horizontal-bar.blue {
  background: linear-gradient(90deg, #1d4ed8, #60a5fa);
}

.analytics-funnel-row {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
}

.analytics-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid transparent;
}

.analytics-status.new {
  background: rgba(59, 130, 246, 0.10);
  border-color: rgba(59, 130, 246, 0.18);
  color: #2563eb;
}

.analytics-status.processing {
  background: rgba(245, 158, 11, 0.11);
  border-color: rgba(245, 158, 11, 0.22);
  color: #b45309;
}

.analytics-status.shipped {
  background: rgba(124, 58, 237, 0.10);
  border-color: rgba(124, 58, 237, 0.18);
  color: #7c3aed;
}

.analytics-status.delivered,
.analytics-status.completed {
  background: rgba(16, 185, 129, 0.10);
  border-color: rgba(16, 185, 129, 0.18);
  color: #047857;
}

.analytics-status.cancelled {
  background: rgba(239, 68, 68, 0.10);
  border-color: rgba(239, 68, 68, 0.18);
  color: #dc2626;
}

.analytics-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.analytics-product-thumb {
  width: 58px;
  height: 58px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 17px;
  background: #f8fafc;
}

.analytics-product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.analytics-mini-card {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
}

.analytics-insight {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(46, 217, 179, 0.18);
  border-radius: 20px;
  background:
    radial-gradient(circle at 0% 0%, rgba(46, 217, 179, 0.10), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 16px;
}

.analytics-insight.warning {
  border-color: rgba(245, 158, 11, 0.25);
  background:
    radial-gradient(circle at 0% 0%, rgba(245, 158, 11, 0.12), transparent 34%),
    #ffffff;
}

.analytics-insight.danger {
  border-color: rgba(239, 68, 68, 0.20);
  background:
    radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.10), transparent 34%),
    #ffffff;
}

.analytics-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.analytics-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
  animation: analytics-skeleton-shimmer 1.25s infinite;
}

@keyframes analytics-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@keyframes analytics-draw-line {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes analytics-donut-draw {
  from {
    opacity: 0;
    stroke-dasharray: 0 999;
  }
  to {
    opacity: 1;
  }
}

@keyframes analytics-pop {
  from {
    opacity: 0;
    transform: scale(0.72);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes analytics-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes analytics-grow-width {
  from {
    width: 0;
  }
  to {
    width: var(--bar-width);
  }
}

@keyframes analytics-bar-rise {
  from {
    transform: scaleY(0.2);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .analytics-card,
  .analytics-hero {
    border-radius: 18px;
  }

  .analytics-action {
    width: 100%;
  }

  .analytics-value {
    font-size: 24px;
  }

  .analytics-chart-svg {
    min-height: 210px;
  }
}
`;

function emptySummary(): AnalyticsSummary {
  return {
    totalSales: 0,
    totalOrders: 0,
    activeOrders: 0,
    newOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0,
    completedOnlyOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    customersCount: 0,
    productsCount: 0,
  };
}

function emptyAnalytics(): AnalyticsData {
  return {
    summary: emptySummary(),
    statusSummary: [],
    topProducts: [],
    salesLast7Days: [],
    latestOrders: [],
  };
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

function formatMoney(value: number | string | null | undefined) {
  return `${formatNumber(value)} ج.م`;
}

function formatPercent(value: number | string | null | undefined) {
  return `${toNumber(value, 0).toLocaleString("en-US", {
    maximumFractionDigits: 1,
  })}%`;
}

function formatDate(value?: string) {
  if (!value) return "غير متوفر";

  return new Date(value).toLocaleString("ar-EG-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeSummary(summary: Partial<AnalyticsSummary> | null | undefined) {
  return {
    totalSales: toNumber(summary?.totalSales, 0),
    totalOrders: toNumber(summary?.totalOrders, 0),
    activeOrders: toNumber(summary?.activeOrders, 0),
    newOrders: toNumber(summary?.newOrders, 0),
    processingOrders: toNumber(summary?.processingOrders, 0),
    shippedOrders: toNumber(summary?.shippedOrders, 0),
    deliveredOrders: toNumber(summary?.deliveredOrders, 0),
    completedOrders: toNumber(summary?.completedOrders, 0),
    completedOnlyOrders: toNumber(summary?.completedOnlyOrders, 0),
    cancelledOrders: toNumber(summary?.cancelledOrders, 0),
    averageOrderValue: toNumber(summary?.averageOrderValue, 0),
    customersCount: toNumber(summary?.customersCount, 0),
    productsCount: toNumber(summary?.productsCount, 0),
  };
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    NEW: "طلب جديد",
    PROCESSING: "قيد التجهيز",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التسليم",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
  };

  return labels[status] || status || "غير محدد";
}

function getStatusClass(status: string) {
  if (status === "NEW") return "new";
  if (status === "PROCESSING") return "processing";
  if (status === "SHIPPED") return "shipped";
  if (status === "DELIVERED") return "delivered";
  if (status === "COMPLETED") return "completed";
  if (status === "CANCELLED") return "cancelled";
  return "new";
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    NEW: "#2563eb",
    PROCESSING: "#f59e0b",
    SHIPPED: "#7c3aed",
    DELIVERED: "#10b981",
    COMPLETED: "#2ed9b3",
    CANCELLED: "#dc2626",
  };

  return colors[status] || "#18213f";
}

function getTrend(current: number, previous: number) {
  if (previous <= 0 && current <= 0) {
    return {
      label: "لا يوجد تغير",
      value: 0,
      direction: "flat" as const,
    };
  }

  if (previous <= 0) {
    return {
      label: "+100%",
      value: 100,
      direction: "up" as const,
    };
  }

  const value = ((current - previous) / previous) * 100;

  return {
    label: `${value >= 0 ? "+" : ""}${formatPercent(value)}`,
    value,
    direction: value >= 0 ? ("up" as const) : ("down" as const),
  };
}

function getDailyMax(days: SalesDay[], key: "total" | "orders") {
  return Math.max(...days.map((day) => toNumber(day[key], 0)), 1);
}

function getBestDay(days: SalesDay[]) {
  if (days.length === 0) return null;

  return days.reduce<SalesDay>((best, day) => {
    return toNumber(day.total, 0) > toNumber(best.total, 0) ? day : best;
  }, days[0]);
}

function getLatestDayTrend(days: SalesDay[]) {
  if (days.length < 2) {
    return {
      label: "لا يوجد مقارنة",
      value: 0,
      direction: "flat" as const,
    };
  }

  const lastDay = days[days.length - 1];
  const previousDay = days[days.length - 2];

  return getTrend(toNumber(lastDay.total, 0), toNumber(previousDay.total, 0));
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

  if (name === "analytics" || name === "chart") {
    return (
      <svg {...props}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 15v-4" />
        <path d="M12 15V8" />
        <path d="M16 15v-6" />
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

  if (name === "products") {
    return (
      <svg {...props}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "sales" || name === "money" || name === "average") {
    return (
      <svg {...props}>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }

  if (name === "active" || name === "spark") {
    return (
      <svg {...props}>
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
        <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
      </svg>
    );
  }

  if (name === "new" || name === "clock") {
    return (
      <svg {...props}>
        <path d="M12 8v5l3 2" />
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      </svg>
    );
  }

  if (name === "processing") {
    return (
      <svg {...props}>
        <path d="M12 6v6l4 2" />
        <path d="M21 12a9 9 0 1 1-2.6-6.4" />
        <path d="M21 4v6h-6" />
      </svg>
    );
  }

  if (name === "truck") {
    return (
      <svg {...props}>
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7" />
        <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
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

  if (name === "close") {
    return (
      <svg {...props}>
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
      </svg>
    );
  }

  if (name === "donut") {
    return (
      <svg {...props}>
        <path d="M21 12a9 9 0 1 1-9-9" />
        <path d="M12 3a9 9 0 0 1 9 9h-9V3Z" />
      </svg>
    );
  }

  if (name === "trophy") {
    return (
      <svg {...props}>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
        <path d="M7 6H4a2 2 0 0 0 2 4h1" />
        <path d="M17 6h3a2 2 0 0 1-2 4h-1" />
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

  if (name === "warning") {
    return (
      <svg {...props}>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
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

  if (name === "trendUp") {
    return (
      <svg {...props}>
        <path d="M4 16l5-5 4 4 7-8" />
        <path d="M14 7h6v6" />
      </svg>
    );
  }

  if (name === "trendDown") {
    return (
      <svg {...props}>
        <path d="M4 8l5 5 4-4 7 8" />
        <path d="M14 17h6v-6" />
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

export default function DashboardAnalyticsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData>(emptyAnalytics());

  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const activeStore = useMemo(() => {
    return stores.find((store) => store.id === activeStoreId) || stores[0] || null;
  }, [stores, activeStoreId]);

  const hasAnyData = analytics.summary.totalOrders > 0;

  const bestDay = useMemo(() => {
    return getBestDay(analytics.salesLast7Days);
  }, [analytics.salesLast7Days]);

  const latestTrend = useMemo(() => {
    return getLatestDayTrend(analytics.salesLast7Days);
  }, [analytics.salesLast7Days]);

  const maxDailySales = useMemo(() => {
    return getDailyMax(analytics.salesLast7Days, "total");
  }, [analytics.salesLast7Days]);

  const maxDailyOrders = useMemo(() => {
    return getDailyMax(analytics.salesLast7Days, "orders");
  }, [analytics.salesLast7Days]);

  const totalTopProductSales = useMemo(() => {
    return analytics.topProducts.reduce((sum, product) => sum + toNumber(product.sales, 0), 0);
  }, [analytics.topProducts]);

  const topProductsShare = useMemo(() => {
    if (analytics.summary.totalSales <= 0) return 0;

    return (totalTopProductSales / analytics.summary.totalSales) * 100;
  }, [analytics.summary.totalSales, totalTopProductSales]);

  const completedRate = useMemo(() => {
    if (analytics.summary.totalOrders <= 0) return 0;

    return (analytics.summary.completedOrders / analytics.summary.totalOrders) * 100;
  }, [analytics.summary.completedOrders, analytics.summary.totalOrders]);

  const cancelledRate = useMemo(() => {
    if (analytics.summary.totalOrders <= 0) return 0;

    return (analytics.summary.cancelledOrders / analytics.summary.totalOrders) * 100;
  }, [analytics.summary.cancelledOrders, analytics.summary.totalOrders]);

  const activeRate = useMemo(() => {
    if (analytics.summary.totalOrders <= 0) return 0;

    return (analytics.summary.activeOrders / analytics.summary.totalOrders) * 100;
  }, [analytics.summary.activeOrders, analytics.summary.totalOrders]);

  const bestProduct = analytics.topProducts[0] || null;

  async function loadStores() {
    setLoadingStores(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/stores?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل بيانات المتجر");
      }

      const loadedStores = Array.isArray(data.stores) ? (data.stores as Store[]) : [];

      setStores(loadedStores);

      if (loadedStores.length === 0) {
        setActiveStoreId("");
        setAnalytics(emptyAnalytics());
        return;
      }

      const savedStoreId =
        typeof window !== "undefined" ? localStorage.getItem("mizar-store-id") : "";

      const selectedStore =
        loadedStores.find((store) => store.id === savedStoreId) || loadedStores[0];

      setActiveStoreId(selectedStore.id);

      if (typeof window !== "undefined") {
        localStorage.setItem("mizar-store-id", selectedStore.id);
        localStorage.setItem("mizar-store-slug", selectedStore.slug);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل بيانات المتجر"
      );
    } finally {
      setLoadingStores(false);
    }
  }

  async function loadAnalytics(storeId = activeStoreId) {
    if (!storeId) return;

    setLoadingAnalytics(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/analytics?storeId=${storeId}&t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل التحليلات");
      }

      const summary = normalizeSummary(data.summary || data.stats || emptySummary());

      setAnalytics({
        summary,
        stats: summary,
        statusSummary: Array.isArray(data.statusSummary) ? data.statusSummary : [],
        topProducts: Array.isArray(data.topProducts) ? data.topProducts : [],
        salesLast7Days: Array.isArray(data.salesLast7Days) ? data.salesLast7Days : [],
        latestOrders: Array.isArray(data.latestOrders) ? data.latestOrders : [],
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل التحليلات"
      );

      setAnalytics(emptyAnalytics());
    } finally {
      setLoadingAnalytics(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (activeStoreId) {
      loadAnalytics(activeStoreId);
    }
  }, [activeStoreId]);

  if (loadingStores) {
    return (
      <main className="analytics-page space-y-5" dir="rtl">
        <style>{analyticsStyles}</style>
        <AnalyticsSkeleton />
      </main>
    );
  }

  if (stores.length === 0) {
    return (
      <main className="analytics-page space-y-5" dir="rtl">
        <style>{analyticsStyles}</style>

        <section className="analytics-card p-8 text-center">
          <div className="analytics-icon red mx-auto">
            <Icon name="warning" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            لا يوجد متجر مرتبط بحسابك
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
            التحليلات ستظهر بعد إعداد المتجر واستقبال الطلبات.
          </p>

          <Link href="/merchant/welcome" className="analytics-action primary mt-6">
            إعداد المتجر
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="analytics-page space-y-5" dir="rtl">
      <style>{analyticsStyles}</style>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      {loadingAnalytics && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm font-semibold text-blue-600">
          جاري تحديث التحليلات...
        </div>
      )}

      <section className="analytics-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <span className="analytics-pill">لوحة التحليلات</span>

            <h1 className="mt-4 text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
              تحليلات {activeStore?.displayName || activeStore?.name || "المتجر"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              متابعة المبيعات والطلبات والعملاء وأداء المنتجات من خلال أرقام مباشرة
              وشارتات ديناميكية متحركة مناسبة لهوية ميزار.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                آخر 7 أيام
              </span>

              {activeStore?.category && (
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                  {activeStore.category}
                </span>
              )}

              {activeStore?.slug && (
                <span
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"
                  dir="ltr"
                >
                  /store/{activeStore.slug}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {stores.length > 1 && (
              <div className="analytics-modern-select-wrap">
                <select
                  className="analytics-select analytics-modern-select"
                  value={activeStoreId}
                  onChange={(event) => {
                    const nextStoreId = event.target.value;
                    const nextStore = stores.find((store) => store.id === nextStoreId);

                    setActiveStoreId(nextStoreId);

                    if (nextStore && typeof window !== "undefined") {
                      localStorage.setItem("mizar-store-id", nextStore.id);
                      localStorage.setItem("mizar-store-slug", nextStore.slug);
                    }
                  }}
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>

                <span className="analytics-select-chevron">
                  <Icon name="chevron" className="h-4 w-4" />
                </span>
              </div>
            )}

            <button type="button" onClick={() => loadAnalytics()} className="analytics-action primary">
              <Icon name="refresh" />
              تحديث التحليلات
            </button>

            <Link href="/dashboard/orders" className="analytics-action secondary">
              <Icon name="orders" />
              عرض الطلبات
            </Link>

            {activeStore?.slug && (
              <Link
                href={`/store/${activeStore.slug}`}
                target="_blank"
                rel="noreferrer"
                className="analytics-action secondary"
              >
                <Icon name="external" />
                معاينة المتجر
              </Link>
            )}
          </div>
        </div>
      </section>

      {!hasAnyData && !errorMessage && (
        <section className="analytics-card p-5">
          <div className="flex items-start gap-3">
            <span className="analytics-icon gold">
              <Icon name="warning" />
            </span>

            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                لا توجد طلبات بعد
              </h2>

              <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">
                الصفحة جاهزة، وستبدأ الشارتات والأرقام في الظهور تلقائيًا بعد تسجيل
                أول طلب داخل المتجر.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="إجمالي المبيعات"
          value={formatMoney(analytics.summary.totalSales)}
          note="إجمالي قيمة الطلبات"
          icon="sales"
          miniValues={analytics.salesLast7Days.map((day) => day.total)}
        />

        <MetricCard
          title="إجمالي الطلبات"
          value={formatNumber(analytics.summary.totalOrders)}
          note="كل الطلبات المسجلة"
          icon="orders"
          tone="blue"
          miniValues={analytics.salesLast7Days.map((day) => day.orders)}
        />

        <MetricCard
          title="متوسط قيمة الطلب"
          value={formatMoney(analytics.summary.averageOrderValue)}
          note="إجمالي المبيعات / الطلبات"
          icon="average"
          tone="gold"
          miniValues={analytics.salesLast7Days.map((day) => day.total)}
        />

        <MetricCard
          title="العملاء"
          value={formatNumber(analytics.summary.customersCount)}
          note="عدد العملاء المسجلين"
          icon="customers"
          tone="purple"
          miniValues={[
            analytics.summary.customersCount * 0.2,
            analytics.summary.customersCount * 0.4,
            analytics.summary.customersCount * 0.55,
            analytics.summary.customersCount * 0.7,
            analytics.summary.customersCount,
          ]}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="طلبات نشطة"
          value={formatNumber(analytics.summary.activeOrders)}
          note={`${formatPercent(activeRate)} من إجمالي الطلبات`}
          icon="active"
          tone="gold"
        />

        <MetricCard
          title="طلبات جديدة"
          value={formatNumber(analytics.summary.newOrders)}
          note="تحتاج متابعة"
          icon="new"
          tone="blue"
        />

        <MetricCard
          title="قيد التجهيز"
          value={formatNumber(analytics.summary.processingOrders)}
          note="داخل التشغيل"
          icon="processing"
          tone="gold"
        />

        <MetricCard
          title="المنتجات"
          value={formatNumber(analytics.summary.productsCount)}
          note="عدد المنتجات داخل المتجر"
          icon="products"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="تم الشحن"
          value={formatNumber(analytics.summary.shippedOrders)}
          note="طلبات في الطريق"
          icon="truck"
          tone="purple"
        />

        <MetricCard
          title="مكتملة / مسلمة"
          value={formatNumber(analytics.summary.completedOrders)}
          note={`${formatPercent(completedRate)} من إجمالي الطلبات`}
          icon="check"
        />

        <MetricCard
          title="طلبات ملغية"
          value={formatNumber(analytics.summary.cancelledOrders)}
          note={`${formatPercent(cancelledRate)} معدل الإلغاء`}
          icon="close"
          tone="red"
        />

        <MetricCard
          title="ترند آخر يوم"
          value={latestTrend.label}
          note="مقارنة بآخر يوم سابق"
          icon={latestTrend.direction === "down" ? "trendDown" : "trendUp"}
          tone={latestTrend.direction === "down" ? "red" : "blue"}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="analytics-card analytics-chart-card p-5">
          <SectionHeader
            icon="chart"
            title="منحنى المبيعات اليومي"
            description="شارت ديناميكي يوضح إجمالي المبيعات خلال آخر 7 أيام."
          />

          <div className="mt-5">
            <SalesAreaChart days={analytics.salesLast7Days} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SmallInsight
              icon="trophy"
              title="أفضل يوم"
              value={bestDay ? bestDay.label : "غير متوفر"}
              note={bestDay ? formatMoney(bestDay.total) : "لا توجد بيانات"}
            />

            <SmallInsight
              icon="orders"
              title="أعلى مبيعات يومية"
              value={bestDay ? formatMoney(bestDay.total) : "0 ج.م"}
              note={bestDay ? `${formatNumber(bestDay.orders)} طلب` : "لا توجد طلبات"}
            />

            <SmallInsight
              icon={latestTrend.direction === "down" ? "trendDown" : "trendUp"}
              title="مؤشر الحركة"
              value={latestTrend.label}
              note="آخر يوم مقابل اليوم السابق"
              danger={latestTrend.direction === "down"}
            />
          </div>
        </section>

        <section className="analytics-card analytics-chart-card p-5">
          <SectionHeader
            icon="donut"
            title="توزيع حالات الطلب"
            description="نسبة كل حالة من إجمالي الطلبات."
            small
          />

          <div className="mt-5">
            <StatusDonutChart items={analytics.statusSummary} totalOrders={analytics.summary.totalOrders} />
          </div>

          <div className="mt-5 space-y-3">
            {analytics.statusSummary.length === 0 ? (
              <EmptyMini text="لا توجد حالات طلبات بعد." />
            ) : (
              analytics.statusSummary.map((item) => {
                const percentage =
                  analytics.summary.totalOrders > 0
                    ? (toNumber(item.count, 0) / analytics.summary.totalOrders) * 100
                    : 0;

                return (
                  <div key={item.status} className="analytics-mini-card">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`analytics-status ${getStatusClass(item.status)}`}>
                        <span className="analytics-status-dot" />
                        {item.label || getStatusLabel(item.status)}
                      </span>

                      <strong className="font-[var(--font-en)] text-sm text-[var(--foreground)]">
                        {formatNumber(item.count)}
                      </strong>
                    </div>

                    <div className="analytics-horizontal-bar-track mt-3">
                      <div
                        className="analytics-horizontal-bar"
                        style={{ "--bar-width": `${Math.max(2, percentage)}%` } as CSSProperties}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)]">
                      <span>{formatPercent(percentage)}</span>
                      <span>{formatMoney(item.total)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="analytics-card analytics-chart-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] p-5">
            <SectionHeader
              icon="trophy"
              title="أفضل المنتجات"
              description="المنتجات الأعلى مبيعًا وإسهامها في المبيعات."
              small
            />
          </div>

          {analytics.topProducts.length === 0 ? (
            <EmptyState title="لا توجد مبيعات منتجات" description="أفضل المنتجات ستظهر بعد تسجيل الطلبات." />
          ) : (
            <div className="space-y-4 p-5">
              <TopProductsChart products={analytics.topProducts} totalSales={analytics.summary.totalSales} />

              <div className="analytics-insight">
                <div className="flex items-start gap-3">
                  <span className="analytics-icon">
                    <Icon name="spark" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      مساهمة أفضل المنتجات
                    </p>

                    <p className="mt-1 font-[var(--font-en)] text-2xl font-bold text-[var(--primary)]">
                      {formatPercent(topProductsShare)}
                    </p>

                    <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">
                      من إجمالي مبيعات المتجر الحالية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="analytics-card analytics-chart-card p-5">
          <SectionHeader
            icon="orders"
            title="عدد الطلبات اليومي"
            description="مقارنة عدد الطلبات بكل يوم مع قيمة المبيعات."
          />

          <div className="mt-5">
            <DailyOrdersBars days={analytics.salesLast7Days} maxOrders={maxDailyOrders} maxSales={maxDailySales} />
          </div>
        </section>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="analytics-card overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-soft)] p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                أحدث الطلبات
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                آخر الطلبات المستخدمة داخل التحليلات.
              </p>
            </div>

            <Link href="/dashboard/orders" className="analytics-action secondary">
              <Icon name="eye" />
              كل الطلبات
            </Link>
          </div>

          {analytics.latestOrders.length === 0 ? (
            <EmptyState title="لا توجد طلبات بعد" description="الطلبات الجديدة ستظهر هنا بعد أول عملية شراء." />
          ) : (
            <div className="divide-y divide-[var(--border-soft)]">
              {analytics.latestOrders.map((order) => (
                <article
                  key={order.id}
                  className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="font-[var(--font-en)] text-sm font-bold text-[var(--foreground)] transition hover:text-[var(--mint-hover)]"
                        dir="ltr"
                      >
                        #{order.id}
                      </Link>

                      <span className={`analytics-status ${getStatusClass(order.status)}`}>
                        <span className="analytics-status-dot" />
                        {order.statusLabel || getStatusLabel(order.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      {order.customer?.name || "عميل"} — {formatDate(order.createdAt)}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
                      عدد المنتجات: {formatNumber(order.itemsCount)}
                    </p>
                  </div>

                  <div className="text-start md:text-left">
                    <p className="font-[var(--font-en)] text-lg font-bold text-[var(--foreground)]">
                      {formatMoney(order.total)}
                    </p>

                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="mt-2 inline-flex text-xs font-bold text-[var(--mint-hover)]"
                    >
                      تفاصيل الطلب
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="analytics-card p-5">
            <SectionHeader
              icon="spark"
              title="ملخص ذكي"
              description="مؤشرات سريعة تساعدك تقرأ الأداء."
              small
            />

            <div className="mt-5 space-y-3">
              <InsightCard
                title="معدل الإكمال"
                value={formatPercent(completedRate)}
                note="كلما ارتفع الرقم كانت جودة التشغيل أفضل."
                icon="check"
              />

              <InsightCard
                title="معدل الإلغاء"
                value={formatPercent(cancelledRate)}
                note={cancelledRate > 20 ? "مرتفع ويحتاج مراجعة أسباب الإلغاء." : "ضمن مستوى مقبول حاليًا."}
                icon="close"
                danger={cancelledRate > 20}
              />

              <InsightCard
                title="أهم منتج"
                value={bestProduct?.name || "غير متوفر"}
                note={bestProduct ? `${formatMoney(bestProduct.sales)} مبيعات` : "لا توجد مبيعات منتجات بعد."}
                icon="trophy"
              />

              <InsightCard
                title="متوسط الطلب"
                value={formatMoney(analytics.summary.averageOrderValue)}
                note="استخدم عروض الباندل لرفع هذا الرقم."
                icon="average"
                warning
              />
            </div>
          </section>

          <section className="analytics-card p-5">
            <SectionHeader
              icon="chart"
              title="قمع الطلبات"
              description="انتقال الطلبات بين المراحل."
              small
            />

            <div className="mt-5 space-y-3">
              <FunnelRow
                label="طلبات جديدة"
                value={analytics.summary.newOrders}
                total={analytics.summary.totalOrders}
                tone="blue"
              />

              <FunnelRow
                label="قيد التجهيز"
                value={analytics.summary.processingOrders}
                total={analytics.summary.totalOrders}
                tone="gold"
              />

              <FunnelRow
                label="تم الشحن"
                value={analytics.summary.shippedOrders}
                total={analytics.summary.totalOrders}
                tone="purple"
              />

              <FunnelRow
                label="مكتملة / مسلمة"
                value={analytics.summary.completedOrders}
                total={analytics.summary.totalOrders}
              />

              <FunnelRow
                label="ملغية"
                value={analytics.summary.cancelledOrders}
                total={analytics.summary.totalOrders}
                tone="red"
              />
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  note,
  icon,
  tone,
  miniValues,
}: {
  title: string;
  value: string;
  note: string;
  icon: IconName;
  tone?: "gold" | "red" | "blue" | "purple";
  miniValues?: number[];
}) {
  const iconClass =
    tone === "red"
      ? "analytics-icon red"
      : tone === "gold"
        ? "analytics-icon gold"
        : tone === "blue"
          ? "analytics-icon blue"
          : tone === "purple"
            ? "analytics-icon purple"
            : "analytics-icon";

  const maxValue = Math.max(...(miniValues || []).map((item) => Math.abs(item)), 1);

  return (
    <article className="analytics-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>

          <p className="analytics-value mt-4 truncate" dir="ltr">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{note}</p>
        </div>

        <span className={iconClass}>
          <Icon name={icon} />
        </span>
      </div>

      {miniValues && miniValues.length > 0 && (
        <div className="analytics-mini-bars mt-5">
          {miniValues.slice(-9).map((item, index) => {
            const height = Math.max(18, (Math.abs(item) / maxValue) * 100);

            return (
              <span
                key={`${item}-${index}`}
                className={`analytics-mini-bar ${tone === "gold" ? "gold" : tone === "blue" ? "blue" : ""}`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 65}ms`,
                }}
              />
            );
          })}
        </div>
      )}
    </article>
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
      <span className="analytics-icon">
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

function SalesAreaChart({ days }: { days: SalesDay[] }) {
  if (days.length === 0) {
    return <EmptyChart title="لا توجد بيانات مبيعات يومية" />;
  }

  const width = 720;
  const height = 270;
  const paddingX = 44;
  const paddingTop = 22;
  const paddingBottom = 46;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxSales = getDailyMax(days, "total");

  const points = days.map((day, index) => {
    const x = paddingX + (index * chartWidth) / Math.max(days.length - 1, 1);
    const y = paddingTop + chartHeight - (toNumber(day.total, 0) / maxSales) * chartHeight;

    return {
      x,
      y,
      day,
    };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  const areaPath = [
    `M ${points[0].x} ${paddingTop + chartHeight}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${paddingTop + chartHeight}`,
    "Z",
  ].join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = paddingTop + chartHeight - ratio * chartHeight;
    const value = maxSales * ratio;

    return { y, value };
  });

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-white p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="analytics-chart-svg" role="img">
        <defs>
          <linearGradient id="analyticsSalesAreaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(46,217,179,0.32)" />
            <stop offset="100%" stopColor="rgba(46,217,179,0.02)" />
          </linearGradient>

          <linearGradient id="analyticsSalesLineGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#18213f" />
            <stop offset="55%" stopColor="#2ed9b3" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {gridLines.map((line) => (
          <g key={line.y}>
            <line
              className="analytics-grid-line"
              x1={paddingX}
              x2={width - paddingX}
              y1={line.y}
              y2={line.y}
            />
            <text className="analytics-axis-label" x={width - paddingX + 8} y={line.y + 4}>
              {formatNumber(line.value)}
            </text>
          </g>
        ))}

        <path className="analytics-area-fill" d={areaPath} fill="url(#analyticsSalesAreaGradient)" />

        <path
          className="analytics-line-path"
          d={linePath}
          fill="none"
          stroke="url(#analyticsSalesLineGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <g key={point.day.date}>
            <circle
              className="analytics-point"
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#ffffff"
              stroke="#2ed9b3"
              strokeWidth="3"
              style={{ animationDelay: `${350 + index * 90}ms` }}
            />

            <text
              className="analytics-axis-label"
              x={point.x}
              y={height - 18}
              textAnchor="middle"
            >
              {point.day.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DailyOrdersBars({
  days,
  maxOrders,
  maxSales,
}: {
  days: SalesDay[];
  maxOrders: number;
  maxSales: number;
}) {
  if (days.length === 0) {
    return <EmptyChart title="لا توجد بيانات طلبات يومية" />;
  }

  return (
    <div className="rounded-3xl border border-[var(--border-soft)] bg-white p-4">
      <div className="grid min-h-[280px] grid-cols-7 items-end gap-3">
        {days.map((day, index) => {
          const ordersHeight = Math.max(8, (toNumber(day.orders, 0) / maxOrders) * 100);
          const salesHeight = Math.max(8, (toNumber(day.total, 0) / maxSales) * 100);

          return (
            <div key={day.date} className="flex h-full min-h-[250px] flex-col justify-end gap-3">
              <div className="flex h-[190px] items-end justify-center gap-1.5">
                <div
                  className="w-4 rounded-full bg-[var(--mint)] shadow-sm"
                  style={{
                    height: `${ordersHeight}%`,
                    animation: "analytics-bar-rise 900ms var(--ease-premium) both",
                    animationDelay: `${index * 80}ms`,
                  }}
                  title={`${formatNumber(day.orders)} طلب`}
                />

                <div
                  className="w-4 rounded-full bg-[var(--gold)] shadow-sm"
                  style={{
                    height: `${salesHeight}%`,
                    animation: "analytics-bar-rise 900ms var(--ease-premium) both",
                    animationDelay: `${index * 100}ms`,
                  }}
                  title={formatMoney(day.total)}
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-[var(--foreground)]">
                  {day.label}
                </p>

                <p className="mt-1 font-[var(--font-en)] text-xs font-semibold text-[var(--muted-foreground)]">
                  {formatNumber(day.orders)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--mint)]" />
          عدد الطلبات
        </span>

        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--gold)]" />
          قيمة المبيعات
        </span>
      </div>
    </div>
  );
}

function StatusDonutChart({
  items,
  totalOrders,
}: {
  items: StatusSummary[];
  totalOrders: number;
}) {
  if (items.length === 0 || totalOrders <= 0) {
    return <EmptyChart title="لا توجد حالات طلبات" compact />;
  }

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid place-items-center">
      <div className="relative h-[240px] w-[240px]">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            className="analytics-donut-bg"
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="14"
          />

          {items.map((item, index) => {
            const value = toNumber(item.count, 0);
            const percentage = totalOrders > 0 ? value / totalOrders : 0;
            const dash = percentage * circumference;
            const currentOffset = offset;

            offset += dash;

            return (
              <circle
                key={item.status}
                className="analytics-donut-segment"
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={getStatusColor(item.status)}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-currentOffset}
                style={{ animationDelay: `${index * 120}ms` }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-[var(--font-en)] text-3xl font-bold text-[var(--foreground)]">
              {formatNumber(totalOrders)}
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
              إجمالي الطلبات
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopProductsChart({
  products,
  totalSales,
}: {
  products: TopProduct[];
  totalSales: number;
}) {
  const maxSales = Math.max(...products.map((product) => toNumber(product.sales, 0)), 1);

  return (
    <div className="space-y-4">
      {products.slice(0, 6).map((product, index) => {
        const sales = toNumber(product.sales, 0);
        const width = Math.max(4, (sales / maxSales) * 100);
        const share = totalSales > 0 ? (sales / totalSales) * 100 : 0;

        return (
          <article key={product.productId} className="analytics-mini-card">
            <div className="flex gap-3">
              <div className="analytics-product-thumb shrink-0">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[var(--muted-foreground)]">
                    <Icon name="products" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
                      الكمية: {formatNumber(product.quantity)} — {formatPercent(share)}
                    </p>
                  </div>

                  <strong className="shrink-0 font-[var(--font-en)] text-sm text-[var(--foreground)]">
                    {formatMoney(product.sales)}
                  </strong>
                </div>

                <div className="analytics-horizontal-bar-track mt-3">
                  <div
                    className={`analytics-horizontal-bar ${index === 0 ? "gold" : ""}`}
                    style={{ "--bar-width": `${width}%` } as CSSProperties}
                  />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SmallInsight({
  icon,
  title,
  value,
  note,
  danger,
}: {
  icon: IconName;
  title: string;
  value: string;
  note: string;
  danger?: boolean;
}) {
  return (
    <div className={`analytics-insight ${danger ? "danger" : ""}`}>
      <div className="flex items-start gap-3">
        <span className={`analytics-icon ${danger ? "red" : ""}`}>
          <Icon name={icon} />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="mt-2 truncate font-[var(--font-en)] text-lg font-bold text-[var(--foreground)]">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  note,
  icon,
  danger,
  warning,
}: {
  title: string;
  value: string;
  note: string;
  icon: IconName;
  danger?: boolean;
  warning?: boolean;
}) {
  const className = danger ? "danger" : warning ? "warning" : "";

  return (
    <article className={`analytics-insight ${className}`}>
      <div className="flex items-start gap-3">
        <span className={`analytics-icon ${danger ? "red" : warning ? "gold" : ""}`}>
          <Icon name={icon} />
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>

          <p className="mt-2 truncate font-[var(--font-en)] text-xl font-bold text-[var(--foreground)]">
            {value}
          </p>

          <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">
            {note}
          </p>
        </div>
      </div>
    </article>
  );
}

function FunnelRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone?: "gold" | "red" | "blue" | "purple";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="analytics-funnel-row">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>

        <p className="font-[var(--font-en)] text-sm font-bold text-[var(--foreground)]">
          {formatNumber(value)}
        </p>
      </div>

      <div className="analytics-horizontal-bar-track mt-3">
        <div
          className={`analytics-horizontal-bar ${
            tone === "gold" ? "gold" : tone === "blue" ? "blue" : ""
          }`}
          style={{ "--bar-width": `${Math.max(2, percentage)}%` } as CSSProperties}
        />
      </div>

      <p className="mt-2 text-xs font-semibold text-[var(--muted-foreground)]">
        {formatPercent(percentage)}
      </p>
    </div>
  );
}

function EmptyChart({ title, compact }: { title: string; compact?: boolean }) {
  return (
    <div
      className={`grid place-items-center rounded-3xl border border-dashed border-[var(--border)] bg-slate-50 text-center ${
        compact ? "min-h-[180px] p-5" : "min-h-[260px] p-8"
      }`}
    >
      <div>
        <div className="analytics-icon navy mx-auto">
          <Icon name="empty" />
        </div>

        <p className="mt-3 text-sm font-semibold text-[var(--muted-foreground)]">
          {title}
        </p>
      </div>
    </div>
  );
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-slate-50 p-5 text-center text-sm font-semibold text-[var(--muted-foreground)]">
      {text}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8 text-center">
      <div className="analytics-icon navy mx-auto">
        <Icon name="empty" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{title}</h3>

      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <section className="analytics-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <div className="analytics-skeleton h-8 w-36" />
            <div className="analytics-skeleton mt-5 h-9 w-72 max-w-full" />
            <div className="analytics-skeleton mt-4 h-4 w-[560px] max-w-full" />
            <div className="analytics-skeleton mt-3 h-4 w-[440px] max-w-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="analytics-skeleton h-11 w-full" />
            <div className="analytics-skeleton h-11 w-full" />
            <div className="analytics-skeleton h-11 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="analytics-card p-5">
            <div className="analytics-skeleton h-4 w-28" />
            <div className="analytics-skeleton mt-4 h-8 w-28" />
            <div className="analytics-skeleton mt-3 h-3 w-36" />
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="analytics-card p-5">
          <div className="analytics-skeleton h-7 w-44" />
          <div className="analytics-skeleton mt-6 h-[280px] w-full rounded-3xl" />
        </div>

        <div className="analytics-card p-5">
          <div className="analytics-skeleton h-7 w-44" />
          <div className="analytics-skeleton mx-auto mt-6 h-[220px] w-[220px] rounded-full" />
        </div>
      </section>
    </>
  );
}