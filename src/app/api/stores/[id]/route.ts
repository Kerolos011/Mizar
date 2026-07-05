import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function normalizeSlug(value: unknown) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeWhatsapp(value: unknown) {
  return cleanText(value)
    .replace(/\s+/g, "")
    .replace(/\+/g, "")
    .replace(/-/g, "")
    .replace(/[()]/g, "");
}

function normalizeColor(value: unknown, fallback = "#2563EB") {
  const color = cleanText(value);

  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color;

  return fallback;
}

function normalizeNumber(value: unknown, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function normalizeNullableInt(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const number = Number(value);

  if (!Number.isFinite(number)) return null;

  return Math.trunc(number);
}

function normalizeNullableText(value: unknown) {
  if (value === undefined) return undefined;

  const text = cleanText(value);

  return text || null;
}

function normalizeStoreStatus(value: unknown, fallback = "OPEN") {
  const status = cleanText(value).toUpperCase();

  if (["OPEN", "ACTIVE", "PUBLISHED"].includes(status)) return "OPEN";
  if (["CLOSED", "INACTIVE", "DISABLED", "DRAFT"].includes(status)) return "CLOSED";

  return fallback;
}

function normalizeTemplateKey(value: unknown) {
  const key = cleanText(value).toUpperCase().replace(/[\s-]+/g, "_");

  const supported = [
    "MIZAR_PREMIUM",
    "MIZAR_MODERN",
    "LUXE_NOIR",
    "SOFT_BOUTIQUE",
    "BAZAAR_CARDS",
    "TECH_MINIMAL",
  ];

  if (supported.includes(key)) return key;

  if (["PREMIUM", "MIZAR_PREMIUM_V1", "MIZAR_PREMIUM_V2", "MIZAR_PREMIUM_V3"].includes(key)) {
    return "MIZAR_PREMIUM";
  }

  if (["GENERAL", "MODERN"].includes(key)) return "MIZAR_MODERN";
  if (["LUXE", "NOIR", "IVORY", "IVORY_ATELIER", "ATELIER", "ATELIER_LUXE", "PERFUMES_BEAUTY", "ACCESSORIES"].includes(key)) return "LUXE_NOIR";
  if (["SOFT", "BOUTIQUE", "FASHION", "BEAUTY", "HANDMADE"].includes(key)) return "SOFT_BOUTIQUE";
  if (["BAZAAR", "MARKET", "FOOD_BEVERAGE", "FOOD", "HOME", "HOME_PRODUCTS"].includes(key)) return "BAZAAR_CARDS";
  if (["TECH", "ELECTRONICS"].includes(key)) return "TECH_MINIMAL";

  return "MIZAR_MODERN";
}

function objectOrEmpty(value: unknown) {
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

  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function getStoreFieldNames() {
  try {
    const model = (prisma as any)?._runtimeDataModel?.models?.Store;
    const fields = Array.isArray(model?.fields) ? model.fields : [];

    return new Set(fields.map((field: any) => field?.name).filter(Boolean));
  } catch {
    return new Set<string>();
  }
}

function filterStoreUpdateData(data: Record<string, any>) {
  const fields = getStoreFieldNames();
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);

  if (!fields.size) return Object.fromEntries(entries);

  return Object.fromEntries(entries.filter(([key]) => fields.has(key)));
}

function buildStoreInclude() {
  return {
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
}

function getErrorMessage(error: unknown, fallback = "Failed to update store") {
  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

function hasOnlyTemplateFields(body: Record<string, any>) {
  const keys = Object.keys(body || {});

  return (
    keys.length > 0 &&
    keys.every((key) =>
      ["template", "templateKey", "selectedTemplate", "storefrontTemplate", "templateConfig", "content"].includes(key),
    )
  );
}

function buildNextTemplateConfig(
  existingStore: any,
  body: Record<string, any>,
  nextTemplateKey: string | null,
) {
  const existingTemplateConfig = objectOrEmpty(existingStore?.templateConfig);
  const requestTemplateConfig = objectOrEmpty(body.templateConfig);
  const contentConfig = objectOrEmpty(body.content);

  const settingsFallback =
    objectOrEmpty(requestTemplateConfig.settingsFallback).settingsFallback ||
    requestTemplateConfig.settingsFallback ||
    body.settingsFallback ||
    body.dashboardSettings ||
    null;

  const templateKey = normalizeTemplateKey(
    nextTemplateKey ||
      body.template ||
      body.templateKey ||
      body.selectedTemplate ||
      body.storefrontTemplate ||
      requestTemplateConfig.templateKey ||
      requestTemplateConfig.selectedTemplate ||
      contentConfig.templateKey ||
      existingTemplateConfig.templateKey ||
      existingStore?.template ||
      "MIZAR_PREMIUM",
  );

  const mergedContent: Record<string, any> = {
    ...objectOrEmpty(existingTemplateConfig.content),
    ...objectOrEmpty(requestTemplateConfig.content),
    ...contentConfig,
    templateKey,
    selectedTemplate: templateKey,
    storefrontTemplate: templateKey,
    activeTemplate: templateKey,
  };

  const merged: Record<string, any> = {
    ...existingTemplateConfig,
    ...requestTemplateConfig,
    ...contentConfig,
    content: mergedContent,
    templateKey,
    selectedTemplate: templateKey,
    storefrontTemplate: templateKey,
    activeTemplate: templateKey,
    updatedAt: new Date().toISOString(),
  };

  if (settingsFallback && typeof settingsFallback === "object") {
    merged.settingsFallback = settingsFallback;
    merged.dashboardSettings = settingsFallback;

    const fallback = settingsFallback as Record<string, any>;

    if (fallback.homepage) merged.homepageSettings = fallback.homepage;
    if (fallback.storeInfo) merged.storeInfo = fallback.storeInfo;
    if (fallback.contactInfo) merged.contactInfo = fallback.contactInfo;
    if (fallback.address) merged.address = fallback.address;
    if (fallback.shipping) merged.shipping = fallback.shipping;
    if (fallback.taxes) merged.taxes = fallback.taxes;
    if (fallback.seo) merged.seo = fallback.seo;
    if (fallback.productSettings) merged.productSettings = fallback.productSettings;
    if (fallback.footer) merged.footer = fallback.footer;
    if (fallback.notifications) merged.notifications = fallback.notifications;
    if (fallback.socialLinks) merged.socialLinks = fallback.socialLinks;
    if (fallback.paymentMethods) merged.paymentMethods = fallback.paymentMethods;
    if (fallback.policies) merged.policies = fallback.policies;
    if (fallback.brands) merged.brands = fallback.brands;
    if (fallback.blogPosts) merged.blogPosts = fallback.blogPosts;
  }

  return merged;
}

async function getManageableStore(storeId: string, userId: string, role: string) {
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
    include: buildStoreInclude(),
  });

  if (!store) return null;
  if (role === "SUPER_ADMIN") return store;

  if ((store as any).ownerId !== userId) return null;

  return store;
}

async function requireMerchant(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session || (session.role !== "MERCHANT" && session.role !== "SUPER_ADMIN")) {
    return null;
  }

  return session;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireMerchant(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Merchant login is required",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const storeId = cleanText(id);

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Store ID is required",
        },
        { status: 400 },
      );
    }

    const store = await getManageableStore(storeId, session.userId, session.role);

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found or you are not allowed to access it",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      store,
    });
  } catch (error) {
    console.error("Get store error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Failed to load store"),
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireMerchant(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Merchant login is required",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const storeId = cleanText(id);

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Store ID is required",
        },
        { status: 400 },
      );
    }

    const existingStore = await getManageableStore(storeId, session.userId, session.role);

    if (!existingStore) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found or you are not allowed to update it",
        },
        { status: 403 },
      );
    }

    const body = objectOrEmpty(await request.json().catch(() => ({})));

    const hasTemplateUpdate =
      body.template !== undefined ||
      body.templateKey !== undefined ||
      body.selectedTemplate !== undefined ||
      body.storefrontTemplate !== undefined ||
      body.templateConfig !== undefined ||
      body.content?.templateKey !== undefined;

    if (hasTemplateUpdate && hasOnlyTemplateFields(body)) {
      const nextTemplateKey = normalizeTemplateKey(
        body.template ||
          body.templateKey ||
          body.selectedTemplate ||
          body.storefrontTemplate ||
          body.templateConfig?.templateKey ||
          body.templateConfig?.selectedTemplate ||
          body.content?.templateKey,
      );

      const nextTemplateConfig = buildNextTemplateConfig(existingStore, body, nextTemplateKey);

      const templateUpdateData = filterStoreUpdateData({
        templateConfig: nextTemplateConfig,
      });

      if (!Object.keys(templateUpdateData).length) {
        return NextResponse.json(
          {
            success: false,
            message: "Store templateConfig field is not available in Prisma schema",
          },
          { status: 500 },
        );
      }

      const updatedStore = await prisma.store.update({
        where: {
          id: (existingStore as any).id,
        },
        data: templateUpdateData,
        include: buildStoreInclude(),
      });

      return NextResponse.json({
        success: true,
        message: "Store template updated successfully",
        store: updatedStore,
      });
    }

    const nextSlug = body.slug !== undefined ? normalizeSlug(body.slug) : undefined;
    const nextName = body.name !== undefined ? cleanText(body.name) : undefined;

    if (body.name !== undefined && !nextName) {
      return NextResponse.json(
        {
          success: false,
          message: "Store name is required",
        },
        { status: 400 },
      );
    }

    if (body.slug !== undefined && !nextSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid store slug is required",
        },
        { status: 400 },
      );
    }

    if (nextSlug && nextSlug !== (existingStore as any).slug) {
      const duplicatedStore = await prisma.store.findUnique({
        where: {
          slug: nextSlug,
        },
        select: {
          id: true,
        },
      });

      if (duplicatedStore && duplicatedStore.id !== (existingStore as any).id) {
        return NextResponse.json(
          {
            success: false,
            message: "Store slug already exists",
          },
          { status: 409 },
        );
      }
    }

    const nextTemplateKey = hasTemplateUpdate
      ? normalizeTemplateKey(
          body.template ||
            body.templateKey ||
            body.selectedTemplate ||
            body.storefrontTemplate ||
            body.templateConfig?.templateKey ||
            body.content?.templateKey,
        )
      : null;

    const nextTemplateConfig = hasTemplateUpdate
      ? buildNextTemplateConfig(existingStore, body, nextTemplateKey)
      : undefined;

    const nextStatus =
      body.status !== undefined
        ? normalizeStoreStatus(body.status, (existingStore as any).status || "OPEN")
        : body.isActive !== undefined
          ? Boolean(body.isActive)
            ? "OPEN"
            : "CLOSED"
          : undefined;

    const updateData = filterStoreUpdateData({
      name: nextName,
      slug: nextSlug,
      category: body.category !== undefined ? cleanText(body.category) || "General" : undefined,
      theme: body.theme !== undefined ? cleanText(body.theme) || "modern" : undefined,
      description: body.description !== undefined ? normalizeNullableText(body.description) : undefined,
      nameAr: normalizeNullableText(body.nameAr),
      nameEn: normalizeNullableText(body.nameEn),
      subCategory: normalizeNullableText(body.subCategory),
      shortDescription: normalizeNullableText(body.shortDescription),
      descriptionAr: normalizeNullableText(body.descriptionAr),
      descriptionEn: normalizeNullableText(body.descriptionEn),
      fullDescription: normalizeNullableText(body.fullDescription),
      tagline: normalizeNullableText(body.tagline),
      ownerName: normalizeNullableText(body.ownerName),
      establishedYear: normalizeNullableInt(body.establishedYear),
      currency: normalizeNullableText(body.currency),
      email: normalizeNullableText(body.email),
      contactEmail: normalizeNullableText(body.contactEmail),
      phone: normalizeNullableText(body.phone),
      contactPhone: normalizeNullableText(body.contactPhone || body.phone),
      facebook: normalizeNullableText(body.facebook),
      facebookUrl: normalizeNullableText(body.facebookUrl || body.facebook),
      instagram: normalizeNullableText(body.instagram),
      instagramUrl: normalizeNullableText(body.instagramUrl || body.instagram),
      tiktok: normalizeNullableText(body.tiktok),
      tiktokUrl: normalizeNullableText(body.tiktokUrl || body.tiktok),
      snapchat: normalizeNullableText(body.snapchat),
      x: normalizeNullableText(body.x || body.twitter),
      website: normalizeNullableText(body.website),
      websiteUrl: normalizeNullableText(body.websiteUrl || body.website),
      status: nextStatus,
      defaultLanguage: body.defaultLanguage !== undefined ? cleanText(body.defaultLanguage) || "ar" : undefined,
      logoUrl: normalizeNullableText(body.logoUrl),
      coverUrl: normalizeNullableText(body.coverUrl),
      faviconUrl: normalizeNullableText(body.faviconUrl),
      bannerUrl: normalizeNullableText(body.bannerUrl),
      whatsapp: body.whatsapp !== undefined ? normalizeWhatsapp(body.whatsapp) || null : undefined,
      shippingFee:
        body.shippingFee !== undefined
          ? normalizeNumber(body.shippingFee, Number((existingStore as any).shippingFee || 0))
          : undefined,
      shippingPolicy: body.shippingPolicy !== undefined ? normalizeNullableText(body.shippingPolicy) : undefined,
      primaryColor:
        body.primaryColor !== undefined
          ? normalizeColor(body.primaryColor, (existingStore as any).primaryColor || "#2563EB")
          : undefined,
      isActive:
        body.isActive !== undefined
          ? Boolean(body.isActive)
          : body.status !== undefined
            ? nextStatus !== "CLOSED"
            : undefined,
      ...(hasTemplateUpdate && nextTemplateConfig
        ? {
            templateConfig: nextTemplateConfig,
          }
        : {}),
    });

    if (!Object.keys(updateData).length) {
      return NextResponse.json({
        success: true,
        message: "No store fields were changed",
        store: existingStore,
      });
    }

    const updatedStore = await prisma.store.update({
      where: {
        id: (existingStore as any).id,
      },
      data: updateData,
      include: buildStoreInclude(),
    });

    return NextResponse.json({
      success: true,
      message: "Store updated successfully",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Update store error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Failed to update store"),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireMerchant(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Merchant login is required",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const storeId = cleanText(id);

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Store ID is required",
        },
        { status: 400 },
      );
    }

    const existingStore = await getManageableStore(storeId, session.userId, session.role);

    if (!existingStore) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found or you are not allowed to delete it",
        },
        { status: 403 },
      );
    }

    await prisma.store.delete({
      where: {
        id: (existingStore as any).id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (error) {
    console.error("Delete store error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Failed to delete store"),
      },
      { status: 500 },
    );
  }
}
