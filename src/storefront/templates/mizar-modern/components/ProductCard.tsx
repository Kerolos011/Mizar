"use client";

import Link from "next/link";
import {
  addProductToCart,
  formatMoney,
  getProductOldPrice,
  getProductPrice,
  getProductUrl,
  toggleWishlist,
} from "@/storefront/StorefrontPagesShared";
import type { PublicStore, StorefrontProduct, StoreLocale, getLocaleText } from "@/storefront/StorefrontPagesShared";
import { getTemplateProductImage } from "../../_shared/template-helpers";
import styles from "../styles.module.css";

export function ProductCard({
  store,
  product,
  locale,
  text,
}: {
  store: PublicStore | null;
  product: StorefrontProduct;
  locale: StoreLocale;
  text: ReturnType<typeof getLocaleText>;
}) {
  const imageUrl = getTemplateProductImage(product);
  const oldPrice = getProductOldPrice(product);
  const price = getProductPrice(product);
  const currency = product.currency || store?.currency || "EGP";
  const isOut = Number(product.availableStock ?? product.stock ?? 0) <= 0;
  const discount = oldPrice > price && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <article className={styles.productCard}>
      <Link href={getProductUrl(String(store?.slug || ""), product)} className={styles.productImage}>
        {imageUrl ? <img src={imageUrl} alt={product.name} /> : <span className={styles.productPlaceholder}>{text.common.productImageHint}</span>}
        {discount > 0 ? <span className={styles.discountBadge}>-{discount}%</span> : null}
        <span className={isOut ? styles.stockBadgeMuted : styles.stockBadge}>{isOut ? (locale === "ar" ? "غير متوفر" : "Out of stock") : (locale === "ar" ? "متوفر" : "In stock")}</span>
      </Link>

      <div className={styles.cardBody}>
        <div className={styles.category}>{product.category || text.common.collection}</div>
        <Link href={getProductUrl(String(store?.slug || ""), product)} className={styles.productName}>
          {product.name || product.title || (locale === "ar" ? "منتج" : "Product")}
        </Link>
        <p className={styles.desc}>{product.shortDescription || product.description || (locale === "ar" ? "منتج مختار بعناية داخل المتجر." : "A carefully selected product from this store.")}</p>
        <div className={styles.priceRow}>
          <strong className={styles.price}>{formatMoney(price, currency)}</strong>
          {oldPrice > 0 ? <span className={styles.oldPrice}>{formatMoney(oldPrice, currency)}</span> : null}
        </div>
        <div className={styles.cardActions}>
          <button type="button" className={styles.smallButton} disabled={isOut} onClick={() => addProductToCart(store, product)}>{text.common.add}</button>
          <button type="button" className={styles.heartButton} onClick={() => toggleWishlist(store, product)} aria-label={text.nav.wishlist}>♡</button>
        </div>
      </div>
    </article>
  );
}
