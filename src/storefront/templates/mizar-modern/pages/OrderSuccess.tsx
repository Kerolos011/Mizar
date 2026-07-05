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
      <section className={styles.pageHero}><div className={styles.shell}><span className={styles.kicker}>{theme.name}</span><h1 className={styles.pageTitle}>{locale === "ar" ? "تم استلام الطلب" : "Order received"}</h1><p className={styles.sectionSubtitle}>{locale === "ar" ? "شكراً لك. سيتم التواصل معك حسب بيانات التواصل والشحن الخاصة بالمتجر." : "Thank you. The store will contact you according to its shipping and contact settings."}</p></div></section>
      <section className={styles.section}><div className={styles.shell}><div className={styles.empty}><h3>{locale === "ar" ? "شكرًا لطلبك" : "Thank you for your order"}</h3><Link className={styles.primaryButton} href={buildStoreHref(store)}>{text.nav.home}</Link></div></div></section>
      <Footer store={store} text={text} locale={locale} />
    </main>
  );
}
