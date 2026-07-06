import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params:
    | Promise<{
        slug?: string;
      }>
    | {
        slug?: string;
      };
};

const TEMPLATE_KEYS = [
  "MIZAR_PREMIUM",
  "MIZAR_MODERN",
  "LUXE_NOIR",
  "SOFT_BOUTIQUE",
  "BAZAAR_CARDS",
  "TECH_MINIMAL",
] as const;

type TemplateKey = (typeof TEMPLATE_KEYS)[number];

function parseJsonRecord(value: unknown): Record<string, any> {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, any>)
        : {};
    } catch {
      return {};
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, any>;
  }

  return {};
}

function normalizeTemplateKey(value: unknown): TemplateKey {
  const raw = String(value || "")
    .trim()
    .toUpperCase();

  if (TEMPLATE_KEYS.includes(raw as TemplateKey)) {
    return raw as TemplateKey;
  }

  const legacyMap: Record<string, TemplateKey> = {
    PREMIUM: "MIZAR_PREMIUM",
    MIZAR_PREMIUM_V1: "MIZAR_PREMIUM",
    MIZAR_PREMIUM_V2: "MIZAR_PREMIUM",
    MIZAR_PREMIUM_V3: "MIZAR_PREMIUM",
    GENERAL: "MIZAR_MODERN",
    FASHION: "MIZAR_MODERN",
    PERFUMES_BEAUTY: "LUXE_NOIR",
    ACCESSORIES: "LUXE_NOIR",
    HANDMADE: "SOFT_BOUTIQUE",
    HOME_PRODUCTS: "SOFT_BOUTIQUE",
    FOOD_BEVERAGE: "BAZAAR_CARDS",
    ELECTRONICS: "TECH_MINIMAL",
  };

  return legacyMap[raw] || "MIZAR_MODERN";
}

function asRecord(value: unknown): Record<string, any> {
  return parseJsonRecord(value);
}

function getTemplateConfig(store: any) {
  return asRecord(store?.templateConfig);
}

function getSettingsFallback(store: any) {
  const templateConfig = getTemplateConfig(store);

  return asRecord(
    templateConfig.settingsFallback ||
      templateConfig.dashboardSettings ||
      templateConfig.settings ||
      {},
  );
}

function getFallbackSection(store: any, ...keys: string[]) {
  const fallback = getSettingsFallback(store);
  const templateConfig = getTemplateConfig(store);

  for (const key of keys) {
    const value = fallback[key] ?? templateConfig[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return {};
}

function safeArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getActiveTemplateConfig(store: any) {
  const templateConfig = asRecord(store?.templateConfig);
  const nestedContent = asRecord(templateConfig.content);

  // templateConfig is the source of truth. Store.template may be a legacy enum
  // and can still contain GENERAL / FOOD_BEVERAGE / old values.
  const templateKey = normalizeTemplateKey(
    templateConfig.templateKey ||
      templateConfig.selectedTemplate ||
      templateConfig.storefrontTemplate ||
      templateConfig.activeTemplate ||
      nestedContent.templateKey ||
      nestedContent.selectedTemplate ||
      nestedContent.storefrontTemplate ||
      store?.selectedTemplate ||
      store?.templateKey ||
      store?.storefrontTemplate ||
      store?.template,
  );

  return {
    ...templateConfig,
    ...nestedContent,
    content: {
      ...nestedContent,
      templateKey,
      selectedTemplate: templateKey,
      storefrontTemplate: templateKey,
      activeTemplate: templateKey,
    },
    templateKey,
    selectedTemplate: templateKey,
    storefrontTemplate: templateKey,
    activeTemplate: templateKey,
  };
}

function buildDefaultStorefrontContent(store: any) {
  const templateConfig: any = getActiveTemplateConfig(store);

  return {
    templateKey: templateConfig.templateKey,

    navigation: {
      showHome: true,
      showAbout: true,
      showProducts: true,
      showWishlist: true,
      showCart: true,
      showLogin: true,
      showContact: true,
      ...(asRecord(templateConfig.navigation) || {}),
    },

    heroSlides:
      safeArray(templateConfig.heroSlides).length > 0
        ? safeArray(templateConfig.heroSlides)
        : [
            {
              id: "default-slide-1",
              imageUrl:
                store?.bannerUrl || store?.coverUrl || store?.logoUrl || "",
              title:
                store?.nameAr ||
                store?.displayName ||
                store?.name ||
                "اكتشف أحدث منتجاتنا",
              titleEn:
                store?.nameEn ||
                store?.displayName ||
                store?.name ||
                "Discover our latest products",
              subtitle:
                store?.shortDescription ||
                store?.descriptionAr ||
                store?.description ||
                "تسوق بسهولة من متجرنا واستمتع بتجربة شراء بسيطة وسريعة.",
              subtitleEn:
                store?.descriptionEn ||
                store?.shortDescription ||
                store?.description ||
                "Shop easily and enjoy a simple, fast buying experience.",
              buttonText: "تسوق الآن",
              buttonTextEn: "Shop Now",
              buttonLink: "/products",
              secondaryButtonText: "من نحن",
              secondaryButtonTextEn: "About Us",
              secondaryButtonLink: "/about",
              isActive: true,
            },
          ],

    aboutSection: {
      enabled: true,
      title: "من نحن",
      titleEn: "About Us",
      subtitle: "قصة المتجر",
      subtitleEn: "Our Story",
      description:
        store?.fullDescription ||
        store?.descriptionAr ||
        store?.description ||
        "نقدم لعملائنا تجربة تسوق سهلة ومنظمة، مع منتجات مختارة بعناية وخدمة عملاء تهتم بالتفاصيل.",
      descriptionEn:
        store?.descriptionEn ||
        store?.description ||
        "We provide a smooth shopping experience with carefully selected products and customer-first service.",
      imageUrl: store?.bannerUrl || store?.coverUrl || store?.logoUrl || "",
      highlights: [
        "منتجات مختارة بعناية",
        "تجربة شراء سهلة",
        "دعم عملاء مستمر",
        "شحن وتوصيل منظم",
      ],
      highlightsEn: [
        "Carefully selected products",
        "Easy shopping experience",
        "Continuous customer support",
        "Organized shipping and delivery",
      ],
      ...(asRecord(templateConfig.aboutSection) || {}),
    },

    homeSections: {
      showFeaturedProducts: true,
      showLatestProducts: true,
      showCategories: true,
      showOffers: true,
      showAbout: true,
      showReviews: true,
      showBrands: false,
      showNewsletter: true,
      showServices: true,
      showBlogPreview: false,
      showInstagramGallery: false,
      ...(asRecord(templateConfig.homeSections) || {}),
    },

    productDisplay: {
      showWishlist: true,
      showCompare: false,
      showRatings: true,
      showReviewCount: true,
      showDiscountBadge: true,
      showStockStatus: true,
      showCategory: true,
      showBrand: true,
      showSku: true,
      enableQuickView: true,
      enableAddToCart: true,
      enableSharing: true,
      enableRecentlyViewed: true,
      ...(asRecord(templateConfig.productDisplay) || {}),
    },

    reviewSettings: {
      enabled: true,
      requireVerifiedPurchase: true,
      showMerchantReply: true,
      showRatingSummary: true,
      showProductReviews: true,
      ...(asRecord(templateConfig.reviewSettings) || {}),
    },

    footerSettings: {
      text:
        store?.descriptionAr ||
        store?.description ||
        "متجر إلكتروني يعمل بتقنيات ميزار لتجربة شراء سهلة وسريعة.",
      textEn:
        store?.descriptionEn ||
        store?.description ||
        "An online store powered by Mizar for a simple and fast shopping experience.",
      showSocialLinks: true,
      showContactInfo: true,
      showPoweredByMizar: true,
      ...(asRecord(templateConfig.footerSettings) || {}),
    },

    seoSettings: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      ...(asRecord(templateConfig.seoSettings) || {}),
    },
  };
}

function buildLegacySocialLinks(store: any) {
  const links: Array<{
    platform: string;
    url: string;
    isActive: boolean;
    source: "legacy" | "settings";
  }> = [];

  if (store?.facebookUrl) {
    links.push({
      platform: "FACEBOOK",
      url: store.facebookUrl,
      isActive: true,
      source: "legacy",
    });
  }

  if (store?.instagramUrl) {
    links.push({
      platform: "INSTAGRAM",
      url: store.instagramUrl,
      isActive: true,
      source: "legacy",
    });
  }

  if (store?.tiktokUrl) {
    links.push({
      platform: "TIKTOK",
      url: store.tiktokUrl,
      isActive: true,
      source: "legacy",
    });
  }

  if (store?.websiteUrl) {
    links.push({
      platform: "WEBSITE",
      url: store.websiteUrl,
      isActive: true,
      source: "legacy",
    });
  }

  if (store?.whatsapp) {
    const digits = String(store.whatsapp).replace(/[^0-9]/g, "");
    links.push({
      platform: "WHATSAPP",
      url: digits ? `https://wa.me/${digits}` : store.whatsapp,
      isActive: true,
      source: "legacy",
    });
  }

  return links;
}

function mergeSocialLinks(store: any) {
  const fallbackSocials = safeArray(getFallbackSection(store, "socialLinks"));
  const sourceRows = safeArray(store?.socialLinks).length
    ? safeArray(store?.socialLinks)
    : fallbackSocials;

  const fromSettings = sourceRows
    .filter((item: any) => item?.url && item?.isActive !== false)
    .map((item: any) => ({
      id: item.id,
      platform: item.platform,
      url: item.url,
      isActive: item.isActive,
      source: "settings" as const,
    }));

  const legacy = buildLegacySocialLinks(store);

  const seen = new Set<string>();
  const merged: any[] = [];

  for (const item of [...fromSettings, ...legacy]) {
    const key = String(item.platform || "").toUpperCase();

    if (!key || seen.has(key)) continue;

    seen.add(key);
    merged.push(item);
  }

  return merged;
}

function buildContactSettings(store: any) {
  const fallback = asRecord(getFallbackSection(store, "contactInfo", "contactSettings", "contact"));
  const contact = {
    ...(store?.contactSettings || {}),
    ...fallback,
  };

  return {
    businessEmail:
      contact.businessEmail ||
      store?.contactEmail ||
      store?.email ||
      null,
    supportEmail:
      contact.supportEmail ||
      store?.contactEmail ||
      store?.email ||
      null,
    mobileNumber:
      contact.mobileNumber ||
      store?.contactPhone ||
      store?.phone ||
      null,
    whatsappNumber: contact.whatsappNumber || store?.whatsapp || null,
    landlineNumber: contact.landlineNumber || null,
    workingDays: contact.workingDays || null,
    workingHours: contact.workingHours || null,
    emergencyContact: contact.emergencyContact || null,
  };
}

function buildAddressSettings(store: any) {
  const fallback = asRecord(getFallbackSection(store, "address", "addressSettings"));
  const address = {
    ...(store?.addressSettings || {}),
    ...fallback,
  };

  return {
    country: address.country || store?.country || null,
    state: address.state || store?.state || store?.governorate || null,
    city: address.city || store?.city || null,
    district: address.district || store?.area || null,
    street: address.street || null,
    buildingNumber: address.buildingNumber || null,
    postalCode: address.postalCode || null,
    googleMapsUrl: address.googleMapsUrl || null,
    latitude: address.latitude || null,
    longitude: address.longitude || null,
    address: address.address || store?.address || null,
  };
}

function buildShippingSettings(store: any) {
  const fallback = asRecord(getFallbackSection(store, "shipping", "shippingSettings"));
  const shipping = {
    ...(store?.shippingSettings || {}),
    ...fallback,
  };

  return {
    shippingCompanies: shipping.shippingCompanies || [],
    shippingCost:
      typeof shipping.shippingCost === "number"
        ? shipping.shippingCost
        : store?.shippingFee || 0,
    freeShippingThreshold: shipping.freeShippingThreshold || store?.freeShippingThreshold || null,
    estimatedDeliveryTime:
      shipping.estimatedDeliveryTime ||
      store?.shippingPolicy ||
      null,
    pickupAvailable: shipping.pickupAvailable || false,
    shippingPolicy: shipping.shippingPolicy || store?.shippingPolicy || null,
  };
}

function buildSeoSettings(store: any, content: any) {
  const fallbackSeo = asRecord(getFallbackSection(store, "seo", "seoSettings"));
  const seo = {
    ...(store?.seoSettings || {}),
    ...fallbackSeo,
  };

  const title =
    seo.metaTitle ||
    content?.seoSettings?.title ||
    store?.nameAr ||
    store?.displayName ||
    store?.name ||
    "Mizar Store";

  const description =
    seo.metaDescription ||
    content?.seoSettings?.description ||
    store?.shortDescription ||
    store?.descriptionAr ||
    store?.description ||
    "";

  return {
    metaTitle: title,
    metaDescription: description,
    metaKeywords: seo.metaKeywords || content?.seoSettings?.keywords || "",
    ogImageUrl:
      seo.ogImageUrl ||
      content?.seoSettings?.ogImage ||
      store?.bannerUrl ||
      store?.coverUrl ||
      store?.logoUrl ||
      "",
    canonicalUrl: seo.canonicalUrl || "",
    robotsIndex: typeof seo.robotsIndex === "boolean" ? seo.robotsIndex : true,
  };
}

function buildHomepageSettings(store: any) {
  const fallbackHomepage = asRecord(getFallbackSection(store, "homepage", "homepageSettings"));
  const settings = {
    ...(store?.homepageSettings || {}),
    ...fallbackHomepage,
  };

  return {
    enableHeroBanner: settings?.enableHeroBanner ?? true,
    heroBanners:
      settings?.heroBanners || settings?.banners || settings?.heroSlides || [],
    enableFeaturedCategories: settings?.enableFeaturedCategories ?? true,
    featuredCategoryIds: settings?.featuredCategoryIds || [],
    enableFeaturedProducts: settings?.enableFeaturedProducts ?? true,
    featuredProductIds: settings?.featuredProductIds || [],
    enableBestSellers: settings?.enableBestSellers ?? true,
    enableNewArrivals: settings?.enableNewArrivals ?? true,
    enableOffers: settings?.enableOffers ?? true,
    enableBrands: settings?.enableBrands ?? false,
    enableReviews: settings?.enableReviews ?? true,
    enableNewsletter: settings?.enableNewsletter ?? true,
    enableBlogPreview: settings?.enableBlogPreview ?? false,
    enableServices: settings?.enableServices ?? true,
    services: settings?.services || [
      {
        id: "service-1",
        title: "توصيل سريع",
        titleEn: "Fast Delivery",
        description: "شحن منظم حسب سياسة المتجر",
        descriptionEn: "Organized shipping according to store policy",
        icon: "truck",
        enabled: true,
      },
      {
        id: "service-2",
        title: "دفع آمن",
        titleEn: "Secure Payment",
        description: "طرق دفع مناسبة لعملاء المتجر",
        descriptionEn: "Payment options suitable for store customers",
        icon: "shield",
        enabled: true,
      },
      {
        id: "service-3",
        title: "دعم العملاء",
        titleEn: "Customer Support",
        description: "تواصل مباشر مع فريق المتجر",
        descriptionEn: "Direct contact with the store team",
        icon: "headphones",
        enabled: true,
      },
    ],
    enableInstagramGallery: settings?.enableInstagramGallery ?? false,
    instagramImages: settings?.instagramImages || [],
  };
}

function buildHeroSlides(store: any, content: any, homepageSettings: any) {
  const settingsSlides = safeArray(homepageSettings?.heroBanners).filter(
    (slide: any) => slide?.isActive !== false && slide?.enabled !== false,
  );

  if (settingsSlides.length) {
    return settingsSlides.map((slide: any, index: number) => ({
      id: slide.id || `homepage-hero-${index + 1}`,
      title:
        slide.title ||
        slide.titleAr ||
        store?.tagline ||
        store?.nameAr ||
        store?.name ||
        "Mizar Premium",
      titleEn:
        slide.titleEn ||
        slide.title ||
        store?.nameEn ||
        store?.name ||
        "Mizar Premium",
      subtitle:
        slide.subtitle ||
        slide.description ||
        slide.subtitleAr ||
        store?.shortDescription ||
        store?.descriptionAr ||
        store?.description ||
        "",
      subtitleEn:
        slide.subtitleEn ||
        slide.descriptionEn ||
        slide.subtitle ||
        store?.descriptionEn ||
        store?.shortDescription ||
        store?.description ||
        "",
      imageUrl:
        slide.imageUrl ||
        slide.url ||
        slide.fileUrl ||
        slide.bannerUrl ||
        store?.bannerUrl ||
        store?.coverUrl ||
        store?.logoUrl ||
        "",
      buttonText: slide.buttonText || slide.primaryButtonText || "تسوق الآن",
      buttonTextEn:
        slide.buttonTextEn || slide.primaryButtonTextEn || "Shop now",
      buttonLink: slide.buttonLink || slide.primaryButtonHref || "/products",
      secondaryButtonText: slide.secondaryButtonText || "من نحن",
      secondaryButtonTextEn: slide.secondaryButtonTextEn || "About us",
      secondaryButtonLink:
        slide.secondaryButtonLink || slide.secondaryButtonHref || "/about",
      isActive: slide.isActive !== false,
    }));
  }

  const slides = safeArray(content?.heroSlides)
    .filter((slide: any) => slide?.isActive !== false)
    .map((slide: any) => ({
      ...slide,
      imageUrl:
        store?.bannerUrl ||
        store?.coverUrl ||
        slide?.imageUrl ||
        slide?.url ||
        store?.logoUrl ||
        "",
    }));

  if (slides.length) return slides;

  return [
    {
      id: "default-slide-1",
      imageUrl: store?.bannerUrl || store?.coverUrl || store?.logoUrl || "",
      title:
        store?.nameAr ||
        store?.displayName ||
        store?.name ||
        "اكتشف أحدث منتجاتنا",
      titleEn:
        store?.nameEn ||
        store?.displayName ||
        store?.name ||
        "Discover our latest products",
      subtitle:
        store?.shortDescription ||
        store?.descriptionAr ||
        store?.description ||
        "تسوق بسهولة من متجرنا واستمتع بتجربة شراء بسيطة وسريعة.",
      subtitleEn:
        store?.descriptionEn ||
        store?.shortDescription ||
        store?.description ||
        "Shop easily and enjoy a simple, fast buying experience.",
      buttonText: "تسوق الآن",
      buttonTextEn: "Shop Now",
      buttonLink: "/products",
      secondaryButtonText: "من نحن",
      secondaryButtonTextEn: "About Us",
      secondaryButtonLink: "/about",
      isActive: true,
    },
  ];
}

function getProductImage(product: any) {
  const media = safeArray(product?.media);
  const cover =
    media.find((item: any) => item?.isCover && item?.url) ||
    media.find((item: any) => item?.url);

  return cover?.url || product?.imageUrl || "";
}

function normalizeProduct(product: any) {
  const price = Number(product?.price || 0);
  const discountPrice =
    typeof product?.discountPrice === "number" ? product.discountPrice : null;
  const compareAtPrice =
    typeof product?.compareAtPrice === "number" ? product.compareAtPrice : null;

  const finalPrice = discountPrice && discountPrice > 0 ? discountPrice : price;
  const oldPrice =
    compareAtPrice && compareAtPrice > finalPrice ? compareAtPrice : null;

  const discountPercent =
    oldPrice && finalPrice
      ? Math.round(((oldPrice - finalPrice) / oldPrice) * 100)
      : 0;

  const availableStock =
    typeof product?.availableStock === "number"
      ? product.availableStock
      : typeof product?.stock === "number"
        ? product.stock
        : 0;

  return {
    ...product,
    imageUrl: getProductImage(product),
    finalPrice,
    oldPrice,
    discountPercent,
    availableStock,
    stockLabel: availableStock > 0 ? "متوفر" : "غير متوفر",
    stockLabelEn: availableStock > 0 ? "In stock" : "Out of stock",
    isOnSale: Boolean(discountPercent > 0),
    reviewCount: product?.reviewCount ?? product?.ratingCount ?? 0,
  };
}

function getCategoryStats(products: any[]) {
  const map = new Map<string, { name: string; count: number }>();

  for (const product of products) {
    const category = String(product?.category || "").trim();
    if (!category) continue;

    const current = map.get(category);

    if (current) {
      current.count += 1;
    } else {
      map.set(category, {
        name: category,
        count: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function getCategories(products: any[]) {
  return getCategoryStats(products).map((category) => category.name);
}

function cleanDate(value: any) {
  if (!value) return null;

  try {
    return new Date(value).toISOString();
  } catch {
    return null;
  }
}

function publicMedia(media: any[]) {
  return safeArray(media)
    .map((item: any) => ({
      id: item.id,
      url: item.url || item.imageUrl || item.fileUrl || "",
      imageUrl: item.imageUrl || item.url || item.fileUrl || "",
      alt: item.alt || item.altText || "",
      isCover: Boolean(item.isCover),
      sortOrder: item.sortOrder || 0,
    }))
    .filter((item: any) => item.url || item.imageUrl);
}

function publicProductOptions(options: any[]) {
  return safeArray(options).map((option: any) => ({
    id: option.id,
    name: option.name,
    nameAr: option.nameAr || option.name,
    nameEn: option.nameEn || option.name,
    type: option.type,
    values: option.values || option.options || [],
    sortOrder: option.sortOrder || 0,
  }));
}

function publicProductVariants(variants: any[]) {
  return safeArray(variants).map((variant: any) => ({
    id: variant.id,
    title: variant.title,
    name: variant.name || variant.title,
    sku: variant.sku || null,
    barcode: variant.barcode || null,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice || null,
    discountPrice: variant.discountPrice || null,
    imageUrl: variant.imageUrl || "",
    stock: variant.stock ?? variant.availableStock ?? variant.quantity ?? variant.availableQuantity ?? null,
    quantity: variant.quantity ?? variant.stock ?? null,
    availableStock: variant.availableStock ?? variant.stock ?? variant.availableQuantity ?? variant.quantity ?? null,
    availableQuantity: variant.availableQuantity ?? variant.availableStock ?? variant.quantity ?? null,
    reservedQuantity: variant.reservedQuantity ?? 0,
    lowStockAlert: variant.lowStockAlert ?? null,
    inventoryPolicy: variant.inventoryPolicy || null,
    status: variant.status,
    options: variant.options || variant.optionValues || null,
    media: publicMedia(variant.media || []),
    sortOrder: variant.sortOrder || 0,
  }));
}

function publicReview(review: any) {
  return {
    id: review.id,
    rating: review.rating,
    title: review.title || "",
    comment: review.comment || review.content || "",
    content: review.content || review.comment || "",
    customerName: review.customerName || review.authorName || review.name || "",
    authorName: review.authorName || review.customerName || review.name || "",
    createdAt: cleanDate(review.createdAt),
    product: review.product
      ? {
          id: review.product.id,
          name: review.product.name,
          slug: review.product.slug,
          imageUrl: review.product.imageUrl || "",
        }
      : null,
  };
}

function publicProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    title: product.title || product.name,
    slug: product.slug,
    handle: product.handle || product.slug,
    category: product.category || null,
    categoryName: product.categoryName || product.category || null,
    brand: product.brand || product.brandName || null,
    brandName: product.brandName || product.brand || null,
    sku: product.sku || null,
    shortDescription: product.shortDescription || "",
    description: product.description || "",
    fullDescription: product.fullDescription || product.description || "",
    price: product.price,
    discountPrice: product.discountPrice || null,
    finalPrice: product.finalPrice || product.discountPrice || product.price,
    compareAtPrice: product.compareAtPrice || null,
    oldPrice: product.oldPrice || null,
    discountPercent: product.discountPercent || 0,
    currency: product.currency || null,
    imageUrl: product.imageUrl || "",
    coverUrl: product.coverUrl || product.imageUrl || "",
    thumbnailUrl: product.thumbnailUrl || product.imageUrl || "",
    media: publicMedia(product.media || []),
    productOptions: publicProductOptions(product.productOptions || []),
    productVariants: publicProductVariants(product.productVariants || []),
    variants: publicProductVariants(
      product.variants || product.productVariants || [],
    ),
    stock: product.stock ?? product.availableStock ?? null,
    availableStock: product.availableStock ?? product.stock ?? null,
    reservedStock: product.reservedStock ?? 0,
    trackInventory: product.trackInventory !== false,
    inventoryPolicy: product.inventoryPolicy || null,
    stockLabel: product.stockLabel || null,
    stockLabelEn: product.stockLabelEn || null,
    status: product.status,
    isAvailable:
      product.availableStock === undefined || product.availableStock === null
        ? true
        : Number(product.availableStock) > 0,
    isFeatured: Boolean(product.isFeatured || product.showOnHome),
    showOnHome: Boolean(product.showOnHome),
    isBestSeller: Boolean(product.isBestSeller),
    isNewArrival: Boolean(product.isNewArrival),
    isOnSale: Boolean(
      product.isOnSale || Number(product.discountPercent || 0) > 0,
    ),
    ratingAverage: product.ratingAverage || 0,
    ratingCount: product.ratingCount || 0,
    reviewCount: product.reviewCount || 0,
    reviews: safeArray(product.reviews).map(publicReview),
    createdAt: cleanDate(product.createdAt),
  };
}

function publicSocialLinks(links: any[]) {
  return safeArray(links)
    .map((item: any) => ({
      platform: item.platform,
      url: item.url,
      isActive: item.isActive !== false,
    }))
    .filter((item: any) => item.platform && item.url);
}

function publicPaymentMethods(methods: any[]) {
  return safeArray(methods)
    .map((method: any) => ({
      type: method.type,
      isEnabled: method.isEnabled !== false,
      label: method.label || method.name || method.type,
    }))
    .filter((method: any) => method.type);
}

function publicPolicies(policies: any[]) {
  return safeArray(policies)
    .map((policy: any) => ({
      type: policy.type,
      titleAr: policy.titleAr || policy.title || "",
      titleEn: policy.titleEn || policy.title || "",
      contentAr: policy.contentAr || policy.content || "",
      contentEn: policy.contentEn || policy.content || "",
      isActive: policy.isActive !== false,
    }))
    .filter((policy: any) => policy.isActive);
}

function publicBrand(brand: any) {
  return {
    id: brand.id,
    name: brand.name,
    nameAr: brand.nameAr || brand.name,
    nameEn: brand.nameEn || brand.name,
    slug: brand.slug || brand.id,
    logoUrl: brand.logoUrl || brand.imageUrl || "",
    imageUrl: brand.imageUrl || brand.logoUrl || "",
    website: brand.website || brand.websiteUrl || "",
    isActive: brand.isActive !== false,
  };
}

function publicBlogPost(post: any) {
  const title = post.title || post.titleAr || post.titleEn || "";
  const excerpt = post.excerpt || post.summary || post.excerptAr || post.excerptEn || "";

  return {
    id: post.id,
    title,
    titleAr: post.titleAr || title,
    titleEn: post.titleEn || title,
    slug: post.slug || post.id,
    excerpt,
    excerptAr: post.excerptAr || excerpt,
    excerptEn: post.excerptEn || excerpt,
    contentAr: post.contentAr || "",
    contentEn: post.contentEn || "",
    imageUrl: post.imageUrl || post.coverUrl || "",
    publishedAt: cleanDate(post.publishedAt || post.createdAt),
  };
}

function publicShippingSettings(settings: any) {
  return {
    shippingCompanies: settings?.shippingCompanies || [],
    shippingCost: settings?.shippingCost || 0,
    freeShippingThreshold: settings?.freeShippingThreshold || null,
    estimatedDeliveryTime: settings?.estimatedDeliveryTime || null,
    pickupAvailable: Boolean(settings?.pickupAvailable),
    shippingPolicy: settings?.shippingPolicy || null,
  };
}

function publicTaxSettings(settings: any) {
  return settings
    ? {
        pricesIncludeTax: Boolean(settings.pricesIncludeTax),
        taxPercentage: settings.taxPercentage || null,
        commercialRegistrationNumber:
          settings.commercialRegistrationNumber || null,
        taxRegistrationNumber: settings.taxRegistrationNumber || null,
      }
    : null;
}

function publicFooterSettings(settings: any) {
  return settings
    ? {
        aboutStoreAr: settings.aboutStoreAr || "",
        aboutStoreEn: settings.aboutStoreEn || "",
        copyrightText: settings.copyrightText || "",
        quickLinks: settings.quickLinks || [],
        customerServiceLinks: settings.customerServiceLinks || [],
        paymentIcons: settings.paymentIcons || [],
        shippingPartners: settings.shippingPartners || [],
        showSocialLinks: settings.showSocialLinks !== false,
        showContactInfo: settings.showContactInfo !== false,
        showPoweredByMizar: settings.showPoweredByMizar !== false,
      }
    : null;
}

function publicHomepageSettings(settings: any) {
  return {
    enableHeroBanner: settings?.enableHeroBanner ?? true,
    heroBanners: settings?.heroBanners || [],
    enableFeaturedCategories: settings?.enableFeaturedCategories ?? true,
    featuredCategoryIds: settings?.featuredCategoryIds || [],
    enableFeaturedProducts: settings?.enableFeaturedProducts ?? true,
    featuredProductIds: settings?.featuredProductIds || [],
    enableBestSellers: settings?.enableBestSellers ?? true,
    enableNewArrivals: settings?.enableNewArrivals ?? true,
    enableOffers: settings?.enableOffers ?? true,
    enableBrands: settings?.enableBrands ?? false,
    enableReviews: settings?.enableReviews ?? true,
    enableNewsletter: settings?.enableNewsletter ?? true,
    enableBlogPreview: settings?.enableBlogPreview ?? false,
    enableServices: settings?.enableServices ?? true,
    services: settings?.services || [],
    enableInstagramGallery: settings?.enableInstagramGallery ?? false,
    instagramImages: settings?.instagramImages || [],
  };
}

function createNoStoreResponse(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const pathname = request.nextUrl.pathname;
    const slugFromParams = resolvedParams?.slug;
    const slugFromPath = pathname.split("/").filter(Boolean).pop();

    const requestedSlug = decodeURIComponent(
      String(slugFromParams || slugFromPath || "").trim(),
    );

    const previewRequested =
      request.nextUrl.searchParams.get("preview") === "1" ||
      request.nextUrl.searchParams.get("preview") === "true";

    const merchantSession = previewRequested
      ? await getSessionFromRequest(request)
      : null;

    const preview = Boolean(
      previewRequested &&
      merchantSession &&
      (merchantSession.role === "MERCHANT" ||
        merchantSession.role === "SUPER_ADMIN"),
    );

    if (previewRequested && !preview) {
      return createNoStoreResponse(
        {
          success: false,
          message:
            "معاينة المتجر متاحة للتاجر فقط. سجل الدخول من لوحة التحكم أولًا.",
          debug: {
            requestedSlug,
            previewRequested,
          },
        },
        401,
      );
    }

    if (!requestedSlug) {
      return createNoStoreResponse(
        {
          success: false,
          message: "رابط المتجر غير صحيح",
          debug: {
            requestedSlug,
            pathname,
          },
        },
        400,
      );
    }

    const where: any = {
      OR: [{ slug: requestedSlug }, { id: requestedSlug }],
    };

    if (!preview) {
      where.isActive = true;
      where.status = "OPEN";
    }

    const store = await prisma.store.findFirst({
      where,
      include: {
        contactSettings: true,
        addressSettings: true,
        socialLinks: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        paymentMethods: {
          orderBy: {
            createdAt: "asc",
          },
        },
        shippingSettings: true,
        taxSettings: true,
        policies: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        seoSettings: true,
        notificationSettings: true,
        productSettings: true,
        footerSettings: true,
        homepageSettings: true,
        brands: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        blogPosts: {
          where: {
            isPublished: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 6,
        },
        products: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            media: {
              orderBy: [
                {
                  isCover: "desc",
                },
                {
                  sortOrder: "asc",
                },
              ],
            },
            productOptions: {
              orderBy: {
                sortOrder: "asc",
              },
            },
            productVariants: {
              where: {
                status: "ACTIVE",
              },
              orderBy: {
                sortOrder: "asc",
              },
              include: {
                media: {
                  orderBy: [
                    {
                      isCover: "desc",
                    },
                    {
                      sortOrder: "asc",
                    },
                  ],
                },
              },
            },
            reviews: {
              where: {
                status: "APPROVED",
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 10,
            },
          },
        },
        reviews: {
          where: {
            status: "APPROVED",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 12,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      return createNoStoreResponse(
        {
          success: false,
          message: "المتجر غير موجود أو غير متاح حاليًا",
          debug: {
            requestedSlug,
            preview,
            pathname,
          },
        },
        404,
      );
    }

    if (
      preview &&
      merchantSession?.role !== "SUPER_ADMIN" &&
      store.ownerId &&
      store.ownerId !== merchantSession?.userId
    ) {
      return createNoStoreResponse(
        {
          success: false,
          message: "لا تملك صلاحية معاينة هذا المتجر",
          debug: {
            requestedSlug,
            preview,
          },
        },
        403,
      );
    }

    let content: any = buildDefaultStorefrontContent(store);
    const templateKey = normalizeTemplateKey(
      content.templateKey || store.template,
    );

    const products = safeArray(store.products).map(normalizeProduct);
    const categoryStats = getCategoryStats(products);
    const categories = categoryStats.map((category) => category.name);

    const featuredProducts = products.filter(
      (product: any) => product.isFeatured || product.showOnHome,
    );

    const latestProducts = [...products]
      .sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      })
      .slice(0, 12);

    const bestSellers = products
      .filter((product: any) => product.isBestSeller)
      .slice(0, 12);

    const newArrivals = products
      .filter((product: any) => product.isNewArrival)
      .slice(0, 12);

    const discountedProducts = products
      .filter((product: any) => product.isOnSale)
      .slice(0, 12);

    const socialLinks = mergeSocialLinks(store);
    const contactSettings = buildContactSettings(store);
    const addressSettings = buildAddressSettings(store);
    const shippingSettings = buildShippingSettings(store);
    const homepageSettings = buildHomepageSettings(store);
    content = {
      ...content,
      heroSlides: buildHeroSlides(store, content, homepageSettings),
    };
    const seoSettings = buildSeoSettings(store, content);
    content = {
      ...content,
      homeSections: {
        ...(asRecord(content.homeSections) || {}),
        showFeaturedProducts: Boolean(homepageSettings.enableFeaturedProducts),
        showLatestProducts: Boolean(homepageSettings.enableNewArrivals),
        showCategories: Boolean(homepageSettings.enableFeaturedCategories),
        showOffers: Boolean(homepageSettings.enableOffers),
        showAbout: true,
        showReviews: Boolean(homepageSettings.enableReviews),
        showBrands: Boolean(homepageSettings.enableBrands),
        showNewsletter: Boolean(homepageSettings.enableNewsletter),
        showServices: Boolean(homepageSettings.enableServices),
        showBlogPreview: Boolean(homepageSettings.enableBlogPreview),
        showInstagramGallery: Boolean(homepageSettings.enableInstagramGallery),
      },
    };

    const ratingCount = products.reduce(
      (total: number, product: any) => total + Number(product.ratingCount || 0),
      0,
    );

    const ratingSum = products.reduce(
      (total: number, product: any) =>
        total +
        Number(product.ratingAverage || 0) * Number(product.ratingCount || 0),
      0,
    );

    const ratingAverage = ratingCount > 0 ? ratingSum / ratingCount : 0;

    const publicProducts = products.map(publicProduct);
    const publicFeaturedProducts = featuredProducts.map(publicProduct);
    const publicLatestProducts = latestProducts.map(publicProduct);
    const publicBestSellers = bestSellers.map(publicProduct);
    const publicNewArrivals = newArrivals.map(publicProduct);
    const publicDiscountedProducts = discountedProducts.map(publicProduct);
    const publicSocials = publicSocialLinks(socialLinks);
    const fallbackSettings = getSettingsFallback(store);
    const fallbackPayments = safeArray(fallbackSettings.paymentMethods || getTemplateConfig(store).paymentMethods);
    const fallbackPolicies = safeArray(fallbackSettings.policies || getTemplateConfig(store).policies);
    const paymentSource = safeArray(store.paymentMethods).length ? safeArray(store.paymentMethods) : fallbackPayments;
    const policySource = safeArray(store.policies).length ? safeArray(store.policies) : fallbackPolicies;
    const publicPayments = publicPaymentMethods(paymentSource);
    const publicPolicyRows = publicPolicies(policySource);
    const fallbackBrands = safeArray(fallbackSettings.brands || getTemplateConfig(store).brands);
    const fallbackBlogPosts = safeArray(fallbackSettings.blogPosts || getTemplateConfig(store).blogPosts);
    const brandSource = safeArray(store.brands).length ? safeArray(store.brands) : fallbackBrands;
    const blogSource = safeArray(store.blogPosts).length ? safeArray(store.blogPosts) : fallbackBlogPosts;

    const publicBrandRows = brandSource
      .map(publicBrand)
      .filter((brand: any) => brand.isActive !== false);
    const publicBlogRows = blogSource
      .map(publicBlogPost)
      .filter((post: any) => post.isPublished !== false);
    const publicReviewRows = safeArray(store.reviews).map(publicReview);
    const publicShipping = publicShippingSettings(shippingSettings);
    const taxSource = {
      ...(store.taxSettings || {}),
      ...asRecord(fallbackSettings.taxes || fallbackSettings.taxSettings || getTemplateConfig(store).taxes),
    };
    const footerSource = {
      ...(store.footerSettings || {}),
      ...asRecord(fallbackSettings.footer || fallbackSettings.footerSettings || getTemplateConfig(store).footer),
    };
    const productSettingsSource = {
      ...(store.productSettings || {}),
      ...asRecord(fallbackSettings.productSettings || getTemplateConfig(store).productSettings),
    };
    const publicTaxes = publicTaxSettings(taxSource);
    const publicFooter = publicFooterSettings(footerSource);
    const publicHomepage = publicHomepageSettings(homepageSettings);

    const publicStore = {
      id: store.id,
      name: store.name,
      nameAr: store.nameAr,
      nameEn: store.nameEn,
      displayName: store.displayName,
      tagline: store.tagline,
      slug: store.slug,
      category: store.category,
      subCategory: store.subCategory,
      shortDescription: store.shortDescription,
      description: store.description,
      descriptionAr: store.descriptionAr,
      descriptionEn: store.descriptionEn,
      fullDescription: store.fullDescription,
      ownerName: store.ownerName,
      establishedYear: store.establishedYear,
      status: store.status,
      isActive: store.isActive,
      logoUrl: store.logoUrl,
      coverUrl: store.coverUrl,
      faviconUrl: store.faviconUrl,
      bannerUrl: store.bannerUrl,
      currency: (store as any).currency || (productSettingsSource as any)?.currency || "EGP",
      defaultLanguage: store.defaultLanguage,
      template: templateKey,
      templateKey,
      selectedTemplate: templateKey,
      storefrontTemplate: templateKey,
      templateConfig: {
        ...getTemplateConfig(store),
        ...content,
        templateKey,
        selectedTemplate: templateKey,
        storefrontTemplate: templateKey,
        activeTemplate: templateKey,
      },

      // Legacy fields for current frontend compatibility
      whatsapp: store.whatsapp,
      phone: store.contactPhone || contactSettings.mobileNumber,
      contactPhone: store.contactPhone,
      contactEmail: store.contactEmail,
      email: contactSettings.businessEmail,
      city: store.city || addressSettings.city,
      area: store.area || addressSettings.district,
      address: store.address || addressSettings.address,
      shippingFee: shippingSettings.shippingCost,
      shippingPolicy: shippingSettings.shippingPolicy,
      facebookUrl: store.facebookUrl,
      instagramUrl: store.instagramUrl,
      tiktokUrl: store.tiktokUrl,
      websiteUrl: store.websiteUrl,

      // Full settings objects for storefront templates.
      contactSettings,
      addressSettings,
      socialLinks: publicSocials,
      paymentMethods: publicPayments,
      shippingSettings: publicShipping,
      taxSettings: publicTaxes,
      policies: publicPolicyRows,
      seoSettings,
      notificationSettings: null,
      productSettings: productSettingsSource || null,
      footerSettings: publicFooter,
      homepageSettings: publicHomepage,

      // Legacy color fields kept in response for old components only.
      // New templates should ignore these and use their own theme.ts.
      primaryColor: store.primaryColor,
      accentColor: store.accentColor,
      fontPreset: store.fontPreset,
      layoutPreset: store.layoutPreset,
    };

    return createNoStoreResponse({
      success: true,

      store: publicStore,
      content,
      storefrontContent: content,

      templateKey,

      products: publicProducts,
      featuredProducts: publicFeaturedProducts,
      latestProducts: publicLatestProducts,
      bestSellers: publicBestSellers,
      newArrivals: publicNewArrivals,
      discountedProducts: publicDiscountedProducts,
      categories,
      categoryStats,

      brands: publicBrandRows,
      blogPosts: publicBlogRows,
      reviews: publicReviewRows,

      socialLinks: publicSocials,
      contactSettings,
      addressSettings,
      paymentMethods: publicPayments,
      shippingSettings: publicShipping,
      taxSettings: publicTaxes,
      policies: publicPolicyRows,
      seoSettings,
      notificationSettings: null,
      productSettings: productSettingsSource || null,
      footerSettings: publicFooter,
      homepageSettings: publicHomepage,

      ratingSummary: {
        ratingAverage,
        ratingCount,
        reviewsCount: publicReviewRows.length,
      },

      meta: {
        templateKey,
        requestedSlug,
        preview,
        generatedAt: new Date().toISOString(),
        productsCount: products.length,
        categoriesCount: categories.length,
      },
    });
  } catch (error) {
    console.error("PUBLIC_STOREFRONT_API_ERROR", error);

    return createNoStoreResponse(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل بيانات المتجر",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      500,
    );
  }
}
