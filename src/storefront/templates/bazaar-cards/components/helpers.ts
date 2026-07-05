import { premiumLabels } from "../theme";

export type Locale = "ar" | "en";

export function firstText(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null) continue;

    const text = String(value).trim();

    if (text) return text;
  }

  return "";
}

export function parseMaybeJson(value: any) {
  if (!value) return null;
  if (typeof value === "object") return value;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return null;
}

export function asArray(value: any): any[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const parsed = parseMaybeJson(value);

    if (Array.isArray(parsed)) return parsed;

    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function getLocale(props: any): Locale {
  const store = props?.store || {};
  const content = props?.content || {};
  const productSettings = getProductSettings(props);

  const raw = firstText(
    props?.locale,
    content?.language,
    content?.locale,
    content?.defaultLocale,
    store?.defaultLanguage,
    productSettings?.language,
    store?.templateConfig?.language,
    "ar",
  ).toLowerCase();

  return raw === "en" || raw === "english" ? "en" : "ar";
}

export function dir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function t(locale: Locale, ar: string, en: string) {
  return locale === "ar" ? ar : en;
}

export function labels(locale: Locale) {
  return premiumLabels[locale] || premiumLabels.ar;
}

export function getStoreName(store: any, locale: Locale) {
  return firstText(
    locale === "ar" ? store?.nameAr : store?.nameEn,
    store?.displayName,
    store?.name,
    locale === "ar" ? "متجر ميزار" : "Mizar Store",
  );
}

export function getStoreShortDescription(store: any, locale: Locale) {
  return firstText(
    locale === "ar" ? store?.shortDescription : store?.descriptionEn,
    store?.shortDescription,
    locale === "ar" ? store?.descriptionAr : store?.descriptionEn,
    store?.description,
    t(
      locale,
      "تجربة تسوق سهلة وسريعة من متجر موثوق.",
      "A simple, fast shopping experience from a trusted store.",
    ),
  );
}

export function getStoreDescription(store: any, locale: Locale) {
  return firstText(
    locale === "ar" ? store?.fullDescription : store?.descriptionEn,
    locale === "ar" ? store?.descriptionAr : store?.descriptionEn,
    store?.description,
    store?.shortDescription,
    t(
      locale,
      "اكتب وصف المتجر من لوحة التحكم ليظهر هنا بتنسيق احترافي داخل القالب.",
      "Write the store description in the dashboard to display it here professionally.",
    ),
  );
}

export function resolveUrl(value?: string | null) {
  const url = String(value || "").trim();

  if (!url) return "";
  if (/^(https?:|data:|blob:|mailto:|tel:)/i.test(url)) return url;

  return `/${url.replace(/^\/+/, "")}`;
}

export function getLogo(store: any) {
  return resolveUrl(firstText(store?.logoUrl, store?.faviconUrl));
}

export function getFavicon(store: any) {
  return resolveUrl(
    firstText(
      store?.faviconUrl,
      store?.storeInfo?.faviconUrl,
      store?.seoSettings?.faviconUrl,
      store?.logoUrl,
    ),
  );
}

export function getSeoTitle(store: any, locale: Locale) {
  return firstText(
    store?.seoSettings?.metaTitle,
    store?.metaTitle,
    getStoreName(store, locale),
  );
}

export function getSeoDescription(store: any, locale: Locale) {
  return firstText(
    store?.seoSettings?.metaDescription,
    store?.metaDescription,
    getStoreShortDescription(store, locale),
  );
}

export function getCoverImage(store: any, content?: any) {
  const hero = getHeroSlides(store, content)[0] || {};

  return resolveUrl(
    firstText(
      hero?.imageUrl,
      store?.bannerUrl,
      store?.coverUrl,
      store?.seoSettings?.ogImageUrl,
      store?.logoUrl,
    ),
  );
}

export function getStoreId(store: any) {
  return firstText(store?.id, store?.slug, "default");
}

export function homeUrl(store: any) {
  return `/store/${encodeURIComponent(firstText(store?.slug, "store"))}`;
}

export function productsUrl(store: any, query = "") {
  const base = `${homeUrl(store)}/products`;

  if (!query) return base;

  return query.startsWith("?") || query.startsWith("#")
    ? `${base}${query}`
    : `${base}/${query.replace(/^\/+/, "")}`;
}

export function cartUrl(store: any) {
  return `${homeUrl(store)}/cart`;
}

export function checkoutUrl(store: any) {
  return `${homeUrl(store)}/checkout`;
}

export function accountUrl(store: any) {
  return `${homeUrl(store)}/account`;
}

export function normalizeHref(store: any, href?: string | null) {
  const raw = String(href || "").trim();

  if (!raw || raw === "#" || raw === "#home") return homeUrl(store);
  if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
  if (raw === "/products" || raw === "#products") return productsUrl(store);
  if (raw === "/about" || raw === "#about") return `${homeUrl(store)}/about`;
  if (raw === "/contact" || raw === "#contact") return `${homeUrl(store)}/contact`;
  if (raw.startsWith("/store/")) return raw;
  if (raw.startsWith("/")) return `${homeUrl(store)}${raw}`;
  if (raw.startsWith("#")) return `${homeUrl(store)}${raw}`;

  return `${homeUrl(store)}/${raw}`;
}

export function productSlug(product: any) {
  return firstText(product?.slug, product?.id);
}

export function productUrl(store: any, product: any) {
  return `${homeUrl(store)}/product/${encodeURIComponent(productSlug(product))}`;
}

export function toNumber(value: any, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export function getCurrency(propsOrStore: any) {
  const store = propsOrStore?.store || propsOrStore || {};
  const productSettings = propsOrStore?.store
    ? getProductSettings(propsOrStore)
    : store?.productSettings;

  return firstText(productSettings?.currency, store?.currency, "EGP");
}

export function currencyLabel(currency: string, locale: Locale) {
  const key = String(currency || "EGP").toUpperCase();

  const labelsMap: Record<string, { ar: string; en: string }> = {
    EGP: { ar: "ج.م", en: "EGP" },
    SAR: { ar: "ر.س", en: "SAR" },
    KWD: { ar: "د.ك", en: "KWD" },
    AED: { ar: "د.إ", en: "AED" },
    USD: { ar: "$", en: "USD" },
  };

  return labelsMap[key]?.[locale] || key;
}

export function money(value: any, propsOrStore: any, locale: Locale) {
  const number = toNumber(value, 0);
  const currency = getCurrency(propsOrStore);

  const formatted = number.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 2,
  });

  return locale === "ar"
    ? `${formatted} ${currencyLabel(currency, locale)}`
    : `${currencyLabel(currency, locale)} ${formatted}`;
}

export function getProductPrice(product: any) {
  return toNumber(firstText(product?.finalPrice, product?.discountPrice, product?.price), 0);
}

export function getComparePrice(product: any) {
  const oldPrice = toNumber(firstText(product?.oldPrice, product?.compareAtPrice), 0);
  const currentPrice = getProductPrice(product);

  return oldPrice > currentPrice ? oldPrice : 0;
}

export function discountPercent(product: any) {
  const current = getProductPrice(product);
  const old = getComparePrice(product);

  if (!old || old <= current || current <= 0) {
    return toNumber(product?.discountPercent, 0);
  }

  return Math.round(((old - current) / old) * 100);
}

export function productImage(product: any) {
  const media = asArray(product?.media);

  const cover =
    media.find((item: any) => item?.isCover && (item?.url || item?.imageUrl || item?.fileUrl)) ||
    media.find((item: any) => item?.url || item?.imageUrl || item?.fileUrl);

  const variantMedia = asArray(product?.productVariants?.[0]?.media);
  const variantCover = variantMedia.find((item: any) => item?.url || item?.imageUrl || item?.fileUrl);

  return resolveUrl(
    firstText(
      product?.imageUrl,
      product?.coverUrl,
      cover?.url,
      cover?.imageUrl,
      cover?.fileUrl,
      variantCover?.url,
      product?.thumbnailUrl,
    ),
  );
}

export function isAvailable(product: any) {
  const status = String(product?.status || product?.stockLabel || "").toUpperCase();

  if (["OUT_OF_STOCK", "SOLD_OUT", "INACTIVE", "DRAFT", "غير متوفر"].includes(status)) {
    return false;
  }

  const stock = product?.availableStock ?? product?.stock ?? product?.quantity;

  if (stock !== undefined && stock !== null && Number(stock) <= 0) {
    return false;
  }

  return true;
}

export function getProductSettings(props: any) {
  const store = props?.store || {};
  const content = props?.content || {};

  return {
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
    currency: store?.currency || "EGP",
    language: store?.defaultLanguage || "ar",
    ...(content?.productDisplay || {}),
    ...(store?.productSettings || {}),
    ...(props?.productSettings || {}),
  };
}

export function getHomepageSettings(props: any) {
  const store = props?.store || {};
  const content = props?.content || {};
  const homepage = props?.homepageSettings || store?.homepageSettings || {};
  const sections = content?.homeSections || {};

  return {
    enableHeroBanner: homepage.enableHeroBanner ?? sections.showHero ?? true,
    heroBanners: asArray(homepage.heroBanners || homepage.banners || homepage.heroSlides),
    enableFeaturedCategories: homepage.enableFeaturedCategories ?? sections.showCategories ?? true,
    featuredCategoryIds: asArray(homepage.featuredCategoryIds),
    enableFeaturedProducts: homepage.enableFeaturedProducts ?? sections.showFeaturedProducts ?? true,
    featuredProductIds: asArray(homepage.featuredProductIds),
    enableBestSellers: homepage.enableBestSellers ?? sections.showBestSellers ?? true,
    enableNewArrivals: homepage.enableNewArrivals ?? sections.showLatestProducts ?? true,
    enableOffers: homepage.enableOffers ?? sections.showOffers ?? true,
    enableBrands: homepage.enableBrands ?? sections.showBrands ?? false,
    enableReviews: homepage.enableReviews ?? sections.showReviews ?? true,
    enableNewsletter: homepage.enableNewsletter ?? sections.showNewsletter ?? true,
    enableBlogPreview: homepage.enableBlogPreview ?? sections.showBlogPreview ?? false,
    enableServices: homepage.enableServices ?? sections.showServices ?? true,
    enableInstagramGallery: homepage.enableInstagramGallery ?? sections.showInstagramGallery ?? false,
    services: asArray(homepage.services),
    instagramImages: asArray(homepage.instagramImages),
  };
}

export function getNavigation(content: any) {
  const nav = content?.navigation || {};

  return {
    showHome: nav.showHome !== false,
    showProducts: nav.showProducts !== false,
    showAbout: nav.showAbout !== false,
    showContact: nav.showContact !== false,
    showWishlist: nav.showWishlist !== false,
    showCart: nav.showCart !== false,
    showLogin: nav.showLogin !== false,
  };
}

export function getHeroSlides(store: any, content?: any) {
  const slides = asArray(content?.heroSlides).filter((slide: any) => slide?.isActive !== false);

  if (slides.length) return slides;

  const homepageSlides = asArray(
    store?.homepageSettings?.heroBanners ||
      store?.homepageSettings?.banners ||
      store?.homepageSettings?.heroSlides,
  ).filter((slide: any) => slide?.isActive !== false && slide?.enabled !== false);

  if (homepageSlides.length) return homepageSlides;

  return [
    {
      id: "default-bazaar-slide",
      title: firstText(store?.tagline, store?.nameAr, store?.name, "Bazaar Cards"),
      titleEn: firstText(store?.nameEn, store?.tagline, store?.name, "Bazaar Cards"),
      subtitle: firstText(store?.shortDescription, store?.descriptionAr, store?.description),
      subtitleEn: firstText(store?.descriptionEn, store?.shortDescription, store?.description),
      imageUrl: firstText(store?.bannerUrl, store?.coverUrl, store?.logoUrl),
      buttonText: "تسوق الآن",
      buttonTextEn: "Shop now",
      buttonLink: "/products",
      secondaryButtonText: "من نحن",
      secondaryButtonTextEn: "About us",
      secondaryButtonLink: "/about",
    },
  ];
}

export function localizedSlide(slide: any, locale: Locale) {
  return {
    title: firstText(locale === "ar" ? slide?.title : slide?.titleEn, slide?.title, slide?.titleEn),
    subtitle: firstText(
      locale === "ar" ? slide?.subtitle : slide?.subtitleEn,
      slide?.subtitle,
      slide?.subtitleEn,
      slide?.description,
    ),
    buttonText: firstText(
      locale === "ar" ? slide?.buttonText : slide?.buttonTextEn,
      slide?.primaryButtonText,
      slide?.buttonText,
    ),
    buttonLink: firstText(slide?.buttonLink, slide?.primaryButtonHref, "/products"),
    secondaryButtonText: firstText(
      locale === "ar" ? slide?.secondaryButtonText : slide?.secondaryButtonTextEn,
      slide?.secondaryButtonText,
    ),
    secondaryButtonLink: firstText(slide?.secondaryButtonLink, slide?.secondaryButtonHref, "/about"),
  };
}

export function uniqueCategories(products: any[]) {
  const map = new Map<string, number>();

  for (const product of products || []) {
    const category = firstText(product?.category, product?.categoryName);

    if (!category) continue;

    map.set(category, (map.get(category) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getFeaturedProducts(props: any) {
  const products = asArray(props?.products);

  return asArray(props?.featuredProducts).length
    ? asArray(props.featuredProducts)
    : products.filter((product: any) => product.isFeatured || product.showOnHome).slice(0, 8);
}

export function getLatestProducts(props: any) {
  const products = asArray(props?.products);

  if (asArray(props?.latestProducts).length) return asArray(props.latestProducts);

  return products
    .slice()
    .sort((a: any, b: any) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 12);
}

export function getBestSellers(props: any) {
  const products = asArray(props?.products);

  return asArray(props?.bestSellers).length
    ? asArray(props.bestSellers)
    : products.filter((product: any) => product.isBestSeller).slice(0, 12);
}

export function getNewArrivals(props: any) {
  const products = asArray(props?.products);

  return asArray(props?.newArrivals).length
    ? asArray(props.newArrivals)
    : products.filter((product: any) => product.isNewArrival).slice(0, 12);
}

export function getDiscountedProducts(props: any) {
  const products = asArray(props?.products);

  return asArray(props?.discountedProducts).length
    ? asArray(props.discountedProducts)
    : products.filter((product: any) => discountPercent(product) > 0).slice(0, 12);
}

export function getContactSettings(props: any) {
  const store = props?.store || {};

  return {
    ...(store?.contactSettings || {}),
    ...(props?.contactSettings || {}),
    businessEmail: firstText(
      props?.contactSettings?.businessEmail,
      store?.contactSettings?.businessEmail,
      store?.contactEmail,
      store?.email,
    ),
    supportEmail: firstText(
      props?.contactSettings?.supportEmail,
      store?.contactSettings?.supportEmail,
      store?.contactEmail,
      store?.email,
    ),
    mobileNumber: firstText(
      props?.contactSettings?.mobileNumber,
      store?.contactSettings?.mobileNumber,
      store?.contactPhone,
      store?.phone,
    ),
    whatsappNumber: firstText(
      props?.contactSettings?.whatsappNumber,
      store?.contactSettings?.whatsappNumber,
      store?.whatsapp,
    ),
    landlineNumber: firstText(
      props?.contactSettings?.landlineNumber,
      store?.contactSettings?.landlineNumber,
    ),
    workingHours: firstText(
      props?.contactSettings?.workingHours,
      store?.contactSettings?.workingHours,
    ),
    emergencyContact: firstText(
      props?.contactSettings?.emergencyContact,
      store?.contactSettings?.emergencyContact,
    ),
  };
}

export function getAddressSettings(props: any) {
  const store = props?.store || {};
  const address = {
    ...(store?.addressSettings || {}),
    ...(props?.addressSettings || {}),
  };

  return {
    ...address,
    country: firstText(address.country, store?.country),
    state: firstText(address.state, store?.state, store?.governorate),
    city: firstText(address.city, store?.city),
    district: firstText(address.district, store?.area),
    address: firstText(
      address.address,
      store?.address,
      [address.country, address.state, address.city, address.district, address.street]
        .filter(Boolean)
        .join(" - "),
    ),
  };
}

export function getShippingSettings(props: any) {
  const store = props?.store || {};
  const raw = {
    ...(store?.shippingSettings || {}),
    ...(props?.shippingSettings || {}),
  };

  return {
    ...raw,
    shippingCost: toNumber(firstText(raw.shippingCost, store?.shippingFee), 0),
    freeShippingThreshold: raw.freeShippingThreshold ?? store?.freeShippingThreshold ?? null,
    estimatedDeliveryTime: firstText(raw.estimatedDeliveryTime, store?.shippingPolicy),
    pickupAvailable: Boolean(raw.pickupAvailable),
    shippingPolicy: firstText(raw.shippingPolicy, store?.shippingPolicy),
    shippingCompanies: asArray(raw.shippingCompanies),
  };
}

export function getTaxSettings(props: any) {
  return {
    ...((props?.store || {})?.taxSettings || {}),
    ...(props?.taxSettings || {}),
  };
}

export function getFooterSettings(props: any, locale: Locale) {
  const store = props?.store || {};
  const content = props?.content || {};

  const footer = {
    ...(content?.footerSettings || {}),
    ...(store?.footerSettings || {}),
    ...(props?.footerSettings || {}),
  };

  return {
    ...footer,
    about: firstText(
      locale === "ar" ? footer.aboutStoreAr : footer.aboutStoreEn,
      footer.text,
      getStoreDescription(store, locale),
    ),
    quickLinks: asArray(footer.quickLinks),
    customerServiceLinks: asArray(footer.customerServiceLinks),
    paymentIcons: asArray(footer.paymentIcons),
    shippingPartners: asArray(footer.shippingPartners),
    copyrightText: firstText(
      footer.copyrightText,
      `© ${new Date().getFullYear()} ${getStoreName(store, locale)}`,
    ),
    showSocialLinks: footer.showSocialLinks !== false,
    showContactInfo: footer.showContactInfo !== false,
    showPoweredByMizar: footer.showPoweredByMizar !== false,
  };
}

export function getPolicies(props: any) {
  const store = props?.store || {};
  const policies = asArray(props?.policies).length ? asArray(props.policies) : asArray(store?.policies);

  return policies.filter((policy: any) => policy?.isActive !== false);
}

export function getPolicy(props: any, type: string, locale: Locale) {
  const key = type.toUpperCase();

  const policy = getPolicies(props).find(
    (item: any) => String(item?.type || item?.key || "").toUpperCase() === key,
  );

  if (!policy) return null;

  return {
    title: firstText(locale === "ar" ? policy.titleAr : policy.titleEn, policy.title, policy.type),
    content: firstText(locale === "ar" ? policy.contentAr : policy.contentEn, policy.content),
  };
}

export function getSocialLinks(props: any) {
  const store = props?.store || {};
  const rows: Array<{ platform: string; url: string }> = [];

  function push(platform: string, url: any) {
    const value = String(url || "").trim();

    if (!value) return;

    rows.push({
      platform: String(platform || "LINK").toUpperCase(),
      url: resolveUrl(value),
    });
  }

  for (const item of asArray(props?.socialLinks).length ? asArray(props.socialLinks) : asArray(store?.socialLinks)) {
    if (item?.isActive === false) continue;

    push(item?.platform || item?.name || item?.label, item?.url);
  }

  const legacy: Record<string, any> = {
    FACEBOOK: store?.facebook || store?.facebookUrl,
    INSTAGRAM: store?.instagram || store?.instagramUrl,
    TIKTOK: store?.tiktok || store?.tiktokUrl,
    SNAPCHAT: store?.snapchat,
    X: store?.x || store?.twitter,
    WEBSITE: store?.website || store?.websiteUrl,
  };

  Object.entries(legacy).forEach(([platform, url]) => push(platform, url));

  const whatsapp = firstText(getContactSettings(props).whatsappNumber, store?.whatsapp);

  if (whatsapp) {
    push(
      "WHATSAPP",
      whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
    );
  }

  const seen = new Set<string>();

  return rows.filter((item) => {
    const key = `${item.platform}:${item.url}`;

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });
}

export function getPaymentMethods(props: any, locale: Locale) {
  const raw = asArray(props?.paymentMethods).length
    ? asArray(props.paymentMethods)
    : asArray((props?.store || {})?.paymentMethods);

  const fallback = firstText((props?.store || {})?.paymentMethod);
  const rows = raw.length ? raw : fallback ? [fallback] : [];

  const names: Record<string, { ar: string; en: string }> = {
    CASH_ON_DELIVERY: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
    BANK_TRANSFER: { ar: "تحويل بنكي", en: "Bank transfer" },
    VODAFONE_CASH: { ar: "Vodafone Cash", en: "Vodafone Cash" },
    INSTAPAY: { ar: "InstaPay", en: "InstaPay" },
    VISA: { ar: "Visa", en: "Visa" },
    MASTERCARD: { ar: "Mastercard", en: "Mastercard" },
    APPLE_PAY: { ar: "Apple Pay", en: "Apple Pay" },
    GOOGLE_PAY: { ar: "Google Pay", en: "Google Pay" },
    MEEZA: { ar: "Meeza", en: "Meeza" },
  };

  return rows
    .filter((item: any) => item?.isEnabled !== false)
    .map((item: any) => {
      const type = String(
        typeof item === "string" ? item : item?.type || item?.name || item?.label || "",
      ).toUpperCase();

      return {
        type,
        label: names[type]?.[locale] || firstText(item?.label, item?.name, type),
        config: typeof item === "object" ? item?.config : null,
      };
    })
    .filter((item) => item.type);
}

export function getBrands(props: any) {
  return asArray(props?.brands).filter((item: any) => item?.isActive !== false);
}

export function getBlogPosts(props: any) {
  return asArray(props?.blogPosts).filter((item: any) => item?.isPublished !== false);
}

export function getReviews(props: any) {
  return asArray(props?.reviews).filter((item: any) => item?.status !== "REJECTED");
}

export function getInstagramImages(props: any) {
  const settings = getHomepageSettings(props);

  return asArray(settings.instagramImages);
}

export function isBrowser() {
  return typeof window !== "undefined";
}

export function storageIdentityCandidates(store: any) {
  const values = [
    firstText(store?.id),
    firstText(store?.slug),
    getStoreId(store),
    "default",
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return Array.from(new Set(values));
}

export function cartStorageKeys(store: any) {
  const keys: string[] = [];

  for (const value of storageIdentityCandidates(store)) {
    keys.push(
      `mizar-cart:${value}`,
      `mizar-cart-${value}`,
      `cart:${value}`,
      `cart-${value}`,
      `storefront-cart:${value}`,
    );
  }

  keys.push("mizar-cart", "cart", "storefront-cart");

  return Array.from(new Set(keys));
}

export function wishlistStorageKeys(store: any) {
  const keys: string[] = [];

  for (const value of storageIdentityCandidates(store)) {
    keys.push(
      `mizar-wishlist:${value}`,
      `mizar-wishlist-${value}`,
      `wishlist:${value}`,
      `wishlist-${value}`,
      `storefront-wishlist:${value}`,
    );
  }

  keys.push("mizar-wishlist", "wishlist", "storefront-wishlist");

  return Array.from(new Set(keys));
}

export function readJsonArray(key: string) {
  if (!isBrowser()) return [] as any[];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeStorageProductId(item: any) {
  return firstText(item?.productId, item?.id, item?.product?.id, item?.product?.slug, item?.slug);
}

function normalizeStorageVariantId(item: any) {
  return firstText(item?.variantId, item?.variant?.id, item?.productVariantId);
}

function storageLineKey(item: any) {
  return `${normalizeStorageProductId(item)}::${normalizeStorageVariantId(item)}`;
}

export function readCart(store: any) {
  if (!isBrowser()) return [] as any[];

  const merged: any[] = [];
  const seen = new Set<string>();

  for (const key of cartStorageKeys(store)) {
    for (const item of readJsonArray(key)) {
      const productId = normalizeStorageProductId(item);

      if (!productId) continue;

      const rowKey = storageLineKey(item);
      const existingIndex = merged.findIndex((row) => storageLineKey(row) === rowKey);

      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...item,
          quantity: Math.max(
            toNumber(merged[existingIndex].quantity, 1),
            toNumber(item.quantity, 1),
          ),
        };

        continue;
      }

      if (seen.has(rowKey)) continue;

      seen.add(rowKey);
      merged.push(item);
    }
  }

  return merged;
}

export function saveCart(store: any, items: any[]) {
  if (!isBrowser()) return;

  const normalized = Array.isArray(items)
    ? items.filter((item) => normalizeStorageProductId(item))
    : [];

  for (const key of cartStorageKeys(store)) {
    window.localStorage.setItem(key, JSON.stringify(normalized));
  }

  window.dispatchEvent(
    new CustomEvent("mizar-cart-updated", {
      detail: {
        storeId: getStoreId(store),
        cart: normalized,
      },
    }),
  );
}

export function normalizeCartItem(item: any, products: any[]) {
  const productId = normalizeStorageProductId(item);
  const variantId = normalizeStorageVariantId(item) || null;

  const product =
    item.product ||
    products.find((product: any) => {
      const ids = [product?.id, product?.slug, product?.handle].map((value) => String(value || ""));

      return ids.includes(String(productId));
    }) ||
    null;

  const variants = asArray(product?.productVariants).length
    ? asArray(product?.productVariants)
    : asArray(product?.variants);

  const variant = variantId
    ? variants.find((row: any) => String(row?.id) === String(variantId))
    : null;

  const quantity = Math.max(1, Math.floor(toNumber(item.quantity, 1)));

  const price = toNumber(
    firstText(
      item.price,
      item.unitPrice,
      variant?.price,
      product?.finalPrice,
      product?.discountPrice,
      product?.price,
    ),
    0,
  );

  const imageUrl = resolveUrl(firstText(item.imageUrl, productImage(product)));

  return {
    ...item,
    productId,
    variantId,
    product,
    variant,
    quantity,
    price,
    unitPrice: price,
    lineTotal: price * quantity,
    imageUrl,
    name: firstText(item.name, product?.name, product?.title, productId),
  };
}

export function addToCart(props: any, product: any, quantity = 1, variant?: any) {
  const store = props?.store || {};

  if (!product) return;

  const productId = firstText(product?.id, product?.slug);
  const variantId = firstText(variant?.id, product?.selectedVariantId);

  if (!productId) return;

  const current = readCart(store);
  const rowKey = `${productId}::${variantId}`;
  const existingIndex = current.findIndex((item: any) => storageLineKey(item) === rowKey);

  const price = toNumber(firstText(variant?.price, product?.finalPrice, product?.discountPrice, product?.price), 0);

  if (existingIndex >= 0) {
    current[existingIndex] = {
      ...current[existingIndex],
      quantity: Math.max(1, toNumber(current[existingIndex].quantity, 1) + quantity),
      product,
      variant: variant || current[existingIndex].variant || null,
      price,
      unitPrice: price,
    };
  } else {
    current.push({
      productId,
      variantId: variantId || null,
      quantity: Math.max(1, quantity),
      product,
      variant: variant || null,
      price,
      unitPrice: price,
      imageUrl: productImage(product),
      name: firstText(product?.name, product?.title),
      slug: product?.slug || null,
      sku: firstText(variant?.sku, product?.sku),
    });
  }

  saveCart(store, current);
}

export function updateCartQuantity(
  store: any,
  productId: string,
  quantity: number,
  variantId?: string | null,
) {
  const targetKey = `${productId}::${variantId || ""}`;
  const current = readCart(store);

  const next =
    quantity <= 0
      ? current.filter((item: any) => storageLineKey(item) !== targetKey)
      : current.map((item: any) =>
          storageLineKey(item) === targetKey
            ? {
                ...item,
                quantity: Math.max(1, Math.floor(quantity)),
              }
            : item,
        );

  saveCart(store, next);
}

export function clearCart(store: any) {
  saveCart(store, []);
}

export function readWishlist(store: any) {
  if (!isBrowser()) return [] as any[];

  const merged: any[] = [];
  const seen = new Set<string>();

  for (const key of wishlistStorageKeys(store)) {
    for (const item of readJsonArray(key)) {
      const productId = normalizeStorageProductId(item);

      if (!productId || seen.has(productId)) continue;

      seen.add(productId);
      merged.push(item);
    }
  }

  return merged;
}

export function saveWishlist(store: any, items: any[]) {
  if (!isBrowser()) return;

  const normalized = Array.isArray(items)
    ? items.filter((item) => normalizeStorageProductId(item))
    : [];

  for (const key of wishlistStorageKeys(store)) {
    window.localStorage.setItem(key, JSON.stringify(normalized));
  }

  window.dispatchEvent(
    new CustomEvent("mizar-wishlist-updated", {
      detail: {
        storeId: getStoreId(store),
        wishlist: normalized,
      },
    }),
  );
}

export function toggleWishlist(props: any, product: any) {
  const store = props?.store || {};

  if (!product) return [] as any[];

  const current = readWishlist(store);
  const id = firstText(product?.id, product?.slug);
  const exists = current.some((item: any) => String(normalizeStorageProductId(item)) === String(id));

  const next = exists
    ? current.filter((item: any) => String(normalizeStorageProductId(item)) !== String(id))
    : [
        ...current,
        {
          productId: id,
          product,
          price: getProductPrice(product),
          imageUrl: productImage(product),
          name: firstText(product?.name, product?.title),
          slug: product?.slug || null,
        },
      ];

  saveWishlist(store, next);

  return next;
}

export function orderStorageKeys(store: any) {
  const keys: string[] = [];

  for (const value of storageIdentityCandidates(store)) {
    keys.push(`mizar-last-order:${value}`, `last-order:${value}`, `mizar-order:${value}`);
  }

  return Array.from(new Set(keys));
}

export function saveLastOrder(store: any, order: any) {
  if (!isBrowser()) return;

  for (const key of orderStorageKeys(store)) {
    window.localStorage.setItem(key, JSON.stringify(order || null));
  }
}

export function readLastOrder(store: any) {
  if (!isBrowser()) return null;

  for (const key of orderStorageKeys(store)) {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || "null");

      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // ignore
    }
  }

  return null;
}

export function orderSuccessUrl(store: any, orderId?: string | null) {
  const base = `${homeUrl(store)}/order-success`;

  return orderId ? `${base}/${encodeURIComponent(orderId)}` : base;
}

export function checkoutSuccessUrl(store: any, orderId?: string | null) {
  const url = `${homeUrl(store)}/checkout/success`;

  return orderId ? `${url}?orderId=${encodeURIComponent(orderId)}` : url;
}

export function normalizeEgyptianMobile(value: unknown) {
  let digits = String(value || "")
    .trim()
    .replace(/[^0-9+]/g, "");

  if (digits.startsWith("+20")) {
    digits = `0${digits.slice(3)}`;
  } else if (digits.startsWith("0020")) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith("20")) {
    digits = `0${digits.slice(2)}`;
  }

  digits = digits.replace(/[^0-9]/g, "");

  return digits;
}

export function isValidEgyptianMobile(value: unknown) {
  return /^01[0125][0-9]{8}$/.test(normalizeEgyptianMobile(value));
}

export function egyptianMobileMessage(locale: Locale) {
  return t(
    locale,
    "رقم الموبايل يجب أن يكون رقم مصري صحيح مثل 01012345678 أو +201012345678.",
    "Phone number must be a valid Egyptian mobile number, e.g. 01012345678 or +201012345678.",
  );
}

export function getCustomerStorageKeys(store: any) {
  const candidates = [
    firstText(store?.id),
    firstText(store?.slug),
    getStoreId(store),
    "default",
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  const keys: string[] = [];

  for (const value of Array.from(new Set(candidates))) {
    keys.push(
      `mizar-customer:${value}`,
      `mizar-customer-${value}`,
      `customer:${value}`,
      `customer-${value}`,
      `storefront-customer:${value}`,
    );
  }

  keys.push("mizar-customer", "customer", "storefront-customer");

  return Array.from(new Set(keys));
}

export function readCustomer(store: any) {
  if (!isBrowser()) return null;

  for (const key of getCustomerStorageKeys(store)) {
    try {
      const raw = window.localStorage.getItem(key);

      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (parsed?.id || parsed?.customerId || parsed?.email || parsed?.phone) {
        return parsed;
      }
    } catch {
      // ignore invalid localStorage value
    }
  }

  return null;
}

export function saveCustomer(store: any, customer: any, options?: { silent?: boolean }) {
  if (!isBrowser()) return;

  if (!customer) {
    clearCustomer(store, options);
    return;
  }

  const value = JSON.stringify(customer);
  let changed = false;

  for (const key of getCustomerStorageKeys(store)) {
    const current = window.localStorage.getItem(key);

    if (current !== value) {
      window.localStorage.setItem(key, value);
      changed = true;
    }
  }

  if (changed && !options?.silent) {
    window.dispatchEvent(
      new CustomEvent("mizar-customer-updated", {
        detail: customer,
      }),
    );
  }
}

export function clearCustomer(store: any, options?: { silent?: boolean }) {
  if (!isBrowser()) return;

  let changed = false;

  for (const key of getCustomerStorageKeys(store)) {
    if (window.localStorage.getItem(key) !== null) {
      window.localStorage.removeItem(key);
      changed = true;
    }
  }

  Object.keys(window.localStorage)
    .filter((key) => {
      const lower = key.toLowerCase();

      return (
        lower === "customer" ||
        lower === "mizar-customer" ||
        lower === "storefront-customer" ||
        lower.startsWith("mizar-customer:") ||
        lower.startsWith("mizar-customer-") ||
        lower.startsWith("customer:") ||
        lower.startsWith("customer-") ||
        lower.startsWith("storefront-customer:")
      );
    })
    .forEach((key) => {
      if (window.localStorage.getItem(key) !== null) {
        window.localStorage.removeItem(key);
        changed = true;
      }
    });

  if (changed && !options?.silent) {
    window.dispatchEvent(
      new CustomEvent("mizar-customer-updated", {
        detail: null,
      }),
    );
  }
}

function customerPayload(store: any, data: Record<string, any> = {}) {
  return {
    ...data,
    storeId: firstText(store?.id),
    storeSlug: firstText(store?.slug),
  };
}

export async function fetchCustomerSession(
  store: any,
  options?: {
    persist?: boolean;
    silent?: boolean;
  },
) {
  const params = new URLSearchParams();

  if (store?.id) params.set("storeId", String(store.id));
  if (store?.slug) params.set("storeSlug", String(store.slug));

  const response = await fetch(`/api/storefront/customer/me?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    if (options?.persist !== false) {
      clearCustomer(store, { silent: options?.silent });
    }

    return {
      success: false,
      authenticated: false,
      user: null,
      customer: null,
      message: data?.message || "تعذر تحميل حساب العميل",
    };
  }

  if (!data?.authenticated) {
    if (options?.persist !== false) {
      clearCustomer(store, { silent: options?.silent });
    }

    return {
      success: true,
      authenticated: false,
      user: null,
      customer: null,
    };
  }

  const customer = data.customer || data.user || null;

  if (customer && options?.persist !== false) {
    saveCustomer(
      store,
      {
        ...customer,
        user: data.user || customer.user || null,
        authenticated: true,
      },
      { silent: options?.silent },
    );
  }

  return data;
}

export async function loginCustomer(
  store: any,
  credentials: {
    email: string;
    password: string;
  },
) {
  const response = await fetch("/api/storefront/customer/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(customerPayload(store, credentials)),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    clearCustomer(store);
    throw new Error(data?.message || "فشل تسجيل الدخول");
  }

  saveCustomer(store, {
    ...(data.customer || {}),
    user: data.user || null,
    authenticated: true,
  });

  return data;
}

export async function registerCustomer(
  store: any,
  payload: {
    name: string;
    phone: string;
    email: string;
    password: string;
  },
) {
  const normalizedPayload = {
    ...payload,
    phone: normalizeEgyptianMobile(payload.phone),
  };

  const response = await fetch("/api/storefront/customer/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(customerPayload(store, normalizedPayload)),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    clearCustomer(store);
    throw new Error(data?.message || "فشل إنشاء حساب العميل");
  }

  saveCustomer(store, {
    ...(data.customer || {}),
    user: data.user || null,
    authenticated: true,
  });

  return data;
}

export async function logoutCustomer(store: any) {
  const response = await fetch("/api/storefront/customer/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => null);

  const data = response ? await response.json().catch(() => null) : null;

  clearCustomer(store);

  return data || {
    success: true,
    message: "تم تسجيل الخروج",
  };
}

export async function createStorefrontOrder(store: any, payload: Record<string, any>) {
  const response = await fetch("/api/storefront/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(customerPayload(store, payload)),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "فشل إنشاء الطلب");
  }

  return data;
}

export function calculateTotals(props: any, cartItems: any[]) {
  const shipping = getShippingSettings(props);
  const tax = getTaxSettings(props);

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      toNumber(
        item.lineTotal ?? toNumber(item.price, 0) * toNumber(item.quantity, 1),
        0,
      ),
    0,
  );

  const freeThreshold =
    shipping.freeShippingThreshold !== null &&
    shipping.freeShippingThreshold !== undefined &&
    shipping.freeShippingThreshold !== ""
      ? toNumber(shipping.freeShippingThreshold, 0)
      : 0;

  const shippingCost =
    subtotal <= 0
      ? 0
      : freeThreshold > 0 && subtotal >= freeThreshold
        ? 0
        : toNumber(shipping.shippingCost, 0);

  const taxPercent = subtotal <= 0 ? 0 : toNumber(tax.taxPercentage, 0);
  const pricesIncludeTax = Boolean(tax.pricesIncludeTax);
  const taxAmount = pricesIncludeTax ? 0 : (subtotal * taxPercent) / 100;

  return {
    subtotal,
    shippingCost,
    taxAmount,
    total: subtotal + shippingCost + taxAmount,
    freeThreshold,
    pricesIncludeTax,
    taxPercent,
  };
}

export function findProductFromParams(products: any[], params: any) {
  const raw = firstText(params?.productId, params?.id, params?.slug, params?.productSlug);

  return (
    products.find((product: any) =>
      [product?.id, product?.slug, product?.handle].some(
        (value) => String(value || "") === raw,
      ),
    ) ||
    products[0] ||
    null
  );
}