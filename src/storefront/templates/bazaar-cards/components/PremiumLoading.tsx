"use client";

import styles from "../styles.module.css";
import { labels, type Locale } from "./helpers";

export function PremiumLoading({ locale = "ar" }: { locale?: Locale }) {
  const label = labels(locale);
  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"}>
      <section className={styles.loadingWrap}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingMark}>
            <span />
            <span />
            <span />
          </div>
          <strong>{label.loadingTitle}</strong>
          <p>{label.loadingText}</p>
          <div className={styles.loadingLines}>
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>
    </main>
  );
}
