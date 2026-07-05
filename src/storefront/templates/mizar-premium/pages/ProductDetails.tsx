"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addCartItem } from "@/storefront/cart/storefront-cart";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import {
  cartUrl,
  checkoutUrl,
  discountPercent,
  findProductFromParams,
  firstText,
  getComparePrice,
  getLocale,
  getPolicies,
  getPolicy,
  getProductPrice,
  getProductSettings,
  getShippingSettings,
  isAvailable,
  labels,
  money,
  productImage,
  productsUrl,
  readWishlist,
  t,
  toggleWishlist,
} from "../components/helpers";

function Icon({ name, filled = false }: { name: "bag" | "heart" | "shield" | "truck" | "return" | "zoom" | "share"; filled?: boolean }) {
  if (name === "heart") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7.25 8.25h9.5l.86 11.05a2 2 0 0 1-1.99 2.2H8.38a2 2 0 0 1-1.99-2.2l.86-11.05Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M9 8.25V7a3 3 0 0 1 6 0v1.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }


  if (name === "share") {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.4 12.6 15.7 16.8M15.6 7.2 8.4 11.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M18 8.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4ZM6 14.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4ZM18 20.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z" stroke="currentColor" strokeWidth="1.8"/></svg>;
  }

  if (name === "truck") {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7h11v10H3V7Zm11 3h3.5l2.5 3v4h-6v-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.7"/></svg>;
  }

  if (name === "return") {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 7H5v4M5.4 10.5A7 7 0 1 0 12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }

  if (name === "zoom") {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 21-4.35-4.35M10.8 18.2a7.4 7.4 0 1 1 0-14.8 7.4 7.4 0 0 1 0 14.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  }

  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5 19 7v5.2c0 4.1-2.8 7.5-7 8.8-4.2-1.3-7-4.7-7-8.8V7l7-3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function formatCount(value: any) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(value || 0));
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

export function ProductDetails(props: any) {
  const params = useParams();
  const store = props.store || {};
  const products = Array.isArray(props.products) ? props.products : [];
  const locale = getLocale(props);
  const label = labels(locale);

  const product = findProductFromParams(products, params);
  const settings = getProductSettings(props);
  const shipping = getShippingSettings(props);

  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");
  const [wishlistActive, setWishlistActive] = useState(false);

  const images = useMemo(() => {
    const media = Array.isArray(product?.media)
      ? product.media.map((item: any) => firstText(item.url, item.imageUrl, item.fileUrl)).filter(Boolean)
      : [];

    const gallery = Array.isArray(product?.images)
      ? product.images.map((item: any) => firstText(item?.url, item?.imageUrl, item)).filter(Boolean)
      : [];

    const main = productImage(product);

    return Array.from(new Set([main, ...media, ...gallery].filter(Boolean)));
  }, [product]);

  const [activeImage, setActiveImage] = useState("");
  const safeActiveImage = activeImage && images.includes(activeImage) ? activeImage : "";
  const currentImage = safeActiveImage || images[0] || "";
  const currentImageIndex = Math.max(0, images.indexOf(currentImage));

  useEffect(() => {
    setActiveImage("");
  }, [product?.id, product?.slug]);

  function moveGallery(direction: "prev" | "next") {
    if (images.length <= 1) return;

    const baseIndex = currentImageIndex >= 0 ? currentImageIndex : 0;
    const nextIndex = direction === "next"
      ? (baseIndex + 1) % images.length
      : (baseIndex - 1 + images.length) % images.length;

    setActiveImage(images[nextIndex]);
  }

  const related = products.filter((item: any) => item.id !== product?.id && item.category === product?.category).slice(0, 4);

  const available = product ? variantAvailable(product) : false;
  const oldPrice = product ? getComparePrice(product) : 0;
  const discount = product ? discountPercent(product) : 0;

  const returnPolicy = getPolicy(props, "RETURN_POLICY", locale);
  const shippingPolicy = getPolicy(props, "SHIPPING_POLICY", locale);
  const policies = getPolicies(props);

  function productIdentity(item: any) {
    return String(firstText(item?.productId, item?.id, item?.slug, item?.product?.id, item?.product?.slug));
  }

  function currentProductId() {
    return String(firstText(product?.id, product?.slug));
  }

  function syncWishlistState() {
    const productId = currentProductId();
    setWishlistActive(Boolean(productId && readWishlist(store).some((item: any) => productIdentity(item) === productId)));
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

  function showNotice(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 1700);
  }

  function handleAdd() {
    if (!product || !available) return;

    addCartItem(store, product, qty);
    showNotice(label.addedToCart);
  }

  function handleBuyNow() {
    if (!product || !available) return;

    addCartItem(store, product, qty);
    showNotice(label.addedToCart);

    window.setTimeout(() => {
      window.location.href = productHasVariants(product) ? cartUrl(store) : checkoutUrl(store);
    }, 180);
  }

  async function handleShare() {
    if (!product) return;

    const url = typeof window !== "undefined" ? window.location.href : `${productsUrl(store)}/${firstText(product.slug, product.id)}`;
    const title = firstText(product.nameAr, product.nameEn, product.name, product.title, t(locale, "منتج", "Product"));

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
      // Native share was cancelled.
    }
  }

  function handleWishlist() {
    if (!product) return;

    const nextWishlist = toggleWishlist(props, product);
    const productId = currentProductId();
    const nextActive = Boolean(productId && nextWishlist.some((item: any) => productIdentity(item) === productId));

    setWishlistActive(nextActive);
    showNotice(nextActive ? t(locale, "تمت الإضافة إلى المفضلة", "Added to wishlist") : t(locale, "تم الحذف من المفضلة", "Removed from wishlist"));
  }

  if (!product) {
    return (
      <PageShell {...props} active="products">
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.emptyState}>
              <strong>{t(locale, "المنتج غير موجود", "Product not found")}</strong>
              <Link href={productsUrl(store)} className={styles.secondaryButton}>{label.viewProducts}</Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell {...props} active="products">
      {notice ? <div className={styles.toast}>{notice}</div> : null}

      <main className={styles.productDetailsPage}>
        <section className={styles.productDetailsHero}>
          <div className={`${styles.container} ${styles.luxuryDetailsGrid}`}>
            <div className={styles.luxuryGallery}>
              <div className={styles.galleryMain}>
                {currentImage ? <img src={currentImage} alt={firstText(product.nameAr, product.nameEn, product.name, product.title)} /> : <span>{t(locale, "لا توجد صورة", "No image")}</span>}

                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      className={`${styles.galleryArrowButton} ${styles.galleryArrowPrev}`}
                      aria-label={t(locale, "الصورة السابقة", "Previous image")}
                      onClick={() => moveGallery("prev")}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className={`${styles.galleryArrowButton} ${styles.galleryArrowNext}`}
                      aria-label={t(locale, "الصورة التالية", "Next image")}
                      onClick={() => moveGallery("next")}
                    >
                      ›
                    </button>
                    <span className={styles.galleryImageCounter}>
                      {formatCount(currentImageIndex + 1)} / {formatCount(images.length)}
                    </span>
                  </>
                ) : null}

                <button type="button" className={styles.galleryZoomButton} aria-label={t(locale, "تكبير الصورة", "Zoom image")}>
                  <Icon name="zoom" />
                </button>
              </div>

              {images.length > 1 ? (
                <div className={styles.galleryThumbs}>
                  {images.slice(0, 6).map((image, index) => (
                    <button
                      type="button"
                      className={`${styles.galleryThumb} ${image === currentImage ? styles.galleryThumbActive : ""}`}
                      key={`${image}-${index}`}
                      onClick={() => setActiveImage(image)}
                    >
                      <img src={image} alt="" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={styles.detailsPanel}>
              <div className={styles.detailsBreadcrumb}>
                <Link href={productsUrl(store)}>{label.products}</Link>
                <span>/</span>
                <em>{firstText(product.category, label.products)}</em>
              </div>

              <span className={styles.moodboardOverline}>{firstText(product.category, label.products)}</span>
              <h1 className={styles.detailTitle}>{firstText(product.nameAr, product.nameEn, product.name, product.title)}</h1>

              {settings.allowReviews !== false ? (
                <div className={styles.ratingRow}>
                  <span>★★★★★</span>
                  <small>{firstText(product.ratingAverage, "4.9")} / {formatCount(firstText(product.reviewCount, product.ratingCount, 0))}</small>
                </div>
              ) : null}

              <div className={styles.priceRow}>
                <strong>{money(getProductPrice(product), props, locale)}</strong>
                {oldPrice > 0 ? <del>{money(oldPrice, props, locale)}</del> : null}
              </div>

              <div className={styles.metaList}>
                {settings.displaySku && product.sku ? <span className={styles.metaPill} dir="ltr">SKU: {product.sku}</span> : null}
                {settings.displayBrand && firstText(product.brand, product.brandName) ? <span className={styles.metaPill}>{firstText(product.brand, product.brandName)}</span> : null}
                {settings.showStockStatus !== false ? <span className={styles.metaPill}>{available ? label.inStock : label.outOfStock}</span> : null}
                {discount > 0 && settings.showDiscountBadge !== false ? <span className={styles.metaPill}>{discount}% {label.sale}</span> : null}
              </div>

              <p className={styles.detailsDescription}>
                {firstText(
                  product.fullDescription,
                  product.description,
                  product.shortDescription,
                  t(locale, "لا يوجد وصف تفصيلي لهذا المنتج بعد.", "No detailed description for this product yet."),
                )}
              </p>

              <div className={styles.luxuryPurchaseBox}>
                <div className={styles.qtyControl}>
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                  <span>{formatCount(qty)}</span>
                  <button type="button" onClick={() => setQty(qty + 1)}>+</button>
                </div>

                {settings.enableAddToCart !== false ? (
                  <button type="button" className={styles.primaryButton} disabled={!available} onClick={handleAdd}>
                    <Icon name="bag" />
                    <span>{available ? label.addToCart : label.outOfStock}</span>
                  </button>
                ) : null}

                {settings.enableAddToCart !== false ? (
                  <button type="button" className={styles.secondaryButton} disabled={!available} onClick={handleBuyNow}>
                    <Icon name="bag" />
                    <span>{t(locale, "شراء الآن", "Buy now")}</span>
                  </button>
                ) : null}

                {settings.allowWishlist !== false ? (
                  <button
                    type="button"
                    className={`${styles.detailsWishlistButton} ${wishlistActive ? styles.detailsWishlistActive : ""}`}
                    onClick={handleWishlist}
                    aria-pressed={wishlistActive}
                  >
                    <Icon name="heart" filled={wishlistActive} />
                    <span>{label.wishlist}</span>
                  </button>
                ) : null}

                {settings.enableProductSharing !== false ? (
                  <button
                    type="button"
                    className={styles.detailsShareButton}
                    onClick={handleShare}
                  >
                    <Icon name="share" />
                    <span>{t(locale, "مشاركة", "Share")}</span>
                  </button>
                ) : null}
              </div>

              <div className={styles.detailsTrustGrid}>
                <span><Icon name="truck" /><strong>{t(locale, "شحن واضح", "Clear delivery")}</strong><small>{firstText(shippingPolicy?.content, shipping.shippingPolicy, shipping.estimatedDeliveryTime, t(locale, "تفاصيل الشحن تظهر حسب إعدادات المتجر.", "Delivery details follow store settings."))}</small></span>
                <span><Icon name="return" /><strong>{label.returnPolicy}</strong><small>{firstText(returnPolicy?.content, t(locale, "سياسة الإرجاع تظهر من إعدادات المتجر.", "Return policy follows store settings."))}</small></span>
                <span><Icon name="shield" /><strong>{t(locale, "شراء آمن", "Secure purchase")}</strong><small>{t(locale, "تجربة دفع وطلب منظمة وواضحة.", "A clear, structured order experience.")}</small></span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sectionSoft}>
          <div className={styles.container}>
            <div className={styles.productInfoLayout}>
              <div className={styles.tabCard}>
                <h3>{t(locale, "تفاصيل المنتج", "Product details")}</h3>
                <p>{firstText(product.fullDescription, product.description, product.shortDescription, t(locale, "أضف وصفًا تفصيليًا من لوحة التحكم ليظهر هنا بشكل أجمل.", "Add a detailed description in the dashboard to show it here."))}</p>
              </div>

              <div className={styles.tabCard}>
                <h3>{label.shippingPolicy}</h3>
                <p>{firstText(shippingPolicy?.content, shipping.shippingPolicy, shipping.estimatedDeliveryTime, t(locale, "تظهر سياسة الشحن من إعدادات المتجر.", "Shipping policy comes from store settings."))}</p>
              </div>

              {returnPolicy ? (
                <div className={styles.tabCard}>
                  <h3>{returnPolicy.title}</h3>
                  <p>{returnPolicy.content}</p>
                </div>
              ) : null}

              {policies.length ? (
                <div className={styles.tabCard}>
                  <h3>{label.terms}</h3>
                  <p>{policies.map((policy: any) => firstText(locale === "ar" ? policy.titleAr : policy.titleEn, policy.title, policy.type)).filter(Boolean).join(" • ")}</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {related.length ? (
          <section className={styles.moodboardSectionSoft}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.kicker}>{t(locale, "نفس الذوق", "Same mood")}</span>
                  <h2 className={styles.sectionTitle}>{t(locale, "منتجات مشابهة", "Related products")}</h2>
                </div>
              </div>

              <div className={`${styles.productGrid} ${styles.luxuryProductGrid}`}>
                {related.map((item: any) => <ProductCard key={item.id} product={item} {...props} />)}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </PageShell>
  );
}
