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

export function ProductCard({ store, product, locale, text }: { store: PublicStore | null; product: StorefrontProduct; locale: StoreLocale; text: ReturnType<typeof getLocaleText> }) {
  const imageUrl = getTemplateProductImage(product);
  const oldPrice = getProductOldPrice(product);
  const currency = product.currency || store?.currency || "EGP";
  return (
    <article className={styles.productCard}>
      <Link href={getProductUrl(String(store?.slug || ""), product)} className={styles.productImage}>
        {imageUrl ? <img src={imageUrl} alt={product.name} /> : <span className={styles.productPlaceholder}>{text.common.productImageHint}</span>}
        <span className={styles.badge}>{product.category || text.common.selected}</span>
      </Link>
      <div className={styles.cardBody}>
        <div className={styles.category}>{product.category || text.common.collection}</div>
        <Link href={getProductUrl(String(store?.slug || ""), product)} className={styles.productName}>
          {product.name || product.title || (locale === "ar" ? "منتج" : "Product")}
        </Link>
        <p className={styles.desc}>{product.shortDescription || product.description || (locale === "ar" ? "منتج مختار داخل المتجر." : "A selected product from this store.")}</p>
        <div className={styles.priceRow}>
          <strong className={styles.price}>{formatMoney(getProductPrice(product), currency)}</strong>
          {oldPrice > 0 ? <span className={styles.oldPrice}>{formatMoney(oldPrice, currency)}</span> : null}
        </div>
        <div className={styles.cardActions}>
          <button type="button" className={styles.smallButton} onClick={() => addProductToCart(store, product)}>{text.common.add}</button>
          <button type="button" className={styles.heartButton} onClick={() => toggleWishlist(store, product)} aria-label={text.nav.wishlist}>♡</button>
        </div>
      </div>
    </article>
  );
}
