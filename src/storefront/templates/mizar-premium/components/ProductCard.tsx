"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addCartItem } from "@/storefront/cart/storefront-cart";
import styles from "../styles.module.css";
import {
  cartUrl,
  checkoutUrl,
  discountPercent,
  firstText,
  getComparePrice,
  getLocale,
  getProductPrice,
  getProductSettings,
  isAvailable,
  labels,
  money,
  readWishlist,
  productImage,
  productUrl,
  t,
  toggleWishlist,
} from "./helpers";

type IconName = "bag" | "heart" | "arrow" | "eye" | "compare" | "bolt" | "star" | "share";

function Icon({ name, filled = false }: { name: IconName; filled?: boolean }) {
  if (name === "heart") {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.15 5.72c-1.93-1.85-5.05-1.54-6.83.5L12 7.72l-1.32-1.5c-1.78-2.04-4.9-2.35-6.83-.5-2.22 2.14-2.33 5.7-.34 8.02 1.74 2.03 5.02 4.86 7.28 6.69.7.57 1.72.57 2.42 0 2.26-1.83 5.54-4.66 7.28-6.69 1.99-2.32 1.88-5.88-.34-8.02Z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "bag") {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7.25 8.25h9.5l.86 11.05a2 2 0 0 1-1.99 2.2H8.38a2 2 0 0 1-1.99-2.2l.86-11.05Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M9 8.25V7a3 3 0 0 1 6 0v1.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "eye") {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M2.7 12s3.35-6.3 9.3-6.3S21.3 12 21.3 12s-3.35 6.3-9.3 6.3S2.7 12 2.7 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 15.15a3.15 3.15 0 1 0 0-6.3 3.15 3.15 0 0 0 0 6.3Z" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "compare") {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 4v16M17 4v16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4.5 8h5M14.5 16h5M8.2 5.8 10.4 8l-2.2 2.2M15.8 13.8 13.6 16l2.2 2.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }


  if (name === "share") {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8.4 12.6 15.7 16.8M15.6 7.2 8.4 11.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18 8.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4ZM6 14.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4ZM18 20.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "bolt") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m13.2 2.8-8.1 11h6.2l-.6 7.4 8.2-11h-6.3l.6-7.4Z" fill="currentColor" />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m12 2.8 2.77 5.62 6.2.9-4.49 4.37 1.06 6.18L12 16.96l-5.54 2.91 1.06-6.18-4.49-4.37 6.2-.9L12 2.8Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function productIdentity(item: any) {
  return String(firstText(item?.productId, item?.id, item?.slug, item?.product?.id, item?.product?.slug));
}

function getProductId(product: any) {
  return String(firstText(product?.id, product?.slug));
}

function productImages(product: any) {
  const candidates = [
    product?.images,
    product?.gallery,
    product?.imageUrls,
    product?.media,
    product?.photos,
    product?.productImages,
    product?.variants?.[0]?.images,
  ];

  const urls: string[] = [];

  candidates.forEach((candidate: any) => {
    if (Array.isArray(candidate)) {
      candidate.forEach((item: any) => {
        const url = firstText(item?.url, item?.imageUrl, item?.src, item?.path, item);
        if (url && !urls.includes(String(url))) urls.push(String(url));
      });
    }
  });

  [product?.imageUrl, product?.image, product?.thumbnailUrl, product?.coverUrl, product?.mainImage].forEach((item: any) => {
    if (item && !urls.includes(String(item))) urls.unshift(String(item));
  });

  const first = productImage(product);
  if (first && !urls.includes(String(first))) urls.unshift(String(first));

  return urls.filter(Boolean);
}

function getBadgeLabels(product: any, discount: number, available: boolean, locale: "ar" | "en") {
  const flags = {
    isNew: Boolean(product?.isNew || product?.new || product?.badge === "NEW" || product?.status === "NEW"),
    isBestSeller: Boolean(product?.isBestSeller || product?.bestSeller || product?.badge === "BEST_SELLER" || product?.badge === "BEST SELLER"),
    isLimited: Boolean(product?.isLimited || product?.limited || product?.badge === "LIMITED"),
  };

  const rows: { key: string; text: string; tone: string }[] = [];

  if (!available) rows.push({ key: "out", text: t(locale, "نفد المخزون", "Out of stock"), tone: "out" });
  if (discount > 0) rows.push({ key: "sale", text: t(locale, "تخفيض", "Sale"), tone: "sale" });
  if (flags.isNew) rows.push({ key: "new", text: t(locale, "جديد", "New"), tone: "new" });
  if (flags.isBestSeller) rows.push({ key: "best", text: t(locale, "الأكثر مبيعًا", "Best seller"), tone: "best" });
  if (flags.isLimited) rows.push({ key: "limited", text: t(locale, "كمية محدودة", "Limited"), tone: "limited" });

  return rows.slice(0, 2);
}

function productHasVariants(product: any) {
  return (Array.isArray(product?.productVariants) && product.productVariants.length > 0) ||
    (Array.isArray(product?.variants) && product.variants.length > 0);
}

function firstNumber(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }

  return null;
}

function variantAvailable(product: any) {
  const variants = Array.isArray(product?.productVariants) && product.productVariants.length
    ? product.productVariants
    : Array.isArray(product?.variants)
      ? product.variants
      : [];

  if (!variants.length) return isAvailable(product);

  return variants.some((variant: any) => {
    const status = String(variant?.status || "ACTIVE").toUpperCase();
    if (["OUT_OF_STOCK", "HIDDEN", "DISABLED", "INACTIVE", "ARCHIVED"].includes(status)) return false;

    const stock = firstNumber(variant?.availableStock, variant?.availableQuantity, variant?.stock, variant?.quantity);
    return stock === null || stock > 0;
  });
}

function numberText(value: any) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value || "");
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(parsed);
}

export function ProductCard({ product, compact = false, ...props }: any) {
  const store = props.store || {};
  const locale = getLocale(props);
  const label = labels(locale);
  const settings = getProductSettings(props);
  const [notice, setNotice] = useState("");
  const [wishlistActive, setWishlistActive] = useState(false);

  const images = useMemo(() => productImages(product), [product]);
  const image = images[0] || "";
  const hoverImage = images[1] || "";
  const available = variantAvailable(product);
  const oldPrice = getComparePrice(product);
  const currentPrice = getProductPrice(product);
  const discount = discountPercent(product);
  const savings = oldPrice > currentPrice ? oldPrice - currentPrice : 0;
  const badges = getBadgeLabels(product, discount, available, locale);
  const brand = firstText(product.brand, product.brandName, product.vendor, product.manufacturer, product.category);
  const variant = firstText(product.variantName, product.variant, product.color, product.size, product.shortDescription);
  const rating = firstText(product.ratingAverage, product.rating, product.averageRating, "5.0");
  const reviews = firstText(product.reviewsCount, product.reviewCount, product._count?.reviews, product.reviews?.length, "12");

  function currentProductId() {
    return getProductId(product);
  }

  function syncWishlistState() {
    const productId = currentProductId();

    if (!productId) {
      setWishlistActive(false);
      return;
    }

    setWishlistActive(readWishlist(store).some((item: any) => productIdentity(item) === productId));
  }

  function showNotice(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 1600);
  }

  useEffect(() => {
    syncWishlistState();

    window.addEventListener("mizar-wishlist-updated", syncWishlistState as EventListener);
    window.addEventListener("storage", syncWishlistState as EventListener);

    return () => {
      window.removeEventListener("mizar-wishlist-updated", syncWishlistState as EventListener);
      window.removeEventListener("storage", syncWishlistState as EventListener);
    };
  }, [store?.id, store?.slug, product?.id, product?.slug]);

  function handleAdd() {
    if (!available) return;

    addCartItem(store, product, 1);
    showNotice(label.addedToCart);
  }

  function handleBuyNow() {
    if (!available) return;

    addCartItem(store, product, 1);
    showNotice(label.addedToCart);
    window.setTimeout(() => {
      window.location.href = productHasVariants(product) ? cartUrl(store) : checkoutUrl(store);
    }, 180);
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? `${window.location.origin}${productUrl(store, product)}` : productUrl(store, product);
    const title = firstText(product.name, product.title, t(locale, "منتج", "Product"));

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showNotice(t(locale, "تم نسخ رابط المنتج", "Product link copied"));
      } else {
        showNotice(url);
      }
    } catch {
      // User cancelled native share. No need to show an error.
    }
  }

  function handleCompare() {
    showNotice(t(locale, "تمت الإضافة للمقارنة", "Added to compare"));
  }

  function handleWishlist() {
    const nextWishlist = toggleWishlist(props, product);
    const productId = currentProductId();
    const nextActive = Boolean(productId && nextWishlist.some((item: any) => productIdentity(item) === productId));

    setWishlistActive(nextActive);
    showNotice(nextActive ? t(locale, "تمت الإضافة إلى المفضلة", "Added to wishlist") : t(locale, "تم الحذف من المفضلة", "Removed from wishlist"));
  }

  return (
    <article className={`${styles.productCard} ${styles.premiumProductCard} ${compact ? styles.compactProductCard : ""}`}>
      {notice ? <div className={styles.toast}>{notice}</div> : null}

      <div className={styles.productMediaFrame}>
        <Link href={productUrl(store, product)} className={styles.productMedia} aria-label={firstText(product.name, product.title, "Product")}>
          {image ? (
            <>
              <img className={styles.productPrimaryImage} src={image} alt={firstText(product.name, product.title, "Product")} loading="lazy" />
              {hoverImage ? <img className={styles.productHoverImage} src={hoverImage} alt="" loading="lazy" aria-hidden="true" /> : null}
            </>
          ) : (
            <span>{t(locale, "أضف صورة للمنتج", "Add product image")}</span>
          )}
        </Link>

        {badges.length ? (
          <div className={styles.badges}>
            {badges.map((badge) => (
              <b key={badge.key} className={`${styles.productBadge} ${styles[`productBadge${badge.tone}`] || ""}`}>
                {badge.text}
              </b>
            ))}
            {discount > 0 && settings.showDiscountBadge !== false ? <b className={`${styles.productBadge} ${styles.productBadgeDiscount}`}>-{discount}%</b> : null}
          </div>
        ) : null}

        <div className={styles.productActionRail}>
          {settings.allowWishlist !== false && settings.showWishlist !== false ? (
            <button
              type="button"
              className={`${styles.productWishlistButton} ${wishlistActive ? styles.productWishlistActive : ""}`}
              onClick={handleWishlist}
              aria-label={label.wishlist}
              aria-pressed={wishlistActive}
            >
              <Icon name="heart" filled={wishlistActive} />
            </button>
          ) : null}

          <button type="button" className={styles.productCompareButton} onClick={handleCompare} aria-label={t(locale, "مقارنة", "Compare")}>
            <Icon name="compare" />
          </button>

          {settings.enableProductSharing !== false ? (
            <button type="button" className={styles.productShareButton} onClick={handleShare} aria-label={t(locale, "مشاركة المنتج", "Share product")}>
              <Icon name="share" />
            </button>
          ) : null}

          <Link href={productUrl(store, product)} className={styles.productQuickIcon} aria-label={t(locale, "عرض سريع", "Quick view")}>
            <Icon name="eye" />
          </Link>
        </div>

        <Link href={productUrl(store, product)} className={styles.productQuickView}>
          <span>{t(locale, "عرض سريع", "Quick view")}</span>
          <Icon name="eye" />
        </Link>
      </div>

      <div className={styles.productBody}>
        <div className={styles.productInfoBlock}>
          {brand ? <span className={styles.productCategory}>{brand}</span> : null}

          <Link href={productUrl(store, product)} className={styles.productName}>
            {firstText(product.name, product.title, t(locale, "منتج", "Product"))}
          </Link>

          {!compact && variant ? <p className={styles.productVariant}>{variant}</p> : null}

          {settings.allowReviews !== false && settings.showRatings !== false ? (
            <div className={styles.productRatingRow}>
              <span className={styles.productStars} aria-hidden="true">
                <Icon name="star" />
                <Icon name="star" />
                <Icon name="star" />
                <Icon name="star" />
                <Icon name="star" />
              </span>
              <span className={styles.productReviewCount}>
                {numberText(rating)} · {numberText(reviews)} {t(locale, "تقييم", "reviews")}
              </span>
            </div>
          ) : null}
        </div>

        <div className={styles.productPricePanel}>
          <div className={styles.priceRow}>
            <strong>{money(currentPrice, props, locale)}</strong>
            {oldPrice > 0 ? <del>{money(oldPrice, props, locale)}</del> : null}
            {discount > 0 ? <span className={styles.discountPill}>-{discount}%</span> : null}
          </div>

          {savings > 0 ? (
            <small className={styles.savingsLine}>{t(locale, "وفرت", "Save")} {money(savings, props, locale)}</small>
          ) : null}

          {settings.installmentsEnabled || product.installmentLabel ? (
            <small className={styles.installmentLine}>{firstText(product.installmentLabel, t(locale, "تقسيط مرن متاح", "Flexible installments available"))}</small>
          ) : null}
        </div>

        <div className={styles.productBottomActions}>
          {settings.enableAddToCart !== false ? (
            <button type="button" className={styles.productAddButton} onClick={handleAdd} disabled={!available}>
              <Icon name="bag" />
              <span>{available ? label.addToCart : label.outOfStock}</span>
            </button>
          ) : null}

          {available ? (
            <button type="button" className={styles.productBuyButton} onClick={handleBuyNow}>
              <Icon name="bolt" />
              <span>{t(locale, "اشتري الآن", "Buy now")}</span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
