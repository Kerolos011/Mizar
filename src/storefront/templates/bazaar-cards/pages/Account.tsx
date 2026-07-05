"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import {
  cartUrl,
  fetchCustomerSession,
  getLocale,
  homeUrl,
  labels,
  logoutCustomer,
  productsUrl,
  t,
} from "../components/helpers";

export function Account(props: any) {
  const store = props.store || {};
  const locale = getLocale(props);
  const label = labels(locale);

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAccount() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchCustomerSession(store);
      const sessionCustomer = data?.authenticated ? data?.customer || data?.user : null;

      setCustomer(sessionCustomer || null);

      if (!data?.authenticated) {
        setError("");
      }
    } catch (error) {
      setCustomer(null);
      setError(
        error instanceof Error
          ? error.message
          : t(locale, "تعذر تحميل الحساب", "Could not load account"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutCustomer(store);
      setCustomer(null);

      if (typeof window !== "undefined") {
        window.location.href = `${homeUrl(store)}/login?t=${Date.now()}`;
      }
    } catch (error) {
      setCustomer(null);
      setError(
        error instanceof Error
          ? error.message
          : t(locale, "فشل تسجيل الخروج", "Logout failed"),
      );
    }
  }

  useEffect(() => {
    loadAccount();
  }, [store.id, store.slug]);

  return (
    <PageShell {...props} active="account">
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.accountHeader}>
              <div>
                <span className={styles.kicker}>{label.account}</span>

                <h1 className={styles.sectionTitle}>
                  {customer?.name || t(locale, "حساب العميل", "Customer account")}
                </h1>

                <p className={styles.sectionText}>
                  {customer
                    ? t(
                        locale,
                        "حسابك مرتبط فعليًا بقاعدة البيانات ويمكن استخدامه في الطلبات.",
                        "Your account is connected to the database and can be used for orders.",
                      )
                    : t(
                        locale,
                        "سجل الدخول أو أنشئ حسابًا لمتابعة طلباتك.",
                        "Login or create an account to track your orders.",
                      )}
                </p>
              </div>

              {customer ? (
                <button type="button" className={styles.dangerButton} onClick={logout}>
                  {t(locale, "تسجيل الخروج", "Logout")}
                </button>
              ) : null}
            </div>

            {loading ? (
              <div className={styles.tabCard}>
                {t(locale, "جاري تحميل الحساب...", "Loading account...")}
              </div>
            ) : null}

            {error ? <div className={styles.errorBox}>{error}</div> : null}

            {!loading && customer ? (
              <div className={styles.customerPanel}>
                <div className={styles.summaryRow}>
                  <span>{t(locale, "الاسم", "Name")}</span>
                  <strong>{customer.name || "—"}</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>{t(locale, "الموبايل", "Phone")}</span>
                  <strong dir="ltr">{customer.phone || "—"}</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>{t(locale, "البريد", "Email")}</span>
                  <strong dir="ltr">{customer.email || customer.user?.email || "—"}</strong>
                </div>

                {customer.address ? (
                  <div className={styles.summaryRow}>
                    <span>{t(locale, "العنوان", "Address")}</span>
                    <strong>{customer.address}</strong>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!loading && !customer ? (
              <div className={styles.inlineActions}>
                <Link
                  href={`${homeUrl(store)}/login?returnTo=${encodeURIComponent(accountUrlFallback(store))}`}
                  className={styles.primaryButton}
                >
                  {label.login}
                </Link>

                <Link href={`${homeUrl(store)}/register`} className={styles.secondaryButton}>
                  {label.register}
                </Link>
              </div>
            ) : null}

            <div className={styles.infoGrid}>
              <Link className={styles.infoCard} href={cartUrl(store)}>
                <span className={styles.infoIcon}>🛒</span>
                <strong>{label.cart}</strong>
                <span>
                  {t(
                    locale,
                    "راجع المنتجات قبل إتمام الطلب.",
                    "Review products before checkout.",
                  )}
                </span>
              </Link>

              <Link className={styles.infoCard} href={`${homeUrl(store)}/wishlist`}>
                <span className={styles.infoIcon}>♡</span>
                <strong>{label.wishlist}</strong>
                <span>{t(locale, "المنتجات المحفوظة.", "Saved products.")}</span>
              </Link>

              <Link className={styles.infoCard} href={productsUrl(store)}>
                <span className={styles.infoIcon}>↗</span>
                <strong>{label.products}</strong>
                <span>{t(locale, "تصفح كتالوج المتجر.", "Browse the catalog.")}</span>
              </Link>

              <Link className={styles.infoCard} href={`${homeUrl(store)}/contact`}>
                <span className={styles.infoIcon}>☎</span>
                <strong>{label.contact}</strong>
                <span>{t(locale, "تواصل مع المتجر.", "Contact the store.")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function accountUrlFallback(store: any) {
  return `${homeUrl(store)}/account`;
}