"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { getCartCount } from "@/storefront/cart/storefront-cart";
import styles from "../styles.module.css";
import {
  accountUrl,
  cartUrl,
  checkoutUrl,
  dir,
  fetchCustomerSession,
  firstText,
  getAddressSettings,
  getContactSettings,
  getFavicon,
  getFooterSettings,
  getLocale,
  getLogo,
  getNavigation,
  getPaymentMethods,
  getSeoDescription,
  getSeoTitle,
  getSocialLinks,
  getStoreName,
  homeUrl,
  labels,
  productsUrl,
  readWishlist,
  resolveUrl,
  t,
} from "./helpers";

function SocialName({ platform }: { platform: string }) {
  const key = platform.toUpperCase();

  return (
    <>
      {key === "FACEBOOK"
        ? "FB"
        : key === "INSTAGRAM"
          ? "IG"
          : key === "WHATSAPP"
            ? "WA"
            : key === "YOUTUBE"
              ? "YT"
              : key}
    </>
  );
}

function normalizeFaviconHref(href: string) {
  const cleanHref = String(href || "").trim();

  if (!cleanHref) return "";
  if (/^(https?:|data:|blob:)/i.test(cleanHref)) return cleanHref;

  return `/${cleanHref.replace(/^\/+/, "")}`;
}

function getIconMimeType(href: string) {
  const clean = String(href || "").split("?")[0].toLowerCase();

  if (clean.endsWith(".svg")) return "image/svg+xml";
  if (clean.endsWith(".ico")) return "image/x-icon";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".gif")) return "image/gif";

  return "image/png";
}

function upsertRuntimeFaviconLink(id: string, rel: string, href: string, type: string) {
  if (typeof document === "undefined") return;

  let link = document.getElementById(id) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = rel;
    link.setAttribute("data-mizar-runtime-favicon", "true");
    document.head.appendChild(link);
  }

  link.rel = rel;
  link.href = href;
  link.type = type;
}

function syncBrowserFavicon(href: string) {
  if (typeof document === "undefined") return;

  const cleanHref = normalizeFaviconHref(href);

  if (!cleanHref) return;

  const separator = cleanHref.includes("?") ? "&" : "?";
  const finalHref = `${cleanHref}${separator}mizar_favicon_v=${Date.now()}`;
  const type = getIconMimeType(finalHref);

  /*
    مهم:
    لا نحذف أي favicon link من head.
    الحذف اليدوي كان سبب خطأ:
    Cannot read properties of null (reading 'removeChild')

    هنا بنعمل update للـ href فقط + بنضيف links خاصة بمزار لو مش موجودة.
  */

  const existingIcons = Array.from(
    document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel~="icon"]',
    ),
  );

  existingIcons.forEach((link) => {
    link.href = finalHref;
    link.type = type;
    link.setAttribute("data-mizar-favicon-synced", "true");
  });

  upsertRuntimeFaviconLink("mizar-runtime-favicon", "icon", finalHref, type);
  upsertRuntimeFaviconLink("mizar-runtime-shortcut-favicon", "shortcut icon", finalHref, type);
  upsertRuntimeFaviconLink("mizar-runtime-apple-favicon", "apple-touch-icon", finalHref, type);
}

export function PageShell({
  children,
  active = "home",
  ...props
}: {
  children: ReactNode;
  active?: string;
  [key: string]: any;
}) {
  const store = props.store || {};
  const content = props.content || {};
  const locale = getLocale(props);
  const label = labels(locale);

  const name = getStoreName(store, locale);
  const logo = getLogo(store);

  const favicon = getFavicon(store);
  const seoTitle = getSeoTitle(store, locale);
  const seoDescription = getSeoDescription(store, locale);
  const seoImage = resolveUrl(
    store?.seoSettings?.ogImageUrl || store?.bannerUrl || store?.coverUrl || store?.logoUrl,
  );

  const nav = getNavigation(content);
  const footer = getFooterSettings(props, locale);
  const socials = getSocialLinks(props);
  const contact = getContactSettings(props);
  const address = getAddressSettings(props);
  const payments = getPaymentMethods(props, locale);

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [customer, setCustomer] = useState<any>(null);

  const navItems = useMemo(
    () =>
      [
        {
          key: "home",
          label: label.home,
          href: homeUrl(store),
          show: nav.showHome,
        },
        {
          key: "products",
          label: label.products,
          href: productsUrl(store),
          show: nav.showProducts,
        },
        {
          key: "about",
          label: label.about,
          href: `${homeUrl(store)}/about`,
          show: nav.showAbout,
        },
        {
          key: "contact",
          label: label.contact,
          href: `${homeUrl(store)}/contact`,
          show: nav.showContact,
        },
      ].filter((item) => item.show),
    [store.slug, store.id, label, nav],
  );

  function refreshCountsOnly() {
    const wishlist = readWishlist(store);

    setCartCount(getCartCount(store));
    setWishlistCount(wishlist.length);
  }

  async function refreshCustomerFromServer() {
    try {
      const session = await fetchCustomerSession(store, {
        persist: true,
        silent: true,
      });

      if (session?.authenticated && (session.customer || session.user)) {
        setCustomer(session.customer || session.user);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    }
  }

  function refreshCustomerFromEvent(event: Event) {
    const detail = (event as CustomEvent).detail;

    setCustomer(detail || null);
  }

  function handleStorageEvent(event: StorageEvent) {
    refreshCountsOnly();

    const key = String(event.key || "").toLowerCase();

    if (!key.includes("customer")) return;

    if (!event.newValue) {
      setCustomer(null);
      return;
    }

    try {
      const parsed = JSON.parse(event.newValue);

      setCustomer(parsed || null);
    } catch {
      setCustomer(null);
    }
  }

  function refreshAll() {
    refreshCountsOnly();
    refreshCustomerFromServer();
  }

  useEffect(() => {
    refreshAll();

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        `mizar-active-template:${firstText(store.slug, store.id, "store")}`,
        "BAZAAR_CARDS",
      );

      window.addEventListener("mizar-cart-updated", refreshCountsOnly);
      window.addEventListener("mizar-wishlist-updated", refreshCountsOnly);
      window.addEventListener("mizar-customer-updated", refreshCustomerFromEvent);
      window.addEventListener("storage", handleStorageEvent);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mizar-cart-updated", refreshCountsOnly);
        window.removeEventListener("mizar-wishlist-updated", refreshCountsOnly);
        window.removeEventListener("mizar-customer-updated", refreshCustomerFromEvent);
        window.removeEventListener("storage", handleStorageEvent);
      }
    };
  }, [store.id, store.slug]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.lang = locale;
    document.documentElement.dir = dir(locale);

    if (favicon) {
      syncBrowserFavicon(favicon);
    }
  }, [locale, seoTitle, seoDescription, seoImage, favicon]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const q = search.trim();

    if (typeof window !== "undefined") {
      window.location.href = `${productsUrl(store)}${q ? `?search=${encodeURIComponent(q)}` : ""}`;
    }
  }

  function switchLanguage() {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);

    url.searchParams.set("lang", locale === "ar" ? "en" : "ar");

    window.location.href = url.toString();
  }

  return (
    <main className={styles.root} dir={dir(locale)} lang={locale} data-template="BAZAAR_CARDS">
      <header className={styles.header}>
        <div className={styles.topStrip}>
          <span>
            {firstText(
              store.tagline,
              store.category,
              t(locale, "متجر إلكتروني موثوق", "Trusted online store"),
            )}
          </span>

          <div>
            {contact.whatsappNumber ? (
              <Link
                href={`https://wa.me/${String(contact.whatsappNumber).replace(/\D/g, "")}`}
                target="_blank"
              >
                WhatsApp
              </Link>
            ) : null}

            <button type="button" onClick={switchLanguage}>
              {locale === "ar" ? "EN" : "AR"}
            </button>
          </div>
        </div>

        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((value) => !value)}
          >
            ☰
          </button>

          <Link href={homeUrl(store)} className={styles.brand}>
            <span className={styles.logo}>
              {logo ? <img src={logo} alt={name} /> : name.slice(0, 1)}
            </span>

            <span>
              <strong>{name}</strong>
              <small>{firstText(store.subCategory, store.category, "Bazaar Cards")}</small>
            </span>
          </Link>

          <nav className={styles.navLinks}>
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={active === item.key ? styles.activeNav : ""}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form className={styles.headerSearch} onSubmit={submitSearch}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={label.search}
            />
            <button type="submit">⌕</button>
          </form>

          <div className={styles.headerActions}>
            {nav.showWishlist ? (
              <Link href={`${homeUrl(store)}/wishlist`} className={styles.iconButton}>
                ♡{wishlistCount ? <b>{wishlistCount}</b> : null}
              </Link>
            ) : null}

            {nav.showCart ? (
              <Link href={cartUrl(store)} className={styles.iconButton}>
                🛒{cartCount ? <b>{cartCount}</b> : null}
              </Link>
            ) : null}

            {nav.showLogin ? (
              <Link
                href={customer ? accountUrl(store) : `${homeUrl(store)}/login`}
                className={styles.accountButton}
              >
                {customer?.name || label.account}
              </Link>
            ) : null}
          </div>
        </div>

        {menuOpen ? (
          <div className={styles.mobileMenu}>
            {navItems.map((item) => (
              <Link key={item.key} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}

            <Link href={cartUrl(store)}>{label.cart}</Link>
            <Link href={checkoutUrl(store)}>{label.checkout}</Link>
          </div>
        ) : null}
      </header>

      {children}

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div>
              <Link href={homeUrl(store)} className={styles.footerBrand}>
                {logo ? <img src={logo} alt={name} /> : null}
                <strong>{name}</strong>
              </Link>

              <p>{footer.about}</p>

              {footer.showSocialLinks && socials.length ? (
                <div className={styles.socials}>
                  {socials.map((item) => (
                    <Link key={`${item.platform}-${item.url}`} href={item.url} target="_blank">
                      <SocialName platform={item.platform} />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <h3>{label.products}</h3>
              <Link href={productsUrl(store)}>{label.allProducts}</Link>
              <Link href={`${homeUrl(store)}/wishlist`}>{label.wishlist}</Link>
              <Link href={cartUrl(store)}>{label.cart}</Link>
              <Link href={checkoutUrl(store)}>{label.checkout}</Link>
            </div>

            <div>
              <h3>{t(locale, "خدمة العملاء", "Customer service")}</h3>

              {(footer.customerServiceLinks.length
                ? footer.customerServiceLinks
                : [label.contact, label.shippingPolicy, label.returnPolicy]
              ).map((item: string) => (
                <Link href={`${homeUrl(store)}/contact`} key={item}>
                  {item}
                </Link>
              ))}

              {footer.quickLinks.map((item: string) => (
                <Link href={homeUrl(store)} key={item}>
                  {item}
                </Link>
              ))}
            </div>

            <div>
              <h3>{label.contact}</h3>

              {footer.showContactInfo ? (
                <p>
                  {firstText(
                    contact.mobileNumber,
                    contact.whatsappNumber,
                    contact.businessEmail,
                    address.address,
                    "-",
                  )}
                </p>
              ) : null}

              {address.address ? <p>{address.address}</p> : null}

              {payments.length ? (
                <div className={styles.payments}>
                  {payments.slice(0, 6).map((item) => (
                    <span key={item.type}>{item.label}</span>
                  ))}
                </div>
              ) : null}

              {footer.shippingPartners.length ? (
                <div className={styles.payments}>
                  {footer.shippingPartners.slice(0, 6).map((item: string) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>{footer.copyrightText}</span>
            {footer.showPoweredByMizar ? <span>{label.powered}</span> : null}
          </div>
        </div>
      </footer>
    </main>
  );
}