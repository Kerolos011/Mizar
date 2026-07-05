"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  clearCart,
  readCart,
} from "@/storefront/cart/storefront-cart";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import {
  calculateTotals,
  createStorefrontOrder,
  fetchCustomerSession,
  getAddressSettings,
  getLocale,
  getPaymentMethods,
  getPolicies,
  getShippingSettings,
  labels,
  money,
  orderSuccessUrl,
  productsUrl,
  readCustomer,
  saveCustomer,
  saveLastOrder,
  t,
} from "../components/helpers";

export function Checkout(props: any) {
  const store = props.store || {};
  const products = Array.isArray(props.products) ? props.products : [];
  const locale = getLocale(props);
  const label = labels(locale);

  const [rows, setRows] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const payments = getPaymentMethods(props, locale);
  const shipping = getShippingSettings(props);
  const address = getAddressSettings(props);
  const policies = getPolicies(props);

  const totals = useMemo(() => calculateTotals(props, rows), [props, rows]);
  const hasItems = rows.length > 0;

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

  useEffect(() => {
    setCustomer(readCustomer(store));

    fetchCustomerSession(store)
      .then((data) => setCustomer(data?.customer || readCustomer(store)))
      .catch(() => setCustomer(readCustomer(store)));
  }, [store.id, store.slug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasItems) {
      setError(
        t(
          locale,
          "السلة فارغة. أضف منتجات أولًا قبل تأكيد الطلب.",
          "Cart is empty. Add products before placing an order.",
        ),
      );
      return;
    }

    const form = new FormData(event.currentTarget);

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const customerPayload = {
        name: String(form.get("name") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        email: String(form.get("email") || "").trim(),
        city: String(form.get("city") || "").trim(),
        address: String(form.get("address") || "").trim(),
      };

      if (!customerPayload.name || !customerPayload.phone || !customerPayload.address) {
        throw new Error(
          t(
            locale,
            "الاسم ورقم الموبايل والعنوان مطلوبون لإتمام الطلب.",
            "Name, phone and address are required.",
          ),
        );
      }

      const data = await createStorefrontOrder(store, {
        customer: customerPayload,
        paymentMethod: String(form.get("payment") || "CASH_ON_DELIVERY"),
        shippingMethod: String(form.get("shipping") || "STANDARD"),
        items: rows.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        })),
      });

      const order = data.order || {
        id: `MZ-${Date.now()}`,
        totals,
        customer: customerPayload,
      };

      saveLastOrder(store, {
        ...order,
        totals: data.totals || totals,
        customer: order.customer || customerPayload,
      });

      saveCustomer(store, customerPayload);

      clearCart(store);
      setRows([]);

      setMessage(t(locale, "تم إنشاء الطلب بنجاح.", "Order created successfully."));

      window.setTimeout(() => {
        window.location.href = orderSuccessUrl(store, order.id);
      }, 500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t(locale, "فشل إنشاء الطلب", "Order creation failed"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell {...props} active="checkout">
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.checkoutGrid}`}>
          {hasItems ? (
            <form className={styles.card} onSubmit={submit}>
              <span className={styles.kicker}>{label.checkout}</span>
              <h1 className={styles.sectionTitle}>{label.customerInfo}</h1>

              {customer ? (
                <div className={styles.successBox}>
                  {t(
                    locale,
                    "تم التعرف على حسابك وسيتم ربط الطلب به.",
                    "Your account was detected and the order will be linked to it.",
                  )}
                </div>
              ) : null}

              {message ? <div className={styles.successBox}>{message}</div> : null}
              {error ? <div className={styles.errorBox}>{error}</div> : null}

              <div className={styles.formGrid}>
                <input
                  name="name"
                  className={styles.input}
                  placeholder={t(locale, "الاسم بالكامل", "Full name")}
                  defaultValue={customer?.name || ""}
                  required
                />

                <input
                  name="phone"
                  className={styles.input}
                  placeholder={t(locale, "رقم الموبايل", "Mobile number")}
                  defaultValue={customer?.phone || ""}
                  required
                />

                <input
                  name="email"
                  className={styles.input}
                  placeholder={t(locale, "البريد الإلكتروني", "Email")}
                  defaultValue={customer?.email || customer?.user?.email || ""}
                />

                <input
                  name="city"
                  className={styles.input}
                  placeholder={t(locale, "المدينة", "City")}
                  defaultValue={customer?.city || address.city || ""}
                />

                <textarea
                  name="address"
                  className={`${styles.textarea} ${styles.full}`}
                  placeholder={t(locale, "العنوان التفصيلي", "Full address")}
                  defaultValue={customer?.address || address.address || ""}
                  required
                />

                <select name="payment" className={styles.select}>
                  {(payments.length
                    ? payments
                    : [
                        {
                          type: "CASH_ON_DELIVERY",
                          label: t(locale, "الدفع عند الاستلام", "Cash on delivery"),
                        },
                      ]
                  ).map((payment) => (
                    <option key={payment.type} value={payment.type}>
                      {payment.label}
                    </option>
                  ))}
                </select>

                <select name="shipping" className={styles.select}>
                  <option value="STANDARD">
                    {shipping.pickupAvailable
                      ? t(locale, "شحن أو استلام من الفرع", "Delivery or pickup")
                      : t(locale, "شحن عادي", "Standard shipping")}
                  </option>
                </select>

                <label className={styles.checkLine}>
                  <input type="checkbox" required />{" "}
                  {t(
                    locale,
                    "أوافق على سياسات وشروط المتجر",
                    "I agree to store terms and policies",
                  )}
                </label>

                <button
                  className={`${styles.primaryButton} ${styles.full}`}
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? t(locale, "جاري إنشاء الطلب...", "Creating order...")
                    : label.placeOrder}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.card}>
              <span className={styles.kicker}>{label.checkout}</span>
              <h1 className={styles.sectionTitle}>
                {t(locale, "لا يمكن إتمام الطلب", "Cannot checkout")}
              </h1>

              <div className={styles.emptyState}>
                <strong>{t(locale, "السلة فارغة", "Cart is empty")}</strong>
                <span>
                  {t(
                    locale,
                    "أضف منتجًا واحدًا على الأقل قبل الدخول إلى إتمام الطلب.",
                    "Add at least one product before checkout.",
                  )}
                </span>
                <Link href={productsUrl(store)} className={styles.primaryButton}>
                  {label.shopNow}
                </Link>
              </div>
            </div>
          )}

          <aside className={styles.card}>
            <h2 className={styles.sectionTitle}>{label.orderSummary}</h2>

            {hasItems
              ? rows.map((item) => (
                  <div
                    className={styles.summaryRow}
                    key={`${item.productId}-${item.variantId || ""}`}
                  >
                    <span>
                      {item.product?.name || item.name} × {item.quantity}
                    </span>
                    <strong>{money(item.lineTotal, props, locale)}</strong>
                  </div>
                ))
              : null}

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

            {policies.length ? (
              <div className={styles.tabs}>
                {policies.slice(0, 2).map((policy: any) => (
                  <div className={styles.tabCard} key={policy.type}>
                    <h3>{policy.titleAr || policy.titleEn || policy.type}</h3>
                    <p>{policy.contentAr || policy.contentEn || ""}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </PageShell>
  );
}