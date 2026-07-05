"use client";

import Link from "next/link";
import { useState } from "react";
import { addCartItem } from "@/storefront/cart/storefront-cart";
import styles from "../styles.module.css";
import {
  discountPercent,
  firstText,
  getComparePrice,
  getLocale,
  getProductPrice,
  getProductSettings,
  isAvailable,
  labels,
  money,
  productImage,
  productUrl,
  t,
  toggleWishlist,
} from "./helpers";

export function ProductCard({ product, compact = false, ...props }: any) {
  const store = props.store || {};
  const locale = getLocale(props);
  const label = labels(locale);
  const settings = getProductSettings(props);
  const [notice, setNotice] = useState("");

  const image = productImage(product);
  const available = isAvailable(product);
  const oldPrice = getComparePrice(product);
  const discount = discountPercent(product);

  function showNotice(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 1600);
  }

  function handleAdd() {
    if (!available) return;

    addCartItem(store, product, 1);
    showNotice(label.addedToCart);
  }

  function handleWishlist() {
    toggleWishlist(props, product);
    showNotice(t(locale, "تم تحديث المفضلة", "Wishlist updated"));
  }

  return (
    <article className={`${styles.productCard} ${compact ? styles.compactProductCard : ""}`}>
      {notice ? <div className={styles.toast}>{notice}</div> : null}

      <Link href={productUrl(store, product)} className={styles.productMedia}>
        {image ? (
          <img
            src={image}
            alt={firstText(product.name, product.title, "Product")}
            loading="lazy"
          />
        ) : (
          <span>{t(locale, "أضف صورة للمنتج", "Add product image")}</span>
        )}

        <div className={styles.badges}>
          {discount > 0 && settings.showDiscountBadge !== false ? <b>{discount}%</b> : null}
          {!available && settings.showStockStatus !== false ? (
            <b className={styles.dangerBadge}>{label.outOfStock}</b>
          ) : null}
        </div>
      </Link>

      <div className={styles.productBody}>
        {settings.showCategory !== false && product.category ? (
          <span className={styles.productCategory}>{product.category}</span>
        ) : null}

        <Link href={productUrl(store, product)} className={styles.productName}>
          {firstText(product.name, product.title, t(locale, "منتج", "Product"))}
        </Link>

        {!compact && (product.shortDescription || product.description) ? (
          <p className={styles.productDescription}>
            {firstText(product.shortDescription, product.description)}
          </p>
        ) : null}

        <div className={styles.productMetaLine}>
          {settings.displayBrand && firstText(product.brand, product.brandName) ? (
            <span>{firstText(product.brand, product.brandName)}</span>
          ) : null}

          {settings.displaySku && product.sku ? <span dir="ltr">SKU: {product.sku}</span> : null}

          {settings.displayStockQuantity ? (
            <span>
              {t(locale, "المخزون", "Stock")}:{" "}
              {firstText(product.availableStock, product.stock, 0)}
            </span>
          ) : null}
        </div>

        {settings.allowReviews !== false && settings.showRatings !== false ? (
          <div className={styles.ratingRow}>
            <span>★★★★★</span>
            {settings.showReviewCount !== false ? (
              <small>
                {firstText(product.ratingAverage, "0")} /{" "}
                {firstText(product.reviewCount, product.ratingCount, "0")}
              </small>
            ) : null}
          </div>
        ) : null}

        <div className={styles.priceRow}>
          <strong>{money(getProductPrice(product), props, locale)}</strong>
          {oldPrice > 0 ? <del>{money(oldPrice, props, locale)}</del> : null}
        </div>

        <div className={styles.productActions}>
          {settings.enableAddToCart !== false ? (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleAdd}
              disabled={!available}
            >
              {available ? label.addToCart : label.outOfStock}
            </button>
          ) : null}

          {settings.allowWishlist !== false && settings.showWishlist !== false ? (
            <button
              type="button"
              className={styles.iconButton}
              onClick={handleWishlist}
              aria-label={label.wishlist}
            >
              ♡
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}