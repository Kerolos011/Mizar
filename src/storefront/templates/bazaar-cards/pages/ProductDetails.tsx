"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { addCartItem } from "@/storefront/cart/storefront-cart";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import {
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
  t,
  toggleWishlist,
} from "../components/helpers";

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

  const images = useMemo(() => {
    const media = Array.isArray(product?.media)
      ? product.media
          .map((item: any) => firstText(item.url, item.imageUrl, item.fileUrl))
          .filter(Boolean)
      : [];

    const main = productImage(product);

    return Array.from(new Set([main, ...media].filter(Boolean)));
  }, [product]);

  const [activeImage, setActiveImage] = useState("");
  const currentImage = activeImage || images[0] || "";

  const related = products
    .filter((item: any) => item.id !== product?.id && item.category === product?.category)
    .slice(0, 4);

  const available = product ? isAvailable(product) : false;
  const oldPrice = product ? getComparePrice(product) : 0;
  const discount = product ? discountPercent(product) : 0;

  const returnPolicy = getPolicy(props, "RETURN_POLICY", locale);
  const shippingPolicy = getPolicy(props, "SHIPPING_POLICY", locale);
  const policies = getPolicies(props);

  function showNotice(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 1700);
  }

  function handleAdd() {
    if (!product || !available) return;

    addCartItem(store, product, qty);
    showNotice(label.addedToCart);
  }

  if (!product) {
    return (
      <PageShell {...props} active="products">
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.emptyState}>
              <strong>{t(locale, "المنتج غير موجود", "Product not found")}</strong>
              <Link href={productsUrl(store)} className={styles.secondaryButton}>
                {label.viewProducts}
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell {...props} active="products">
      {notice ? <div className={styles.toast}>{notice}</div> : null}

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.detailsGrid}`}>
          <div className={styles.gallery}>
            <div className={styles.galleryMain}>
              {currentImage ? (
                <img src={currentImage} alt={firstText(product.name, product.title)} />
              ) : (
                <span>{t(locale, "لا توجد صورة", "No image")}</span>
              )}
            </div>

            {images.length > 1 ? (
              <div className={styles.galleryThumbs}>
                {images.slice(0, 5).map((image) => (
                  <button
                    type="button"
                    className={styles.galleryThumb}
                    key={image}
                    onClick={() => setActiveImage(image)}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.detailsPanel}>
            <span className={styles.kicker}>{firstText(product.category, label.products)}</span>
            <h1 className={styles.detailTitle}>{firstText(product.name, product.title)}</h1>

            <div className={styles.metaList}>
              {settings.displaySku && product.sku ? (
                <span className={styles.metaPill} dir="ltr">
                  SKU: {product.sku}
                </span>
              ) : null}

              {settings.displayBrand && firstText(product.brand, product.brandName) ? (
                <span className={styles.metaPill}>
                  {firstText(product.brand, product.brandName)}
                </span>
              ) : null}

              {settings.showStockStatus !== false ? (
                <span className={styles.metaPill}>
                  {available ? label.inStock : label.outOfStock}
                </span>
              ) : null}

              {settings.displayStockQuantity ? (
                <span className={styles.metaPill}>
                  {t(locale, "المخزون", "Stock")}:{" "}
                  {firstText(product.availableStock, product.stock, 0)}
                </span>
              ) : null}

              {discount > 0 && settings.showDiscountBadge !== false ? (
                <span className={styles.metaPill}>
                  {discount}% {label.sale}
                </span>
              ) : null}
            </div>

            {settings.allowReviews !== false ? (
              <div className={styles.ratingRow}>
                <span>★★★★★</span>
                <small>
                  {firstText(product.ratingAverage, "0")} /{" "}
                  {firstText(product.reviewCount, product.ratingCount, "0")}
                </small>
              </div>
            ) : null}

            <div className={styles.priceRow}>
              <strong>{money(getProductPrice(product), props, locale)}</strong>
              {oldPrice > 0 ? <del>{money(oldPrice, props, locale)}</del> : null}
            </div>

            <p className={styles.sectionText}>
              {firstText(
                product.fullDescription,
                product.description,
                product.shortDescription,
                t(
                  locale,
                  "لا يوجد وصف تفصيلي لهذا المنتج بعد.",
                  "No detailed description for this product yet.",
                ),
              )}
            </p>

            <div className={styles.heroActions}>
              <div className={styles.qtyControl}>
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>
                  -
                </button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty(qty + 1)}>
                  +
                </button>
              </div>

              {settings.enableAddToCart !== false ? (
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={!available}
                  onClick={handleAdd}
                >
                  {available ? label.addToCart : label.outOfStock}
                </button>
              ) : null}

              {settings.allowWishlist !== false ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    toggleWishlist(props, product);
                    showNotice(t(locale, "تم تحديث المفضلة", "Wishlist updated"));
                  }}
                >
                  {label.wishlist}
                </button>
              ) : null}
            </div>

            <div className={styles.tabs}>
              <div className={styles.tabCard}>
                <h3>{label.shippingPolicy}</h3>
                <p>
                  {firstText(
                    shippingPolicy?.content,
                    shipping.shippingPolicy,
                    shipping.estimatedDeliveryTime,
                    t(
                      locale,
                      "تظهر سياسة الشحن من إعدادات المتجر.",
                      "Shipping policy comes from store settings.",
                    ),
                  )}
                </p>
              </div>

              {returnPolicy ? (
                <div className={styles.tabCard}>
                  <h3>{returnPolicy.title}</h3>
                  <p>{returnPolicy.content}</p>
                </div>
              ) : null}

              {settings.allowQuestions ? (
                <div className={styles.tabCard}>
                  <h3>{t(locale, "الأسئلة والأجوبة", "Q&A")}</h3>
                  <p>
                    {t(
                      locale,
                      "يمكن ربط هذا القسم لاحقًا بأسئلة العملاء.",
                      "This section can later be connected to customer questions.",
                    )}
                  </p>
                </div>
              ) : null}

              {policies.length ? (
                <div className={styles.tabCard}>
                  <h3>{label.terms}</h3>
                  <p>
                    {policies
                      .map((policy: any) =>
                        firstText(
                          locale === "ar" ? policy.titleAr : policy.titleEn,
                          policy.title,
                          policy.type,
                        ),
                      )
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className={styles.sectionSoft}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {t(locale, "منتجات مشابهة", "Related products")}
              </h2>
            </div>

            <div className={styles.productGrid}>
              {related.map((item: any) => (
                <ProductCard key={item.id} product={item} {...props} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}