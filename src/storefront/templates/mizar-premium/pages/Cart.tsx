"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearCart,
  getAvailableStock as getVariantAvailableStock,
  getProductVariants,
  readCart,
  removeCartItem,
  updateCartItemQuantity,
  updateCartItemVariant,
} from "@/storefront/cart/storefront-cart";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import {
  calculateTotals,
  checkoutUrl,
  getLocale,
  getPaymentMethods,
  getPolicies,
  getShippingSettings,
  labels,
  money,
  productUrl,
  productsUrl,
  t,
} from "../components/helpers";

function toNumber(value: any, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstNumber(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;

    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }

  return null;
}

function firstText(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }

  return "";
}

function getItemKey(item: any) {
  return `${item.productId}::${item.variantId || "default"}`;
}

function normalizeOptionValue(value: any) {
  if (value && typeof value === "object") {
    return firstText(value.value, value.name, value.label, value.title, value.nameAr, value.nameEn, value.id);
  }

  return String(value || "").trim();
}

function getVariantOption(variant: any, name: string) {
  const options = variant?.options && typeof variant.options === "object" && !Array.isArray(variant.options)
    ? variant.options
    : {};

  return String(options[name] || "").trim();
}

function getSelectedOptions(item: any) {
  const source = item?.selectedOptions || item?.variant?.options;

  if (!source || typeof source !== "object" || Array.isArray(source)) return [];

  return Object.entries(source)
    .map(([key, value]) => ({ key: String(key || "").trim(), value: String(value || "").trim() }))
    .filter((option) => option.key && option.value);
}

function selectedOptionsRecord(item: any) {
  const source = item?.selectedOptions || item?.variant?.options;

  if (!source || typeof source !== "object" || Array.isArray(source)) return {} as Record<string, string>;

  return Object.fromEntries(
    Object.entries(source)
      .map(([key, value]) => [String(key || "").trim(), String(value || "").trim()] as const)
      .filter(([key, value]) => key && value),
  );
}

function getLineTotal(item: any) {
  return toNumber(item.lineTotal ?? toNumber(item.price, 0) * toNumber(item.quantity, 1), 0);
}

function hasProductVariants(item: any) {
  return getProductVariants(item?.product).length > 0;
}

function getItemAvailableStock(item: any) {
  if (hasProductVariants(item) && !item.variantId) return null;

  const stock = firstNumber(
    item?.stock,
    item?.availableQuantity,
    item?.availableStock,
    item?.inventoryQuantity,
    item?.variant?.availableStock,
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

function isVariantActive(variant: any) {
  const status = String(variant?.status || "ACTIVE").toUpperCase();

  return ![
    "OUT_OF_STOCK",
    "SOLD_OUT",
    "INACTIVE",
    "DRAFT",
    "ARCHIVED",
    "DISABLED",
    "UNAVAILABLE",
    "HIDDEN",
  ].includes(status);
}

function isExplicitlyUnavailable(item: any) {
  const status = String(
    item?.variant?.status || item?.product?.status || item?.status || "",
  ).toUpperCase();

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

function optionLabel(name: string, locale: "ar" | "en") {
  const lower = String(name || "").toLowerCase();

  if (["size", "sizes", "المقاس", "مقاس"].includes(lower)) return t(locale, "المقاس", "Size");
  if (["color", "colour", "colors", "اللون", "لون"].includes(lower)) return t(locale, "اللون", "Color");

  return name;
}

function getVariantTitle(variant: any) {
  return firstText(
    variant?.title,
    variant?.name,
    variant?.options && typeof variant.options === "object"
      ? Object.values(variant.options).filter(Boolean).join(" / ")
      : "",
  );
}

function getProductVariantOptions(product: any) {
  const variants = getProductVariants(product);
  const optionRows = Array.isArray(product?.productOptions) ? product.productOptions : [];
  const names = new Set<string>();

  optionRows.forEach((option: any) => {
    const name = String(option?.name || option?.key || "").trim();
    if (name) names.add(name);
  });

  variants.forEach((variant: any) => {
    const options = variant?.options && typeof variant.options === "object" && !Array.isArray(variant.options)
      ? variant.options
      : {};

    Object.keys(options).forEach((name) => {
      if (String(name || "").trim()) names.add(String(name).trim());
    });
  });

  return Array.from(names).map((name) => {
    const fromProductOption = optionRows.find((option: any) => String(option?.name || option?.key || "").trim() === name);
    const values = new Set<string>();

    if (Array.isArray(fromProductOption?.values)) {
      fromProductOption.values.forEach((value: any) => {
        const text = normalizeOptionValue(value);
        if (text) values.add(text);
      });
    }

    variants.forEach((variant: any) => {
      const value = getVariantOption(variant, name);
      if (value) values.add(value);
    });

    return {
      name,
      label: firstText(fromProductOption?.nameAr, fromProductOption?.labelAr, localeSafeLabel(fromProductOption, name)),
      values: Array.from(values),
    };
  }).filter((option) => option.name && option.values.length);
}

function localeSafeLabel(option: any, fallback: string) {
  return firstText(option?.label, option?.title, option?.nameEn, fallback);
}

function variantMatchesSelected(variant: any, selected: Record<string, string>, optionNames: string[]) {
  return optionNames.every((name) => {
    const selectedValue = String(selected[name] || "").trim();
    if (!selectedValue) return true;

    return getVariantOption(variant, name) === selectedValue;
  });
}

function variantExactMatches(variant: any, selected: Record<string, string>, optionNames: string[]) {
  return optionNames.every((name) => getVariantOption(variant, name) === String(selected[name] || "").trim());
}

function variantHasStock(product: any, variant: any) {
  const stock = getVariantAvailableStock(product, variant);
  return stock === null || stock > 0;
}

function isOptionValueAvailable(product: any, name: string, value: string, selected: Record<string, string>, optionNames: string[]) {
  const nextSelected = {
    ...selected,
    [name]: value,
  };

  return getProductVariants(product).some((variant: any) => {
    if (!isVariantActive(variant) || !variantHasStock(product, variant)) return false;

    return variantMatchesSelected(variant, nextSelected, optionNames);
  });
}

function getVariantFromOptions(product: any, selected: Record<string, string>, optionNames: string[]) {
  if (!optionNames.length) return null;

  const complete = optionNames.every((name) => String(selected[name] || "").trim());
  if (!complete) return null;

  return getProductVariants(product).find((variant: any) => variantExactMatches(variant, selected, optionNames)) || null;
}

function getCartIssue(item: any, locale: "ar" | "en") {
  const requiresVariant = hasProductVariants(item);

  if (requiresVariant && !item.variantId) {
    return t(
      locale,
      "يجب تحديد المقاس / اللون لهذا المنتج قبل إتمام الطلب.",
      "Choose size / color for this item before checkout.",
    );
  }

  if (requiresVariant && item.variantId && !item.variant) {
    return t(
      locale,
      "هذا الاختيار لم يعد متاحًا. اختر مقاسًا أو لونًا آخر من السلة.",
      "This option is no longer available. Choose another option from the cart.",
    );
  }

  const stock = getItemAvailableStock(item);

  if (isExplicitlyUnavailable(item) || stock === 0) {
    return t(
      locale,
      "هذا المنتج غير متاح حاليًا. احذفه من السلة أو غيّر الاختيار قبل إتمام الطلب.",
      "This product is currently unavailable. Remove it or change the option before checkout.",
    );
  }

  if (stock !== null && toNumber(item.quantity, 1) > stock) {
    return t(
      locale,
      `الكمية المطلوبة أكبر من المتاح في المخزون. المتاح الآن ${stock} فقط.`,
      `Requested quantity exceeds available stock. Only ${stock} available.`,
    );
  }

  return "";
}

function getStockText(item: any, locale: "ar" | "en") {
  if (hasProductVariants(item) && !item.variantId) {
    return t(locale, "حدد المقاس / اللون لعرض التوفر والسعر النهائي.", "Choose size / color to show availability and final price.");
  }

  const stock = getItemAvailableStock(item);

  if (isExplicitlyUnavailable(item) || stock === 0) {
    return t(locale, "غير متاح", "Unavailable");
  }

  if (stock === null) {
    return t(locale, "سيتم تأكيد التوفر قبل الشحن", "Availability confirmed before delivery");
  }

  if (stock <= 5) {
    return t(locale, `متبقي ${stock} فقط`, `Only ${stock} left`);
  }

  return t(locale, `متاح في المخزون: ${stock}`, `In stock: ${stock}`);
}

function getPaymentPreview(payments: any[], locale: "ar" | "en") {
  if (!payments.length) return t(locale, "الدفع عند الاستلام", "Cash on delivery");

  return payments
    .slice(0, 3)
    .map((payment) => payment.label)
    .filter(Boolean)
    .join(" - ");
}

export function Cart(props: any) {
  const store = props.store || {};
  const products = Array.isArray(props.products) ? props.products : [];
  const locale = getLocale(props);
  const label = labels(locale);

  const [rows, setRows] = useState<any[]>([]);
  const [notice, setNotice] = useState("");
  const [draftOptions, setDraftOptions] = useState<Record<string, Record<string, string>>>({});

  const payments = getPaymentMethods(props, locale);
  const shipping = getShippingSettings(props);
  const policies = getPolicies(props);

  function loadCartRows() {
    setRows(readCart(store, products));
  }

  function changeQuantity(item: any, nextQuantity: number) {
    const stock = getItemAvailableStock(item);
    const safeQuantity = Math.floor(nextQuantity);

    if (safeQuantity <= 0) {
      removeCartItem(store, item.productId, item.variantId);
      setNotice(t(locale, "تم حذف المنتج من السلة.", "Item removed from cart."));
      return;
    }

    if (stock !== null && safeQuantity > stock) {
      updateCartItemQuantity(store, item.productId, stock, item.variantId);
      setNotice(
        t(
          locale,
          `تم ضبط الكمية على المتاح في المخزون: ${stock}.`,
          `Quantity adjusted to available stock: ${stock}.`,
        ),
      );
      return;
    }

    updateCartItemQuantity(store, item.productId, safeQuantity, item.variantId);
    setNotice("");
  }

  function removeItem(item: any) {
    removeCartItem(store, item.productId, item.variantId);
    setNotice(t(locale, "تم حذف المنتج من السلة.", "Item removed from cart."));
  }

  function clearCurrentCart() {
    const confirmed = window.confirm(
      t(locale, "هل تريد مسح كل المنتجات من السلة؟", "Clear all items from cart?"),
    );

    if (!confirmed) return;

    clearCart(store);
    setNotice(t(locale, "تم مسح السلة.", "Cart cleared."));
  }

  function applyVariant(item: any, variant: any) {
    if (!variant?.id) return;

    if (!isVariantActive(variant) || !variantHasStock(item.product, variant)) {
      setNotice(t(locale, "هذا الاختيار غير متوفر حاليًا.", "This option is not currently available."));
      return;
    }

    const changed = updateCartItemVariant(store, item.productId, variant, item.variantId, item.product);

    if (changed) {
      setDraftOptions((current) => {
        const next = { ...current };
        delete next[getItemKey(item)];
        return next;
      });
      setNotice(t(locale, "تم تحديث اختيار المنتج في السلة.", "Cart option updated."));
    }
  }

  function handleOptionChange(item: any, optionName: string, value: string) {
    const key = getItemKey(item);
    const baseSelected = draftOptions[key] || selectedOptionsRecord(item);
    const nextSelected = {
      ...baseSelected,
      [optionName]: value,
    };

    if (!value) delete nextSelected[optionName];

    setDraftOptions((current) => ({
      ...current,
      [key]: nextSelected,
    }));

    const optionRows = getProductVariantOptions(item.product);
    const optionNames = optionRows.map((option) => option.name);
    const variant = getVariantFromOptions(item.product, nextSelected, optionNames);

    if (variant) {
      applyVariant(item, variant);
    }
  }

  function handleVariantSelect(item: any, variantId: string) {
    const variant = getProductVariants(item.product).find((row: any) => String(row?.id) === String(variantId));

    if (variant) applyVariant(item, variant);
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
  const itemCount = rows.reduce((sum, item) => sum + toNumber(item.quantity, 1), 0);
  const blockingIssues = rows
    .map((item) => getCartIssue(item, locale))
    .filter(Boolean);
  const canCheckout = hasItems && blockingIssues.length === 0;
  const remainingForFreeShipping = Math.max(0, toNumber(totals.freeThreshold, 0) - totals.subtotal);
  const freeShippingProgress = totals.freeThreshold
    ? Math.min(100, Math.round((totals.subtotal / totals.freeThreshold) * 100))
    : 0;

  return (
    <PageShell {...props} active="cart">
      <section className={styles.sectionSoft}>
        <div className={styles.container}>
          <div className={styles.cartHeroPanel}>
            <div className={styles.cartHeroCopy}>
              <span className={styles.kicker}>{label.cart}</span>
              <h1 className={styles.sectionTitle}>
                {t(locale, "راجع سلتك قبل إتمام الطلب", "Review your cart before checkout")}
              </h1>
              <p>
                {t(
                  locale,
                  "حدد المقاس واللون للمنتجات التي تحتوي على اختيارات، ثم راجع الكميات والتكلفة النهائية.",
                  "Choose size and color for products with options, then confirm quantities and final cost.",
                )}
              </p>
            </div>

            <div className={styles.checkoutSteps}>
              <div className={`${styles.checkoutStep} ${styles.activeStep}`}>
                <strong>1</strong>
                <span>{label.cart}</span>
              </div>
              <div className={styles.checkoutStep}>
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
          <div className={styles.card}>
            <div className={styles.cartSectionHeader}>
              <div>
                <span className={styles.kicker}>{t(locale, "محتويات السلة", "Cart items")}</span>
                <h2 className={styles.sectionTitle}>{label.cart}</h2>
              </div>

              {hasItems ? (
                <button className={styles.dangerButton} type="button" onClick={clearCurrentCart}>
                  {t(locale, "مسح السلة", "Clear cart")}
                </button>
              ) : null}
            </div>

            {notice ? <div className={styles.successBox}>{notice}</div> : null}

            {blockingIssues.length ? (
              <div className={styles.errorBox}>
                {blockingIssues[0]}
              </div>
            ) : null}

            {hasItems ? (
              <div className={styles.cartItemsList}>
                {rows.map((item) => {
                  const stock = getItemAvailableStock(item);
                  const issue = getCartIssue(item, locale);
                  const lineTotal = getLineTotal(item);
                  const productHref = item.product ? productUrl(store, item.product) : productsUrl(store);
                  const requiresVariant = hasProductVariants(item);
                  const variants = getProductVariants(item.product);
                  const variantOptionRows = getProductVariantOptions(item.product);
                  const optionNames = variantOptionRows.map((option) => option.name);
                  const currentSelected = draftOptions[getItemKey(item)] || selectedOptionsRecord(item);

                  return (
                    <div className={styles.cartItem} key={getItemKey(item)}>
                      <Link href={productHref} className={styles.cartImage}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.product?.name || item.name} />
                        ) : (
                          "—"
                        )}
                      </Link>

                      <div className={styles.cartInfo}>
                        <div className={styles.cartItemTop}>
                          <div>
                            <Link href={productHref} className={styles.cartProductName}>
                              {item.product?.name || item.name || item.productId}
                            </Link>
                            <div className={styles.cartMetaRow}>
                              {item.variantTitle || item.variant?.title ? <span>{item.variantTitle || item.variant.title}</span> : null}
                              {item.sku ? <span dir="ltr">SKU: {item.sku}</span> : null}
                            </div>

                            {getSelectedOptions(item).length ? (
                              <div className={styles.cartOptionChips}>
                                {getSelectedOptions(item).map((option) => (
                                  <span key={`${getItemKey(item)}-${option.key}`}>
                                    <em>{option.key}</em>
                                    <strong>{option.value}</strong>
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <div className={styles.cartPriceStack}>
                            <span>{t(locale, "سعر الوحدة", "Unit price")}</span>
                            <strong>{money(item.price, props, locale)}</strong>
                          </div>
                        </div>

                        {requiresVariant ? (
                          <div className={styles.cartVariantSelector}>
                            <div className={styles.cartVariantSelectorTitle}>
                              <strong>{t(locale, "اختيارات المنتج", "Product options")}</strong>
                              <span>
                                {item.variantId
                                  ? t(locale, "يمكنك تغيير المقاس أو اللون من هنا.", "You can change size or color here.")
                                  : t(locale, "حدد المقاس / اللون قبل إتمام الطلب.", "Choose size / color before checkout.")}
                              </span>
                            </div>

                            {variantOptionRows.length ? (
                              <div className={styles.cartVariantGrid}>
                                {variantOptionRows.map((option) => (
                                  <label className={styles.cartVariantField} key={`${getItemKey(item)}-${option.name}`}>
                                    <span>{optionLabel(option.name, locale)}</span>
                                    <select
                                      className={styles.select}
                                      value={currentSelected[option.name] || ""}
                                      onChange={(event) => handleOptionChange(item, option.name, event.target.value)}
                                    >
                                      <option value="">
                                        {t(locale, `اختر ${optionLabel(option.name, locale)}`, `Choose ${optionLabel(option.name, locale)}`)}
                                      </option>
                                      {option.values.map((value) => {
                                        const disabled = !isOptionValueAvailable(item.product, option.name, value, currentSelected, optionNames);

                                        return (
                                          <option value={value} disabled={disabled} key={`${option.name}-${value}`}>
                                            {value}{disabled ? t(locale, " - غير متاح", " - unavailable") : ""}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <label className={styles.cartVariantField}>
                                <span>{t(locale, "اختيار المنتج", "Product option")}</span>
                                <select
                                  className={styles.select}
                                  value={item.variantId || ""}
                                  onChange={(event) => handleVariantSelect(item, event.target.value)}
                                >
                                  <option value="">{t(locale, "اختر الاختيار المناسب", "Choose option")}</option>
                                  {variants.map((variant: any) => {
                                    const disabled = !isVariantActive(variant) || !variantHasStock(item.product, variant);

                                    return (
                                      <option value={variant.id} disabled={disabled} key={variant.id}>
                                        {getVariantTitle(variant) || variant.sku || variant.id}{disabled ? t(locale, " - غير متاح", " - unavailable") : ""}
                                      </option>
                                    );
                                  })}
                                </select>
                              </label>
                            )}
                          </div>
                        ) : null}

                        <div className={styles.cartItemFooter}>
                          <div className={styles.qtyControl}>
                            <button
                              type="button"
                              aria-label={t(locale, "تقليل الكمية", "Decrease quantity")}
                              onClick={() => changeQuantity(item, item.quantity - 1)}
                            >
                              -
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              aria-label={t(locale, "زيادة الكمية", "Increase quantity")}
                              disabled={stock !== null && item.quantity >= stock}
                              onClick={() => changeQuantity(item, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>

                          <div className={styles.cartLineTotal}>
                            <span>{t(locale, "الإجمالي", "Line total")}</span>
                            <strong>{money(lineTotal, props, locale)}</strong>
                          </div>

                          <button
                            className={styles.cartRemoveButton}
                            type="button"
                            onClick={() => removeItem(item)}
                          >
                            {t(locale, "حذف", "Remove")}
                          </button>
                        </div>

                        <div className={issue ? styles.cartWarningNote : styles.cartStockNote}>
                          {issue || getStockText(item, locale)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                <Link href={productsUrl(store)} className={styles.primaryButton}>
                  {label.shopNow}
                </Link>
              </div>
            )}
          </div>

          <aside className={`${styles.card} ${styles.stickySummary}`}>
            <span className={styles.kicker}>{label.orderSummary}</span>
            <h2 className={styles.sectionTitle}>{label.orderSummary}</h2>

            <div className={styles.cartMiniStats}>
              <div>
                <span>{t(locale, "عدد المنتجات", "Items")}</span>
                <strong>{itemCount}</strong>
              </div>
              <div>
                <span>{t(locale, "طرق الدفع", "Payment")}</span>
                <strong>{payments.length || 1}</strong>
              </div>
            </div>

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
                <span>
                  {label.tax}
                  {totals.pricesIncludeTax ? ` ${t(locale, "مشمول", "included")}` : ""}
                </span>
                <strong>{money(totals.taxAmount, props, locale)}</strong>
              </div>
            ) : null}

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>{label.total}</span>
              <strong>{money(totals.total, props, locale)}</strong>
            </div>

            {totals.freeThreshold ? (
              <div className={styles.freeShippingCard}>
                <div className={styles.freeShippingTop}>
                  <strong>
                    {remainingForFreeShipping > 0
                      ? t(
                          locale,
                          "اقتربت من الشحن المجاني",
                          "You are close to free shipping",
                        )
                      : t(locale, "تم تفعيل الشحن المجاني", "Free shipping unlocked")}
                  </strong>
                  <span>{freeShippingProgress}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <span style={{ width: `${freeShippingProgress}%` }} />
                </div>
                <p>
                  {remainingForFreeShipping > 0
                    ? t(
                        locale,
                        `أضف منتجات بقيمة ${money(remainingForFreeShipping, props, locale)} للحصول على شحن مجاني.`,
                        `Add ${money(remainingForFreeShipping, props, locale)} more to get free shipping.`,
                      )
                    : t(
                        locale,
                        "طلبك مؤهل للشحن المجاني حسب إعدادات المتجر.",
                        "Your order qualifies for free shipping based on store settings.",
                      )}
                </p>
              </div>
            ) : null}

            <div className={styles.checkoutInfoList}>
              <div>
                <strong>{t(locale, "التوصيل", "Delivery")}</strong>
                <span>
                  {shipping.estimatedDeliveryTime ||
                    t(locale, "يتم تأكيد الموعد بعد مراجعة الطلب", "Confirmed after order review")}
                </span>
              </div>
              <div>
                <strong>{t(locale, "الدفع", "Payment")}</strong>
                <span>{getPaymentPreview(payments, locale)}</span>
              </div>
              <div>
                <strong>{t(locale, "الأمان", "Assurance")}</strong>
                <span>
                  {t(
                    locale,
                    "لن يتم تأكيد الطلب إلا بعد مراجعة البيانات والتواصل معك عند الحاجة.",
                    "The order is confirmed after reviewing the details and contacting you if needed.",
                  )}
                </span>
              </div>
              {policies.length ? (
                <div>
                  <strong>{t(locale, "السياسات", "Policies")}</strong>
                  <span>{policies[0]?.titleAr || policies[0]?.titleEn || policies[0]?.type}</span>
                </div>
              ) : null}
            </div>

            {canCheckout ? (
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
                {hasItems
                  ? t(locale, "حدد الاختيارات أولًا", "Choose options first")
                  : t(locale, "أضف منتجات أولًا", "Add products first")}
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
