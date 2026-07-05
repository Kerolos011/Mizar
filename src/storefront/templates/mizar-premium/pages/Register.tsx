"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import {
  accountUrl,
  egyptianMobileMessage,
  getLocale,
  isValidEgyptianMobile,
  labels,
  normalizeEgyptianMobile,
  registerCustomer,
  fetchCustomerSession,
  t,
} from "../components/helpers";

function loginUrl(store: any) {
  return `${accountUrl(store).replace("/account", "")}/login`;
}

export function Register(props: any) {
  const store = props.store || {};
  const locale = getLocale(props);
  const label = labels(locale);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = normalizeEgyptianMobile(form.get("phone"));

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!isValidEgyptianMobile(phone)) {
        throw new Error(egyptianMobileMessage(locale));
      }

      await registerCustomer(store, {
        name: String(form.get("name") || ""),
        phone,
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      });

      await fetchCustomerSession(store).catch(() => null);
      setMessage(t(locale, "تم إنشاء حساب العميل بنجاح. سيتم تحويلك إلى حسابك الآن.", "Customer account created successfully. Redirecting to your account now."));
      window.setTimeout(() => {
        window.location.replace(`${accountUrl(store)}?t=${Date.now()}`);
      }, 350);
    } catch (error) {
      setError(error instanceof Error ? error.message : t(locale, "فشل إنشاء الحساب", "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell {...props} active="account">
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.authGrid}`}>
          <div className={styles.authSide}>
            <span className={styles.authBadge}>New Customer</span>
            <h1>{label.register}</h1>
            <p>{t(locale, "أنشئ حسابًا لتجربة شراء أسرع وحفظ بياناتك وطلباتك داخل المتجر.", "Create an account for faster shopping and saved orders inside the store.")}</p>
          </div>

          <form className={styles.card} onSubmit={submit} noValidate>
            <span className={styles.kicker}>{label.register}</span>
            <h2 className={styles.sectionTitle}>{label.register}</h2>
            <p className={styles.sectionText}>{t(locale, "بيانات الحساب مرتبطة بهذا المتجر فقط. رقم الموبايل يجب أن يكون رقم مصري صحيح.", "This account is linked to this store. Phone number must be a valid Egyptian mobile number.")}</p>

            {error ? <div className={styles.errorBox}>{error}</div> : null}
            {message ? <div className={styles.successBox}>{message}</div> : null}

            <div className={styles.formGrid}>
              <input name="name" className={styles.input} placeholder={t(locale, "الاسم", "Name")} required autoComplete="name" />
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                className={styles.input}
                placeholder="01012345678"
                pattern="^(\\+20|0020|20|0)?1[0125][0-9]{8}$"
                title={egyptianMobileMessage(locale)}
                required
                autoComplete="tel"
              />
              <input name="email" type="email" className={`${styles.input} ${styles.full}`} placeholder={t(locale, "البريد الإلكتروني", "Email")} required autoComplete="email" />
              <input name="password" type="password" className={`${styles.input} ${styles.full}`} placeholder={t(locale, "كلمة المرور", "Password")} required minLength={6} autoComplete="new-password" />
              <button className={`${styles.primaryButton} ${styles.full}`} type="submit" disabled={loading}>{loading ? t(locale, "جاري إنشاء الحساب...", "Creating account...") : label.register}</button>
              <Link href={loginUrl(store)} className={`${styles.secondaryButton} ${styles.full}`}>{label.login}</Link>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
