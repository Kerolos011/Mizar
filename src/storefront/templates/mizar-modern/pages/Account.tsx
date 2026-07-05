"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  buildStoreHref,
  formatMoney,
  getStoreName,
} from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "../styles.module.css";
import { theme } from "../theme";

type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  customerStore?: { id?: string; name?: string | null; slug?: string | null } | null;
};

type OrderItem = {
  id?: string;
  productId?: string;
  quantity: number;
  price: number | string;
  product?: { id?: string; name?: string | null; imageUrl?: string | null; category?: string | null } | null;
};

type Order = {
  id: string;
  status: string;
  total: number | string;
  payment?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
};

function formatDate(value?: string, locale: "ar" | "en" = "ar") {
  if (!value) return locale === "ar" ? "غير متوفر" : "N/A";
  try {
    return new Date(value).toLocaleString(locale === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function statusLabel(status: string, locale: "ar" | "en") {
  const ar: Record<string, string> = {
    NEW: "طلب جديد",
    PROCESSING: "قيد التجهيز",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التسليم",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
  };
  const en: Record<string, string> = {
    NEW: "New",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return (locale === "ar" ? ar : en)[status] || status;
}

function paymentLabel(value: string | null | undefined, locale: "ar" | "en") {
  const payment = String(value || "").trim();
  const ar: Record<string, string> = {
    CASH_ON_DELIVERY: "الدفع عند الاستلام",
    WALLET: "محفظة إلكترونية",
    BANK_TRANSFER: "تحويل بنكي",
    CARD: "بطاقة بنكية",
  };
  const en: Record<string, string> = {
    CASH_ON_DELIVERY: "Cash on delivery",
    WALLET: "Wallet",
    BANK_TRANSFER: "Bank transfer",
    CARD: "Card",
  };
  return (locale === "ar" ? ar : en)[payment] || payment || (locale === "ar" ? "غير محدد" : "Not specified");
}

function orderSubtotal(order: Order) {
  return (order.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
}

export function Account(props: TemplatePageProps) {
  const { store, locale, text } = props;
  const router = useRouter();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const currency = store?.currency || "EGP";
  const slug = String(store?.slug || "");

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter((order) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes(order.status)).length;
    const completedOrders = orders.filter((order) => ["COMPLETED", "DELIVERED"].includes(order.status)).length;
    const totalSpent = orders.filter((order) => order.status !== "CANCELLED").reduce((sum, order) => sum + Number(order.total || 0), 0);
    return { totalOrders, activeOrders, completedOrders, totalSpent };
  }, [orders]);

  async function loadAccount() {
    setLoading(true);
    setError("");

    try {
      const authResponse = await fetch(`/api/auth/me?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const authData = await authResponse.json().catch(() => null);

      if (!authResponse.ok || !authData?.success || !authData?.user || authData.user.role !== "CUSTOMER") {
        router.replace(buildStoreHref(store, `login?next=${encodeURIComponent(buildStoreHref(store, "account"))}`));
        return;
      }

      const loadedUser = authData.user as CustomerUser;
      if (loadedUser.customerStore?.slug && store?.slug && loadedUser.customerStore.slug !== store.slug) {
        setUser(loadedUser);
        setOrders([]);
        setError(locale === "ar" ? "هذا الحساب غير مرتبط بهذا المتجر." : "This account is not linked to this store.");
        return;
      }

      setUser(loadedUser);
      const ordersResponse = await fetch(`/api/customer/orders?storeSlug=${encodeURIComponent(slug)}&t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const ordersData = await ordersResponse.json().catch(() => null);
      if (!ordersResponse.ok || !ordersData?.success) {
        throw new Error(ordersData?.message || (locale === "ar" ? "تعذر تحميل الطلبات" : "Could not load orders"));
      }
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : locale === "ar" ? "حدث خطأ أثناء تحميل الحساب" : "Could not load account");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoggingOut(true);
    setError("");
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      try {
        localStorage.removeItem(`mizar-customer-auth:${store?.slug || store?.id || "store"}`);
      } catch {}
      window.dispatchEvent(new Event("mizar-customer-auth-changed"));
      router.replace(buildStoreHref(store));
      router.refresh();
    } catch {
      setError(locale === "ar" ? "تعذر تسجيل الخروج" : "Could not log out");
      setLoggingOut(false);
    }
  }

  useEffect(() => {
    loadAccount();
  }, [slug]);

  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="account" />

      <section className={styles.accountHero}>
        <div className={styles.shell}>
          <div className={styles.accountHeroCard}>
            <span className={styles.kicker}>{locale === "ar" ? "حساب العميل" : "Customer account"}</span>
            <h1 className={styles.pageTitle}>{locale === "ar" ? "حسابي وطلباتي" : "My account & orders"}</h1>
            <p className={styles.sectionSubtitle}>
              {locale === "ar"
                ? `أهلًا ${user?.name || "بك"} في ${getStoreName(store)}. من هنا تقدر تتابع طلباتك وتكمل التسوق وأنت مسجل دخول.`
                : `Welcome ${user?.name || "back"} to ${getStoreName(store)}. Track your orders and continue shopping while signed in.`}
            </p>
            <div className={styles.heroActions}>
              <Link href={buildStoreHref(store, "products")} className={styles.primaryButton}>{locale === "ar" ? "متابعة التسوق" : "Continue shopping"}</Link>
              <Link href={buildStoreHref(store, "cart")} className={styles.secondaryButton}>{text.nav.cart}</Link>
              {user ? (
                <button type="button" onClick={logout} disabled={loggingOut} className={styles.dangerButton}>
                  {loggingOut ? (locale === "ar" ? "جاري الخروج..." : "Signing out...") : (locale === "ar" ? "تسجيل الخروج" : "Logout")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          {loading ? (
            <div className={styles.accountSkeletonGrid}>
              {[1, 2, 3, 4, 5, 6].map((item) => <span key={item} className={styles.skeletonBlock} />)}
            </div>
          ) : !user ? (
            <div className={styles.empty}>
              <h3>{locale === "ar" ? "سجّل دخولك أولًا" : "Please login first"}</h3>
              <p>{locale === "ar" ? "تحتاج إلى تسجيل الدخول لمشاهدة حسابك وطلباتك." : "You need to login to view your account and orders."}</p>
              <Link href={buildStoreHref(store, `login?next=${encodeURIComponent(buildStoreHref(store, "account"))}`)} className={styles.primaryButton}>{text.nav.login}</Link>
            </div>
          ) : (
            <div className={styles.accountGrid}>
              <aside className={styles.accountSidebar}>
                <div className={styles.accountCard}>
                  <h2>{locale === "ar" ? "بيانات الحساب" : "Account details"}</h2>
                  <div className={styles.accountInfoList}>
                    <div><span>{locale === "ar" ? "الاسم" : "Name"}</span><strong>{user.name}</strong></div>
                    <div><span>{locale === "ar" ? "البريد" : "Email"}</span><strong>{user.email}</strong></div>
                    <div><span>{locale === "ar" ? "الجوال" : "Phone"}</span><strong>{user.phone || (locale === "ar" ? "غير متوفر" : "N/A")}</strong></div>
                  </div>
                </div>

                <div className={styles.accountCard}>
                  <h2>{locale === "ar" ? "روابط سريعة" : "Quick links"}</h2>
                  <div className={styles.accountQuickLinks}>
                    <Link href={buildStoreHref(store, "products")}>{text.nav.products}</Link>
                    <Link href={buildStoreHref(store, "wishlist")}>{text.nav.wishlist}</Link>
                    <Link href={buildStoreHref(store, "cart")}>{text.nav.cart}</Link>
                    <Link href={buildStoreHref(store, "contact")}>{text.nav.contact}</Link>
                  </div>
                </div>
              </aside>

              <div className={styles.accountMain}>
                {error ? <div className={styles.formError}>{error}</div> : null}

                <div className={styles.accountStats}>
                  <div><span>{locale === "ar" ? "كل الطلبات" : "Total orders"}</span><strong>{stats.totalOrders}</strong></div>
                  <div><span>{locale === "ar" ? "طلبات نشطة" : "Active"}</span><strong>{stats.activeOrders}</strong></div>
                  <div><span>{locale === "ar" ? "مكتملة" : "Completed"}</span><strong>{stats.completedOrders}</strong></div>
                  <div><span>{locale === "ar" ? "إجمالي الشراء" : "Total spent"}</span><strong>{formatMoney(stats.totalSpent, currency)}</strong></div>
                </div>

                <div className={styles.accountCard}>
                  <div className={styles.sectionHead}>
                    <div>
                      <span className={styles.kicker}>{locale === "ar" ? "طلباتي" : "My orders"}</span>
                      <h2 className={styles.sectionTitle}>{locale === "ar" ? "متابعة الطلبات" : "Order tracking"}</h2>
                    </div>
                    <Link href={buildStoreHref(store, "products")} className={styles.secondaryButton}>{locale === "ar" ? "شراء جديد" : "Shop again"}</Link>
                  </div>

                  {orders.length === 0 ? (
                    <div className={styles.emptyInline}>
                      {locale === "ar" ? "لا توجد طلبات حتى الآن. ابدأ التسوق وأكمل أول طلب." : "No orders yet. Start shopping and place your first order."}
                    </div>
                  ) : (
                    <div className={styles.ordersList}>
                      {orders.map((order) => {
                        const subtotal = orderSubtotal(order);
                        const shippingFee = Math.max(Number(order.total || 0) - subtotal, 0);
                        return (
                          <article key={order.id} className={styles.orderCard}>
                            <div className={styles.orderTop}>
                              <div>
                                <span className={styles.orderStatus}>{statusLabel(order.status, locale)}</span>
                                <h3>#{order.id}</h3>
                                <p>{formatDate(order.createdAt, locale)}</p>
                              </div>
                              <strong>{formatMoney(order.total, currency)}</strong>
                            </div>
                            <div className={styles.orderMeta}>
                              <span>{paymentLabel(order.paymentMethod || order.payment, locale)}</span>
                              <span>{locale === "ar" ? "المنتجات" : "Items"}: {(order.items || []).length}</span>
                              <span>{locale === "ar" ? "الشحن" : "Shipping"}: {formatMoney(shippingFee, currency)}</span>
                            </div>
                            <div className={styles.orderActions}>
                              <Link href={buildStoreHref(store, `account/orders/${order.id}`)} className={styles.primaryButton}>{locale === "ar" ? "تفاصيل الطلب" : "Order details"}</Link>
                              <Link href={buildStoreHref(store, `order-success/${order.id}`)} className={styles.secondaryButton}>{locale === "ar" ? "تتبع الطلب" : "Track order"}</Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer store={store} text={text} locale={locale} />
    </main>
  );
}
