"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MovementType =
  | "MANUAL_ADJUSTMENT"
  | "ORDER_CREATED"
  | "ORDER_CANCELLED"
  | "ORDER_RESTORED"
  | "RETURN"
  | "RESTOCK"
  | "DAMAGE"
  | "CORRECTION";

type MovementItem = {
  id: string;
  storeId: string;
  productId: string;
  variantId?: string | null;
  itemType: "PRODUCT" | "VARIANT";
  productName: string;
  productCategory?: string | null;
  variantTitle?: string | null;
  variantSku?: string | null;
  variantBarcode?: string | null;
  variantOptions?: Record<string, string> | null;
  type: MovementType;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  reason?: string | null;
  note?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
};

type StoreInfo = {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
};

type MovementStats = {
  totalMovements: number;
  totalIncrease: number;
  totalDecrease: number;
  netChange: number;
  manualAdjustments: number;
  orderCreated: number;
  orderCancelled: number;
};

type IconName =
  | "movements"
  | "inventory"
  | "reports"
  | "refresh"
  | "external"
  | "search"
  | "chevron"
  | "plus"
  | "minus"
  | "net"
  | "manual"
  | "orders"
  | "warning"
  | "box"
  | "user"
  | "clock"
  | "reference"
  | "empty";

const defaultStats: MovementStats = {
  totalMovements: 0,
  totalIncrease: 0,
  totalDecrease: 0,
  netChange: 0,
  manualAdjustments: 0,
  orderCreated: 0,
  orderCancelled: 0,
};

const movementTypeOptions: { value: MovementType | ""; label: string }[] = [
  { value: "", label: "كل أنواع الحركة" },
  { value: "MANUAL_ADJUSTMENT", label: "تعديل يدوي" },
  { value: "ORDER_CREATED", label: "طلب جديد" },
  { value: "ORDER_CANCELLED", label: "طلب ملغي" },
  { value: "ORDER_RESTORED", label: "إرجاع طلب نشط" },
  { value: "RETURN", label: "مرتجع" },
  { value: "RESTOCK", label: "إعادة تزويد" },
  { value: "DAMAGE", label: "تالف" },
  { value: "CORRECTION", label: "تصحيح" },
];

const movementsStyles = `
.inventory-movement-page {
  color: var(--text-main);
}

.inventory-movement-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.inventory-movement-hero {
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

.inventory-movement-pill {
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

.inventory-movement-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.inventory-movement-action {
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

.inventory-movement-action:hover {
  transform: translateY(-1px);
}

.inventory-movement-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.inventory-movement-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.inventory-movement-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.inventory-movement-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.inventory-movement-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.inventory-movement-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.inventory-movement-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.inventory-movement-icon.blue {
  background: rgba(59, 130, 246, 0.09);
  color: #2563eb;
}

.inventory-movement-icon.purple {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
}

.inventory-movement-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.inventory-movement-input,
.inventory-movement-select {
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
}

.inventory-movement-search-wrap {
  position: relative;
}

.inventory-movement-search-icon {
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(100, 116, 139, 0.72);
}

.inventory-movement-search-input {
  padding-right: 44px;
  padding-left: 14px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 36%),
    #ffffff;
}

.inventory-movement-modern-select-wrap {
  position: relative;
}

.inventory-movement-modern-select-wrap::before {
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

.inventory-movement-modern-select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 48px;
  padding-left: 42px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.inventory-movement-select-chevron {
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

.inventory-movement-badge {
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

.inventory-movement-badge.increase {
  background: rgba(16, 185, 129, 0.10);
  border-color: rgba(16, 185, 129, 0.18);
  color: #047857;
}

.inventory-movement-badge.decrease {
  background: rgba(239, 68, 68, 0.10);
  border-color: rgba(239, 68, 68, 0.18);
  color: #dc2626;
}

.inventory-movement-badge.neutral {
  background: rgba(59, 130, 246, 0.10);
  border-color: rgba(59, 130, 246, 0.18);
  color: #2563eb;
}

.inventory-movement-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.inventory-movement-row:hover {
  background: rgba(248, 250, 252, 0.78);
}

.inventory-movement-mini {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.72);
  padding: 12px;
}

.inventory-movement-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.inventory-movement-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
  animation: inventory-movement-skeleton-shimmer 1.25s infinite;
}

@keyframes inventory-movement-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@media (max-width: 768px) {
  .inventory-movement-card,
  .inventory-movement-hero {
    border-radius: 18px;
  }

  .inventory-movement-action {
    width: 100%;
  }

  .inventory-movement-value {
    font-size: 24px;
  }
}
`;

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
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

function getMovementLabel(type: string) {
  const labels: Record<string, string> = {
    MANUAL_ADJUSTMENT: "تعديل يدوي",
    ORDER_CREATED: "طلب جديد",
    ORDER_CANCELLED: "طلب ملغي",
    ORDER_RESTORED: "إرجاع طلب نشط",
    RETURN: "مرتجع",
    RESTOCK: "إعادة تزويد",
    DAMAGE: "تالف",
    CORRECTION: "تصحيح",
  };

  return labels[type] || type;
}

function getChangeText(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `-${formatNumber(Math.abs(value))}`;
  return "0";
}

function getMovementTone(change: number) {
  if (change > 0) return "increase";
  if (change < 0) return "decrease";
  return "neutral";
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

  if (name === "inventory" || name === "box") {
    return (
      <svg {...props}>
        <path d="M4 7l8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
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

  if (name === "net") {
    return (
      <svg {...props}>
        <path d="M4 16l5-5 4 4 7-8" />
        <path d="M14 7h6v6" />
      </svg>
    );
  }

  if (name === "manual") {
    return (
      <svg {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
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

  if (name === "warning") {
    return (
      <svg {...props}>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
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

  if (name === "clock") {
    return (
      <svg {...props}>
        <path d="M12 8v5l3 2" />
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      </svg>
    );
  }

  if (name === "reference") {
    return (
      <svg {...props}>
        <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1 1" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1-1" />
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

export default function InventoryMovementsPage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [stats, setStats] = useState<MovementStats>(defaultStats);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const hasMovements = movements.length > 0;

  const movementSummaryText = useMemo(() => {
    if (!hasMovements) return "لا توجد حركات مخزون بعد.";

    return `تم العثور على ${formatNumber(stats.totalMovements)} حركة مخزون.`;
  }, [hasMovements, stats.totalMovements]);

  async function loadMovements() {
    setLoading(true);
    setErrorMessage("");

    try {
      const params = new URLSearchParams();

      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (typeFilter) params.set("type", typeFilter);
      if (itemTypeFilter) params.set("itemType", itemTypeFilter);
      params.set("take", "300");
      params.set("t", String(Date.now()));

      const response = await fetch(
        `/api/dashboard/inventory/movements?${params.toString()}`,
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/merchant/login?next=/dashboard/inventory/movements";
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل سجل حركة المخزون");
      }

      setStore(data.store || null);
      setMovements(Array.isArray(data.movements) ? data.movements : []);
      setStats(data.stats || defaultStats);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل سجل حركة المخزون"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovements();
  }, []);

  return (
    <main className="inventory-movement-page space-y-5" dir="rtl">
      <style>{movementsStyles}</style>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      <section className="inventory-movement-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
          <div>
            <span className="inventory-movement-pill">سجل حركة المخزون</span>

            <h1 className="mt-4 text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
              حركة مخزون {store?.displayName || store?.name || "المتجر"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              راقب كل زيادة أو نقص في المخزون مع السبب، المرجع، المستخدم، والتاريخ.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                {movementSummaryText}
              </span>

              {store?.slug && (
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]" dir="ltr">
                  /store/{store.slug}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button type="button" onClick={loadMovements} className="inventory-movement-action primary">
              <Icon name="refresh" />
              تحديث السجل
            </button>

            <Link href="/dashboard/inventory" className="inventory-movement-action secondary">
              <Icon name="inventory" />
              إدارة المخزون
            </Link>

            <Link href="/dashboard/inventory/reports" className="inventory-movement-action secondary">
              <Icon name="reports" />
              تقارير المخزون
            </Link>

            {store?.slug && (
              <Link
                href={`/store/${store.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inventory-movement-action secondary"
              >
                <Icon name="external" />
                معاينة المتجر
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="عدد الحركات" value={formatNumber(stats.totalMovements)} note="إجمالي السجل" icon="movements" />
        <StatCard title="إجمالي الزيادة" value={`+${formatNumber(stats.totalIncrease)}`} note="دخول للمخزون" icon="plus" />
        <StatCard title="إجمالي النقص" value={`-${formatNumber(stats.totalDecrease)}`} note="خروج من المخزون" icon="minus" tone="red" />
        <StatCard
          title="صافي التغيير"
          value={getChangeText(stats.netChange)}
          note="زيادة ناقص نقص"
          icon="net"
          tone={stats.netChange < 0 ? "red" : stats.netChange > 0 ? undefined : "blue"}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="تعديلات يدوية" value={formatNumber(stats.manualAdjustments)} note="من لوحة التحكم" icon="manual" tone="blue" />
        <StatCard title="طلبات جديدة" value={formatNumber(stats.orderCreated)} note="خصم من المخزون" icon="orders" tone="purple" />
        <StatCard title="طلبات ملغية" value={formatNumber(stats.orderCancelled)} note="استرجاع للمخزون" icon="orders" tone="gold" />
      </section>

      <section className="inventory-movement-card p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_200px_120px]">
          <div className="inventory-movement-search-wrap">
            <Icon name="search" className="inventory-movement-search-icon h-4 w-4" />

            <input
              className="inventory-movement-input inventory-movement-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="بحث باسم المنتج أو المتغير أو SKU أو السبب أو المرجع..."
            />
          </div>

          <div className="inventory-movement-modern-select-wrap">
            <select
              className="inventory-movement-select inventory-movement-modern-select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              {movementTypeOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <span className="inventory-movement-select-chevron">
              <Icon name="chevron" className="h-4 w-4" />
            </span>
          </div>

          <div className="inventory-movement-modern-select-wrap">
            <select
              className="inventory-movement-select inventory-movement-modern-select"
              value={itemTypeFilter}
              onChange={(event) => setItemTypeFilter(event.target.value)}
            >
              <option value="">كل العناصر</option>
              <option value="PRODUCT">منتجات بسيطة</option>
              <option value="VARIANT">متغيرات</option>
            </select>

            <span className="inventory-movement-select-chevron">
              <Icon name="chevron" className="h-4 w-4" />
            </span>
          </div>

          <button type="button" onClick={loadMovements} className="inventory-movement-action primary">
            تطبيق
          </button>
        </div>
      </section>

      {loading ? (
        <section className="inventory-movement-card p-5">
          <MovementsListSkeleton />
        </section>
      ) : !hasMovements ? (
        <section className="inventory-movement-card p-10 text-center">
          <div className="inventory-movement-icon blue mx-auto">
            <Icon name="empty" />
          </div>

          <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            لا توجد حركات مخزون
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
            عند تعديل كمية أي منتج من صفحة المخزون أو إنشاء/إلغاء طلب، ستظهر الحركة هنا.
          </p>

          <Link href="/dashboard/inventory" className="inventory-movement-action primary mt-6">
            الذهاب للمخزون
          </Link>
        </section>
      ) : (
        <section className="inventory-movement-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] p-5">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              سجل الحركات
            </h2>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              عرض تفصيلي لكل حركة مخزون مع الكمية قبل وبعد التغيير.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-slate-50 text-right text-xs font-bold text-[var(--muted-foreground)]">
                  <th className="px-5 py-4">المنتج</th>
                  <th className="px-5 py-4">نوع الحركة</th>
                  <th className="px-5 py-4">قبل</th>
                  <th className="px-5 py-4">التغيير</th>
                  <th className="px-5 py-4">بعد</th>
                  <th className="px-5 py-4">السبب / الملاحظة</th>
                  <th className="px-5 py-4">المرجع</th>
                  <th className="px-5 py-4">بواسطة</th>
                  <th className="px-5 py-4">التاريخ</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => {
                  const tone = getMovementTone(movement.quantityChange);

                  return (
                    <tr
                      key={movement.id}
                      className="inventory-movement-row border-b border-[var(--border-soft)] align-top"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/store/${store?.slug}/product/${movement.productId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--mint-hover)]"
                        >
                          {movement.productName}
                        </Link>

                        {movement.variantTitle && (
                          <p className="mt-1 text-sm font-semibold text-[var(--mint-hover)]">
                            {movement.variantTitle}
                          </p>
                        )}

                        {movement.variantOptions && (
                          <p className="mt-1 max-w-[260px] truncate text-xs font-medium text-[var(--muted-foreground)]">
                            {getOptionsText(movement.variantOptions)}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                            {movement.itemType === "VARIANT" ? "Variant" : "Simple Product"}
                          </span>

                          {movement.variantSku && (
                            <span
                              className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-600"
                              dir="ltr"
                            >
                              {movement.variantSku}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inventory-movement-badge ${tone}`}>
                          <span className="inventory-movement-dot" />
                          {getMovementLabel(movement.type)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-[var(--font-en)] text-xl font-bold text-[var(--foreground)]">
                          {formatNumber(movement.quantityBefore)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p
                          className={`font-[var(--font-en)] text-xl font-bold ${
                            movement.quantityChange > 0
                              ? "text-emerald-600"
                              : movement.quantityChange < 0
                                ? "text-red-600"
                                : "text-[var(--foreground)]"
                          }`}
                        >
                          {getChangeText(movement.quantityChange)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-[var(--font-en)] text-xl font-bold text-[var(--foreground)]">
                          {formatNumber(movement.quantityAfter)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[260px] text-sm font-semibold leading-7 text-[var(--foreground)]">
                          {movement.reason || "—"}
                        </p>

                        {movement.note && (
                          <p className="mt-1 max-w-[260px] text-xs leading-6 text-[var(--muted-foreground)]">
                            {movement.note}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {movement.referenceType || "—"}
                        </p>

                        {movement.referenceId && (
                          <p
                            className="mt-1 max-w-[160px] truncate font-[var(--font-en)] text-xs text-[var(--muted-foreground)]"
                            dir="ltr"
                          >
                            {movement.referenceId}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {movement.createdBy?.name || "System"}
                        </p>

                        {movement.createdBy?.email && (
                          <p
                            className="mt-1 max-w-[180px] truncate text-xs text-[var(--muted-foreground)]"
                            dir="ltr"
                          >
                            {movement.createdBy.email}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs leading-6 text-[var(--muted-foreground)]">
                          {formatDate(movement.createdAt)}
                        </p>
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
  tone?: "gold" | "red" | "blue" | "purple";
}) {
  const iconClass =
    tone === "red"
      ? "inventory-movement-icon red"
      : tone === "gold"
        ? "inventory-movement-icon gold"
        : tone === "blue"
          ? "inventory-movement-icon blue"
          : tone === "purple"
            ? "inventory-movement-icon purple"
            : "inventory-movement-icon";

  return (
    <article className="inventory-movement-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="inventory-movement-value mt-4" dir="ltr">
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

function MovementsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="inventory-movement-skeleton h-12 w-12 rounded-[16px]" />

            <div className="flex-1">
              <div className="inventory-movement-skeleton h-4 w-44 max-w-full" />
              <div className="inventory-movement-skeleton mt-2 h-3 w-64 max-w-full" />
            </div>
          </div>

          <div className="inventory-movement-skeleton h-9 w-28" />
        </div>
      ))}
    </div>
  );
}