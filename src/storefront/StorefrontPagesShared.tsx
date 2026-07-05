"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type StorefrontTemplateKey =
  | "MIZAR_PREMIUM"
  | "MIZAR_MODERN"
  | "LUXE_NOIR"
  | "SOFT_BOUTIQUE"
  | "BAZAAR_CARDS"
  | "TECH_MINIMAL";

export type PublicStore = {
  id?: string;
  name?: string | null;
  displayName?: string | null;
  tagline?: string | null;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  template?: string | null;
  templateConfig?: Record<string, any> | string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  currency?: string | null;
  whatsapp?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  shippingFee?: number | string | null;
  shippingPolicy?: string | null;
};

export type StorefrontContent = {
  templateKey?: string | null;
  language?: "ar" | "en" | null;
  locale?: "ar" | "en" | null;
  defaultLocale?: "ar" | "en" | null;
  heroSlides?: Array<{
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    primaryButtonText?: string | null;
    primaryButtonHref?: string | null;
    secondaryButtonText?: string | null;
    secondaryButtonHref?: string | null;
  }> | null;
  aboutSection?: {
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    imageUrl?: string | null;
  } | null;
  footerSettings?: Record<string, unknown> | null;
  navigation?: Array<{ label?: string | null; href?: string | null }> | null;
};

export type StorefrontMedia = {
  id?: string;
  url?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  type?: string | null;
};

export type StorefrontVariant = {
  id?: string;
  title?: string | null;
  name?: string | null;
  sku?: string | null;
  price?: number | string | null;
  stock?: number | string | null;
  quantity?: number | string | null;
  availableQuantity?: number | string | null;
  status?: string | null;
  selectedOptions?: Record<string, string> | null;
  options?: Record<string, string> | null;
};

export type StorefrontProduct = {
  id: string;
  slug?: string | null;
  name: string;
  title?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  category?: string | null;
  price?: number | string | null;
  discountPrice?: number | string | null;
  compareAtPrice?: number | string | null;
  currency?: string | null;
  imageUrl?: string | null;
  coverUrl?: string | null;
  media?: StorefrontMedia[] | null;
  images?: string[] | null;
  productVariants?: StorefrontVariant[] | null;
  variants?: StorefrontVariant[] | null;
  stock?: number | string | null;
  availableStock?: number | string | null;
  status?: string | null;
  isFeatured?: boolean | null;
  ratingAverage?: number | string | null;
  reviewsCount?: number | string | null;
};

export type StorefrontResponse = {
  [key: string]: any;
  success?: boolean;
  message?: string;
  store?: PublicStore | null;
  content?: StorefrontContent | null;
  storefrontContent?: StorefrontContent | null;
  products?: StorefrontProduct[] | null;
  featuredProducts?: StorefrontProduct[] | null;
  latestProducts?: StorefrontProduct[] | null;
  bestSellerProducts?: StorefrontProduct[] | null;
  bestSellers?: StorefrontProduct[] | null;
  newArrivalProducts?: StorefrontProduct[] | null;
  newArrivals?: StorefrontProduct[] | null;
  discountedProducts?: StorefrontProduct[] | null;
  categories?: string[] | null;
  templateKey?: string | null;
};

export type StorefrontPageData = {
  [key: string]: any;
  loading: boolean;
  error: string;
  store: PublicStore | null;
  content: StorefrontContent | null;
  templateKey: StorefrontTemplateKey;
  products: StorefrontProduct[];
  featuredProducts: StorefrontProduct[];
  latestProducts: StorefrontProduct[];
  bestSellerProducts: StorefrontProduct[];
  newArrivalProducts: StorefrontProduct[];
  categories: string[];
  refresh: () => Promise<void>;
};


export type StoreLocale = "ar" | "en";

export const STORE_TEXT = {
  ar: {
    nav: {
      home: "الرئيسية",
      products: "المجموعة",
      about: "قصتنا",
      contact: "تواصل",
      wishlist: "المفضلة",
      cart: "السلة",
      login: "دخول",
    },
    common: {
      curatedStore: "متجر مختار",
      mizarStore: "متجر ميزار",
      languageButton: "EN",
      languageAria: "تغيير اللغة إلى الإنجليزية",
      decorator: "متجر عربي فاخر",
      powered: "Powered by MIZAR",
      add: "إضافة",
      wishlist: "♡",
      productImageHint: "أضف صورة للمنتج من لوحة التحكم ليظهر بشكل أجمل داخل القالب.",
      collection: "مجموعة",
      selected: "مختارات",
      loadingTitle: "جاري تجهيز المتجر...",
      loadingText: "لحظات ونفتح لك تجربة التسوق.",
      errorTitle: "تعذر فتح المتجر",
      dashboardProducts: "إضافة منتجات",
    },
    footer: {
      title: "تجربة تسوق هادئة\nومنتجات مختارة بعناية",
      text: "اكتشف مجموعة مختارة من المنتجات المصممة لتناسب ذوقك، مع تجربة شراء عربية سهلة وواضحة.",
      products: "تصفح المنتجات",
      about: "عن المتجر",
      contact: "تواصل معنا",
    },
    home: {
      heroTitle: "فن الاختيار الهادئ",
      heroSubtitle: "متجر مختار",
      heroDescription: "منتجات مختارة بعناية لتجربة شراء أنيقة، واضحة، ومريحة من أول زيارة حتى إتمام الطلب.",
      heroPrimary: "استكشف المجموعة",
      heroSecondary: "عن المتجر",
      heroTag: "مجموعة مختارة / تجربة عربية",
      productCount: "منتج متاح",
      categoryCount: "تصنيف مختار",
      support: "تجربة شراء سهلة",
      lookbookTitle: "دفتر الإلهام",
      lookbookText: "لقطات سريعة من أحدث المنتجات داخل المتجر، بتصميم أفقي ناعم مناسب للصور والمنتجات المختارة.",
      noProductsTitle: "لا توجد منتجات بعد",
      noProductsText: "أضف منتجات من لوحة التحكم ليظهر دفتر الإلهام هنا.",
      selectedTitle: "قطع مختارة",
      selectedText: "منتجات مميزة تظهر في الصفحة الرئيسية فقط، والعميل يقدر يفتح صفحة المنتجات لعرض المجموعة كاملة.",
      viewAll: "عرض كل المنتجات",
      firstCollectionTitle: "ابدأ مجموعتك الأولى",
      firstCollectionText: "بعد إضافة المنتجات ستظهر هنا بكروت أنيقة ومناسبة لهوية المتجر.",
      storyEyebrow: "قصة المتجر",
      storyTitle: "كل منتج له إحساس، وكل اختيار له معنى.",
      storyFallback: "اكتب قصة المتجر من لوحة التحكم، وسنحولها إلى مساحة سردية بسيطة تساعد العميل يفهم هوية البراند قبل الشراء.",
      readStory: "اقرأ قصة المتجر",
      steps: ["اختيار", "تجهيز", "تغليف", "توصيل"],
      stepText: "خطوة مصممة لتجربة شراء واضحة وراقية من تصفح المنتج حتى وصول الطلب.",
      coverHint: "أضف صورة غلاف للمتجر من لوحة التحكم لتظهر هنا بنفس إحساس القالب.",
    },
    pages: {
      productsTitle: "كل المنتجات",
      productsSubtitle: "تصفح المجموعة الكاملة، وابحث حسب الاسم أو التصنيف أو السعر.",
      searchPlaceholder: "ابحث عن منتج...",
      allCategories: "كل التصنيفات",
      sortLatest: "الأحدث",
      sortPriceLow: "الأقل سعرًا",
      sortPriceHigh: "الأعلى سعرًا",
      sortName: "الاسم",
      noProducts: "لا توجد منتجات مطابقة",
      noProductsText: "جرّب تغيير البحث أو التصنيف المختار.",
      aboutTitle: "قصة المتجر",
      aboutSubtitle: "تعرف على هوية المتجر، طريقة اختيار المنتجات، وتجربة الشراء التي نقدمها لك.",
      aboutFallback: "اكتب نبذة عن المتجر من لوحة التحكم لتظهر هنا بشكل أنيق ومتوافق مع هوية القالب.",
      contactTitle: "تواصل معنا",
      contactSubtitle: "نحن هنا لمساعدتك في أي استفسار قبل أو بعد الطلب.",
      contactInfo: "بيانات التواصل",
      wishlistTitle: "المفضلة",
      wishlistSubtitle: "منتجات احتفظت بها للرجوع إليها لاحقًا.",
      emptyWishlist: "المفضلة فارغة",
      emptyWishlistText: "اضغط على علامة القلب في أي منتج ليظهر هنا.",
      backProducts: "تصفح المنتجات",
      loginTitle: "تسجيل الدخول",
      loginSubtitle: "ادخل إلى حسابك لمتابعة الطلبات والمفضلة.",
      registerTitle: "إنشاء حساب",
      registerSubtitle: "أنشئ حسابًا جديدًا لتجربة شراء أسرع.",
    },
  },
  en: {
    nav: {
      home: "Home",
      products: "Collection",
      about: "Our Story",
      contact: "Contact",
      wishlist: "Wishlist",
      cart: "Cart",
      login: "Login",
    },
    common: {
      curatedStore: "CURATED STORE",
      mizarStore: "MIZAR STORE",
      languageButton: "AR",
      languageAria: "Switch language to Arabic",
      decorator: "Premium online store",
      powered: "Powered by MIZAR",
      add: "Add",
      wishlist: "♡",
      productImageHint: "Add a product image from the dashboard to make this card look better.",
      collection: "Collection",
      selected: "Selected",
      loadingTitle: "Preparing the store...",
      loadingText: "Just a moment while we open the shopping experience.",
      errorTitle: "Could not open store",
      dashboardProducts: "Add Products",
    },
    footer: {
      title: "A quiet shopping experience\nwith carefully curated products",
      text: "Discover a curated collection of products designed around your taste, with a clear and comfortable shopping experience.",
      products: "Browse Products",
      about: "About Store",
      contact: "Contact Us",
    },
    home: {
      heroTitle: "The Art of Quiet Selection",
      heroSubtitle: "Curated Store",
      heroDescription: "Carefully selected products for an elegant, clear, and comfortable shopping experience from first visit to checkout.",
      heroPrimary: "Explore Collection",
      heroSecondary: "About Store",
      heroTag: "Curated Collection / Premium Experience",
      productCount: "Products",
      categoryCount: "Categories",
      support: "Easy shopping",
      lookbookTitle: "The Lookbook",
      lookbookText: "A calm horizontal showcase for the latest products and curated visuals in your store.",
      noProductsTitle: "No products yet",
      noProductsText: "Add products from the dashboard to show the lookbook here.",
      selectedTitle: "Selected Pieces",
      selectedText: "Featured products appear on the homepage, while customers can open the products page to view the full collection.",
      viewAll: "View All Products",
      firstCollectionTitle: "Start Your First Collection",
      firstCollectionText: "After adding products, they will appear here with elegant cards that match the store identity.",
      storyEyebrow: "Store Story",
      storyTitle: "Every product has a feeling, and every choice has meaning.",
      storyFallback: "Write your store story from the dashboard and we will present it as a simple editorial section before purchase.",
      readStory: "Read Store Story",
      steps: ["Select", "Prepare", "Pack", "Deliver"],
      stepText: "A step designed for a clear and refined shopping experience from product browsing to delivery.",
      coverHint: "Add a store cover image from the dashboard to show it here with the template mood.",
    },
    pages: {
      productsTitle: "All Products",
      productsSubtitle: "Browse the full collection and filter by search, category, or price.",
      searchPlaceholder: "Search products...",
      allCategories: "All categories",
      sortLatest: "Latest",
      sortPriceLow: "Lowest price",
      sortPriceHigh: "Highest price",
      sortName: "Name",
      noProducts: "No matching products",
      noProductsText: "Try changing the search or selected category.",
      aboutTitle: "Our Story",
      aboutSubtitle: "Learn about the store identity, product curation, and the shopping experience we provide.",
      aboutFallback: "Write a store description from the dashboard to display it here in an elegant template-aware layout.",
      contactTitle: "Contact Us",
      contactSubtitle: "We are here to help with any question before or after your order.",
      contactInfo: "Contact Information",
      wishlistTitle: "Wishlist",
      wishlistSubtitle: "Products saved for later.",
      emptyWishlist: "Wishlist is empty",
      emptyWishlistText: "Tap the heart on any product and it will appear here.",
      backProducts: "Browse Products",
      loginTitle: "Login",
      loginSubtitle: "Access your account to follow orders and wishlist items.",
      registerTitle: "Create Account",
      registerSubtitle: "Create a new account for faster shopping.",
    },
  },
} as const;

export function normalizeLocale(value?: string | null): StoreLocale {
  const locale = String(value || "").trim().toLowerCase();
  return locale === "en" || locale === "english" ? "en" : "ar";
}

export function getStoreDefaultLocale(store?: PublicStore | null, content?: StorefrontContent | null): StoreLocale {
  const templateConfig = parseTemplateConfig(store?.templateConfig || null);

  return normalizeLocale(
    content?.language ||
      content?.locale ||
      content?.defaultLocale ||
      templateConfig.language ||
      templateConfig.locale ||
      templateConfig.defaultLocale ||
      "ar",
  );
}

export function getLocaleText(locale: StoreLocale) {
  return STORE_TEXT[locale] || STORE_TEXT.ar;
}

export function useStoreLocale(store?: PublicStore | null, content?: StorefrontContent | null): StoreLocale {
  const fallback = getStoreDefaultLocale(store, content);
  const [locale, setLocale] = useState<StoreLocale>(fallback);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = normalizeLocale(params.get("lang"));
    const rawUrl = params.get("lang");
    const rawSaved = window.localStorage.getItem("mizar-store-locale");
    const fromSaved = rawSaved ? normalizeLocale(rawSaved) : null;
    const nextLocale = rawUrl ? fromUrl : fromSaved || fallback;
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
  }, [fallback]);

  return locale;
}

export function switchStoreLocale(nextLocale: StoreLocale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("mizar-store-locale", nextLocale);
  const url = new URL(window.location.href);
  url.searchParams.set("lang", nextLocale);
  window.location.href = url.toString();
}

export const ivoryStoreStyles = `
:root {
  --ivory-oat-default: #fcfaf8;
}

.ivory-root {
  --ivory-oat: #fcfaf8;
  --ivory-oat-mid: #f5f0eb;
  --ivory-oat-deep: #ede6dd;
  --ivory-terra: #d96c4a;
  --ivory-terra-soft: rgba(217, 108, 74, 0.12);
  --ivory-terra-ghost: rgba(217, 108, 74, 0.06);
  --ivory-olive: #6f7357;
  --ivory-ink: #1a1714;
  --ivory-ink-soft: #3d3832;
  --ivory-muted: #8a8279;
  --ivory-faint: #b8b0a6;
  --ivory-white: #ffffff;
  --ivory-radius: 32px;
  --ivory-shadow: 0 22px 70px rgba(26, 23, 20, 0.08);
  --ivory-ease: cubic-bezier(0.23, 1, 0.32, 1);
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--ivory-terra) 8%, transparent), transparent 28%),
    linear-gradient(180deg, var(--ivory-oat), var(--ivory-oat-mid));
  color: var(--ivory-ink);
  font-family: "Tajawal", "Cairo", "IBM Plex Sans Arabic", "Segoe UI", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.ivory-root * { box-sizing: border-box; }
.ivory-root a { color: inherit; text-decoration: none; }
.ivory-root img { display: block; max-width: 100%; }
.ivory-root button, .ivory-root input, .ivory-root textarea, .ivory-root select { font: inherit; }
.ivory-root[data-locale="en"] { font-family: "Manrope", "Inter", "Segoe UI", Arial, sans-serif; }
.ivory-root[data-locale="en"] .ivory-display,
.ivory-root[data-locale="en"] .ivory-section-title,
.ivory-root[data-locale="en"] .ivory-footer-title { font-family: "Cormorant Garamond", Georgia, serif; letter-spacing: -0.035em; }
.ivory-language-toggle { position: fixed; left: 22px; top: 22px; z-index: 1005; display: inline-flex; align-items: center; justify-content: center; min-width: 46px; height: 46px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--ivory-ink) 10%, transparent); background: color-mix(in srgb, var(--ivory-oat) 78%, transparent); backdrop-filter: blur(18px); color: var(--ivory-ink); cursor: pointer; font-family: "DM Mono", ui-monospace, monospace; font-size: 11px; font-weight: 800; letter-spacing: .08em; box-shadow: 0 8px 24px rgba(26,23,20,.06); }
.ivory-root[dir="ltr"] .ivory-language-toggle { left: auto; right: 22px; }

.ivory-root[data-template="LUXE_NOIR"] {
  --ivory-oat: #fcfaf8;
  --ivory-oat-mid: #f4eee7;
  --ivory-oat-deep: #e7d9cc;
  --ivory-terra: #c86445;
  --ivory-olive: #6d704f;
  --ivory-ink: #181512;
  --ivory-muted: #7f766d;
}

.ivory-root[data-template="SOFT_BOUTIQUE"] {
  --ivory-oat: #fff8f4;
  --ivory-oat-mid: #f8ece5;
  --ivory-oat-deep: #efd8ce;
  --ivory-terra: #d98578;
  --ivory-olive: #9a7f70;
  --ivory-ink: #392a26;
  --ivory-muted: #8f746b;
}

.ivory-root[data-template="BAZAAR_CARDS"] {
  --ivory-oat: #fffdf5;
  --ivory-oat-mid: #f5f0df;
  --ivory-oat-deep: #e8dfc4;
  --ivory-terra: #e0703f;
  --ivory-olive: #47735d;
  --ivory-ink: #17251f;
  --ivory-muted: #68786e;
}

.ivory-root[data-template="TECH_MINIMAL"] {
  --ivory-oat: #f8fafc;
  --ivory-oat-mid: #eef2f7;
  --ivory-oat-deep: #dbe3ee;
  --ivory-terra: #2563eb;
  --ivory-olive: #0891b2;
  --ivory-ink: #0f172a;
  --ivory-muted: #64748b;
}

.ivory-shell {
  width: min(1220px, calc(100% - 44px));
  margin: 0 auto;
}

.ivory-decorator {
  position: fixed;
  right: 20px;
  top: 50%;
  z-index: 50;
  transform: translateY(-50%) rotate(90deg);
  transform-origin: center;
  color: var(--ivory-faint);
  font-family: "DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  pointer-events: none;
  white-space: nowrap;
}

.ivory-pill-nav {
  position: fixed;
  top: 18px;
  left: 50%;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 4px;
  width: max-content;
  max-width: min(calc(100% - 34px), 850px);
  overflow-x: auto;
  transform: translateX(-50%);
  border: 1px solid rgba(26, 23, 20, 0.07);
  border-radius: 999px;
  background: color-mix(in srgb, var(--ivory-oat) 76%, transparent);
  box-shadow: 0 12px 34px rgba(26, 23, 20, 0.07);
  padding: 7px;
  backdrop-filter: blur(20px);
  scrollbar-width: none;
}

.ivory-pill-nav::-webkit-scrollbar { display: none; }

.ivory-pill-link,
.ivory-pill-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 35px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ivory-ink-soft);
  padding: 8px 15px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  white-space: nowrap;
  cursor: pointer;
  transition: background .5s var(--ivory-ease), color .5s var(--ivory-ease), transform .5s var(--ivory-ease);
}

.ivory-pill-link:hover,
.ivory-pill-button:hover {
  color: var(--ivory-ink);
  transform: translateY(-1px);
}

.ivory-pill-link.active,
.ivory-pill-button.active {
  background: var(--ivory-ink);
  color: var(--ivory-oat);
}

.ivory-mobile-toggle {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 151;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(26, 23, 20, 0.08);
  border-radius: 50%;
  background: color-mix(in srgb, var(--ivory-oat) 82%, transparent);
  box-shadow: 0 12px 28px rgba(26, 23, 20, 0.08);
  cursor: pointer;
  backdrop-filter: blur(18px);
}

.ivory-mobile-toggle span,
.ivory-mobile-toggle::before,
.ivory-mobile-toggle::after {
  content: "";
  position: absolute;
  right: 14px;
  width: 18px;
  height: 1.6px;
  background: var(--ivory-ink);
  transition: transform .45s var(--ivory-ease), opacity .3s var(--ivory-ease);
}
.ivory-mobile-toggle::before { top: 16px; }
.ivory-mobile-toggle span { top: 22px; }
.ivory-mobile-toggle::after { top: 28px; }
.ivory-mobile-toggle.open::before { transform: translateY(6px) rotate(45deg); }
.ivory-mobile-toggle.open span { opacity: 0; }
.ivory-mobile-toggle.open::after { transform: translateY(-6px) rotate(-45deg); }

.ivory-mobile-panel {
  position: fixed;
  inset: 0;
  z-index: 140;
  display: grid;
  place-items: center;
  gap: 22px;
  padding: 86px 28px 32px;
  background: color-mix(in srgb, var(--ivory-oat) 96%, transparent);
  backdrop-filter: blur(24px);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-12px);
  transition: opacity .45s var(--ivory-ease), transform .45s var(--ivory-ease);
}
.ivory-mobile-panel.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
.ivory-mobile-panel a, .ivory-mobile-panel button {
  border: 0;
  background: transparent;
  color: var(--ivory-ink);
  font-family: "Noto Naskh Arabic", "Amiri", serif;
  font-size: 30px;
  font-weight: 600;
  cursor: pointer;
}

.ivory-header-brand {
  position: fixed;
  top: 76px;
  left: 50%;
  z-index: 60;
  display: grid;
  place-items: center;
  gap: 8px;
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
}
.ivory-brand-logo {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  overflow: hidden;
  border: 1px solid var(--ivory-oat-deep);
  border-radius: 50%;
  background: var(--ivory-ink);
  color: var(--ivory-oat);
  font-weight: 950;
  box-shadow: 0 10px 30px rgba(26, 23, 20, 0.12);
}
.ivory-brand-logo.has-image {
  overflow: visible;
  border: 0;
  background: transparent;
  box-shadow: none;
}
.ivory-brand-logo img { width: 100%; height: 100%; object-fit: contain; }
.ivory-brand-name {
  color: var(--ivory-ink);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.02em;
}
.ivory-brand-tagline {
  color: var(--ivory-muted);
  font-family: "DM Mono", ui-monospace, monospace;
  font-size: 8px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.ivory-cta,
.ivory-cta-dark,
.ivory-cta-light {
  position: relative;
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  background: transparent;
  color: var(--ivory-terra);
  padding: 0 0 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-decoration: none;
}
.ivory-cta::after,
.ivory-cta-dark::after,
.ivory-cta-light::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 50%;
  width: 0;
  height: 1.5px;
  background: currentColor;
  transition: width .7s var(--ivory-ease), right .7s var(--ivory-ease);
}
.ivory-cta:hover::after,
.ivory-cta-dark:hover::after,
.ivory-cta-light:hover::after { width: 100%; right: 0; }
.ivory-cta-dark { color: var(--ivory-ink); }
.ivory-cta-light { color: var(--ivory-oat); }

.ivory-solid-button,
.ivory-ghost-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 46px;
  border-radius: 999px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  border: 1px solid transparent;
  transition: transform .45s var(--ivory-ease), box-shadow .45s var(--ivory-ease), background .45s var(--ivory-ease), color .45s var(--ivory-ease), border-color .45s var(--ivory-ease);
}
.ivory-solid-button {
  background: var(--ivory-ink);
  color: var(--ivory-oat);
  border-color: var(--ivory-ink);
}
.ivory-ghost-button {
  background: transparent;
  color: var(--ivory-ink);
  border-color: color-mix(in srgb, var(--ivory-ink) 14%, transparent);
}
.ivory-solid-button:hover,
.ivory-ghost-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(26, 23, 20, 0.10);
}
.ivory-ghost-button:hover { background: var(--ivory-ink); color: var(--ivory-oat); }

.ivory-page { padding: 164px 0 72px; }
.ivory-page-tight { padding-top: 128px; }

.ivory-hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, .92fr);
  background: var(--ivory-oat);
}
.ivory-hero-media {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--ivory-oat-deep);
}
.ivory-hero-media img { width: 100%; height: 100%; object-fit: cover; }
.ivory-hero-media-placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  min-height: 100vh;
  padding: 42px;
  color: var(--ivory-muted);
  text-align: center;
  font-size: 14px;
  line-height: 1.9;
  background:
    radial-gradient(circle at 20% 20%, var(--ivory-terra-soft), transparent 28%),
    var(--ivory-oat-mid);
}
.ivory-hero-tag {
  position: absolute;
  right: 32px;
  bottom: 32px;
  background: rgba(26, 23, 20, 0.38);
  color: var(--ivory-white);
  backdrop-filter: blur(10px);
  padding: 8px 14px;
  font-family: "DM Mono", ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.ivory-hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 150px 64px 80px;
}
.ivory-eyebrow {
  color: var(--ivory-terra);
  font-family: "DM Mono", ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .28em;
  text-transform: uppercase;
  margin-bottom: 26px;
}
.ivory-display {
  margin: 0;
  color: var(--ivory-ink);
  font-family: "Noto Naskh Arabic", "Amiri", "Cormorant Garamond", serif;
  font-size: clamp(48px, 6vw, 104px);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -.045em;
}
.ivory-display em { color: var(--ivory-terra); font-style: normal; }
.ivory-lead {
  max-width: 560px;
  margin: 26px 0 0;
  color: var(--ivory-muted);
  font-size: 16px;
  font-weight: 500;
  line-height: 2;
}
.ivory-hero-actions { display: flex; flex-wrap: wrap; gap: 24px; align-items: center; margin-top: 36px; }
.ivory-mini-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 44px; max-width: 600px; }
.ivory-mini-stat { border-top: 1px solid var(--ivory-oat-deep); padding-top: 16px; }
.ivory-mini-stat strong { display: block; color: var(--ivory-ink); font-family: "DM Mono", ui-monospace, monospace; font-size: 20px; }
.ivory-mini-stat span { display: block; margin-top: 4px; color: var(--ivory-muted); font-size: 12px; font-weight: 700; }

.ivory-section { padding: 92px 0; }
.ivory-section.alt { background: var(--ivory-oat-mid); }
.ivory-section.dark { background: var(--ivory-ink); color: var(--ivory-oat); }
.ivory-section-head { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 36px; }
.ivory-section-title {
  margin: 0;
  color: inherit;
  font-family: "Noto Naskh Arabic", "Amiri", serif;
  font-size: clamp(32px, 4vw, 58px);
  font-weight: 500;
  line-height: 1.18;
  letter-spacing: -.025em;
}
.ivory-section-subtitle {
  max-width: 540px;
  color: var(--ivory-muted);
  font-size: 15px;
  line-height: 1.9;
  font-weight: 500;
}
.ivory-section.dark .ivory-section-subtitle { color: color-mix(in srgb, var(--ivory-oat) 64%, transparent); }
.ivory-count { color: var(--ivory-faint); font-family: "DM Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: .16em; white-space: nowrap; }

.ivory-lookbook-track {
  display: flex;
  gap: 26px;
  overflow-x: auto;
  padding: 6px 0 42px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.ivory-lookbook-track::-webkit-scrollbar { display: none; }
.ivory-lookbook-card {
  position: relative;
  flex: 0 0 min(340px, 78vw);
  scroll-snap-align: start;
}
.ivory-lookbook-card img {
  width: 100%;
  height: 430px;
  object-fit: cover;
  border: 10px solid var(--ivory-white);
  border-radius: var(--ivory-radius);
  box-shadow: 0 10px 44px rgba(26,23,20,.07);
  transition: transform 1s var(--ivory-ease), box-shadow .7s var(--ivory-ease);
}
.ivory-lookbook-card:hover img { transform: translateY(-5px); box-shadow: 0 20px 64px rgba(26,23,20,.12); }
.ivory-lookbook-label { display: block; margin-top: 13px; color: var(--ivory-muted); font-family: "DM Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; }

.ivory-product-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; }
.ivory-product-grid.editorial { grid-template-columns: 1.15fr repeat(2, minmax(0, .92fr)); align-items: stretch; }
.ivory-product-card {
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ivory-ink) 7%, transparent);
  border-radius: var(--ivory-radius);
  background: var(--ivory-white);
  box-shadow: 0 12px 38px rgba(26, 23, 20, 0.055);
  transition: transform .7s var(--ivory-ease), box-shadow .7s var(--ivory-ease), border-color .7s var(--ivory-ease);
}
.ivory-product-card:hover { transform: translateY(-6px); box-shadow: 0 24px 74px rgba(26,23,20,.12); border-color: color-mix(in srgb, var(--ivory-terra) 28%, transparent); }
.ivory-product-card.featured { grid-row: span 2; }
.ivory-product-image { position: relative; display: block; overflow: hidden; aspect-ratio: 4 / 5; background: var(--ivory-oat-mid); }
.ivory-product-card.featured .ivory-product-image { aspect-ratio: 4 / 5.7; }
.ivory-product-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.1s var(--ivory-ease); }
.ivory-product-card:hover .ivory-product-image img { transform: scale(1.055); }
.ivory-product-placeholder { display: grid; place-items: center; height: 100%; padding: 24px; color: var(--ivory-muted); text-align: center; font-size: 12px; line-height: 1.8; }
.ivory-product-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ivory-oat) 88%, transparent);
  color: var(--ivory-ink);
  padding: 7px 11px;
  font-size: 11px;
  font-weight: 900;
  backdrop-filter: blur(12px);
}
.ivory-product-actions {
  position: absolute;
  left: 14px;
  bottom: 14px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity .55s var(--ivory-ease), transform .55s var(--ivory-ease);
}
.ivory-product-card:hover .ivory-product-actions { opacity: 1; transform: translateY(0); }
.ivory-round-action {
  display: grid;
  place-items: center;
  min-width: 42px;
  height: 42px;
  border: 0;
  border-radius: 999px;
  background: var(--ivory-ink);
  color: var(--ivory-oat);
  padding: 0 13px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  transition: transform .45s var(--ivory-ease), background .45s var(--ivory-ease);
}
.ivory-round-action:hover { transform: translateY(-2px); background: var(--ivory-terra); }
.ivory-product-info { padding: 18px; }
.ivory-product-category { color: var(--ivory-terra); font-family: "DM Mono", ui-monospace, monospace; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; }
.ivory-product-name { display: block; margin-top: 9px; color: var(--ivory-ink); font-size: 17px; font-weight: 950; line-height: 1.5; }
.ivory-product-desc { margin-top: 8px; color: var(--ivory-muted); font-size: 13px; font-weight: 500; line-height: 1.8; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ivory-product-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 16px; }
.ivory-price { color: var(--ivory-ink); font-family: "DM Mono", ui-monospace, monospace; font-size: 14px; font-weight: 700; }
.ivory-old-price { color: var(--ivory-faint); font-size: 12px; text-decoration: line-through; }

.ivory-product-page-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 28px; align-items: start; }
.ivory-filter-panel {
  position: sticky;
  top: 94px;
  border: 1px solid color-mix(in srgb, var(--ivory-ink) 8%, transparent);
  border-radius: var(--ivory-radius);
  background: color-mix(in srgb, var(--ivory-white) 78%, transparent);
  box-shadow: 0 16px 48px rgba(26,23,20,.055);
  padding: 20px;
  backdrop-filter: blur(18px);
}
.ivory-input,
.ivory-select,
.ivory-textarea {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--ivory-ink) 10%, transparent);
  border-radius: 18px;
  background: var(--ivory-oat);
  color: var(--ivory-ink);
  outline: none;
  padding: 14px 15px;
  font-size: 14px;
  font-weight: 700;
  transition: border-color .45s var(--ivory-ease), box-shadow .45s var(--ivory-ease), background .45s var(--ivory-ease);
}
.ivory-textarea { min-height: 130px; resize: vertical; line-height: 1.8; }
.ivory-input:focus,
.ivory-select:focus,
.ivory-textarea:focus { border-color: color-mix(in srgb, var(--ivory-terra) 45%, transparent); box-shadow: 0 0 0 4px var(--ivory-terra-soft); background: var(--ivory-white); }
.ivory-field { display: grid; gap: 8px; }
.ivory-label { color: var(--ivory-ink); font-size: 12px; font-weight: 950; }
.ivory-filter-group { display: grid; gap: 10px; margin-top: 16px; }
.ivory-category-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid color-mix(in srgb, var(--ivory-ink) 8%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--ivory-ink-soft);
  padding: 10px 13px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 850;
  transition: background .45s var(--ivory-ease), color .45s var(--ivory-ease), border-color .45s var(--ivory-ease);
}
.ivory-category-chip:hover,
.ivory-category-chip.active { background: var(--ivory-ink); color: var(--ivory-oat); border-color: var(--ivory-ink); }

.ivory-story-grid { display: grid; grid-template-columns: .85fr 1.15fr; gap: 42px; align-items: center; }
.ivory-story-media { overflow: hidden; border-radius: var(--ivory-radius); background: var(--ivory-oat-mid); box-shadow: var(--ivory-shadow); }
.ivory-story-media img { width: 100%; min-height: 520px; object-fit: cover; }
.ivory-story-card { border-top: 1px solid var(--ivory-oat-deep); border-bottom: 1px solid var(--ivory-oat-deep); padding: 36px 0; }
.ivory-story-text { color: var(--ivory-muted); font-size: 16px; line-height: 2.1; font-weight: 500; }

.ivory-timeline { position: relative; display: grid; gap: 0; padding-right: 34px; }
.ivory-timeline::before { content: ""; position: absolute; top: 0; right: 0; width: 1px; height: 100%; background: linear-gradient(180deg, transparent, var(--ivory-terra), transparent); }
.ivory-timeline-item { position: relative; padding: 0 0 42px; }
.ivory-timeline-item::before { content: ""; position: absolute; top: 7px; right: -38px; width: 9px; height: 9px; border: 1.5px solid var(--ivory-terra); border-radius: 50%; background: var(--ivory-ink); }
.ivory-timeline-step { color: var(--ivory-terra); font-family: "DM Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; }
.ivory-timeline-title { margin: 10px 0 0; color: var(--ivory-oat); font-family: "Noto Naskh Arabic", "Amiri", serif; font-size: 28px; font-weight: 600; }
.ivory-timeline-text { margin: 8px 0 0; color: color-mix(in srgb, var(--ivory-oat) 64%, transparent); font-size: 14px; line-height: 1.9; }

.ivory-contact-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 28px; align-items: start; }
.ivory-card {
  border: 1px solid color-mix(in srgb, var(--ivory-ink) 8%, transparent);
  border-radius: var(--ivory-radius);
  background: color-mix(in srgb, var(--ivory-white) 78%, transparent);
  box-shadow: 0 16px 48px rgba(26,23,20,.055);
  padding: 26px;
  backdrop-filter: blur(18px);
}
.ivory-info-list { display: grid; gap: 12px; }
.ivory-info-item { display: grid; gap: 4px; border-bottom: 1px solid var(--ivory-oat-deep); padding-bottom: 14px; }
.ivory-info-label { color: var(--ivory-muted); font-size: 11px; font-weight: 900; }
.ivory-info-value { color: var(--ivory-ink); font-size: 15px; font-weight: 900; line-height: 1.7; }

.ivory-auth-layout { display: grid; grid-template-columns: 1.02fr .98fr; gap: 0; min-height: 100vh; background: var(--ivory-oat); }
.ivory-auth-media { position: relative; overflow: hidden; min-height: 100vh; background: var(--ivory-oat-mid); }
.ivory-auth-media img { width: 100%; height: 100%; object-fit: cover; }
.ivory-auth-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent, rgba(26,23,20,.18)); }
.ivory-auth-content { display: grid; place-items: center; padding: 140px 44px 70px; }
.ivory-auth-card { width: min(520px, 100%); }
.ivory-auth-title { margin: 0; color: var(--ivory-ink); font-family: "Noto Naskh Arabic", "Amiri", serif; font-size: clamp(38px, 4.8vw, 72px); font-weight: 500; line-height: 1.15; letter-spacing: -.035em; }
.ivory-auth-subtitle { margin: 16px 0 0; color: var(--ivory-muted); font-size: 15px; line-height: 1.9; font-weight: 500; }
.ivory-form { display: grid; gap: 14px; margin-top: 28px; }
.ivory-alert { border: 1px solid rgba(220, 38, 38, .20); border-radius: 18px; background: rgba(220, 38, 38, .06); color: #b91c1c; padding: 13px 15px; font-size: 13px; font-weight: 850; line-height: 1.7; }
.ivory-alert.success { border-color: color-mix(in srgb, var(--ivory-terra) 26%, transparent); background: var(--ivory-terra-ghost); color: var(--ivory-terra); }

.ivory-empty { display: grid; place-items: center; min-height: 320px; border: 1px dashed color-mix(in srgb, var(--ivory-ink) 16%, transparent); border-radius: var(--ivory-radius); color: var(--ivory-muted); text-align: center; padding: 34px; }
.ivory-empty h3 { margin: 0; color: var(--ivory-ink); font-family: "Noto Naskh Arabic", "Amiri", serif; font-size: 32px; }
.ivory-empty p { max-width: 520px; margin: 12px auto 0; font-size: 14px; line-height: 1.9; }

.ivory-loader { min-height: 100vh; display: grid; place-items: center; background: var(--ivory-oat); color: var(--ivory-muted); }
.ivory-loader-card { width: min(420px, calc(100% - 32px)); border-radius: var(--ivory-radius); background: var(--ivory-white); box-shadow: var(--ivory-shadow); padding: 28px; text-align: center; }
.ivory-spinner { width: 42px; height: 42px; margin: 0 auto 16px; border: 2px solid var(--ivory-oat-deep); border-top-color: var(--ivory-terra); border-radius: 50%; animation: ivory-spin 1s linear infinite; }
@keyframes ivory-spin { to { transform: rotate(360deg); } }

.ivory-footer { position: relative; overflow: hidden; background: var(--ivory-oat-mid); padding: 92px 0 34px; }
.ivory-footer-bg { position: absolute; inset-inline: 0; top: 50%; transform: translateY(-50%); color: rgba(26,23,20,.035); font-family: "Noto Naskh Arabic", "Amiri", serif; font-size: clamp(90px, 16vw, 240px); line-height: 1; text-align: center; white-space: nowrap; pointer-events: none; }
.ivory-footer-content { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr auto; gap: 34px; align-items: end; }
.ivory-footer-title { margin: 0; color: var(--ivory-ink); font-family: "Noto Naskh Arabic", "Amiri", serif; font-size: clamp(34px, 5vw, 78px); font-weight: 500; line-height: 1.1; }
.ivory-footer-text { max-width: 560px; margin-top: 16px; color: var(--ivory-muted); font-size: 15px; line-height: 1.9; }
.ivory-footer-links { display: flex; flex-wrap: wrap; gap: 18px; justify-content: end; }
.ivory-footer-bottom { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 16px; margin-top: 58px; padding-top: 20px; border-top: 1px solid var(--ivory-oat-deep); color: var(--ivory-muted); font-size: 12px; font-weight: 700; }

@media (max-width: 1100px) {
  .ivory-product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ivory-product-grid.editorial { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ivory-product-page-grid, .ivory-contact-grid, .ivory-story-grid { grid-template-columns: 1fr; }
  .ivory-filter-panel { position: relative; top: auto; }
}

@media (max-width: 850px) {
  .ivory-pill-nav { display: none; }
  .ivory-mobile-toggle { display: block; }
  .ivory-decorator { display: none; }
  .ivory-header-brand { top: 16px; }
  .ivory-brand-logo { width: 44px; height: 44px; }
  .ivory-brand-name, .ivory-brand-tagline { display: none; }
  .ivory-shell { width: min(100% - 28px, 1220px); }
  .ivory-hero, .ivory-auth-layout { grid-template-columns: 1fr; }
  .ivory-hero-media, .ivory-auth-media { min-height: 45vh; }
  .ivory-hero-media-placeholder { min-height: 45vh; }
  .ivory-hero-content, .ivory-auth-content { padding: 44px 22px 60px; }
  .ivory-page { padding-top: 106px; }
  .ivory-section { padding: 58px 0; }
  .ivory-section-head { display: grid; }
  .ivory-product-grid, .ivory-product-grid.editorial { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .ivory-product-actions { opacity: 1; transform: none; }
  .ivory-mini-stats { grid-template-columns: 1fr; }
  .ivory-footer-content, .ivory-footer-bottom { grid-template-columns: 1fr; display: grid; }
  .ivory-footer-links { justify-content: start; }
}

@media (max-width: 560px) {
  .ivory-display { font-size: 44px; }
  .ivory-product-grid, .ivory-product-grid.editorial { grid-template-columns: 1fr; }
  .ivory-lookbook-card { flex-basis: 82vw; }
  .ivory-lookbook-card img { height: 350px; border-width: 7px; border-radius: 24px; }
  .ivory-solid-button, .ivory-ghost-button { width: 100%; }
}

/* ==========================================================
   Dynamic template layouts - each template has a different feel
   ========================================================== */
.template-home { position: relative; overflow: hidden; }
.template-display {
  margin: 0;
  color: var(--ivory-ink);
  font-family: "Noto Naskh Arabic", "Amiri", Georgia, serif;
  font-size: clamp(44px, 6vw, 94px);
  font-weight: 550;
  line-height: 1.05;
  letter-spacing: -.045em;
}
.ivory-root[dir="ltr"] .template-display { font-family: "Inter", "Manrope", Arial, sans-serif; font-weight: 750; letter-spacing: -.06em; }
.template-display em { color: var(--ivory-terra); font-style: normal; }
.template-lead { max-width: 620px; color: var(--ivory-muted); font-size: 16px; line-height: 2; font-weight: 550; }
.template-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 28px; }
.template-image-placeholder { min-height: 320px; display: grid; place-items: center; padding: 28px; color: var(--ivory-muted); background: var(--ivory-oat-mid); text-align: center; line-height: 1.9; }
.template-product-grid { position: relative; }

/* Mizar Modern */
.ivory-root[data-template="MIZAR_MODERN"] .ivory-pill-nav { border-radius: 22px; }
.modern-hero { padding: 150px 0 90px; background: radial-gradient(circle at 85% 10%, color-mix(in srgb, var(--ivory-terra) 18%, transparent), transparent 36%), linear-gradient(135deg, var(--ivory-oat), var(--ivory-oat-mid)); }
.modern-hero-grid { display: grid; grid-template-columns: 1fr .9fr; gap: 42px; align-items: center; }
.modern-copy { max-width: 700px; }
.modern-display { font-family: "Tajawal", "Cairo", sans-serif; font-weight: 950; letter-spacing: -.06em; }
.ivory-root[dir="ltr"] .modern-display { font-family: "Inter", "Manrope", sans-serif; }
.modern-showcase { position: relative; min-height: 600px; border-radius: 42px; overflow: hidden; background: var(--ivory-white); box-shadow: 0 30px 90px rgba(15,23,42,.12); border: 1px solid color-mix(in srgb, var(--ivory-ink) 8%, transparent); }
.modern-showcase img { width: 100%; height: 100%; min-height: 600px; object-fit: cover; }
.modern-floating-card { position: absolute; inset-inline-start: 24px; bottom: 24px; min-width: 180px; border-radius: 28px; background: rgba(255,255,255,.82); backdrop-filter: blur(18px); padding: 18px 20px; box-shadow: 0 14px 40px rgba(15,23,42,.12); }
.modern-floating-card strong { display: block; color: var(--ivory-ink); font-size: 34px; line-height: 1; }
.modern-floating-card span { color: var(--ivory-muted); font-size: 12px; font-weight: 900; }
.modern-categories { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.modern-category-card { min-height: 150px; border-radius: 30px; background: var(--ivory-white); border: 1px solid color-mix(in srgb, var(--ivory-ink) 8%, transparent); padding: 22px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 18px 50px rgba(15,23,42,.055); transition: transform .5s var(--ivory-ease), background .5s var(--ivory-ease); }
.modern-category-card:hover { transform: translateY(-6px); background: var(--ivory-ink); color: var(--ivory-oat); }
.modern-category-card span { font-family: "DM Mono", monospace; color: var(--ivory-terra); font-size: 11px; }
.modern-category-card strong { font-size: 20px; }

/* Luxe / Ivory */
.ivory-root[data-template="LUXE_NOIR"] .ivory-hero { grid-template-columns: 1fr 1fr; }
.ivory-root[data-template="LUXE_NOIR"] .ivory-pill-nav { border-radius: 999px; }
.ivory-root[data-template="LUXE_NOIR"] .ivory-product-card { border-radius: 34px; }
.luxe-hero .ivory-display { font-size: clamp(48px, 6vw, 96px); }

/* Soft Boutique */
.ivory-root[data-template="SOFT_BOUTIQUE"] { --ivory-radius: 38px; }
.ivory-root[data-template="SOFT_BOUTIQUE"] .ivory-pill-nav { background: rgba(255,248,244,.78); border-radius: 999px; }
.soft-hero { padding: 142px 0 86px; background: radial-gradient(circle at 18% 18%, rgba(233,166,166,.28), transparent 34%), radial-gradient(circle at 84% 16%, rgba(192,132,87,.18), transparent 32%), var(--ivory-oat); }
.soft-hero-grid { display: grid; grid-template-columns: .95fr 1.05fr; grid-template-areas: "badge photo" "main photo" "note photo"; gap: 18px; align-items: stretch; }
.soft-badge { grid-area: badge; width: max-content; align-self: end; border-radius: 999px; background: var(--ivory-white); color: var(--ivory-terra); padding: 10px 18px; font-size: 12px; font-weight: 950; box-shadow: 0 12px 34px rgba(57,42,38,.08); }
.soft-hero-card { border-radius: 44px; background: rgba(255,255,255,.74); border: 1px solid rgba(57,42,38,.08); padding: clamp(26px,4vw,54px); box-shadow: 0 28px 80px rgba(57,42,38,.09); backdrop-filter: blur(18px); }
.soft-main-card { grid-area: main; }
.soft-display { font-size: clamp(42px, 5vw, 78px); color: var(--ivory-ink); }
.soft-display em { color: var(--ivory-terra); }
.soft-photo-card { grid-area: photo; border-radius: 56px; overflow: hidden; min-height: 680px; box-shadow: 0 30px 90px rgba(57,42,38,.13); }
.soft-photo-card img { width: 100%; height: 100%; min-height: 680px; object-fit: cover; }
.soft-note-card { grid-area: note; border-radius: 34px; background: var(--ivory-ink); color: var(--ivory-oat); padding: 22px 26px; display: grid; gap: 8px; }
.soft-note-card span { color: color-mix(in srgb, var(--ivory-oat) 65%, transparent); font-size: 12px; font-weight: 900; }
.soft-note-card strong { font-size: 18px; }
.ivory-root[data-template="SOFT_BOUTIQUE"] .ivory-product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ivory-root[data-template="SOFT_BOUTIQUE"] .ivory-product-card { border-radius: 42px; background: rgba(255,255,255,.76); }
.ivory-root[data-template="SOFT_BOUTIQUE"] .ivory-product-image { border-radius: 34px; margin: 12px; }

/* Bazaar Cards */
.ivory-root[data-template="BAZAAR_CARDS"] { --ivory-radius: 22px; }
.ivory-root[data-template="BAZAAR_CARDS"] .ivory-pill-nav { border-radius: 18px; box-shadow: 0 14px 42px rgba(23,37,31,.1); }
.bazaar-hero { padding: 132px 0 70px; background: linear-gradient(135deg, #fff7df, var(--ivory-oat)); }
.bazaar-hero-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 28px; align-items: stretch; }
.bazaar-copy { border-radius: 34px; background: var(--ivory-white); padding: clamp(28px,5vw,62px); border: 1px solid rgba(23,37,31,.08); box-shadow: 0 24px 70px rgba(23,37,31,.08); }
.bazaar-offer-badge { display: inline-flex; border-radius: 14px; background: var(--ivory-terra); color: #fff; padding: 10px 15px; font-size: 12px; font-weight: 950; margin-bottom: 22px; }
.bazaar-display { font-family: "Tajawal", "Cairo", sans-serif; font-weight: 1000; font-size: clamp(42px,6vw,92px); }
.bazaar-display em { color: var(--ivory-olive); }
.bazaar-panel { border-radius: 34px; background: var(--ivory-ink); color: var(--ivory-oat); padding: 24px; box-shadow: 0 30px 90px rgba(23,37,31,.14); }
.bazaar-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.bazaar-panel-head strong { font-size: 24px; }
.bazaar-panel-head span { color: color-mix(in srgb, var(--ivory-oat) 64%, transparent); font-size: 12px; font-weight: 900; }
.bazaar-mini-products { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.bazaar-mini-card { border-radius: 24px; background: rgba(255,255,255,.08); padding: 12px; display: grid; gap: 10px; min-height: 245px; }
.bazaar-mini-card img, .bazaar-mini-card > div { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 18px; background: rgba(255,255,255,.12); }
.bazaar-mini-card span { color: var(--ivory-oat); font-weight: 950; line-height: 1.6; }
.ivory-root[data-template="BAZAAR_CARDS"] .ivory-product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.ivory-root[data-template="BAZAAR_CARDS"] .ivory-product-card { border-radius: 22px; box-shadow: 0 12px 32px rgba(23,37,31,.07); }
.ivory-root[data-template="BAZAAR_CARDS"] .ivory-product-image { aspect-ratio: 1 / 1; }

/* Tech Minimal */
.ivory-root[data-template="TECH_MINIMAL"] { --ivory-radius: 18px; background: #07111f; color: #e5edf7; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-pill-nav { background: rgba(15,23,42,.72); border-color: rgba(148,163,184,.16); }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-pill-link, .ivory-root[data-template="TECH_MINIMAL"] .ivory-pill-button { color: #dbeafe; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-pill-link.active, .ivory-root[data-template="TECH_MINIMAL"] .ivory-pill-button.active { background: #2563eb; color: #fff; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-header-brand .ivory-brand-name { color: #f8fafc; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-brand-tagline { color: #94a3b8; }
.tech-hero { padding: 142px 0 82px; background: radial-gradient(circle at 20% 0%, rgba(37,99,235,.34), transparent 36%), radial-gradient(circle at 80% 20%, rgba(6,182,212,.20), transparent 28%), #07111f; color: #e5edf7; }
.tech-hero-grid { display: grid; grid-template-columns: 1fr .95fr; gap: 34px; align-items: center; }
.tech-kicker { color: #38bdf8; font-family: "DM Mono", monospace; font-size: 11px; letter-spacing: .18em; margin-bottom: 20px; }
.tech-display { color: #f8fafc; font-family: "Inter", "Manrope", sans-serif; font-weight: 900; letter-spacing: -.07em; }
.tech-display em { color: #38bdf8; }
.tech-hero .template-lead { color: #94a3b8; }
.tech-dashboard-card { border: 1px solid rgba(148,163,184,.22); border-radius: 28px; background: rgba(15,23,42,.78); box-shadow: 0 34px 110px rgba(0,0,0,.34); overflow: hidden; backdrop-filter: blur(18px); }
.tech-dashboard-top { display: flex; gap: 8px; padding: 16px; border-bottom: 1px solid rgba(148,163,184,.16); }
.tech-dashboard-top span { width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; opacity: .9; }
.tech-dashboard-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: rgba(148,163,184,.16); }
.tech-dashboard-grid div { background: rgba(15,23,42,.94); padding: 20px; }
.tech-dashboard-grid strong { display: block; color: #f8fafc; font-size: 28px; }
.tech-dashboard-grid span { display: block; color: #94a3b8; font-size: 11px; font-weight: 900; }
.tech-dashboard-card img { width: 100%; height: 430px; object-fit: cover; filter: saturate(.9) contrast(1.05); }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-section { background: #07111f; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-section.alt { background: #0b1626; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-section-title, .ivory-root[data-template="TECH_MINIMAL"] .ivory-product-name, .ivory-root[data-template="TECH_MINIMAL"] .ivory-empty h3 { color: #f8fafc; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-section-subtitle, .ivory-root[data-template="TECH_MINIMAL"] .ivory-product-desc, .ivory-root[data-template="TECH_MINIMAL"] .ivory-muted { color: #94a3b8; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-product-card, .ivory-root[data-template="TECH_MINIMAL"] .ivory-card, .ivory-root[data-template="TECH_MINIMAL"] .ivory-filter-panel { background: rgba(15,23,42,.82); border-color: rgba(148,163,184,.16); box-shadow: none; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-product-image { background: #0f172a; }
.ivory-root[data-template="TECH_MINIMAL"] .ivory-price { color: #f8fafc; }

@media (max-width: 1000px) {
  .modern-hero-grid, .soft-hero-grid, .bazaar-hero-grid, .tech-hero-grid { grid-template-columns: 1fr; }
  .soft-hero-grid { grid-template-areas: "badge" "main" "photo" "note"; }
  .soft-photo-card, .soft-photo-card img { min-height: 430px; }
  .modern-categories { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .bazaar-mini-products { grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media (max-width: 620px) {
  .modern-hero, .soft-hero, .bazaar-hero, .tech-hero { padding-top: 112px; }
  .template-display { font-size: 42px; }
  .modern-showcase, .modern-showcase img { min-height: 390px; }
  .modern-categories, .bazaar-mini-products { grid-template-columns: 1fr; }
  .tech-dashboard-grid { grid-template-columns: 1fr; }
}

`;

function isBrowser() {
  return typeof window !== "undefined";
}

export function normalizeTemplate(value?: string | null): StorefrontTemplateKey {
  const key = String(value || "").trim().toUpperCase();

  if (key === "MIZAR_PREMIUM" || key === "PREMIUM" || key === "MIZAR_PREMIUM_V1") return "MIZAR_PREMIUM";
  if (key === "MIZAR_MODERN") return "MIZAR_MODERN";
  if (key === "LUXE_NOIR") return "LUXE_NOIR";
  if (key === "SOFT_BOUTIQUE") return "SOFT_BOUTIQUE";
  if (key === "BAZAAR_CARDS") return "BAZAAR_CARDS";
  if (key === "TECH_MINIMAL") return "TECH_MINIMAL";

  if (key === "FASHION" || key === "HANDMADE" || key === "ACCESSORIES" || key === "PERFUMES_BEAUTY" || key === "SOFT" || key === "BOUTIQUE") return "SOFT_BOUTIQUE";
  if (key === "FOOD_BEVERAGE" || key === "HOME_PRODUCTS" || key === "BAZAAR" || key === "MARKET") return "BAZAAR_CARDS";
  if (key === "ELECTRONICS" || key === "TECH") return "TECH_MINIMAL";
  if (key === "LUXE" || key === "NOIR") return "LUXE_NOIR";

  return "MIZAR_MODERN";
}

function parseTemplateConfig(value: PublicStore["templateConfig"]): Record<string, any> {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function readNestedTemplateKey(source: any): string {
  if (!source || typeof source !== "object") return "";

  return String(
    source.templateKey ||
      source.selectedTemplate ||
      source.storefrontTemplate ||
      source.activeTemplate ||
      source.content?.templateKey ||
      source.content?.selectedTemplate ||
      "",
  );
}

export function getTemplateFromData(data: StorefrontResponse | null, store: PublicStore | null) {
  const storeFromResponse = data?.store || store || null;
  const templateConfig = parseTemplateConfig(storeFromResponse?.templateConfig || null);

  // The persisted templateConfig is the source of truth. It should win over
  // top-level API fields or legacy Store.template values to avoid reverting
  // Bazaar Cards back to Mizar Premium after navigation/reload.
  const priorityValues = [
    templateConfig.templateKey,
    templateConfig.selectedTemplate,
    templateConfig.storefrontTemplate,
    templateConfig.activeTemplate,
    readNestedTemplateKey(templateConfig),
    data?.content?.templateKey,
    (data?.content as any)?.selectedTemplate,
    (data?.content as any)?.storefrontTemplate,
    data?.storefrontContent?.templateKey,
    data?.templateKey,
    (storeFromResponse as any)?.templateKey,
    (storeFromResponse as any)?.selectedTemplate,
    (storeFromResponse as any)?.storefrontTemplate,
    storeFromResponse?.template,
  ];

  for (const value of priorityValues) {
    const raw = String(value || "").trim();
    if (!raw) continue;
    return normalizeTemplate(raw);
  }

  return "MIZAR_MODERN";
}

export function normalizeHexColor(value?: string | null) {
  const color = String(value || "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : "";
}

export function getStoreCssVariables(store: PublicStore | null): CSSProperties {
  const primaryColor = normalizeHexColor(store?.primaryColor);
  const accentColor = normalizeHexColor(store?.accentColor);
  const style: Record<string, string> = {};
  if (primaryColor) style["--ivory-terra"] = primaryColor;
  if (accentColor) style["--ivory-olive"] = accentColor;
  return style as CSSProperties;
}

export function resolveMediaUrl(value?: string | null) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `/${url.replace(/^\/+/, "")}`;
}

export function getStoreName(store?: PublicStore | null) {
  return store?.displayName || store?.name || "متجر ميزار";
}

export function formatNumber(value: number | string | null | undefined) {
  const number = Number(value || 0);
  return (Number.isNaN(number) ? 0 : number).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function getCurrencyLabel(currency?: string | null) {
  const labels: Record<string, string> = { EGP: "ج.م", SAR: "ر.س", KWD: "د.ك", AED: "د.إ", USD: "$" };
  return labels[String(currency || "EGP").toUpperCase()] || currency || "ج.م";
}

export function formatMoney(value: number | string | null | undefined, currency?: string | null) {
  return `${formatNumber(value)} ${getCurrencyLabel(currency)}`;
}

export function getProductImage(product?: StorefrontProduct | null) {
  if (!product) return "";
  if (product.imageUrl) return resolveMediaUrl(product.imageUrl);
  if (product.coverUrl) return resolveMediaUrl(product.coverUrl);
  const firstMedia = Array.isArray(product.media) ? product.media.find((item) => item?.url || item?.imageUrl || item?.fileUrl) : null;
  if (firstMedia) return resolveMediaUrl(firstMedia.url || firstMedia.imageUrl || firstMedia.fileUrl);
  const firstImage = Array.isArray(product.images) ? product.images.find(Boolean) : "";
  return resolveMediaUrl(firstImage || "");
}

export function getProductPrice(product: StorefrontProduct) {
  if (product.discountPrice !== undefined && product.discountPrice !== null && Number(product.discountPrice) > 0) return Number(product.discountPrice);
  return Number(product.price || 0);
}

export function getProductOldPrice(product: StorefrontProduct) {
  const old = Number(product.compareAtPrice || 0);
  const current = getProductPrice(product);
  return old > current ? old : 0;
}

export function getProductUrl(storeSlug: string, product: StorefrontProduct) {
  return `/store/${encodeURIComponent(storeSlug)}/product/${encodeURIComponent(product.id)}`;
}

export function getPrimaryVariant(product: StorefrontProduct): StorefrontVariant | null {
  const variants = Array.isArray(product.productVariants) ? product.productVariants : Array.isArray(product.variants) ? product.variants : [];
  if (!variants.length) return null;
  const available = variants.find((variant) => {
    const status = String(variant.status || "").toUpperCase();
    const stock = Number(variant.availableQuantity ?? variant.stock ?? variant.quantity ?? 0);
    return status !== "INACTIVE" && status !== "DRAFT" && stock !== 0;
  });
  return available || variants[0] || null;
}

export function addProductToCart(store: PublicStore | null, product: StorefrontProduct, quantity = 1) {
  if (!isBrowser()) return;
  const storeId = String(store?.id || store?.slug || "default");
  const keys = [storeId, `mizar-cart:${storeId}`, `mizar-cart-${storeId}`, `cart:${storeId}`, `cart-${storeId}`];
  const current = readJsonArray(keys[1]);
  const variant = getPrimaryVariant(product);
  const variantPrice = variant?.price !== undefined && variant?.price !== null ? Number(variant.price) : null;
  const price = variantPrice && variantPrice > 0 ? variantPrice : getProductPrice(product);
  const itemKey = variant?.id ? `${product.id}:${variant.id}` : product.id;
  const next = [...current];
  const existingIndex = next.findIndex((item: any) => `${item.productId}:${item.variantId || ""}` === `${product.id}:${variant?.id || ""}` || item.key === itemKey);
  const imageUrl = getProductImage(product);
  const cartItem = {
    key: itemKey,
    productId: product.id,
    variantId: variant?.id || null,
    name: product.name || product.title || "منتج",
    variantTitle: variant?.title || variant?.name || null,
    selectedOptions: variant?.selectedOptions || variant?.options || null,
    sku: variant?.sku || null,
    price,
    quantity,
    imageUrl,
    stock: Number(variant?.availableQuantity ?? variant?.stock ?? variant?.quantity ?? product.availableStock ?? product.stock ?? 0) || null,
  };
  if (existingIndex >= 0) {
    next[existingIndex] = { ...next[existingIndex], quantity: Number(next[existingIndex].quantity || 0) + quantity };
  } else {
    next.push(cartItem);
  }
  keys.forEach((key) => window.localStorage.setItem(key, JSON.stringify(next)));
  window.dispatchEvent(new CustomEvent("mizar-cart-updated", { detail: { storeId, cart: next } }));
}

export function toggleWishlist(store: PublicStore | null, product: StorefrontProduct) {
  if (!isBrowser()) return [] as any[];
  const storeId = String(store?.id || store?.slug || "default");
  const keys = [`mizar-wishlist:${storeId}`, `mizar-wishlist-${storeId}`, `wishlist:${storeId}`, `wishlist-${storeId}`];
  const current = readJsonArray(keys[0]);
  const exists = current.some((item: any) => item.productId === product.id || item.id === product.id);
  const next = exists ? current.filter((item: any) => item.productId !== product.id && item.id !== product.id) : [...current, { productId: product.id, id: product.id, name: product.name, imageUrl: getProductImage(product), price: getProductPrice(product) }];
  keys.forEach((key) => window.localStorage.setItem(key, JSON.stringify(next)));
  window.dispatchEvent(new CustomEvent("mizar-wishlist-updated", { detail: { storeId, wishlist: next } }));
  return next;
}

export function readWishlistIds(store: PublicStore | null) {
  if (!isBrowser()) return [] as string[];
  const storeId = String(store?.id || store?.slug || "default");
  const keys = [`mizar-wishlist:${storeId}`, `mizar-wishlist-${storeId}`, `wishlist:${storeId}`, `wishlist-${storeId}`];
  const all = keys.flatMap((key) => readJsonArray(key));
  return Array.from(new Set(all.map((item: any) => String(item.productId || item.id || "")).filter(Boolean)));
}

function readJsonArray(key: string) {
  if (!isBrowser()) return [] as any[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as any[];
  }
}

export function buildStoreHref(store: PublicStore | null, path = "") {
  const slug = String(store?.slug || "").trim();
  const cleanPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  return slug ? `/store/${encodeURIComponent(slug)}${cleanPath}` : `#${cleanPath}`;
}

export function normalizeHref(store: PublicStore | null, href?: string | null) {
  const value = String(href || "").trim();
  if (!value || value === "#" || value === "#home") return buildStoreHref(store);
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("mailto:") || value.startsWith("tel:") || value.startsWith("/store/")) return value;
  if (value.startsWith("#products") || value === "/products") return buildStoreHref(store, "products");
  if (value.startsWith("#about") || value === "/about") return buildStoreHref(store, "about");
  if (value.startsWith("#contact") || value === "/contact") return buildStoreHref(store, "contact");
  if (value.startsWith("/")) return buildStoreHref(store, value);
  return buildStoreHref(store, value);
}

export function useStorefrontPageData(slug: string): StorefrontPageData {
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<StorefrontResponse | null>(null);

  async function refresh() {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams(queryKey);
      params.set("t", String(Date.now()));

      // مهم: لا نضيف preview=1 تلقائيًا.
      // المتجر العام يجب أن يفتح كـ public فقط.
      // المعاينة من الداشبورد فقط هي التي ترسل preview=1 في الرابط.
      const response = await fetch(`/api/storefront/${encodeURIComponent(slug)}?${params.toString()}`, { cache: "no-store", credentials: "include" });
      const result = (await response.json().catch(() => null)) as StorefrontResponse | null;
      if (!response.ok || !result?.success) throw new Error(result?.message || "تعذر تحميل بيانات المتجر");
      setData(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء تحميل المتجر");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [slug, queryKey]);

  const store = data?.store || null;
  const rawContent = data?.content || data?.storefrontContent || null;
  const templateKey = getTemplateFromData(data, store);
  const content = rawContent ? ({ ...rawContent, templateKey } as StorefrontContent) : rawContent;

  useEffect(() => {
    if (!slug || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(`mizar-active-template:${slug}`, templateKey);
    } catch {
      // Ignore storage failures in private browsing or restricted contexts.
    }
  }, [slug, templateKey]);

  const products = Array.isArray(data?.products)
    ? data!.products!
    : Array.isArray((store as any)?.products)
      ? (((store as any).products || []) as StorefrontProduct[])
      : [];
  return {
    ...((data || {}) as any),
    loading,
    error,
    store,
    content,
    templateKey,
    products,
    featuredProducts: Array.isArray(data?.featuredProducts) ? data!.featuredProducts! : products.filter((p) => p.isFeatured).slice(0, 8),
    latestProducts: Array.isArray(data?.latestProducts) ? data!.latestProducts! : products.slice(0, 8),
    bestSellerProducts: Array.isArray(data?.bestSellerProducts)
      ? data!.bestSellerProducts!
      : Array.isArray(data?.bestSellers)
        ? data!.bestSellers!
        : products.slice(0, 8),
    newArrivalProducts: Array.isArray(data?.newArrivalProducts)
      ? data!.newArrivalProducts!
      : Array.isArray(data?.newArrivals)
        ? data!.newArrivals!
        : products.slice(0, 8),
    categories: Array.isArray(data?.categories) ? data!.categories! : Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    refresh,
  };
}

export function StorefrontHead({ store, templateKey, activePath = "home", locale = "ar" }: { store: PublicStore | null; templateKey: StorefrontTemplateKey; activePath?: string; locale?: StoreLocale }) {
  const [open, setOpen] = useState(false);
  const logoUrl = resolveMediaUrl(store?.logoUrl);
  const text = getLocaleText(locale);
  const nextLocale: StoreLocale = locale === "ar" ? "en" : "ar";
  const navItems = [
    { label: text.nav.home, href: buildStoreHref(store), key: "home" },
    { label: text.nav.products, href: buildStoreHref(store, "products"), key: "products" },
    { label: text.nav.about, href: buildStoreHref(store, "about"), key: "about" },
    { label: text.nav.contact, href: buildStoreHref(store, "contact"), key: "contact" },
    { label: text.nav.wishlist, href: buildStoreHref(store, "wishlist"), key: "wishlist" },
    { label: text.nav.cart, href: buildStoreHref(store, "cart"), key: "cart" },
    { label: text.nav.login, href: buildStoreHref(store, "login"), key: "login" },
  ];
  return (
    <>
      <nav className="ivory-pill-nav" aria-label={locale === "ar" ? "روابط المتجر" : "Store navigation"}>
        {navItems.map((item) => (
          <Link key={item.key} href={item.href} className={`ivory-pill-link ${activePath === item.key ? "active" : ""}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <button type="button" className="ivory-language-toggle" aria-label={text.common.languageAria} onClick={() => switchStoreLocale(nextLocale)}>
        {text.common.languageButton}
      </button>

      <button type="button" aria-label={locale === "ar" ? "فتح القائمة" : "Open menu"} onClick={() => setOpen((value) => !value)} className={`ivory-mobile-toggle ${open ? "open" : ""}`}>
        <span />
      </button>
      <div className={`ivory-mobile-panel ${open ? "open" : ""}`}>
        {navItems.map((item) => (
          <Link key={item.key} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </div>

      <Link href={buildStoreHref(store)} className="ivory-header-brand" aria-label={getStoreName(store)}>
        <span className={`ivory-brand-logo ${logoUrl ? "has-image" : ""}`}>
          {logoUrl ? <img src={logoUrl} alt={getStoreName(store)} /> : getStoreName(store).slice(0, 1)}
        </span>
        <span className="ivory-brand-name">{getStoreName(store)}</span>
        <span className="ivory-brand-tagline">{templateKey === "LUXE_NOIR" ? text.common.curatedStore : text.common.mizarStore}</span>
      </Link>
    </>
  );
}

export function StorefrontShell({ store, content = null, templateKey, activePath, children, footer = true }: { store: PublicStore | null; content?: StorefrontContent | null; templateKey: StorefrontTemplateKey; activePath?: string; children: ReactNode; footer?: boolean }) {
  const locale = useStoreLocale(store, content);
  const text = getLocaleText(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const showTemplateDebug = isBrowser() && new URLSearchParams(window.location.search).get("debugTemplate") === "1";
  return (
    <main className="ivory-root" dir={dir} lang={locale} data-locale={locale} data-template={templateKey} style={getStoreCssVariables(store)}>
      <style>{ivoryStoreStyles}</style>
      {showTemplateDebug ? (
        <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 3000, borderRadius: 999, background: "#111827", color: "#fff", padding: "10px 14px", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", direction: "ltr", boxShadow: "0 12px 36px rgba(0,0,0,.22)" }}>
          TEMPLATE: {templateKey}
        </div>
      ) : null}
      <div className="ivory-decorator">{getStoreName(store)} — {text.common.decorator}</div>
      <StorefrontHead store={store} templateKey={templateKey} activePath={activePath} locale={locale} />
      {children}
      {footer && <StorefrontFooter store={store} locale={locale} />}
    </main>
  );
}

export function StorefrontFooter({ store, locale = "ar" }: { store: PublicStore | null; locale?: StoreLocale }) {
  const name = getStoreName(store);
  const text = getLocaleText(locale);
  const title = text.footer.title.split("\n");
  return (
    <footer className="ivory-footer">
      <div className="ivory-footer-bg" aria-hidden="true">{name}</div>
      <div className="ivory-shell">
        <div className="ivory-footer-content">
          <div>
            <h2 className="ivory-footer-title">{title[0]}<br />{title[1]}</h2>
            <p className="ivory-footer-text">{store?.description || store?.tagline || text.footer.text}</p>
          </div>
          <div className="ivory-footer-links">
            <Link href={buildStoreHref(store, "products")} className="ivory-cta">{text.footer.products}</Link>
            <Link href={buildStoreHref(store, "about")} className="ivory-cta-dark">{text.footer.about}</Link>
            <Link href={buildStoreHref(store, "contact")} className="ivory-cta-dark">{text.footer.contact}</Link>
          </div>
        </div>
        <div className="ivory-footer-bottom">
          <span>© {new Date().getFullYear()} {name}</span>
          <span>{text.common.powered}</span>
        </div>
      </div>
    </footer>
  );
}

export function LoadingStorefront({ locale = "ar" }: { locale?: StoreLocale }) {
  const text = getLocaleText(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <main className="ivory-root" dir={dir} lang={locale} data-locale={locale}>
      <style>{ivoryStoreStyles}</style>
      <div className="ivory-loader">
        <div className="ivory-loader-card">
          <div className="ivory-spinner" />
          <strong>{text.common.loadingTitle}</strong>
          <p style={{ marginTop: 8, lineHeight: 1.8 }}>{text.common.loadingText}</p>
        </div>
      </div>
    </main>
  );
}

export function ErrorStorefront({ message, locale = "ar" }: { message: string; locale?: StoreLocale }) {
  const text = getLocaleText(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <main className="ivory-root" dir={dir} lang={locale} data-locale={locale}>
      <style>{ivoryStoreStyles}</style>
      <section className="ivory-page">
        <div className="ivory-shell">
          <div className="ivory-empty">
            <div>
              <h3>{text.common.errorTitle}</h3>
              <p>{message}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ProductCard({ store, product, featured = false, onAdd, onWishlist, locale = "ar" }: { store: PublicStore | null; product: StorefrontProduct; featured?: boolean; onAdd?: (product: StorefrontProduct) => void; onWishlist?: (product: StorefrontProduct) => void; locale?: StoreLocale }) {
  const imageUrl = getProductImage(product);
  const currency = product.currency || store?.currency || "EGP";
  const oldPrice = getProductOldPrice(product);
  const text = getLocaleText(locale);
  return (
    <article className={`ivory-product-card ${featured ? "featured" : ""}`}>
      <Link href={getProductUrl(String(store?.slug || ""), product)} className="ivory-product-image">
        {imageUrl ? <img src={imageUrl} alt={product.name} /> : <span className="ivory-product-placeholder">{text.common.productImageHint}</span>}
        <span className="ivory-product-badge">{product.category || text.common.selected}</span>
      </Link>
      <div className="ivory-product-actions">
        <button type="button" className="ivory-round-action" onClick={() => (onAdd ? onAdd(product) : addProductToCart(store, product))}>{text.common.add}</button>
        <button type="button" className="ivory-round-action" aria-label={text.nav.wishlist} onClick={() => (onWishlist ? onWishlist(product) : toggleWishlist(store, product))}>{text.common.wishlist}</button>
      </div>
      <div className="ivory-product-info">
        <div className="ivory-product-category">{product.category || text.common.collection}</div>
        <Link href={getProductUrl(String(store?.slug || ""), product)} className="ivory-product-name">{product.name || product.title || (locale === "ar" ? "منتج" : "Product")}</Link>
        {(product.shortDescription || product.description) && <p className="ivory-product-desc">{product.shortDescription || product.description}</p>}
        <div className="ivory-product-meta">
          <span className="ivory-price">{formatMoney(getProductPrice(product), currency)}</span>
          {oldPrice > 0 && <span className="ivory-old-price">{formatMoney(oldPrice, currency)}</span>}
        </div>
      </div>
    </article>
  );
}

export function EmptyState({ title, text, actionHref, actionText }: { title: string; text: string; actionHref?: string; actionText?: string }) {
  return (
    <div className="ivory-empty">
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        {actionHref && actionText && <Link href={actionHref} className="ivory-solid-button" style={{ marginTop: 20 }}>{actionText}</Link>}
      </div>
    </div>
  );
}
