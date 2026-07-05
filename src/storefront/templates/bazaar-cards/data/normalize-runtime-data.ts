export type BazaarCardsRuntimeData = Record<string, any>;

function firstText(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null) continue;

    const text = String(value).trim();

    if (text) return text;
  }

  return "";
}

function parseMaybeJson(value: any) {
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

function asArray(value: any): any[] {
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

function toNumber(value: any, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function toNullableNumber(value: any) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function toBool(value: any, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;

  if (typeof value === "boolean") return value;

  if (typeof value === "number") return value === 1;

  const text = String(value).trim().toLowerCase();

  if (["true", "1", "yes", "y", "on"].includes(text)) return true;
  if (["false", "0", "no", "n", "off"].includes(text)) return false;

  return fallback;
}

function uniqueBy<T>(rows: T[], getKey: (row: T) => string) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const row of rows) {
    const key = getKey(row);

    if (!key || seen.has(key)) continue;

    seen.add(key);
    result.push(row);
  }

  return result;
}

function normalizePlatform(value: any) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function resolveTemplateConfig(store: any) {
  const parsed = parseMaybeJson(store?.templateConfig);

  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
}

function resolveSettings(data: any) {
  const settings = data?.settings || {};

  return {
    storeInfo: {
      ...(settings.storeInfo || {}),
      ...(data.storeInfo || {}),
      ...(data.store?.storeInfo || {}),
    },

    contactInfo: {
      ...(settings.contactInfo || {}),
      ...(data.contactInfo || {}),
      ...(data.contactSettings || {}),
      ...(data.store?.contactSettings || {}),
    },

    address: {
      ...(settings.address || {}),
      ...(data.address || {}),
      ...(data.addressSettings || {}),
      ...(data.store?.addressSettings || {}),
    },

    homepage: {
      ...(settings.homepage || {}),
      ...(data.homepage || {}),
      ...(data.homepageSettings || {}),
      ...(data.store?.homepageSettings || {}),
    },

    shipping: {
      ...(settings.shipping || {}),
      ...(data.shipping || {}),
      ...(data.shippingSettings || {}),
      ...(data.store?.shippingSettings || {}),
    },

    taxes: {
      ...(settings.taxes || {}),
      ...(data.taxes || {}),
      ...(data.taxSettings || {}),
      ...(data.store?.taxSettings || {}),
    },

    seo: {
      ...(settings.seo || {}),
      ...(data.seo || {}),
      ...(data.seoSettings || {}),
      ...(data.store?.seoSettings || {}),
    },

    productSettings: {
      ...(settings.productSettings || {}),
      ...(data.productSettings || {}),
      ...(data.store?.productSettings || {}),
    },

    footer: {
      ...(settings.footer || {}),
      ...(data.footer || {}),
      ...(data.footerSettings || {}),
      ...(data.content?.footerSettings || {}),
      ...(data.store?.footerSettings || {}),
    },

    notifications: {
      ...(settings.notifications || {}),
      ...(data.notifications || {}),
      ...(data.notificationSettings || {}),
      ...(data.store?.notificationSettings || {}),
    },

    socialLinks: asArray(settings.socialLinks).length
      ? asArray(settings.socialLinks)
      : asArray(data.socialLinks).length
        ? asArray(data.socialLinks)
        : asArray(data.store?.socialLinks),

    paymentMethods: asArray(settings.paymentMethods).length
      ? asArray(settings.paymentMethods)
      : asArray(data.paymentMethods).length
        ? asArray(data.paymentMethods)
        : asArray(data.store?.paymentMethods),

    policies: asArray(settings.policies).length
      ? asArray(settings.policies)
      : asArray(data.policies).length
        ? asArray(data.policies)
        : asArray(data.store?.policies),
  };
}

function normalizeStore(data: any, settings: any) {
  const store = data?.store || {};
  const storeInfo = settings.storeInfo || {};
  const contact = settings.contactInfo || {};
  const address = settings.address || {};
  const shipping = settings.shipping || {};
  const taxes = settings.taxes || {};
  const seo = settings.seo || {};
  const productSettings = settings.productSettings || {};
  const footer = settings.footer || {};
  const homepage = settings.homepage || {};
  const notifications = settings.notifications || {};
  const templateConfig = resolveTemplateConfig(store);

  const name = firstText(
    storeInfo.name,
    storeInfo.nameAr,
    store.nameAr,
    store.name,
    store.displayName,
    "Mizar Store",
  );

  const slug = firstText(storeInfo.slug, store.slug, "store");

  const normalizedStore = {
    ...store,

    id: firstText(store.id),
    name,
    displayName: firstText(store.displayName, name),
    nameAr: firstText(storeInfo.nameAr, store.nameAr, store.name, name),
    nameEn: firstText(storeInfo.nameEn, store.nameEn, store.name, name),
    slug,

    template: firstText(data.templateKey, store.template, templateConfig.templateKey, "BAZAAR_CARDS"),
    templateKey: firstText(data.templateKey, store.templateKey, templateConfig.templateKey, "BAZAAR_CARDS"),
    templateConfig: {
      ...templateConfig,
      templateKey: firstText(templateConfig.templateKey, data.templateKey, store.template, "BAZAAR_CARDS"),
    },

    category: firstText(storeInfo.category, store.category, "General"),
    subCategory: firstText(storeInfo.subCategory, store.subCategory),
    status: firstText(storeInfo.status, store.status, store.isActive === false ? "CLOSED" : "OPEN"),
    isActive: store.isActive !== false && storeInfo.status !== "CLOSED",

    defaultLanguage: firstText(
      storeInfo.defaultLanguage,
      productSettings.language,
      store.defaultLanguage,
      data.content?.language,
      "ar",
    ),

    tagline: firstText(storeInfo.tagline, store.tagline),
    ownerName: firstText(storeInfo.ownerName, store.ownerName),
    establishedYear: firstText(storeInfo.establishedYear, store.establishedYear),

    shortDescription: firstText(storeInfo.shortDescription, store.shortDescription, store.description),
    description: firstText(storeInfo.description, store.description),
    descriptionAr: firstText(storeInfo.descriptionAr, store.descriptionAr, store.description),
    descriptionEn: firstText(storeInfo.descriptionEn, store.descriptionEn, store.description),
    fullDescription: firstText(storeInfo.fullDescription, store.fullDescription, store.description),

    logoUrl: firstText(storeInfo.logoUrl, store.logoUrl),
    coverUrl: firstText(storeInfo.coverUrl, store.coverUrl),
    bannerUrl: firstText(storeInfo.bannerUrl, store.bannerUrl, store.coverUrl),
    faviconUrl: firstText(storeInfo.faviconUrl, store.faviconUrl, store.logoUrl),

    email: firstText(contact.businessEmail, store.email),
    contactEmail: firstText(contact.supportEmail, store.contactEmail, store.email),
    phone: firstText(contact.mobileNumber, store.phone, store.contactPhone),
    contactPhone: firstText(contact.mobileNumber, store.contactPhone, store.phone),
    whatsapp: firstText(contact.whatsappNumber, store.whatsapp),

    country: firstText(address.country, store.country),
    governorate: firstText(address.state, store.governorate, store.state),
    state: firstText(address.state, store.state, store.governorate),
    city: firstText(address.city, store.city),
    area: firstText(address.district, store.area),
    district: firstText(address.district, store.district),
    street: firstText(address.street, store.street),
    buildingNumber: firstText(address.buildingNumber, store.buildingNumber),
    postalCode: firstText(address.postalCode, store.postalCode),
    googleMapsUrl: firstText(address.googleMapsUrl, store.googleMapsUrl),
    latitude: firstText(address.latitude, store.latitude),
    longitude: firstText(address.longitude, store.longitude),
    address: firstText(
      address.address,
      store.address,
      [address.country, address.state, address.city, address.district, address.street]
        .filter(Boolean)
        .join(" - "),
    ),

    shippingFee: toNumber(firstText(shipping.shippingCost, store.shippingFee), 0),
    freeShippingThreshold: toNullableNumber(
      shipping.freeShippingThreshold ?? store.freeShippingThreshold,
    ),
    shippingPolicy: firstText(shipping.shippingPolicy, store.shippingPolicy),
    estimatedDeliveryTime: firstText(shipping.estimatedDeliveryTime, store.estimatedDeliveryTime),
    pickupAvailable: toBool(shipping.pickupAvailable, false),

    currency: firstText(productSettings.currency, store.currency, "EGP"),

    facebook: firstText(store.facebook, store.facebookUrl),
    instagram: firstText(store.instagram, store.instagramUrl),
    tiktok: firstText(store.tiktok, store.tiktokUrl),
    snapchat: firstText(store.snapchat),
    x: firstText(store.x, store.twitter),
    website: firstText(store.website, store.websiteUrl),

    homepageSettings: {
      ...homepage,
    },

    contactSettings: {
      ...contact,
    },

    addressSettings: {
      ...address,
    },

    shippingSettings: {
      ...shipping,
      shippingCost: toNumber(firstText(shipping.shippingCost, store.shippingFee), 0),
      freeShippingThreshold: toNullableNumber(
        shipping.freeShippingThreshold ?? store.freeShippingThreshold,
      ),
      pickupAvailable: toBool(shipping.pickupAvailable, false),
      shippingCompanies: asArray(shipping.shippingCompanies),
    },

    taxSettings: {
      ...taxes,
      pricesIncludeTax: toBool(taxes.pricesIncludeTax, false),
      taxPercentage: toNullableNumber(taxes.taxPercentage),
      commercialRegistrationNumber: firstText(taxes.commercialRegistrationNumber),
      taxRegistrationNumber: firstText(taxes.taxRegistrationNumber),
    },

    seoSettings: {
      ...seo,
      metaTitle: firstText(seo.metaTitle),
      metaDescription: firstText(seo.metaDescription),
      metaKeywords: firstText(seo.metaKeywords),
      ogImageUrl: firstText(seo.ogImageUrl, store.bannerUrl, store.coverUrl),
      canonicalUrl: firstText(seo.canonicalUrl),
      robotsIndex: seo.robotsIndex !== false,
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
      currency: firstText(productSettings.currency, store.currency, "EGP"),
      language: firstText(productSettings.language, store.defaultLanguage, "ar"),
      ...productSettings,
    },

    footerSettings: {
      ...footer,
    },

    notificationSettings: {
      ...notifications,
    },
  };

  return normalizedStore;
}

function normalizeHeroSlides(rawContent: any, store: any, homepage: any) {
  const settingsSlides = asArray(homepage.heroBanners || homepage.banners || homepage.heroSlides)
    .filter((slide: any) => slide?.isActive !== false && slide?.enabled !== false);

  if (settingsSlides.length) {
    return settingsSlides.map((slide: any, index: number) => ({
      id: firstText(slide.id, `homepage-hero-${index + 1}`),
      title: firstText(slide.title, slide.titleAr, store.tagline, store.nameAr, store.name),
      titleEn: firstText(slide.titleEn, slide.title, store.nameEn, store.name),
      subtitle: firstText(slide.subtitle, slide.description, slide.subtitleAr, store.shortDescription, store.descriptionAr, store.description),
      subtitleEn: firstText(slide.subtitleEn, slide.descriptionEn, slide.subtitle, store.descriptionEn, store.shortDescription, store.description),
      imageUrl: firstText(slide.imageUrl, slide.url, slide.fileUrl, slide.bannerUrl, store.bannerUrl, store.coverUrl, store.logoUrl),
      buttonText: firstText(slide.buttonText, slide.primaryButtonText, "تسوق الآن"),
      buttonTextEn: firstText(slide.buttonTextEn, slide.primaryButtonTextEn, "Shop now"),
      buttonLink: firstText(slide.buttonLink, slide.primaryButtonHref, "/products"),
      secondaryButtonText: firstText(slide.secondaryButtonText, slide.secondaryButtonTextAr, "من نحن"),
      secondaryButtonTextEn: firstText(slide.secondaryButtonTextEn, "About us"),
      secondaryButtonLink: firstText(slide.secondaryButtonLink, slide.secondaryButtonHref, "/about"),
      isActive: slide.isActive !== false,
    }));
  }

  const rawSlides = asArray(rawContent.heroSlides)
    .filter((slide: any) => slide?.isActive !== false)
    .map((slide: any) => ({
      ...slide,
      imageUrl: firstText(store.bannerUrl, store.coverUrl, slide.imageUrl, slide.url, store.logoUrl),
    }));

  if (rawSlides.length) return rawSlides;

  return [
    {
      id: "default-bazaar-slide",
      title: firstText(store.tagline, store.nameAr, store.name, "Bazaar Cards"),
      titleEn: firstText(store.nameEn, store.tagline, store.name, "Bazaar Cards"),
      subtitle: firstText(store.shortDescription, store.descriptionAr, store.description),
      subtitleEn: firstText(store.descriptionEn, store.shortDescription, store.description),
      imageUrl: firstText(store.bannerUrl, store.coverUrl, store.logoUrl),
      buttonText: "تسوق الآن",
      buttonTextEn: "Shop now",
      buttonLink: "/products",
      secondaryButtonText: "من نحن",
      secondaryButtonTextEn: "About us",
      secondaryButtonLink: "/about",
      isActive: true,
    },
  ];
}

function normalizeContent(data: any, store: any, settings: any) {
  const rawContent = data.content || data.storefrontContent || {};
  const homepage = settings.homepage || {};
  const footer = settings.footer || {};

  const enableHeroBanner = homepage.enableHeroBanner ?? rawContent.homeSections?.showHero ?? true;
  const enableFeaturedCategories =
    homepage.enableFeaturedCategories ?? rawContent.homeSections?.showCategories ?? true;
  const enableFeaturedProducts =
    homepage.enableFeaturedProducts ?? rawContent.homeSections?.showFeaturedProducts ?? true;
  const enableBestSellers = homepage.enableBestSellers ?? rawContent.homeSections?.showBestSellers ?? true;
  const enableNewArrivals =
    homepage.enableNewArrivals ?? rawContent.homeSections?.showLatestProducts ?? true;
  const enableOffers = homepage.enableOffers ?? rawContent.homeSections?.showOffers ?? true;
  const enableBrands = homepage.enableBrands ?? rawContent.homeSections?.showBrands ?? false;
  const enableReviews = homepage.enableReviews ?? rawContent.homeSections?.showReviews ?? true;
  const enableNewsletter = homepage.enableNewsletter ?? rawContent.homeSections?.showNewsletter ?? true;
  const enableBlogPreview = homepage.enableBlogPreview ?? rawContent.homeSections?.showBlogPreview ?? false;
  const enableServices = homepage.enableServices ?? rawContent.homeSections?.showServices ?? true;
  const enableInstagramGallery = homepage.enableInstagramGallery ?? rawContent.homeSections?.showInstagramGallery ?? false;

  return {
    ...rawContent,

    templateKey: "BAZAAR_CARDS",

    language: firstText(
      rawContent.language,
      rawContent.locale,
      store.defaultLanguage,
      store.productSettings?.language,
      "ar",
    ),

    locale: firstText(
      rawContent.locale,
      rawContent.language,
      store.defaultLanguage,
      store.productSettings?.language,
      "ar",
    ),

    heroSlides: normalizeHeroSlides(rawContent, store, homepage),

    homeSections: {
      ...(rawContent.homeSections || {}),

      showHero: Boolean(enableHeroBanner),
      showCategories: Boolean(enableFeaturedCategories),
      showFeaturedProducts: Boolean(enableFeaturedProducts),
      showBestSellers: Boolean(enableBestSellers),
      showLatestProducts: Boolean(enableNewArrivals),
      showOffers: Boolean(enableOffers),
      showBrands: Boolean(enableBrands),
      showReviews: Boolean(enableReviews),
      showNewsletter: Boolean(enableNewsletter),
      showBlogPreview: Boolean(enableBlogPreview),
      showServices: Boolean(enableServices),
      showInstagramGallery: Boolean(enableInstagramGallery),
    },

    navigation: {
      showHome: true,
      showProducts: true,
      showAbout: true,
      showContact: true,
      showWishlist: store.productSettings?.allowWishlist !== false,
      showCart: true,
      showLogin: true,
      ...(rawContent.navigation || {}),
    },

    footerSettings: {
      ...footer,
      ...(rawContent.footerSettings || {}),
    },

    productDisplay: {
      ...(rawContent.productDisplay || {}),
      ...(store.productSettings || {}),
    },
  };
}

function normalizeSocialLinks(data: any, store: any, settings: any) {
  const rows: Array<{ platform: string; url: string; isActive: boolean }> = [];

  function push(platform: string, url: any, isActive = true) {
    const cleanUrl = String(url || "").trim();

    if (!cleanUrl) return;

    rows.push({
      platform: normalizePlatform(platform),
      url: cleanUrl,
      isActive,
    });
  }

  for (const item of settings.socialLinks || []) {
    push(item.platform || item.name || item.label, item.url, item.isActive !== false);
  }

  push("FACEBOOK", store.facebook);
  push("INSTAGRAM", store.instagram);
  push("TIKTOK", store.tiktok);
  push("SNAPCHAT", store.snapchat);
  push("X", store.x);
  push("WEBSITE", store.website);

  if (store.whatsapp) {
    const whatsapp = String(store.whatsapp).trim();

    push(
      "WHATSAPP",
      whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
    );
  }

  return uniqueBy(
    rows.filter((item) => item.url && item.isActive !== false),
    (item) => `${item.platform}:${item.url}`,
  );
}

function normalizePaymentMethods(data: any, store: any, settings: any) {
  const source = asArray(settings.paymentMethods).length
    ? asArray(settings.paymentMethods)
    : asArray(store.paymentMethods).length
      ? asArray(store.paymentMethods)
      : asArray(data.paymentMethods).length
        ? asArray(data.paymentMethods)
        : firstText(store.paymentMethod)
          ? [store.paymentMethod]
          : ["CASH_ON_DELIVERY"];

  return source
    .map((item: any) => {
      const type = String(
        typeof item === "string" ? item : item.type || item.name || item.label || "",
      )
        .trim()
        .toUpperCase();

      if (!type) return null;

      return {
        type,
        isEnabled: typeof item === "object" ? item.isEnabled !== false : true,
        config: typeof item === "object" ? item.config || null : null,
      };
    })
    .filter(Boolean);
}

function normalizePolicies(data: any, settings: any) {
  const source = asArray(settings.policies).length
    ? asArray(settings.policies)
    : asArray(data.policies).length
      ? asArray(data.policies)
      : [];

  return source
    .filter((policy: any) => policy?.isActive !== false)
    .map((policy: any) => ({
      type: firstText(policy.type, policy.key),
      titleAr: firstText(policy.titleAr, policy.title),
      titleEn: firstText(policy.titleEn, policy.title),
      contentAr: firstText(policy.contentAr, policy.content),
      contentEn: firstText(policy.contentEn, policy.content),
      isActive: policy.isActive !== false,
    }))
    .filter((policy: any) => policy.type || policy.titleAr || policy.contentAr);
}

function normalizeProduct(product: any, store: any) {
  const variants = asArray(product.productVariants).length
    ? asArray(product.productVariants)
    : asArray(product.variants);

  const price = toNumber(firstText(product.price, product.finalPrice, product.discountPrice), 0);
  const discountPrice =
    product.discountPrice !== undefined && product.discountPrice !== null
      ? toNumber(product.discountPrice, price)
      : product.finalPrice !== undefined && product.finalPrice !== null
        ? toNumber(product.finalPrice, price)
        : null;

  const compareAtPrice = toNullableNumber(
    product.compareAtPrice ?? product.oldPrice ?? product.originalPrice,
  );

  return {
    ...product,

    id: firstText(product.id, product.slug),
    slug: firstText(product.slug, product.id),
    name: firstText(product.name, product.title, "Product"),
    title: firstText(product.title, product.name, "Product"),

    category: firstText(product.category, product.categoryName),
    brand: firstText(product.brand, product.brandName),
    sku: firstText(product.sku),

    description: firstText(product.description, product.fullDescription, product.shortDescription),
    shortDescription: firstText(product.shortDescription, product.description),

    price,
    discountPrice,
    finalPrice: discountPrice || price,
    compareAtPrice,

    currency: firstText(product.currency, store.currency, "EGP"),

    imageUrl: firstText(product.imageUrl, product.coverUrl, product.thumbnailUrl),
    coverUrl: firstText(product.coverUrl, product.imageUrl, product.thumbnailUrl),

    media: asArray(product.media),
    images: asArray(product.images),

    productVariants: variants,
    variants,

    stock: product.stock ?? product.availableStock ?? product.quantity ?? null,
    availableStock: product.availableStock ?? product.stock ?? product.quantity ?? null,

    isFeatured: Boolean(product.isFeatured || product.showOnHome),
    isBestSeller: Boolean(product.isBestSeller || product.bestSeller),
    isNewArrival: Boolean(product.isNewArrival || product.newArrival),
  };
}

function normalizeProducts(data: any, store: any) {
  return asArray(data.products).map((product) => normalizeProduct(product, store));
}

function uniqueCategoriesFromProducts(products: any[]) {
  const map = new Map<string, number>();

  for (const product of products) {
    const category = firstText(product.category, product.categoryName);

    if (!category) continue;

    map.set(category, (map.get(category) || 0) + 1);
  }

  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

function normalizeCategories(data: any, products: any[]) {
  const source = asArray(data.categories);

  if (source.length) {
    return source.map((item: any) => {
      if (typeof item === "string") {
        return {
          name: item,
          count: products.filter((product) => product.category === item).length,
        };
      }

      return {
        ...item,
        name: firstText(item.name, item.title, item.label),
        count: toNumber(item.count, 0),
      };
    });
  }

  return uniqueCategoriesFromProducts(products);
}

function selectFeaturedProducts(data: any, products: any[]) {
  const source = asArray(data.featuredProducts);

  if (source.length) return source;

  const ids = new Set(asArray(data.homepageSettings?.featuredProductIds).map((value) => String(value)));

  if (ids.size) {
    const selected = products.filter((product) => ids.has(String(product.id)) || ids.has(String(product.slug)));
    if (selected.length) return selected;
  }

  const marked = products.filter((product) => product.isFeatured);

  return marked.length ? marked.slice(0, 8) : products.slice(0, 8);
}

function selectLatestProducts(data: any, products: any[]) {
  const source = asArray(data.latestProducts);

  if (source.length) return source;

  return products
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 12);
}

function selectBestSellers(data: any, products: any[]) {
  const source = asArray(data.bestSellers).length
    ? asArray(data.bestSellers)
    : asArray(data.bestSellerProducts);

  if (source.length) return source;

  const marked = products.filter((product) => product.isBestSeller).slice(0, 12);

  return marked.length ? marked : products.slice(0, 12);
}

function selectNewArrivals(data: any, products: any[]) {
  const source = asArray(data.newArrivals).length
    ? asArray(data.newArrivals)
    : asArray(data.newArrivalProducts);

  if (source.length) return source;

  const marked = products.filter((product) => product.isNewArrival).slice(0, 12);

  if (marked.length) return marked;

  return products
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 12);
}

function selectDiscountedProducts(data: any, products: any[]) {
  const source = asArray(data.discountedProducts);

  if (source.length) return source;

  return products
    .filter((product) => {
      const finalPrice = toNumber(product.finalPrice || product.discountPrice || product.price, 0);
      const compareAtPrice = toNumber(product.compareAtPrice || product.oldPrice, 0);

      return compareAtPrice > finalPrice && finalPrice > 0;
    })
    .slice(0, 12);
}

function normalizeBrands(data: any) {
  return asArray(data.brands).filter((item) => item?.isActive !== false);
}

function normalizeBlogPosts(data: any) {
  return asArray(data.blogPosts).filter((item) => item?.isPublished !== false);
}

function normalizeReviews(data: any) {
  return asArray(data.reviews).filter((item) => item?.status !== "REJECTED");
}

export function normalizeBazaarCardsRuntimeData(rawData: BazaarCardsRuntimeData) {
  const data = rawData || {};
  const settings = resolveSettings(data);
  const store = normalizeStore(data, settings);
  const content = normalizeContent(data, store, settings);

  const products = normalizeProducts(data, store);
  const categories = normalizeCategories(data, products);

  const socialLinks = normalizeSocialLinks(data, store, settings);
  const paymentMethods = normalizePaymentMethods(data, store, settings);
  const policies = normalizePolicies(data, settings);

  const featuredProducts = selectFeaturedProducts(data, products);
  const latestProducts = selectLatestProducts(data, products);
  const bestSellers = selectBestSellers(data, products);
  const newArrivals = selectNewArrivals(data, products);
  const discountedProducts = selectDiscountedProducts(data, products);

  const normalized = {
    ...data,

    templateKey: "BAZAAR_CARDS",

    store: {
      ...store,
      socialLinks,
      paymentMethods,
      policies,
    },

    content,

    products,
    categories,

    featuredProducts,
    latestProducts,

    bestSellers,
    bestSellerProducts: bestSellers,

    newArrivals,
    newArrivalProducts: newArrivals,

    discountedProducts,

    brands: normalizeBrands(data),
    blogPosts: normalizeBlogPosts(data),
    reviews: normalizeReviews(data),

    socialLinks,
    paymentMethods,
    policies,

    homepageSettings: store.homepageSettings,
    contactSettings: store.contactSettings,
    addressSettings: store.addressSettings,
    shippingSettings: store.shippingSettings,
    taxSettings: store.taxSettings,
    seoSettings: store.seoSettings,
    productSettings: store.productSettings,
    footerSettings: store.footerSettings,
    notificationSettings: store.notificationSettings,
  };

  return normalized;
}