import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOCIAL_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "X",
  "LINKEDIN",
  "SNAPCHAT",
  "TELEGRAM",
  "PINTEREST",
  "WHATSAPP",
  "MESSENGER",
] as const;

const PAYMENT_METHOD_TYPES = [
  "CASH_ON_DELIVERY",
  "BANK_TRANSFER",
  "VODAFONE_CASH",
  "INSTAPAY",
  "VISA",
  "MASTERCARD",
  "APPLE_PAY",
  "GOOGLE_PAY",
  "MEEZA",
] as const;

const POLICY_TYPES = [
  "ABOUT_US",
  "PRIVACY_POLICY",
  "TERMS_CONDITIONS",
  "SHIPPING_POLICY",
  "RETURN_POLICY",
  "EXCHANGE_POLICY",
  "REFUND_POLICY",
  "FAQ",
  "CAREERS",
] as const;

const STORE_STATUSES = ["OPEN", "CLOSED"] as const;

type SocialPlatformValue = (typeof SOCIAL_PLATFORMS)[number];
type PaymentMethodValue = (typeof PAYMENT_METHOD_TYPES)[number];
type PolicyTypeValue = (typeof POLICY_TYPES)[number];
type StoreStatusValue = (typeof STORE_STATUSES)[number];

const STORE_SETTINGS_INCLUDE = {
  contactSettings: true,
  addressSettings: true,
  socialLinks: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  paymentMethods: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  shippingSettings: true,
  taxSettings: true,
  policies: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  seoSettings: true,
  notificationSettings: true,
  productSettings: true,
  footerSettings: true,
  homepageSettings: true,
  brands: {
    orderBy: {
      createdAt: "desc" as const,
    },
  },
  blogPosts: {
    orderBy: {
      createdAt: "desc" as const,
    },
  },
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  },
  _count: {
    select: {
      products: true,
      orders: true,
      customers: true,
    },
  },
};

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

function cleanText(value: unknown) {
  if (value === null || value === undefined) return "";

  return String(value).trim();
}

function nullableText(value: unknown) {
  const text = cleanText(value);

  return text || null;
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

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

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function hasOwn(source: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

function readAny(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (hasOwn(source, key)) return source[key];
  }

  return undefined;
}

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;

  if (typeof value === "number") return value === 1;

  const text = cleanText(value).toLowerCase();

  if (["true", "1", "yes", "y", "on", "open", "enabled"].includes(text)) {
    return true;
  }

  if (["false", "0", "no", "n", "off", "closed", "disabled"].includes(text)) {
    return false;
  }

  return fallback;
}

function toNumber(value: unknown, fallback: number | null = null) {
  if (value === null || value === undefined || value === "") return fallback;

  const number = Number(value);

  if (Number.isNaN(number)) return fallback;

  return number;
}

function toInt(value: unknown, fallback: number | null = null) {
  const number = toNumber(value, fallback);

  if (number === null) return fallback;

  return Math.trunc(number);
}

function normalizeSlug(value: unknown) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePhone(value: unknown) {
  const text = cleanText(value);

  if (!text) return null;

  return text
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/-/g, "");
}

function normalizeStoreStatus(value: unknown): StoreStatusValue {
  const text = cleanText(value).toUpperCase();

  if (STORE_STATUSES.includes(text as StoreStatusValue)) {
    return text as StoreStatusValue;
  }

  return "OPEN";
}

function normalizeSocialPlatform(value: unknown): SocialPlatformValue | null {
  const text = cleanText(value)
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  if (text === "TWITTER") return "X";

  if (SOCIAL_PLATFORMS.includes(text as SocialPlatformValue)) {
    return text as SocialPlatformValue;
  }

  return null;
}

function normalizePaymentType(value: unknown): PaymentMethodValue | null {
  const text = cleanText(value)
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  if (PAYMENT_METHOD_TYPES.includes(text as PaymentMethodValue)) {
    return text as PaymentMethodValue;
  }

  return null;
}

function normalizePolicyType(value: unknown): PolicyTypeValue | null {
  const text = cleanText(value)
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  if (text === "TERMS") return "TERMS_CONDITIONS";
  if (text === "PRIVACY") return "PRIVACY_POLICY";
  if (text === "SHIPPING") return "SHIPPING_POLICY";
  if (text === "RETURN") return "RETURN_POLICY";
  if (text === "REFUND") return "REFUND_POLICY";
  if (text === "EXCHANGE") return "EXCHANGE_POLICY";
  if (text === "ABOUT") return "ABOUT_US";

  if (POLICY_TYPES.includes(text as PolicyTypeValue)) {
    return text as PolicyTypeValue;
  }

  return null;
}

function setText(
  target: Record<string, unknown>,
  targetKey: string,
  source: Record<string, unknown>,
  sourceKeys: string[],
) {
  const value = readAny(source, sourceKeys);

  if (value !== undefined) {
    target[targetKey] = nullableText(value);
  }
}

function setRequiredText(
  target: Record<string, unknown>,
  targetKey: string,
  source: Record<string, unknown>,
  sourceKeys: string[],
) {
  const value = readAny(source, sourceKeys);

  if (value !== undefined) {
    const text = cleanText(value);

    if (text) {
      target[targetKey] = text;
    }
  }
}

function setNumber(
  target: Record<string, unknown>,
  targetKey: string,
  source: Record<string, unknown>,
  sourceKeys: string[],
  fallback: number | null = null,
) {
  const value = readAny(source, sourceKeys);

  if (value !== undefined) {
    target[targetKey] = toNumber(value, fallback);
  }
}

function setInt(
  target: Record<string, unknown>,
  targetKey: string,
  source: Record<string, unknown>,
  sourceKeys: string[],
  fallback: number | null = null,
) {
  const value = readAny(source, sourceKeys);

  if (value !== undefined) {
    target[targetKey] = toInt(value, fallback);
  }
}

function setBoolean(
  target: Record<string, unknown>,
  targetKey: string,
  source: Record<string, unknown>,
  sourceKeys: string[],
  fallback = false,
) {
  const value = readAny(source, sourceKeys);

  if (value !== undefined) {
    target[targetKey] = toBoolean(value, fallback);
  }
}

function setJson(
  target: Record<string, unknown>,
  targetKey: string,
  source: Record<string, unknown>,
  sourceKeys: string[],
) {
  const value = readAny(source, sourceKeys);

  if (value !== undefined) {
    target[targetKey] = value ?? null;
  }
}

function getBodySection(
  body: Record<string, unknown>,
  keys: string[],
  fallbackToRoot = false,
) {
  for (const key of keys) {
    const value = body[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }

  return fallbackToRoot ? body : {};
}

function getStoreId(request: NextRequest, body?: Record<string, unknown>) {
  return (
    cleanText(request.nextUrl.searchParams.get("storeId")) ||
    cleanText(body?.storeId) ||
    cleanText(asObject(body?.store).id) ||
    cleanText(asObject(body?.storeInfo).id)
  );
}

async function getManageableStore(storeId: string, userId: string, role: string) {
  const where =
    role === UserRole.SUPER_ADMIN
      ? {
          id: storeId,
        }
      : {
          id: storeId,
          ownerId: userId,
        };

  return prisma.store.findFirst({
    where,
    include: STORE_SETTINGS_INCLUDE,
  });
}

function buildSettingsPayload(store: any) {
  return {
    storeInfo: {
      id: store.id,
      name: store.name,
      nameAr: store.nameAr,
      nameEn: store.nameEn,
      displayName: store.displayName,
      slug: store.slug,
      category: store.category,
      subCategory: store.subCategory,
      shortDescription: store.shortDescription,
      description: store.description,
      descriptionAr: store.descriptionAr,
      descriptionEn: store.descriptionEn,
      fullDescription: store.fullDescription,
      tagline: store.tagline,
      ownerName: store.ownerName,
      establishedYear: store.establishedYear,
      logoUrl: store.logoUrl,
      coverUrl: store.coverUrl,
      faviconUrl: store.faviconUrl,
      bannerUrl: store.bannerUrl,
      status: store.status,
      isActive: store.isActive,
      defaultLanguage: store.defaultLanguage,
      template: store.template,
      templateConfig: store.templateConfig,
    },

    contactInfo: {
      businessEmail:
        store.contactSettings?.businessEmail || store.contactEmail || null,
      supportEmail:
        store.contactSettings?.supportEmail || store.contactEmail || null,
      mobileNumber:
        store.contactSettings?.mobileNumber || store.contactPhone || null,
      whatsappNumber:
        store.contactSettings?.whatsappNumber || store.whatsapp || null,
      landlineNumber: store.contactSettings?.landlineNumber || null,
      workingDays: store.contactSettings?.workingDays || null,
      workingHours: store.contactSettings?.workingHours || null,
      emergencyContact: store.contactSettings?.emergencyContact || null,
    },

    address: {
      country: store.addressSettings?.country || null,
      state: store.addressSettings?.state || null,
      city: store.addressSettings?.city || store.city || null,
      district: store.addressSettings?.district || store.area || null,
      street: store.addressSettings?.street || null,
      buildingNumber: store.addressSettings?.buildingNumber || null,
      postalCode: store.addressSettings?.postalCode || null,
      googleMapsUrl: store.addressSettings?.googleMapsUrl || null,
      latitude: store.addressSettings?.latitude || null,
      longitude: store.addressSettings?.longitude || null,
      address: store.address || null,
    },

    socialLinks: store.socialLinks || [],
    paymentMethods: store.paymentMethods || [],

    shipping: {
      shippingCompanies: store.shippingSettings?.shippingCompanies || [],
      shippingCost:
        typeof store.shippingSettings?.shippingCost === "number"
          ? store.shippingSettings.shippingCost
          : store.shippingFee || 0,
      freeShippingThreshold:
        store.shippingSettings?.freeShippingThreshold || null,
      estimatedDeliveryTime:
        store.shippingSettings?.estimatedDeliveryTime ||
        store.shippingPolicy ||
        null,
      pickupAvailable: store.shippingSettings?.pickupAvailable || false,
      shippingPolicy:
        store.shippingSettings?.shippingPolicy || store.shippingPolicy || null,
    },

    taxes: store.taxSettings || null,
    policies: store.policies || [],
    seo: store.seoSettings || null,
    notifications: store.notificationSettings || null,
    productSettings: store.productSettings || null,
    footer: store.footerSettings || null,
    homepage: store.homepageSettings || null,
    brands: store.brands || [],
    blogPosts: store.blogPosts || [],

    completion: calculateCompletion(store),
  };
}

function calculateCompletion(store: any) {
  const checks = [
    Boolean(store.name),
    Boolean(store.slug),
    Boolean(store.category),
    Boolean(store.description || store.shortDescription),
    Boolean(store.logoUrl),
    Boolean(store.coverUrl || store.bannerUrl),
    Boolean(store.contactSettings?.mobileNumber || store.contactPhone),
    Boolean(store.contactSettings?.whatsappNumber || store.whatsapp),
    Boolean(store.contactSettings?.businessEmail || store.contactEmail),
    Boolean(store.addressSettings?.city || store.city),
    Boolean(store.shippingSettings?.shippingPolicy || store.shippingPolicy),
    Boolean(store.socialLinks?.length),
    Boolean(store.policies?.length),
    Boolean(store.seoSettings?.metaTitle),
    Boolean(store.homepageSettings),
  ];

  const completed = checks.filter(Boolean).length;
  const total = checks.length;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
}

function normalizeSocialLinks(value: unknown) {
  const links: Array<{
    platform: SocialPlatformValue;
    url: string;
    isActive: boolean;
  }> = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      const row = asObject(item);
      const platform = normalizeSocialPlatform(row.platform);
      const url = nullableText(row.url);

      if (!platform || !url) continue;

      links.push({
        platform,
        url,
        isActive: toBoolean(row.isActive, true),
      });
    }

    return links;
  }

  const source = asObject(value);

  const aliases: Record<SocialPlatformValue, string[]> = {
    FACEBOOK: ["facebook", "facebookUrl", "FACEBOOK"],
    INSTAGRAM: ["instagram", "instagramUrl", "INSTAGRAM"],
    TIKTOK: ["tiktok", "tiktokUrl", "TIKTOK"],
    YOUTUBE: ["youtube", "youtubeUrl", "YOUTUBE"],
    X: ["x", "twitter", "twitterUrl", "X"],
    LINKEDIN: ["linkedin", "linkedinUrl", "LINKEDIN"],
    SNAPCHAT: ["snapchat", "snapchatUrl", "SNAPCHAT"],
    TELEGRAM: ["telegram", "telegramUrl", "TELEGRAM"],
    PINTEREST: ["pinterest", "pinterestUrl", "PINTEREST"],
    WHATSAPP: ["whatsapp", "whatsappChat", "whatsappUrl", "WHATSAPP"],
    MESSENGER: ["messenger", "messengerUrl", "MESSENGER"],
  };

  for (const platform of SOCIAL_PLATFORMS) {
    const url = nullableText(readAny(source, aliases[platform]));

    if (!url) continue;

    links.push({
      platform,
      url,
      isActive: true,
    });
  }

  return links;
}

function normalizePaymentMethods(value: unknown) {
  const methods: Array<{
    type: PaymentMethodValue;
    isEnabled: boolean;
    config: unknown;
  }> = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      const row = asObject(item);
      const type = normalizePaymentType(row.type || row.method);

      if (!type) continue;

      methods.push({
        type,
        isEnabled: toBoolean(row.isEnabled ?? row.enabled, false),
        config: row.config ?? null,
      });
    }

    return methods;
  }

  const source = asObject(value);

  for (const type of PAYMENT_METHOD_TYPES) {
    const raw = source[type] ?? source[type.toLowerCase()];

    if (raw === undefined) continue;

    if (typeof raw === "boolean") {
      methods.push({
        type,
        isEnabled: raw,
        config: null,
      });

      continue;
    }

    const row = asObject(raw);

    methods.push({
      type,
      isEnabled: toBoolean(row.isEnabled ?? row.enabled, false),
      config: row.config ?? row,
    });
  }

  return methods;
}

function normalizePolicies(value: unknown) {
  const policies: Array<{
    type: PolicyTypeValue;
    titleAr: string | null;
    titleEn: string | null;
    contentAr: string | null;
    contentEn: string | null;
    isActive: boolean;
  }> = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      const row = asObject(item);
      const type = normalizePolicyType(row.type);

      if (!type) continue;

      policies.push({
        type,
        titleAr: nullableText(row.titleAr),
        titleEn: nullableText(row.titleEn),
        contentAr: nullableText(row.contentAr ?? row.content),
        contentEn: nullableText(row.contentEn),
        isActive: toBoolean(row.isActive, true),
      });
    }

    return policies;
  }

  const source = asObject(value);

  for (const type of POLICY_TYPES) {
    const raw = source[type] || source[type.toLowerCase()];

    if (raw === undefined) continue;

    if (typeof raw === "string") {
      policies.push({
        type,
        titleAr: null,
        titleEn: null,
        contentAr: nullableText(raw),
        contentEn: null,
        isActive: true,
      });

      continue;
    }

    const row = asObject(raw);

    policies.push({
      type,
      titleAr: nullableText(row.titleAr),
      titleEn: nullableText(row.titleEn),
      contentAr: nullableText(row.contentAr ?? row.content),
      contentEn: nullableText(row.contentEn),
      isActive: toBoolean(row.isActive, true),
    });
  }

  return policies;
}

function buildStoreUpdateData(
  body: Record<string, unknown>,
  storeInfo: Record<string, unknown>,
  contactInfo: Record<string, unknown>,
  addressInfo: Record<string, unknown>,
  shippingInfo: Record<string, unknown>,
) {
  const storeData: Record<string, unknown> = {};

  const nameValue = readAny(storeInfo, ["name", "storeName"]);
  if (nameValue !== undefined) {
    const name = cleanText(nameValue);

    if (name) {
      storeData.name = name;
    }
  }

  setText(storeData, "nameAr", storeInfo, ["nameAr", "storeNameAr", "arabicName"]);
  setText(storeData, "nameEn", storeInfo, ["nameEn", "storeNameEn", "englishName"]);
  setText(storeData, "displayName", storeInfo, ["displayName"]);
  setRequiredText(storeData, "category", storeInfo, ["category", "businessCategory"]);
  setText(storeData, "subCategory", storeInfo, ["subCategory"]);
  setText(storeData, "shortDescription", storeInfo, ["shortDescription"]);
  setText(storeData, "description", storeInfo, ["description"]);
  setText(storeData, "descriptionAr", storeInfo, ["descriptionAr"]);
  setText(storeData, "descriptionEn", storeInfo, ["descriptionEn"]);
  setText(storeData, "fullDescription", storeInfo, ["fullDescription"]);
  setText(storeData, "tagline", storeInfo, ["tagline"]);
  setText(storeData, "ownerName", storeInfo, ["ownerName", "storeOwnerName"]);
  setInt(storeData, "establishedYear", storeInfo, ["establishedYear"]);
  setText(storeData, "logoUrl", storeInfo, ["logoUrl", "logo"]);
  setText(storeData, "coverUrl", storeInfo, ["coverUrl", "coverImage"]);
  setText(storeData, "faviconUrl", storeInfo, ["faviconUrl", "favicon"]);
  setText(storeData, "bannerUrl", storeInfo, ["bannerUrl", "bannerImage"]);
  setRequiredText(storeData, "defaultLanguage", storeInfo, ["defaultLanguage", "language"]);

  const statusValue = readAny(storeInfo, ["status", "storeStatus"]);
  if (statusValue !== undefined) {
    const status = normalizeStoreStatus(statusValue);
    storeData.status = status;
    storeData.isActive = status === "OPEN";
  }

  const isActiveValue = readAny(storeInfo, ["isActive"]);
  if (isActiveValue !== undefined) {
    storeData.isActive = toBoolean(isActiveValue, true);
  }

  const contactPhoneValue = readAny(contactInfo, [
    "mobileNumber",
    "phone",
    "contactPhone",
  ]);
  if (contactPhoneValue !== undefined) {
    storeData.contactPhone = normalizePhone(contactPhoneValue);
  }

  const contactEmailValue = readAny(contactInfo, [
    "businessEmail",
    "supportEmail",
    "email",
    "contactEmail",
  ]);
  if (contactEmailValue !== undefined) {
    storeData.contactEmail = nullableText(contactEmailValue);
  }

  const whatsappValue = readAny(contactInfo, ["whatsappNumber", "whatsapp"]);
  if (whatsappValue !== undefined) {
    storeData.whatsapp = normalizePhone(whatsappValue);
  }

  const cityValue = readAny(addressInfo, ["city"]);
  if (cityValue !== undefined) {
    storeData.city = nullableText(cityValue);
  }

  const districtValue = readAny(addressInfo, ["district", "area"]);
  if (districtValue !== undefined) {
    storeData.area = nullableText(districtValue);
  }

  const addressValue = readAny(addressInfo, ["address", "fullAddress"]);
  if (addressValue !== undefined) {
    storeData.address = nullableText(addressValue);
  }

  const shippingCostValue = readAny(shippingInfo, ["shippingCost", "shippingFee"]);
  if (shippingCostValue !== undefined) {
    storeData.shippingFee = toNumber(shippingCostValue, 0) || 0;
  }

  const shippingPolicyValue = readAny(shippingInfo, [
    "shippingPolicy",
    "estimatedDeliveryTime",
  ]);
  if (shippingPolicyValue !== undefined) {
    storeData.shippingPolicy = nullableText(shippingPolicyValue);
  }

  const websiteValue = readAny(storeInfo, ["websiteUrl", "website"]);
  if (websiteValue !== undefined) {
    storeData.websiteUrl = nullableText(websiteValue);
  }

  // Important:
  // Do not save color or font customization here.
  // Template colors and typography are controlled inside each template folder.
  delete storeData.primaryColor;
  delete storeData.accentColor;
  delete storeData.secondaryColor;
  delete storeData.backgroundColor;
  delete storeData.textColor;
  delete storeData.fontPreset;

  return storeData;
}

function buildContactData(source: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  setText(data, "businessEmail", source, ["businessEmail", "email"]);
  setText(data, "supportEmail", source, ["supportEmail", "customerSupportEmail"]);
  setText(data, "mobileNumber", source, ["mobileNumber", "mobile", "phone"]);
  setText(data, "whatsappNumber", source, ["whatsappNumber", "whatsapp"]);
  setText(data, "landlineNumber", source, ["landlineNumber", "landline"]);
  setJson(data, "workingDays", source, ["workingDays"]);
  setJson(data, "workingHours", source, ["workingHours", "businessWorkingHours"]);
  setText(data, "emergencyContact", source, ["emergencyContact"]);

  return data;
}

function buildAddressData(source: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  setText(data, "country", source, ["country"]);
  setText(data, "state", source, ["state", "governorate"]);
  setText(data, "city", source, ["city"]);
  setText(data, "district", source, ["district", "area"]);
  setText(data, "street", source, ["street"]);
  setText(data, "buildingNumber", source, ["buildingNumber"]);
  setText(data, "postalCode", source, ["postalCode"]);
  setText(data, "googleMapsUrl", source, ["googleMapsUrl", "googleMapsLocation"]);
  setNumber(data, "latitude", source, ["latitude"]);
  setNumber(data, "longitude", source, ["longitude"]);

  return data;
}

function buildShippingData(source: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  setJson(data, "shippingCompanies", source, ["shippingCompanies"]);
  setNumber(data, "shippingCost", source, ["shippingCost", "shippingFee"], 0);
  setNumber(data, "freeShippingThreshold", source, ["freeShippingThreshold"]);
  setText(data, "estimatedDeliveryTime", source, ["estimatedDeliveryTime"]);
  setBoolean(data, "pickupAvailable", source, ["pickupAvailable"], false);
  setText(data, "shippingPolicy", source, ["shippingPolicy"]);

  return data;
}

function buildTaxData(source: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  setBoolean(data, "pricesIncludeTax", source, ["pricesIncludeTax"], false);
  setNumber(data, "taxPercentage", source, ["taxPercentage"]);
  setText(data, "commercialRegistrationNumber", source, [
    "commercialRegistrationNumber",
    "crNumber",
  ]);
  setText(data, "taxRegistrationNumber", source, [
    "taxRegistrationNumber",
    "taxNumber",
  ]);

  return data;
}

function buildSeoData(source: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  setText(data, "metaTitle", source, ["metaTitle", "storeMetaTitle"]);
  setText(data, "metaDescription", source, [
    "metaDescription",
    "storeMetaDescription",
  ]);
  setText(data, "metaKeywords", source, ["metaKeywords"]);
  setText(data, "ogImageUrl", source, ["ogImageUrl", "openGraphImage"]);
  setText(data, "canonicalUrl", source, ["canonicalUrl"]);
  setBoolean(data, "robotsIndex", source, ["robotsIndex"], true);

  return data;
}

function buildNotificationData(source: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  setBoolean(data, "emailNotificationsEnabled", source, [
    "emailNotificationsEnabled",
    "enableEmailNotifications",
  ]);
  setBoolean(data, "smsNotificationsEnabled", source, [
    "smsNotificationsEnabled",
    "enableSmsNotifications",
  ]);
  setBoolean(data, "whatsappNotificationsEnabled", source, [
    "whatsappNotificationsEnabled",
    "enableWhatsAppNotifications",
  ]);
  setBoolean(data, "browserNotificationsEnabled", source, [
    "browserNotificationsEnabled",
    "enableBrowserNotifications",
  ]);

  return data;
}

function buildProductSettingsData(source: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  setBoolean(data, "displaySku", source, ["displaySku", "displaySKU"], true);
  setBoolean(data, "displayBrand", source, ["displayBrand"], true);
  setBoolean(data, "displayStockQuantity", source, ["displayStockQuantity"]);
  setBoolean(data, "allowReviews", source, ["allowReviews"], true);
  setBoolean(data, "allowQuestions", source, ["allowQuestions", "allowQuestionsAndAnswers"], true);
  setBoolean(data, "allowWishlist", source, ["allowWishlist"], true);
  setBoolean(data, "allowCompare", source, ["allowCompare"], false);
  setBoolean(data, "enableRecentlyViewed", source, ["enableRecentlyViewed"], true);
  setBoolean(data, "enableProductSharing", source, ["enableProductSharing"], true);
  setInt(data, "defaultProductsPerPage", source, ["defaultProductsPerPage"], 24);
  setRequiredText(data, "weightUnit", source, ["weightUnit"]);
  setRequiredText(data, "dimensionUnit", source, ["dimensionUnit"]);
  setRequiredText(data, "currency", source, ["currency"]);
  setRequiredText(data, "language", source, ["language"]);

  return data;
}

function buildFooterData(source: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  setText(data, "aboutStoreAr", source, ["aboutStoreAr", "aboutStore"]);
  setText(data, "aboutStoreEn", source, ["aboutStoreEn"]);
  setJson(data, "quickLinks", source, ["quickLinks"]);
  setJson(data, "customerServiceLinks", source, ["customerServiceLinks"]);
  setJson(data, "paymentIcons", source, ["paymentIcons"]);
  setJson(data, "shippingPartners", source, ["shippingPartners"]);
  setText(data, "copyrightText", source, ["copyrightText", "copyright"]);

  return data;
}

function buildHomepageData(source: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  setBoolean(data, "enableHeroBanner", source, ["enableHeroBanner"], true);
  setJson(data, "heroBanners", source, ["heroBanners", "bannerImages"]);
  setBoolean(data, "enableFeaturedCategories", source, ["enableFeaturedCategories"], true);
  setJson(data, "featuredCategoryIds", source, ["featuredCategoryIds"]);
  setBoolean(data, "enableFeaturedProducts", source, ["enableFeaturedProducts"], true);
  setJson(data, "featuredProductIds", source, ["featuredProductIds"]);
  setBoolean(data, "enableBestSellers", source, ["enableBestSellers"], true);
  setBoolean(data, "enableNewArrivals", source, ["enableNewArrivals"], true);
  setBoolean(data, "enableOffers", source, ["enableOffers", "enableOffersSection"], true);
  setBoolean(data, "enableBrands", source, ["enableBrands", "enableBrandsSection"], false);
  setBoolean(data, "enableReviews", source, ["enableReviews", "enableCustomerReviews"], true);
  setBoolean(data, "enableNewsletter", source, ["enableNewsletter"], true);
  setBoolean(data, "enableBlogPreview", source, ["enableBlogPreview"], false);
  setBoolean(data, "enableServices", source, ["enableServices", "enableServicesSection"], true);
  setJson(data, "services", source, ["services"]);
  setBoolean(data, "enableInstagramGallery", source, ["enableInstagramGallery"], false);
  setJson(data, "instagramImages", source, ["instagramImages"]);

  return data;
}


function slugify(value: unknown, fallback = "item") {
  const slug = String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

function normalizeBrandsInput(value: unknown) {
  return safeArray(value)
    .map((item: any) => ({
      name: cleanText(item?.name || item?.nameAr || item?.title),
      logoUrl: normalizeNullableText(item?.logoUrl || item?.imageUrl),
      website: normalizeNullableText(item?.website || item?.websiteUrl || item?.url),
      isActive: item?.isActive !== false,
    }))
    .filter((item: any) => item.name || item.logoUrl);
}

function normalizeBlogPostsInput(value: unknown) {
  const seen = new Set<string>();

  return safeArray(value)
    .map((item: any, index: number) => {
      const titleAr = cleanText(item?.titleAr || item?.title || item?.name);
      const titleEn = cleanText(item?.titleEn || item?.title || item?.nameEn);
      const baseTitle = titleEn || titleAr || `blog-post-${index + 1}`;
      const slug = slugify(item?.slug || baseTitle, `blog-post-${index + 1}`);

      return {
        titleAr: titleAr || null,
        titleEn: titleEn || null,
        slug,
        excerptAr: normalizeNullableText(item?.excerptAr || item?.excerpt || item?.summary),
        excerptEn: normalizeNullableText(item?.excerptEn || item?.excerpt || item?.summaryEn),
        contentAr: normalizeNullableText(item?.contentAr || item?.content),
        contentEn: normalizeNullableText(item?.contentEn || item?.content),
        imageUrl: normalizeNullableText(item?.imageUrl || item?.coverUrl || item?.logoUrl),
        isPublished: item?.isPublished !== false,
      };
    })
    .filter((item: any) => {
      if (!(item.titleAr || item.titleEn || item.excerptAr || item.excerptEn || item.imageUrl)) return false;
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
}

async function upsertOneToOne(
  tx: any,
  modelName: string,
  storeId: string,
  data: Record<string, unknown>,
) {
  if (Object.keys(data).length === 0) return;

  await tx[modelName].upsert({
    where: {
      storeId,
    },
    create: {
      storeId,
      ...data,
    },
    update: data,
  });
}

async function updateTemplateConfigSettingsFallback(storeId: string, existingStore: any, fallbackPayload: Record<string, unknown>) {
  try {
    const existingTemplateConfig = parseJsonRecord(existingStore?.templateConfig);
    const nextTemplateConfig = {
      ...existingTemplateConfig,
      settingsFallback: fallbackPayload,
      dashboardSettings: fallbackPayload,
      settings: fallbackPayload,
      homepageSettings: fallbackPayload.homepage,
      storeInfo: fallbackPayload.storeInfo,
      contactInfo: fallbackPayload.contactInfo,
      address: fallbackPayload.address,
      shipping: fallbackPayload.shipping,
      taxes: fallbackPayload.taxes,
      seo: fallbackPayload.seo,
      productSettings: fallbackPayload.productSettings,
      footer: fallbackPayload.footer,
      notifications: fallbackPayload.notifications,
      socialLinks: fallbackPayload.socialLinks,
      paymentMethods: fallbackPayload.paymentMethods,
      policies: fallbackPayload.policies,
      brands: fallbackPayload.brands,
      blogPosts: fallbackPayload.blogPosts,
      updatedAt: new Date().toISOString(),
    };

    await prisma.store.update({
      where: { id: storeId },
      data: { templateConfig: nextTemplateConfig },
    });
  } catch (error) {
    console.warn("Could not mirror dashboard settings into templateConfig:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (
      !session ||
      (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN)
    ) {
      return jsonResponse(
        {
          success: false,
          message: "يجب تسجيل الدخول كتاجر أولًا",
        },
        401,
      );
    }

    const storeId = getStoreId(request);

    if (!storeId) {
      return jsonResponse(
        {
          success: false,
          message: "كود المتجر مطلوب",
        },
        400,
      );
    }

    const store = await getManageableStore(storeId, session.userId, session.role);

    if (!store) {
      return jsonResponse(
        {
          success: false,
          message: "المتجر غير موجود أو غير مرتبط بحسابك",
        },
        404,
      );
    }

    return jsonResponse({
      success: true,
      store,
      settings: buildSettingsPayload(store),
    });
  } catch (error) {
    console.error("GET /api/dashboard/store-settings error:", error);

    return jsonResponse(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل إعدادات المتجر",
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

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (
      !session ||
      (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN)
    ) {
      return jsonResponse(
        {
          success: false,
          message: "يجب تسجيل الدخول كتاجر أولًا",
        },
        401,
      );
    }

    const body = asObject(await request.json().catch(() => null));
    const storeId = getStoreId(request, body);

    if (!storeId) {
      return jsonResponse(
        {
          success: false,
          message: "كود المتجر مطلوب",
        },
        400,
      );
    }

    const existingStore = await getManageableStore(
      storeId,
      session.userId,
      session.role,
    );

    if (!existingStore) {
      return jsonResponse(
        {
          success: false,
          message: "المتجر غير موجود أو غير مرتبط بحسابك",
        },
        404,
      );
    }

    const storeInfo = getBodySection(body, ["storeInfo", "store", "basicInfo"], true);
    const contactInfo = getBodySection(body, [
      "contactInfo",
      "contactSettings",
      "contact",
    ]);
    const addressInfo = getBodySection(body, [
      "address",
      "addressSettings",
      "storeAddress",
    ]);
    const shippingInfo = getBodySection(body, [
      "shipping",
      "shippingSettings",
    ]);
    const taxesInfo = getBodySection(body, ["taxes", "taxSettings"]);
    const seoInfo = getBodySection(body, ["seo", "seoSettings"]);
    const notificationInfo = getBodySection(body, [
      "notifications",
      "notificationSettings",
    ]);
    const productSettingsInfo = getBodySection(body, [
      "productSettings",
      "productsSettings",
    ]);
    const footerInfo = getBodySection(body, ["footer", "footerSettings"]);
    const homepageInfo = getBodySection(body, [
      "homepage",
      "homepageSettings",
      "homeSettings",
    ]);

    const storeData = buildStoreUpdateData(
      body,
      storeInfo,
      contactInfo,
      addressInfo,
      shippingInfo,
    );

    const slugValue = readAny(storeInfo, ["slug"]);
    if (slugValue !== undefined) {
      const nextSlug = normalizeSlug(slugValue);

      if (!nextSlug) {
        return jsonResponse(
          {
            success: false,
            message: "رابط المتجر غير صالح",
          },
          400,
        );
      }

      if (nextSlug !== existingStore.slug) {
        const duplicatedStore = await prisma.store.findUnique({
          where: {
            slug: nextSlug,
          },
          select: {
            id: true,
          },
        });

        if (duplicatedStore && duplicatedStore.id !== existingStore.id) {
          return jsonResponse(
            {
              success: false,
              message: "رابط المتجر مستخدم بالفعل",
            },
            409,
          );
        }
      }

      storeData.slug = nextSlug;
    }

    const contactData = buildContactData(contactInfo);
    const addressData = buildAddressData(addressInfo);
    const shippingData = buildShippingData(shippingInfo);
    const taxData = buildTaxData(taxesInfo);
    const seoData = buildSeoData(seoInfo);
    const notificationData = buildNotificationData(notificationInfo);
    const productSettingsData = buildProductSettingsData(productSettingsInfo);
    const footerData = buildFooterData(footerInfo);
    const homepageData = buildHomepageData(homepageInfo);

    const socialProvided =
      body.socialLinks !== undefined ||
      body.socialMedia !== undefined ||
      body.social !== undefined;

    const paymentProvided =
      body.paymentMethods !== undefined ||
      body.payments !== undefined ||
      body.paymentSettings !== undefined;

    const policiesProvided =
      body.policies !== undefined ||
      body.storePolicies !== undefined ||
      body.policySettings !== undefined;

    const socialLinks = socialProvided
      ? normalizeSocialLinks(body.socialLinks ?? body.socialMedia ?? body.social)
      : [];

    const paymentMethods = paymentProvided
      ? normalizePaymentMethods(
          body.paymentMethods ?? body.payments ?? body.paymentSettings,
        )
      : [];

    const policies = policiesProvided
      ? normalizePolicies(body.policies ?? body.storePolicies ?? body.policySettings)
      : [];

    const brandsProvided = body.brands !== undefined || body.homepageBrands !== undefined;
    const blogPostsProvided = body.blogPosts !== undefined || body.homepageBlogPosts !== undefined;

    const brands = brandsProvided
      ? normalizeBrandsInput(body.brands ?? body.homepageBrands)
      : [];

    const blogPosts = blogPostsProvided
      ? normalizeBlogPostsInput(body.blogPosts ?? body.homepageBlogPosts)
      : [];

    if (socialProvided) {
      const facebook = socialLinks.find((item) => item.platform === "FACEBOOK");
      const instagram = socialLinks.find((item) => item.platform === "INSTAGRAM");
      const tiktok = socialLinks.find((item) => item.platform === "TIKTOK");

      storeData.facebookUrl = facebook?.url || null;
      storeData.instagramUrl = instagram?.url || null;
      storeData.tiktokUrl = tiktok?.url || null;
    }

    await prisma.$transaction(
      async (tx) => {
        if (Object.keys(storeData).length > 0) {
          await tx.store.update({
            where: {
              id: existingStore.id,
            },
            data: storeData,
          });
        }

        await upsertOneToOne(
          tx,
          "storeContactSettings",
          existingStore.id,
          contactData,
        );

        await upsertOneToOne(
          tx,
          "storeAddress",
          existingStore.id,
          addressData,
        );

        await upsertOneToOne(
          tx,
          "storeShippingSettings",
          existingStore.id,
          shippingData,
        );

        await upsertOneToOne(
          tx,
          "storeTaxSettings",
          existingStore.id,
          taxData,
        );

        await upsertOneToOne(
          tx,
          "storeSeoSettings",
          existingStore.id,
          seoData,
        );

        await upsertOneToOne(
          tx,
          "storeNotificationSettings",
          existingStore.id,
          notificationData,
        );

        await upsertOneToOne(
          tx,
          "storeProductSettings",
          existingStore.id,
          productSettingsData,
        );

        await upsertOneToOne(
          tx,
          "storeFooterSettings",
          existingStore.id,
          footerData,
        );

        await upsertOneToOne(
          tx,
          "storeHomepageSettings",
          existingStore.id,
          homepageData,
        );

        if (socialProvided) {
          await tx.storeSocialLink.deleteMany({
            where: {
              storeId: existingStore.id,
            },
          });

          if (socialLinks.length > 0) {
            await tx.storeSocialLink.createMany({
              data: socialLinks.map((item) => ({
                storeId: existingStore.id,
                platform: item.platform,
                url: item.url,
                isActive: item.isActive,
              })),
            });
          }
        }

        if (paymentProvided) {
          await tx.storePaymentMethod.deleteMany({
            where: {
              storeId: existingStore.id,
            },
          });

          if (paymentMethods.length > 0) {
            await tx.storePaymentMethod.createMany({
              data: paymentMethods.map((item) => ({
                storeId: existingStore.id,
                type: item.type,
                isEnabled: item.isEnabled,
                config: item.config ?? null,
              })),
            });
          }
        }

        if (policiesProvided) {
          await tx.storePolicy.deleteMany({
            where: {
              storeId: existingStore.id,
            },
          });

          if (policies.length > 0) {
            await tx.storePolicy.createMany({
              data: policies.map((item) => ({
                storeId: existingStore.id,
                type: item.type,
                titleAr: item.titleAr,
                titleEn: item.titleEn,
                contentAr: item.contentAr,
                contentEn: item.contentEn,
                isActive: item.isActive,
              })),
            });
          }
        }

        if (brandsProvided && tx.brand) {
          await tx.brand.deleteMany({
            where: {
              storeId: existingStore.id,
            },
          });

          if (brands.length > 0) {
            await tx.brand.createMany({
              data: brands.map((item) => ({
                storeId: existingStore.id,
                name: item.name || "Brand",
                logoUrl: item.logoUrl || null,
                website: item.website || null,
                isActive: item.isActive,
              })),
            });
          }
        }

        if (blogPostsProvided && tx.storeBlogPost) {
          await tx.storeBlogPost.deleteMany({
            where: {
              storeId: existingStore.id,
            },
          });

          if (blogPosts.length > 0) {
            await tx.storeBlogPost.createMany({
              data: blogPosts.map((item) => ({
                storeId: existingStore.id,
                titleAr: item.titleAr,
                titleEn: item.titleEn,
                slug: item.slug,
                excerptAr: item.excerptAr,
                excerptEn: item.excerptEn,
                contentAr: item.contentAr,
                contentEn: item.contentEn,
                imageUrl: item.imageUrl,
                isPublished: item.isPublished,
              })),
            });
          }
        }
      },
      {
        maxWait: 10_000,
        timeout: 20_000,
      },
    );

    const dashboardFallbackPayload = {
      storeInfo,
      contactInfo,
      address: addressInfo,
      homepage: homepageInfo,
      socialLinks,
      paymentMethods,
      shipping: shippingInfo,
      taxes: taxesInfo,
      policies,
      seo: seoInfo,
      productSettings: productSettingsInfo,
      footer: footerInfo,
      notifications: notificationInfo,
      brands,
      blogPosts,
      __dashboardSavedAt: new Date().toISOString(),
    };

    await updateTemplateConfigSettingsFallback(existingStore.id, existingStore, dashboardFallbackPayload);

    const updatedStore = await prisma.store.findUnique({
      where: {
        id: existingStore.id,
      },
      include: STORE_SETTINGS_INCLUDE,
    });

    return jsonResponse({
      success: true,
      message: "تم حفظ إعدادات المتجر بنجاح",
      store: updatedStore,
      settings: updatedStore ? buildSettingsPayload(updatedStore) : null,
    });
  } catch (error) {
    console.error("PATCH /api/dashboard/store-settings error:", error);

    return jsonResponse(
      {
        success: false,
        message: "حدث خطأ أثناء حفظ إعدادات المتجر",
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