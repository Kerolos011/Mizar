"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  readCart,
  updateCartItemQuantity,
} from "@/storefront/cart/storefront-cart";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import {
  calculateTotals,
  checkoutUrl,
  getLocale,
  labels,
  money,
  productUrl,
  productsUrl,
  t,
} from "../components/helpers";

export function Cart(props: any) {
  const store = props.store || {};
  const products = Array.isArray(props.products) ? props.products : [];
  const locale = getLocale(props);
  const label = labels(locale);

  const [rows, setRows] = useState<any[]>([]);

  function loadCartRows() {
    setRows(readCart(store, products));
  }

  useEffect(() => {
    loadCartRows();

    const onCart = () => loadCartRows();

    window.addEventListener("mizar-cart-updated", onCart as any);
    window.addEventListener("storage", onCart);

    return () => {
      window.removeEventListener("mizar-cart-updated", onCart as any);
      window.removeEventListener("storage", onCart);
    };
  }, [store.id, store.slug, products.length]);

  const totals = useMemo(() => calculateTotals(props, rows), [props, rows]);

  const hasItems = rows.length > 0;

  return (
    <PageShell {...props} active="cart">
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.checkoutGrid}`}>
          <div className={styles.card}>
            <span className={styles.kicker}>{label.cart}</span>
            <h1 className={styles.sectionTitle}>{label.cart}</h1>

            {hasItems ? (
              rows.map((item) => (
                <div
                  className={styles.cartItem}
                  key={`${item.productId}-${item.variantId || ""}`}
                >
                  <Link
                    href={item.product ? productUrl(store, item.product) : productsUrl(store)}
                    className={styles.cartImage}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.product?.name || item.name} />
                    ) : (
                      "—"
                    )}
                  </Link>

                  <div className={styles.cartInfo}>
                    <strong>{item.product?.name || item.name || item.productId}</strong>
                    <span>
                      {money(item.price, props, locale)} × {item.quantity}
                    </span>
                    {item.variant?.title ? <small>{item.variant.title}</small> : null}
                    {item.sku ? <small dir="ltr">SKU: {item.sku}</small> : null}
                  </div>

                  <div className={styles.qtyControl}>
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(
                          store,
                          item.productId,
                          item.quantity - 1,
                          item.variantId,
                        )
                      }
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(
                          store,
                          item.productId,
                          item.quantity + 1,
                          item.variantId,
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <strong>{t(locale, "السلة فارغة", "Cart is empty")}</strong>
                <span>
                  {t(
                    locale,
                    "ابدأ بإضافة منتجات من المتجر قبل إتمام الطلب.",
                    "Add products before checking out.",
                  )}
                </span>
                <Link href={productsUrl(store)} className={styles.secondaryButton}>
                  {label.continueShopping}
                </Link>
              </div>
            )}
          </div>

          <aside className={styles.card}>
            <h2 className={styles.sectionTitle}>{label.orderSummary}</h2>

            <div className={styles.summaryRow}>
              <span>{label.subtotal}</span>
              <strong>{money(totals.subtotal, props, locale)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>{label.shipping}</span>
              <strong>{money(totals.shippingCost, props, locale)}</strong>
            </div>

            {totals.taxPercent ? (
              <div className={styles.summaryRow}>
                <span>{label.tax}</span>
                <strong>{money(totals.taxAmount, props, locale)}</strong>
              </div>
            ) : null}

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>{label.total}</span>
              <strong>{money(totals.total, props, locale)}</strong>
            </div>

            {hasItems ? (
              <Link
                href={checkoutUrl(store)}
                className={styles.primaryButton}
                style={{ width: "100%", marginTop: 16 }}
              >
                {label.checkout}
              </Link>
            ) : (
              <button
                className={styles.primaryButton}
                type="button"
                disabled
                style={{ width: "100%", marginTop: 16 }}
              >
                {t(locale, "أضف منتجات أولًا", "Add products first")}
              </button>
            )}

            <Link
              href={productsUrl(store)}
              className={styles.secondaryButton}
              style={{ width: "100%", marginTop: 10 }}
            >
              {label.continueShopping}
            </Link>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}