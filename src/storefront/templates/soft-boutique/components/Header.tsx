"use client";

import Link from "next/link";
import {
  buildStoreHref,
  getStoreName,
  resolveMediaUrl,
  switchStoreLocale,
} from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import styles from "../styles.module.css";
import { theme } from "../theme";

export function Header({ store, locale, text, active }: Pick<TemplatePageProps, "store" | "locale" | "text"> & { active?: string }) {
  const logoUrl = resolveMediaUrl(store?.logoUrl);
  const nextLocale = locale === "ar" ? "en" : "ar";
  const navItems = [
    { key: "home", label: text.nav.home, href: buildStoreHref(store) },
    { key: "products", label: text.nav.products, href: buildStoreHref(store, "products") },
    { key: "about", label: text.nav.about, href: buildStoreHref(store, "about") },
    { key: "contact", label: text.nav.contact, href: buildStoreHref(store, "contact") },
  ];

  return (
    <header className={styles.header}>
      <Link href={buildStoreHref(store)} className={styles.brand}>
        <span className={styles.logo}>{logoUrl ? <img src={logoUrl} alt={getStoreName(store)} /> : getStoreName(store).slice(0, 1)}</span>
        <span className={styles.brandText}>
          <strong>{getStoreName(store)}</strong>
          <span>{theme.name}</span>
        </span>
      </Link>

      <nav className={styles.nav} aria-label={locale === "ar" ? "روابط المتجر" : "Store navigation"}>
        {navItems.map((item) => (
          <Link key={item.key} href={item.href} className={active === item.key ? styles.active : ""}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.actions}>
        <button type="button" className={styles.langButton} onClick={() => switchStoreLocale(nextLocale)}>
          {text.common.languageButton}
        </button>
        <Link href={buildStoreHref(store, "wishlist")} className={styles.iconButton} aria-label={text.nav.wishlist}>♡</Link>
        <Link href={buildStoreHref(store, "login")} className={styles.iconButton}>{text.nav.login}</Link>
      </div>
    </header>
  );
}
