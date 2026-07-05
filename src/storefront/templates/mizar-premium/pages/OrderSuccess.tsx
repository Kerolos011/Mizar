"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import {
  accountUrl,
  firstText,
  getContactSettings,
  getLocale,
  getShippingSettings,
  labels,
  money,
  productImage,
  productsUrl,
  readLastOrder,
  t,
} from "../components/helpers";

type TrackStep = {
  key: string;
  ar: string;
  en: string;
  descriptionAr: string;
  descriptionEn: string;
};

const TRACK_STEPS: TrackStep[] = [
  {
    key: "received",
    ar: "تم استلام الطلب",
    en: "Order received",
    descriptionAr: "تم تسجيل الطلب وربطه بلوحة تحكم المتجر.",
    descriptionEn: "The order has been registered in the merchant dashboard.",
  },
  {
    key: "confirmed",
    ar: "تأكيد الطلب",
    en: "Order confirmation",
    descriptionAr: "يقوم المتجر بمراجعة البيانات والتواصل عند الحاجة.",
    descriptionEn:
      "The store is reviewing the details and will contact you if needed.",
  },
  {
    key: "preparing",
    ar: "قيد التجهيز",
    en: "Preparing",
    descriptionAr: "يتم تجهيز المنتجات ومراجعة المقاسات والألوان قبل الشحن.",
    descriptionEn:
      "Products, sizes and colors are being prepared before shipping.",
  },
  {
    key: "shipping",
    ar: "خرج للتوصيل",
    en: "Out for delivery",
    descriptionAr: "تم تسليم الطلب لشركة الشحن أو المندوب.",
    descriptionEn: "The order has been handed to the courier or delivery team.",
  },
  {
    key: "delivered",
    ar: "تم التسليم",
    en: "Delivered",
    descriptionAr: "تم تسليم الطلب بنجاح.",
    descriptionEn: "The order has been delivered successfully.",
  },
];

function toNumber(value: any, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatOrderId(order: any) {
  const raw = firstText(
    order?.orderNumber,
    order?.number,
    order?.code,
    order?.reference,
    order?.id,
  );

  if (!raw) return "-";
  if (raw.length <= 14) return `#${raw}`;

  return `#${raw.slice(-10).toUpperCase()}`;
}

function fullOrderId(order: any) {
  return firstText(
    order?.orderNumber,
    order?.number,
    order?.code,
    order?.reference,
    order?.id,
  );
}

function getOrderTotal(order: any) {
  return toNumber(
    firstText(
      order?.total,
      order?.totals?.total,
      order?.grandTotal,
      order?.subtotalAfterDiscount,
    ),
    0,
  );
}

function normalizeStatus(value: any) {
  return String(value || "PENDING")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function statusLabel(status: string, locale: "ar" | "en") {
  const labelsMap: Record<string, { ar: string; en: string }> = {
    PENDING: { ar: "جديد", en: "New" },
    NEW: { ar: "جديد", en: "New" },
    RECEIVED: { ar: "تم الاستلام", en: "Received" },
    CONFIRMED: { ar: "تم التأكيد", en: "Confirmed" },
    ACCEPTED: { ar: "تم التأكيد", en: "Accepted" },
    PROCESSING: { ar: "قيد التجهيز", en: "Processing" },
    PREPARING: { ar: "قيد التجهيز", en: "Preparing" },
    READY: { ar: "جاهز للشحن", en: "Ready" },
    SHIPPED: { ar: "تم الشحن", en: "Shipped" },
    OUT_FOR_DELIVERY: { ar: "خرج للتوصيل", en: "Out for delivery" },
    DELIVERED: { ar: "تم التسليم", en: "Delivered" },
    COMPLETED: { ar: "مكتمل", en: "Completed" },
    CANCELLED: { ar: "ملغي", en: "Cancelled" },
    CANCELED: { ar: "ملغي", en: "Cancelled" },
    REFUNDED: { ar: "مسترد", en: "Refunded" },
  };

  return labelsMap[status]?.[locale] || status.replace(/_/g, " ");
}

function statusStepIndex(status: string) {
  if (["DELIVERED", "COMPLETED"].includes(status)) return 4;
  if (["SHIPPED", "OUT_FOR_DELIVERY"].includes(status)) return 3;
  if (["PROCESSING", "PREPARING", "READY"].includes(status)) return 2;
  if (["CONFIRMED", "ACCEPTED"].includes(status)) return 1;
  return 0;
}

function isCancelledStatus(status: string) {
  return ["CANCELLED", "CANCELED", "REFUNDED"].includes(status);
}

function isInvoicePrintableStatus(status: string) {
  return status === "COMPLETED";
}

function paymentLabel(value: any, locale: "ar" | "en") {
  const key = String(value || "")
    .trim()
    .toUpperCase();

  const labelsMap: Record<string, { ar: string; en: string }> = {
    CASH_ON_DELIVERY: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
    COD: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
    BANK_TRANSFER: { ar: "تحويل بنكي", en: "Bank transfer" },
    ONLINE_PAYMENT: { ar: "دفع إلكتروني", en: "Online payment" },
    CARD: { ar: "بطاقة بنكية", en: "Card" },
    WALLET: { ar: "محفظة إلكترونية", en: "Wallet" },
    PAYPAL: { ar: "PayPal", en: "PayPal" },
  };

  return (
    labelsMap[key]?.[locale] ||
    firstText(value, t(locale, "غير محدد", "Not selected"))
  );
}

function formatDate(value: any, locale: "ar" | "en") {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getCustomer(order: any) {
  return (
    order?.customer || {
      name: order?.customerName,
      phone: order?.customerPhone || order?.phone,
      email: order?.customerEmail || order?.email,
      city: order?.customerCity || order?.city,
      address: order?.customerAddress || order?.address,
    }
  );
}

function getItems(order: any) {
  return Array.isArray(order?.items) ? order.items : [];
}

function lineTotal(item: any) {
  return toNumber(
    firstText(
      item?.finalTotal,
      item?.total,
      item?.lineTotal,
      toNumber(firstText(item?.finalPrice, item?.price, item?.unitPrice), 0) *
        toNumber(item?.quantity, 1),
    ),
    0,
  );
}

function linePrice(item: any) {
  return toNumber(firstText(item?.finalPrice, item?.price, item?.unitPrice), 0);
}

function itemName(item: any) {
  return firstText(
    item?.productName,
    item?.product?.name,
    item?.name,
    item?.title,
    item?.productId,
  );
}

function itemVariantText(item: any) {
  const options = item?.selectedOptions || item?.variant?.options;

  if (item?.variantTitle) return String(item.variantTitle);

  if (options && typeof options === "object" && !Array.isArray(options)) {
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" / ");
  }

  return firstText(item?.variant?.title, item?.variantName);
}

function itemSku(item: any) {
  return firstText(item?.sku, item?.variant?.sku, item?.product?.sku);
}

function itemImage(item: any) {
  return firstText(
    item?.imageUrl,
    item?.productImageUrl,
    item?.variant?.imageUrl,
    item?.variant?.media?.[0]?.url,
    item?.product?.imageUrl,
    item?.product?.media?.[0]?.url,
    productImage(item?.product),
  );
}


function optionValue(item: any, keys: string[]) {
  const selected = item?.selectedOptions || item?.variant?.options || item?.options;
  const normalizedKeys = keys.map((key) => String(key).toLowerCase());

  if (selected && typeof selected === "object" && !Array.isArray(selected)) {
    for (const [key, value] of Object.entries(selected)) {
      const normalizedKey = String(key).trim().toLowerCase();
      if (normalizedKeys.some((candidate) => normalizedKey.includes(candidate))) {
        return firstText(value);
      }
    }
  }

  return "";
}

function variantPart(item: any, index: number) {
  const text = itemVariantText(item);
  if (!text || !String(text).includes("/")) return "";

  return firstText(
    String(text)
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean)[index],
  );
}

function itemColor(item: any) {
  return firstText(
    item?.color,
    item?.colour,
    item?.variant?.color,
    optionValue(item, ["color", "colour", "لون"]),
    variantPart(item, 0),
  );
}

function itemSize(item: any) {
  return firstText(
    item?.size,
    item?.variant?.size,
    optionValue(item, ["size", "مقاس", "المقاس"]),
    variantPart(item, 1),
  );
}

function lineDiscount(item: any) {
  const explicit = firstText(
    item?.discount,
    item?.discountAmount,
    item?.discountTotal,
    item?.productDiscount,
    item?.lineDiscount,
  );

  if (explicit !== "" && explicit !== undefined && explicit !== null) {
    return Math.max(0, toNumber(explicit, 0));
  }

  const quantity = toNumber(item?.quantity, 1);
  const regularUnit = toNumber(
    firstText(item?.originalPrice, item?.regularPrice, item?.compareAtPrice),
    linePrice(item),
  );
  const computed = regularUnit * quantity - lineTotal(item);
  return computed > 0 ? computed : 0;
}

function orderSubtotal(order: any, items: any[], total: number) {
  const explicit = firstText(
    order?.subtotalBeforeDiscount,
    order?.totals?.subtotalBeforeDiscount,
    order?.subtotal,
    order?.totals?.subtotal,
  );

  if (explicit !== "" && explicit !== undefined && explicit !== null) {
    return toNumber(explicit, total);
  }

  return items.reduce((sum, item) => sum + lineTotal(item) + lineDiscount(item), 0);
}

function orderDiscount(order: any, items: any[]) {
  return toNumber(
    firstText(
      order?.productDiscountTotal,
      order?.discountTotal,
      order?.discount,
      order?.totals?.productDiscountTotal,
      order?.totals?.discountTotal,
    ),
    items.reduce((sum, item) => sum + lineDiscount(item), 0),
  );
}

function couponDiscount(order: any) {
  return toNumber(
    firstText(
      order?.couponDiscount,
      order?.couponDiscountTotal,
      order?.promoDiscount,
      order?.totals?.couponDiscount,
      order?.totals?.couponDiscountTotal,
    ),
    0,
  );
}

function shippingFee(order: any) {
  return toNumber(
    firstText(
      order?.shippingFeeSnapshot,
      order?.shippingCost,
      order?.shippingFee,
      order?.totals?.shippingCost,
      order?.totals?.shippingFee,
    ),
    0,
  );
}

function taxAmount(order: any) {
  return toNumber(firstText(order?.taxAmount, order?.vat, order?.totals?.taxAmount, order?.totals?.vat), 0);
}

function additionalFees(order: any) {
  return toNumber(
    firstText(
      order?.additionalFees,
      order?.serviceFee,
      order?.handlingFee,
      order?.totals?.additionalFees,
      order?.totals?.serviceFee,
      order?.totals?.handlingFee,
    ),
    0,
  );
}

function paymentStatusLabel(value: any, fallbackStatus: string, locale: "ar" | "en") {
  const key = normalizeStatus(firstText(value, fallbackStatus));
  const labelsMap: Record<string, { ar: string; en: string }> = {
    PAID: { ar: "مدفوع", en: "Paid" },
    COMPLETED: { ar: "مدفوع", en: "Paid" },
    PENDING: { ar: "قيد السداد", en: "Pending" },
    UNPAID: { ar: "غير مدفوع", en: "Unpaid" },
    COD: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
    CASH_ON_DELIVERY: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
    FAILED: { ar: "فشل الدفع", en: "Failed" },
    REFUNDED: { ar: "مسترد", en: "Refunded" },
  };

  return labelsMap[key]?.[locale] || key.replace(/_/g, " ");
}

function storeWebsite(props: any, store: any, contact: any) {
  return firstText(contact.website, store?.website, store?.domain, props?.website, props?.storefront?.website);
}

function storeTaxNumber(props: any, store: any) {
  return firstText(
    store?.taxNumber,
    store?.vatNumber,
    store?.taxId,
    props?.settings?.taxNumber,
    props?.business?.taxNumber,
  );
}

function storeCommercialRegistration(props: any, store: any) {
  return firstText(
    store?.commercialRegistration,
    store?.commercialRegister,
    store?.crNumber,
    store?.registrationNumber,
    props?.business?.commercialRegistration,
    props?.business?.crNumber,
  );
}

function buildWhatsAppLink(props: any, order: any, locale: "ar" | "en") {
  const contact = getContactSettings(props);
  const raw = firstText(contact.whatsappNumber, props?.store?.whatsapp);
  const digits = String(raw || "").replace(/\D/g, "");

  if (!digits) return "";

  const message = t(
    locale,
    `مرحبًا، أريد متابعة طلبي رقم ${fullOrderId(order) || "-"}`,
    `Hello, I would like to track my order ${fullOrderId(order) || "-"}`,
  );

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

async function fetchTrackedOrder(store: any, orderId: string) {
  const params = new URLSearchParams();
  const storeSlug = firstText(store?.slug);
  const storeId = firstText(store?.id);

  if (storeSlug) params.set("storeSlug", storeSlug);
  if (storeId) params.set("storeId", storeId);

  const response = await fetch(
    `/api/storefront/orders/${encodeURIComponent(orderId)}?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "ORDER_TRACKING_FAILED");
  }

  return data.order;
}

function toEnglishDigits(value: any) {
  return String(value ?? "")
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

function getInvoiceCurrencyLabel(props: any) {
  const code = String(
    firstText(
      props?.currency,
      props?.store?.currency,
      props?.settings?.currency,
      props?.storefront?.currency,
      props?.checkout?.currency,
      "EGP",
    ),
  ).toUpperCase();

  const labelsMap: Record<string, string> = {
    EGP: "ج.م",
    SAR: "ر.س",
    AED: "د.إ",
    KWD: "د.ك",
    QAR: "ر.ق",
    BHD: "د.ب",
    OMR: "ر.ع",
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
  };

  return labelsMap[code] || code || "";
}

function invoiceMoney(value: any, props: any) {
  const amount = toNumber(value, 0);
  const hasFractions = Math.abs(amount % 1) > 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasFractions ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${getInvoiceCurrencyLabel(props)}`.trim();
}

function invoiceDate(value: any) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return toEnglishDigits(
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date),
  ).replace(",", "");
}

function invoiceQuantity(value: any) {
  return toEnglishDigits(
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
      toNumber(value, 1),
    ),
  );
}

function buildInvoiceQrUrl(value: string) {
  if (!value) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=0&data=${encodeURIComponent(value)}`;
}

export function OrderSuccess(props: any) {
  const store = props.store || {};
  const locale = getLocale(props);
  const label = labels(locale);
  const contact = getContactSettings(props);
  const storeName = firstText(
    store?.name,
    props?.branding?.storeName,
    t(locale, "المتجر", "Store"),
  );
  const storeTagline = firstText(
    store?.tagline,
    store?.description,
    props?.branding?.tagline,
    "",
  );
  const storeLogo = firstText(
    store?.logoUrl,
    store?.logo,
    store?.imageUrl,
    props?.branding?.logoUrl,
    props?.branding?.logo,
  );
  const storeInitial =
    String(storeName || "M")
      .trim()
      .slice(0, 1)
      .toUpperCase() || "M";
  const params = useParams();
  const searchParams = useSearchParams();
  const shipping = getShippingSettings(props);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [copied, setCopied] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState("");

  const requestedOrderId = useMemo(
    () => String((params as any)?.orderId || searchParams.get("orderId") || ""),
    [params, searchParams],
  );

  const currentOrderId = firstText(requestedOrderId, order?.id);
  const invoiceDirectUrl = useMemo(() => {
    if (invoiceUrl) return invoiceUrl;

    const slug = firstText(store?.slug);
    const id = firstText(currentOrderId, requestedOrderId);

    if (slug && id) return `/store/${slug}/order-success/${id}`;
    return "";
  }, [currentOrderId, invoiceUrl, requestedOrderId, store?.slug]);
  const invoiceQrSrc = invoiceDirectUrl
    ? buildInvoiceQrUrl(invoiceDirectUrl)
    : "";
  const customer = getCustomer(order);
  const items = getItems(order);
  const status = normalizeStatus(
    order?.status || order?.orderStatus || "PENDING",
  );
  const activeStep = statusStepIndex(status);
  const cancelled = isCancelledStatus(status);
  const total = getOrderTotal(order);
  const canPrintInvoice = isInvoicePrintableStatus(status);
  const whatsappLink = order ? buildWhatsAppLink(props, order, locale) : "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInvoiceUrl(window.location.href);
    }
  }, [currentOrderId]);

  useEffect(() => {
    let cancelledEffect = false;
    let intervalId: number | undefined;
    const lastOrder = readLastOrder(store);
    const targetId = firstText(requestedOrderId, lastOrder?.id);

    const initialOrder =
      targetId && String(lastOrder?.id || "") === String(targetId)
        ? lastOrder
        : targetId
          ? { id: targetId }
          : lastOrder;

    setOrder(initialOrder || null);

    if (!targetId) return;

    async function loadTrackedOrder(silent = false) {
      if (!silent) {
        setLoading(true);
      }
      setTrackingError("");

      try {
        const trackedOrder = await fetchTrackedOrder(store, targetId);

        if (!cancelledEffect && trackedOrder) {
          setOrder((current: any) => ({ ...(current || {}), ...trackedOrder }));
        }
      } catch (error) {
        if (!cancelledEffect) {
          const hasLocalOrderDetails = Boolean(
            initialOrder?.customer ||
            initialOrder?.customerName ||
            initialOrder?.total ||
            initialOrder?.subtotalAfterDiscount ||
            getItems(initialOrder).length,
          );

          if (hasLocalOrderDetails) {
            setTrackingError("");
          } else {
            setTrackingError(
              error instanceof Error &&
                error.message &&
                error.message !== "ORDER_TRACKING_FAILED"
                ? error.message
                : t(
                    locale,
                    "تعذر تحميل بيانات الطلب الآن. سيتم تحديث الصفحة تلقائياً عند توفر البيانات.",
                    "Could not load the order details now. The page will refresh automatically when data is available.",
                  ),
            );
          }
        }
      } finally {
        if (!cancelledEffect && !silent) setLoading(false);
      }
    }

    loadTrackedOrder(false);
    intervalId = window.setInterval(() => loadTrackedOrder(true), 15000);

    return () => {
      cancelledEffect = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [locale, requestedOrderId, store.id, store.slug]);


  function handlePrintInvoice() {
    if (!canPrintInvoice) {
      setTrackingError(
        t(
          locale,
          "طباعة الفاتورة متاحة فقط بعد اكتمال الطلب.",
          "Invoice printing is available only after the order is completed.",
        ),
      );
      return;
    }

    if (typeof window !== "undefined") {
      window.print();
    }
  }

  async function copyOrderNumber() {
    const value = fullOrderId(order);

    if (!value || typeof navigator === "undefined") return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <PageShell {...props} active="checkout">
      <section className={styles.sectionSoft}>
        <div className={styles.container}>
          <div className={styles.successHeroCard}>
            <div className={styles.successHeroTop}>
              <span className={styles.successIcon}>✓</span>
              <span
                className={`${styles.orderStatusPill} ${cancelled ? styles.orderStatusCancelled : ""}`}
              >
                {statusLabel(status, locale)}
              </span>
            </div>

            <div className={styles.successHeroContent}>
              <span className={styles.kicker}>
                {t(locale, "تم إنشاء الطلب بنجاح", "Order placed successfully")}
              </span>
              <h1 className={styles.sectionTitle}>
                {t(
                  locale,
                  "شكراً لك، تم استلام طلبك",
                  "Thank you, your order was received",
                )}
              </h1>
              <p className={styles.sectionText}>
                {t(
                  locale,
                  "هذه الصفحة تعرض ملخص الطلب وحالة التتبع الحالية. احتفظ برقم الطلب لاستخدامه عند التواصل مع المتجر.",
                  "This page shows the order summary and current tracking status. Keep your order number for store support.",
                )}
              </p>
            </div>

            <div className={styles.successSummaryStrip}>
              <div>
                <span>{t(locale, "رقم الطلب", "Order number")}</span>
                <strong dir="ltr">{formatOrderId(order)}</strong>
                {fullOrderId(order) ? (
                  <small dir="ltr">{fullOrderId(order)}</small>
                ) : null}
              </div>
              <div>
                <span>{t(locale, "إجمالي الطلب", "Order total")}</span>
                <strong>{total ? money(total, props, locale) : "-"}</strong>
              </div>
              <div>
                <span>{t(locale, "تاريخ الطلب", "Order date")}</span>
                <strong>
                  {formatDate(
                    order?.createdAt || order?.created_at || order?.date,
                    locale,
                  )}
                </strong>
              </div>
              <div>
                <span>{t(locale, "طريقة الدفع", "Payment")}</span>
                <strong>
                  {paymentLabel(
                    firstText(order?.paymentMethod, order?.payment),
                    locale,
                  )}
                </strong>
              </div>
            </div>

            <div className={styles.successActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={copyOrderNumber}
              >
                {copied
                  ? t(locale, "تم نسخ رقم الطلب", "Order number copied")
                  : t(locale, "نسخ رقم الطلب", "Copy order number")}
              </button>
              {whatsappLink ? (
                <Link
                  href={whatsappLink}
                  target="_blank"
                  className={styles.secondaryButton}
                >
                  {t(locale, "متابعة عبر واتساب", "Track on WhatsApp")}
                </Link>
              ) : null}
              {canPrintInvoice ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handlePrintInvoice}
                >
                  {t(locale, "طباعة الفاتورة", "Print invoice")}
                </button>
              ) : (
                <span className={styles.invoiceLockedHint}>
                  {t(
                    locale,
                    "الفاتورة متاحة للطباعة بعد اكتمال الطلب فقط",
                    "Invoice printing is available only after the order is completed",
                  )}
                </span>
              )}
              <Link href={productsUrl(store)} className={styles.primaryButton}>
                {label.continueShopping}
              </Link>
            </div>
          </div>

          <div className={styles.successLayout}>
            <div className={styles.successMainColumn}>
              <div className={styles.successPanel}>
                <div className={styles.successPanelHeader}>
                  <div>
                    <span className={styles.kicker}>
                      {t(locale, "تتبع الطلب", "Order tracking")}
                    </span>
                    <h2>
                      {t(locale, "حالة الطلب الحالية", "Current order status")}
                    </h2>
                  </div>
                  {loading ? (
                    <span className={styles.orderStatusPill}>
                      {t(locale, "جاري التحديث...", "Updating...")}
                    </span>
                  ) : null}
                </div>

                {cancelled ? (
                  <div className={styles.orderCancelledBox}>
                    <strong>
                      {t(locale, "تم إلغاء الطلب", "Order cancelled")}
                    </strong>
                    <span>
                      {t(
                        locale,
                        "تواصل مع المتجر إذا كنت تحتاج لتفاصيل إضافية حول الإلغاء أو الاسترداد.",
                        "Contact the store if you need more details about cancellation or refund.",
                      )}
                    </span>
                  </div>
                ) : (
                  <div className={styles.trackingTimeline}>
                    {TRACK_STEPS.map((step, index) => {
                      const active = index <= activeStep;
                      const current = index === activeStep;

                      return (
                        <div
                          key={step.key}
                          className={`${styles.trackingStep} ${active ? styles.trackingStepDone : ""} ${current ? styles.trackingStepCurrent : ""}`}
                        >
                          <span>{active ? "✓" : index + 1}</span>
                          <div>
                            <strong>{t(locale, step.ar, step.en)}</strong>
                            <small>
                              {t(
                                locale,
                                step.descriptionAr,
                                step.descriptionEn,
                              )}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className={styles.orderAutoRefreshNote}>
                  <strong>
                    {t(locale, "يتم تحديث حالة الطلب تلقائياً", "Order status updates automatically")}
                  </strong>
                  <span>
                    {t(
                      locale,
                      "لا يحتاج العميل إلى إدخال رقم الموبايل أو الضغط على أي زر؛ الصفحة تجلب آخر بيانات الطلب مباشرة من المتجر.",
                      "The customer does not need to enter a phone number or press any button; this page loads the latest order data directly from the store.",
                    )}
                  </span>
                </div>

                {trackingError ? (
                  <p className={styles.successWarning}>{trackingError}</p>
                ) : null}
              </div>

              <div className={styles.successPanel}>
                <div className={styles.successPanelHeader}>
                  <div>
                    <span className={styles.kicker}>
                      {t(locale, "محتويات الطلب", "Order items")}
                    </span>
                    <h2>
                      {t(locale, "المنتجات المطلوبة", "Requested products")}
                    </h2>
                  </div>
                  <span className={styles.orderStatusPill}>
                    {items.length || 0} {t(locale, "منتج", "items")}
                  </span>
                </div>

                {items.length ? (
                  <div className={styles.successOrderItems}>
                    {items.map((item: any, index: number) => {
                      const image = itemImage(item);
                      const variant = itemVariantText(item);
                      const sku = itemSku(item);

                      return (
                        <div
                          className={styles.successOrderItem}
                          key={firstText(
                            item?.id,
                            `${item?.productId || "item"}-${item?.variantId || index}`,
                          )}
                        >
                          <div className={styles.orderLineImage}>
                            {image ? (
                              <img src={image} alt={itemName(item)} />
                            ) : (
                              "M"
                            )}
                          </div>
                          <div>
                            <strong>{itemName(item)}</strong>
                            <span>
                              {t(locale, "الكمية", "Qty")}:{" "}
                              {toNumber(item?.quantity, 1)}
                              {variant ? ` — ${variant}` : ""}
                            </span>
                            {sku ? <small dir="ltr">SKU: {sku}</small> : null}
                          </div>
                          <div>
                            <span>{money(linePrice(item), props, locale)}</span>
                            <strong>
                              {money(lineTotal(item), props, locale)}
                            </strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.sectionText}>
                    {t(
                      locale,
                      "تفاصيل المنتجات ستظهر هنا بعد تحديث التتبع أو من الطلب المحفوظ على هذا الجهاز.",
                      "Product details will appear here after refreshing tracking or from the saved order on this device.",
                    )}
                  </p>
                )}
              </div>
            </div>

            <aside className={styles.successSideColumn}>
              <div className={styles.successPanel}>
                <div className={styles.successPanelHeader}>
                  <div>
                    <span className={styles.kicker}>
                      {t(locale, "بيانات التوصيل", "Delivery details")}
                    </span>
                    <h2>{t(locale, "معلومات العميل", "Customer info")}</h2>
                  </div>
                </div>

                <div className={styles.orderInfoList}>
                  <div>
                    <span>{t(locale, "الاسم", "Name")}</span>
                    <strong>
                      {firstText(customer?.name, order?.customerName, "-")}
                    </strong>
                  </div>
                  <div>
                    <span>{t(locale, "رقم الموبايل", "Phone")}</span>
                    <strong dir="ltr">
                      {firstText(customer?.phone, order?.customerPhone, "-")}
                    </strong>
                  </div>
                  <div>
                    <span>{t(locale, "البريد الإلكتروني", "Email")}</span>
                    <strong dir="ltr">
                      {firstText(customer?.email, order?.customerEmail, "-")}
                    </strong>
                  </div>
                  <div>
                    <span>{t(locale, "المدينة", "City")}</span>
                    <strong>
                      {firstText(customer?.city, order?.customerCity, "-")}
                    </strong>
                  </div>
                  <div className={styles.orderInfoWide}>
                    <span>{t(locale, "العنوان", "Address")}</span>
                    <strong>
                      {firstText(
                        customer?.address,
                        order?.customerAddress,
                        "-",
                      )}
                    </strong>
                  </div>
                </div>

                {shipping.estimatedDeliveryTime ? (
                  <div className={styles.deliveryNoteBox}>
                    <strong>
                      {t(locale, "مدة التوصيل المتوقعة", "Estimated delivery")}
                    </strong>
                    <span>{shipping.estimatedDeliveryTime}</span>
                  </div>
                ) : null}
              </div>

              <div className={styles.successPanel}>
                <div className={styles.successPanelHeader}>
                  <div>
                    <span className={styles.kicker}>
                      {t(locale, "ملخص الدفع", "Payment summary")}
                    </span>
                    <h2>{t(locale, "تفاصيل المبلغ", "Amount details")}</h2>
                  </div>
                </div>

                <div className={styles.orderTotalsList}>
                  <div>
                    <span>{t(locale, "قبل الخصم", "Before discount")}</span>
                    <strong>
                      {money(
                        toNumber(
                          firstText(
                            order?.subtotalBeforeDiscount,
                            order?.totals?.subtotalBeforeDiscount,
                          ),
                          total,
                        ),
                        props,
                        locale,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>{t(locale, "خصم المنتجات", "Product discount")}</span>
                    <strong>
                      -{" "}
                      {money(
                        toNumber(
                          firstText(
                            order?.productDiscountTotal,
                            order?.totals?.productDiscountTotal,
                          ),
                          0,
                        ),
                        props,
                        locale,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>{t(locale, "الشحن", "Shipping")}</span>
                    <strong>
                      {money(
                        toNumber(
                          firstText(
                            order?.shippingFeeSnapshot,
                            order?.shippingCost,
                            order?.totals?.shippingCost,
                          ),
                          0,
                        ),
                        props,
                        locale,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>{t(locale, "الضريبة", "Tax")}</span>
                    <strong>
                      {money(
                        toNumber(
                          firstText(order?.taxAmount, order?.totals?.taxAmount),
                          0,
                        ),
                        props,
                        locale,
                      )}
                    </strong>
                  </div>
                  <div className={styles.orderTotalFinal}>
                    <span>{t(locale, "الإجمالي", "Total")}</span>
                    <strong>{total ? money(total, props, locale) : "-"}</strong>
                  </div>
                </div>

                {canPrintInvoice ? (
                  <div className={styles.invoiceReadyBox}>
                    <strong>
                      {t(locale, "الفاتورة جاهزة", "Invoice ready")}
                    </strong>
                    <span>
                      {t(
                        locale,
                        "يمكنك طباعة فاتورة الطلب الآن لأن حالة الطلب مكتمل.",
                        "You can print the invoice now because the order status is completed.",
                      )}
                    </span>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={handlePrintInvoice}
                    >
                      {t(locale, "طباعة الفاتورة", "Print invoice")}
                    </button>
                  </div>
                ) : (
                  <div className={styles.invoiceLockedBox}>
                    <strong>
                      {t(
                        locale,
                        "الفاتورة غير متاحة حالياً",
                        "Invoice not available yet",
                      )}
                    </strong>
                    <span>
                      {t(
                        locale,
                        "تظهر إمكانية طباعة الفاتورة للعميل فقط عندما تتحول حالة الطلب إلى مكتمل من لوحة التحكم.",
                        "The print invoice option appears only when the order status is changed to completed from the dashboard.",
                      )}
                    </span>
                  </div>
                )}

                <div className={styles.successQuickLinks}>
                  <Link
                    href={accountUrl(store)}
                    className={styles.secondaryButton}
                  >
                    {t(locale, "طلباتي", "My orders")}
                  </Link>
                  <Link
                    href={productsUrl(store)}
                    className={styles.primaryButton}
                  >
                    {label.continueShopping}
                  </Link>
                </div>
              </div>
            </aside>
          </div>
          {canPrintInvoice ? (
            <div
              className={styles.invoicePrintArea}
              aria-hidden="true"
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              <article className={styles.invoicePremiumPaper}>
                <header className={styles.invoicePremiumHeader}>
                  <div className={styles.invoicePremiumStoreBlock}>
                    <div className={styles.invoicePremiumLogoBox}>
                      {storeLogo ? (
                        <img src={storeLogo} alt={storeName} />
                      ) : (
                        <span>{storeInitial}</span>
                      )}
                    </div>
                    <div className={styles.invoicePremiumStoreText}>
                      <h2>{toEnglishDigits(storeName)}</h2>
                      {storeTagline ? <p>{toEnglishDigits(storeTagline)}</p> : null}
                      <ul>
                        <li>{toEnglishDigits(firstText(contact.address, store?.address, "-"))}</li>
                        <li dir="ltr">
                          {toEnglishDigits(firstText(contact.phone, contact.whatsappNumber, store?.phone, "-"))}
                        </li>
                        <li dir="ltr">{firstText(contact.email, store?.email, "-")}</li>
                        {storeWebsite(props, store, contact) ? (
                          <li dir="ltr">{storeWebsite(props, store, contact)}</li>
                        ) : null}
                      </ul>
                    </div>
                  </div>

                  <div className={styles.invoicePremiumTitleBlock}>
                    <h1>{t(locale, "فاتورة إلكترونية", "Electronic Invoice")}</h1>
                    <div className={styles.invoicePremiumBadgeRow}>
                      <span className={styles.invoicePremiumBadge}>
                        {statusLabel(status, locale)}
                      </span>
                      <span className={styles.invoicePremiumBadge}>
                        {paymentStatusLabel(order?.paymentStatus, status, locale)}
                      </span>
                    </div>
                    <dl>
                      <div>
                        <dt>{t(locale, "رقم الفاتورة", "Invoice no.")}</dt>
                        <dd dir="ltr">{formatOrderId(order)}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "رقم الطلب", "Order no.")}</dt>
                        <dd dir="ltr">{fullOrderId(order) || formatOrderId(order)}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "تاريخ الإصدار", "Issue date")}</dt>
                        <dd dir="ltr">{invoiceDate(new Date().toISOString())}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "تاريخ الإكمال", "Completion date")}</dt>
                        <dd dir="ltr">
                          {invoiceDate(
                            firstText(
                              order?.completedAt,
                              order?.deliveredAt,
                              order?.updatedAt,
                              order?.createdAt,
                            ),
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </header>

                <section className={styles.invoicePremiumMetaStrip}>
                  <div>
                    <span>{t(locale, "تاريخ الطلب", "Order date")}</span>
                    <strong dir="ltr">
                      {invoiceDate(order?.createdAt || order?.created_at || order?.date)}
                    </strong>
                  </div>
                  <div>
                    <span>{t(locale, "حالة الطلب", "Order status")}</span>
                    <strong>{statusLabel(status, locale)}</strong>
                  </div>
                  <div>
                    <span>{t(locale, "طريقة الدفع", "Payment method")}</span>
                    <strong>{paymentLabel(firstText(order?.paymentMethod, order?.payment), locale)}</strong>
                  </div>
                  <div>
                    <span>{t(locale, "الإجمالي النهائي", "Grand total")}</span>
                    <strong dir="ltr">{total ? invoiceMoney(total, props) : "-"}</strong>
                  </div>
                </section>

                <section className={styles.invoicePremiumParties}>
                  <div className={styles.invoicePremiumCard}>
                    <h3>{t(locale, "بيانات المتجر", "Store information")}</h3>
                    <dl>
                      <div>
                        <dt>{t(locale, "اسم المتجر", "Store name")}</dt>
                        <dd>{toEnglishDigits(storeName)}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "العنوان", "Address")}</dt>
                        <dd>{toEnglishDigits(firstText(contact.address, store?.address, "-"))}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "الهاتف", "Phone")}</dt>
                        <dd dir="ltr">{toEnglishDigits(firstText(contact.phone, contact.whatsappNumber, store?.phone, "-"))}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "البريد", "Email")}</dt>
                        <dd dir="ltr">{firstText(contact.email, store?.email, "-")}</dd>
                      </div>
                      {storeWebsite(props, store, contact) ? (
                        <div>
                          <dt>{t(locale, "الموقع", "Website")}</dt>
                          <dd dir="ltr">{storeWebsite(props, store, contact)}</dd>
                        </div>
                      ) : null}
                      {storeTaxNumber(props, store) ? (
                        <div>
                          <dt>{t(locale, "الرقم الضريبي", "Tax no.")}</dt>
                          <dd dir="ltr">{toEnglishDigits(storeTaxNumber(props, store))}</dd>
                        </div>
                      ) : null}
                      {storeCommercialRegistration(props, store) ? (
                        <div>
                          <dt>{t(locale, "السجل التجاري", "CR no.")}</dt>
                          <dd dir="ltr">{toEnglishDigits(storeCommercialRegistration(props, store))}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>

                  <div className={styles.invoicePremiumCard}>
                    <h3>{t(locale, "بيانات العميل", "Customer information")}</h3>
                    <dl>
                      <div>
                        <dt>{t(locale, "الاسم", "Name")}</dt>
                        <dd>{toEnglishDigits(firstText(customer?.name, order?.customerName, "-"))}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "رقم الموبايل", "Phone")}</dt>
                        <dd dir="ltr">{toEnglishDigits(firstText(customer?.phone, order?.customerPhone, "-"))}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "البريد", "Email")}</dt>
                        <dd dir="ltr">{firstText(customer?.email, order?.customerEmail, "-")}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "العنوان", "Address")}</dt>
                        <dd>{toEnglishDigits(firstText(customer?.billingAddress, order?.billingAddress, customer?.address, order?.customerAddress, "-"))}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "المدينة", "City")}</dt>
                        <dd>{toEnglishDigits(firstText(customer?.city, order?.customerCity, order?.city, "-"))}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "الدولة", "Country")}</dt>
                        <dd>{toEnglishDigits(firstText(customer?.country, order?.country, "-"))}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "الرمز البريدي", "Postal code")}</dt>
                        <dd dir="ltr">{toEnglishDigits(firstText(customer?.postalCode, order?.postalCode, "-"))}</dd>
                      </div>
                    </dl>
                  </div>
                </section>

                <section className={styles.invoicePremiumItemsSection}>
                  <div className={styles.invoicePremiumSectionHead}>
                    <h3>{t(locale, "تفاصيل المنتجات", "Products")}</h3>
                    <span>{toEnglishDigits(items.length || 0)} {t(locale, "منتج", "items")}</span>
                  </div>

                  <div className={styles.invoicePremiumTableWrap}>
                    <table className={styles.invoicePremiumTable}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{t(locale, "المنتج", "Product")}</th>
                          <th>{t(locale, "SKU", "SKU")}</th>
                          <th>{t(locale, "اللون", "Color")}</th>
                          <th>{t(locale, "المقاس", "Size")}</th>
                          <th>{t(locale, "الكمية", "Qty")}</th>
                          <th>{t(locale, "سعر الوحدة", "Unit price")}</th>
                          <th>{t(locale, "الخصم", "Discount")}</th>
                          <th>{t(locale, "الإجمالي", "Total")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length ? (
                          items.map((item: any, index: number) => (
                            <tr
                              key={firstText(item?.id, `${item?.productId || "item"}-${item?.variantId || index}`)}
                            >
                              <td dir="ltr">{toEnglishDigits(index + 1)}</td>
                              <td>
                                <strong>{toEnglishDigits(itemName(item))}</strong>
                              </td>
                              <td dir="ltr">{itemSku(item) || "-"}</td>
                              <td>{toEnglishDigits(itemColor(item) || "-")}</td>
                              <td>{toEnglishDigits(itemSize(item) || "-")}</td>
                              <td dir="ltr">{invoiceQuantity(item?.quantity)}</td>
                              <td dir="ltr">{invoiceMoney(linePrice(item), props)}</td>
                              <td dir="ltr">{lineDiscount(item) ? invoiceMoney(lineDiscount(item), props) : "-"}</td>
                              <td dir="ltr"><strong>{invoiceMoney(lineTotal(item), props)}</strong></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9}>
                              {t(locale, "لا توجد تفاصيل منتجات محفوظة للفاتورة.", "No saved product details for the invoice.")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.invoicePremiumTotalsUnderTable}>
                    <div className={styles.invoicePremiumSummary}>
                      <h3>{t(locale, "تفاصيل الإجمالي", "Total details")}</h3>
                      <div>
                        <span>{t(locale, "المجموع الفرعي", "Subtotal")}</span>
                        <strong dir="ltr">{invoiceMoney(orderSubtotal(order, items, total), props)}</strong>
                      </div>
                      <div>
                        <span>{t(locale, "خصم المنتجات", "Product discount")}</span>
                        <strong dir="ltr">- {invoiceMoney(orderDiscount(order, items), props)}</strong>
                      </div>
                      <div>
                        <span>{t(locale, "خصم الكوبون", "Coupon discount")}</span>
                        <strong dir="ltr">- {invoiceMoney(couponDiscount(order), props)}</strong>
                      </div>
                      <div>
                        <span>{t(locale, "الشحن", "Shipping")}</span>
                        <strong dir="ltr">{invoiceMoney(shippingFee(order), props)}</strong>
                      </div>
                      <div>
                        <span>{t(locale, "ضريبة القيمة المضافة", "VAT")}</span>
                        <strong dir="ltr">{invoiceMoney(taxAmount(order), props)}</strong>
                      </div>
                      <div>
                        <span>{t(locale, "رسوم إضافية", "Additional fees")}</span>
                        <strong dir="ltr">{invoiceMoney(additionalFees(order), props)}</strong>
                      </div>
                      <div className={styles.invoicePremiumGrandTotal}>
                        <span>{t(locale, "الإجمالي النهائي", "Grand total")}</span>
                        <strong dir="ltr">{total ? invoiceMoney(total, props) : "-"}</strong>
                      </div>
                    </div>
                  </div>
                </section>

                <section className={styles.invoicePremiumPaymentOnly}>
                  <div className={styles.invoicePremiumCard}>
                    <h3>{t(locale, "بيانات الدفع", "Payment information")}</h3>
                    <dl>
                      <div>
                        <dt>{t(locale, "طريقة الدفع", "Payment method")}</dt>
                        <dd>{paymentLabel(firstText(order?.paymentMethod, order?.payment), locale)}</dd>
                      </div>
                      <div>
                        <dt>{t(locale, "حالة الدفع", "Payment status")}</dt>
                        <dd>{paymentStatusLabel(order?.paymentStatus, status, locale)}</dd>
                      </div>
                    </dl>
                  </div>
                </section>

                <section className={styles.invoicePremiumNotesSection}>
                  <div className={styles.invoicePremiumNotes}>
                    <h3>{t(locale, "ملاحظات", "Notes")}</h3>
                    <div>
                      <strong>{t(locale, "ملاحظات العميل", "Customer notes")}</strong>
                      <p>{toEnglishDigits(firstText(order?.customerNotes, order?.notes, "-"))}</p>
                    </div>
                    <div>
                      <strong>{t(locale, "ملاحظات المتجر", "Store notes")}</strong>
                      <p>{toEnglishDigits(firstText(order?.storeNotes, "تم إصدار هذه الفاتورة بعد اكتمال الطلب من لوحة تحكم المتجر."))}</p>
                    </div>
                    <div>
                      <strong>{t(locale, "رسالة شكر", "Thank you")}</strong>
                      <p>{t(locale, "شكراً لثقتك بنا. يرجى الاحتفاظ بهذه الفاتورة كمرجع رسمي للطلب والدفع.", "Thank you for your business. Please keep this invoice as an official order and payment reference.")}</p>
                    </div>
                  </div>
                </section>

                <section className={styles.invoicePremiumQrSection}>
                  <div className={styles.invoicePremiumQrBox}>
                    {invoiceQrSrc ? (
                      <img src={invoiceQrSrc} alt={t(locale, "QR Code للفاتورة", "Invoice QR code")} />
                    ) : null}
                    <strong>{t(locale, "رابط تفاصيل الطلب", "Online order details")}</strong>
                    <small>{t(locale, "امسح الكود لفتح صفحة الطلب وتفاصيله على المتجر", "Scan to open the online order page and details")}</small>
                    {invoiceDirectUrl ? <span dir="ltr">{invoiceDirectUrl}</span> : null}
                  </div>
                </section>

                <footer className={styles.invoicePremiumFooter}>
                  <strong>{toEnglishDigits(storeName)}</strong>
                  <span dir="ltr">{firstText(contact.email, store?.email, "-")}</span>
                  <span dir="ltr">{toEnglishDigits(firstText(contact.phone, contact.whatsappNumber, store?.phone, "-"))}</span>
                  {storeWebsite(props, store, contact) ? <span dir="ltr">{storeWebsite(props, store, contact)}</span> : null}
                </footer>
              </article>
            </div>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
