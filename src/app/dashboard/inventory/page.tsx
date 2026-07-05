"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type InventoryItemType = "PRODUCT" | "VARIANT";

type InventoryItem = {
  id: string;
  itemType: InventoryItemType;
  storeId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantTitle?: string | null;
  displayName: string;
  category?: string | null;
  productStatus?: string | null;
  status: string;
  sku?: string | null;
  barcode?: string | null;
  options?: Record<string, string> | null;
  imageUrl?: string | null;
  productImageUrl?: string | null;
  price: number;
  costPrice?: number | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockAlert: number;
  stockValue: number;
  potentialSalesValue: number;
  location?: string | null;
  supplierSku?: string | null;
  batchNumber?: string | null;
  expirationDate?: string | null;
  updatedAt?: string;
  productUpdatedAt?: string;
};

type InventoryStats = {
  totalRows: number;
  totalProducts: number;
  totalVariants: number;
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockValue: number;
  potentialSalesValue: number;
};

type StoreInfo = {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
  category?: string | null;
};

type IconName =
  | "inventory"
  | "refresh"
  | "external"
  | "reports"
  | "movements"
  | "search"
  | "chevron"
  | "box"
  | "warning"
  | "check"
  | "money"
  | "save"
  | "plus"
  | "minus"
  | "barcode"
  | "tag"
  | "clock"
  | "empty";

const defaultStats: InventoryStats = {
  totalRows: 0,
  totalProducts: 0,
  totalVariants: 0,
  totalQuantity: 0,
  totalReserved: 0,
  totalAvailable: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  stockValue: 0,
  potentialSalesValue: 0,
};

const inventoryPageStyles = `
.inventory-page {
  color: var(--text-main);
}

.inventory-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.inventory-hero {
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

.inventory-pill {
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

.inventory-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.inventory-action {
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

.inventory-action:hover {
  transform: translateY(-1px);
}

.inventory-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.inventory-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.inventory-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.inventory-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.inventory-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.inventory-icon.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.inventory-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.inventory-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.inventory-icon.blue {
  background: rgba(59, 130, 246, 0.09);
  color: #2563eb;
}

.inventory-stat-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.inventory-input,
.inventory-select {
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

.inventory-input:focus,
.inventory-select:focus {
  border-color: rgba(46, 217, 179, 0.52);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.10);
}

.inventory-search-wrap {
  position: relative;
}

.inventory-search-icon {
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(100, 116, 139, 0.72);
}

.inventory-search-input {
  padding-right: 44px;
  padding-left: 14px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 36%),
    #ffffff;
}

.inventory-modern-select-wrap {
  position: relative;
}

.inventory-modern-select-wrap::before {
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

.inventory-modern-select {
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

.inventory-select-chevron {
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

.inventory-stock {
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

.inventory-stock.available {
  background: rgba(16, 185, 129, 0.10);
  border-color: rgba(16, 185, 129, 0.18);
  color: #047857;
}

.inventory-stock.low {
  background: rgba(245, 158, 11, 0.10);
  border-color: rgba(245, 158, 11, 0.20);
  color: #b45309;
}

.inventory-stock.out {
  background: rgba(239, 68, 68, 0.10);
  border-color: rgba(239, 68, 68, 0.18);
  color: #dc2626;
}

.inventory-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.inventory-thumb {
  width: 64px;
  height: 64px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  background: #f8fafc;
}

.inventory-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inventory-row {
  transition: background 180ms var(--ease-premium);
}

.inventory-row:hover {
  background: rgba(248, 250, 252, 0.78);
}

.inventory-qty-button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 40px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 13px;
  background: #ffffff;
  color: var(--foreground);
  font-weight: 800;
  transition: 180ms var(--ease-premium);
}

.inventory-qty-button:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
}

.inventory-small-input {
  height: 40px;
  width: 82px;
  text-align: center;
  font-family: var(--font-en);
}

.inventory-row-select {
  height: 40px;
  width: 150px;
  padding: 8px 10px;
}

.inventory-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.inventory-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
  animation: inventory-skeleton-shimmer 1.25s infinite;
}

@keyframes inventory-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@media (max-width: 768px) {
  .inventory-card,
  .inventory-hero {
    border-radius: 18px;
  }

  .inventory-action {
    width: 100%;
  }

  .inventory-stat-value {
    font-size: 24px;
  }
}
`;

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value: number | string | null | undefined) {
  return `${toNumber(value, 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} ج.م`;
}

function formatNumber(value: number | string | null | undefined) {
  return toNumber(value, 0).toLocaleString("en-US");
}

function formatDate(value?: string) {
  if (!value) return "غير متوفر";

  return new Date(value).toLocaleString("ar-EG-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStockBadge(item: InventoryItem) {
  if (item.availableQuantity <= 0) {
    return {
      label: "نفد المخزون",
      className: "out",
    };
  }

  if (item.availableQuantity <= item.lowStockAlert) {
    return {
      label: "مخزون منخفض",
      className: "low",
    };
  }

  return {
    label: "متاح",
    className: "available",
  };
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "نشط",
    DRAFT: "مسودة",
    HIDDEN: "مخفي",
    ARCHIVED: "مؤرشف",
    OUT_OF_STOCK: "نفد المخزون",
    DISABLED: "معطل",
  };

  return labels[status] || status || "غير محدد";
}

function getStatusOptions(itemType: InventoryItemType) {
  if (itemType === "PRODUCT") {
    return [
      { value: "ACTIVE", label: "نشط" },
      { value: "DRAFT", label: "مسودة" },
      { value: "HIDDEN", label: "مخفي" },
      { value: "ARCHIVED", label: "مؤرشف" },
    ];
  }

  return [
    { value: "ACTIVE", label: "نشط" },
    { value: "HIDDEN", label: "مخفي" },
    { value: "OUT_OF_STOCK", label: "نفد المخزون" },
    { value: "DISABLED", label: "معطل" },
  ];
}

function getOptionsText(options?: Record<string, string> | null) {
  if (!options || typeof options !== "object") return "";

  return Object.entries(options)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`)
    .join(" • ");
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

  if (name === "inventory" || name === "box") {
    return (
      <svg {...props}>
        <path d="M4 7l8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
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

  if (name === "reports") {
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

  if (name === "movements") {
    return (
      <svg {...props}>
        <path d="M7 7h11l-3-3" />
        <path d="M17 17H6l3 3" />
        <path d="M18 7l-3 3" />
        <path d="M6 17l3-3" />
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

  if (name === "warning") {
    return (
      <svg {...props}>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }

  if (name === "check" || name === "save") {
    return (
      <svg {...props}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (name === "money") {
    return (
      <svg {...props}>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...props}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "minus") {
    return (
      <svg {...props}>
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "barcode") {
    return (
      <svg {...props}>
        <path d="M4 7v10" />
        <path d="M7 7v10" />
        <path d="M11 7v10" />
        <path d="M14 7v10" />
        <path d="M20 7v10" />
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

  if (name === "clock") {
    return (
      <svg {...props}>
        <path d="M12 8v5l3 2" />
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
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

export default function DashboardInventoryPage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>(defaultStats);

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        quantity: string;
        lowStockAlert: string;
        status: string;
      }
    >
  >({});

  const filteredStatusOptions = useMemo(() => {
    const values = new Set<string>();

    for (const item of items) {
      if (item.status) values.add(item.status);
    }

    return Array.from(values);
  }, [items]);

  async function loadInventory() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const params = new URLSearchParams();

      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (stockFilter) params.set("stockFilter", stockFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("t", String(Date.now()));

      const response = await fetch(`/api/dashboard/inventory?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/merchant/login?next=/dashboard/inventory";
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل بيانات المخزون");
      }

      setStore(data.store || null);
      setItems(Array.isArray(data.items) ? data.items : []);
      setStats(data.stats || defaultStats);

      const nextDrafts: Record<
        string,
        {
          quantity: string;
          lowStockAlert: string;
          status: string;
        }
      > = {};

      for (const item of data.items || []) {
        nextDrafts[item.id] = {
          quantity: String(item.quantity ?? 0),
          lowStockAlert: String(item.lowStockAlert ?? 0),
          status: String(item.status || "ACTIVE"),
        };
      }

      setDrafts(nextDrafts);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل المخزون"
      );
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(
    id: string,
    key: "quantity" | "lowStockAlert" | "status",
    value: string
  ) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        quantity: current[id]?.quantity ?? "0",
        lowStockAlert: current[id]?.lowStockAlert ?? "0",
        status: current[id]?.status ?? "ACTIVE",
        [key]: value,
      },
    }));
  }

  async function saveInventoryItem(item: InventoryItem) {
    const draft = drafts[item.id];

    if (!draft) return;

    setSavingId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const quantity = Number(draft.quantity);
      const lowStockAlert = Number(draft.lowStockAlert);

      if (!Number.isFinite(quantity) || quantity < 0) {
        throw new Error("الكمية يجب أن تكون رقم صحيح أكبر من أو يساوي صفر");
      }

      if (!Number.isFinite(lowStockAlert) || lowStockAlert < 0) {
        throw new Error("حد التنبيه يجب أن يكون رقم صحيح أكبر من أو يساوي صفر");
      }

      const response = await fetch("/api/dashboard/inventory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: item.id,
          itemType: item.itemType,
          quantity,
          lowStockAlert,
          status: draft.status,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحديث المخزون");
      }

      setSuccessMessage(data.message || "تم تحديث المخزون بنجاح");
      await loadInventory();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحديث المخزون"
      );
    } finally {
      setSavingId("");
    }
  }

  function quickAdjust(item: InventoryItem, amount: number) {
    const currentQuantity = Number(drafts[item.id]?.quantity ?? item.quantity ?? 0);
    const nextQuantity = Math.max(0, currentQuantity + amount);

    updateDraft(item.id, "quantity", String(nextQuantity));
  }

  useEffect(() => {
    loadInventory();
  }, []);

  if (loading && items.length === 0) {
    return (
      <main className="inventory-page space-y-5" dir="rtl">
        <style>{inventoryPageStyles}</style>
        <InventorySkeleton />
      </main>
    );
  }

  return (
    <main className="inventory-page space-y-5" dir="rtl">
      <style>{inventoryPageStyles}</style>

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

      <section className="inventory-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <span className="inventory-pill">إدارة المخزون</span>

            <h1 className="mt-4 text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
              مخزون {store?.displayName || store?.name || "المتجر"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              تابع المنتجات والمتغيرات، عدّل الكميات، حدود التنبيه، والحالة من شاشة واحدة بنفس تجربة لوحة تحكم ميزار.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                {formatNumber(stats.totalRows)} صف مخزون
              </span>

              {store?.slug && (
                <span
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"
                  dir="ltr"
                >
                  /store/{store.slug}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button type="button" onClick={loadInventory} className="inventory-action primary">
              <Icon name="refresh" />
              تحديث المخزون
            </button>

            <Link href="/dashboard/inventory/reports" className="inventory-action secondary">
              <Icon name="reports" />
              تقارير المخزون
            </Link>

            <Link href="/dashboard/inventory/movements" className="inventory-action secondary">
              <Icon name="movements" />
              سجل الحركة
            </Link>

            {store?.slug && (
              <Link
                href={`/store/${store.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inventory-action secondary"
              >
                <Icon name="external" />
                معاينة المتجر
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي الكميات" value={formatNumber(stats.totalQuantity)} note="كل المخزون المسجل" icon="inventory" />
        <StatCard title="المتاح للبيع" value={formatNumber(stats.totalAvailable)} note="بعد خصم المحجوز" icon="check" />
        <StatCard title="المحجوز" value={formatNumber(stats.totalReserved)} note="داخل طلبات حالية" icon="box" tone="blue" />
        <StatCard title="قيمة المخزون" value={formatMoney(stats.stockValue)} note="حسب تكلفة المنتج" icon="money" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="عدد المنتجات" value={formatNumber(stats.totalProducts)} note="منتجات بسيطة" icon="tag" />
        <StatCard title="عدد المتغيرات" value={formatNumber(stats.totalVariants)} note="ألوان / مقاسات / نسخ" icon="inventory" />
        <StatCard title="مخزون منخفض" value={formatNumber(stats.lowStockCount)} note="أقل من حد التنبيه" icon="warning" tone="gold" />
        <StatCard title="نفد المخزون" value={formatNumber(stats.outOfStockCount)} note="غير متاح للبيع" icon="warning" tone="red" />
      </section>

      <section className="inventory-card p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px_210px_120px]">
          <div className="inventory-search-wrap">
            <Icon name="search" className="inventory-search-icon h-4 w-4" />
            <input
              className="inventory-input inventory-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ابحث باسم المنتج أو المتغير أو SKU أو Barcode..."
            />
          </div>

          <div className="inventory-modern-select-wrap">
            <select
              className="inventory-select inventory-modern-select"
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
            >
              <option value="">كل حالات المخزون</option>
              <option value="available">متاح</option>
              <option value="low">مخزون منخفض</option>
              <option value="out">نفد المخزون</option>
            </select>

            <span className="inventory-select-chevron">
              <Icon name="chevron" className="h-4 w-4" />
            </span>
          </div>

          <div className="inventory-modern-select-wrap">
            <select
              className="inventory-select inventory-modern-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">كل الحالات</option>
              {filteredStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>

            <span className="inventory-select-chevron">
              <Icon name="chevron" className="h-4 w-4" />
            </span>
          </div>

          <button type="button" onClick={loadInventory} className="inventory-action primary">
            تطبيق
          </button>
        </div>
      </section>

      {loading ? (
        <section className="inventory-card p-5">
          <InventoryListSkeleton />
        </section>
      ) : items.length === 0 ? (
        <EmptyState
          title="لا توجد عناصر مخزون"
          description="سيظهر المخزون هنا بعد إضافة المنتجات أو المتغيرات داخل المتجر."
        />
      ) : (
        <section className="inventory-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] p-5">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              عناصر المخزون
            </h2>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              عدّل الكمية أو حد التنبيه أو الحالة ثم اضغط حفظ لكل صف.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-slate-50 text-right text-xs font-bold text-[var(--muted-foreground)]">
                  <th className="px-5 py-4">المنتج</th>
                  <th className="px-5 py-4">SKU / Barcode</th>
                  <th className="px-5 py-4">المتاح</th>
                  <th className="px-5 py-4">الكمية</th>
                  <th className="px-5 py-4">المحجوز</th>
                  <th className="px-5 py-4">حد التنبيه</th>
                  <th className="px-5 py-4">الحالة</th>
                  <th className="px-5 py-4">القيمة</th>
                  <th className="px-5 py-4">آخر تحديث</th>
                  <th className="px-5 py-4">إجراء</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const badge = getStockBadge(item);
                  const draft = drafts[item.id] || {
                    quantity: String(item.quantity),
                    lowStockAlert: String(item.lowStockAlert),
                    status: item.status,
                  };

                  return (
                    <tr
                      key={`${item.itemType}-${item.id}`}
                      className="inventory-row border-b border-[var(--border-soft)] align-top"
                    >
                      <td className="px-5 py-4">
                        <div className="flex gap-4">
                          <div className="inventory-thumb shrink-0">
                            {item.imageUrl || item.productImageUrl ? (
                              <img
                                src={item.imageUrl || item.productImageUrl || ""}
                                alt={item.displayName}
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-[var(--muted-foreground)]">
                                <Icon name="box" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <Link
                              href={`/store/${store?.slug}/product/${item.productId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="block truncate text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--mint-hover)]"
                            >
                              {item.productName}
                            </Link>

                            {item.variantTitle && (
                              <p className="mt-1 text-sm font-semibold text-[var(--mint-hover)]">
                                {item.variantTitle}
                              </p>
                            )}

                            {item.options && (
                              <p className="mt-1 max-w-[280px] truncate text-xs font-medium text-[var(--muted-foreground)]">
                                {getOptionsText(item.options)}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                                {item.itemType === "VARIANT" ? "Variant" : "Simple Product"}
                              </span>

                              {item.category && (
                                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-[var(--font-en)] text-sm font-semibold text-[var(--foreground)]" dir="ltr">
                          {item.sku || "—"}
                        </p>

                        <p className="mt-2 font-[var(--font-en)] text-xs font-medium text-[var(--muted-foreground)]" dir="ltr">
                          {item.barcode || "No barcode"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inventory-stock ${badge.className}`}>
                          <span className="inventory-dot" />
                          {badge.label}
                        </span>

                        <p className="mt-2 font-[var(--font-en)] text-2xl font-bold text-[var(--foreground)]">
                          {formatNumber(item.availableQuantity)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => quickAdjust(item, -1)}
                            className="inventory-qty-button"
                          >
                            <Icon name="minus" className="h-4 w-4" />
                          </button>

                          <input
                            className="inventory-input inventory-small-input"
                            type="number"
                            min="0"
                            value={draft.quantity}
                            onChange={(event) =>
                              updateDraft(item.id, "quantity", event.target.value)
                            }
                          />

                          <button
                            type="button"
                            onClick={() => quickAdjust(item, 1)}
                            className="inventory-qty-button"
                          >
                            <Icon name="plus" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-[var(--font-en)] text-lg font-bold text-[var(--foreground)]">
                          {formatNumber(item.reservedQuantity)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <input
                          className="inventory-input inventory-small-input"
                          type="number"
                          min="0"
                          value={draft.lowStockAlert}
                          onChange={(event) =>
                            updateDraft(item.id, "lowStockAlert", event.target.value)
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        <select
                          className="inventory-select inventory-row-select"
                          value={draft.status}
                          onChange={(event) =>
                            updateDraft(item.id, "status", event.target.value)
                          }
                        >
                          {getStatusOptions(item.itemType).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {formatMoney(item.stockValue)}
                        </p>

                        <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
                          بيع محتمل: {formatMoney(item.potentialSalesValue)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-medium leading-6 text-[var(--muted-foreground)]">
                          {formatDate(item.updatedAt || item.productUpdatedAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => saveInventoryItem(item)}
                          disabled={savingId === item.id}
                          className="inventory-action primary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Icon name="save" />
                          {savingId === item.id ? "حفظ..." : "حفظ"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
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
  tone?: "gold" | "red" | "blue";
}) {
  const iconClass =
    tone === "red"
      ? "inventory-icon red"
      : tone === "gold"
        ? "inventory-icon gold"
        : tone === "blue"
          ? "inventory-icon blue"
          : "inventory-icon";

  return (
    <article className="inventory-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="inventory-stat-value mt-4" dir="ltr">
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="inventory-card p-8 text-center">
      <div className="inventory-icon navy mx-auto">
        <Icon name="empty" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
        {title}
      </h3>

      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {description}
      </p>
    </section>
  );
}

function InventorySkeleton() {
  return (
    <>
      <section className="inventory-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <div className="inventory-skeleton h-8 w-36" />
            <div className="inventory-skeleton mt-5 h-9 w-72 max-w-full" />
            <div className="inventory-skeleton mt-4 h-4 w-[560px] max-w-full" />
            <div className="inventory-skeleton mt-3 h-4 w-[440px] max-w-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="inventory-skeleton h-11 w-full" />
            <div className="inventory-skeleton h-11 w-full" />
            <div className="inventory-skeleton h-11 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="inventory-card p-5">
            <div className="inventory-skeleton h-4 w-28" />
            <div className="inventory-skeleton mt-4 h-8 w-20" />
            <div className="inventory-skeleton mt-3 h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="inventory-card p-5">
        <InventoryListSkeleton />
      </section>
    </>
  );
}

function InventoryListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="inventory-skeleton h-16 w-16 rounded-[18px]" />

            <div className="flex-1">
              <div className="inventory-skeleton h-4 w-44 max-w-full" />
              <div className="inventory-skeleton mt-2 h-3 w-64 max-w-full" />
            </div>
          </div>

          <div className="inventory-skeleton h-9 w-28" />
        </div>
      ))}
    </div>
  );
}