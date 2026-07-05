"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildStoreHref, readWishlistIds } from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import styles from "../styles.module.css";
import { theme } from "../theme";

export function Wishlist(props: TemplatePageProps) {
  const { store, content, products, categories, locale, text } = props;
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(readWishlistIds(store));
    const handler = () => setIds(readWishlistIds(store));
    window.addEventListener("mizar-wishlist-updated", handler);
    return () => window.removeEventListener("mizar-wishlist-updated", handler);
  }, [store]);
  const wishlistProducts = useMemo(() => products.filter((product) => ids.includes(product.id)), [products, ids]);

  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="wishlist" />
      <section className={styles.pageHero}><div className={styles.shell}><div className={styles.eyebrow}>{theme.name}</div><h1 className={styles.pageTitle}>{text.pages.wishlistTitle}</h1><p className={styles.sectionSubtitle}>{text.pages.wishlistSubtitle}</p></div></section>
      <section className={styles.section}>
        <div className={styles.shell}>
          {wishlistProducts.length ? <div className={styles.productGrid}>{wishlistProducts.map((product) => <ProductCard key={product.id} store={store} product={product} locale={locale} text={text} />)}</div> : <div className={styles.empty}><h3>{text.pages.emptyWishlist}</h3><p>{text.pages.emptyWishlistText}</p><Link className={styles.primaryButton} href={buildStoreHref(store, "products")}>{text.pages.backProducts}</Link></div>}
        </div>
      </section>
      <Footer store={store} text={text} />
    </main>
  );
}
