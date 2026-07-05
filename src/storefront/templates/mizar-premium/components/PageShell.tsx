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

type IconName =
  | "bag"
  | "chevron"
  | "close"
  | "globe"
  | "heart"
  | "menu"
  | "search"
  | "user"
  | "whatsapp";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = {
    className,
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <path d="M10.75 18.5a7.75 7.75 0 1 1 0-15.5 7.75 7.75 0 0 1 0 15.5Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "heart") {
    return (
      <svg {...common}>
        <path
          d="M20.15 5.72c-1.93-1.85-5.05-1.54-6.83.5L12 7.72l-1.32-1.5c-1.78-2.04-4.9-2.35-6.83-.5-2.22 2.14-2.33 5.7-.34 8.02 1.74 2.03 5.02 4.86 7.28 6.69.7.57 1.72.57 2.42 0 2.26-1.83 5.54-4.66 7.28-6.69 1.99-2.32 1.88-5.88-.34-8.02Z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "bag") {
    return (
      <svg {...common}>
        <path d="M7.25 8.25h9.5l.86 11.05a2 2 0 0 1-1.99 2.2H8.38a2 2 0 0 1-1.99-2.2l.86-11.05Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M9 8.25V7a3 3 0 0 1 6 0v1.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...common}>
        <path d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M4.75 20.25c1.23-3.08 3.71-4.65 7.25-4.65s6.02 1.57 7.25 4.65" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M4.5 7.25h15M4.5 12h15M4.5 16.75h15" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "globe") {
    return (
      <svg {...common}>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.65" />
        <path d="M3.7 9h16.6M3.7 15h16.6M12 3c2.2 2.22 3.3 5.22 3.3 9s-1.1 6.78-3.3 9c-2.2-2.22-3.3-5.22-3.3-9S9.8 5.22 12 3Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "whatsapp") {
    return (
      <svg {...common}>
        <path d="M12 21a8.68 8.68 0 0 1-4.28-1.12L4 21l1.2-3.58A8.72 8.72 0 1 1 12 21Z" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
        <path d="M9 8.55c.22-.48.42-.5.7-.5h.5c.16 0 .38.06.58.46.2.4.68 1.64.74 1.76.06.12.1.28.02.44-.08.16-.12.26-.24.4l-.36.42c-.12.14-.24.28-.1.52.14.24.62 1.02 1.34 1.66.92.82 1.7 1.08 1.94 1.2.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.42.67 1.66.8.24.12.4.18.46.28.06.1.06.58-.14 1.14-.2.56-1.16 1.08-1.62 1.12-.42.04-.96.06-1.55-.1-.36-.1-.82-.26-1.42-.52-2.5-1.08-4.14-3.6-4.26-3.76-.12-.16-1.02-1.36-1.02-2.6s.64-1.84.88-2.1Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SocialName({ platform }: { platform: string }) {
  const key = platform.toUpperCase();

  return <>{key === "FACEBOOK" ? "FB" : key === "INSTAGRAM" ? "IG" : key === "WHATSAPP" ? "WA" : key === "YOUTUBE" ? "YT" : key}</>;
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
  const seoImage = resolveUrl(store?.seoSettings?.ogImageUrl || store?.bannerUrl || store?.coverUrl || store?.logoUrl);

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
        { key: "home", label: label.home, href: homeUrl(store), show: nav.showHome },
        { key: "products", label: label.products, href: productsUrl(store), show: nav.showProducts },
        { key: "about", label: label.about, href: `${homeUrl(store)}/about`, show: nav.showAbout },
        { key: "contact", label: label.contact, href: `${homeUrl(store)}/contact`, show: nav.showContact },
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
      const session = await fetchCustomerSession(store, { persist: true, silent: true });

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
      window.localStorage.setItem(`mizar-active-template:${firstText(store.slug, store.id, "store")}`, "MIZAR_PREMIUM");

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

  function setLanguage(nextLocale: "ar" | "en") {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);

    url.searchParams.set("lang", nextLocale);
    window.location.href = url.toString();
  }

  function switchLanguage() {
    setLanguage(locale === "ar" ? "en" : "ar");
  }

  return (
    <main className={styles.root} dir={dir(locale)} lang={locale} data-template="MIZAR_PREMIUM">
      <header className={styles.header}>
        <div className={styles.topStrip}>
          <span>{firstText(store.tagline, store.category, t(locale, "متجر إلكتروني موثوق", "Trusted online store"))}</span>

          <div className={styles.topStripActions}>
            {contact.whatsappNumber ? (
              <Link href={`https://wa.me/${String(contact.whatsappNumber).replace(/\D/g, "")}`} target="_blank" className={styles.topMiniLink}>
                <Icon name="whatsapp" />
                WhatsApp
              </Link>
            ) : null}

            <details className={styles.languageDropdown}>
              <summary>
                <Icon name="globe" />
                <span>{locale === "ar" ? "AR" : "EN"}</span>
                <Icon name="chevron" className={styles.chevronIcon} />
              </summary>
              <div className={styles.dropdownMenu}>
                <button type="button" className={locale === "ar" ? styles.activeDropdownItem : ""} onClick={() => setLanguage("ar")}>
                  <span>العربية</span>
                  <small>RTL</small>
                </button>
                <button type="button" className={locale === "en" ? styles.activeDropdownItem : ""} onClick={() => setLanguage("en")}>
                  <span>English</span>
                  <small>LTR</small>
                </button>
              </div>
            </details>
          </div>
        </div>

        <div className={styles.headerInner}>
          <button type="button" className={styles.menuButton} onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>

          <Link href={homeUrl(store)} className={styles.brand}>
            <span className={styles.logo}>{logo ? <img src={logo} alt={name} /> : name.slice(0, 1)}</span>

            <span>
              <strong>{name}</strong>
              <small>{firstText(store.subCategory, store.category, "Mizar Premium")}</small>
            </span>
          </Link>

          <nav className={styles.navLinks}>
            {navItems.map((item) => (
              <Link key={item.key} href={item.href} className={active === item.key ? styles.activeNav : ""}>
                {item.label}
              </Link>
            ))}
          </nav>

          <form className={styles.headerSearch} onSubmit={submitSearch}>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={label.search} />
            <button type="submit" aria-label={label.search}>
              <Icon name="search" />
            </button>
          </form>

          <div className={styles.headerActions}>
            {nav.showWishlist ? (
              <Link href={`${homeUrl(store)}/wishlist`} className={`${styles.iconButton} ${styles.navIconButton}`} aria-label={label.wishlist}>
                <Icon name="heart" />
                {wishlistCount ? <b>{wishlistCount}</b> : null}
              </Link>
            ) : null}

            {nav.showCart ? (
              <Link href={cartUrl(store)} className={`${styles.iconButton} ${styles.navIconButton}`} aria-label={label.cart}>
                <Icon name="bag" />
                {cartCount ? <b>{cartCount}</b> : null}
              </Link>
            ) : null}

            {nav.showLogin ? (
              <details className={styles.accountDropdown}>
                <summary className={styles.accountSummary}>
                  <Icon name="user" />
                  <span>{customer?.name || label.account}</span>
                  <Icon name="chevron" className={styles.chevronIcon} />
                </summary>
                <div className={styles.dropdownMenu}>
                  <Link href={customer ? accountUrl(store) : `${homeUrl(store)}/login`}>
                    <span>{customer ? label.account : t(locale, "تسجيل الدخول", "Login")}</span>
                    <small>{customer ? t(locale, "إدارة حسابك", "Manage account") : t(locale, "حساب العميل", "Customer account")}</small>
                  </Link>
                  <Link href={cartUrl(store)}>
                    <span>{label.cart}</span>
                    <small>{cartCount ? `${cartCount}` : t(locale, "السلة فارغة", "Empty cart")}</small>
                  </Link>
                  <Link href={`${homeUrl(store)}/wishlist`}>
                    <span>{label.wishlist}</span>
                    <small>{wishlistCount ? `${wishlistCount}` : t(locale, "قائمة مختاراتك", "Saved items")}</small>
                  </Link>
                  <Link href={checkoutUrl(store)}>
                    <span>{label.checkout}</span>
                    <small>{t(locale, "إتمام الشراء", "Complete order")}</small>
                  </Link>
                </div>
              </details>
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

            <Link href={cartUrl(store)} onClick={() => setMenuOpen(false)}>{label.cart}</Link>
            <Link href={`${homeUrl(store)}/wishlist`} onClick={() => setMenuOpen(false)}>{label.wishlist}</Link>
            <Link href={checkoutUrl(store)} onClick={() => setMenuOpen(false)}>{label.checkout}</Link>
            <button type="button" onClick={switchLanguage}>{locale === "ar" ? "English" : "العربية"}</button>
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

              {(footer.customerServiceLinks.length ? footer.customerServiceLinks : [label.contact, label.shippingPolicy, label.returnPolicy]).map((item: string) => (
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

              {footer.showContactInfo ? <p>{firstText(contact.mobileNumber, contact.whatsappNumber, contact.businessEmail, address.address, "-")}</p> : null}

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
