"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type Store = {
  id: string;
  name: string;
  slug: string;
};

type OrderStatus =
  | "NEW"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

type CustomerOrder = {
  id: string;
  total: number | string;
  status: OrderStatus | string;
  createdAt: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string | null;
  createdAt: string;
  store: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  } | null;
  orders: CustomerOrder[];
};

type IconName =
  | "customers"
  | "refresh"
  | "external"
  | "search"
  | "chevron"
  | "store"
  | "phone"
  | "mail"
  | "location"
  | "orders"
  | "total"
  | "calendar"
  | "check"
  | "warning"
  | "close"
  | "user"
  | "guest"
  | "city"
  | "eye"
  | "whatsapp"
  | "copy"
  | "filter"
  | "info";

const customerFilterOptions = [
  { value: "ALL", label: "كل العملاء" },
  { value: "REGISTERED", label: "حسابات مسجلة" },
  { value: "GUEST", label: "سجلات طلبات" },
  { value: "ACTIVE", label: "لديهم طلبات نشطة" },
  { value: "COMPLETED", label: "لديهم طلبات مكتملة" },
  { value: "NO_ORDERS", label: "بدون طلبات" },
];

const customersPageStyles = `
.customers-page {
  color: var(--text-main);
}

.customers-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.customers-hero {
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

.customers-pill {
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

.customers-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.customers-action {
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

.customers-action:hover {
  transform: translateY(-1px);
}

.customers-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.customers-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.customers-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.customers-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.customers-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.customers-icon.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.customers-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.customers-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.customers-icon.purple {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
}

.customers-icon.blue {
  background: rgba(59, 130, 246, 0.09);
  color: #2563eb;
}

.customers-stat-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.customers-input,
.customers-select {
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

.customers-input:focus,
.customers-select:focus {
  border-color: rgba(46, 217, 179, 0.52);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.10);
}

.customers-search-wrap {
  position: relative;
}

.customers-search-icon {
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(100, 116, 139, 0.72);
}

.customers-search-input {
  padding-right: 44px;
  padding-left: 14px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 36%),
    #ffffff;
}

.customers-search-input::placeholder {
  color: rgba(100, 116, 139, 0.7);
  font-size: 13px;
  font-weight: 600;
}

.customers-modern-select-wrap {
  position: relative;
}

.customers-modern-select-wrap::before {
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

.customers-modern-select {
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

.customers-modern-select:hover {
  border-color: rgba(46, 217, 179, 0.38);
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.12), transparent 34%),
    #ffffff;
}

.customers-select-chevron {
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

.customers-modern-select option {
  color: #18213f;
  background: #ffffff;
  font-weight: 700;
}

.customers-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid transparent;
}

.customers-badge.registered {
  background: rgba(16, 185, 129, 0.10);
  border-color: rgba(16, 185, 129, 0.18);
  color: #047857;
}

.customers-badge.guest {
  background: rgba(245, 158, 11, 0.10);
  border-color: rgba(245, 158, 11, 0.20);
  color: #b45309;
}

.customers-badge.active {
  background: rgba(59, 130, 246, 0.10);
  border-color: rgba(59, 130, 246, 0.18);
  color: #2563eb;
}

.customers-badge.cancelled {
  background: rgba(239, 68, 68, 0.10);
  border-color: rgba(239, 68, 68, 0.18);
  color: #dc2626;
}

.customers-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.customers-mini-card {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
}

.customers-avatar {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--navy-soft) 100%);
  color: var(--mint);
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-en);
  box-shadow: 0 14px 26px rgba(24, 33, 63, 0.13);
}

.customers-row {
  transition:
    background 180ms var(--ease-premium),
    transform 180ms var(--ease-premium);
}

.customers-row:hover {
  background: rgba(248, 250, 252, 0.78);
}

.customers-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.customers-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
  animation: customers-skeleton-shimmer 1.25s infinite;
}

@keyframes customers-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@media (max-width: 768px) {
  .customers-card,
  .customers-hero {
    border-radius: 18px;
  }

  .customers-action {
    width: 100%;
  }

  .customers-stat-value {
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

function getStatusLabel(status: string) {
  switch (status) {
    case "NEW":
      return "طلب جديد";

    case "PROCESSING":
      return "قيد التجهيز";

    case "SHIPPED":
      return "تم الشحن";

    case "DELIVERED":
      return "تم التسليم";

    case "COMPLETED":
      return "مكتمل";

    case "CANCELLED":
      return "ملغي";

    default:
      return status || "غير محدد";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "NEW":
      return "active";

    case "PROCESSING":
      return "guest";

    case "SHIPPED":
      return "active";

    case "DELIVERED":
      return "registered";

    case "COMPLETED":
      return "registered";

    case "CANCELLED":
      return "cancelled";

    default:
      return "active";
  }
}

function isCompletedOrder(status: string) {
  return status === "COMPLETED" || status === "DELIVERED";
}

function isActiveOrder(status: string) {
  return !["COMPLETED", "DELIVERED", "CANCELLED"].includes(status);
}

function isCancelledOrder(status: string) {
  return status === "CANCELLED";
}

function sortOrdersByDate(orders: CustomerOrder[]) {
  return [...(orders || [])].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function getCustomerInitial(customer: Customer) {
  const value = String(customer.name || customer.user?.name || customer.phone || "M").trim();

  return value ? value.slice(0, 1).toUpperCase() : "M";
}

function getWhatsAppPhone(phone?: string | null) {
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

function getCustomerSales(customer: Customer) {
  return (customer.orders || [])
    .filter((order) => !isCancelledOrder(order.status))
    .reduce((sum, order) => sum + toNumber(order.total, 0), 0);
}

function getLatestOrder(customer: Customer) {
  return sortOrdersByDate(customer.orders || [])[0] || null;
}

function getCustomerActiveOrders(customer: Customer) {
  return (customer.orders || []).filter((order) => isActiveOrder(order.status));
}

function getCustomerCompletedOrders(customer: Customer) {
  return (customer.orders || []).filter((order) => isCompletedOrder(order.status));
}

function getCustomerCancelledOrders(customer: Customer) {
  return (customer.orders || []).filter((order) => isCancelledOrder(order.status));
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

  if (name === "search") {
    return (
      <svg {...props}>
        <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
        <path d="M21 21l-4.35-4.35" />
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

  if (name === "close") {
    return (
      <svg {...props}>
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...props}>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (name === "guest") {
    return (
      <svg {...props}>
        <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M5 21a7 7 0 0 1 14 0" />
        <path d="M19 5l2 2" />
        <path d="M21 5l-2 2" />
      </svg>
    );
  }

  if (name === "city") {
    return (
      <svg {...props}>
        <path d="M4 21V7l5-3v17" />
        <path d="M9 21V9l6-3v15" />
        <path d="M15 21V11l5-3v13" />
        <path d="M6 10h.01" />
        <path d="M6 14h.01" />
        <path d="M12 12h.01" />
        <path d="M12 16h.01" />
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

  if (name === "whatsapp") {
    return (
      <svg {...props}>
        <path d="M16.5 13.5c-.2 1-1.2 2-2.7 1.8-2.3-.3-5.1-2.8-5.6-5.1-.3-1.5.7-2.6 1.7-2.8l1.1 2.2-.9.8c.5 1.1 1.4 2 2.5 2.5l.8-.9 2.1 1.5Z" />
        <path d="M12 21a8.8 8.8 0 0 1-4.2-1.1L3 21l1.2-4.6A9 9 0 1 1 12 21Z" />
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

  if (name === "filter") {
    return (
      <svg {...props}>
        <path d="M4 5h16" />
        <path d="M7 12h10" />
        <path d="M10 19h4" />
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

export default function DashboardCustomersPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState("ALL");

  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeStore = useMemo(() => {
    return stores.find((store) => store.id === activeStoreId) || stores[0] || null;
  }, [stores, activeStoreId]);

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      const orders = customer.orders || [];
      const activeOrders = getCustomerActiveOrders(customer);
      const completedOrders = getCustomerCompletedOrders(customer);

      if (customerFilter === "REGISTERED" && !customer.user) return false;
      if (customerFilter === "GUEST" && customer.user) return false;
      if (customerFilter === "ACTIVE" && activeOrders.length === 0) return false;
      if (customerFilter === "COMPLETED" && completedOrders.length === 0) return false;
      if (customerFilter === "NO_ORDERS" && orders.length > 0) return false;

      if (!search) return true;

      const latestOrder = getLatestOrder(customer);

      const text = [
        customer.name,
        customer.phone,
        customer.city,
        customer.address,
        customer.notes,
        customer.user?.name,
        customer.user?.email,
        customer.user?.phone,
        latestOrder?.id,
        getStatusLabel(latestOrder?.status || ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(search);
    });
  }, [customers, searchTerm, customerFilter]);

  const stats = useMemo(() => {
    const registeredCustomers = customers.filter((customer) => customer.user).length;

    const totalOrders = customers.reduce((sum, customer) => {
      return sum + Number(customer.orders?.length || 0);
    }, 0);

    const activeOrders = customers.reduce((sum, customer) => {
      return sum + getCustomerActiveOrders(customer).length;
    }, 0);

    const completedOrders = customers.reduce((sum, customer) => {
      return sum + getCustomerCompletedOrders(customer).length;
    }, 0);

    const cancelledOrders = customers.reduce((sum, customer) => {
      return sum + getCustomerCancelledOrders(customer).length;
    }, 0);

    const totalSales = customers.reduce((sum, customer) => {
      return sum + getCustomerSales(customer);
    }, 0);

    const citiesCount = new Set(
      customers.map((customer) => customer.city).filter(Boolean)
    ).size;

    const repeatCustomers = customers.filter((customer) => {
      const nonCancelledOrders = (customer.orders || []).filter(
        (order) => !isCancelledOrder(order.status)
      );

      return nonCancelledOrders.length > 1;
    }).length;

    const averageCustomerValue =
      customers.length > 0 ? totalSales / Math.max(customers.length, 1) : 0;

    return {
      totalCustomers: customers.length,
      registeredCustomers,
      guestCustomers: Math.max(0, customers.length - registeredCustomers),
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalSales,
      citiesCount,
      repeatCustomers,
      averageCustomerValue,
    };
  }, [customers]);

  async function loadStores() {
    setLoadingStores(true);
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

      const loadedStores = Array.isArray(data.stores)
        ? (data.stores as Store[])
        : [];

      setStores(loadedStores);

      if (loadedStores.length === 0) {
        setActiveStoreId("");
        setCustomers([]);
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

  async function loadCustomers(storeId = activeStoreId) {
    if (!storeId) return;

    setLoadingCustomers(true);
    setErrorMessage("");

    try {
      const params = new URLSearchParams();

      params.set("storeId", storeId);
      params.set("t", String(Date.now()));

      const response = await fetch(`/api/customers?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل العملاء");
      }

      setCustomers(Array.isArray(data.customers) ? data.customers : []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل العملاء"
      );
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function copyCustomerPhone(phone: string) {
    if (!phone) return;

    try {
      await navigator.clipboard.writeText(phone);
      setSuccessMessage("تم نسخ رقم العميل");
    } catch {
      setErrorMessage("تعذر نسخ رقم العميل");
    }
  }

  function getWhatsAppLink(customer: Customer) {
    const phone = getWhatsAppPhone(customer.phone);

    if (!phone) return "";

    const latestOrder = getLatestOrder(customer);

    const message = [
      `مرحبًا ${customer.name || ""}`,
      activeStore?.name ? `معك فريق متجر ${activeStore.name}` : "معك فريق المتجر",
      latestOrder ? `بخصوص آخر طلب رقم: ${latestOrder.id}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (activeStoreId) {
      loadCustomers(activeStoreId);
    }
  }, [activeStoreId]);

  if (loadingStores) {
    return (
      <main className="customers-page space-y-5" dir="rtl">
        <style>{customersPageStyles}</style>
        <CustomersSkeleton />
      </main>
    );
  }

  if (stores.length === 0) {
    return (
      <main className="customers-page space-y-5" dir="rtl">
        <style>{customersPageStyles}</style>

        <section className="customers-card p-8 text-center">
          <div className="customers-icon red mx-auto">
            <Icon name="warning" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            لا يوجد متجر مرتبط بحسابك
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
            العملاء سيظهرون هنا بعد ربط المتجر واستقبال أول طلب من العملاء.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="customers-page space-y-5" dir="rtl">
      <style>{customersPageStyles}</style>

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

      <section className="customers-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
          <div>
            <span className="customers-pill">إدارة العملاء</span>

            <h1 className="mt-4 text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
              عملاء {activeStore?.name || "المتجر"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              تابع بيانات العملاء، أرقام التواصل، المدن، إجمالي المشتريات، وآخر
              طلب لكل عميل من مكان واحد.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                متجر واحد مرتبط بالحساب
              </span>

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
            <button
              type="button"
              onClick={() => loadCustomers()}
              className="customers-action primary"
            >
              <Icon name="refresh" />
              تحديث العملاء
            </button>

            {activeStore?.slug && (
              <Link
                href={`/store/${activeStore.slug}`}
                target="_blank"
                rel="noreferrer"
                className="customers-action secondary"
              >
                <Icon name="external" />
                معاينة المتجر
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="إجمالي العملاء"
          value={formatNumber(stats.totalCustomers)}
          note="كل سجلات العملاء"
          icon="customers"
        />

        <StatCard
          title="حسابات مسجلة"
          value={formatNumber(stats.registeredCustomers)}
          note="عملاء لديهم حساب"
          icon="user"
        />

        <StatCard
          title="سجلات طلبات"
          value={formatNumber(stats.guestCustomers)}
          note="عملاء من الطلبات"
          icon="guest"
          tone="gold"
        />

        <StatCard
          title="إجمالي الطلبات"
          value={formatNumber(stats.totalOrders)}
          note="كل الطلبات المرتبطة"
          icon="orders"
          tone="blue"
        />

        <StatCard
          title="إجمالي المبيعات"
          value={formatMoney(stats.totalSales)}
          note="بدون الطلبات الملغية"
          icon="total"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="طلبات نشطة"
          value={formatNumber(stats.activeOrders)}
          note="تحتاج متابعة"
          icon="info"
          tone="blue"
        />

        <StatCard
          title="مكتملة / مسلمة"
          value={formatNumber(stats.completedOrders)}
          note="طلبات ناجحة"
          icon="check"
        />

        <StatCard
          title="عملاء متكررون"
          value={formatNumber(stats.repeatCustomers)}
          note="أكثر من طلب مكتمل"
          icon="refresh"
          tone="purple"
        />

        <StatCard
          title="متوسط قيمة العميل"
          value={formatMoney(stats.averageCustomerValue)}
          note="تقريبًا لكل عميل"
          icon="total"
          tone="gold"
        />
      </section>

      <section className="customers-card overflow-hidden">
        <div className="border-b border-[var(--border-soft)] p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                قائمة العملاء
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                ابحث باسم العميل أو الهاتف أو المدينة أو البريد الإلكتروني، وفلتر
                حسب نوع العميل أو نشاط الطلبات.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,320px)_210px]">
              <div className="customers-search-wrap">
                <Icon name="search" className="customers-search-icon h-4 w-4" />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="customers-input customers-search-input"
                  placeholder="ابحث باسم العميل أو رقم الهاتف..."
                />
              </div>

              <div className="customers-modern-select-wrap">
                <select
                  value={customerFilter}
                  onChange={(event) => setCustomerFilter(event.target.value)}
                  className="customers-select customers-modern-select"
                >
                  {customerFilterOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <span className="customers-select-chevron">
                  <Icon name="chevron" className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {loadingCustomers ? (
          <div className="p-5">
            <CustomersListSkeleton />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            title="لا توجد بيانات عملاء مطابقة"
            description="العملاء سيظهرون هنا بعد إتمام أول طلب أو بعد تغيير الفلاتر الحالية."
          />
        ) : (
          <div className="grid gap-5 p-5 xl:grid-cols-2">
            {filteredCustomers.map((customer) => {
              const orders = sortOrdersByDate(customer.orders || []);
              const latestOrder = orders[0] || null;
              const activeOrders = getCustomerActiveOrders(customer);
              const completedOrders = getCustomerCompletedOrders(customer);
              const cancelledOrders = getCustomerCancelledOrders(customer);
              const customerSales = getCustomerSales(customer);
              const whatsappLink = getWhatsAppLink(customer);

              return (
                <article key={customer.id} className="customers-card overflow-hidden">
                  <div className="border-b border-[var(--border-soft)] p-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="flex min-w-0 gap-3">
                        <div className="customers-avatar">
                          {getCustomerInitial(customer)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-xl font-semibold text-[var(--foreground)]">
                              {customer.name || "عميل بدون اسم"}
                            </h3>

                            {customer.user ? (
                              <span className="customers-badge registered">
                                <span className="customers-status-dot" />
                                حساب مسجل
                              </span>
                            ) : (
                              <span className="customers-badge guest">
                                <span className="customers-status-dot" />
                                سجل طلب
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                            تاريخ أول ظهور: {formatDate(customer.createdAt)}
                          </p>

                          {latestOrder && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`customers-badge ${getStatusClass(
                                  latestOrder.status
                                )}`}
                              >
                                <span className="customers-status-dot" />
                                آخر طلب: {getStatusLabel(latestOrder.status)}
                              </span>

                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                                {formatDate(latestOrder.createdAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-start md:text-left">
                        <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                          إجمالي مشتريات العميل
                        </p>

                        <p className="mt-1 font-[var(--font-en)] text-2xl font-bold text-[var(--foreground)]">
                          {formatMoney(customerSales)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 p-5 md:grid-cols-2">
                    <MiniInfo icon="phone" label="الهاتف" value={customer.phone || "غير محدد"} />
                    <MiniInfo icon="location" label="المدينة" value={customer.city || "غير محدد"} />
                    <MiniInfo
                      icon="mail"
                      label="البريد الإلكتروني"
                      value={customer.user?.email || "غير مسجل"}
                    />
                    <MiniInfo
                      icon="store"
                      label="المتجر"
                      value={customer.store?.name || activeStore?.name || "غير متوفر"}
                    />

                    <div className="customers-mini-card md:col-span-2">
                      <div className="flex items-center gap-2">
                        <Icon name="location" className="h-4 w-4 text-[var(--mint-hover)]" />
                        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                          العنوان
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold leading-7 text-[var(--foreground)]">
                        {customer.address || "غير محدد"}
                      </p>
                    </div>

                    {customer.notes && (
                      <div className="customers-mini-card md:col-span-2">
                        <div className="flex items-center gap-2">
                          <Icon name="info" className="h-4 w-4 text-[var(--mint-hover)]" />
                          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                            ملاحظات
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold leading-7 text-[var(--foreground)]">
                          {customer.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[var(--border-soft)] p-5">
                    <div className="grid gap-3 md:grid-cols-4">
                      <CustomerMetric
                        label="عدد الطلبات"
                        value={formatNumber(orders.length)}
                      />

                      <CustomerMetric
                        label="نشطة"
                        value={formatNumber(activeOrders.length)}
                        tone="blue"
                      />

                      <CustomerMetric
                        label="مكتملة"
                        value={formatNumber(completedOrders.length)}
                        tone="green"
                      />

                      <CustomerMetric
                        label="ملغية"
                        value={formatNumber(cancelledOrders.length)}
                        tone="red"
                      />
                    </div>

                    {latestOrder && (
                      <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-white p-4">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div>
                            <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                              آخر طلب
                            </p>

                            <p className="mt-1 font-[var(--font-en)] text-sm font-bold text-[var(--foreground)]" dir="ltr">
                              #{latestOrder.id}
                            </p>
                          </div>

                          <div className="text-start sm:text-left">
                            <p className="font-[var(--font-en)] text-lg font-bold text-[var(--foreground)]">
                              {formatMoney(latestOrder.total)}
                            </p>

                            <span
                              className={`customers-badge mt-2 ${getStatusClass(
                                latestOrder.status
                              )}`}
                            >
                              <span className="customers-status-dot" />
                              {getStatusLabel(latestOrder.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {customer.phone && (
                        <a
                          href={`tel:${customer.phone}`}
                          className="customers-action secondary"
                        >
                          <Icon name="phone" />
                          اتصال
                        </a>
                      )}

                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="customers-action secondary"
                        >
                          <Icon name="whatsapp" />
                          واتساب
                        </a>
                      )}

                      {customer.phone && (
                        <button
                          type="button"
                          onClick={() => copyCustomerPhone(customer.phone)}
                          className="customers-action secondary"
                        >
                          <Icon name="copy" />
                          نسخ الرقم
                        </button>
                      )}

                      {latestOrder && (
                        <Link
                          href={`/dashboard/orders/${latestOrder.id}`}
                          className="customers-action primary"
                        >
                          <Icon name="eye" />
                          تفاصيل آخر طلب
                        </Link>
                      )}

                      {latestOrder && customer.store?.slug && (
                        <Link
                          href={`/store/${customer.store.slug}/order-success/${latestOrder.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="customers-action secondary sm:col-span-2"
                        >
                          <Icon name="external" />
                          صفحة نجاح آخر طلب
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
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
      ? "customers-icon red"
      : tone === "gold"
        ? "customers-icon gold"
        : tone === "purple"
          ? "customers-icon purple"
          : tone === "blue"
            ? "customers-icon blue"
            : "customers-icon";

  return (
    <article className="customers-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="customers-stat-value mt-4" dir="ltr">
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

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="customers-mini-card">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="h-4 w-4 text-[var(--mint-hover)]" />

        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function CustomerMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "blue" | "green" | "red";
}) {
  const valueClass =
    tone === "blue"
      ? "text-blue-600"
      : tone === "red"
        ? "text-red-600"
        : tone === "green"
          ? "text-emerald-600"
          : "text-[var(--foreground)]";

  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-3">
      <p className="text-xs font-semibold text-[var(--muted-foreground)]">
        {label}
      </p>

      <p className={`mt-2 font-[var(--font-en)] text-xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8 text-center">
      <div className="customers-icon navy mx-auto">
        <Icon name="customers" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
        {title}
      </h3>

      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}

function CustomersSkeleton() {
  return (
    <>
      <section className="customers-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
          <div>
            <div className="customers-skeleton h-8 w-36" />
            <div className="customers-skeleton mt-5 h-9 w-72 max-w-full" />
            <div className="customers-skeleton mt-4 h-4 w-[560px] max-w-full" />
            <div className="customers-skeleton mt-3 h-4 w-[440px] max-w-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="customers-skeleton h-11 w-full" />
            <div className="customers-skeleton h-11 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="customers-card p-5">
            <div className="customers-skeleton h-4 w-28" />
            <div className="customers-skeleton mt-4 h-8 w-20" />
            <div className="customers-skeleton mt-3 h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="customers-card p-5">
        <CustomersListSkeleton />
      </section>
    </>
  );
}

function CustomersListSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="customers-card p-5">
          <div className="flex items-start gap-3">
            <div className="customers-skeleton h-14 w-14 rounded-[20px]" />

            <div className="flex-1">
              <div className="customers-skeleton h-5 w-44 max-w-full" />
              <div className="customers-skeleton mt-3 h-3 w-64 max-w-full" />
              <div className="customers-skeleton mt-4 h-20 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}