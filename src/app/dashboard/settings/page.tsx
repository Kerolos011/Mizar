"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type StoreSummary = {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  faviconUrl?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  contactEmail?: string | null;
  country?: string | null;
  governorate?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  shippingFee?: number | string | null;
  freeShippingThreshold?: number | string | null;
  shippingPolicy?: string | null;
  paymentMethod?: string | null;
  paymentMethods?: string[] | string | null;
  currency?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  snapchat?: string | null;
  x?: string | null;
  isActive?: boolean | null;
};

type CatalogProductOption = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  imageUrl: string;
  price?: number | string | null;
};

type CatalogCategoryOption = {
  value: string;
  label: string;
  count: number;
};

type TabKey =
  | "store"
  | "contact"
  | "address"
  | "homepage"
  | "social"
  | "payments"
  | "shipping"
  | "taxes"
  | "policies"
  | "seo"
  | "products"
  | "footer"
  | "notifications";

type FormState = {
  storeInfo: Record<string, any>;
  contactInfo: Record<string, any>;
  address: Record<string, any>;
  homepage: Record<string, any>;
  socialLinks: Record<string, string>;
  paymentMethods: Record<string, any>;
  shipping: Record<string, any>;
  taxes: Record<string, any>;
  policies: Record<string, any>;
  seo: Record<string, any>;
  productSettings: Record<string, any>;
  footer: Record<string, any>;
  notifications: Record<string, any>;
};

const CATEGORIES = [
  { value: "Fashion", label: "أزياء وملابس" },
  { value: "Electronics", label: "إلكترونيات" },
  { value: "Beauty", label: "جمال وعناية" },
  { value: "Home", label: "منزل ومعيشة" },
  { value: "Food", label: "مطاعم وأغذية" },
  { value: "Sports", label: "رياضة" },
  { value: "Books", label: "كتب ومحتوى" },
  { value: "General", label: "متجر عام" },
];

const SOCIALS = [
  { key: "FACEBOOK", label: "فيسبوك", placeholder: "https://facebook.com/..." },
  { key: "INSTAGRAM", label: "إنستجرام", placeholder: "https://instagram.com/..." },
  { key: "TIKTOK", label: "تيك توك", placeholder: "https://tiktok.com/@..." },
  { key: "YOUTUBE", label: "يوتيوب", placeholder: "https://youtube.com/..." },
  { key: "X", label: "X / تويتر", placeholder: "https://x.com/..." },
  { key: "LINKEDIN", label: "لينكدإن", placeholder: "https://linkedin.com/..." },
  { key: "SNAPCHAT", label: "سناب شات", placeholder: "https://snapchat.com/..." },
  { key: "TELEGRAM", label: "تليجرام", placeholder: "https://t.me/..." },
  { key: "PINTEREST", label: "Pinterest", placeholder: "https://pinterest.com/..." },
  { key: "WHATSAPP", label: "واتساب شات", placeholder: "https://wa.me/201..." },
  { key: "MESSENGER", label: "ماسنجر", placeholder: "https://m.me/..." },
];

const PAYMENT_METHODS = [
  { key: "CASH_ON_DELIVERY", label: "الدفع عند الاستلام" },
  { key: "BANK_TRANSFER", label: "تحويل بنكي" },
  { key: "VODAFONE_CASH", label: "Vodafone Cash" },
  { key: "INSTAPAY", label: "InstaPay" },
  { key: "VISA", label: "Visa" },
  { key: "MASTERCARD", label: "Mastercard" },
  { key: "APPLE_PAY", label: "Apple Pay" },
  { key: "GOOGLE_PAY", label: "Google Pay" },
  { key: "MEEZA", label: "Meeza" },
];

const POLICY_TYPES = [
  { key: "ABOUT_US", label: "من نحن" },
  { key: "PRIVACY_POLICY", label: "سياسة الخصوصية" },
  { key: "TERMS_CONDITIONS", label: "الشروط والأحكام" },
  { key: "SHIPPING_POLICY", label: "سياسة الشحن" },
  { key: "RETURN_POLICY", label: "سياسة الاسترجاع" },
  { key: "EXCHANGE_POLICY", label: "سياسة الاستبدال" },
  { key: "REFUND_POLICY", label: "سياسة رد الأموال" },
  { key: "FAQ", label: "الأسئلة الشائعة" },
  { key: "CAREERS", label: "الوظائف" },
];

const TABS: Array<{ key: TabKey; label: string; desc: string }> = [
  { key: "store", label: "بيانات المتجر", desc: "الاسم، الوصف، الصور والحالة" },
  { key: "contact", label: "التواصل", desc: "البريد، الهاتف، واتساب وساعات العمل" },
  { key: "address", label: "العنوان", desc: "عنوان المتجر وموقع الخريطة" },
  { key: "homepage", label: "الرئيسية", desc: "الأقسام التي تظهر في الصفحة الرئيسية" },
  { key: "social", label: "السوشيال", desc: "إظهار الأيقونات حسب الروابط المدخلة فقط" },
  { key: "payments", label: "الدفع", desc: "طرق الدفع المتاحة للعملاء" },
  { key: "shipping", label: "الشحن", desc: "التكلفة، المدة وسياسة الشحن" },
  { key: "taxes", label: "الضرائب", desc: "إعدادات الضريبة والسجل التجاري" },
  { key: "policies", label: "السياسات", desc: "سياسات المتجر وصفحات الخدمة" },
  { key: "seo", label: "SEO", desc: "عنوان ووصف المشاركة ومحركات البحث" },
  { key: "products", label: "المنتجات", desc: "إعدادات عرض المنتجات" },
  { key: "footer", label: "الفوتر", desc: "محتوى الفوتر والروابط" },
  { key: "notifications", label: "الإشعارات", desc: "تنبيهات البريد والواتساب والمتصفح" },
];

function createEmptyForm(): FormState {
  return {
    storeInfo: {
      name: "",
      nameAr: "",
      nameEn: "",
      slug: "",
      category: "General",
      subCategory: "",
      shortDescription: "",
      description: "",
      descriptionAr: "",
      descriptionEn: "",
      fullDescription: "",
      tagline: "",
      ownerName: "",
      establishedYear: "",
      logoUrl: "",
      coverUrl: "",
      faviconUrl: "",
      bannerUrl: "",
      status: "OPEN",
      defaultLanguage: "ar",
    },
    contactInfo: {
      businessEmail: "",
      supportEmail: "",
      mobileNumber: "",
      whatsappNumber: "",
      landlineNumber: "",
      emergencyContact: "",
      workingDays: [],
      workingHours: "",
    },
    address: {
      country: "Egypt",
      state: "",
      city: "",
      district: "",
      street: "",
      buildingNumber: "",
      postalCode: "",
      googleMapsUrl: "",
      latitude: "",
      longitude: "",
      address: "",
    },
    homepage: {
      enableHeroBanner: true,
      enableFeaturedCategories: true,
      enableFeaturedProducts: true,
      enableBestSellers: true,
      enableNewArrivals: true,
      enableOffers: true,
      enableBrands: false,
      enableReviews: true,
      enableNewsletter: true,
      enableBlogPreview: false,
      enableServices: true,
      enableInstagramGallery: false,
      heroBanners: [createEmptyHeroBanner(1)],
      featuredCategoryIds: [""],
      featuredProductIds: [""],
      services: [createEmptyService(1)],
      instagramImages: [createEmptyInstagramImage(1)],
      brands: [createEmptyBrand(1)],
      blogPosts: [createEmptyBlogPost(1)],
    },
    socialLinks: {},
    paymentMethods: {},
    shipping: {
      shippingCompaniesText: "",
      shippingCost: 0,
      freeShippingThreshold: "",
      estimatedDeliveryTime: "",
      pickupAvailable: false,
      shippingPolicy: "",
    },
    taxes: {
      pricesIncludeTax: false,
      taxPercentage: "",
      commercialRegistrationNumber: "",
      taxRegistrationNumber: "",
    },
    policies: {},
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImageUrl: "",
      canonicalUrl: "",
      robotsIndex: true,
    },
    productSettings: {
      displaySku: true,
      displayBrand: true,
      displayStockQuantity: false,
      allowReviews: true,
      allowQuestions: true,
      allowWishlist: true,
      allowCompare: false,
      enableRecentlyViewed: true,
      enableProductSharing: true,
      defaultProductsPerPage: 24,
      weightUnit: "kg",
      dimensionUnit: "cm",
      currency: "EGP",
      language: "ar",
    },
    footer: {
      aboutStoreAr: "",
      aboutStoreEn: "",
      copyrightText: "",
      quickLinksText: "",
      customerServiceLinksText: "",
      paymentIconsText: "",
      shippingPartnersText: "",
    },
    notifications: {
      emailNotificationsEnabled: true,
      smsNotificationsEnabled: false,
      whatsappNotificationsEnabled: false,
      browserNotificationsEnabled: false,
    },
  };
}

function extractStores(payload: any): StoreSummary[] {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.stores)) return payload.stores;

  if (Array.isArray(payload?.data)) return payload.data;

  if (payload?.store) return [payload.store];

  return [];
}

function getFirstValue<T>(...values: T[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "") ?? "";
}

function parseRecord(value: any): Record<string, any> {
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

function hasObjectValues(value: any) {
  return Object.keys(parseRecord(value)).length > 0;
}

function mergeRecordValues(base: any, override: any): Record<string, any> {
  const baseRecord = parseRecord(base);
  const overrideRecord = parseRecord(override);
  const result: Record<string, any> = { ...baseRecord };

  for (const [key, value] of Object.entries(overrideRecord)) {
    if (value === undefined || value === null || value === "") continue;

    const currentValue = result[key];

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      currentValue &&
      typeof currentValue === "object" &&
      !Array.isArray(currentValue)
    ) {
      result[key] = mergeRecordValues(currentValue, value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

function mergeDashboardSettings(apiSettings: any, fallbackSettings: any): Record<string, any> {
  return mergeRecordValues(apiSettings, fallbackSettings);
}

function toTextList(value: any) {
  if (!value) return "";

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.name) return item.name;
        if (item?.label) return item.label;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "string") return value;

  return "";
}

function textToArray(value: string) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}




function createEmptyHeroBanner(index = 1) {
  return {
    id: `hero-${index}`,
    title: "",
    titleEn: "",
    subtitle: "",
    subtitleEn: "",
    imageUrl: "",
    buttonText: "تسوق الآن",
    buttonTextEn: "Shop now",
    buttonLink: "/products",
    secondaryButtonText: "من نحن",
    secondaryButtonTextEn: "About us",
    secondaryButtonLink: "/about",
    isActive: true,
  };
}

function createEmptyService(index = 1) {
  return {
    id: `service-${index}`,
    title: "",
    titleEn: "",
    description: "",
    descriptionEn: "",
    icon: "✓",
    enabled: true,
  };
}

function createEmptyInstagramImage(index = 1) {
  return {
    id: `instagram-${index}`,
    url: "",
    imageUrl: "",
    alt: "",
    enabled: true,
  };
}

function createEmptyBrand(index = 1) {
  return {
    id: `brand-${index}`,
    name: "",
    logoUrl: "",
    website: "",
    isActive: true,
  };
}

function createEmptyBlogPost(index = 1) {
  return {
    id: `blog-${index}`,
    titleAr: "",
    titleEn: "",
    slug: "",
    excerptAr: "",
    excerptEn: "",
    contentAr: "",
    contentEn: "",
    imageUrl: "",
    isPublished: true,
  };
}

function cleanRows<T extends Record<string, any>>(rows: T[] | undefined, isMeaningful: (row: T) => boolean) {
  return (Array.isArray(rows) ? rows : []).filter((row) => row && isMeaningful(row));
}

function normalizeStringRows(value: any, fallback: string[] = [""]) {
  const rows = Array.isArray(value) ? value : textToArray(String(value || ""));
  const result = rows.map((item: any) => String(item || "").trim()).filter(Boolean);

  return result.length ? result : fallback;
}

function cleanStringRows(value: any) {
  return normalizeStringRows(value, []).filter(Boolean);
}

function normalizeKey(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function uniqueStrings(values: unknown[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const text = String(value || "").trim();
    const key = normalizeKey(text);

    if (!text || seen.has(key)) continue;

    seen.add(key);
    result.push(text);
  }

  return result;
}

function normalizeCatalogProduct(product: any): CatalogProductOption | null {
  if (!product) return null;

  const id = String(product.id || "").trim();
  const slug = String(product.slug || product.handle || "").trim();
  const sku = String(product.sku || "").trim();
  const name = String(
    getFirstValue(product.name, product.title, product.nameAr, product.nameEn, slug, id),
  ).trim();

  if (!id && !slug && !name) return null;

  return {
    id,
    slug,
    sku,
    name,
    category: String(getFirstValue(product.categoryName, product.category)).trim(),
    imageUrl: String(getFirstValue(product.imageUrl, product.coverUrl, product.thumbnailUrl)).trim(),
    price: product.finalPrice || product.discountPrice || product.price || null,
  };
}

function normalizeCatalogCategory(category: any): CatalogCategoryOption | null {
  const label = String(
    getFirstValue(
      typeof category === "string" ? category : "",
      category?.name,
      category?.title,
      category?.label,
      category?.id,
    ),
  ).trim();

  if (!label) return null;

  return {
    value: label,
    label,
    count: Number(category?.count || category?._count || 0) || 0,
  };
}

function uniqueByCatalogProduct(products: CatalogProductOption[]) {
  const seen = new Set<string>();
  const result: CatalogProductOption[] = [];

  for (const product of products) {
    const key = normalizeKey(product.id || product.slug || product.name);

    if (!key || seen.has(key)) continue;

    seen.add(key);
    result.push(product);
  }

  return result;
}

function uniqueByCatalogCategory(categories: CatalogCategoryOption[]) {
  const seen = new Set<string>();
  const result: CatalogCategoryOption[] = [];

  for (const category of categories) {
    const key = normalizeKey(category.value || category.label);

    if (!key || seen.has(key)) continue;

    seen.add(key);
    result.push(category);
  }

  return result.sort((a, b) => a.label.localeCompare(b.label));
}

function extractCatalogFromStorefront(payload: any) {
  const products = (Array.isArray(payload?.products) ? payload.products : [])
    .map(normalizeCatalogProduct)
    .filter(Boolean) as CatalogProductOption[];

  const explicitCategories = [
    ...(Array.isArray(payload?.categories) ? payload.categories : []),
    ...(Array.isArray(payload?.store?.categories) ? payload.store.categories : []),
  ]
    .map(normalizeCatalogCategory)
    .filter(Boolean) as CatalogCategoryOption[];

  const categoryCount = new Map<string, number>();

  for (const product of products) {
    const category = String(product.category || "").trim();
    if (!category) continue;

    const key = normalizeKey(category);
    categoryCount.set(key, (categoryCount.get(key) || 0) + 1);
  }

  const productCategories = Array.from(categoryCount.entries()).map(([key, count]) => {
    const product = products.find((item) => normalizeKey(item.category) === key);
    const label = product?.category || key;

    return {
      value: label,
      label,
      count,
    };
  });

  return {
    products: uniqueByCatalogProduct(products),
    categories: uniqueByCatalogCategory([...explicitCategories, ...productCategories]),
  };
}

function productOptionValue(product: CatalogProductOption) {
  return String(getFirstValue(product.slug, product.id, product.sku, product.name));
}

function normalizeHeroBanners(value: any) {
  const rows = Array.isArray(value) ? value : [];

  if (!rows.length) return [createEmptyHeroBanner(1)];

  return rows.map((hero: any, index: number) => ({
    id: String(hero?.id || `hero-${index + 1}`),
    title: getFirstValue(hero?.title, hero?.titleAr),
    titleEn: getFirstValue(hero?.titleEn),
    subtitle: getFirstValue(hero?.subtitle, hero?.subtitleAr, hero?.description),
    subtitleEn: getFirstValue(hero?.subtitleEn, hero?.descriptionEn),
    imageUrl: getFirstValue(hero?.imageUrl, hero?.url, hero?.fileUrl, hero?.bannerUrl),
    buttonText: getFirstValue(hero?.buttonText, hero?.primaryButtonText, "تسوق الآن"),
    buttonTextEn: getFirstValue(hero?.buttonTextEn, hero?.primaryButtonTextEn, "Shop now"),
    buttonLink: getFirstValue(hero?.buttonLink, hero?.primaryButtonHref, "/products"),
    secondaryButtonText: getFirstValue(hero?.secondaryButtonText, "من نحن"),
    secondaryButtonTextEn: getFirstValue(hero?.secondaryButtonTextEn, "About us"),
    secondaryButtonLink: getFirstValue(hero?.secondaryButtonLink, hero?.secondaryButtonHref, "/about"),
    isActive: hero?.isActive !== false && hero?.enabled !== false,
  }));
}

function cleanHeroBanners(value: any) {
  return cleanRows(Array.isArray(value) ? value : [], (hero) =>
    Boolean(
      getFirstValue(
        hero.title,
        hero.titleEn,
        hero.subtitle,
        hero.subtitleEn,
        hero.imageUrl,
        hero.buttonText,
        hero.buttonLink,
      ),
    ),
  ).map((hero: any, index: number) => ({
    id: String(hero.id || `homepage-hero-${index + 1}`),
    title: String(hero.title || "").trim(),
    titleEn: String(hero.titleEn || "").trim(),
    subtitle: String(hero.subtitle || "").trim(),
    subtitleEn: String(hero.subtitleEn || "").trim(),
    imageUrl: String(hero.imageUrl || "").trim(),
    buttonText: String(hero.buttonText || "تسوق الآن").trim(),
    buttonTextEn: String(hero.buttonTextEn || "Shop now").trim(),
    buttonLink: String(hero.buttonLink || "/products").trim(),
    secondaryButtonText: String(hero.secondaryButtonText || "من نحن").trim(),
    secondaryButtonTextEn: String(hero.secondaryButtonTextEn || "About us").trim(),
    secondaryButtonLink: String(hero.secondaryButtonLink || "/about").trim(),
    isActive: hero.isActive !== false,
  }));
}

function normalizeServices(value: any) {
  const rows = Array.isArray(value) ? value : [];

  if (!rows.length) return [createEmptyService(1)];

  return rows.map((service: any, index: number) => ({
    id: String(service?.id || `service-${index + 1}`),
    title: getFirstValue(service?.title, service?.titleAr, service?.name),
    titleEn: getFirstValue(service?.titleEn, service?.nameEn),
    description: getFirstValue(service?.description, service?.descriptionAr),
    descriptionEn: getFirstValue(service?.descriptionEn),
    icon: getFirstValue(service?.icon, "✓"),
    enabled: service?.enabled !== false && service?.isActive !== false,
  }));
}

function cleanServices(value: any) {
  return cleanRows(Array.isArray(value) ? value : [], (service) =>
    Boolean(getFirstValue(service.title, service.titleEn, service.description, service.descriptionEn, service.icon)),
  ).map((service: any, index: number) => ({
    id: String(service.id || `service-${index + 1}`),
    title: String(service.title || "").trim(),
    titleEn: String(service.titleEn || "").trim(),
    description: String(service.description || "").trim(),
    descriptionEn: String(service.descriptionEn || "").trim(),
    icon: String(service.icon || "✓").trim(),
    enabled: service.enabled !== false,
  }));
}

function normalizeInstagramImages(value: any) {
  const rows = Array.isArray(value) ? value : [];

  if (!rows.length) return [createEmptyInstagramImage(1)];

  return rows.map((item: any, index: number) => {
    const url = typeof item === "string" ? item : getFirstValue(item?.url, item?.imageUrl, item?.fileUrl);
    return {
      id: String(item?.id || `instagram-${index + 1}`),
      url,
      imageUrl: url,
      alt: typeof item === "string" ? "" : getFirstValue(item?.alt, item?.title),
      enabled: typeof item === "string" ? true : item?.enabled !== false && item?.isActive !== false,
    };
  });
}

function cleanInstagramImages(value: any) {
  return cleanRows(Array.isArray(value) ? value : [], (item) => Boolean(getFirstValue(item.url, item.imageUrl))).map(
    (item: any, index: number) => {
      const url = String(getFirstValue(item.url, item.imageUrl) || "").trim();
      return {
        id: String(item.id || `instagram-${index + 1}`),
        url,
        imageUrl: url,
        alt: String(item.alt || "").trim(),
        enabled: item.enabled !== false,
      };
    },
  );
}

function normalizeBrands(value: any) {
  const rows = Array.isArray(value) ? value : [];

  if (!rows.length) return [createEmptyBrand(1)];

  return rows.map((brand: any, index: number) => ({
    id: String(brand?.id || `brand-${index + 1}`),
    name: getFirstValue(brand?.name, brand?.nameAr, brand?.title),
    logoUrl: getFirstValue(brand?.logoUrl, brand?.imageUrl),
    website: getFirstValue(brand?.website, brand?.websiteUrl, brand?.url),
    isActive: brand?.isActive !== false,
  }));
}

function cleanBrands(value: any) {
  return cleanRows(Array.isArray(value) ? value : [], (brand) => Boolean(getFirstValue(brand.name, brand.logoUrl))).map(
    (brand: any) => ({
      id: String(brand.id || ""),
      name: String(brand.name || "").trim(),
      logoUrl: String(brand.logoUrl || "").trim(),
      website: String(brand.website || "").trim(),
      isActive: brand.isActive !== false,
    }),
  );
}

function normalizeBlogPosts(value: any) {
  const rows = Array.isArray(value) ? value : [];

  if (!rows.length) return [createEmptyBlogPost(1)];

  return rows.map((post: any, index: number) => ({
    id: String(post?.id || `blog-${index + 1}`),
    titleAr: getFirstValue(post?.titleAr, post?.title),
    titleEn: getFirstValue(post?.titleEn, post?.title),
    slug: getFirstValue(post?.slug),
    excerptAr: getFirstValue(post?.excerptAr, post?.excerpt, post?.summary),
    excerptEn: getFirstValue(post?.excerptEn, post?.excerpt, post?.summary),
    contentAr: getFirstValue(post?.contentAr, post?.content),
    contentEn: getFirstValue(post?.contentEn, post?.content),
    imageUrl: getFirstValue(post?.imageUrl, post?.coverUrl),
    isPublished: post?.isPublished !== false,
  }));
}

function cleanBlogPosts(value: any) {
  return cleanRows(Array.isArray(value) ? value : [], (post) =>
    Boolean(getFirstValue(post.titleAr, post.titleEn, post.slug, post.excerptAr, post.excerptEn, post.imageUrl)),
  ).map((post: any, index: number) => {
    const title = getFirstValue(post.titleAr, post.titleEn, `post-${index + 1}`);
    return {
      id: String(post.id || ""),
      titleAr: String(post.titleAr || "").trim(),
      titleEn: String(post.titleEn || "").trim(),
      slug: normalizeSlug(String(getFirstValue(post.slug, title, `post-${index + 1}`))),
      excerptAr: String(post.excerptAr || "").trim(),
      excerptEn: String(post.excerptEn || "").trim(),
      contentAr: String(post.contentAr || "").trim(),
      contentEn: String(post.contentEn || "").trim(),
      imageUrl: String(post.imageUrl || "").trim(),
      isPublished: post.isPublished !== false,
    };
  });
}

function buildHomepagePayload(homepage: Record<string, any>) {
  return {
    enableHeroBanner: Boolean(homepage.enableHeroBanner),
    heroBanners: cleanHeroBanners(homepage.heroBanners),
    enableFeaturedCategories: Boolean(homepage.enableFeaturedCategories),
    featuredCategoryIds: cleanStringRows(homepage.featuredCategoryIds),
    enableFeaturedProducts: Boolean(homepage.enableFeaturedProducts),
    featuredProductIds: cleanStringRows(homepage.featuredProductIds),
    enableBestSellers: Boolean(homepage.enableBestSellers),
    enableNewArrivals: Boolean(homepage.enableNewArrivals),
    enableOffers: Boolean(homepage.enableOffers),
    enableBrands: Boolean(homepage.enableBrands),
    enableReviews: Boolean(homepage.enableReviews),
    enableNewsletter: Boolean(homepage.enableNewsletter),
    enableBlogPreview: Boolean(homepage.enableBlogPreview),
    enableServices: Boolean(homepage.enableServices),
    services: cleanServices(homepage.services),
    enableInstagramGallery: Boolean(homepage.enableInstagramGallery),
    instagramImages: cleanInstagramImages(homepage.instagramImages),
  };
}

function normalizeSlug(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function safeNumber(value: any, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback;

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeNullableNumber(value: any) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pickPaymentMethods(form: FormState) {
  const enabled = PAYMENT_METHODS.filter((item) => Boolean(form.paymentMethods[item.key]?.isEnabled)).map(
    (item) => item.key,
  );

  return enabled.length ? enabled : ["CASH_ON_DELIVERY"];
}

function buildStoreFallbackPayload(form: FormState) {
  const name = String(
    getFirstValue(
      form.storeInfo.name,
      form.storeInfo.nameAr,
      form.storeInfo.nameEn,
      "Mizar Store",
    ),
  ).trim();

  const slug = normalizeSlug(String(getFirstValue(form.storeInfo.slug, name)));
  const paymentMethods = pickPaymentMethods(form);

  const socials = form.socialLinks || {};
  const contactInfo = form.contactInfo || {};
  const address = form.address || {};
  const shipping = form.shipping || {};
  const productSettings = form.productSettings || {};
  const detailedPayload = buildSavePayload("", form);
  const settingsFallback = {
    storeInfo: detailedPayload.storeInfo,
    contactInfo: detailedPayload.contactInfo,
    address: detailedPayload.address,
    homepage: detailedPayload.homepage,
    socialLinks: detailedPayload.socialLinks,
    paymentMethods: detailedPayload.paymentMethods,
    shipping: detailedPayload.shipping,
    taxes: detailedPayload.taxes,
    policies: detailedPayload.policies,
    seo: detailedPayload.seo,
    productSettings: detailedPayload.productSettings,
    footer: detailedPayload.footer,
    notifications: detailedPayload.notifications,
    brands: detailedPayload.brands,
    blogPosts: detailedPayload.blogPosts,
  };

  return {
    name,
    slug,
    category: String(getFirstValue(form.storeInfo.category, "General")),
    subCategory: form.storeInfo.subCategory || null,
    theme: "modern",
    description:
      getFirstValue(
        form.storeInfo.shortDescription,
        form.storeInfo.description,
        form.storeInfo.descriptionAr,
        form.storeInfo.descriptionEn,
        form.storeInfo.fullDescription,
      ) || null,

    nameAr: form.storeInfo.nameAr || null,
    nameEn: form.storeInfo.nameEn || null,
    shortDescription: form.storeInfo.shortDescription || null,
    descriptionAr: form.storeInfo.descriptionAr || null,
    descriptionEn: form.storeInfo.descriptionEn || null,
    fullDescription: form.storeInfo.fullDescription || null,
    tagline: form.storeInfo.tagline || null,
    ownerName: form.storeInfo.ownerName || null,
    establishedYear: form.storeInfo.establishedYear || null,
    status: form.storeInfo.status || "OPEN",
    defaultLanguage: form.storeInfo.defaultLanguage || "ar",

    logoUrl: form.storeInfo.logoUrl || null,
    coverUrl: form.storeInfo.coverUrl || null,
    faviconUrl: form.storeInfo.faviconUrl || null,
    bannerUrl: getFirstValue(form.storeInfo.bannerUrl, form.storeInfo.coverUrl) || null,

    whatsapp: contactInfo.whatsappNumber || null,
    phone: contactInfo.mobileNumber || null,
    contactPhone: contactInfo.mobileNumber || null,
    email: contactInfo.businessEmail || null,
    contactEmail: contactInfo.supportEmail || contactInfo.businessEmail || null,
    website: null,

    country: address.country || null,
    governorate: address.state || null,
    city: address.city || null,
    address:
      getFirstValue(
        address.address,
        [address.country, address.state, address.city, address.district, address.street]
          .filter(Boolean)
          .join(" - "),
      ) || null,

    shippingFee: safeNumber(shipping.shippingCost, 0),
    freeShippingThreshold: safeNullableNumber(shipping.freeShippingThreshold),
    shippingPolicy: shipping.shippingPolicy || null,

    currency: String(getFirstValue(productSettings.currency, "EGP")),
    paymentMethods,
    paymentMethod: paymentMethods[0],

    facebook: socials.FACEBOOK || null,
    instagram: socials.INSTAGRAM || null,
    tiktok: socials.TIKTOK || null,
    snapchat: socials.SNAPCHAT || null,
    x: socials.X || null,
    facebookUrl: socials.FACEBOOK || null,
    instagramUrl: socials.INSTAGRAM || null,
    tiktokUrl: socials.TIKTOK || null,
    websiteUrl: socials.WEBSITE || null,

    templateConfig: {
      templateKey: "MIZAR_PREMIUM",
      selectedTemplate: "MIZAR_PREMIUM",
      storefrontTemplate: "MIZAR_PREMIUM",
      settingsFallback,
      dashboardSettings: settingsFallback,
      homepageSettings: detailedPayload.homepage,
      brands: detailedPayload.brands,
      blogPosts: detailedPayload.blogPosts,
      updatedAt: new Date().toISOString(),
    },

    isActive: form.storeInfo.status !== "CLOSED",
  };
}

async function readJsonSafely(response: Response) {
  const text = await response.text().catch(() => "");

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getPayloadMessage(payload: any, fallback: string) {
  return (
    payload?.message ||
    payload?.error ||
    payload?.details ||
    (typeof payload === "string" ? payload : "") ||
    fallback
  );
}

async function saveWithDashboardSettingsEndpoint(storeId: string, form: FormState) {
  const response = await fetch("/api/dashboard/store-settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(buildSavePayload(storeId, form)),
  });

  const payload = await readJsonSafely(response);

  return {
    ok: response.ok && payload?.success !== false,
    status: response.status,
    payload,
    message: getPayloadMessage(payload, "فشل حفظ الإعدادات"),
  };
}

async function saveWithStoreEndpoint(storeId: string, form: FormState) {
  const response = await fetch(`/api/stores/${encodeURIComponent(storeId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(buildStoreFallbackPayload(form)),
  });

  const payload = await readJsonSafely(response);

  return {
    ok: response.ok && payload?.success !== false,
    status: response.status,
    payload,
    message: getPayloadMessage(payload, "فشل حفظ بيانات المتجر"),
  };
}

async function saveStoreSettings(storeId: string, form: FormState) {
  const settingsResult = await saveWithDashboardSettingsEndpoint(storeId, form);

  if (settingsResult.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/merchant/login?next=/dashboard/settings";
    }

    throw new Error("انتهت جلسة تسجيل الدخول. سجل الدخول مرة أخرى.");
  }

  if (settingsResult.ok) {
    return { mode: "settings", result: settingsResult };
  }

  const storeResult = await saveWithStoreEndpoint(storeId, form);

  if (storeResult.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/merchant/login?next=/dashboard/settings";
    }

    throw new Error("انتهت جلسة تسجيل الدخول. سجل الدخول مرة أخرى.");
  }

  if (storeResult.ok) {
    return { mode: "store", result: storeResult };
  }

  throw new Error(storeResult.message || settingsResult.message || "فشل حفظ إعدادات المتجر");
}

function normalizeSettingsToForm(payload: any): FormState {
  const form = createEmptyForm();

  const store = payload?.store || {};
  const templateConfig = parseRecord(store.templateConfig);
  const fallbackSettings = parseRecord(
    templateConfig.settingsFallback ||
      templateConfig.dashboardSettings ||
      templateConfig.settings ||
      templateConfig,
  );
  const apiSettings = hasObjectValues(payload?.settings) ? payload.settings : {};
  const settings = mergeDashboardSettings(apiSettings, fallbackSettings);
  const storeInfo = settings.storeInfo || {};
  const contactInfo = settings.contactInfo || settings.contactSettings || {};
  const address = settings.address || settings.addressSettings || {};
  const shipping = settings.shipping || settings.shippingSettings || {};
  const taxes = settings.taxes || settings.taxSettings || {};
  const seo = settings.seo || settings.seoSettings || {};
  const homepage = settings.homepage || settings.homepageSettings || templateConfig.homepageSettings || {};
  const footer = settings.footer || settings.footerSettings || {};
  const productSettings = settings.productSettings || {};
  const notifications = settings.notifications || settings.notificationSettings || {};

  form.storeInfo = {
    ...form.storeInfo,
    name: getFirstValue(storeInfo.name, store.name),
    nameAr: getFirstValue(storeInfo.nameAr, store.nameAr),
    nameEn: getFirstValue(storeInfo.nameEn, store.nameEn),
    slug: getFirstValue(storeInfo.slug, store.slug),
    category: getFirstValue(storeInfo.category, store.category, "General"),
    subCategory: getFirstValue(storeInfo.subCategory, store.subCategory),
    shortDescription: getFirstValue(storeInfo.shortDescription, store.shortDescription),
    description: getFirstValue(storeInfo.description, store.description),
    descriptionAr: getFirstValue(storeInfo.descriptionAr, store.descriptionAr),
    descriptionEn: getFirstValue(storeInfo.descriptionEn, store.descriptionEn),
    fullDescription: getFirstValue(storeInfo.fullDescription, store.fullDescription),
    tagline: getFirstValue(storeInfo.tagline, store.tagline),
    ownerName: getFirstValue(storeInfo.ownerName, store.ownerName),
    establishedYear: getFirstValue(storeInfo.establishedYear, store.establishedYear),
    logoUrl: getFirstValue(storeInfo.logoUrl, store.logoUrl),
    coverUrl: getFirstValue(storeInfo.coverUrl, store.coverUrl),
    faviconUrl: getFirstValue(storeInfo.faviconUrl, store.faviconUrl),
    bannerUrl: getFirstValue(storeInfo.bannerUrl, store.bannerUrl),
    status: getFirstValue(storeInfo.status, store.status, store.isActive === false ? "CLOSED" : "OPEN"),
    defaultLanguage: getFirstValue(storeInfo.defaultLanguage, store.defaultLanguage, "ar"),
  };

  form.contactInfo = {
    ...form.contactInfo,
    businessEmail: getFirstValue(contactInfo.businessEmail, store.email),
    supportEmail: getFirstValue(contactInfo.supportEmail, store.contactEmail),
    mobileNumber: getFirstValue(contactInfo.mobileNumber, store.phone),
    whatsappNumber: getFirstValue(contactInfo.whatsappNumber, store.whatsapp),
    landlineNumber: getFirstValue(contactInfo.landlineNumber),
    emergencyContact: getFirstValue(contactInfo.emergencyContact),
    workingDays: contactInfo.workingDays || [],
    workingHours:
      typeof contactInfo.workingHours === "string"
        ? contactInfo.workingHours
        : JSON.stringify(contactInfo.workingHours || "", null, 2),
  };

  form.address = {
    ...form.address,
    country: getFirstValue(address.country, store.country, "Egypt"),
    state: getFirstValue(address.state, store.state, store.governorate),
    city: getFirstValue(address.city, store.city),
    district: getFirstValue(address.district),
    street: getFirstValue(address.street),
    buildingNumber: getFirstValue(address.buildingNumber),
    postalCode: getFirstValue(address.postalCode),
    googleMapsUrl: getFirstValue(address.googleMapsUrl),
    latitude: getFirstValue(address.latitude),
    longitude: getFirstValue(address.longitude),
    address: getFirstValue(address.address, store.address),
  };

  form.shipping = {
    ...form.shipping,
    shippingCompaniesText: toTextList(shipping.shippingCompanies),
    shippingCost: getFirstValue(shipping.shippingCost, store.shippingFee, 0),
    freeShippingThreshold: getFirstValue(shipping.freeShippingThreshold, store.freeShippingThreshold),
    estimatedDeliveryTime: getFirstValue(shipping.estimatedDeliveryTime),
    pickupAvailable: Boolean(shipping.pickupAvailable),
    shippingPolicy: getFirstValue(shipping.shippingPolicy, store.shippingPolicy),
  };

  form.taxes = {
    ...form.taxes,
    pricesIncludeTax: Boolean(taxes?.pricesIncludeTax),
    taxPercentage: getFirstValue(taxes?.taxPercentage),
    commercialRegistrationNumber: getFirstValue(taxes?.commercialRegistrationNumber),
    taxRegistrationNumber: getFirstValue(taxes?.taxRegistrationNumber),
  };

  form.seo = {
    ...form.seo,
    metaTitle: getFirstValue(seo?.metaTitle),
    metaDescription: getFirstValue(seo?.metaDescription),
    metaKeywords: getFirstValue(seo?.metaKeywords),
    ogImageUrl: getFirstValue(seo?.ogImageUrl),
    canonicalUrl: getFirstValue(seo?.canonicalUrl),
    robotsIndex: seo?.robotsIndex !== false,
  };

  form.homepage = {
    ...form.homepage,
    ...homepage,
    heroBanners: normalizeHeroBanners(homepage.heroBanners || homepage.banners || homepage.heroSlides),
    featuredCategoryIds: normalizeStringRows(homepage.featuredCategoryIds),
    featuredProductIds: normalizeStringRows(homepage.featuredProductIds),
    services: normalizeServices(homepage.services),
    instagramImages: normalizeInstagramImages(homepage.instagramImages),
    brands: normalizeBrands(settings.brands || templateConfig.brands || store.brands),
    blogPosts: normalizeBlogPosts(settings.blogPosts || templateConfig.blogPosts || store.blogPosts),
  };

  form.footer = {
    ...form.footer,
    aboutStoreAr: getFirstValue(footer?.aboutStoreAr),
    aboutStoreEn: getFirstValue(footer?.aboutStoreEn),
    copyrightText: getFirstValue(footer?.copyrightText),
    quickLinksText: toTextList(footer?.quickLinks),
    customerServiceLinksText: toTextList(footer?.customerServiceLinks),
    paymentIconsText: toTextList(footer?.paymentIcons),
    shippingPartnersText: toTextList(footer?.shippingPartners),
  };

  form.productSettings = {
    ...form.productSettings,
    ...productSettings,
    currency: getFirstValue(productSettings.currency, store.currency, form.productSettings.currency),
  };

  form.notifications = {
    ...form.notifications,
    ...notifications,
  };

  const socialLinks: Record<string, string> = {
    FACEBOOK: store.facebook || "",
    INSTAGRAM: store.instagram || "",
    TIKTOK: store.tiktok || "",
    SNAPCHAT: store.snapchat || "",
    X: store.x || "",
  };
  for (const item of settings.socialLinks || []) {
    if (item?.platform && item?.url) {
      socialLinks[item.platform] = item.url;
    }
  }
  form.socialLinks = socialLinks;

  const paymentMethods: Record<string, any> = {};
  const rawStorePaymentMethods = Array.isArray(store.paymentMethods)
    ? store.paymentMethods
    : typeof store.paymentMethods === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(store.paymentMethods);
            return Array.isArray(parsed) ? parsed : store.paymentMethods.split(",");
          } catch {
            return store.paymentMethods.split(",");
          }
        })()
      : [];
  const storePaymentMethods = rawStorePaymentMethods
    .map((item: any) => String(item || "").trim())
    .filter(Boolean);

  for (const method of storePaymentMethods.length ? storePaymentMethods : [store.paymentMethod].filter(Boolean)) {
    paymentMethods[String(method)] = {
      isEnabled: true,
      configText: "",
    };
  }

  for (const method of settings.paymentMethods || []) {
    if (method?.type) {
      paymentMethods[method.type] = {
        isEnabled: Boolean(method.isEnabled),
        configText:
          method.config && typeof method.config === "object"
            ? JSON.stringify(method.config, null, 2)
            : method.config || "",
      };
    }
  }
  form.paymentMethods = paymentMethods;

  const policies: Record<string, any> = {};
  for (const policy of settings.policies || []) {
    if (policy?.type) {
      policies[policy.type] = {
        titleAr: policy.titleAr || "",
        titleEn: policy.titleEn || "",
        contentAr: policy.contentAr || "",
        contentEn: policy.contentEn || "",
        isActive: policy.isActive !== false,
      };
    }
  }
  form.policies = policies;

  return form;
}

function buildSavePayload(storeId: string, form: FormState) {
  const socialLinks = SOCIALS.map((item) => ({
    platform: item.key,
    url: form.socialLinks[item.key] || "",
    isActive: Boolean(form.socialLinks[item.key]),
  })).filter((item) => item.url);

  const paymentMethods = PAYMENT_METHODS.map((item) => {
    const row = form.paymentMethods[item.key] || {};
    let config: any = null;

    if (row.configText) {
      try {
        config = JSON.parse(row.configText);
      } catch {
        config = { note: row.configText };
      }
    }

    return {
      type: item.key,
      isEnabled: Boolean(row.isEnabled),
      config,
    };
  });

  const policies = POLICY_TYPES.map((item) => {
    const row = form.policies[item.key] || {};

    return {
      type: item.key,
      titleAr: row.titleAr || item.label,
      titleEn: row.titleEn || "",
      contentAr: row.contentAr || "",
      contentEn: row.contentEn || "",
      isActive: row.isActive !== false,
    };
  }).filter((item) => item.contentAr || item.contentEn || item.isActive);

  return {
    storeId,
    storeInfo: {
      ...form.storeInfo,
    },
    contactInfo: {
      ...form.contactInfo,
    },
    address: {
      ...form.address,
    },
    homepage: buildHomepagePayload(form.homepage),
    brands: cleanBrands(form.homepage.brands),
    blogPosts: cleanBlogPosts(form.homepage.blogPosts),
    socialLinks,
    paymentMethods,
    shipping: {
      shippingCompanies: textToArray(form.shipping.shippingCompaniesText),
      shippingCost: Number(form.shipping.shippingCost || 0),
      freeShippingThreshold:
        form.shipping.freeShippingThreshold === ""
          ? null
          : Number(form.shipping.freeShippingThreshold),
      estimatedDeliveryTime: form.shipping.estimatedDeliveryTime,
      pickupAvailable: Boolean(form.shipping.pickupAvailable),
      shippingPolicy: form.shipping.shippingPolicy,
    },
    taxes: {
      ...form.taxes,
      taxPercentage:
        form.taxes.taxPercentage === "" ? null : Number(form.taxes.taxPercentage),
    },
    policies,
    seo: {
      ...form.seo,
    },
    productSettings: {
      ...form.productSettings,
      defaultProductsPerPage: Number(form.productSettings.defaultProductsPerPage || 24),
    },
    footer: {
      aboutStoreAr: form.footer.aboutStoreAr,
      aboutStoreEn: form.footer.aboutStoreEn,
      copyrightText: form.footer.copyrightText,
      quickLinks: textToArray(form.footer.quickLinksText),
      customerServiceLinks: textToArray(form.footer.customerServiceLinksText),
      paymentIcons: textToArray(form.footer.paymentIconsText),
      shippingPartners: textToArray(form.footer.shippingPartnersText),
    },
    notifications: {
      ...form.notifications,
    },
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="mizar-field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="mizar-field mizar-field-full">
      <span>{label}</span>
      <textarea
        value={value ?? ""}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="mizar-field">
      <span>{label}</span>
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SwitchField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="mizar-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="mizar-switch-ui" />
      <strong>{label}</strong>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export default function DashboardSettingsPage() {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("store");
  const [form, setForm] = useState<FormState>(() => createEmptyForm());
  const [completion, setCompletion] = useState({ completed: 0, total: 15, percentage: 0 });
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductOption[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategoryOption[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [categorySelectValue, setCategorySelectValue] = useState("");
  const [productSelectValue, setProductSelectValue] = useState("");

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) || null,
    [stores, selectedStoreId],
  );

  const selectedCategoryValues = useMemo(
    () => cleanStringRows(form.homepage.featuredCategoryIds),
    [form.homepage.featuredCategoryIds],
  );

  const selectedProductValues = useMemo(
    () => cleanStringRows(form.homepage.featuredProductIds),
    [form.homepage.featuredProductIds],
  );

  const availableCategoryOptions = useMemo(() => {
    const selected = new Set(selectedCategoryValues.map(normalizeKey));

    return catalogCategories.filter(
      (category) => !selected.has(normalizeKey(category.value)) && !selected.has(normalizeKey(category.label)),
    );
  }, [catalogCategories, selectedCategoryValues]);

  const availableProductOptions = useMemo(() => {
    const selected = new Set(selectedProductValues.map(normalizeKey));

    return catalogProducts.filter((product) => {
      const keys = [product.id, product.slug, product.sku, product.name].map(normalizeKey).filter(Boolean);

      return !keys.some((key) => selected.has(key));
    });
  }, [catalogProducts, selectedProductValues]);

  useEffect(() => {
    let mounted = true;

    async function loadStores() {
      try {
        setLoadingStores(true);

        const response = await fetch(`/api/stores?t=${Date.now()}`, {
          cache: "no-store",
          credentials: "include",
        });

        const payload = await response.json().catch(() => null);
        const nextStores = extractStores(payload);

        if (!mounted) return;

        setStores(nextStores);

        const savedStoreId =
          typeof window !== "undefined"
            ? localStorage.getItem("mizar-store-id") || ""
            : "";

        const nextSelected =
          nextStores.find((store) => store.id === savedStoreId)?.id ||
          nextStores[0]?.id ||
          "";

        setSelectedStoreId(nextSelected);

        const store = nextStores.find((item) => item.id === nextSelected);
        if (store) {
          setForm(normalizeSettingsToForm({ store }));
        }

        if (nextSelected && typeof window !== "undefined") {
          localStorage.setItem("mizar-store-id", nextSelected);
          if (store?.slug) localStorage.setItem("mizar-store-slug", store.slug);
        }
      } catch (error) {
        console.error(error);
        setNotice({
          type: "error",
          text: "تعذر تحميل المتاجر. تأكد من تسجيل الدخول كتاجر.",
        });
      } finally {
        if (mounted) setLoadingStores(false);
      }
    }

    loadStores();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;

    let mounted = true;

    async function loadSettings() {
      try {
        setLoadingSettings(true);
        setNotice(null);

        const response = await fetch(
          `/api/dashboard/store-settings?storeId=${encodeURIComponent(selectedStoreId)}&t=${Date.now()}`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.message || "تعذر تحميل الإعدادات");
        }

        if (!mounted) return;

        setForm(normalizeSettingsToForm(payload));
        setCompletion(payload?.settings?.completion || { completed: 0, total: 15, percentage: 0 });
      } catch (error) {
        console.error(error);
        if (mounted) {
          const fallbackStore = stores.find((store) => store.id === selectedStoreId);

          if (fallbackStore) {
            setForm(normalizeSettingsToForm({ store: fallbackStore }));
            setCompletion({ completed: 0, total: 15, percentage: 0 });
            setNotice({
              type: "info",
              text: "تم تحميل البيانات الأساسية للمتجر. سيتم استخدام مسار الحفظ البديل إذا لم يكن مسار الإعدادات التفصيلية متاحًا.",
            });
          } else {
            setNotice({
              type: "error",
              text: error instanceof Error ? error.message : "تعذر تحميل إعدادات المتجر",
            });
          }
        }
      } finally {
        if (mounted) setLoadingSettings(false);
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [selectedStoreId]);

  useEffect(() => {
    const storeSlug = selectedStore?.slug || form.storeInfo.slug;

    if (!storeSlug) {
      setCatalogProducts([]);
      setCatalogCategories([]);
      setCatalogError("");
      return;
    }

    let mounted = true;

    async function loadCatalogOptions() {
      try {
        setLoadingCatalog(true);
        setCatalogError("");

        const response = await fetch(`/api/storefront/${encodeURIComponent(storeSlug)}?t=${Date.now()}`, {
          cache: "no-store",
          credentials: "include",
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.message || "تعذر تحميل المنتجات والتصنيفات");
        }

        const catalog = extractCatalogFromStorefront(payload);

        if (!mounted) return;

        setCatalogProducts(catalog.products);
        setCatalogCategories(catalog.categories);
      } catch (error) {
        if (!mounted) return;

        setCatalogProducts([]);
        setCatalogCategories([]);
        setCatalogError(error instanceof Error ? error.message : "تعذر تحميل المنتجات والتصنيفات");
      } finally {
        if (mounted) setLoadingCatalog(false);
      }
    }

    loadCatalogOptions();

    return () => {
      mounted = false;
    };
  }, [selectedStore?.slug, form.storeInfo.slug]);

  function updateSection(section: keyof FormState, key: string, value: any) {
    setForm((previous) => ({
      ...previous,
      [section]: {
        ...(previous[section] as Record<string, any>),
        [key]: value,
      },
    }));
  }

  function updatePolicy(type: string, key: string, value: any) {
    setForm((previous) => ({
      ...previous,
      policies: {
        ...previous.policies,
        [type]: {
          ...(previous.policies[type] || {}),
          [key]: value,
        },
      },
    }));
  }

  function updatePayment(type: string, key: string, value: any) {
    setForm((previous) => ({
      ...previous,
      paymentMethods: {
        ...previous.paymentMethods,
        [type]: {
          ...(previous.paymentMethods[type] || {}),
          [key]: value,
        },
      },
    }));
  }


  function updateHomepageListItem(listKey: string, index: number, key: string, value: any) {
    setForm((previous) => {
      const rows = Array.isArray(previous.homepage[listKey]) ? previous.homepage[listKey] : [];

      return {
        ...previous,
        homepage: {
          ...previous.homepage,
          [listKey]: rows.map((row: any, rowIndex: number) =>
            rowIndex === index ? { ...row, [key]: value } : row,
          ),
        },
      };
    });
  }

  function addHomepageListItem(listKey: string, factory: (index: number) => Record<string, any>) {
    setForm((previous) => {
      const rows = Array.isArray(previous.homepage[listKey]) ? previous.homepage[listKey] : [];

      return {
        ...previous,
        homepage: {
          ...previous.homepage,
          [listKey]: [...rows, factory(rows.length + 1)],
        },
      };
    });
  }

  function removeHomepageListItem(listKey: string, index: number, factory: (index: number) => Record<string, any>) {
    setForm((previous) => {
      const rows = Array.isArray(previous.homepage[listKey]) ? previous.homepage[listKey] : [];
      const nextRows = rows.filter((_: any, rowIndex: number) => rowIndex !== index);

      return {
        ...previous,
        homepage: {
          ...previous.homepage,
          [listKey]: nextRows.length ? nextRows : [factory(1)],
        },
      };
    });
  }

  function updateHomepageStringRow(listKey: string, index: number, value: string) {
    setForm((previous) => {
      const rows = Array.isArray(previous.homepage[listKey]) ? previous.homepage[listKey] : [""];

      return {
        ...previous,
        homepage: {
          ...previous.homepage,
          [listKey]: rows.map((row: string, rowIndex: number) => (rowIndex === index ? value : row)),
        },
      };
    });
  }

  function addHomepageStringRow(listKey: string) {
    setForm((previous) => {
      const rows = Array.isArray(previous.homepage[listKey]) ? previous.homepage[listKey] : [];

      return {
        ...previous,
        homepage: {
          ...previous.homepage,
          [listKey]: [...rows, ""],
        },
      };
    });
  }

  function removeHomepageStringRow(listKey: string, index: number) {
    setForm((previous) => {
      const rows = Array.isArray(previous.homepage[listKey]) ? previous.homepage[listKey] : [];
      const nextRows = rows.filter((_: string, rowIndex: number) => rowIndex !== index);

      return {
        ...previous,
        homepage: {
          ...previous.homepage,
          [listKey]: nextRows.length ? nextRows : [""],
        },
      };
    });
  }

  function addHomepageStringValue(listKey: string, value: string) {
    const cleanValue = String(value || "").trim();

    if (!cleanValue) return;

    setForm((previous) => {
      const rows = cleanStringRows(previous.homepage[listKey]);
      const exists = rows.some((row) => normalizeKey(row) === normalizeKey(cleanValue));

      return {
        ...previous,
        homepage: {
          ...previous.homepage,
          [listKey]: exists ? rows : [...rows, cleanValue],
        },
      };
    });
  }

  function removeHomepageStringValue(listKey: string, value: string) {
    setForm((previous) => {
      const rows = cleanStringRows(previous.homepage[listKey]);
      const nextRows = rows.filter((row) => normalizeKey(row) !== normalizeKey(value));

      return {
        ...previous,
        homepage: {
          ...previous.homepage,
          [listKey]: nextRows.length ? nextRows : [""],
        },
      };
    });
  }

  function addSelectedCategory() {
    if (!categorySelectValue) return;

    addHomepageStringValue("featuredCategoryIds", categorySelectValue);
    setCategorySelectValue("");
  }

  function addSelectedProduct() {
    if (!productSelectValue) return;

    addHomepageStringValue("featuredProductIds", productSelectValue);
    setProductSelectValue("");
  }

  async function uploadFile(fieldKey: "logoUrl" | "coverUrl" | "faviconUrl" | "bannerUrl", file: File | null) {
    if (!file) return;

    try {
      setUploadingKey(fieldKey);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "فشل رفع الصورة");
      }

      const url =
        payload?.url ||
        payload?.fileUrl ||
        payload?.path ||
        payload?.data?.url ||
        payload?.file?.url;

      if (!url) {
        throw new Error("لم يتم استلام رابط الصورة من السيرفر");
      }

      updateSection("storeInfo", fieldKey, url);
      setNotice({ type: "success", text: "تم رفع الصورة بنجاح" });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "فشل رفع الصورة",
      });
    } finally {
      setUploadingKey("");
    }
  }


  async function uploadHomepageImage(
    listKey: string,
    index: number,
    fieldKey: string,
    file: File | null,
  ) {
    if (!file) return;

    const uploadKey = `${listKey}-${index}-${fieldKey}`;

    try {
      setUploadingKey(uploadKey);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "فشل رفع الصورة");
      }

      const url =
        payload?.url ||
        payload?.fileUrl ||
        payload?.path ||
        payload?.data?.url ||
        payload?.file?.url;

      if (!url) {
        throw new Error("لم يتم استلام رابط الصورة من السيرفر");
      }

      updateHomepageListItem(listKey, index, fieldKey, url);

      if (fieldKey === "url") {
        updateHomepageListItem(listKey, index, "imageUrl", url);
      }

      setNotice({ type: "success", text: "تم رفع الصورة بنجاح" });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "فشل رفع الصورة",
      });
    } finally {
      setUploadingKey("");
    }
  }

  async function saveSettings() {
    if (!selectedStoreId) {
      setNotice({ type: "error", text: "اختر متجرًا أولًا" });
      return;
    }

    const storeName = String(
      getFirstValue(form.storeInfo.name, form.storeInfo.nameAr, form.storeInfo.nameEn),
    ).trim();
    const storeSlug = normalizeSlug(String(getFirstValue(form.storeInfo.slug, storeName)));

    if (!storeName) {
      setNotice({ type: "error", text: "اسم المتجر مطلوب قبل الحفظ" });
      setActiveTab("store");
      return;
    }

    if (!storeSlug) {
      setNotice({ type: "error", text: "رابط المتجر غير صالح. استخدم حروف إنجليزية وأرقام فقط" });
      setActiveTab("store");
      return;
    }

    try {
      setSaving(true);
      setNotice(null);

      const { mode, result } = await saveStoreSettings(selectedStoreId, {
        ...form,
        storeInfo: {
          ...form.storeInfo,
          name: storeName,
          slug: storeSlug,
        },
      });

      const payload = result.payload;

      if (payload?.settings || payload?.store) {
        const nextStore = payload?.store || payload?.data?.store;

        if (payload?.settings) {
          setForm(normalizeSettingsToForm(payload));
          setCompletion(payload.settings.completion || completion);
        } else {
          setForm(normalizeSettingsToForm(payload));
        }

        if (nextStore?.id) {
          setStores((previousStores) =>
            previousStores.map((store) =>
              store.id === nextStore.id
                ? {
                    ...store,
                    name: nextStore.name || store.name,
                    slug: nextStore.slug || store.slug,
                    category: nextStore.category || store.category,
                    logoUrl: nextStore.logoUrl || store.logoUrl,
                    coverUrl: nextStore.coverUrl || store.coverUrl,
                    bannerUrl: nextStore.bannerUrl || store.bannerUrl,
                    faviconUrl: nextStore.faviconUrl || store.faviconUrl,
                  }
                : store,
            ),
          );
        }
      } else {
        setForm((previous) => ({
          ...previous,
          storeInfo: {
            ...previous.storeInfo,
            name: storeName,
            slug: storeSlug,
          },
        }));
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("mizar-store-id", selectedStoreId);
        localStorage.setItem("mizar-store-slug", storeSlug);
      }

      setNotice({
        type: "success",
        text:
          mode === "settings"
            ? "تم حفظ إعدادات المتجر بنجاح"
            : "تم حفظ بيانات المتجر ومحتوى الصفحة الرئيسية بنجاح باستخدام مسار التوافق",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mizar-settings-page" dir="rtl">
      <style>{styles}</style>

      <div className="mizar-settings-hero">
        <div>
          <span className="mizar-kicker">إعدادات المتجر</span>
          <h1>تحكم في بيانات ومحتوى متجرك</h1>
          <p>
            هذه الصفحة مسؤولة عن بيانات المتجر، التواصل، الشحن، الدفع، السياسات
            ومحتوى الواجهة. ألوان وتصميم المتجر يتم تحديدها من القالب المختار فقط.
          </p>
        </div>

        <div className="mizar-hero-actions">
          <Link className="mizar-btn mizar-btn-light" href="/dashboard/themes">
            تغيير قالب المتجر
          </Link>

          {selectedStore?.slug ? (
            <Link
              className="mizar-btn mizar-btn-light"
              href={`/store/${selectedStore.slug}?preview=1&t=${Date.now()}`}
              target="_blank"
            >
              معاينة المتجر
            </Link>
          ) : null}

          <button className="mizar-btn mizar-btn-primary" onClick={saveSettings} disabled={saving || loadingSettings}>
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </div>

      {notice ? (
        <div className={`mizar-notice ${notice.type}`}>
          {notice.text}
        </div>
      ) : null}

      <div className="mizar-top-grid">
        <div className="mizar-card">
          <label className="mizar-field">
            <span>المتجر الحالي</span>
            <select
              value={selectedStoreId}
              disabled={loadingStores}
              onChange={(event) => {
                const id = event.target.value;
                setSelectedStoreId(id);

                const store = stores.find((item) => item.id === id);
                if (store) {
                  setForm(normalizeSettingsToForm({ store }));
                }

                if (typeof window !== "undefined") {
                  localStorage.setItem("mizar-store-id", id);
                  if (store?.slug) localStorage.setItem("mizar-store-slug", store.slug);
                }
              }}
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} — /{store.slug}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mizar-card mizar-completion">
          <div>
            <strong>اكتمال بيانات المتجر</strong>
            <span>
              {completion.completed} من {completion.total}
            </span>
          </div>
          <div className="mizar-progress">
            <i style={{ width: `${completion.percentage || 0}%` }} />
          </div>
          <b>{completion.percentage || 0}%</b>
        </div>

        <div className="mizar-card mizar-template-note">
          <strong>ألوان القالب مقفولة</strong>
          <p>
            التاجر لا يغير الألوان من هنا. كل قالب داخل مجلده الخاص يحتوي على
            ألوانه وخطوطه وتنسيقاته.
          </p>
        </div>
      </div>

      <div className="mizar-settings-layout">
        <aside className="mizar-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              <strong>{tab.label}</strong>
              <span>{tab.desc}</span>
            </button>
          ))}
        </aside>

        <main className="mizar-panel">
          {loadingSettings ? (
            <div className="mizar-loading-card">
              <span />
              <strong>جاري تحميل إعدادات المتجر...</strong>
            </div>
          ) : null}

          {!loadingSettings && activeTab === "store" ? (
            <section className="mizar-section">
              <SectionTitle title="بيانات المتجر الأساسية" desc="البيانات التي تظهر في الهيدر، الصفحة الرئيسية، الفوتر وصفحات SEO." />

              <div className="mizar-grid">
                <Field label="اسم المتجر الأساسي" value={form.storeInfo.name} onChange={(v) => updateSection("storeInfo", "name", v)} />
                <Field label="اسم المتجر بالعربي" value={form.storeInfo.nameAr} onChange={(v) => updateSection("storeInfo", "nameAr", v)} />
                <Field label="اسم المتجر بالإنجليزي" value={form.storeInfo.nameEn} onChange={(v) => updateSection("storeInfo", "nameEn", v)} />
                <Field label="رابط المتجر Slug" value={form.storeInfo.slug} onChange={(v) => updateSection("storeInfo", "slug", v)} hint="مثال: kero-store" />

                <SelectField label="تصنيف المتجر" value={form.storeInfo.category} onChange={(v) => updateSection("storeInfo", "category", v)} options={CATEGORIES} />
                <Field label="التصنيف الفرعي" value={form.storeInfo.subCategory} onChange={(v) => updateSection("storeInfo", "subCategory", v)} />

                <SelectField
                  label="حالة المتجر"
                  value={form.storeInfo.status}
                  onChange={(v) => updateSection("storeInfo", "status", v)}
                  options={[
                    { value: "OPEN", label: "مفتوح" },
                    { value: "CLOSED", label: "مغلق" },
                  ]}
                />

                <SelectField
                  label="اللغة الافتراضية"
                  value={form.storeInfo.defaultLanguage}
                  onChange={(v) => updateSection("storeInfo", "defaultLanguage", v)}
                  options={[
                    { value: "ar", label: "العربية" },
                    { value: "en", label: "English" },
                  ]}
                />

                <Field label="اسم مالك المتجر" value={form.storeInfo.ownerName} onChange={(v) => updateSection("storeInfo", "ownerName", v)} />
                <Field label="سنة التأسيس" type="number" value={form.storeInfo.establishedYear} onChange={(v) => updateSection("storeInfo", "establishedYear", v)} />

                <TextArea label="وصف قصير" value={form.storeInfo.shortDescription} onChange={(v) => updateSection("storeInfo", "shortDescription", v)} rows={3} />
                <TextArea label="وصف عربي" value={form.storeInfo.descriptionAr} onChange={(v) => updateSection("storeInfo", "descriptionAr", v)} rows={4} />
                <TextArea label="وصف إنجليزي" value={form.storeInfo.descriptionEn} onChange={(v) => updateSection("storeInfo", "descriptionEn", v)} rows={4} />
                <TextArea label="وصف كامل للمتجر" value={form.storeInfo.fullDescription} onChange={(v) => updateSection("storeInfo", "fullDescription", v)} rows={5} />
              </div>

              <SectionTitle title="صور وهوية المتجر" desc="اللوجو والغلاف والبانر والفافيكون تظهر حسب تصميم القالب." />

              <div className="mizar-upload-grid">
                <UploadBox title="لوجو المتجر" field="logoUrl" value={form.storeInfo.logoUrl} uploadingKey={uploadingKey} onUpload={uploadFile} />
                <UploadBox title="صورة الغلاف" field="coverUrl" value={form.storeInfo.coverUrl} uploadingKey={uploadingKey} onUpload={uploadFile} />
                <UploadBox title="الفافيكون" field="faviconUrl" value={form.storeInfo.faviconUrl} uploadingKey={uploadingKey} onUpload={uploadFile} />
                <UploadBox title="بانر المتجر" field="bannerUrl" value={form.storeInfo.bannerUrl} uploadingKey={uploadingKey} onUpload={uploadFile} />
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "contact" ? (
            <section className="mizar-section">
              <SectionTitle title="بيانات التواصل" desc="تظهر في صفحة تواصل معنا والفوتر وأزرار واتساب داخل القالب." />
              <div className="mizar-grid">
                <Field label="بريد الأعمال" value={form.contactInfo.businessEmail} onChange={(v) => updateSection("contactInfo", "businessEmail", v)} />
                <Field label="بريد خدمة العملاء" value={form.contactInfo.supportEmail} onChange={(v) => updateSection("contactInfo", "supportEmail", v)} />
                <Field label="رقم الموبايل" value={form.contactInfo.mobileNumber} onChange={(v) => updateSection("contactInfo", "mobileNumber", v)} />
                <Field label="رقم واتساب" value={form.contactInfo.whatsappNumber} onChange={(v) => updateSection("contactInfo", "whatsappNumber", v)} />
                <Field label="رقم أرضي اختياري" value={form.contactInfo.landlineNumber} onChange={(v) => updateSection("contactInfo", "landlineNumber", v)} />
                <Field label="تواصل للطوارئ" value={form.contactInfo.emergencyContact} onChange={(v) => updateSection("contactInfo", "emergencyContact", v)} />
                <TextArea label="ساعات العمل" value={form.contactInfo.workingHours} onChange={(v) => updateSection("contactInfo", "workingHours", v)} rows={4} placeholder="مثال: السبت - الخميس من 10 صباحًا حتى 10 مساءً" />
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "address" ? (
            <section className="mizar-section">
              <SectionTitle title="عنوان المتجر" desc="استخدمه في صفحة التواصل، الفوتر، وبيانات الشحن." />
              <div className="mizar-grid">
                <Field label="الدولة" value={form.address.country} onChange={(v) => updateSection("address", "country", v)} />
                <Field label="المحافظة / الولاية" value={form.address.state} onChange={(v) => updateSection("address", "state", v)} />
                <Field label="المدينة" value={form.address.city} onChange={(v) => updateSection("address", "city", v)} />
                <Field label="المنطقة / الحي" value={form.address.district} onChange={(v) => updateSection("address", "district", v)} />
                <Field label="الشارع" value={form.address.street} onChange={(v) => updateSection("address", "street", v)} />
                <Field label="رقم المبنى" value={form.address.buildingNumber} onChange={(v) => updateSection("address", "buildingNumber", v)} />
                <Field label="الرمز البريدي" value={form.address.postalCode} onChange={(v) => updateSection("address", "postalCode", v)} />
                <Field label="رابط Google Maps" value={form.address.googleMapsUrl} onChange={(v) => updateSection("address", "googleMapsUrl", v)} />
                <Field label="Latitude" value={form.address.latitude} onChange={(v) => updateSection("address", "latitude", v)} />
                <Field label="Longitude" value={form.address.longitude} onChange={(v) => updateSection("address", "longitude", v)} />
                <TextArea label="العنوان كاملًا" value={form.address.address} onChange={(v) => updateSection("address", "address", v)} rows={4} />
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "homepage" ? (
            <section className="mizar-section">
              <SectionTitle
                title="إعدادات الصفحة الرئيسية"
                desc="فعّل القسم أولًا، وبعدها ستظهر حقول المحتوى الخاصة به. كل عنصر يمكن إضافته في خانة مستقلة بدون كتابة بيانات متعددة داخل مربع واحد."
              />

              <div className="mizar-switch-grid">
                <SwitchField label="Hero Banner" checked={Boolean(form.homepage.enableHeroBanner)} onChange={(v) => updateSection("homepage", "enableHeroBanner", v)} />
                <SwitchField label="التصنيفات المميزة" checked={Boolean(form.homepage.enableFeaturedCategories)} onChange={(v) => updateSection("homepage", "enableFeaturedCategories", v)} />
                <SwitchField label="المنتجات المميزة" checked={Boolean(form.homepage.enableFeaturedProducts)} onChange={(v) => updateSection("homepage", "enableFeaturedProducts", v)} />
                <SwitchField label="الأكثر مبيعًا" checked={Boolean(form.homepage.enableBestSellers)} onChange={(v) => updateSection("homepage", "enableBestSellers", v)} />
                <SwitchField label="وصل حديثًا" checked={Boolean(form.homepage.enableNewArrivals)} onChange={(v) => updateSection("homepage", "enableNewArrivals", v)} />
                <SwitchField label="العروض" checked={Boolean(form.homepage.enableOffers)} onChange={(v) => updateSection("homepage", "enableOffers", v)} />
                <SwitchField label="البراندات" checked={Boolean(form.homepage.enableBrands)} onChange={(v) => updateSection("homepage", "enableBrands", v)} />
                <SwitchField label="آراء العملاء" checked={Boolean(form.homepage.enableReviews)} onChange={(v) => updateSection("homepage", "enableReviews", v)} hint="تظهر من مراجعات العملاء المعتمدة." />
                <SwitchField label="النشرة البريدية" checked={Boolean(form.homepage.enableNewsletter)} onChange={(v) => updateSection("homepage", "enableNewsletter", v)} hint="إيميلات العملاء تظهر في صفحة النشرة البريدية." />
                <SwitchField label="المدونة" checked={Boolean(form.homepage.enableBlogPreview)} onChange={(v) => updateSection("homepage", "enableBlogPreview", v)} />
                <SwitchField label="خدمات المتجر" checked={Boolean(form.homepage.enableServices)} onChange={(v) => updateSection("homepage", "enableServices", v)} />
                <SwitchField label="Instagram Gallery" checked={Boolean(form.homepage.enableInstagramGallery)} onChange={(v) => updateSection("homepage", "enableInstagramGallery", v)} />
              </div>

              {form.homepage.enableHeroBanner ? (
                <div className="mizar-space-top mizar-row-card">
                  <SectionTitle title="Hero Banners" desc="يمكنك إضافة أكثر من هيرو. القالب يعرض أول هيرو نشط حاليًا، والباقي جاهز لدعم السلايدر لاحقًا." />

                  <div className="mizar-list">
                    {(Array.isArray(form.homepage.heroBanners) ? form.homepage.heroBanners : [createEmptyHeroBanner(1)]).map((hero: any, index: number) => (
                      <div className="mizar-repeat-card" key={hero.id || index}>
                        <div className="mizar-repeat-head">
                          <strong>Hero #{index + 1}</strong>
                          <button type="button" onClick={() => removeHomepageListItem("heroBanners", index, createEmptyHeroBanner)}>حذف</button>
                        </div>
                        <div className="mizar-grid">
                          <Field label="العنوان بالعربي" value={hero.title} onChange={(v) => updateHomepageListItem("heroBanners", index, "title", v)} />
                          <Field label="Title English" value={hero.titleEn} onChange={(v) => updateHomepageListItem("heroBanners", index, "titleEn", v)} />
                          <TextArea label="الوصف بالعربي" value={hero.subtitle} onChange={(v) => updateHomepageListItem("heroBanners", index, "subtitle", v)} rows={3} />
                          <TextArea label="Subtitle English" value={hero.subtitleEn} onChange={(v) => updateHomepageListItem("heroBanners", index, "subtitleEn", v)} rows={3} />
                          <Field label="رابط صورة الهيرو" value={hero.imageUrl} onChange={(v) => updateHomepageListItem("heroBanners", index, "imageUrl", v)} hint="اكتب رابط صورة أو ارفع صورة من الزر التالي." />
                          <label className="mizar-file-inline">
                            {uploadingKey === `heroBanners-${index}-imageUrl` ? "جاري الرفع..." : "رفع صورة الهيرو"}
                            <input type="file" accept="image/*" onChange={(event) => uploadHomepageImage("heroBanners", index, "imageUrl", event.target.files?.[0] || null)} />
                          </label>
                          <Field label="نص الزر الرئيسي" value={hero.buttonText} onChange={(v) => updateHomepageListItem("heroBanners", index, "buttonText", v)} />
                          <Field label="Main Button Text" value={hero.buttonTextEn} onChange={(v) => updateHomepageListItem("heroBanners", index, "buttonTextEn", v)} />
                          <Field label="رابط الزر الرئيسي" value={hero.buttonLink} onChange={(v) => updateHomepageListItem("heroBanners", index, "buttonLink", v)} placeholder="/products" />
                          <Field label="نص الزر الثاني" value={hero.secondaryButtonText} onChange={(v) => updateHomepageListItem("heroBanners", index, "secondaryButtonText", v)} />
                          <Field label="Secondary Button Text" value={hero.secondaryButtonTextEn} onChange={(v) => updateHomepageListItem("heroBanners", index, "secondaryButtonTextEn", v)} />
                          <Field label="رابط الزر الثاني" value={hero.secondaryButtonLink} onChange={(v) => updateHomepageListItem("heroBanners", index, "secondaryButtonLink", v)} placeholder="/about" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="mizar-add-button" onClick={() => addHomepageListItem("heroBanners", createEmptyHeroBanner)}>
                    + إضافة Hero جديد
                  </button>
                </div>
              ) : null}

              {form.homepage.enableFeaturedCategories ? (
                <div className="mizar-space-top mizar-row-card">
                  <SectionTitle
                    title="التصنيفات المميزة"
                    desc="اختر التصنيفات من تصنيفات المنتجات الموجودة في المتجر. لو لم تختر أي تصنيف، القالب سيعرض التصنيفات تلقائيًا من المنتجات."
                  />

                  <div className="mizar-picker-panel">
                    <div className="mizar-picker-toolbar">
                      <label className="mizar-picker-field">
                        <span>اختيار تصنيف من المتجر</span>
                        <select
                          value={categorySelectValue}
                          disabled={loadingCatalog || !availableCategoryOptions.length}
                          onChange={(event) => setCategorySelectValue(event.target.value)}
                        >
                          <option value="">
                            {loadingCatalog
                              ? "جاري تحميل التصنيفات..."
                              : availableCategoryOptions.length
                                ? "اختر تصنيفًا"
                                : "لا توجد تصنيفات متاحة"}
                          </option>
                          {availableCategoryOptions.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}{category.count ? ` (${category.count})` : ""}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button type="button" className="mizar-picker-add" onClick={addSelectedCategory} disabled={!categorySelectValue}>
                        إضافة التصنيف
                      </button>
                    </div>

                    {catalogError ? <p className="mizar-picker-error">{catalogError}</p> : null}

                    {selectedCategoryValues.length ? (
                      <div className="mizar-selected-grid">
                        {selectedCategoryValues.map((value) => {
                          const category = catalogCategories.find(
                            (item) => normalizeKey(item.value) === normalizeKey(value) || normalizeKey(item.label) === normalizeKey(value),
                          );

                          return (
                            <div className="mizar-selected-pill" key={value}>
                              <span className="mizar-selected-icon">#</span>
                              <div>
                                <strong>{category?.label || value}</strong>
                                <small>{category?.count ? `${category.count} منتج` : "تصنيف مختار"}</small>
                              </div>
                              <button type="button" onClick={() => removeHomepageStringValue("featuredCategoryIds", value)}>
                                حذف
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mizar-picker-hint">لم يتم اختيار تصنيفات محددة. سيتم عرض التصنيفات تلقائيًا من منتجات المتجر.</p>
                    )}
                  </div>
                </div>
              ) : null}

              {form.homepage.enableFeaturedProducts ? (
                <div className="mizar-space-top mizar-row-card">
                  <SectionTitle
                    title="المنتجات المميزة"
                    desc="اختر المنتجات مباشرة من منتجات المتجر بدل كتابة ID أو slug يدويًا. لو لم تختر منتجات، القالب يعرض المنتجات المحددة Featured أو أول منتجات متاحة."
                  />

                  <div className="mizar-picker-panel">
                    <div className="mizar-picker-toolbar">
                      <label className="mizar-picker-field">
                        <span>اختيار منتج من المتجر</span>
                        <select
                          value={productSelectValue}
                          disabled={loadingCatalog || !availableProductOptions.length}
                          onChange={(event) => setProductSelectValue(event.target.value)}
                        >
                          <option value="">
                            {loadingCatalog
                              ? "جاري تحميل المنتجات..."
                              : availableProductOptions.length
                                ? "اختر منتجًا"
                                : "لا توجد منتجات متاحة"}
                          </option>
                          {availableProductOptions.map((product) => (
                            <option key={product.id || product.slug || product.name} value={productOptionValue(product)}>
                              {product.name}{product.category ? ` — ${product.category}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button type="button" className="mizar-picker-add" onClick={addSelectedProduct} disabled={!productSelectValue}>
                        إضافة المنتج
                      </button>
                    </div>

                    {catalogError ? <p className="mizar-picker-error">{catalogError}</p> : null}

                    {selectedProductValues.length ? (
                      <div className="mizar-selected-grid mizar-selected-products">
                        {selectedProductValues.map((value) => {
                          const product = catalogProducts.find((item) => {
                            const keys = [item.id, item.slug, item.sku, item.name].map(normalizeKey).filter(Boolean);
                            return keys.includes(normalizeKey(value));
                          });

                          return (
                            <div className="mizar-selected-pill mizar-selected-product" key={value}>
                              <span className="mizar-product-thumb">
                                {product?.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : (product?.name || value).slice(0, 1)}
                              </span>
                              <div>
                                <strong>{product?.name || value}</strong>
                                <small>{product?.category || product?.slug || "منتج مختار"}</small>
                              </div>
                              <button type="button" onClick={() => removeHomepageStringValue("featuredProductIds", value)}>
                                حذف
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mizar-picker-hint">لم يتم اختيار منتجات محددة. سيتم استخدام المنتجات المميزة أو أول منتجات متاحة تلقائيًا.</p>
                    )}
                  </div>
                </div>
              ) : null}

              {form.homepage.enableServices ? (
                <div className="mizar-space-top mizar-row-card">
                  <SectionTitle title="خدمات المتجر" desc="أضف كل خدمة في بطاقة مستقلة بدل الكتابة داخل Text Box واحد." />
                  <div className="mizar-list">
                    {(Array.isArray(form.homepage.services) ? form.homepage.services : [createEmptyService(1)]).map((service: any, index: number) => (
                      <div className="mizar-repeat-card" key={service.id || index}>
                        <div className="mizar-repeat-head">
                          <strong>خدمة #{index + 1}</strong>
                          <button type="button" onClick={() => removeHomepageListItem("services", index, createEmptyService)}>حذف</button>
                        </div>
                        <div className="mizar-grid">
                          <Field label="العنوان بالعربي" value={service.title} onChange={(v) => updateHomepageListItem("services", index, "title", v)} />
                          <Field label="Title English" value={service.titleEn} onChange={(v) => updateHomepageListItem("services", index, "titleEn", v)} />
                          <TextArea label="الوصف بالعربي" value={service.description} onChange={(v) => updateHomepageListItem("services", index, "description", v)} rows={3} />
                          <TextArea label="Description English" value={service.descriptionEn} onChange={(v) => updateHomepageListItem("services", index, "descriptionEn", v)} rows={3} />
                          <Field label="الأيقونة" value={service.icon} onChange={(v) => updateHomepageListItem("services", index, "icon", v)} placeholder="✓ أو 🚚" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="mizar-add-button" onClick={() => addHomepageListItem("services", createEmptyService)}>
                    + إضافة خدمة
                  </button>
                </div>
              ) : null}

              {form.homepage.enableInstagramGallery ? (
                <div className="mizar-space-top mizar-row-card">
                  <SectionTitle title="Instagram Gallery" desc="أضف رابط أو ارفع صورة، ثم اضغط إضافة صورة لو محتاج صور أكثر." />
                  <div className="mizar-list">
                    {(Array.isArray(form.homepage.instagramImages) ? form.homepage.instagramImages : [createEmptyInstagramImage(1)]).map((item: any, index: number) => (
                      <div className="mizar-repeat-card" key={item.id || index}>
                        <div className="mizar-repeat-head">
                          <strong>صورة #{index + 1}</strong>
                          <button type="button" onClick={() => removeHomepageListItem("instagramImages", index, createEmptyInstagramImage)}>حذف</button>
                        </div>
                        <div className="mizar-grid">
                          <Field label="رابط الصورة" value={item.url || item.imageUrl} onChange={(v) => { updateHomepageListItem("instagramImages", index, "url", v); updateHomepageListItem("instagramImages", index, "imageUrl", v); }} />
                          <Field label="وصف اختياري" value={item.alt} onChange={(v) => updateHomepageListItem("instagramImages", index, "alt", v)} />
                          <label className="mizar-file-inline">
                            {uploadingKey === `instagramImages-${index}-url` ? "جاري الرفع..." : "رفع صورة"}
                            <input type="file" accept="image/*" onChange={(event) => uploadHomepageImage("instagramImages", index, "url", event.target.files?.[0] || null)} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="mizar-add-button" onClick={() => addHomepageListItem("instagramImages", createEmptyInstagramImage)}>
                    + إضافة صورة
                  </button>
                </div>
              ) : null}

              {form.homepage.enableBrands ? (
                <div className="mizar-space-top mizar-row-card">
                  <SectionTitle title="البراندات" desc="أضف البراندات التي تريد ظهورها في الصفحة الرئيسية. يمكن رفع لوجو أو استخدام رابط صورة." />
                  <div className="mizar-list">
                    {(Array.isArray(form.homepage.brands) ? form.homepage.brands : [createEmptyBrand(1)]).map((brand: any, index: number) => (
                      <div className="mizar-repeat-card" key={brand.id || index}>
                        <div className="mizar-repeat-head">
                          <strong>براند #{index + 1}</strong>
                          <button type="button" onClick={() => removeHomepageListItem("brands", index, createEmptyBrand)}>حذف</button>
                        </div>
                        <div className="mizar-grid">
                          <Field label="اسم البراند" value={brand.name} onChange={(v) => updateHomepageListItem("brands", index, "name", v)} />
                          <Field label="رابط اللوجو" value={brand.logoUrl} onChange={(v) => updateHomepageListItem("brands", index, "logoUrl", v)} />
                          <Field label="رابط موقع البراند اختياري" value={brand.website} onChange={(v) => updateHomepageListItem("brands", index, "website", v)} />
                          <label className="mizar-file-inline">
                            {uploadingKey === `brands-${index}-logoUrl` ? "جاري الرفع..." : "رفع لوجو البراند"}
                            <input type="file" accept="image/*" onChange={(event) => uploadHomepageImage("brands", index, "logoUrl", event.target.files?.[0] || null)} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="mizar-add-button" onClick={() => addHomepageListItem("brands", createEmptyBrand)}>
                    + إضافة براند
                  </button>
                </div>
              ) : null}

              {form.homepage.enableBlogPreview ? (
                <div className="mizar-space-top mizar-row-card">
                  <SectionTitle title="المدونة" desc="أضف مقالات مختصرة تظهر في الرئيسية. يمكن كتابة محتوى كامل لاحقًا أو الاكتفاء بالملخص." />
                  <div className="mizar-list">
                    {(Array.isArray(form.homepage.blogPosts) ? form.homepage.blogPosts : [createEmptyBlogPost(1)]).map((post: any, index: number) => (
                      <div className="mizar-repeat-card" key={post.id || index}>
                        <div className="mizar-repeat-head">
                          <strong>مقال #{index + 1}</strong>
                          <button type="button" onClick={() => removeHomepageListItem("blogPosts", index, createEmptyBlogPost)}>حذف</button>
                        </div>
                        <div className="mizar-grid">
                          <Field label="العنوان بالعربي" value={post.titleAr} onChange={(v) => updateHomepageListItem("blogPosts", index, "titleAr", v)} />
                          <Field label="Title English" value={post.titleEn} onChange={(v) => updateHomepageListItem("blogPosts", index, "titleEn", v)} />
                          <Field label="Slug" value={post.slug} onChange={(v) => updateHomepageListItem("blogPosts", index, "slug", v)} placeholder="summer-offers" />
                          <Field label="رابط الصورة" value={post.imageUrl} onChange={(v) => updateHomepageListItem("blogPosts", index, "imageUrl", v)} />
                          <label className="mizar-file-inline">
                            {uploadingKey === `blogPosts-${index}-imageUrl` ? "جاري الرفع..." : "رفع صورة المقال"}
                            <input type="file" accept="image/*" onChange={(event) => uploadHomepageImage("blogPosts", index, "imageUrl", event.target.files?.[0] || null)} />
                          </label>
                          <TextArea label="ملخص عربي" value={post.excerptAr} onChange={(v) => updateHomepageListItem("blogPosts", index, "excerptAr", v)} rows={3} />
                          <TextArea label="English Excerpt" value={post.excerptEn} onChange={(v) => updateHomepageListItem("blogPosts", index, "excerptEn", v)} rows={3} />
                          <TextArea label="محتوى عربي اختياري" value={post.contentAr} onChange={(v) => updateHomepageListItem("blogPosts", index, "contentAr", v)} rows={4} />
                          <TextArea label="English Content Optional" value={post.contentEn} onChange={(v) => updateHomepageListItem("blogPosts", index, "contentEn", v)} rows={4} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="mizar-add-button" onClick={() => addHomepageListItem("blogPosts", createEmptyBlogPost)}>
                    + إضافة مقال
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {!loadingSettings && activeTab === "social" ? (
            <section className="mizar-section">
              <SectionTitle title="روابط السوشيال ميديا" desc="لن يظهر في الفوتر إلا الأيقونات التي لها روابط فقط." />
              <div className="mizar-grid">
                {SOCIALS.map((item) => (
                  <Field
                    key={item.key}
                    label={item.label}
                    value={form.socialLinks[item.key] || ""}
                    placeholder={item.placeholder}
                    onChange={(v) =>
                      setForm((previous) => ({
                        ...previous,
                        socialLinks: {
                          ...previous.socialLinks,
                          [item.key]: v,
                        },
                      }))
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "payments" ? (
            <section className="mizar-section">
              <SectionTitle title="طرق الدفع" desc="فعّل طرق الدفع المتاحة داخل المتجر. الحقول الإضافية يمكن كتابتها كـ JSON أو نص." />
              <div className="mizar-list">
                {PAYMENT_METHODS.map((item) => (
                  <div key={item.key} className="mizar-row-card">
                    <SwitchField
                      label={item.label}
                      checked={Boolean(form.paymentMethods[item.key]?.isEnabled)}
                      onChange={(v) => updatePayment(item.key, "isEnabled", v)}
                    />
                    <TextArea
                      label="إعدادات إضافية"
                      value={form.paymentMethods[item.key]?.configText || ""}
                      onChange={(v) => updatePayment(item.key, "configText", v)}
                      rows={3}
                      placeholder='مثال: {"walletNumber":"01000000000"}'
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "shipping" ? (
            <section className="mizar-section">
              <SectionTitle title="إعدادات الشحن" desc="تظهر في صفحة المنتج والسلة والدفع." />
              <div className="mizar-grid">
                <Field label="تكلفة الشحن" type="number" value={form.shipping.shippingCost} onChange={(v) => updateSection("shipping", "shippingCost", v)} />
                <Field label="حد الشحن المجاني" type="number" value={form.shipping.freeShippingThreshold} onChange={(v) => updateSection("shipping", "freeShippingThreshold", v)} />
                <Field label="مدة التوصيل المتوقعة" value={form.shipping.estimatedDeliveryTime} onChange={(v) => updateSection("shipping", "estimatedDeliveryTime", v)} placeholder="مثال: خلال 2 - 5 أيام عمل" />
                <SwitchField label="إتاحة الاستلام من الفرع" checked={Boolean(form.shipping.pickupAvailable)} onChange={(v) => updateSection("shipping", "pickupAvailable", v)} />
                <TextArea label="شركات الشحن" value={form.shipping.shippingCompaniesText} onChange={(v) => updateSection("shipping", "shippingCompaniesText", v)} rows={5} hint="اكتب كل شركة في سطر منفصل" />
                <TextArea label="سياسة الشحن" value={form.shipping.shippingPolicy} onChange={(v) => updateSection("shipping", "shippingPolicy", v)} rows={6} />
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "taxes" ? (
            <section className="mizar-section">
              <SectionTitle title="إعدادات الضرائب" desc="استخدمها عند الحاجة للفواتير والامتثال الضريبي." />
              <div className="mizar-grid">
                <SwitchField label="الأسعار تشمل الضريبة" checked={Boolean(form.taxes.pricesIncludeTax)} onChange={(v) => updateSection("taxes", "pricesIncludeTax", v)} />
                <Field label="نسبة الضريبة" type="number" value={form.taxes.taxPercentage} onChange={(v) => updateSection("taxes", "taxPercentage", v)} />
                <Field label="رقم السجل التجاري" value={form.taxes.commercialRegistrationNumber} onChange={(v) => updateSection("taxes", "commercialRegistrationNumber", v)} />
                <Field label="الرقم الضريبي" value={form.taxes.taxRegistrationNumber} onChange={(v) => updateSection("taxes", "taxRegistrationNumber", v)} />
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "policies" ? (
            <section className="mizar-section">
              <SectionTitle title="سياسات المتجر" desc="تستخدم في صفحات خدمة العملاء، الفوتر، صفحة المنتج والدفع." />
              <div className="mizar-list">
                {POLICY_TYPES.map((item) => {
                  const policy = form.policies[item.key] || {};
                  return (
                    <div key={item.key} className="mizar-row-card">
                      <SwitchField
                        label={item.label}
                        checked={policy.isActive !== false}
                        onChange={(v) => updatePolicy(item.key, "isActive", v)}
                      />
                      <div className="mizar-grid">
                        <Field label="عنوان عربي" value={policy.titleAr || item.label} onChange={(v) => updatePolicy(item.key, "titleAr", v)} />
                        <Field label="عنوان إنجليزي" value={policy.titleEn || ""} onChange={(v) => updatePolicy(item.key, "titleEn", v)} />
                        <TextArea label="المحتوى العربي" value={policy.contentAr || ""} onChange={(v) => updatePolicy(item.key, "contentAr", v)} rows={5} />
                        <TextArea label="English Content" value={policy.contentEn || ""} onChange={(v) => updatePolicy(item.key, "contentEn", v)} rows={5} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "seo" ? (
            <section className="mizar-section">
              <SectionTitle title="إعدادات SEO" desc="تساعد على تحسين ظهور المتجر في محركات البحث والمشاركة على السوشيال." />
              <div className="mizar-grid">
                <Field label="Meta Title" value={form.seo.metaTitle} onChange={(v) => updateSection("seo", "metaTitle", v)} />
                <Field label="Canonical URL" value={form.seo.canonicalUrl} onChange={(v) => updateSection("seo", "canonicalUrl", v)} />
                <Field label="OG Image URL" value={form.seo.ogImageUrl} onChange={(v) => updateSection("seo", "ogImageUrl", v)} />
                <SwitchField label="السماح بالأرشفة Robots Index" checked={Boolean(form.seo.robotsIndex)} onChange={(v) => updateSection("seo", "robotsIndex", v)} />
                <TextArea label="Meta Description" value={form.seo.metaDescription} onChange={(v) => updateSection("seo", "metaDescription", v)} rows={4} />
                <TextArea label="Meta Keywords" value={form.seo.metaKeywords} onChange={(v) => updateSection("seo", "metaKeywords", v)} rows={3} />
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "products" ? (
            <section className="mizar-section">
              <SectionTitle title="إعدادات عرض المنتجات" desc="هذه الخيارات تتحكم فيما يسمح القالب بعرضه داخل كروت وصفحات المنتجات." />
              <div className="mizar-switch-grid">
                <SwitchField label="إظهار SKU" checked={Boolean(form.productSettings.displaySku)} onChange={(v) => updateSection("productSettings", "displaySku", v)} />
                <SwitchField label="إظهار البراند" checked={Boolean(form.productSettings.displayBrand)} onChange={(v) => updateSection("productSettings", "displayBrand", v)} />
                <SwitchField label="إظهار كمية المخزون" checked={Boolean(form.productSettings.displayStockQuantity)} onChange={(v) => updateSection("productSettings", "displayStockQuantity", v)} />
                <SwitchField label="السماح بالتقييمات" checked={Boolean(form.productSettings.allowReviews)} onChange={(v) => updateSection("productSettings", "allowReviews", v)} />
                <SwitchField label="السماح بالأسئلة والأجوبة" checked={Boolean(form.productSettings.allowQuestions)} onChange={(v) => updateSection("productSettings", "allowQuestions", v)} />
                <SwitchField label="السماح بالمفضلة" checked={Boolean(form.productSettings.allowWishlist)} onChange={(v) => updateSection("productSettings", "allowWishlist", v)} />
                <SwitchField label="السماح بالمقارنة" checked={Boolean(form.productSettings.allowCompare)} onChange={(v) => updateSection("productSettings", "allowCompare", v)} />
                <SwitchField label="Recently Viewed" checked={Boolean(form.productSettings.enableRecentlyViewed)} onChange={(v) => updateSection("productSettings", "enableRecentlyViewed", v)} />
                <SwitchField label="مشاركة المنتج" checked={Boolean(form.productSettings.enableProductSharing)} onChange={(v) => updateSection("productSettings", "enableProductSharing", v)} />
              </div>

              <div className="mizar-grid mizar-space-top">
                <Field label="عدد المنتجات في الصفحة" type="number" value={form.productSettings.defaultProductsPerPage} onChange={(v) => updateSection("productSettings", "defaultProductsPerPage", v)} />
                <Field label="وحدة الوزن" value={form.productSettings.weightUnit} onChange={(v) => updateSection("productSettings", "weightUnit", v)} />
                <Field label="وحدة الأبعاد" value={form.productSettings.dimensionUnit} onChange={(v) => updateSection("productSettings", "dimensionUnit", v)} />
                <Field label="العملة" value={form.productSettings.currency} onChange={(v) => updateSection("productSettings", "currency", v)} />
                <SelectField
                  label="لغة المنتجات الافتراضية"
                  value={form.productSettings.language}
                  onChange={(v) => updateSection("productSettings", "language", v)}
                  options={[
                    { value: "ar", label: "العربية" },
                    { value: "en", label: "English" },
                  ]}
                />
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "footer" ? (
            <section className="mizar-section">
              <SectionTitle title="إعدادات الفوتر" desc="اللوجو يتم أخذه من بيانات المتجر، والروابط تظهر حسب المحتوى المدخل." />
              <div className="mizar-grid">
                <TextArea label="نبذة عن المتجر بالعربي" value={form.footer.aboutStoreAr} onChange={(v) => updateSection("footer", "aboutStoreAr", v)} rows={4} />
                <TextArea label="About Store English" value={form.footer.aboutStoreEn} onChange={(v) => updateSection("footer", "aboutStoreEn", v)} rows={4} />
                <TextArea label="روابط سريعة" value={form.footer.quickLinksText} onChange={(v) => updateSection("footer", "quickLinksText", v)} rows={5} hint="كل رابط في سطر منفصل" />
                <TextArea label="روابط خدمة العملاء" value={form.footer.customerServiceLinksText} onChange={(v) => updateSection("footer", "customerServiceLinksText", v)} rows={5} />
                <TextArea label="أيقونات الدفع" value={form.footer.paymentIconsText} onChange={(v) => updateSection("footer", "paymentIconsText", v)} rows={4} />
                <TextArea label="شركات الشحن" value={form.footer.shippingPartnersText} onChange={(v) => updateSection("footer", "shippingPartnersText", v)} rows={4} />
                <Field label="نص الحقوق" value={form.footer.copyrightText} onChange={(v) => updateSection("footer", "copyrightText", v)} />
              </div>
            </section>
          ) : null}

          {!loadingSettings && activeTab === "notifications" ? (
            <section className="mizar-section">
              <SectionTitle title="الإشعارات" desc="إعدادات مستقبلية لإشعارات الطلبات والعملاء." />
              <div className="mizar-switch-grid">
                <SwitchField label="إشعارات البريد الإلكتروني" checked={Boolean(form.notifications.emailNotificationsEnabled)} onChange={(v) => updateSection("notifications", "emailNotificationsEnabled", v)} />
                <SwitchField label="إشعارات SMS" checked={Boolean(form.notifications.smsNotificationsEnabled)} onChange={(v) => updateSection("notifications", "smsNotificationsEnabled", v)} />
                <SwitchField label="إشعارات واتساب" checked={Boolean(form.notifications.whatsappNotificationsEnabled)} onChange={(v) => updateSection("notifications", "whatsappNotificationsEnabled", v)} />
                <SwitchField label="إشعارات المتصفح" checked={Boolean(form.notifications.browserNotificationsEnabled)} onChange={(v) => updateSection("notifications", "browserNotificationsEnabled", v)} />
              </div>
            </section>
          ) : null}
        </main>
      </div>

      <div className="mizar-sticky-save">
        <span>
          {selectedStore ? `إعدادات: ${selectedStore.name}` : "اختر متجرًا"}
        </span>

        <button className="mizar-btn mizar-btn-primary" onClick={saveSettings} disabled={saving || loadingSettings || !selectedStoreId}>
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mizar-section-title">
      <h2>{title}</h2>
      <p>{desc}</p>
    </div>
  );
}

function UploadBox({
  title,
  field,
  value,
  uploadingKey,
  onUpload,
}: {
  title: string;
  field: "logoUrl" | "coverUrl" | "faviconUrl" | "bannerUrl";
  value: string;
  uploadingKey: string;
  onUpload: (field: "logoUrl" | "coverUrl" | "faviconUrl" | "bannerUrl", file: File | null) => void;
}) {
  return (
    <div className="mizar-upload-box">
      <div className="mizar-upload-preview">
        {value ? <img src={value} alt={title} /> : <span>لا توجد صورة</span>}
      </div>

      <div>
        <strong>{title}</strong>
        <label className="mizar-file-button">
          {uploadingKey === field ? "جاري الرفع..." : "رفع صورة"}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => onUpload(field, event.target.files?.[0] || null)}
          />
        </label>
      </div>
    </div>
  );
}

const styles = `
.mizar-settings-page {
  --mizar-primary: var(--primary, #18213f);
  --mizar-primary-soft: rgba(24, 33, 63, 0.08);
  --mizar-mint: var(--mint, #2ed9b3);
  --mizar-mint-hover: var(--mint-hover, #14b897);
  --mizar-mint-soft: rgba(216, 255, 245, 0.74);
  --mizar-gold: var(--gold, #f59e0b);
  --mizar-border: var(--border, #e2e8f0);
  --mizar-surface: #ffffff;
  --mizar-surface-soft: #f8fafc;
  --mizar-text: var(--text-main, #18213f);
  --mizar-muted: var(--muted-foreground, #64748b);
  --mizar-foreground: var(--foreground, #111827);
  --mizar-ease: var(--ease-premium, cubic-bezier(.2,.8,.2,1));
  padding: 24px;
  color: var(--mizar-text);
}

.mizar-settings-page * {
  box-sizing: border-box;
}

.mizar-settings-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 24px;
  padding: 28px;
  background:
    radial-gradient(circle at 12% 10%, rgba(46, 217, 179, 0.16), transparent 30%),
    radial-gradient(circle at 92% 20%, rgba(245, 158, 11, 0.08), transparent 24%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 14px 44px rgba(24, 33, 63, 0.06);
}

.mizar-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border: 1px solid rgba(46, 217, 179, 0.22);
  border-radius: 999px;
  padding: 7px 11px;
  color: var(--mizar-mint-hover);
  background: var(--mizar-mint-soft);
  font-size: 12px;
  font-weight: 800;
}

.mizar-kicker::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--mizar-gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.mizar-settings-hero h1 {
  margin: 14px 0 8px;
  font-size: clamp(24px, 3vw, 38px);
  line-height: 1.25;
  color: var(--mizar-foreground);
}

.mizar-settings-hero p {
  max-width: 740px;
  color: var(--mizar-muted);
  line-height: 1.9;
  margin: 0;
}

.mizar-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.mizar-btn {
  border: none;
  border-radius: 14px;
  min-height: 42px;
  padding: 10px 15px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 180ms var(--mizar-ease),
    border-color 180ms var(--mizar-ease),
    background 180ms var(--mizar-ease),
    color 180ms var(--mizar-ease),
    box-shadow 180ms var(--mizar-ease);
  white-space: nowrap;
}

.mizar-btn:hover {
  transform: translateY(-1px);
}

.mizar-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.mizar-btn-primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mizar-mint);
  color: var(--mizar-primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.mizar-btn-primary:hover {
  background: var(--mizar-mint-hover);
  color: #ffffff;
}

.mizar-btn-light {
  background: #ffffff;
  color: var(--mizar-text);
  border: 1px solid rgba(226, 232, 240, 0.95);
}

.mizar-btn-light:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mizar-mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.mizar-notice {
  margin-top: 16px;
  border-radius: 16px;
  padding: 13px 15px;
  font-weight: 800;
  border: 1px solid transparent;
}

.mizar-notice.success {
  background: rgba(16, 185, 129, 0.10);
  color: #047857;
  border-color: rgba(16, 185, 129, 0.22);
}

.mizar-notice.error {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.18);
}

.mizar-notice.info {
  background: rgba(59, 130, 246, 0.09);
  color: #2563eb;
  border-color: rgba(59, 130, 246, 0.18);
}

.mizar-top-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr 1.2fr;
  gap: 16px;
  margin-top: 16px;
}

.mizar-card,
.mizar-section,
.mizar-tabs,

.mizar-repeat-list {
  display: grid;
  gap: 12px;
}

.mizar-repeat-card {
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  padding: 14px;
  background: #ffffff;
  box-shadow: 0 10px 22px rgba(24, 33, 63, 0.035);
}

.mizar-repeat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.mizar-repeat-head strong {
  color: var(--mizar-foreground);
  font-size: 14px;
}

.mizar-repeat-head button,
.mizar-inline-row > button {
  border: 1px solid rgba(211, 47, 47, 0.18);
  border-radius: 12px;
  background: rgba(211, 47, 47, 0.07);
  color: #d32f2f;
  padding: 9px 12px;
  cursor: pointer;
  font-weight: 900;
}

.mizar-inline-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: end;
}

.mizar-add-button,
.mizar-picker-panel {
  margin-top: 16px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f8fbfd);
  padding: 16px;
  box-shadow: 0 14px 36px rgba(24, 33, 63, 0.06);
}

.mizar-picker-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: end;
}

.mizar-picker-field {
  display: grid;
  gap: 8px;
}

.mizar-picker-field span {
  font-size: 13px;
  font-weight: 900;
  color: var(--mizar-primary);
}

.mizar-picker-field select {
  width: 100%;
  min-height: 48px;
  border: 1px solid rgba(203, 213, 225, 0.92);
  border-radius: 16px;
  background: #ffffff;
  padding: 0 14px;
  color: var(--mizar-primary);
  font-weight: 800;
  outline: none;
}

.mizar-picker-field select:focus {
  border-color: var(--mizar-mint);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.12);
}

.mizar-picker-field select:disabled {
  background: #f1f5f9;
  color: #94a3b8;
}

.mizar-picker-add {
  min-height: 48px;
  border: none;
  border-radius: 16px;
  padding: 0 18px;
  background: linear-gradient(135deg, var(--mizar-primary), #253057);
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(24, 33, 63, 0.12);
}

.mizar-picker-add:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.mizar-selected-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mizar-selected-products {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mizar-selected-pill {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  background: #ffffff;
  padding: 10px;
}

.mizar-selected-pill strong {
  display: block;
  color: var(--mizar-primary);
  font-weight: 950;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mizar-selected-pill small {
  display: block;
  color: var(--mizar-muted);
  font-weight: 700;
  margin-top: 3px;
}

.mizar-selected-pill button {
  border: none;
  border-radius: 12px;
  padding: 8px 10px;
  background: rgba(239, 68, 68, 0.10);
  color: #b91c1c;
  font-weight: 900;
  cursor: pointer;
}

.mizar-selected-icon,
.mizar-product-thumb {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(46, 217, 179, 0.14);
  color: var(--mizar-primary);
  font-weight: 950;
  overflow: hidden;
}

.mizar-product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mizar-picker-hint,
.mizar-picker-error {
  margin: 12px 0 0;
  border-radius: 14px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 800;
}

.mizar-picker-hint {
  background: rgba(46, 217, 179, 0.10);
  color: var(--mizar-primary);
}

.mizar-picker-error {
  background: rgba(239, 68, 68, 0.10);
  color: #b91c1c;
}

.mizar-file-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 42px;
  border: 1px solid rgba(46, 217, 179, 0.42);
  border-radius: 14px;
  background: linear-gradient(135deg, var(--mizar-primary), #253057);
  color: #ffffff;
  padding: 10px 14px;
  margin-top: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(24, 33, 63, 0.10);
}

.mizar-file-inline {
  margin-top: 0;
  width: 100%;
  align-self: end;
}

.mizar-file-inline input {
  display: none;
}

.mizar-loading-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.mizar-card {
  border-radius: 22px;
  padding: 18px;
}

.mizar-card strong,
.mizar-section-title h2 {
  color: var(--mizar-foreground);
}

.mizar-completion {
  display: grid;
  gap: 12px;
}

.mizar-completion > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.mizar-completion span,
.mizar-template-note p {
  color: var(--mizar-muted);
}

.mizar-progress {
  height: 10px;
  border-radius: 999px;
  background: #eaf0f7;
  overflow: hidden;
}

.mizar-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--mizar-mint), var(--mizar-primary));
}

.mizar-template-note p {
  margin: 8px 0 0;
  line-height: 1.8;
}

.mizar-settings-layout {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  margin-top: 18px;
}

.mizar-tabs {
  position: sticky;
  top: 18px;
  display: grid;
  gap: 8px;
  border-radius: 24px;
  padding: 10px;
}

.mizar-tabs button {
  text-align: right;
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 13px;
  background: transparent;
  color: var(--mizar-muted);
  cursor: pointer;
  transition:
    background 180ms var(--mizar-ease),
    color 180ms var(--mizar-ease),
    border-color 180ms var(--mizar-ease),
    transform 180ms var(--mizar-ease);
}

.mizar-tabs button:hover {
  transform: translateX(-2px);
  background: rgba(216, 255, 245, 0.64);
  color: var(--mizar-mint-hover);
}

.mizar-tabs button strong {
  display: block;
  font-size: 14px;
  color: inherit;
}

.mizar-tabs button span {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--mizar-muted);
  line-height: 1.5;
}

.mizar-tabs button.active {
  background: rgba(216, 255, 245, 0.70);
  border-color: rgba(46, 217, 179, 0.28);
  color: var(--mizar-mint-hover);
}

.mizar-tabs button.active span {
  color: rgba(20, 184, 151, 0.82);
}

.mizar-panel {
  min-height: 640px;
}

.mizar-section {
  border-radius: 26px;
  padding: 22px;
}

.mizar-section-title {
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.72);
}

.mizar-section-title h2 {
  margin: 0;
  font-size: 22px;
}

.mizar-section-title p {
  margin: 8px 0 0;
  color: var(--mizar-muted);
  line-height: 1.8;
}

.mizar-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.mizar-field {
  display: grid;
  gap: 8px;
}

.mizar-field-full {
  grid-column: 1 / -1;
}

.mizar-field span {
  font-size: 13px;
  font-weight: 800;
  color: var(--mizar-muted);
}

.mizar-field input,
.mizar-field textarea,
.mizar-field select {
  width: 100%;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  padding: 12px 13px;
  outline: none;
  background: #ffffff;
  color: var(--mizar-foreground);
  font: inherit;
  font-weight: 600;
  transition:
    border-color 180ms var(--mizar-ease),
    box-shadow 180ms var(--mizar-ease),
    background 180ms var(--mizar-ease);
}

.mizar-field textarea {
  resize: vertical;
  line-height: 1.8;
}

.mizar-field input:focus,
.mizar-field textarea:focus,
.mizar-field select:focus {
  border-color: rgba(46, 217, 179, 0.52);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.10);
}

.mizar-field select {
  cursor: pointer;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 8px 20px rgba(24, 33, 63, 0.035);
}

.mizar-field small {
  color: var(--mizar-muted);
  line-height: 1.6;
}

.mizar-switch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mizar-switch {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 12px;
  align-items: center;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  padding: 14px;
  background: rgba(248, 250, 252, 0.72);
  cursor: pointer;
  transition:
    border-color 180ms var(--mizar-ease),
    background 180ms var(--mizar-ease),
    transform 180ms var(--mizar-ease);
}

.mizar-switch:hover {
  transform: translateY(-1px);
  border-color: rgba(46, 217, 179, 0.32);
  background: #ffffff;
}

.mizar-switch input {
  display: none;
}

.mizar-switch-ui {
  width: 54px;
  height: 30px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.5);
  position: relative;
  transition: background 180ms var(--mizar-ease);
}

.mizar-switch-ui::after {
  content: "";
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.16);
  transition: transform 180ms var(--mizar-ease);
}

.mizar-switch input:checked + .mizar-switch-ui {
  background: var(--mizar-mint);
}

.mizar-switch input:checked + .mizar-switch-ui::after {
  transform: translateX(-24px);
}

.mizar-switch strong {
  font-size: 13px;
  color: var(--mizar-foreground);
}

.mizar-switch small {
  grid-column: 2;
  color: var(--mizar-muted);
}

.mizar-upload-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.mizar-upload-box {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  padding: 12px;
  background: rgba(248, 250, 252, 0.72);
  display: grid;
  gap: 12px;
}

.mizar-upload-preview {
  height: 120px;
  border-radius: 14px;
  border: 1px dashed rgba(148, 163, 184, 0.7);
  background:
    radial-gradient(circle at 12% 10%, rgba(46, 217, 179, 0.08), transparent 30%),
    #ffffff;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: #94a3b8;
  font-size: 13px;
}

.mizar-upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mizar-file-button {
  margin-top: 8px;
  display: inline-flex;
  width: 100%;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mizar-primary);
  color: #ffffff;
  padding: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition:
    transform 180ms var(--mizar-ease),
    background 180ms var(--mizar-ease);
}

.mizar-file-button:hover {
  transform: translateY(-1px);
  background: var(--mizar-mint-hover);
}

.mizar-file-button input {
  display: none;
}

.mizar-list {
  display: grid;
  gap: 14px;
}

.mizar-row-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 20px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.72);
}

.mizar-space-top {
  margin-top: 18px;
}


.mizar-repeat-list {
  display: grid;
  gap: 12px;
}

.mizar-repeat-card {
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  padding: 14px;
  background: #ffffff;
  box-shadow: 0 10px 22px rgba(24, 33, 63, 0.035);
}

.mizar-repeat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.mizar-repeat-head strong {
  color: var(--mizar-foreground);
  font-size: 14px;
}

.mizar-repeat-head button,
.mizar-inline-row > button {
  border: 1px solid rgba(211, 47, 47, 0.18);
  border-radius: 12px;
  background: rgba(211, 47, 47, 0.07);
  color: #d32f2f;
  padding: 9px 12px;
  cursor: pointer;
  font-weight: 900;
}

.mizar-inline-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: end;
}

.mizar-add-button,
.mizar-file-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 42px;
  border: 1px solid rgba(46, 217, 179, 0.42);
  border-radius: 14px;
  background: linear-gradient(135deg, var(--mizar-primary), #253057);
  color: #ffffff;
  padding: 10px 14px;
  margin-top: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(24, 33, 63, 0.10);
}

.mizar-file-inline {
  margin-top: 0;
  width: 100%;
  align-self: end;
}

.mizar-file-inline input {
  display: none;
}

.mizar-loading-card {
  border-radius: 22px;
  padding: 28px;
  display: grid;
  place-items: center;
  gap: 12px;
}

.mizar-loading-card span {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 4px solid #eaf0f7;
  border-top-color: var(--mizar-mint);
  animation: spin 0.8s linear infinite;
}

.mizar-sticky-save {
  position: sticky;
  bottom: 16px;
  z-index: 30;
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 20px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 44px rgba(24, 33, 63, 0.10);
}

.mizar-sticky-save span {
  font-weight: 800;
  color: var(--mizar-muted);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1180px) {
  .mizar-top-grid,
  .mizar-settings-layout {
    grid-template-columns: 1fr;
  }

  .mizar-tabs {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mizar-upload-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .mizar-settings-page {
    padding: 14px;
  }

  .mizar-settings-hero {
    padding: 18px;
    flex-direction: column;
  }

  .mizar-hero-actions {
    width: 100%;
    justify-content: stretch;
  }

  .mizar-hero-actions .mizar-btn {
    flex: 1;
  }

  .mizar-tabs,
  .mizar-grid,
  .mizar-switch-grid,
  .mizar-upload-grid,
  .mizar-picker-toolbar,
  .mizar-selected-grid,
  .mizar-selected-products {
    grid-template-columns: 1fr;
  }

  .mizar-section {
    padding: 16px;
  }

  .mizar-sticky-save {
    flex-direction: column;
    align-items: stretch;
  }
}
`;