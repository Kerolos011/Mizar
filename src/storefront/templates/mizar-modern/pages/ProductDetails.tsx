import Link from "next/link";
import {
  addProductToCart,
  buildStoreHref,
  formatMoney,
  getProductOldPrice,
  getProductPrice,
} from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import { getTemplateProductImage } from "../../_shared/template-helpers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import styles from "../styles.module.css";
import { theme } from "../theme";

export function ProductDetails(props: TemplatePageProps) {
  const { store, products, locale, text } = props;
  const product = products[0] as any;
  const related = products.filter((item) => item.id !== product?.id).slice(0, 4);
  const imageUrl = product ? getTemplateProductImage(product) : "";
  const currency = product?.currency || store?.currency || "EGP";
  const oldPrice = product ? getProductOldPrice(product) : 0;
  const price = product ? getProductPrice(product) : 0;

  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="products" />
      <section className={styles.section}>
        <div className={styles.shell}>
          {product ? (
            <div className={styles.productDetailsGrid}>
              <div className={styles.detailImage}>{imageUrl ? <img src={imageUrl} alt={product.name} /> : <div className={styles.heroPlaceholder}>{text.common.productImageHint}</div>}</div>
              <div className={styles.detailInfo}>
                <span className={styles.kicker}>{product.category || theme.name}</span>
                <h1 className={styles.pageTitle}>{product.name}</h1>
                <p className={styles.sectionSubtitle}>{product.fullDescription || product.description || product.shortDescription || text.pages.productsSubtitle}</p>
                <div className={styles.detailPrice}><strong>{formatMoney(price, currency)}</strong>{oldPrice > 0 ? <span>{formatMoney(oldPrice, currency)}</span> : null}</div>
                <div className={styles.detailMeta}>
                  <div><span>{locale === "ar" ? "المخزون" : "Stock"}</span><strong>{product.stockLabel || product.availableStock || product.stock || 0}</strong></div>
                  <div><span>{locale === "ar" ? "العملة" : "Currency"}</span><strong>{currency}</strong></div>
                  <div><span>{locale === "ar" ? "الشحن" : "Shipping"}</span><strong>{store?.shippingFee ? formatMoney(Number(store.shippingFee), currency) : "-"}</strong></div>
                </div>
                <button className={styles.primaryButton} onClick={() => addProductToCart(store, product)}>{text.common.add}</button>
              </div>
            </div>
          ) : <div className={styles.empty}><h3>{text.pages.noProducts}</h3><Link className={styles.primaryButton} href={buildStoreHref(store, "products")}>{text.pages.backProducts}</Link></div>}
        </div>
      </section>
      {related.length ? <section className={styles.sectionSoft}><div className={styles.shell}><h2 className={styles.sectionTitle}>{locale === "ar" ? "منتجات أخرى" : "More products"}</h2><div className={styles.productGrid}>{related.map((item) => <ProductCard key={item.id} store={store} product={item} locale={locale} text={text} />)}</div></div></section> : null}
      <Footer store={store} text={text} locale={locale} />
    </main>
  );
}
