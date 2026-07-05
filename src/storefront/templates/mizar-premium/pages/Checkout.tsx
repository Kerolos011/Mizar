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
  cartUrl,
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

function toNumber(value: any, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getLineTotal(item: any) {
  return toNumber(item.lineTotal ?? toNumber(item.price, 0) * toNumber(item.quantity, 1), 0);
}

function firstNumber(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;

    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }

  return null;
}

function getAvailableStock(item: any) {
  const stock = firstNumber(
    item?.stock,
    item?.availableQuantity,
    item?.inventoryQuantity,
    item?.variant?.availableQuantity,
    item?.variant?.quantity,
    item?.variant?.stock,
    item?.product?.availableQuantity,
    item?.product?.availableStock,
    item?.product?.inventoryQuantity,
    item?.product?.quantity,
    item?.product?.stock,
  );

  if (stock === null) return null;
  return Math.max(0, Math.floor(stock));
}

function isExplicitlyUnavailable(item: any) {
  const status = String(item?.variant?.status || item?.product?.status || item?.status || "").toUpperCase();

  return [
    "OUT_OF_STOCK",
    "SOLD_OUT",
    "INACTIVE",
    "DRAFT",
    "ARCHIVED",
    "DISABLED",
    "UNAVAILABLE",
  ].includes(status);
}

function hasProductVariants(item: any) {
  const variants = Array.isArray(item?.product?.productVariants) && item.product.productVariants.length
    ? item.product.productVariants
    : Array.isArray(item?.product?.variants)
      ? item.product.variants
      : [];

  return variants.length > 0;
}

function getCartIssue(item: any, locale: "ar" | "en") {
  if (hasProductVariants(item) && !item.variantId) {
    return t(locale, "يوجد منتج يحتاج تحديد المقاس / اللون من السلة قبل إتمام الطلب.", "An item needs size / color selection in the cart before checkout.");
  }

  if (hasProductVariants(item) && item.variantId && !item.variant) {
    return t(locale, "يوجد اختيار لم يعد متاحًا. ارجع للسلة واختر مقاسًا أو لونًا آخر.", "An option is no longer available. Return to cart and choose another option.");
  }

  const stock = getAvailableStock(item);

  if (isExplicitlyUnavailable(item) || stock === 0) {
    return t(locale, "يوجد منتج غير متاح داخل السلة. ارجع للسلة وعدل الاختيارات قبل تأكيد الطلب.", "An item in the cart is unavailable. Return to cart and adjust options before placing the order.");
  }

  if (stock !== null && toNumber(item.quantity, 1) > stock) {
    return t(locale, `الكمية المطلوبة أكبر من المتاح. المتاح الآن ${stock} فقط.`, `Requested quantity exceeds available stock. Only ${stock} available.`);
  }

  return "";
}

function getSelectedOptions(item: any) {
  const source = item?.selectedOptions || item?.variant?.options;

  if (!source || typeof source !== "object" || Array.isArray(source)) return [];

  return Object.entries(source)
    .map(([key, value]) => ({ key: String(key || "").trim(), value: String(value || "").trim() }))
    .filter((option) => option.key && option.value);
}

function getPaymentDescription(type: string, locale: "ar" | "en") {
  const key = String(type || "").toUpperCase();

  if (key === "CASH_ON_DELIVERY") {
    return t(locale, "ادفع عند استلام الطلب من مندوب الشحن.", "Pay when the order is delivered.");
  }

  if (key === "BANK_TRANSFER") {
    return t(locale, "سيتم التواصل معك لتأكيد بيانات التحويل.", "The store will contact you with transfer details.");
  }

  return t(locale, "سيتم تأكيد طريقة الدفع بعد مراجعة الطلب.", "Payment will be confirmed after order review.");
}

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
  const paymentOptions = payments.length
    ? payments
    : [
        {
          type: "CASH_ON_DELIVERY",
          label: t(locale, "الدفع عند الاستلام", "Cash on delivery"),
        },
      ];
  const shipping = getShippingSettings(props);
  const address = getAddressSettings(props);
  const policies = getPolicies(props);

  const totals = useMemo(() => calculateTotals(props, rows), [props, rows]);
  const hasItems = rows.length > 0;
  const itemCount = rows.reduce((sum, item) => sum + toNumber(item.quantity, 1), 0);
  const blockingIssue = rows.map((item) => getCartIssue(item, locale)).find(Boolean) || "";

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

    if (blockingIssue) {
      setError(blockingIssue);
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
      <section className={styles.sectionSoft}>
        <div className={styles.container}>
          <div className={styles.cartHeroPanel}>
            <div className={styles.cartHeroCopy}>
              <span className={styles.kicker}>{label.checkout}</span>
              <h1 className={styles.sectionTitle}>
                {t(locale, "إتمام شراء واضح وسريع", "Clear and fast checkout")}
              </h1>
              <p>
                {t(
                  locale,
                  "أدخل بيانات التواصل والتوصيل، ثم راجع ملخص الطلب قبل التأكيد النهائي.",
                  "Enter contact and delivery details, then review the order summary before confirmation.",
                )}
              </p>
            </div>

            <div className={styles.checkoutSteps}>
              <div className={styles.checkoutStep}>
                <strong>1</strong>
                <span>{label.cart}</span>
              </div>
              <div className={`${styles.checkoutStep} ${styles.activeStep}`}>
                <strong>2</strong>
                <span>{label.customerInfo}</span>
              </div>
              <div className={styles.checkoutStep}>
                <strong>3</strong>
                <span>{t(locale, "تأكيد الطلب", "Order confirmation")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.checkoutGrid}`}>
          {hasItems ? (
            <form className={styles.card} onSubmit={submit}>
              <div className={styles.cartSectionHeader}>
                <div>
                  <span className={styles.kicker}>{label.checkout}</span>
                  <h2 className={styles.sectionTitle}>{label.customerInfo}</h2>
                </div>

                <Link href={cartUrl(store)} className={styles.secondaryButton}>
                  {t(locale, "تعديل السلة", "Edit cart")}
                </Link>
              </div>

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
              {blockingIssue ? <div className={styles.errorBox}>{blockingIssue}</div> : null}
              {error ? <div className={styles.errorBox}>{error}</div> : null}

              <div className={styles.checkoutFormSection}>
                <div className={styles.checkoutSectionTitle}>
                  <strong>{t(locale, "بيانات التواصل", "Contact details")}</strong>
                  <span>
                    {t(
                      locale,
                      "سنستخدم هذه البيانات لتأكيد الطلب والتواصل بخصوص التوصيل.",
                      "These details are used to confirm the order and coordinate delivery.",
                    )}
                  </span>
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.fieldLabel}>
                    <span>{t(locale, "الاسم بالكامل", "Full name")}</span>
                    <input
                      name="name"
                      className={styles.input}
                      placeholder={t(locale, "مثال: كيرلس ثابت", "Example: John Smith")}
                      defaultValue={customer?.name || ""}
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label className={styles.fieldLabel}>
                    <span>{t(locale, "رقم الموبايل", "Mobile number")}</span>
                    <input
                      name="phone"
                      type="tel"
                      className={styles.input}
                      placeholder={t(locale, "رقم يمكن التواصل عليه", "Reachable phone number")}
                      defaultValue={customer?.phone || ""}
                      autoComplete="tel"
                      required
                    />
                  </label>

                  <label className={styles.fieldLabel}>
                    <span>{t(locale, "البريد الإلكتروني", "Email")}</span>
                    <input
                      name="email"
                      type="email"
                      className={styles.input}
                      placeholder={t(locale, "اختياري", "Optional")}
                      defaultValue={customer?.email || customer?.user?.email || ""}
                      autoComplete="email"
                    />
                  </label>

                  <label className={styles.fieldLabel}>
                    <span>{t(locale, "المدينة", "City")}</span>
                    <input
                      name="city"
                      className={styles.input}
                      placeholder={t(locale, "المدينة / المنطقة", "City / area")}
                      defaultValue={customer?.city || address.city || ""}
                      autoComplete="address-level2"
                    />
                  </label>

                  <label className={`${styles.fieldLabel} ${styles.full}`}>
                    <span>{t(locale, "العنوان التفصيلي", "Full address")}</span>
                    <textarea
                      name="address"
                      className={styles.textarea}
                      placeholder={t(
                        locale,
                        "اكتب الحي، الشارع، رقم المبنى، وأي علامة مميزة لتسهيل التوصيل.",
                        "Add district, street, building number and any landmark to make delivery easier.",
                      )}
                      defaultValue={customer?.address || address.address || ""}
                      autoComplete="street-address"
                      required
                    />
                  </label>
                </div>
              </div>

              <div className={styles.checkoutFormSection}>
                <div className={styles.checkoutSectionTitle}>
                  <strong>{t(locale, "التوصيل والدفع", "Delivery and payment")}</strong>
                  <span>
                    {shipping.estimatedDeliveryTime ||
                      t(locale, "سيتم تأكيد وقت التوصيل بعد مراجعة الطلب.", "Delivery time is confirmed after order review.")}
                  </span>
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.fieldLabel}>
                    <span>{label.shipping}</span>
                    <select name="shipping" className={styles.select}>
                      <option value="STANDARD">
                        {shipping.pickupAvailable
                          ? t(locale, "شحن أو استلام من الفرع", "Delivery or pickup")
                          : t(locale, "شحن عادي", "Standard shipping")}
                      </option>
                    </select>
                  </label>

                  <label className={styles.fieldLabel}>
                    <span>{t(locale, "طريقة الدفع", "Payment method")}</span>
                    <select name="payment" className={styles.select}>
                      {paymentOptions.map((payment) => (
                        <option key={payment.type} value={payment.type}>
                          {payment.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.paymentMethodGrid}>
                  {paymentOptions.slice(0, 3).map((payment) => (
                    <div className={styles.paymentMethodCard} key={payment.type}>
                      <strong>{payment.label}</strong>
                      <span>{getPaymentDescription(payment.type, locale)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <label className={styles.checkLine}>
                <input type="checkbox" required />{" "}
                {policies.length
                  ? t(
                      locale,
                      "أوافق على سياسات وشروط المتجر وأؤكد صحة بيانات الطلب.",
                      "I agree to the store policies and confirm the order details are correct.",
                    )
                  : t(
                      locale,
                      "أؤكد صحة بيانات الطلب وأوافق على التواصل معي لتأكيده.",
                      "I confirm the order details and agree to be contacted for confirmation.",
                    )}
              </label>

              <button
                className={`${styles.primaryButton} ${styles.full}`}
                type="submit"
                disabled={submitting || Boolean(blockingIssue)}
              >
                {submitting
                  ? t(locale, "جاري إنشاء الطلب...", "Creating order...")
                  : label.placeOrder}
              </button>
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

          <aside className={`${styles.card} ${styles.stickySummary}`}>
            <span className={styles.kicker}>{label.orderSummary}</span>
            <h2 className={styles.sectionTitle}>{label.orderSummary}</h2>

            <div className={styles.cartMiniStats}>
              <div>
                <span>{t(locale, "المنتجات", "Items")}</span>
                <strong>{itemCount}</strong>
              </div>
              <div>
                <span>{t(locale, "التوصيل", "Delivery")}</span>
                <strong>{totals.shippingCost > 0 ? money(totals.shippingCost, props, locale) : t(locale, "مجاني", "Free")}</strong>
              </div>
            </div>

            {hasItems ? (
              <div className={styles.orderLinesList}>
                {rows.map((item) => (
                  <div
                    className={styles.orderLineItem}
                    key={`${item.productId}-${item.variantId || "default"}`}
                  >
                    <div className={styles.orderLineImage}>
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.product?.name || item.name} /> : "—"}
                    </div>
                    <div>
                      <strong>{item.product?.name || item.name}</strong>
                      <span>
                        {money(item.price, props, locale)} × {item.quantity}
                      </span>
                      {item.variantTitle || item.variant?.title ? <small>{item.variantTitle || item.variant.title}</small> : null}
                      {hasProductVariants(item) && !item.variantId ? (
                        <small>{t(locale, "لم يتم تحديد المقاس / اللون بعد", "Size / color not selected yet")}</small>
                      ) : null}
                      {getSelectedOptions(item).length ? (
                        <small>{getSelectedOptions(item).map((option) => `${option.key}: ${option.value}`).join(" / ")}</small>
                      ) : null}
                    </div>
                    <b>{money(getLineTotal(item), props, locale)}</b>
                  </div>
                ))}
              </div>
            ) : null}

            <div className={styles.summaryRow}>
              <span>{label.subtotal}</span>
              <strong>{money(totals.subtotal, props, locale)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>{label.shipping}</span>
              <strong>
                {totals.shippingCost > 0
                  ? money(totals.shippingCost, props, locale)
                  : t(locale, "مجاني", "Free")}
              </strong>
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

            <div className={styles.checkoutInfoList}>
              <div>
                <strong>{t(locale, "بعد التأكيد", "After confirmation")}</strong>
                <span>
                  {t(
                    locale,
                    "سيتم حفظ الطلب وإرساله لإدارة المتجر للمتابعة.",
                    "The order will be saved and sent to store management for follow-up.",
                  )}
                </span>
              </div>
              <div>
                <strong>{t(locale, "مراجعة البيانات", "Details review")}</strong>
                <span>
                  {t(
                    locale,
                    "يمكنك الرجوع للسلة وتعديل المنتجات قبل إنشاء الطلب.",
                    "You can go back to the cart and edit items before placing the order.",
                  )}
                </span>
              </div>
            </div>

            {policies.length ? (
              <div className={styles.tabs}>
                {policies.slice(0, 2).map((policy: any) => (
                  <div className={styles.tabCard} key={policy.type || policy.titleAr || policy.titleEn}>
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
