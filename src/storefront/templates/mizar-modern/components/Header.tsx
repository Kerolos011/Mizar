"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  buildStoreHref,
  getStoreName,
  resolveMediaUrl,
  switchStoreLocale,
} from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import styles from "../styles.module.css";

type CustomerUser = {
  id?: string;
  name?: string | null;
  role?: string | null;
  customerStore?: { slug?: string | null } | null;
  customerStoreId?: string | null;
};

function cleanPhone(value?: string | null) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function getNavItems(store: TemplatePageProps["store"], text: TemplatePageProps["text"], isLoggedIn: boolean) {
  return [
    { key: "home", label: text.nav.home, href: buildStoreHref(store) },
    { key: "products", label: text.nav.products, href: buildStoreHref(store, "products") },
    { key: "about", label: text.nav.about, href: buildStoreHref(store, "about") },
    { key: "contact", label: text.nav.contact, href: buildStoreHref(store, "contact") },
    { key: "wishlist", label: text.nav.wishlist, href: buildStoreHref(store, "wishlist") },
    { key: "cart", label: text.nav.cart, href: buildStoreHref(store, "cart") },
    {
      key: isLoggedIn ? "account" : "login",
      label: isLoggedIn ? (text.nav as any).account || "حسابي" : text.nav.login,
      href: buildStoreHref(store, isLoggedIn ? "account" : "login"),
    },
  ];
}

export function Header({
  store,
  locale,
  text,
  active,
}: Pick<TemplatePageProps, "store" | "locale" | "text"> & { active?: string }) {
  const pathname = usePathname();
  const logoUrl = resolveMediaUrl(store?.logoUrl);
  const nextLocale = locale === "ar" ? "en" : "ar";
  const name = getStoreName(store);
  const whatsapp = cleanPhone(store?.whatsapp || (store as any)?.phone || (store as any)?.contactPhone || "");
  const topText = locale === "ar" ? "تجربة تسوق حديثة وآمنة" : "Modern and secure shopping";
  const supportText = locale === "ar" ? "الدعم" : "Support";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const storeSlug = String(store?.slug || "");

  async function checkCustomer() {
    try {
      const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json().catch(() => null);
      const loadedUser = data?.success && data?.user?.role === "CUSTOMER" ? (data.user as CustomerUser) : null;
      const userStoreSlug = loadedUser?.customerStore?.slug;
      if (loadedUser && (!userStoreSlug || !storeSlug || userStoreSlug === storeSlug)) {
        setCustomer(loadedUser);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setAuthLoaded(true);
    }
  }

  useEffect(() => {
    checkCustomer();
    const handler = () => checkCustomer();
    window.addEventListener("mizar-customer-auth-changed", handler);
    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener("mizar-customer-auth-changed", handler);
      window.removeEventListener("focus", handler);
    };
  }, [storeSlug]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navItems = useMemo(() => getNavItems(store, text, Boolean(customer)), [store, text, customer]);
  const activeKey = active || (pathname?.includes("/products") ? "products" : pathname?.includes("/about") ? "about" : pathname?.includes("/contact") ? "contact" : pathname?.includes("/wishlist") ? "wishlist" : pathname?.includes("/cart") ? "cart" : pathname?.includes("/account") ? "account" : pathname?.includes("/login") ? "login" : "home");

  return (
    <header className={styles.headerWrap}>
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <span>{store?.city || store?.area || topText}</span>
          <span className={styles.topbarDivider} />
          <span>{store?.shippingPolicy || (locale === "ar" ? "شحن وتوصيل حسب سياسة المتجر" : "Delivery according to store policy")}</span>
          <span className={styles.topbarGrow} />
          {whatsapp ? (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
              {supportText}: {whatsapp}
            </a>
          ) : (
            <span>{supportText}</span>
          )}
        </div>
      </div>

      <div className={styles.navbar}>
        <Link href={buildStoreHref(store)} className={styles.brand} aria-label={name}>
          <span className={`${styles.logo} ${logoUrl ? styles.logoImage : ""}`}>
            {logoUrl ? <img src={logoUrl} alt={name} /> : name.slice(0, 1)}
          </span>
          <span className={styles.brandText}>
            <strong>{name}</strong>
            <small>{store?.category || (locale === "ar" ? "متجر إلكتروني" : "Online store")}</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label={locale === "ar" ? "روابط المتجر" : "Store navigation"}>
          {navItems.map((item) => (
            <Link key={item.key} href={item.href} className={activeKey === item.key ? styles.active : ""}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.langButton} onClick={() => switchStoreLocale(nextLocale)}>
            {locale === "ar" ? "EN" : "AR"}
          </button>
          <Link href={buildStoreHref(store, "cart")} className={styles.roundButton} aria-label={text.nav.cart}>🛒</Link>
          <Link href={buildStoreHref(store, customer ? "account" : "login")} className={styles.loginButton}>
            {authLoaded && customer ? ((text.nav as any).account || "حسابي") : text.nav.login}
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={locale === "ar" ? "فتح القائمة" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`${styles.mobilePanel} ${mobileOpen ? styles.mobilePanelOpen : ""}`}>
        <div className={styles.mobilePanelInner}>
          {navItems.map((item) => (
            <Link key={item.key} href={item.href} className={activeKey === item.key ? styles.active : ""}>
              {item.label}
            </Link>
          ))}
          <button type="button" className={styles.mobileLang} onClick={() => switchStoreLocale(nextLocale)}>
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </div>
    </header>
  );
}
