"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StoreInfo = {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
};

type InventoryItem = {
  id: string;
  itemType: "PRODUCT" | "VARIANT";
  productId: string;
  variantId?: string | null;
  productName: string;
  variantTitle?: string | null;
  displayName: string;
  category?: string | null;
  sku?: string | null;
  imageUrl?: string | null;
  status: string;
  price: number;
  costPrice?: number | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockAlert: number;
  stockValue: number;
  potentialSalesValue: number;
  potentialProfitValue: number;
  missingCost: boolean;
};

type SalesRow = {
  productId: string;
  variantId?: string | null;
  productName: string;
  variantTitle?: string | null;
  sku?: string | null;
  category?: string | null;
  quantitySold: number;
  revenue: number;
  profit: number;
  orderLines: number;
};

type CategoryRow = {
  category: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  orderLines: number;
};

type MovementSummaryRow = {
  type: string;
  count: number;
};

type ReportSummary = {
  period: string;
  totalProducts: number;
  totalInventoryRows: number;
  totalVariants: number;
  totalQuantity: number;
  totalAvailable: number;
  totalReserved: number;
  stockValue: number;
  potentialSalesValue: number;
  potentialProfitValue: number;
  missingCostCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  orderLinesCount: number;
  soldQuantity: number;
  revenue: number;
  profit: number;
  averageLineRevenue: number;
  movementsCount: number;
  movementIncrease: number;
  movementDecrease: number;
};

type IconName =
  | "reports"
  | "inventory"
  | "movements"
  | "refresh"
  | "external"
  | "chevron"
  | "money"
  | "profit"
  | "warning"
  | "box"
  | "sales"
  | "category"
  | "empty";

const defaultSummary: ReportSummary = {
  period: "30d",
  totalProducts: 0,
  totalInventoryRows: 0,
  totalVariants: 0,
  totalQuantity: 0,
  totalAvailable: 0,
  totalReserved: 0,
  stockValue: 0,
  potentialSalesValue: 0,
  potentialProfitValue: 0,
  missingCostCount: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  orderLinesCount: 0,
  soldQuantity: 0,
  revenue: 0,
  profit: 0,
  averageLineRevenue: 0,
  movementsCount: 0,
  movementIncrease: 0,
  movementDecrease: 0,
};

const reportsStyles = `
.inventory-report-page {
  color: var(--text-main);
}

.inventory-report-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.inventory-report-hero {
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

.inventory-report-pill {
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

.inventory-report-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.inventory-report-action {
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

.inventory-report-action:hover {
  transform: translateY(-1px);
}

.inventory-report-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.inventory-report-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.inventory-report-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.inventory-report-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.inventory-report-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.inventory-report-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.inventory-report-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.inventory-report-icon.blue {
  background: rgba(59, 130, 246, 0.09);
  color: #2563eb;
}

.inventory-report-icon.purple {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
}

.inventory-report-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.inventory-report-select {
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

.inventory-report-modern-select-wrap {
  position: relative;
}

.inventory-report-modern-select-wrap::before {
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

.inventory-report-modern-select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 48px;
  padding-left: 42px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.inventory-report-select-chevron {
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

.inventory-report-thumb {
  width: 48px;
  height: 48px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 16px;
  background: #f8fafc;
}

.inventory-report-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inventory-report-row:hover {
  background: rgba(248, 250, 252, 0.78);
}

.inventory-report-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.inventory-report-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
  animation: inventory-report-skeleton-shimmer 1.25s infinite;
}

@keyframes inventory-report-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@media (max-width: 768px) {
  .inventory-report-card,
  .inventory-report-hero {
    border-radius: 18px;
  }

  .inventory-report-action {
    width: 100%;
  }

  .inventory-report-value {
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

function getPeriodLabel(value: string) {
  const labels: Record<string, string> = {
    "7d": "آخر 7 أيام",
    "30d": "آخر 30 يوم",
    "90d": "آخر 90 يوم",
    "365d": "آخر سنة",
    all: "كل الفترات",
  };

  return labels[value] || value;
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

  if (name === "inventory" || name === "box") {
    return (
      <svg {...props}>
        <path d="M4 7l8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
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

  if (name === "chevron") {
    return (
      <svg {...props}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    );
  }

  if (name === "money" || name === "sales") {
    return (
      <svg {...props}>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }

  if (name === "profit") {
    return (
      <svg {...props}>
        <path d="M4 16l5-5 4 4 7-8" />
        <path d="M14 7h6v6" />
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

  if (name === "category") {
    return (
      <svg {...props}>
        <path d="M4 4h7v7H4z" />
        <path d="M13 4h7v7h-7z" />
        <path d="M4 13h7v7H4z" />
        <path d="M13 13h7v7h-7z" />
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

export default function InventoryReportsPage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [summary, setSummary] = useState<ReportSummary>(defaultSummary);

  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([]);
  const [topStockItems, setTopStockItems] = useState<InventoryItem[]>([]);
  const [lowestStockItems, setLowestStockItems] = useState<InventoryItem[]>([]);

  const [topSellingProducts, setTopSellingProducts] = useState<SalesRow[]>([]);
  const [topSellingVariants, setTopSellingVariants] = useState<SalesRow[]>([]);
  const [productProfit, setProductProfit] = useState<SalesRow[]>([]);
  const [variantProfit, setVariantProfit] = useState<SalesRow[]>([]);
  const [categorySales, setCategorySales] = useState<CategoryRow[]>([]);
  const [movementSummary, setMovementSummary] = useState<MovementSummaryRow[]>([]);

  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadReports() {
    setLoading(true);
    setErrorMessage("");

    try {
      const params = new URLSearchParams();

      params.set("period", period);
      params.set("t", String(Date.now()));

      const response = await fetch(
        `/api/dashboard/inventory/reports?${params.toString()}`,
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/merchant/login?next=/dashboard/inventory/reports";
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل تقارير المخزون");
      }

      setStore(data.store || null);
      setSummary(data.summary || defaultSummary);
      setLowStockItems(Array.isArray(data.lowStockItems) ? data.lowStockItems : []);
      setOutOfStockItems(Array.isArray(data.outOfStockItems) ? data.outOfStockItems : []);
      setTopStockItems(Array.isArray(data.topStockItems) ? data.topStockItems : []);
      setLowestStockItems(Array.isArray(data.lowestStockItems) ? data.lowestStockItems : []);
      setTopSellingProducts(Array.isArray(data.topSellingProducts) ? data.topSellingProducts : []);
      setTopSellingVariants(Array.isArray(data.topSellingVariants) ? data.topSellingVariants : []);
      setProductProfit(Array.isArray(data.productProfit) ? data.productProfit : []);
      setVariantProfit(Array.isArray(data.variantProfit) ? data.variantProfit : []);
      setCategorySales(Array.isArray(data.categorySales) ? data.categorySales : []);
      setMovementSummary(Array.isArray(data.movementSummary) ? data.movementSummary : []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل التقارير"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <main className="inventory-report-page space-y-5" dir="rtl">
      <style>{reportsStyles}</style>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      <section className="inventory-report-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <span className="inventory-report-pill">تقارير المخزون</span>

            <h1 className="mt-4 text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
              تقارير {store?.displayName || store?.name || "المتجر"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              تحليل قيمة المخزون، المبيعات، الأرباح، المنتجات الراكدة، والأصناف منخفضة المخزون.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                {getPeriodLabel(period)}
              </span>

              {store?.slug && (
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]" dir="ltr">
                  /store/{store.slug}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button type="button" onClick={loadReports} className="inventory-report-action primary">
              <Icon name="refresh" />
              تحديث التقرير
            </button>

            <Link href="/dashboard/inventory" className="inventory-report-action secondary">
              <Icon name="inventory" />
              إدارة المخزون
            </Link>

            <Link href="/dashboard/inventory/movements" className="inventory-report-action secondary">
              <Icon name="movements" />
              سجل الحركة
            </Link>

            {store?.slug && (
              <Link
                href={`/store/${store.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inventory-report-action secondary"
              >
                <Icon name="external" />
                معاينة المتجر
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="inventory-report-card p-5">
        <div className="grid gap-3 sm:grid-cols-[260px_150px]">
          <div className="inventory-report-modern-select-wrap">
            <select
              className="inventory-report-select inventory-report-modern-select"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوم</option>
              <option value="90d">آخر 90 يوم</option>
              <option value="365d">آخر سنة</option>
              <option value="all">كل الفترات</option>
            </select>

            <span className="inventory-report-select-chevron">
              <Icon name="chevron" className="h-4 w-4" />
            </span>
          </div>

          <button type="button" onClick={loadReports} className="inventory-report-action primary">
            تطبيق الفترة
          </button>
        </div>
      </section>

      {loading ? (
        <ReportsSkeleton />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="قيمة المخزون" value={formatMoney(summary.stockValue)} note="حسب التكلفة" icon="money" />
            <StatCard title="قيمة البيع المتوقعة" value={formatMoney(summary.potentialSalesValue)} note="حسب سعر البيع" icon="sales" tone="blue" />
            <StatCard title="ربح متوقع" value={formatMoney(summary.potentialProfitValue)} note="بيع محتمل - تكلفة" icon="profit" />
            <StatCard title="تكلفة ناقصة" value={formatNumber(summary.missingCostCount)} note="منتجات بلا تكلفة" icon="warning" tone="gold" />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="إجمالي الكميات" value={formatNumber(summary.totalQuantity)} note="كل المخزون" icon="box" />
            <StatCard title="المتاح للبيع" value={formatNumber(summary.totalAvailable)} note="بعد خصم المحجوز" icon="inventory" />
            <StatCard title="المحجوز" value={formatNumber(summary.totalReserved)} note="طلبات حالية" icon="box" tone="blue" />
            <StatCard title="عدد المتغيرات" value={formatNumber(summary.totalVariants)} note="Variants" icon="inventory" />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="مبيعات الفترة" value={formatMoney(summary.revenue)} note={getPeriodLabel(period)} icon="sales" />
            <StatCard title="ربح الفترة" value={formatMoney(summary.profit)} note="بعد احتساب التكلفة" icon="profit" tone={summary.profit < 0 ? "red" : undefined} />
            <StatCard title="كمية مباعة" value={formatNumber(summary.soldQuantity)} note="إجمالي القطع" icon="box" />
            <StatCard title="بنود الطلبات" value={formatNumber(summary.orderLinesCount)} note="Order lines" icon="reports" />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="مخزون منخفض" value={formatNumber(summary.lowStockCount)} note="يحتاج متابعة" icon="warning" tone="gold" />
            <StatCard title="نفد المخزون" value={formatNumber(summary.outOfStockCount)} note="غير متاح" icon="warning" tone="red" />
            <StatCard title="حركات المخزون" value={formatNumber(summary.movementsCount)} note="خلال الفترة" icon="movements" />
            <StatCard
              title="صافي الحركة"
              value={`+${formatNumber(summary.movementIncrease)} / -${formatNumber(summary.movementDecrease)}`}
              note="زيادة / نقص"
              icon="movements"
              tone="purple"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <InventoryTable
              title="منتجات منخفضة المخزون"
              description="الأصناف التي قاربت على النفاد وتحتاج متابعة."
              items={lowStockItems}
              emptyText="لا توجد أصناف منخفضة المخزون."
            />

            <InventoryTable
              title="منتجات نافدة المخزون"
              description="الأصناف التي وصلت الكمية المتاحة فيها إلى صفر."
              items={outOfStockItems}
              emptyText="لا توجد أصناف نافدة المخزون."
              danger
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <InventoryTable
              title="أعلى قيمة مخزون"
              description="الأصناف الأعلى في قيمة المخزون."
              items={topStockItems}
              emptyText="لا توجد بيانات كافية."
            />

            <InventoryTable
              title="أقل كميات متاحة"
              description="الأصناف الأقل في الكمية المتاحة."
              items={lowestStockItems}
              emptyText="لا توجد بيانات كافية."
              danger
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <SalesTable
              title="أكثر المنتجات مبيعًا"
              description="ترتيب المنتجات حسب الكمية المباعة."
              rows={topSellingProducts}
              emptyText="لا توجد مبيعات منتجات في هذه الفترة."
              mode="product"
            />

            <SalesTable
              title="أكثر المتغيرات مبيعًا"
              description="ترتيب المتغيرات حسب الكمية المباعة."
              rows={topSellingVariants}
              emptyText="لا توجد مبيعات متغيرات في هذه الفترة."
              mode="variant"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <SalesTable
              title="ربحية المنتجات"
              description="أفضل المنتجات من ناحية الربح."
              rows={productProfit}
              emptyText="لا توجد بيانات ربحية للمنتجات."
              mode="product"
              showProfit
            />

            <SalesTable
              title="ربحية المتغيرات"
              description="أفضل المتغيرات من ناحية الربح."
              rows={variantProfit}
              emptyText="لا توجد بيانات ربحية للمتغيرات."
              mode="variant"
              showProfit
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <CategorySalesTable rows={categorySales} />
            <MovementSummaryTable rows={movementSummary} />
          </section>
        </>
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
      ? "inventory-report-icon red"
      : tone === "gold"
        ? "inventory-report-icon gold"
        : tone === "blue"
          ? "inventory-report-icon blue"
          : tone === "purple"
            ? "inventory-report-icon purple"
            : "inventory-report-icon";

  return (
    <article className="inventory-report-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="inventory-report-value mt-4" dir="ltr">
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

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[var(--border-soft)] p-5">
      <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}

function InventoryTable({
  title,
  description,
  items,
  emptyText,
  danger,
}: {
  title: string;
  description: string;
  items: InventoryItem[];
  emptyText: string;
  danger?: boolean;
}) {
  return (
    <section className="inventory-report-card overflow-hidden">
      <SectionTitle title={title} description={description} />

      {items.length === 0 ? (
        <div className="p-6 text-sm font-semibold text-[var(--muted-foreground)]">
          {emptyText}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-right text-xs font-bold text-[var(--muted-foreground)]">
                <th className="px-5 py-4">الصنف</th>
                <th className="px-5 py-4">المتاح</th>
                <th className="px-5 py-4">الكمية</th>
                <th className="px-5 py-4">القيمة</th>
                <th className="px-5 py-4">SKU</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={`${item.itemType}-${item.id}`} className="inventory-report-row border-b border-[var(--border-soft)]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="inventory-report-thumb">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.displayName} />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[var(--muted-foreground)]">
                            <Icon name="box" />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-[var(--foreground)]">
                          {item.productName}
                        </p>

                        {item.variantTitle && (
                          <p className="text-xs font-semibold text-[var(--mint-hover)]">
                            {item.variantTitle}
                          </p>
                        )}

                        <p className="text-xs text-[var(--muted-foreground)]">
                          {item.category || "غير مصنف"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`font-[var(--font-en)] text-xl font-bold ${
                        danger ? "text-red-600" : "text-[var(--foreground)]"
                      }`}
                    >
                      {formatNumber(item.availableQuantity)}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-[var(--font-en)] font-semibold text-[var(--foreground)]">
                    {formatNumber(item.quantity)}
                  </td>

                  <td className="px-5 py-4 font-semibold text-[var(--foreground)]">
                    {formatMoney(item.stockValue)}
                  </td>

                  <td className="px-5 py-4 font-[var(--font-en)] text-sm font-medium text-[var(--muted-foreground)]" dir="ltr">
                    {item.sku || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SalesTable({
  title,
  description,
  rows,
  emptyText,
  mode,
  showProfit,
}: {
  title: string;
  description: string;
  rows: SalesRow[];
  emptyText: string;
  mode: "product" | "variant";
  showProfit?: boolean;
}) {
  return (
    <section className="inventory-report-card overflow-hidden">
      <SectionTitle title={title} description={description} />

      {rows.length === 0 ? (
        <div className="p-6 text-sm font-semibold text-[var(--muted-foreground)]">
          {emptyText}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 text-right text-xs font-bold text-[var(--muted-foreground)]">
                <th className="px-5 py-4">{mode === "variant" ? "Variant" : "المنتج"}</th>
                <th className="px-5 py-4">الكمية</th>
                <th className="px-5 py-4">المبيعات</th>
                <th className="px-5 py-4">الربح</th>
                <th className="px-5 py-4">عدد البنود</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.productId}-${row.variantId || "product"}`}
                  className="inventory-report-row border-b border-[var(--border-soft)]"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[var(--foreground)]">
                      {row.productName}
                    </p>

                    {row.variantTitle && (
                      <p className="text-xs font-semibold text-[var(--mint-hover)]">
                        {row.variantTitle}
                      </p>
                    )}

                    {row.sku && (
                      <p className="font-[var(--font-en)] text-xs text-[var(--muted-foreground)]" dir="ltr">
                        {row.sku}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4 font-[var(--font-en)] font-semibold text-[var(--foreground)]">
                    {formatNumber(row.quantitySold)}
                  </td>

                  <td className="px-5 py-4 font-semibold text-[var(--foreground)]">
                    {formatMoney(row.revenue)}
                  </td>

                  <td
                    className={`px-5 py-4 font-semibold ${
                      showProfit ? "text-emerald-600" : "text-[var(--foreground)]"
                    }`}
                  >
                    {formatMoney(row.profit)}
                  </td>

                  <td className="px-5 py-4 font-[var(--font-en)] font-semibold text-[var(--foreground)]">
                    {formatNumber(row.orderLines)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CategorySalesTable({ rows }: { rows: CategoryRow[] }) {
  return (
    <section className="inventory-report-card overflow-hidden">
      <SectionTitle
        title="أكثر الفئات مبيعًا"
        description="ترتيب الفئات حسب قيمة المبيعات."
      />

      {rows.length === 0 ? (
        <div className="p-6 text-sm font-semibold text-[var(--muted-foreground)]">
          لا توجد مبيعات حسب الفئات في هذه الفترة.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 text-right text-xs font-bold text-[var(--muted-foreground)]">
                <th className="px-5 py-4">الفئة</th>
                <th className="px-5 py-4">الكمية</th>
                <th className="px-5 py-4">المبيعات</th>
                <th className="px-5 py-4">الربح</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.category} className="inventory-report-row border-b border-[var(--border-soft)]">
                  <td className="px-5 py-4 font-semibold text-[var(--foreground)]">
                    {row.category}
                  </td>

                  <td className="px-5 py-4 font-[var(--font-en)] font-semibold text-[var(--foreground)]">
                    {formatNumber(row.quantitySold)}
                  </td>

                  <td className="px-5 py-4 font-semibold text-[var(--foreground)]">
                    {formatMoney(row.revenue)}
                  </td>

                  <td className="px-5 py-4 font-semibold text-emerald-600">
                    {formatMoney(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function MovementSummaryTable({ rows }: { rows: MovementSummaryRow[] }) {
  return (
    <section className="inventory-report-card overflow-hidden">
      <SectionTitle
        title="ملخص حركة المخزون"
        description="عدد الحركات حسب نوع الحركة."
      />

      {rows.length === 0 ? (
        <div className="p-6 text-sm font-semibold text-[var(--muted-foreground)]">
          لا توجد حركات مخزون في هذه الفترة.
        </div>
      ) : (
        <div className="p-5">
          <div className="grid gap-3">
            {rows.map((row) => (
              <div
                key={row.type}
                className="flex items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3"
              >
                <span className="font-semibold text-[var(--foreground)]">
                  {getMovementLabel(row.type)}
                </span>

                <span className="rounded-full bg-[var(--mint-soft)] px-3 py-1 font-[var(--font-en)] text-sm font-bold text-[var(--mint-hover)]">
                  {formatNumber(row.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ReportsSkeleton() {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="inventory-report-card p-5">
            <div className="inventory-report-skeleton h-4 w-28" />
            <div className="inventory-report-skeleton mt-4 h-8 w-20" />
            <div className="inventory-report-skeleton mt-3 h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {[1, 2].map((item) => (
          <div key={item} className="inventory-report-card p-5">
            <div className="inventory-report-skeleton h-7 w-44" />
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <div className="inventory-report-skeleton h-12 w-12 rounded-[16px]" />
                  <div className="flex-1">
                    <div className="inventory-report-skeleton h-4 w-44 max-w-full" />
                    <div className="inventory-report-skeleton mt-2 h-3 w-64 max-w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}