"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { buildStoreHref } from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import styles from "../styles.module.css";

export function AuthCard({ mode, store, locale, text }: Pick<TemplatePageProps, "store" | "locale" | "text"> & { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/api/auth/customer/login" : "/api/auth/customer/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: store?.id, storeSlug: store?.slug, name, email, phone, password }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) throw new Error(result?.message || (locale === "ar" ? "تعذر تنفيذ العملية" : "Could not complete the request"));
      const next = searchParams.get("next") || buildStoreHref(store, "account");
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : locale === "ar" ? "حدث خطأ غير متوقع" : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authCard}>
      <div className={styles.eyebrow}>{mode === "login" ? text.pages.loginTitle : text.pages.registerTitle}</div>
      <h1 className={styles.pageTitle}>{mode === "login" ? text.pages.loginTitle : text.pages.registerTitle}</h1>
      <p className={styles.sectionSubtitle}>{mode === "login" ? text.pages.loginSubtitle : text.pages.registerSubtitle}</p>
      <form className={styles.form} onSubmit={submit}>
        {mode === "register" ? <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder={locale === "ar" ? "الاسم" : "Name"} required /> : null}
        {mode === "register" ? <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={locale === "ar" ? "رقم الجوال" : "Phone"} /> : null}
        <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={locale === "ar" ? "البريد الإلكتروني" : "Email"} required />
        <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={locale === "ar" ? "كلمة المرور" : "Password"} required />
        {error ? <div className={styles.formError}>{error}</div> : null}
        <button className={styles.primaryButton} type="submit" disabled={loading}>{loading ? (locale === "ar" ? "جاري التنفيذ..." : "Please wait...") : mode === "login" ? text.pages.loginTitle : text.pages.registerTitle}</button>
      </form>
      <p className={styles.sectionSubtitle} style={{ marginTop: 16 }}>
        {mode === "login" ? (locale === "ar" ? "ليس لديك حساب؟" : "No account?") : (locale === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?")} {" "}
        <Link href={buildStoreHref(store, mode === "login" ? "register" : "login")} style={{ color: "var(--tpl-primary)", fontWeight: 900 }}>
          {mode === "login" ? text.pages.registerTitle : text.pages.loginTitle}
        </Link>
      </p>
    </div>
  );
}
