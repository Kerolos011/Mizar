"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { getLocale, labels, money, productsUrl, readLastOrder, t } from "../components/helpers";

export function OrderSuccess(props: any) {
  const store = props.store || {};
  const locale = getLocale(props);
  const label = labels(locale);
  const params = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const requestedOrderId = useMemo(() => String((params as any)?.orderId || searchParams.get("orderId") || ""), [params, searchParams]);

  useEffect(() => {
    const lastOrder = readLastOrder(store);
    if (!requestedOrderId || String(lastOrder?.id || "") === requestedOrderId) {
      setOrder(lastOrder);
    } else {
      setOrder({ id: requestedOrderId });
    }
  }, [store.id, store.slug, requestedOrderId]);

  return (
    <PageShell {...props} active="checkout">
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.card} style={{ textAlign: "center" }}>
            <span className={styles.kicker}>✓</span>
            <h1 className={styles.sectionTitle}>{t(locale, "تم استلام الطلب", "Order received")}</h1>
            <p className={styles.sectionText}>{t(locale, "تم إنشاء الطلب وربطه بلوحة الطلبات الخاصة بالتاجر.", "The order was created and connected to the merchant orders dashboard.")}</p>
            {order ? (
              <div className={styles.tabs} style={{ textAlign: "initial" }}>
                <div className={styles.tabCard}>
                  <h3 dir="ltr">{order.id}</h3>
                  <p>{order.customer?.name || order.customerName || order.customer?.email || ""}{order.total || order.totals?.total ? ` — ${money(order.total || order.totals?.total, props, locale)}` : ""}</p>
                </div>
              </div>
            ) : null}
            <Link href={productsUrl(store)} className={styles.primaryButton}>{label.continueShopping}</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
