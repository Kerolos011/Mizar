"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { accountUrl, fetchCustomerSession, getLocale, labels, loginCustomer, t } from "../components/helpers";

function registerUrl(store: any) {
  return `${accountUrl(store).replace("/account", "")}/register`;
}

function safeRedirect(store: any, rawReturnTo?: string | null) {
  const fallback = accountUrl(store);
  const value = String(rawReturnTo || "").trim();

  if (!value) return fallback;
  if (!value.startsWith("/store/")) return fallback;
  if (value.includes("/login") || value.includes("/register")) return fallback;

  return value;
}

export function Login(props: any) {
  const store = props.store || {};
  const locale = getLocale(props);
  const label = labels(locale);
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await loginCustomer(store, { email, password });

      // Confirm the cookie when possible, but do not block redirect on this request.
      // LocalStorage fallback already stores the customer returned from loginCustomer.
      await fetchCustomerSession(store).catch(() => null);

      setMessage(t(locale, "تم تسجيل الدخول بنجاح. سيتم تحويلك إلى حسابك الآن.", "Signed in successfully. Redirecting to your account now."));

      const redirectTo = safeRedirect(store, searchParams.get("returnTo"));

      window.setTimeout(() => {
        window.location.href = redirectTo;
      }, 250);
    } catch (error) {
      setError(error instanceof Error ? error.message : t(locale, "فشل تسجيل الدخول", "Login failed"));
      setLoading(false);
    }
  }

  return (
    <PageShell {...props} active="account">
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.authGrid}`}>
          <div className={styles.authSide}>
            <span className={styles.authBadge}>Mizar Customer</span>
            <h1>{label.login}</h1>
            <p>{t(locale, "ادخل لحسابك لمتابعة الطلبات والمفضلة والعناوين داخل هذا المتجر.", "Access your account to follow orders, wishlist, and addresses in this store.")}</p>
          </div>

          <form className={styles.card} onSubmit={submit} noValidate>
            <span className={styles.kicker}>{label.login}</span>
            <h2 className={styles.sectionTitle}>{label.login}</h2>
            <p className={styles.sectionText}>{t(locale, "استخدم البريد وكلمة المرور الخاصة بحساب العميل.", "Use your customer email and password.")}</p>

            {error ? <div className={styles.errorBox}>{error}</div> : null}
            {message ? <div className={styles.successBox}>{message}</div> : null}

            <div className={styles.formGrid}>
              <input name="email" type="email" className={`${styles.input} ${styles.full}`} placeholder={t(locale, "البريد الإلكتروني", "Email")} required autoComplete="email" />
              <input name="password" type="password" className={`${styles.input} ${styles.full}`} placeholder={t(locale, "كلمة المرور", "Password")} required autoComplete="current-password" />
              <button className={`${styles.primaryButton} ${styles.full}`} type="submit" disabled={loading}>{loading ? t(locale, "جاري الدخول...", "Signing in...") : label.login}</button>
              <Link href={registerUrl(store)} className={`${styles.secondaryButton} ${styles.full}`}>{label.register}</Link>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
