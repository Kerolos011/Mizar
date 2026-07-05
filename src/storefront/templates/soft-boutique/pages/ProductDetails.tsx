
import Link from "next/link";
import { buildStoreHref } from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import styles from "../styles.module.css";
import { theme } from "../theme";

export function ProductDetails(props: TemplatePageProps) {
  const { store, products, locale, text } = props;
  const product = products[0];
  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="products" />
      <section className={styles.pageHero}>
        <div className={styles.shell}>
          <div className={styles.eyebrow}>{theme.name}</div>
          <h1 className={styles.pageTitle}>{product?.name || (locale === "ar" ? "تفاصيل المنتج" : "Product Details")}</h1>
          <p className={styles.sectionSubtitle}>{product?.description || product?.shortDescription || text.pages.productsSubtitle}</p>
        </div>
      </section>
      <section className={styles.section}><div className={styles.shell}>{product ? <ProductCard store={store} product={product} locale={locale} text={text} /> : <div className={styles.empty}><h3>{text.pages.noProducts}</h3><Link className={styles.primaryButton} href={buildStoreHref(store, "products")}>{text.pages.backProducts}</Link></div>}</div></section>
      <Footer store={store} text={text} />
    </main>
  );
}
