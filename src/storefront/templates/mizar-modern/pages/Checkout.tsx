import Link from "next/link";
import { buildStoreHref } from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "../styles.module.css";
import { theme } from "../theme";

export function Checkout(props: TemplatePageProps) {
  const { store, locale, text } = props;
  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="cart" />
      <section className={styles.pageHero}><div className={styles.shell}><span className={styles.kicker}>{theme.name}</span><h1 className={styles.pageTitle}>{locale === "ar" ? "إتمام الطلب" : "Checkout"}</h1><p className={styles.sectionSubtitle}>{locale === "ar" ? "واجهة الدفع ستأخذ نفس ستايل القالب مع ربط منطق الدفع الحالي." : "Checkout will use the same template style while keeping the current checkout logic."}</p></div></section>
      <section className={styles.section}><div className={styles.shell}><div className={styles.empty}><h3>{locale === "ar" ? "واجهة الدفع الخاصة بالقالب" : "Template checkout"}</h3><Link className={styles.primaryButton} href={buildStoreHref(store, "products")}>{text.pages.backProducts}</Link></div></div></section>
      <Footer store={store} text={text} locale={locale} />
    </main>
  );
}
