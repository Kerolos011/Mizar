"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import { getLocale, labels, productsUrl, readWishlist, t } from "../components/helpers";

export function Wishlist(props: any) {
  const store = props.store || {};
  const products = Array.isArray(props.products) ? props.products : [];
  const locale = getLocale(props);
  const label = labels(locale);
  const [items, setItems] = useState<any[]>([]);
  function refresh() {
    const raw = readWishlist(store);
    setItems(raw.map((item) => item.product || products.find((p: any) => String(p.id) === String(item.productId || item.id))).filter(Boolean));
  }
  useEffect(() => { refresh(); window.addEventListener("mizar-wishlist-updated", refresh); return () => window.removeEventListener("mizar-wishlist-updated", refresh); }, [store.id, store.slug, products.length]);
  return <PageShell {...props} active="wishlist"><section className={styles.section}><div className={styles.container}><div className={styles.sectionHeader}><div><span className={styles.kicker}>{label.wishlist}</span><h1 className={styles.sectionTitle}>{label.wishlist}</h1><p className={styles.sectionText}>{t(locale, "منتجات حفظها العميل للرجوع إليها لاحقًا.", "Products saved by the customer for later.")}</p></div></div>{items.length ? <div className={styles.productGrid}>{items.map((product: any) => <ProductCard key={product.id} product={product} {...props} />)}</div> : <div className={styles.emptyState}><strong>{t(locale, "المفضلة فارغة", "Wishlist is empty")}</strong><span>{t(locale, "اضغط على القلب في أي منتج ليظهر هنا.", "Tap the heart on a product to show it here.")}</span><Link href={productsUrl(store)} className={styles.secondaryButton}>{label.viewProducts}</Link></div>}</div></section></PageShell>;
}
