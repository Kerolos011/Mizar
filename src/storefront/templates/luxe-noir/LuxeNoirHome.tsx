"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import type {
  StorefrontProduct,
  StorefrontStore,
  StorefrontTemplateProps,
} from "../../types";

const luxeStyles = `
.luxe-root {
  --lx-bg: #070707;
  --lx-panel: #101010;
  --lx-panel-2: #161312;
  --lx-text: #f8f1df;
  --lx-muted: #b9ad94;
  --lx-primary: #d4af37;
  --lx-accent: #ffffff;
  --lx-border: rgba(212, 175, 55, 0.24);
  --lx-border-soft: rgba(255, 255, 255, 0.09);
  --lx-shadow: 0 26px 80px rgba(0, 0, 0, 0.48);
  --lx-radius: 28px;
  --lx-on-primary: #070707;
  --lx-serif: Georgia, "Times New Roman", serif;

  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 18% 4%, color-mix(in srgb, var(--lx-primary) 16%, transparent), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(255, 255, 255, 0.08), transparent 22%),
    linear-gradient(180deg, #050505 0%, #101010 52%, #070707 100%);
  color: var(--lx-text);
}

.luxe-root a { color: inherit; text-decoration: none; }

.luxe-shell {
  width: min(1240px, calc(100% - 36px));
  margin: 0 auto;
}

.luxe-announcement {
  border-bottom: 1px solid var(--lx-border-soft);
  background: rgba(0, 0, 0, 0.48);
  color: var(--lx-primary);
  padding: 9px 0;
  text-align: center;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}

.luxe-header {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--lx-border-soft);
  background: color-mix(in srgb, #070707 84%, transparent);
  backdrop-filter: blur(18px);
}

.luxe-header-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  min-height: 86px;
}

.luxe-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.luxe-nav.center { justify-content: center; }
.luxe-actions { justify-content: flex-end; }

.luxe-nav a,
.luxe-nav button,
.luxe-pill-button,
.luxe-icon-button {
  border: 1px solid transparent;
  background: transparent;
  color: var(--lx-muted);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 850;
  transition: 220ms ease;
}

.luxe-nav a,
.luxe-nav button {
  border-radius: 999px;
  padding: 10px 13px;
}

.luxe-nav a:hover,
.luxe-nav button:hover {
  border-color: var(--lx-border);
  background: rgba(212, 175, 55, 0.08);
  color: var(--lx-primary);
}

.luxe-brand {
  display: grid;
  justify-items: center;
  gap: 9px;
  min-width: 0;
}

.luxe-logo {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border: 1px solid var(--lx-border);
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 20%, rgba(255,255,255,.18), transparent 24%),
    linear-gradient(135deg, color-mix(in srgb, var(--lx-primary) 72%, #ffffff), var(--lx-primary));
  color: var(--lx-on-primary);
  box-shadow: 0 16px 38px rgba(212, 175, 55, 0.16);
  font-family: var(--lx-serif);
  font-size: 22px;
  font-weight: 950;
}

.luxe-logo.has-image {
  overflow: visible;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.luxe-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.luxe-brand-name {
  max-width: 260px;
  overflow: hidden;
  color: var(--lx-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--lx-serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: .04em;
}

.luxe-brand-subtitle {
  margin-top: 1px;
  color: var(--lx-primary);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .22em;
  text-transform: uppercase;
}

.luxe-icon-button,
.luxe-pill-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 999px;
  border-color: var(--lx-border-soft);
  background: rgba(255, 255, 255, 0.04);
  color: var(--lx-text);
  position: relative;
}

.luxe-icon-button {
  width: 42px;
  padding: 0;
  font-size: 17px;
}

.luxe-pill-button {
  gap: 8px;
  padding: 10px 15px;
}

.luxe-pill-button.primary,
.luxe-cta.primary,
.luxe-card-button.primary {
  border-color: color-mix(in srgb, var(--lx-primary) 70%, transparent);
  background: var(--lx-primary);
  color: var(--lx-on-primary);
}

.luxe-pill-button:hover,
.luxe-icon-button:hover,
.luxe-cta:hover,
.luxe-card-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 42px rgba(0,0,0,.32);
}

.luxe-count {
  position: absolute;
  top: -5px;
  inset-inline-end: -5px;
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--lx-primary);
  color: var(--lx-on-primary);
  padding: 0 5px;
  font-size: 10px;
  font-weight: 950;
}

.luxe-hero {
  padding: 54px 0 34px;
}

.luxe-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  gap: 34px;
  align-items: stretch;
}

.luxe-hero-copy {
  border: 1px solid var(--lx-border);
  border-radius: var(--lx-radius);
  background:
    radial-gradient(circle at 0% 0%, rgba(212, 175, 55, .15), transparent 32%),
    linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.02));
  padding: clamp(28px, 4vw, 54px);
  box-shadow: var(--lx-shadow);
}

.luxe-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  border: 1px solid var(--lx-border);
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.08);
  color: var(--lx-primary);
  padding: 9px 13px;
  font-size: 11px;
  font-weight: 950;
  letter-spacing: .18em;
  text-transform: uppercase;
}

.luxe-kicker::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--lx-primary);
  box-shadow: 0 0 0 6px rgba(212, 175, 55, .12);
}

.luxe-title {
  margin: 22px 0 0;
  max-width: 760px;
  color: var(--lx-text);
  font-family: var(--lx-serif);
  font-size: clamp(44px, 6.2vw, 92px);
  font-weight: 600;
  line-height: .94;
  letter-spacing: -.045em;
}

.luxe-text {
  max-width: 660px;
  margin: 22px 0 0;
  color: var(--lx-muted);
  font-size: 15px;
  font-weight: 650;
  line-height: 2.05;
}

.luxe-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.luxe-cta,
.luxe-card-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border: 1px solid var(--lx-border);
  border-radius: 999px;
  background: rgba(255,255,255,.04);
  color: var(--lx-text);
  cursor: pointer;
  padding: 12px 18px;
  font: inherit;
  font-size: 13px;
  font-weight: 950;
  text-decoration: none;
  transition: 220ms ease;
}

.luxe-hero-media {
  position: relative;
  overflow: hidden;
  min-height: 620px;
  border: 1px solid var(--lx-border);
  border-radius: calc(var(--lx-radius) + 14px);
  background:
    linear-gradient(135deg, rgba(212, 175, 55, .12), transparent),
    var(--lx-panel);
  box-shadow: var(--lx-shadow);
}

.luxe-hero-media img {
  width: 100%;
  height: 100%;
  min-height: 620px;
  object-fit: cover;
  filter: saturate(.9) contrast(1.04);
  transform: scale(1.01);
}

.luxe-media-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, transparent 42%, rgba(0,0,0,.78)),
    linear-gradient(90deg, rgba(0,0,0,.42), transparent 45%);
  pointer-events: none;
}

.luxe-media-caption {
  position: absolute;
  inset-inline: 26px;
  bottom: 24px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
}

.luxe-caption-title {
  color: var(--lx-text);
  font-family: var(--lx-serif);
  font-size: 30px;
  line-height: 1.1;
}

.luxe-caption-text {
  margin-top: 7px;
  color: var(--lx-muted);
  font-size: 12px;
  font-weight: 700;
}

.luxe-media-badge {
  border: 1px solid var(--lx-border);
  border-radius: 999px;
  background: rgba(0,0,0,.42);
  color: var(--lx-primary);
  padding: 10px 13px;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 950;
}

.luxe-placeholder {
  display: grid;
  place-items: center;
  min-height: 620px;
  padding: 30px;
  color: var(--lx-muted);
  text-align: center;
  font-weight: 850;
  line-height: 1.9;
}

.luxe-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
}

.luxe-stat {
  border: 1px solid var(--lx-border-soft);
  border-radius: 22px;
  background: rgba(255,255,255,.035);
  padding: 16px;
}

.luxe-stat-value {
  color: var(--lx-primary);
  font-family: var(--lx-serif);
  font-size: 28px;
  font-weight: 700;
}

.luxe-stat-label {
  margin-top: 6px;
  color: var(--lx-muted);
  font-size: 11px;
  font-weight: 850;
}

.luxe-section {
  padding: 34px 0;
}

.luxe-section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 22px;
}

.luxe-section-title {
  margin: 8px 0 0;
  color: var(--lx-text);
  font-family: var(--lx-serif);
  font-size: clamp(32px, 4vw, 56px);
  font-weight: 600;
  line-height: 1;
}

.luxe-section-text {
  max-width: 680px;
  margin: 12px 0 0;
  color: var(--lx-muted);
  font-size: 14px;
  font-weight: 650;
  line-height: 1.95;
}

.luxe-category-strip {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 6px 0 8px;
}

.luxe-category-card {
  min-width: 210px;
  border: 1px solid var(--lx-border-soft);
  border-radius: 24px;
  background:
    radial-gradient(circle at 15% 10%, rgba(212,175,55,.16), transparent 30%),
    rgba(255,255,255,.035);
  padding: 18px;
  transition: 220ms ease;
}

.luxe-category-card:hover {
  transform: translateY(-3px);
  border-color: var(--lx-border);
  background-color: rgba(212,175,55,.07);
}

.luxe-category-index {
  color: var(--lx-primary);
  font-family: var(--lx-serif);
  font-size: 28px;
}

.luxe-category-name {
  margin-top: 14px;
  color: var(--lx-text);
  font-size: 15px;
  font-weight: 950;
}

.luxe-products-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.luxe-product-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--lx-border-soft);
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025));
  min-height: 100%;
  transition: 260ms ease;
}

.luxe-product-card.featured {
  grid-column: span 2;
  grid-row: span 2;
}

.luxe-product-card:hover {
  transform: translateY(-5px);
  border-color: var(--lx-border);
  box-shadow: var(--lx-shadow);
}

.luxe-product-media {
  position: relative;
  aspect-ratio: 1 / 1.15;
  overflow: hidden;
  background: #0d0d0d;
}

.luxe-product-card.featured .luxe-product-media { aspect-ratio: 1 / .72; }

.luxe-product-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(.82) contrast(1.06);
  transition: 420ms ease;
}

.luxe-product-card:hover .luxe-product-media img {
  transform: scale(1.055);
  filter: saturate(1) contrast(1.08);
}

.luxe-product-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 45%, rgba(0,0,0,.74));
}

.luxe-product-wish {
  position: absolute;
  top: 14px;
  inset-inline-end: 14px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px;
  background: rgba(0,0,0,.38);
  color: var(--lx-text);
  cursor: pointer;
  font-size: 17px;
  transition: 200ms ease;
}

.luxe-product-wish.active,
.luxe-product-wish:hover {
  border-color: var(--lx-primary);
  background: var(--lx-primary);
  color: var(--lx-on-primary);
}

.luxe-discount {
  position: absolute;
  top: 14px;
  inset-inline-start: 14px;
  border: 1px solid var(--lx-border);
  border-radius: 999px;
  background: rgba(0,0,0,.45);
  color: var(--lx-primary);
  padding: 8px 11px;
  font-size: 10px;
  font-weight: 950;
}

.luxe-product-body {
  padding: 18px;
}

.luxe-product-category {
  color: var(--lx-primary);
  font-size: 10px;
  font-weight: 950;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.luxe-product-name {
  display: block;
  margin-top: 8px;
  color: var(--lx-text);
  font-family: var(--lx-serif);
  font-size: 23px;
  line-height: 1.1;
  font-weight: 600;
}

.luxe-product-card:not(.featured) .luxe-product-name { font-size: 18px; }

.luxe-product-description {
  display: -webkit-box;
  margin: 10px 0 0;
  overflow: hidden;
  color: var(--lx-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.85;
}

.luxe-product-bottom {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.luxe-price {
  color: var(--lx-primary);
  font-size: 19px;
  font-weight: 950;
}

.luxe-compare {
  margin-top: 2px;
  color: rgba(185,173,148,.72);
  font-size: 12px;
  font-weight: 800;
  text-decoration: line-through;
}

.luxe-card-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  opacity: .92;
  transform: translateY(4px);
  transition: 220ms ease;
}

.luxe-product-card:hover .luxe-card-actions {
  opacity: 1;
  transform: translateY(0);
}

.luxe-card-button {
  min-height: 40px;
  padding: 10px 13px;
  font-size: 12px;
}

.luxe-empty {
  border: 1px dashed var(--lx-border);
  border-radius: 26px;
  background: rgba(255,255,255,.035);
  padding: 38px;
  color: var(--lx-muted);
  text-align: center;
  font-weight: 900;
}

.luxe-story-grid {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  gap: 20px;
  align-items: stretch;
}

.luxe-story-card {
  border: 1px solid var(--lx-border);
  border-radius: 32px;
  background:
    radial-gradient(circle at 10% 10%, rgba(212,175,55,.12), transparent 28%),
    rgba(255,255,255,.035);
  padding: clamp(24px, 4vw, 42px);
}

.luxe-highlights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.luxe-highlight {
  border: 1px solid var(--lx-border-soft);
  border-radius: 18px;
  background: rgba(255,255,255,.035);
  padding: 14px;
  color: var(--lx-text);
  font-size: 13px;
  font-weight: 850;
}

.luxe-footer {
  margin-top: 44px;
  border-top: 1px solid var(--lx-border-soft);
  background: #050505;
  padding: 34px 0;
}

.luxe-footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
}

.luxe-footer-text {
  max-width: 660px;
  margin: 12px 0 0;
  color: var(--lx-muted);
  font-size: 13px;
  font-weight: 650;
  line-height: 1.9;
}

.luxe-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 1050px) {
  .luxe-header-inner {
    grid-template-columns: 1fr;
    justify-items: center;
    padding: 14px 0;
  }

  .luxe-actions { justify-content: center; }
  .luxe-hero-grid,
  .luxe-story-grid { grid-template-columns: 1fr; }
  .luxe-hero-media,
  .luxe-hero-media img,
  .luxe-placeholder { min-height: 450px; }
  .luxe-products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .luxe-product-card.featured { grid-column: span 2; }
}

@media (max-width: 620px) {
  .luxe-shell { width: min(100% - 22px, 1240px); }
  .luxe-announcement { font-size: 9px; letter-spacing: .12em; }
  .luxe-nav.center { overflow-x: auto; width: 100%; justify-content: flex-start; padding-bottom: 4px; }
  .luxe-nav a, .luxe-nav button { padding: 9px 10px; white-space: nowrap; }
  .luxe-brand-name { max-width: 220px; font-size: 19px; }
  .luxe-hero { padding-top: 24px; }
  .luxe-hero-copy { padding: 22px; }
  .luxe-title { font-size: 42px; }
  .luxe-hero-media,
  .luxe-hero-media img,
  .luxe-placeholder { min-height: 320px; }
  .luxe-media-caption { display: block; inset-inline: 18px; bottom: 18px; }
  .luxe-media-badge { display: inline-flex; margin-top: 12px; }
  .luxe-stats { grid-template-columns: 1fr; }
  .luxe-section-head { display: block; }
  .luxe-products-grid { grid-template-columns: 1fr; }
  .luxe-product-card.featured { grid-column: span 1; }
  .luxe-highlights { grid-template-columns: 1fr; }
  .luxe-footer-grid { grid-template-columns: 1fr; }
  .luxe-socials { justify-content: flex-start; }
  .luxe-cta, .luxe-pill-button { width: 100%; }
  .luxe-hero-actions { display: grid; }
}
`;

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value: number | string | null | undefined) {
  return toNumber(value, 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function formatMoney(value: number | string | null | undefined, currency?: string | null) {
  const labels: Record<string, string> = {
    EGP: "ج.م",
    SAR: "ر.س",
    KWD: "د.ك",
    AED: "د.إ",
    USD: "$",
  };

  return `${formatNumber(value)} ${labels[currency || "EGP"] || currency || "ج.م"}`;
}

function resolveMediaUrl(value?: string | null) {
  const url = String(value || "").trim();

  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  return `/${url.replace(/^\/+/, "")}`;
}

function normalizeHexColor(value?: string | null) {
  const color = String(value || "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : "";
}

function getReadableTextColor(backgroundColor: string) {
  const hex = backgroundColor.replace("#", "");
  if (hex.length !== 6) return "#070707";

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 168 ? "#070707" : "#ffffff";
}

function getStoreStyle(store: StorefrontStore): CSSProperties {
  const primaryColor = normalizeHexColor(store.primaryColor);
  const accentColor = normalizeHexColor(store.accentColor);
  const style: Record<string, string> = {};

  if (primaryColor) {
    style["--lx-primary"] = primaryColor;
    style["--lx-on-primary"] = getReadableTextColor(primaryColor);
  }

  if (accentColor) {
    style["--lx-accent"] = accentColor;
  }

  return style as CSSProperties;
}

function getStoreName(store: StorefrontStore) {
  return store.displayName || store.name || "Store";
}

function getStorePageHref(storeSlug: string, value?: string | null, fallback = "/") {
  const raw = String(value || fallback || "/").trim();

  if (!raw || raw === "#" || raw === "#home" || raw === "/") return `/store/${storeSlug}`;
  if (raw === "#about" || raw === "about" || raw === "/about") return `/store/${storeSlug}/about`;
  if (raw === "#products" || raw === "products" || raw === "/products") return `/store/${storeSlug}/products`;
  if (raw === "#contact" || raw === "contact" || raw === "/contact") return `/store/${storeSlug}/contact`;
  if (raw === "wishlist" || raw === "/wishlist") return `/store/${storeSlug}/wishlist`;
  if (raw === "cart" || raw === "/cart") return `/store/${storeSlug}/cart`;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("mailto:") ||
    raw.startsWith("tel:") ||
    raw.startsWith("whatsapp:")
  ) {
    return raw;
  }

  if (raw.startsWith(`/store/${storeSlug}`) || raw.startsWith("/store/")) return raw;
  if (raw.startsWith("/")) return `/store/${storeSlug}${raw}`;

  return `/store/${storeSlug}/${raw.replace(/^\/+/, "")}`;
}

function getFirstImage(product: StorefrontProduct) {
  if (product.imageUrl) return product.imageUrl;

  const cover =
    product.media?.find((item) => item.type === "IMAGE" && item.isCover && item.url) ||
    product.media?.find((item) => item.type === "IMAGE" && item.url) ||
    product.media?.find((item) => item.url);

  return cover?.url || "";
}

function getProductPrice(product: StorefrontProduct) {
  return toNumber(product.price, 0);
}

function getCompareAtPrice(product: StorefrontProduct) {
  return toNumber(product.compareAtPrice, 0);
}

function getProductStock(product: StorefrontProduct) {
  const variants = product.productVariants || product.variants || [];

  if (variants.length > 0) {
    return variants.reduce((sum, variant) => {
      return sum + toNumber(variant.availableQuantity ?? variant.quantity, 0);
    }, 0);
  }

  return toNumber(product.stock, 0);
}

function getDiscountPercent(product: StorefrontProduct) {
  const price = getProductPrice(product);
  const compareAt = getCompareAtPrice(product);
  if (compareAt <= price || compareAt <= 0) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

function getCategories(products: StorefrontProduct[]) {
  const values = products
    .map((product) => String(product.category || "").trim())
    .filter(Boolean);

  return Array.from(new Set(values));
}

function getRating(product: StorefrontProduct) {
  return toNumber(product.ratingAverage, 0);
}

function renderStars(rating: number) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return "★★★★★".split("").map((_, index) => (index < safeRating ? "★" : "☆")).join("");
}

export default function LuxeNoirHome({
  store,
  products,
  content,
  customer = null,
  cartItems = [],
  wishlistItems = [],
  actions,
  isPreview = false,
}: StorefrontTemplateProps) {
  const activeSlide =
    content.heroSlides.find((slide) => slide.isActive !== false) || content.heroSlides[0];

  const heroImageUrl = resolveMediaUrl(activeSlide?.imageUrl || store.coverUrl || store.bannerUrl);
  const logoImageUrl = resolveMediaUrl(store.logoUrl);
  const storeName = getStoreName(store);
  const categories = useMemo(() => getCategories(products), [products]);
  const featuredProducts = products.slice(0, 7);
  const wishlistIds = useMemo(() => new Set(wishlistItems.map((item) => item.productId)), [wishlistItems]);
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const wishlistCount = wishlistItems.length;

  const style = useMemo(() => getStoreStyle(store), [store]);

  return (
    <main
      className="luxe-root"
      dir="rtl"
      data-template="LUXE_NOIR"
      data-preview={isPreview ? "true" : "false"}
      style={style}
    >
      <style>{luxeStyles}</style>

      <div className="luxe-announcement">
        Luxe Noir — تجربة متجر فاخرة للبراندات الراقية
      </div>

      <header className="luxe-header">
        <div className="luxe-shell luxe-header-inner">
          <nav className="luxe-nav center" aria-label="روابط المتجر">
            {content.navigation.showHome && <a href={getStorePageHref(store.slug, "/")}>الرئيسية</a>}
            {content.navigation.showProducts && <a href={getStorePageHref(store.slug, "/products")}>المجموعة</a>}
            {content.navigation.showAbout && <a href={getStorePageHref(store.slug, "/about")}>القصة</a>}
            {content.navigation.showContact && <a href={getStorePageHref(store.slug, "/contact")}>تواصل</a>}
          </nav>

          <a href={`/store/${store.slug}`} className="luxe-brand">
            <span className={`luxe-logo ${logoImageUrl ? "has-image" : ""}`}>
              {logoImageUrl ? <img src={logoImageUrl} alt={storeName} /> : storeName.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <span className="luxe-brand-name">{storeName}</span>
              <span className="luxe-brand-subtitle">Private Collection</span>
            </span>
          </a>

          <div className="luxe-nav luxe-actions">
            {content.navigation.showWishlist && (
              <a href={getStorePageHref(store.slug, "/wishlist")} className="luxe-icon-button" aria-label="المفضلة">
                ♡
                {wishlistCount > 0 && <span className="luxe-count">{wishlistCount}</span>}
              </a>
            )}

            {content.navigation.showCart && (
              <a href={getStorePageHref(store.slug, "/cart")} className="luxe-icon-button" aria-label="السلة">
                🛍
                {cartCount > 0 && <span className="luxe-count">{cartCount}</span>}
              </a>
            )}

            {content.navigation.showLogin &&
              (customer ? (
                <a href={`/store/${store.slug}/account`} className="luxe-pill-button primary">حسابي</a>
              ) : (
                <a
                  href={`/store/${store.slug}/login?next=${encodeURIComponent(`/store/${store.slug}`)}`}
                  className="luxe-pill-button"
                >
                  دخول
                </a>
              ))}
          </div>
        </div>
      </header>

      <section className="luxe-hero">
        <div className="luxe-shell luxe-hero-grid">
          <div className="luxe-hero-copy">
            <span className="luxe-kicker">Signature Storefront</span>
            <h1 className="luxe-title">{activeSlide?.title || storeName}</h1>
            <p className="luxe-text">
              {activeSlide?.subtitle || store.description || "واجهة فاخرة، صور واسعة، ومساحات هادئة تجعل المنتج هو بطل التجربة."}
            </p>

            <div className="luxe-hero-actions">
              {activeSlide?.buttonText && (
                <a href={getStorePageHref(store.slug, activeSlide.buttonLink, "/products")} className="luxe-cta primary">
                  {activeSlide.buttonText}
                </a>
              )}
              <a href={getStorePageHref(store.slug, "/about")} className="luxe-cta">
                قصة البراند
              </a>
            </div>

            <div className="luxe-stats">
              <div className="luxe-stat">
                <div className="luxe-stat-value">{formatNumber(products.length)}</div>
                <div className="luxe-stat-label">قطعة مختارة</div>
              </div>
              <div className="luxe-stat">
                <div className="luxe-stat-value">{formatNumber(categories.length || 1)}</div>
                <div className="luxe-stat-label">مجموعات راقية</div>
              </div>
              <div className="luxe-stat">
                <div className="luxe-stat-value">24/7</div>
                <div className="luxe-stat-label">تجربة شراء مميزة</div>
              </div>
            </div>
          </div>

          <div className="luxe-hero-media">
            {heroImageUrl ? (
              <img src={heroImageUrl} alt={activeSlide?.title || storeName} />
            ) : (
              <div className="luxe-placeholder">
                أضف صورة غلاف فاخرة من لوحة التحكم لتظهر هنا بكامل عرض القالب.
              </div>
            )}
            <div className="luxe-media-overlay" />
            <div className="luxe-media-caption">
              <div>
                <div className="luxe-caption-title">Curated Luxury</div>
                <div className="luxe-caption-text">صور كبيرة، حضور هادئ، وتركيز كامل على المنتج.</div>
              </div>
              <span className="luxe-media-badge">Limited Selection</span>
            </div>
          </div>
        </div>
      </section>

      {content.homeSections.showCategories && categories.length > 0 && (
        <section className="luxe-section">
          <div className="luxe-shell">
            <div className="luxe-section-head">
              <div>
                <span className="luxe-kicker">Collections</span>
                <h2 className="luxe-section-title">مجموعات مختارة</h2>
                <p className="luxe-section-text">تصفح الأقسام بأسلوب بطاقات فاخرة بدل chips تقليدية.</p>
              </div>
              <a href={getStorePageHref(store.slug, "/products")} className="luxe-cta">كل المنتجات</a>
            </div>

            <div className="luxe-category-strip">
              {categories.slice(0, 8).map((category, index) => (
                <a
                  key={category}
                  className="luxe-category-card"
                  href={`${getStorePageHref(store.slug, "/products")}?category=${encodeURIComponent(category)}`}
                >
                  <div className="luxe-category-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="luxe-category-name">{category}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="luxe-section">
        <div className="luxe-shell">
          <div className="luxe-section-head">
            <div>
              <span className="luxe-kicker">Signature Selection</span>
              <h2 className="luxe-section-title">منتجات بتقديم Editorial</h2>
              <p className="luxe-section-text">
                قالب Luxe Noir يعرض المنتجات بعدد أقل، صور أكبر، وتفاصيل أهدأ تناسب العطور والهدايا والمنتجات الفخمة.
              </p>
            </div>
            <a href={getStorePageHref(store.slug, "/products")} className="luxe-cta primary">عرض المجموعة</a>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="luxe-empty">لا توجد منتجات متاحة حاليًا.</div>
          ) : (
            <div className="luxe-products-grid">
              {featuredProducts.map((product, index) => (
                <LuxeProductCard
                  key={product.id}
                  store={store}
                  product={product}
                  featured={index === 0}
                  isWishlisted={wishlistIds.has(product.id)}
                  onToggleWishlist={() => actions?.toggleWishlist?.(product)}
                  onAddToCart={() => actions?.addToCart?.(product, null)}
                  onQuickView={() => actions?.openProductQuickView?.(product)}
                  showWishlist={content.productDisplay.showWishlist}
                  showDiscount={content.productDisplay.showDiscountBadge}
                  showCategory={content.productDisplay.showCategory}
                  showRatings={content.reviewSettings.enabled && content.productDisplay.showRatings}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {content.homeSections.showAbout && content.aboutSection.enabled && (
        <section className="luxe-section">
          <div className="luxe-shell luxe-story-grid">
            <div className="luxe-story-card">
              <span className="luxe-kicker">Brand Story</span>
              <h2 className="luxe-section-title">{content.aboutSection.title}</h2>
              <p className="luxe-section-text">{content.aboutSection.description}</p>
              <div className="luxe-hero-actions">
                <a href={getStorePageHref(store.slug, "/about")} className="luxe-cta primary">اقرأ القصة كاملة</a>
                <a href={getStorePageHref(store.slug, "/contact")} className="luxe-cta">تواصل معنا</a>
              </div>
            </div>

            <div className="luxe-story-card">
              <span className="luxe-kicker">Details Matter</span>
              <div className="luxe-highlights">
                {content.aboutSection.highlights.slice(0, 6).map((item, index) => (
                  <div key={`${item}-${index}`} className="luxe-highlight">✓ {item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="luxe-footer">
        <div className="luxe-shell luxe-footer-grid">
          <div>
            <a href={`/store/${store.slug}`} className="luxe-brand" style={{ justifyItems: "start" }}>
              <span className={`luxe-logo ${logoImageUrl ? "has-image" : ""}`}>
                {logoImageUrl ? <img src={logoImageUrl} alt={storeName} /> : storeName.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <span className="luxe-brand-name">{storeName}</span>
                <span className="luxe-brand-subtitle">Luxury Storefront</span>
              </span>
            </a>
            <p className="luxe-footer-text">{content.footerSettings.text}</p>
            {content.footerSettings.showContactInfo && (
              <p className="luxe-footer-text">
                {[store.phone || store.whatsapp, store.email || store.contactEmail].filter(Boolean).join(" — ") ||
                  "بيانات التواصل تظهر هنا عند إضافتها من لوحة التحكم."}
              </p>
            )}
          </div>

          <div className="luxe-socials">
            {content.footerSettings.showSocialLinks && store.facebook && <a className="luxe-icon-button" href={store.facebook}>f</a>}
            {content.footerSettings.showSocialLinks && store.instagram && <a className="luxe-icon-button" href={store.instagram}>◎</a>}
            {content.footerSettings.showSocialLinks && store.tiktok && <a className="luxe-icon-button" href={store.tiktok}>♪</a>}
            {content.footerSettings.showPoweredByMizar && <a href="/" className="luxe-pill-button primary">صنع بواسطة ميزار</a>}
          </div>
        </div>
      </footer>
    </main>
  );
}

function LuxeProductCard({
  store,
  product,
  featured,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  showWishlist,
  showDiscount,
  showCategory,
  showRatings,
}: {
  store: StorefrontStore;
  product: StorefrontProduct;
  featured: boolean;
  isWishlisted: boolean;
  onToggleWishlist?: () => void;
  onAddToCart?: () => void;
  onQuickView?: () => void;
  showWishlist: boolean;
  showDiscount: boolean;
  showCategory: boolean;
  showRatings: boolean;
}) {
  const imageUrl = resolveMediaUrl(getFirstImage(product));
  const price = getProductPrice(product);
  const compareAt = getCompareAtPrice(product);
  const discount = getDiscountPercent(product);
  const rating = getRating(product);
  const stock = getProductStock(product);
  const productUrl = `/store/${store.slug}/product/${product.id}`;

  return (
    <article className={`luxe-product-card ${featured ? "featured" : ""}`}>
      <a href={productUrl} className="luxe-product-media">
        {imageUrl ? <img src={imageUrl} alt={product.name} /> : <div className="luxe-placeholder">صورة المنتج</div>}
        <span className="luxe-product-fade" />
      </a>

      {showWishlist && (
        <button
          type="button"
          onClick={onToggleWishlist}
          className={`luxe-product-wish ${isWishlisted ? "active" : ""}`}
          aria-label="إضافة للمفضلة"
        >
          ♥
        </button>
      )}

      {showDiscount && discount > 0 && <span className="luxe-discount">خصم {discount}%</span>}

      <div className="luxe-product-body">
        {showCategory && product.category && <p className="luxe-product-category">{product.category}</p>}
        <a href={productUrl} className="luxe-product-name">{product.name}</a>

        {product.description && <p className="luxe-product-description">{product.description}</p>}

        {showRatings && rating > 0 && (
          <p className="luxe-product-description" style={{ color: "var(--lx-primary)" }}>
            {renderStars(rating)}
          </p>
        )}

        <div className="luxe-product-bottom">
          <div>
            <div className="luxe-price">{formatMoney(price, store.currency)}</div>
            {compareAt > price && <div className="luxe-compare">{formatMoney(compareAt, store.currency)}</div>}
          </div>
          <div className="luxe-product-description" style={{ margin: 0, textAlign: "end" }}>
            {stock > 0 ? "متوفر" : "غير متوفر"}
          </div>
        </div>

        <div className="luxe-card-actions">
          <button type="button" onClick={onAddToCart} className="luxe-card-button primary" disabled={stock <= 0}>
            إضافة للسلة
          </button>
          <button type="button" onClick={onQuickView} className="luxe-card-button">
            معاينة
          </button>
        </div>
      </div>
    </article>
  );
}
