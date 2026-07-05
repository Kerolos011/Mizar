"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "NEW"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"
  | "SHIPPED"
  | "DELIVERED";

type ProductMedia = {
  id?: string;
  type?: "IMAGE" | "VIDEO" | string;
  url: string;
  thumbnailUrl?: string | null;
  sortOrder?: number | null;
  isCover?: boolean | null;
};

type Product = {
  id: string;
  name: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  stock?: number | string;
  imageUrl?: string | null;
  category?: string | null;
  media?: ProductMedia[];
};

type ProductVariant = {
  id: string;
  title: string;
  sku?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  options?: Record<string, string> | null;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  quantity?: number | string | null;
  availableQuantity?: number | string | null;
  status?: string | null;
  media?: ProductMedia[];
};

type OrderItem = {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number | string;

  productName?: string | null;
  variantTitle?: string | null;
  sku?: string | null;

  unitCost?: number | string | null;
  profit?: number | string | null;
  total?: number | string | null;

  originalPrice?: number | string | null;
  finalPrice?: number | string | null;
  discountAmount?: number | string | null;
  discountPercent?: number | string | null;
  originalTotal?: number | string | null;
  discountTotal?: number | string | null;
  finalTotal?: number | string | null;

  product?: Product | null;
  variant?: ProductVariant | null;
};

type Order = {
  id: string;
  status: OrderStatus | string;
  total: number | string;

  subtotalBeforeDiscount?: number | string | null;
  productDiscountTotal?: number | string | null;
  subtotalAfterDiscount?: number | string | null;
  shippingFeeSnapshot?: number | string | null;

  payment?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
  updatedAt?: string;

  store?: {
    id: string;
    name: string;
    slug: string;
    whatsapp?: string | null;
  } | null;

  customer?: {
    id: string;
    name: string;
    phone: string;
    city: string;
    address: string;
    notes?: string | null;
  } | null;

  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;

  items: OrderItem[];
};

type IconName =
  | "orders"
  | "arrow"
  | "refresh"
  | "external"
  | "copy"
  | "whatsapp"
  | "store"
  | "customer"
  | "phone"
  | "mail"
  | "location"
  | "payment"
  | "discount"
  | "total"
  | "calendar"
  | "box"
  | "check"
  | "warning"
  | "truck"
  | "close"
  | "info"
  | "chevron"
  | "status";

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "NEW", label: "طلب جديد" },
  { value: "PROCESSING", label: "قيد التجهيز" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "DELIVERED", label: "تم التسليم" },
  { value: "COMPLETED", label: "مكتمل" },
  { value: "CANCELLED", label: "ملغي" },
];

const orderDetailsStyles = `
.order-detail-page {
  color: var(--text-main);
}

.order-detail-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.order-detail-hero {
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

.order-detail-pill {
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

.order-detail-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.order-detail-action {
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

.order-detail-action:hover {
  transform: translateY(-1px);
}

.order-detail-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.order-detail-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.order-detail-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.order-detail-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.order-detail-action.danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
}

.order-detail-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.order-detail-icon.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.order-detail-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.order-detail-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.order-detail-icon.purple {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
}

.order-detail-icon.blue {
  background: rgba(59, 130, 246, 0.09);
  color: #2563eb;
}

.order-detail-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.order-detail-status {
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

.order-detail-status.new {
  background: rgba(59, 130, 246, 0.10);
  border-color: rgba(59, 130, 246, 0.18);
  color: #2563eb;
}

.order-detail-status.processing {
  background: rgba(245, 158, 11, 0.11);
  border-color: rgba(245, 158, 11, 0.22);
  color: #b45309;
}

.order-detail-status.shipped {
  background: rgba(124, 58, 237, 0.10);
  border-color: rgba(124, 58, 237, 0.18);
  color: #7c3aed;
}

.order-detail-status.delivered,
.order-detail-status.completed {
  background: rgba(16, 185, 129, 0.10);
  border-color: rgba(16, 185, 129, 0.18);
  color: #047857;
}

.order-detail-status.cancelled {
  background: rgba(239, 68, 68, 0.10);
  border-color: rgba(239, 68, 68, 0.18);
  color: #dc2626;
}

.order-detail-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.order-detail-input,
.order-detail-select {
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

.order-detail-input:focus,
.order-detail-select:focus {
  border-color: rgba(46, 217, 179, 0.52);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.10);
}

.order-detail-modern-select-wrap {
  position: relative;
}

.order-detail-modern-select-wrap::before {
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

.order-detail-modern-select {
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

.order-detail-select-chevron {
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

.order-detail-row {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 20px;
  background: #ffffff;
  padding: 14px;
}

.order-detail-thumb {
  width: 70px;
  height: 70px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  background: #f8fafc;
}

.order-detail-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-detail-mini {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
}

.order-detail-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.order-detail-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
  animation: order-detail-skeleton-shimmer 1.25s infinite;
}

@keyframes order-detail-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@media (max-width: 768px) {
  .order-detail-card,
  .order-detail-hero {
    border-radius: 18px;
  }

  .order-detail-action {
    width: 100%;
  }

  .order-detail-value {
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

function formatPercent(value: number | string | null | undefined) {
  return `${toNumber(value, 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}%`;
}

function formatDate(value?: string) {
  if (!value) return "غير متوفر";

  return new Date(value).toLocaleString("ar-EG-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusLabel(status: string) {
  return statusOptions.find((item) => item.value === status)?.label || status;
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

function getPaymentLabel(value?: string | null) {
  const payment = String(value || "").trim();

  const labels: Record<string, string> = {
    CASH_ON_DELIVERY: "الدفع عند الاستلام",
    WALLET: "محفظة إلكترونية",
    BANK_TRANSFER: "تحويل بنكي",
    CARD: "بطاقة بنكية",
  };

  return labels[payment] || payment || "غير محدد";
}

function getWhatsappPhone(phone?: string | null) {
  let digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = `20${digits.slice(1)}`;
  }

  return digits;
}

function getFirstImage(media?: ProductMedia[] | null) {
  if (!Array.isArray(media) || media.length === 0) return "";

  const cover =
    media.find((item) => item.type === "IMAGE" && item.isCover && item.url) ||
    media.find((item) => item.type === "IMAGE" && item.url) ||
    media.find((item) => item.url);

  return cover?.url || "";
}

function getOrderItemName(item: OrderItem) {
  return item.productName || item.product?.name || "منتج غير متوفر";
}

function getOrderItemVariantTitle(item: OrderItem) {
  return item.variantTitle || item.variant?.title || "";
}

function getOrderItemSku(item: OrderItem) {
  return item.sku || item.variant?.sku || "";
}

function getOrderItemOptions(item: OrderItem) {
  if (
    item.variant?.options &&
    typeof item.variant.options === "object" &&
    !Array.isArray(item.variant.options)
  ) {
    return item.variant.options;
  }

  const variantTitle = getOrderItemVariantTitle(item);

  if (!variantTitle) return {};

  return {
    النسخة: variantTitle,
  };
}

function formatVariantOptions(options?: Record<string, string> | null) {
  if (!options || typeof options !== "object") return "";

  return Object.entries(options)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`)
    .join(" - ");
}

function getOrderItemImage(item: OrderItem) {
  return (
    item.variant?.imageUrl ||
    getFirstImage(item.variant?.media) ||
    item.product?.imageUrl ||
    getFirstImage(item.product?.media) ||
    ""
  );
}

function getOrderItemFinalPrice(item: OrderItem) {
  if (item.finalPrice !== undefined && item.finalPrice !== null) {
    return toNumber(item.finalPrice, 0);
  }

  return toNumber(item.price, 0);
}

function getOrderItemOriginalPrice(item: OrderItem) {
  if (item.originalPrice !== undefined && item.originalPrice !== null) {
    const originalPrice = toNumber(item.originalPrice, 0);
    if (originalPrice > 0) return originalPrice;
  }

  const finalPrice = getOrderItemFinalPrice(item);
  const variantCompareAt = toNumber(item.variant?.compareAtPrice, 0);
  const productCompareAt = toNumber(item.product?.compareAtPrice, 0);
  const compareAtPrice = variantCompareAt > 0 ? variantCompareAt : productCompareAt;

  return compareAtPrice > finalPrice ? compareAtPrice : finalPrice;
}

function getOrderItemDiscountAmount(item: OrderItem) {
  if (item.discountAmount !== undefined && item.discountAmount !== null) {
    return Math.max(0, toNumber(item.discountAmount, 0));
  }

  return Math.max(0, getOrderItemOriginalPrice(item) - getOrderItemFinalPrice(item));
}

function getOrderItemDiscountPercent(item: OrderItem) {
  if (item.discountPercent !== undefined && item.discountPercent !== null) {
    return Math.max(0, toNumber(item.discountPercent, 0));
  }

  const originalPrice = getOrderItemOriginalPrice(item);
  const discountAmount = getOrderItemDiscountAmount(item);

  return originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;
}

function getOrderItemOriginalTotal(item: OrderItem) {
  if (item.originalTotal !== undefined && item.originalTotal !== null) {
    const value = toNumber(item.originalTotal, 0);
    if (value > 0) return value;
  }

  return getOrderItemOriginalPrice(item) * Number(item.quantity || 0);
}

function getOrderItemDiscountTotal(item: OrderItem) {
  if (item.discountTotal !== undefined && item.discountTotal !== null) {
    const value = toNumber(item.discountTotal, 0);
    if (value > 0) return value;
  }

  return getOrderItemDiscountAmount(item) * Number(item.quantity || 0);
}

function getOrderItemFinalTotal(item: OrderItem) {
  if (item.finalTotal !== undefined && item.finalTotal !== null) {
    const value = toNumber(item.finalTotal, 0);
    if (value > 0) return value;
  }

  if (item.total !== undefined && item.total !== null) {
    return toNumber(item.total, 0);
  }

  return getOrderItemFinalPrice(item) * Number(item.quantity || 0);
}

function getOrderSubtotalBeforeDiscount(order: Order) {
  const savedValue = toNumber(order.subtotalBeforeDiscount, 0);

  if (savedValue > 0) return savedValue;

  return order.items.reduce((sum, item) => {
    return sum + getOrderItemOriginalTotal(item);
  }, 0);
}

function getOrderProductDiscountTotal(order: Order) {
  const savedValue = toNumber(order.productDiscountTotal, 0);

  if (savedValue > 0) return savedValue;

  return order.items.reduce((sum, item) => {
    return sum + getOrderItemDiscountTotal(item);
  }, 0);
}

function getOrderSubtotalAfterDiscount(order: Order) {
  const savedValue = toNumber(order.subtotalAfterDiscount, 0);

  if (savedValue > 0) return savedValue;

  return order.items.reduce((sum, item) => {
    return sum + getOrderItemFinalTotal(item);
  }, 0);
}

function getOrderShippingFee(order: Order) {
  const savedShipping = toNumber(order.shippingFeeSnapshot, 0);

  if (savedShipping > 0) return savedShipping;

  return Math.max(toNumber(order.total, 0) - getOrderSubtotalAfterDiscount(order), 0);
}

function getOrderItemsCount(order: Order) {
  return order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  const props = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

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

  if (name === "arrow") {
    return (
      <svg {...props}>
        <path d="M19 12H5" />
        <path d="M11 6l-6 6 6 6" />
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

  if (name === "copy") {
    return (
      <svg {...props}>
        <path d="M9 9h10v10H9z" />
        <path d="M5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1" />
      </svg>
    );
  }

  if (name === "whatsapp") {
    return (
      <svg {...props}>
        <path d="M16.5 13.5c-.2 1-1.2 2-2.7 1.8-2.3-.3-5.1-2.8-5.6-5.1-.3-1.5.7-2.6 1.7-2.8l1.1 2.2-.9.8c.5 1.1 1.4 2 2.5 2.5l.8-.9 2.1 1.5Z" />
        <path d="M12 21a8.8 8.8 0 0 1-4.2-1.1L3 21l1.2-4.6A9 9 0 1 1 12 21Z" />
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

  if (name === "customer") {
    return (
      <svg {...props}>
        <path d="M16 11a4 4 0 1 0-8 0" />
        <path d="M6 21a6 6 0 0 1 12 0" />
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

  if (name === "payment") {
    return (
      <svg {...props}>
        <path d="M3 6h18v12H3z" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </svg>
    );
  }

  if (name === "discount") {
    return (
      <svg {...props}>
        <path d="M19 5 5 19" />
        <path d="M7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    );
  }

  if (name === "total") {
    return (
      <svg {...props}>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
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

  if (name === "box") {
    return (
      <svg {...props}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
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

  if (name === "close") {
    return (
      <svg {...props}>
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
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

export default function DashboardOrderDetailsPage() {
  const params = useParams<{ id?: string | string[] }>();
  const rawId = params?.id;
  const orderId = Array.isArray(rawId) ? rawId[0] : String(rawId || "");

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const totals = useMemo(() => {
    if (!order) {
      return {
        subtotalBeforeDiscount: 0,
        productDiscountTotal: 0,
        subtotalAfterDiscount: 0,
        shippingFee: 0,
        totalItems: 0,
      };
    }

    return {
      subtotalBeforeDiscount: getOrderSubtotalBeforeDiscount(order),
      productDiscountTotal: getOrderProductDiscountTotal(order),
      subtotalAfterDiscount: getOrderSubtotalAfterDiscount(order),
      shippingFee: getOrderShippingFee(order),
      totalItems: getOrderItemsCount(order),
    };
  }, [order]);

  async function loadOrder() {
    if (!orderId) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/orders/${orderId}?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل تفاصيل الطلب");
      }

      setOrder(data.order as Order);
      setSelectedStatus(String(data.order?.status || ""));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل تفاصيل الطلب"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus() {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    setSavingStatus(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: selectedStatus,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحديث حالة الطلب");
      }

      setSuccessMessage("تم تحديث حالة الطلب بنجاح");
      await loadOrder();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الطلب"
      );
    } finally {
      setSavingStatus(false);
    }
  }

  async function copyOrderId() {
    if (!order?.id) return;

    try {
      await navigator.clipboard.writeText(order.id);
      setSuccessMessage("تم نسخ رقم الطلب");
    } catch {
      setErrorMessage("تعذر نسخ رقم الطلب");
    }
  }

  function getWhatsAppLink() {
    if (!order) return "";

    const phone = getWhatsappPhone(order.customer?.phone);

    if (!phone) return "";

    const itemsText = order.items
      .map((item) => {
        const variantTitle = getOrderItemVariantTitle(item);
        const discountText =
          getOrderItemDiscountTotal(item) > 0
            ? ` - خصم ${formatMoney(getOrderItemDiscountTotal(item))}`
            : "";

        return `- ${getOrderItemName(item)}${
          variantTitle ? ` (${variantTitle})` : ""
        } × ${item.quantity}${discountText}`;
      })
      .join("\n");

    const message = [
      `مرحبًا ${order.customer?.name || ""}`,
      `بخصوص طلبك رقم: ${order.id}`,
      `حالة الطلب الحالية: ${getStatusLabel(order.status)}`,
      itemsText ? `المنتجات:\n${itemsText}` : "",
      totals.productDiscountTotal > 0
        ? `إجمالي خصم المنتجات: ${formatMoney(totals.productDiscountTotal)}`
        : "",
      `إجمالي الطلب: ${formatMoney(order.total)}`,
      order.store?.name ? `المتجر: ${order.store.name}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="order-detail-page space-y-5" dir="rtl">
        <style>{orderDetailsStyles}</style>
        <OrderDetailsSkeleton />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="order-detail-page space-y-5" dir="rtl">
        <style>{orderDetailsStyles}</style>

        <section className="order-detail-card p-8 text-center">
          <div className="order-detail-icon red mx-auto">
            <Icon name="warning" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            لم يتم العثور على الطلب
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
            قد يكون الطلب غير موجود أو لا يتبع المتجر الحالي.
          </p>

          <Link href="/dashboard/orders" className="order-detail-action primary mt-6">
            العودة للطلبات
          </Link>
        </section>
      </main>
    );
  }

  const whatsappLink = getWhatsAppLink();

  return (
    <main className="order-detail-page space-y-5" dir="rtl">
      <style>{orderDetailsStyles}</style>

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

      <section className="order-detail-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <span className="order-detail-pill">تفاصيل الطلب</span>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`order-detail-status ${getStatusClass(order.status)}`}>
                <span className="order-detail-status-dot" />
                {getStatusLabel(order.status)}
              </span>

              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                {getPaymentLabel(order.paymentMethod || order.payment)}
              </span>
            </div>

            <h1 className="mt-4 truncate font-[var(--font-en)] text-2xl font-bold leading-tight text-[var(--foreground)] md:text-3xl" dir="ltr">
              #{order.id}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              تم إنشاء الطلب في {formatDate(order.createdAt)}
              {order.updatedAt ? ` — آخر تحديث ${formatDate(order.updatedAt)}` : ""}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {order.store?.name && (
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                  {order.store.name}
                </span>
              )}

              {order.customer?.name && (
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                  {order.customer.name}
                </span>
              )}

              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                {formatNumber(totals.totalItems)} قطعة
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link href="/dashboard/orders" className="order-detail-action secondary">
              <Icon name="arrow" />
              العودة للطلبات
            </Link>

            <button type="button" onClick={loadOrder} className="order-detail-action primary">
              <Icon name="refresh" />
              تحديث الطلب
            </button>

            <button type="button" onClick={copyOrderId} className="order-detail-action secondary">
              <Icon name="copy" />
              نسخ رقم الطلب
            </button>

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="order-detail-action secondary"
              >
                <Icon name="whatsapp" />
                واتساب العميل
              </a>
            )}

            {order.store?.slug && (
              <Link
                href={`/store/${order.store.slug}/order-success/${order.id}`}
                target="_blank"
                rel="noreferrer"
                className="order-detail-action secondary"
              >
                <Icon name="external" />
                صفحة نجاح الطلب
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="الإجمالي النهائي" value={formatMoney(order.total)} note="شامل الشحن" icon="total" />
        <StatCard title="عدد المنتجات" value={formatNumber(order.items.length)} note="عدد بنود الطلب" icon="box" />
        <StatCard title="عدد القطع" value={formatNumber(totals.totalItems)} note="إجمالي الكميات" icon="orders" />
        <StatCard title="خصم المنتجات" value={formatMoney(totals.productDiscountTotal)} note="خصومات محفوظة" icon="discount" tone="red" />
        <StatCard title="الشحن" value={formatMoney(totals.shippingFee)} note="قيمة الشحن" icon="truck" tone="purple" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <section className="order-detail-card p-5">
            <SectionHeader
              icon="box"
              title="منتجات الطلب"
              description="الأسعار المعروضة هنا هي الأسعار المحفوظة وقت إنشاء الطلب."
            />

            <div className="mt-5 space-y-3">
              {order.items.map((item) => {
                const imageUrl = getOrderItemImage(item);
                const optionsText = formatVariantOptions(getOrderItemOptions(item));
                const originalPrice = getOrderItemOriginalPrice(item);
                const finalPrice = getOrderItemFinalPrice(item);
                const discountAmount = getOrderItemDiscountAmount(item);
                const discountPercent = getOrderItemDiscountPercent(item);
                const originalTotal = getOrderItemOriginalTotal(item);
                const discountTotal = getOrderItemDiscountTotal(item);
                const finalTotal = getOrderItemFinalTotal(item);
                const hasDiscount = discountAmount > 0;

                return (
                  <article key={item.id} className="order-detail-row">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
                      <div className="flex min-w-0 gap-3">
                        <div className="order-detail-thumb shrink-0">
                          {imageUrl ? (
                            <img src={imageUrl} alt={getOrderItemName(item)} />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[var(--muted-foreground)]">
                              <Icon name="box" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">
                            {getOrderItemName(item)}
                          </h3>

                          {optionsText && (
                            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                              {optionsText}
                            </p>
                          )}

                          {getOrderItemSku(item) && (
                            <p className="mt-1 font-[var(--font-en)] text-xs font-semibold text-[var(--muted-foreground)]">
                              SKU: {getOrderItemSku(item)}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                              الكمية: {formatNumber(item.quantity)}
                            </span>

                            {hasDiscount && (
                              <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                                خصم {formatPercent(discountPercent)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2 text-sm">
                        <PriceLine label="السعر قبل الخصم" value={formatMoney(originalPrice)} muted={hasDiscount} />
                        {hasDiscount && (
                          <PriceLine label="خصم الوحدة" value={`-${formatMoney(discountAmount)}`} danger />
                        )}
                        <PriceLine label="سعر الوحدة النهائي" value={formatMoney(finalPrice)} />
                        {hasDiscount && (
                          <>
                            <PriceLine label="الإجمالي قبل الخصم" value={formatMoney(originalTotal)} muted />
                            <PriceLine label="خصم الإجمالي" value={`-${formatMoney(discountTotal)}`} danger />
                          </>
                        )}
                        <PriceLine label="إجمالي البند" value={formatMoney(finalTotal)} strong />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="order-detail-card p-5">
            <SectionHeader
              icon="payment"
              title="ملخص الدفع"
              description="تفصيل قيمة الطلب قبل وبعد الخصم والشحن."
            />

            <div className="mt-5 space-y-3">
              {totals.productDiscountTotal > 0 && (
                <>
                  <SummaryRow
                    label="إجمالي المنتجات قبل الخصم"
                    value={formatMoney(totals.subtotalBeforeDiscount)}
                    muted
                  />

                  <SummaryRow
                    label="إجمالي خصم المنتجات"
                    value={`-${formatMoney(totals.productDiscountTotal)}`}
                    danger
                  />
                </>
              )}

              <SummaryRow
                label="إجمالي المنتجات بعد الخصم"
                value={formatMoney(totals.subtotalAfterDiscount)}
              />

              <SummaryRow
                label="الشحن"
                value={formatMoney(totals.shippingFee)}
              />

              <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--primary)]/10 p-4">
                <span className="font-semibold text-[var(--foreground)]">
                  الإجمالي النهائي
                </span>

                <strong className="font-[var(--font-en)] text-2xl font-bold text-[var(--primary)]">
                  {formatMoney(order.total)}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="order-detail-card p-5">
            <SectionHeader
              icon="status"
              title="حالة الطلب"
              description="تحديث الحالة يؤثر على متابعة الطلب داخل لوحة التحكم."
              small
            />

            <div className="mt-4">
              <div className="order-detail-modern-select-wrap">
                <select
                  className="order-detail-select order-detail-modern-select"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  disabled={savingStatus}
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <span className="order-detail-select-chevron">
                  <Icon name="chevron" className="h-4 w-4" />
                </span>
              </div>

              <button
                type="button"
                onClick={updateStatus}
                disabled={savingStatus || selectedStatus === order.status}
                className="order-detail-action primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="check" />
                {savingStatus ? "جاري الحفظ..." : "حفظ الحالة"}
              </button>

              <p className="mt-3 text-xs leading-6 text-[var(--muted-foreground)]">
                عند إلغاء الطلب، يتم التعامل مع رجوع المخزون من خلال API الطلبات.
              </p>
            </div>
          </section>

          <DataSection title="بيانات العميل" icon="customer">
            <InfoRow icon="customer" label="الاسم" value={order.customer?.name || "غير متوفر"} />
            <InfoRow icon="phone" label="الهاتف" value={order.customer?.phone || "غير متوفر"} />
            <InfoRow icon="mail" label="البريد" value={order.user?.email || "غير متوفر"} />
            <InfoRow icon="location" label="المدينة" value={order.customer?.city || "غير متوفر"} />
            <InfoRow icon="location" label="العنوان" value={order.customer?.address || "غير متوفر"} multiline />
            {order.customer?.notes && (
              <InfoRow icon="info" label="ملاحظات" value={order.customer.notes} multiline />
            )}
          </DataSection>

          <DataSection title="بيانات الدفع" icon="payment">
            <InfoRow icon="payment" label="طريقة الدفع" value={getPaymentLabel(order.paymentMethod || order.payment)} />
            <InfoRow icon="total" label="قبل الخصم" value={formatMoney(totals.subtotalBeforeDiscount)} />
            <InfoRow icon="discount" label="خصم المنتجات" value={formatMoney(totals.productDiscountTotal)} />
            <InfoRow icon="truck" label="الشحن" value={formatMoney(totals.shippingFee)} />
            <InfoRow icon="total" label="الإجمالي النهائي" value={formatMoney(order.total)} />
          </DataSection>

          <DataSection title="المتجر" icon="store">
            <InfoRow icon="store" label="اسم المتجر" value={order.store?.name || "غير متوفر"} />
            {order.store?.slug && (
              <div className="mt-3 grid gap-2">
                <Link
                  href={`/store/${order.store.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="order-detail-action secondary"
                >
                  <Icon name="external" />
                  فتح المتجر
                </Link>
              </div>
            )}
          </DataSection>
        </aside>
      </section>
    </main>
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
      <span className="order-detail-icon">
        <Icon name={icon} />
      </span>

      <div>
        <h2
          className={`font-semibold text-[var(--foreground)] ${
            small ? "text-lg" : "text-xl"
          }`}
        >
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
  tone?: "gold" | "red" | "purple" | "blue";
}) {
  const iconClass =
    tone === "red"
      ? "order-detail-icon red"
      : tone === "gold"
        ? "order-detail-icon gold"
        : tone === "purple"
          ? "order-detail-icon purple"
          : tone === "blue"
            ? "order-detail-icon blue"
            : "order-detail-icon";

  return (
    <article className="order-detail-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="order-detail-value mt-4" dir="ltr">
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

function DataSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: IconName;
  children: ReactNode;
}) {
  return (
    <section className="order-detail-card p-5">
      <SectionHeader icon={icon} title={title} small />

      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: IconName;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="order-detail-mini">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="h-4 w-4 text-[var(--mint-hover)]" />
        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 text-sm font-semibold text-[var(--foreground)] ${
          multiline ? "leading-7" : "truncate"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  danger,
  muted,
}: {
  label: string;
  value: string;
  danger?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-white p-4">
      <span className="font-semibold text-[var(--muted-foreground)]">
        {label}
      </span>

      <strong
        className={`font-[var(--font-en)] font-bold ${
          danger
            ? "text-red-600"
            : muted
              ? "text-[var(--muted-foreground)] line-through"
              : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </strong>
    </div>
  );
}

function PriceLine({
  label,
  value,
  danger,
  muted,
  strong,
}: {
  label: string;
  value: string;
  danger?: boolean;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[rgba(248,250,252,0.72)] px-3 py-2">
      <span className="text-xs font-semibold text-[var(--muted-foreground)]">
        {label}
      </span>

      <span
        className={`font-[var(--font-en)] text-sm ${
          danger
            ? "font-bold text-red-600"
            : muted
              ? "font-semibold text-[var(--muted-foreground)] line-through"
              : strong
                ? "font-bold text-[var(--foreground)]"
                : "font-semibold text-[var(--foreground)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function OrderDetailsSkeleton() {
  return (
    <>
      <section className="order-detail-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <div className="order-detail-skeleton h-8 w-36" />
            <div className="order-detail-skeleton mt-5 h-9 w-80 max-w-full" />
            <div className="order-detail-skeleton mt-4 h-4 w-[560px] max-w-full" />
            <div className="order-detail-skeleton mt-3 h-4 w-[440px] max-w-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="order-detail-skeleton h-11 w-full" />
            <div className="order-detail-skeleton h-11 w-full" />
            <div className="order-detail-skeleton h-11 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="order-detail-card p-5">
            <div className="order-detail-skeleton h-4 w-28" />
            <div className="order-detail-skeleton mt-4 h-8 w-24" />
            <div className="order-detail-skeleton mt-3 h-3 w-36" />
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="order-detail-card p-5">
          <div className="order-detail-skeleton h-7 w-44" />

          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="order-detail-skeleton h-[70px] w-[70px] rounded-[18px]" />

                <div className="flex-1">
                  <div className="order-detail-skeleton h-4 w-48 max-w-full" />
                  <div className="order-detail-skeleton mt-2 h-3 w-72 max-w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="order-detail-card p-5">
              <div className="order-detail-skeleton h-6 w-36" />
              <div className="order-detail-skeleton mt-4 h-12 w-full" />
              <div className="order-detail-skeleton mt-3 h-12 w-full" />
            </div>
          ))}
        </aside>
      </section>
    </>
  );
}