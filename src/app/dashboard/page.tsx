"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Store = {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean | null;
};

type AuthUser = {
  id?: string;
  name?: string | null;
  firstName?: string | null;
  email?: string | null;
};

type Product = {
  id: string;
  name: string;
  price?: number | string | null;
  stock?: number | string | null;
  availableStock?: number | string | null;
  category?: string | null;
};

type Order = {
  id: string;
  total: number | string;
  status: string;
  createdAt: string;
  customer?: {
    name?: string | null;
    phone?: string | null;
  } | null;
  items?: {
    id: string;
    quantity: number | string;
    price: number | string;
    productName?: string | null;
    product?: {
      id: string;
      name: string;
    } | null;
  }[];
};

const dashboardHomeStyles = `
.dashboard-home {
  color: var(--text-main);
}

.dashboard-home-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.dark .dashboard-home-card {
  border-color: rgba(203, 213, 225, 0.12);
  background: rgba(24, 33, 63, 0.74);
}

.dashboard-welcome {
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

.dark .dashboard-welcome {
  border-color: rgba(203, 213, 225, 0.12);
  background:
    radial-gradient(circle at 12% 10%, rgba(46, 217, 179, 0.12), transparent 30%),
    linear-gradient(135deg, rgba(24, 33, 63, 0.92) 0%, rgba(15, 23, 42, 0.92) 100%);
}

.dashboard-soft-pill {
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

.dashboard-soft-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.dashboard-action {
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

.dashboard-action:hover {
  transform: translateY(-1px);
}

.dashboard-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.dashboard-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.dashboard-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.dashboard-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.dark .dashboard-action.secondary {
  border-color: rgba(203, 213, 225, 0.14);
  background: rgba(15, 23, 42, 0.34);
  color: #ffffff;
}

.dashboard-icon-box {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.dashboard-icon-box.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.dashboard-icon-box.gold {
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
}

.dashboard-icon-box.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.dark .dashboard-icon-box.navy {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.dashboard-stat-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.dark .dashboard-stat-value {
  color: #ffffff;
}

.dashboard-row {
  transition:
    background 180ms var(--ease-premium),
    transform 180ms var(--ease-premium);
}

.dashboard-row:hover {
  background: rgba(248, 250, 252, 0.78);
}

.dark .dashboard-row:hover {
  background: rgba(15, 23, 42, 0.34);
}

.dashboard-progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef2f7;
}

.dark .dashboard-progress-track {
  background: rgba(203, 213, 225, 0.1);
}

.dashboard-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--mint);
}

.dashboard-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.dashboard-skeleton::after {
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
  animation: dashboard-skeleton-shimmer 1.25s infinite;
}

.dark .dashboard-skeleton {
  background: rgba(203, 213, 225, 0.1);
}

.dark .dashboard-skeleton::after {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(203, 213, 225, 0.12),
    transparent
  );
}

@keyframes dashboard-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@media (max-width: 768px) {
  .dashboard-home-card,
  .dashboard-welcome {
    border-radius: 18px;
  }

  .dashboard-stat-value {
    font-size: 24px;
  }

  .dashboard-action {
    width: 100%;
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

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "صباح الخير";
  return "مساء الخير";
}

function getFirstName(user: AuthUser | null) {
  const firstName = String(user?.firstName || "").trim();

  if (firstName) return firstName;

  const name = String(user?.name || "").trim();

  if (name) return name.split(" ")[0];

  return "تاجر ميزار";
}

function isCancelled(status: string) {
  return status === "CANCELLED";
}

function isActiveOrder(status: string) {
  return ["NEW", "PROCESSING", "SHIPPED"].includes(status);
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
  if (status === "NEW") return "bg-blue-500/10 text-blue-600";
  if (status === "PROCESSING") return "bg-amber-500/10 text-amber-600";
  if (status === "SHIPPED") return "bg-purple-500/10 text-purple-600";

  if (status === "DELIVERED" || status === "COMPLETED") {
    return "bg-emerald-500/10 text-emerald-700";
  }

  if (status === "CANCELLED") return "bg-red-500/10 text-red-600";

  return "bg-[var(--muted)] text-[var(--foreground)]";
}

function isToday(dateValue: string) {
  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name:
    | "sales"
    | "orders"
    | "products"
    | "inventory"
    | "settings"
    | "trend"
    | "warning"
    | "check"
    | "plus"
    | "arrow"
    | "empty";
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

  if (name === "sales") {
    return (
      <svg {...props}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 15l3-4 3 2 5-7" />
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

  if (name === "products") {
    return (
      <svg {...props}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "inventory") {
    return (
      <svg {...props}>
        <path d="M4 7l8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
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

  if (name === "trend") {
    return (
      <svg {...props}>
        <path d="M4 17l6-6 4 4 6-8" />
        <path d="M15 7h5v5" />
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

  if (name === "check") {
    return (
      <svg {...props}>
        <path d="M20 6L9 17l-5-5" />
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

  if (name === "arrow") {
    return (
      <svg {...props}>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [authResponse, storesResponse] = await Promise.all([
        fetch(`/api/auth/me?t=${Date.now()}`, {
          cache: "no-store",
          credentials: "include",
        }),
        fetch(`/api/stores?t=${Date.now()}`, {
          cache: "no-store",
          credentials: "include",
        }),
      ]);

      const authData = await authResponse.json().catch(() => null);
      const storesData = await storesResponse.json().catch(() => null);

      if (authResponse.ok && authData?.success && authData?.user) {
        setUser(authData.user);
      }

      if (!storesResponse.ok || !storesData?.success) {
        throw new Error(storesData?.message || "فشل تحميل بيانات المتجر");
      }

      const stores = Array.isArray(storesData.stores) ? storesData.stores : [];
      const selectedStore = stores[0] || null;

      setStore(selectedStore);

      if (!selectedStore?.id) {
        setProducts([]);
        setOrders([]);
        return;
      }

      await loadStoreData(selectedStore.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل لوحة التحكم"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStoreData(storeId: string) {
    setLoadingData(true);

    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch(`/api/products?storeId=${storeId}&t=${Date.now()}`, {
          cache: "no-store",
          credentials: "include",
        }),
        fetch(`/api/orders?storeId=${storeId}&t=${Date.now()}`, {
          cache: "no-store",
          credentials: "include",
        }),
      ]);

      const productsData = await productsResponse.json().catch(() => null);
      const ordersData = await ordersResponse.json().catch(() => null);

      if (!productsResponse.ok || !productsData?.success) {
        throw new Error(productsData?.message || "فشل تحميل المنتجات");
      }

      if (!ordersResponse.ok || !ordersData?.success) {
        throw new Error(ordersData?.message || "فشل تحميل الطلبات");
      }

      setProducts(
        Array.isArray(productsData.products) ? productsData.products : []
      );

      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : []);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const firstName = useMemo(() => getFirstName(user), [user]);

  const stats = useMemo(() => {
    const validOrders = orders.filter((order) => !isCancelled(order.status));

    const totalSales = validOrders.reduce((sum, order) => {
      return sum + toNumber(order.total, 0);
    }, 0);

    const todayOrders = orders.filter((order) => isToday(order.createdAt)).length;

    const activeOrders = orders.filter((order) =>
      isActiveOrder(order.status)
    ).length;

    const lowStockProducts = products.filter((product) => {
      const available =
        product.availableStock !== undefined && product.availableStock !== null
          ? toNumber(product.availableStock, 0)
          : toNumber(product.stock, 0);

      return available > 0 && available <= 5;
    }).length;

    const outOfStockProducts = products.filter((product) => {
      const available =
        product.availableStock !== undefined && product.availableStock !== null
          ? toNumber(product.availableStock, 0)
          : toNumber(product.stock, 0);

      return available <= 0;
    }).length;

    return {
      totalSales,
      totalOrders: orders.length,
      todayOrders,
      activeOrders,
      totalProducts: products.length,
      lowStockProducts,
      outOfStockProducts,
    };
  }, [orders, products]);

  const latestOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  const topProducts = useMemo(() => {
    const productMap = new Map<
      string,
      {
        id: string;
        name: string;
        quantity: number;
        sales: number;
      }
    >();

    for (const order of orders) {
      if (isCancelled(order.status)) continue;

      for (const item of order.items || []) {
        const productId = item.product?.id || item.productName || item.id;
        const productName = item.product?.name || item.productName || "منتج";

        const current = productMap.get(productId) || {
          id: productId,
          name: productName,
          quantity: 0,
          sales: 0,
        };

        current.quantity += toNumber(item.quantity, 0);
        current.sales += toNumber(item.price, 0) * toNumber(item.quantity, 0);

        productMap.set(productId, current);
      }
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders]);

  const setupScore = useMemo(() => {
    let score = 0;

    if (store?.name) score += 25;
    if (store?.slug) score += 25;
    if (products.length > 0) score += 25;
    if (orders.length > 0) score += 25;

    return score;
  }, [store, products.length, orders.length]);

  if (loading) {
    return (
      <main className="dashboard-home space-y-5" dir="rtl">
        <style>{dashboardHomeStyles}</style>
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main className="dashboard-home space-y-5" dir="rtl">
      <style>{dashboardHomeStyles}</style>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      {loadingData && (
        <div className="rounded-2xl border border-[rgba(46,217,179,0.24)] bg-[rgba(216,255,245,0.65)] p-4 text-sm font-semibold text-[var(--mint-hover)]">
          جاري تحديث بيانات المتجر...
        </div>
      )}

      <section className="dashboard-welcome p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <span className="dashboard-soft-pill">لوحة التحكم</span>

            <h1 className="mt-4 text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
              {getGreeting()} يا {firstName}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              دي نظرة سريعة على أداء متجرك اليوم. تابع الطلبات، المنتجات،
              والمخزون من مكان واحد بتصميم هادي وواضح.
            </p>

            {store && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)] dark:bg-white/5 dark:text-white">
                  {store.name}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    store.isActive === false
                      ? "bg-red-500/10 text-red-600"
                      : "bg-emerald-500/10 text-emerald-700"
                  }`}
                >
                  {store.isActive === false ? "متجر متوقف" : "متجر نشط"}
                </span>

                <span
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)] dark:bg-white/5"
                  dir="ltr"
                >
                  /store/{store.slug}
                </span>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link href="/dashboard/products" className="dashboard-action primary">
              <Icon name="plus" />
              إضافة منتج
            </Link>

            <Link href="/dashboard/orders" className="dashboard-action secondary">
              <Icon name="orders" />
              مراجعة الطلبات
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="إجمالي المبيعات"
          value={formatMoney(stats.totalSales)}
          note="بدون الطلبات الملغية"
          icon="sales"
        />

        <StatCard
          title="إجمالي الطلبات"
          value={formatNumber(stats.totalOrders)}
          note={`طلبات اليوم: ${formatNumber(stats.todayOrders)}`}
          icon="orders"
        />

        <StatCard
          title="المنتجات"
          value={formatNumber(stats.totalProducts)}
          note={`نفد المخزون: ${formatNumber(stats.outOfStockProducts)}`}
          icon="products"
        />

        <StatCard
          title="طلبات نشطة"
          value={formatNumber(stats.activeOrders)}
          note="جديدة، تجهيز، أو شحن"
          icon="trend"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="dashboard-home-card overflow-hidden">
            <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-soft)] p-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  أحدث الطلبات
                </h2>

                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  آخر الطلبات التي وصلت للمتجر.
                </p>
              </div>

              <Link href="/dashboard/orders" className="dashboard-action secondary">
                كل الطلبات
                <Icon name="arrow" />
              </Link>
            </div>

            {latestOrders.length === 0 ? (
              <EmptyState
                title="لا توجد طلبات حتى الآن"
                description="عند وصول أول طلب سيظهر هنا مباشرة."
                icon="orders"
              />
            ) : (
              <div className="divide-y divide-[var(--border-soft)]">
                {latestOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="dashboard-row flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
                  >
                    <div>
                      <h3
                        className="text-sm font-semibold text-[var(--foreground)]"
                        dir="ltr"
                      >
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>

                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {order.customer?.name || "عميل"} —{" "}
                        {order.customer?.phone || "بدون هاتف"}
                      </p>

                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>

                      <strong className="font-[var(--font-en)] text-sm font-semibold text-[var(--foreground)]">
                        {formatMoney(order.total)}
                      </strong>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-home-card overflow-hidden">
            <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-soft)] p-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  أفضل المنتجات
                </h2>

                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  حسب إجمالي المبيعات.
                </p>
              </div>

              <Link href="/dashboard/products" className="dashboard-action secondary">
                المنتجات
                <Icon name="arrow" />
              </Link>
            </div>

            {topProducts.length === 0 ? (
              <EmptyState
                title="لا توجد مبيعات بعد"
                description="المنتجات الأكثر مبيعًا ستظهر هنا بعد استقبال الطلبات."
                icon="products"
              />
            ) : (
              <div className="divide-y divide-[var(--border-soft)]">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="dashboard-row flex items-center justify-between gap-4 p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[var(--mint-soft)] font-[var(--font-en)] text-sm font-semibold text-[var(--mint-hover)]">
                        {formatNumber(index + 1)}
                      </span>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          الكمية المباعة: {formatNumber(product.quantity)}
                        </p>
                      </div>
                    </div>

                    <strong className="shrink-0 font-[var(--font-en)] text-sm font-semibold text-emerald-700">
                      {formatMoney(product.sales)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="dashboard-home-card p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              جاهزية المتجر
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              مؤشر سريع لاكتمال أساسيات التشغيل.
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--muted-foreground)]">
                الاكتمال
              </span>

              <strong className="font-[var(--font-en)] text-sm font-semibold text-[var(--foreground)]">
                {formatNumber(setupScore)}%
              </strong>
            </div>

            <div className="dashboard-progress-track mt-3">
              <div
                className="dashboard-progress-fill"
                style={{ width: `${setupScore}%` }}
              />
            </div>

            <div className="mt-5 grid gap-3">
              <SetupItem done={Boolean(store?.name)} label="بيانات المتجر" />
              <SetupItem done={Boolean(store?.slug)} label="رابط المتجر" />
              <SetupItem done={products.length > 0} label="إضافة منتجات" />
              <SetupItem done={orders.length > 0} label="استقبال أول طلب" />
            </div>
          </section>

          <section className="dashboard-home-card p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              تنبيهات التشغيل
            </h2>

            <div className="mt-4 grid gap-3">
              <AlertItem
                title="مخزون منخفض"
                value={stats.lowStockProducts}
                tone="gold"
              />

              <AlertItem
                title="منتجات نفدت"
                value={stats.outOfStockProducts}
                tone="red"
              />

              <AlertItem
                title="طلبات تحتاج متابعة"
                value={stats.activeOrders}
                tone="mint"
              />
            </div>
          </section>

          <section className="dashboard-home-card p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              اختصارات مهمة
            </h2>

            <div className="mt-4 grid gap-3">
              <Link
                href="/dashboard/products"
                className="dashboard-action secondary justify-start"
              >
                <Icon name="products" />
                إدارة المنتجات
              </Link>

              <Link
                href="/dashboard/inventory"
                className="dashboard-action secondary justify-start"
              >
                <Icon name="inventory" />
                مراجعة المخزون
              </Link>

              <Link
                href="/dashboard/settings"
                className="dashboard-action secondary justify-start"
              >
                <Icon name="settings" />
                إعدادات المتجر
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <section className="dashboard-welcome p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <div className="dashboard-skeleton h-8 w-32" />
            <div className="dashboard-skeleton mt-5 h-9 w-72 max-w-full" />
            <div className="dashboard-skeleton mt-4 h-4 w-[560px] max-w-full" />
            <div className="dashboard-skeleton mt-3 h-4 w-[440px] max-w-full" />

            <div className="mt-5 flex flex-wrap gap-2">
              <div className="dashboard-skeleton h-8 w-28" />
              <div className="dashboard-skeleton h-8 w-24" />
              <div className="dashboard-skeleton h-8 w-36" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="dashboard-skeleton h-11 w-full" />
            <div className="dashboard-skeleton h-11 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="dashboard-home-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="w-full">
                <div className="dashboard-skeleton h-4 w-28" />
                <div className="dashboard-skeleton mt-4 h-8 w-24" />
                <div className="dashboard-skeleton mt-3 h-3 w-32" />
              </div>

              <div className="dashboard-skeleton h-10 w-10 rounded-[14px]" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="dashboard-home-card p-5">
            <div className="dashboard-skeleton h-6 w-40" />
            <div className="dashboard-skeleton mt-3 h-4 w-64" />

            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4">
                  <div className="w-full">
                    <div className="dashboard-skeleton h-4 w-36" />
                    <div className="dashboard-skeleton mt-2 h-3 w-56" />
                  </div>

                  <div className="dashboard-skeleton h-7 w-20" />
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-home-card p-5">
            <div className="dashboard-skeleton h-6 w-40" />
            <div className="dashboard-skeleton mt-3 h-4 w-64" />

            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="dashboard-skeleton h-9 w-9 rounded-2xl" />
                    <div>
                      <div className="dashboard-skeleton h-4 w-36" />
                      <div className="dashboard-skeleton mt-2 h-3 w-24" />
                    </div>
                  </div>

                  <div className="dashboard-skeleton h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          {[1, 2, 3].map((card) => (
            <div key={card} className="dashboard-home-card p-5">
              <div className="dashboard-skeleton h-6 w-36" />
              <div className="dashboard-skeleton mt-3 h-4 w-56" />

              <div className="mt-5 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="dashboard-skeleton h-12 w-full" />
                ))}
              </div>
            </div>
          ))}
        </aside>
      </section>
    </>
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
  icon: "sales" | "orders" | "products" | "trend";
}) {
  return (
    <article className="dashboard-home-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="dashboard-stat-value mt-4" dir="ltr">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {note}
          </p>
        </div>

        <span className="dashboard-icon-box">
          <Icon name={icon} />
        </span>
      </div>
    </article>
  );
}

function SetupItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-white p-3 dark:bg-white/5">
      <span className="text-sm font-medium text-[var(--foreground)]">
        {label}
      </span>

      <span
        className={`grid h-7 w-7 place-items-center rounded-xl ${
          done
            ? "bg-emerald-500/10 text-emerald-700"
            : "bg-slate-500/10 text-slate-500"
        }`}
      >
        <Icon name={done ? "check" : "empty"} className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

function AlertItem({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: "mint" | "gold" | "red";
}) {
  const iconClass =
    tone === "red"
      ? "dashboard-icon-box red"
      : tone === "gold"
        ? "dashboard-icon-box gold"
        : "dashboard-icon-box";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-white p-3 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <span className={iconClass}>
          <Icon name={tone === "red" ? "warning" : "inventory"} />
        </span>

        <span className="text-sm font-medium text-[var(--foreground)]">
          {title}
        </span>
      </div>

      <strong className="font-[var(--font-en)] text-sm font-semibold text-[var(--foreground)]">
        {formatNumber(value)}
      </strong>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: "orders" | "products";
}) {
  return (
    <div className="p-8 text-center">
      <div className="dashboard-icon-box navy mx-auto">
        <Icon name={icon} />
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