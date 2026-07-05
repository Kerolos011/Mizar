
import Link from "next/link";
import { buildStoreHref } from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "../styles.module.css";
import { theme } from "../theme";

export function OrderSuccess(props: TemplatePageProps) {
  const { store, locale, text } = props;
  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="cart" />
      <section className={styles.pageHero}><div className={styles.shell}><div className={styles.eyebrow}>{theme.name}</div><h1 className={styles.pageTitle}>{locale === "ar" ? "تم استلام الطلب" : "Order Received"}</h1><p className={styles.sectionSubtitle}>{locale === "ar" ? "هذه واجهة نجاح الطلب الخاصة بالقالب، وسيتم ربطها ببيانات الطلب في المرحلة التالية." : "This is the template order-success surface. It will be connected to order data in the next phase."}</p></div></section>
      <section className={styles.section}><div className={styles.shell}><div className={styles.empty}><h3>{locale === "ar" ? "شكرًا لطلبك" : "Thank you for your order"}</h3><Link className={styles.primaryButton} href={buildStoreHref(store)}>{text.nav.home}</Link></div></div></section>
      <Footer store={store} text={text} />
    </main>
  );
}
