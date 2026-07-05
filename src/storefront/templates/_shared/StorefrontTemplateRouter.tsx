"use client";

import { getLocaleText, useStoreLocale } from "@/storefront/StorefrontPagesShared";
import type {
  TemplateRuntimeData,
  StorefrontTemplatePage,
  TemplateComponent,
} from "./template-types";
import { getTemplateKeyFromData } from "./template-helpers";
import { normalizeMizarPremiumRuntimeData } from "../mizar-premium/data/normalize-runtime-data";
import { normalizeBazaarCardsRuntimeData } from "../bazaar-cards/data/normalize-runtime-data";

import { Home as MizarModernHome } from "../mizar-modern/pages/Home";
import { Products as MizarModernProducts } from "../mizar-modern/pages/Products";
import { About as MizarModernAbout } from "../mizar-modern/pages/About";
import { Contact as MizarModernContact } from "../mizar-modern/pages/Contact";
import { Wishlist as MizarModernWishlist } from "../mizar-modern/pages/Wishlist";
import { Account as MizarModernAccount } from "../mizar-modern/pages/Account";
import { Login as MizarModernLogin } from "../mizar-modern/pages/Login";
import { Register as MizarModernRegister } from "../mizar-modern/pages/Register";
import { ProductDetails as MizarModernProductDetails } from "../mizar-modern/pages/ProductDetails";
import { Checkout as MizarModernCheckout } from "../mizar-modern/pages/Checkout";
import { OrderSuccess as MizarModernOrderSuccess } from "../mizar-modern/pages/OrderSuccess";

import { Home as LuxeHome } from "../luxe-noir/pages/Home";
import { Products as LuxeProducts } from "../luxe-noir/pages/Products";
import { About as LuxeAbout } from "../luxe-noir/pages/About";
import { Contact as LuxeContact } from "../luxe-noir/pages/Contact";
import { Wishlist as LuxeWishlist } from "../luxe-noir/pages/Wishlist";
import { Login as LuxeLogin } from "../luxe-noir/pages/Login";
import { Register as LuxeRegister } from "../luxe-noir/pages/Register";
import { ProductDetails as LuxeProductDetails } from "../luxe-noir/pages/ProductDetails";
import { Checkout as LuxeCheckout } from "../luxe-noir/pages/Checkout";
import { OrderSuccess as LuxeOrderSuccess } from "../luxe-noir/pages/OrderSuccess";

import { Home as SoftHome } from "../soft-boutique/pages/Home";
import { Products as SoftProducts } from "../soft-boutique/pages/Products";
import { About as SoftAbout } from "../soft-boutique/pages/About";
import { Contact as SoftContact } from "../soft-boutique/pages/Contact";
import { Wishlist as SoftWishlist } from "../soft-boutique/pages/Wishlist";
import { Login as SoftLogin } from "../soft-boutique/pages/Login";
import { Register as SoftRegister } from "../soft-boutique/pages/Register";
import { ProductDetails as SoftProductDetails } from "../soft-boutique/pages/ProductDetails";
import { Checkout as SoftCheckout } from "../soft-boutique/pages/Checkout";
import { OrderSuccess as SoftOrderSuccess } from "../soft-boutique/pages/OrderSuccess";

import { Home as BazaarHome } from "../bazaar-cards/pages/Home";
import { Products as BazaarProducts } from "../bazaar-cards/pages/Products";
import { About as BazaarAbout } from "../bazaar-cards/pages/About";
import { Contact as BazaarContact } from "../bazaar-cards/pages/Contact";
import { Wishlist as BazaarWishlist } from "../bazaar-cards/pages/Wishlist";
import { Login as BazaarLogin } from "../bazaar-cards/pages/Login";
import { Register as BazaarRegister } from "../bazaar-cards/pages/Register";
import { ProductDetails as BazaarProductDetails } from "../bazaar-cards/pages/ProductDetails";
import { Cart as BazaarCart } from "../bazaar-cards/pages/Cart";
import { Account as BazaarAccount } from "../bazaar-cards/pages/Account";
import { Checkout as BazaarCheckout } from "../bazaar-cards/pages/Checkout";
import { OrderSuccess as BazaarOrderSuccess } from "../bazaar-cards/pages/OrderSuccess";
import { BlogList as BazaarBlogList } from "../bazaar-cards/pages/BlogList";
import { BlogPost as BazaarBlogPost } from "../bazaar-cards/pages/BlogPost";

import { Home as TechHome } from "../tech-minimal/pages/Home";
import { Products as TechProducts } from "../tech-minimal/pages/Products";
import { About as TechAbout } from "../tech-minimal/pages/About";
import { Contact as TechContact } from "../tech-minimal/pages/Contact";
import { Wishlist as TechWishlist } from "../tech-minimal/pages/Wishlist";
import { Login as TechLogin } from "../tech-minimal/pages/Login";
import { Register as TechRegister } from "../tech-minimal/pages/Register";
import { ProductDetails as TechProductDetails } from "../tech-minimal/pages/ProductDetails";
import { Checkout as TechCheckout } from "../tech-minimal/pages/Checkout";
import { OrderSuccess as TechOrderSuccess } from "../tech-minimal/pages/OrderSuccess";

import { Home as PremiumHome } from "../mizar-premium/pages/Home";
import { Products as PremiumProducts } from "../mizar-premium/pages/Products";
import { About as PremiumAbout } from "../mizar-premium/pages/About";
import { Contact as PremiumContact } from "../mizar-premium/pages/Contact";
import { Wishlist as PremiumWishlist } from "../mizar-premium/pages/Wishlist";
import { Cart as PremiumCart } from "../mizar-premium/pages/Cart";
import { Account as PremiumAccount } from "../mizar-premium/pages/Account";
import { Login as PremiumLogin } from "../mizar-premium/pages/Login";
import { Register as PremiumRegister } from "../mizar-premium/pages/Register";
import { ProductDetails as PremiumProductDetails } from "../mizar-premium/pages/ProductDetails";
import { Checkout as PremiumCheckout } from "../mizar-premium/pages/Checkout";
import { OrderSuccess as PremiumOrderSuccess } from "../mizar-premium/pages/OrderSuccess";
import { BlogList as PremiumBlogList } from "../mizar-premium/pages/BlogList";
import { BlogPost as PremiumBlogPost } from "../mizar-premium/pages/BlogPost";

const templatePages: Record<string, Record<string, TemplateComponent>> = {
  MIZAR_PREMIUM: {
    home: PremiumHome as TemplateComponent,
    products: PremiumProducts as TemplateComponent,
    about: PremiumAbout as TemplateComponent,
    contact: PremiumContact as TemplateComponent,
    wishlist: PremiumWishlist as TemplateComponent,
    cart: PremiumCart as TemplateComponent,
    account: PremiumAccount as TemplateComponent,
    login: PremiumLogin as TemplateComponent,
    register: PremiumRegister as TemplateComponent,
    productDetails: PremiumProductDetails as TemplateComponent,
    checkout: PremiumCheckout as TemplateComponent,
    orderSuccess: PremiumOrderSuccess as TemplateComponent,
    blogList: PremiumBlogList as TemplateComponent,
    blogPost: PremiumBlogPost as TemplateComponent,
  },

  MIZAR_MODERN: {
    home: MizarModernHome,
    products: MizarModernProducts,
    about: MizarModernAbout,
    contact: MizarModernContact,
    wishlist: MizarModernWishlist,
    cart: MizarModernCheckout,
    account: MizarModernAccount,
    login: MizarModernLogin,
    register: MizarModernRegister,
    productDetails: MizarModernProductDetails,
    checkout: MizarModernCheckout,
    orderSuccess: MizarModernOrderSuccess,
    blogList: PremiumBlogList as TemplateComponent,
    blogPost: PremiumBlogPost as TemplateComponent,
  },

  LUXE_NOIR: {
    home: LuxeHome,
    products: LuxeProducts,
    about: LuxeAbout,
    contact: LuxeContact,
    wishlist: LuxeWishlist,
    cart: LuxeCheckout,
    account: MizarModernAccount,
    login: LuxeLogin,
    register: LuxeRegister,
    productDetails: LuxeProductDetails,
    checkout: LuxeCheckout,
    orderSuccess: LuxeOrderSuccess,
    blogList: PremiumBlogList as TemplateComponent,
    blogPost: PremiumBlogPost as TemplateComponent,
  },

  SOFT_BOUTIQUE: {
    home: SoftHome,
    products: SoftProducts,
    about: SoftAbout,
    contact: SoftContact,
    wishlist: SoftWishlist,
    cart: SoftCheckout,
    account: MizarModernAccount,
    login: SoftLogin,
    register: SoftRegister,
    productDetails: SoftProductDetails,
    checkout: SoftCheckout,
    orderSuccess: SoftOrderSuccess,
    blogList: PremiumBlogList as TemplateComponent,
    blogPost: PremiumBlogPost as TemplateComponent,
  },

  BAZAAR_CARDS: {
    home: BazaarHome as TemplateComponent,
    products: BazaarProducts as TemplateComponent,
    about: BazaarAbout as TemplateComponent,
    contact: BazaarContact as TemplateComponent,
    wishlist: BazaarWishlist as TemplateComponent,
    cart: BazaarCart as TemplateComponent,
    account: BazaarAccount as TemplateComponent,
    login: BazaarLogin as TemplateComponent,
    register: BazaarRegister as TemplateComponent,
    productDetails: BazaarProductDetails as TemplateComponent,
    checkout: BazaarCheckout as TemplateComponent,
    orderSuccess: BazaarOrderSuccess as TemplateComponent,
    blogList: BazaarBlogList as TemplateComponent,
    blogPost: BazaarBlogPost as TemplateComponent,
  },

  TECH_MINIMAL: {
    home: TechHome,
    products: TechProducts,
    about: TechAbout,
    contact: TechContact,
    wishlist: TechWishlist,
    cart: TechCheckout,
    account: MizarModernAccount,
    login: TechLogin,
    register: TechRegister,
    productDetails: TechProductDetails,
    checkout: TechCheckout,
    orderSuccess: TechOrderSuccess,
    blogList: PremiumBlogList as TemplateComponent,
    blogPost: PremiumBlogPost as TemplateComponent,
  },
};

function parseConfig(value: any) {
  if (!value) return {};

  if (typeof value === "object") return value;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  return {};
}

function normalizeRuntimeTemplateKey(data: TemplateRuntimeData) {
  const storeConfig = parseConfig((data.store as any)?.templateConfig);
  const contentConfig = parseConfig((data.content as any)?.templateConfig);

  const normalize = (value: unknown) => {
    const raw = String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    if (["MIZAR_PREMIUM", "PREMIUM", "MIZAR_PREMIUM_V1", "MIZAR_PREMIUM_V2", "MIZAR_PREMIUM_V3"].includes(raw)) {
      return "MIZAR_PREMIUM";
    }

    if (["MIZAR_MODERN", "GENERAL", "MODERN"].includes(raw)) return "MIZAR_MODERN";
    if (["LUXE_NOIR", "LUXE", "NOIR", "IVORY", "IVORY_ATELIER", "ATELIER", "ATELIER_LUXE"].includes(raw)) return "LUXE_NOIR";
    if (["SOFT_BOUTIQUE", "SOFT", "BOUTIQUE", "FASHION", "BEAUTY", "HANDMADE"].includes(raw)) return "SOFT_BOUTIQUE";
    if (["BAZAAR_CARDS", "BAZAAR", "MARKET", "FOOD_BEVERAGE", "FOOD", "HOME", "HOME_PRODUCTS"].includes(raw)) return "BAZAAR_CARDS";
    if (["TECH_MINIMAL", "TECH", "ELECTRONICS"].includes(raw)) return "TECH_MINIMAL";

    return "";
  };

  // The saved templateConfig is the source of truth. This prevents stale legacy
  // fields like Store.template or old nested content.templateKey from switching
  // the storefront back to another template after navigation or reload.
  const priorityValues = [
    storeConfig.templateKey,
    storeConfig.selectedTemplate,
    storeConfig.storefrontTemplate,
    storeConfig.activeTemplate,
    (data.content as any)?.templateKey,
    (data.content as any)?.selectedTemplate,
    (data.content as any)?.storefrontTemplate,
    contentConfig.templateKey,
    contentConfig.selectedTemplate,
    data.templateKey,
    (data.store as any)?.templateKey,
    (data.store as any)?.selectedTemplate,
    (data.store as any)?.storefrontTemplate,
    data.store?.template,
  ];

  for (const value of priorityValues) {
    const normalized = normalize(value);
    if (normalized) return normalized;
  }

  return getTemplateKeyFromData({
    content: data.content,
    store: data.store,
    templateKey: data.templateKey,
  });
}

function normalizeRuntimeDataForTemplate(templateKey: string, data: TemplateRuntimeData) {
  if (templateKey === "MIZAR_PREMIUM") {
    return normalizeMizarPremiumRuntimeData(data) as TemplateRuntimeData;
  }

  if (templateKey === "BAZAAR_CARDS") {
    return normalizeBazaarCardsRuntimeData(data) as TemplateRuntimeData;
  }

  return data;
}

export default function StorefrontTemplateRouter({
  page,
  data,
}: {
  page: StorefrontTemplatePage;
  data: TemplateRuntimeData;
}) {
  const templateKey = normalizeRuntimeTemplateKey(data);
  const normalizedData = normalizeRuntimeDataForTemplate(templateKey, data);

  const locale = useStoreLocale(normalizedData.store, normalizedData.content);
  const text = getLocaleText(locale);
  const pageKey = String(page || "home");

  const Component =
    templatePages[templateKey]?.[pageKey] ||
    templatePages.MIZAR_MODERN[pageKey] ||
    templatePages.MIZAR_MODERN.home;

  return (
    <Component
      {...normalizedData}
      templateKey={templateKey as any}
      locale={locale}
      text={text}
    />
  );
}