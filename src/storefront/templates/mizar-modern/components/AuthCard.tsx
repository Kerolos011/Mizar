"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { buildStoreHref, getStoreName } from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import styles from "../styles.module.css";

function safeInternalNext(value: string | null, store: TemplatePageProps["store"]) {
  const fallback = buildStoreHref(store, "account");
  if (!value) return fallback;
  if (value.startsWith(buildStoreHref(store)) || value.startsWith(`/store/${store?.slug || ""}`)) return value;
  if (value.startsWith("/store/")) return value;
  return fallback;
}

export function AuthCard({ mode, store, locale, text }: Pick<TemplatePageProps, "store" | "locale" | "text"> & { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const target = useMemo(() => safeInternalNext(searchParams.get("next"), store), [searchParams, store]);
  const isLogin = mode === "login";
  const title = isLogin ? (locale === "ar" ? "تسجيل الدخول" : "Customer login") : (locale === "ar" ? "إنشاء حساب" : "Create account");
  const subtitle = isLogin
    ? (locale === "ar" ? `ادخل إلى حسابك في ${getStoreName(store)} لمتابعة طلباتك والشراء بشكل أسرع.` : `Access your ${getStoreName(store)} account to track orders and shop faster.`)
    : (locale === "ar" ? "أنشئ حسابك مرة واحدة، وبعدها تابع طلباتك وبياناتك من صفحة حسابي." : "Create your account once, then track your orders from My Account.");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/customer/login" : "/api/auth/customer/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          storeId: store?.id,
          storeSlug: store?.slug,
          name,
          email,
          phone,
          password,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || (locale === "ar" ? "تعذر تنفيذ العملية" : "Action failed"));
      }

      try {
        localStorage.setItem(`mizar-customer-auth:${store?.slug || store?.id || "store"}`, "1");
      } catch {}

      window.dispatchEvent(new Event("mizar-customer-auth-changed"));
      router.replace(target || buildStoreHref(store, "account"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : locale === "ar" ? "حدث خطأ غير متوقع" : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authCard}>
      <div className={styles.authBadge}>{locale === "ar" ? "منطقة العميل" : "Customer area"}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>

      <form className={styles.form} onSubmit={submit}>
        {!isLogin ? (
          <input className={styles.input} value={name} onChange={(event) => setName(event.target.value)} placeholder={locale === "ar" ? "الاسم بالكامل" : "Full name"} required />
        ) : null}
        <input className={styles.input} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={locale === "ar" ? "البريد الإلكتروني" : "Email address"} required />
        {!isLogin ? (
          <input className={styles.input} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={locale === "ar" ? "رقم الجوال" : "Phone number"} />
        ) : null}
        <input className={styles.input} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={locale === "ar" ? "كلمة المرور" : "Password"} required />
        {error ? <div className={styles.formError}>{error}</div> : null}
        <button className={styles.primaryButton} type="submit" disabled={loading}>
          {loading ? (locale === "ar" ? "جاري التنفيذ..." : "Please wait...") : title}
        </button>
      </form>

      <div className={styles.authSwitch}>
        {isLogin ? (
          <Link href={buildStoreHref(store, `register?next=${encodeURIComponent(target)}`)}>{locale === "ar" ? "ليس لديك حساب؟ إنشاء حساب جديد" : "No account? Create one"}</Link>
        ) : (
          <Link href={buildStoreHref(store, `login?next=${encodeURIComponent(target)}`)}>{locale === "ar" ? "لديك حساب بالفعل؟ تسجيل الدخول" : "Already registered? Login"}</Link>
        )}
      </div>
    </div>
  );
}
