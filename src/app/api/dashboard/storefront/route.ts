import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StorefrontTemplateKey =
  | "MIZAR_MODERN"
  | "LUXE_NOIR"
  | "SOFT_BOUTIQUE"
  | "BAZAAR_CARDS"
  | "TECH_MINIMAL";

type LegacyStoreTemplate =
  | "GENERAL"
  | "FASHION"
  | "PERFUMES_BEAUTY"
  | "ACCESSORIES"
  | "HANDMADE"
  | "HOME_PRODUCTS"
  | "FOOD_BEVERAGE"
  | "ELECTRONICS";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

function getString(value: unknown) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();

  return text || null;
}

function getBoolean(value: unknown, fallback = true) {
  if (typeof value === "boolean") return value;

  return fallback;
}

function getStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function normalizeTemplateKey(value: unknown): StorefrontTemplateKey {
  const key = String(value || "").trim().toUpperCase();

  if (key === "MIZAR_MODERN") return "MIZAR_MODERN";
  if (key === "LUXE_NOIR") return "LUXE_NOIR";
  if (key === "SOFT_BOUTIQUE") return "SOFT_BOUTIQUE";
  if (key === "BAZAAR_CARDS") return "BAZAAR_CARDS";
  if (key === "TECH_MINIMAL") return "TECH_MINIMAL";

  if (key === "LUXE" || key === "NOIR") return "LUXE_NOIR";

  if (
    key === "SOFT" ||
    key === "BOUTIQUE" ||
    key === "FASHION" ||
    key === "HANDMADE" ||
    key === "ACCESSORIES" ||
    key === "PERFUMES_BEAUTY"
  ) {
    return "SOFT_BOUTIQUE";
  }

  if (
    key === "BAZAAR" ||
    key === "MARKET" ||
    key === "FOOD_BEVERAGE" ||
    key === "HOME_PRODUCTS"
  ) {
    return "BAZAAR_CARDS";
  }

  if (key === "TECH" || key === "ELECTRONICS") return "TECH_MINIMAL";

  return "MIZAR_MODERN";
}

function toLegacyStoreTemplate(value: unknown): LegacyStoreTemplate {
  const key = normalizeTemplateKey(value);

  if (key === "SOFT_BOUTIQUE") return "FASHION";
  if (key === "BAZAAR_CARDS") return "FOOD_BEVERAGE";
  if (key === "TECH_MINIMAL") return "ELECTRONICS";

  return "GENERAL";
}

function sanitizeHeroSlides(value: unknown) {
  if (!Array.isArray(value)) {
    return [
      {
        id: "default-slide-1",
        imageUrl: "",
        title: "اكتشف أحدث منتجاتنا",
        subtitle: "تسوق بسهولة من متجرنا واستمتع بتجربة شراء بسيطة وسريعة.",
        buttonText: "تسوق الآن",
        buttonLink: "#products",
        secondaryButtonText: "من نحن",
        secondaryButtonLink: "#about",
        isActive: true,
      },
    ];
  }

  const slides = value
    .map((slide, index) => {
      const item =
        slide && typeof slide === "object"
          ? (slide as Record<string, unknown>)
          : {};

      return {
        id: getString(item.id) || `slide-${index + 1}`,
        imageUrl: getString(item.imageUrl) || "",
        title: getString(item.title) || `بانر رقم ${index + 1}`,
        subtitle: getString(item.subtitle) || "",
        buttonText: getString(item.buttonText) || "",
        buttonLink: getString(item.buttonLink) || "#products",
        secondaryButtonText: getString(item.secondaryButtonText) || "",
        secondaryButtonLink: getString(item.secondaryButtonLink) || "#about",
        isActive: getBoolean(item.isActive, true),
      };
    })
    .filter((slide) => slide.title);

  if (slides.length === 0) {
    return [
      {
        id: "default-slide-1",
        imageUrl: "",
        title: "اكتشف أحدث منتجاتنا",
        subtitle: "تسوق بسهولة من متجرنا واستمتع بتجربة شراء بسيطة وسريعة.",
        buttonText: "تسوق الآن",
        buttonLink: "#products",
        secondaryButtonText: "من نحن",
        secondaryButtonLink: "#about",
        isActive: true,
      },
    ];
  }

  return slides;
}

function sanitizeStorefrontContent(rawContent: unknown, fallbackTemplate: unknown) {
  const content =
    rawContent && typeof rawContent === "object"
      ? (rawContent as Record<string, any>)
      : {};

  const templateKey = normalizeTemplateKey(content.templateKey || fallbackTemplate);

  const navigation = content.navigation || {};
  const aboutSection = content.aboutSection || {};
  const homeSections = content.homeSections || {};
  const productDisplay = content.productDisplay || {};
  const reviewSettings = content.reviewSettings || {};
  const footerSettings = content.footerSettings || {};
  const seoSettings = content.seoSettings || {};

  return {
    templateKey,

    navigation: {
      showHome: getBoolean(navigation.showHome, true),
      showAbout: getBoolean(navigation.showAbout, true),
      showProducts: getBoolean(navigation.showProducts, true),
      showWishlist: getBoolean(navigation.showWishlist, true),
      showCart: getBoolean(navigation.showCart, true),
      showLogin: getBoolean(navigation.showLogin, true),
      showContact: getBoolean(navigation.showContact, true),
    },

    heroSlides: sanitizeHeroSlides(content.heroSlides),

    aboutSection: {
      enabled: getBoolean(aboutSection.enabled, true),
      title: getString(aboutSection.title) || "من نحن",
      subtitle: getString(aboutSection.subtitle) || "قصة المتجر",
      description:
        getString(aboutSection.description) ||
        "نقدم لعملائنا تجربة تسوق سهلة ومنظمة، مع منتجات مختارة بعناية وخدمة عملاء تهتم بالتفاصيل.",
      imageUrl: getString(aboutSection.imageUrl) || "",
      highlights: getStringArray(aboutSection.highlights, [
        "منتجات مختارة بعناية",
        "تجربة شراء سهلة",
        "دعم عملاء مستمر",
        "شحن وتوصيل منظم",
      ]),
    },

    homeSections: {
      showFeaturedProducts: getBoolean(homeSections.showFeaturedProducts, true),
      showLatestProducts: getBoolean(homeSections.showLatestProducts, true),
      showCategories: getBoolean(homeSections.showCategories, true),
      showOffers: getBoolean(homeSections.showOffers, true),
      showAbout: getBoolean(homeSections.showAbout, true),
      showReviews: getBoolean(homeSections.showReviews, true),
    },

    productDisplay: {
      showWishlist: getBoolean(productDisplay.showWishlist, true),
      showRatings: getBoolean(productDisplay.showRatings, true),
      showReviewCount: getBoolean(productDisplay.showReviewCount, true),
      showDiscountBadge: getBoolean(productDisplay.showDiscountBadge, true),
      showStockStatus: getBoolean(productDisplay.showStockStatus, true),
      showCategory: getBoolean(productDisplay.showCategory, true),
      enableQuickView: getBoolean(productDisplay.enableQuickView, true),
      enableAddToCart: getBoolean(productDisplay.enableAddToCart, true),
    },

    reviewSettings: {
      enabled: getBoolean(reviewSettings.enabled, true),
      requireVerifiedPurchase: getBoolean(reviewSettings.requireVerifiedPurchase, true),
      showMerchantReply: getBoolean(reviewSettings.showMerchantReply, true),
      showRatingSummary: getBoolean(reviewSettings.showRatingSummary, true),
      showProductReviews: getBoolean(reviewSettings.showProductReviews, true),
    },

    footerSettings: {
      text:
        getString(footerSettings.text) ||
        "متجر إلكتروني يعمل بتقنيات ميزار لتجربة شراء سهلة وسريعة.",
      showSocialLinks: getBoolean(footerSettings.showSocialLinks, true),
      showContactInfo: getBoolean(footerSettings.showContactInfo, true),
      showPoweredByMizar: true,
    },

    seoSettings: {
      title: getString(seoSettings.title) || "",
      description: getString(seoSettings.description) || "",
      keywords: getString(seoSettings.keywords) || "",
      ogImage: getString(seoSettings.ogImage) || "",
    },
  };
}

async function getCurrentMerchantStore(request: NextRequest, storeId: string) {
  const session = await getSessionFromRequest(request);

  if (!session?.userId) {
    return {
      ok: false,
      status: 401,
      message: "يجب تسجيل الدخول أولًا",
      store: null,
    };
  }

  if (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN) {
    return {
      ok: false,
      status: 403,
      message: "هذه الصفحة مخصصة للتجار فقط",
      store: null,
    };
  }

  const where =
    session.role === UserRole.SUPER_ADMIN
      ? { id: storeId }
      : { id: storeId, ownerId: session.userId };

  const store = await prisma.store.findFirst({
    where,
  });

  if (!store) {
    return {
      ok: false,
      status: 404,
      message: "المتجر غير موجود أو غير مرتبط بحسابك",
      store: null,
    };
  }

  return {
    ok: true,
    status: 200,
    message: "",
    store,
  };
}

export async function GET(request: NextRequest) {
  try {
    const storeId = getString(request.nextUrl.searchParams.get("storeId"));

    if (!storeId) {
      return jsonResponse(
        {
          success: false,
          message: "كود المتجر مطلوب",
        },
        400
      );
    }

    const result = await getCurrentMerchantStore(request, storeId);

    if (!result.ok || !result.store) {
      return jsonResponse(
        {
          success: false,
          message: result.message,
        },
        result.status
      );
    }

    const store = result.store;

    const content = sanitizeStorefrontContent(
      store.templateConfig,
      store.template
    );

    return jsonResponse({
      success: true,
      store,
      content,
      storefrontContent: content,
    });
  } catch (error) {
    console.error("GET /api/dashboard/storefront error:", error);

    return jsonResponse(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل محتوى واجهة المتجر",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return jsonResponse(
        {
          success: false,
          message: "بيانات غير صالحة",
        },
        400
      );
    }

    const storeId = getString(body.storeId);

    if (!storeId) {
      return jsonResponse(
        {
          success: false,
          message: "كود المتجر مطلوب",
        },
        400
      );
    }

    const result = await getCurrentMerchantStore(request, storeId);

    if (!result.ok || !result.store) {
      return jsonResponse(
        {
          success: false,
          message: result.message,
        },
        result.status
      );
    }

    const templateKey = normalizeTemplateKey(body.template || body.content?.templateKey);
    const legacyTemplate = toLegacyStoreTemplate(templateKey);

    const content = sanitizeStorefrontContent(
      {
        ...(body.content || {}),
        templateKey,
      },
      templateKey
    );

    const updatedStore = await prisma.store.update({
      where: {
        id: result.store.id,
      },
      data: {
        template: legacyTemplate as any,
        templateConfig: content,
        logoUrl: getString(body.logoUrl),
        coverUrl: getString(body.coverUrl),
      },
    });

    return jsonResponse({
      success: true,
      message: "تم حفظ محتوى واجهة المتجر بنجاح",
      store: updatedStore,
      content,
      storefrontContent: content,
    });
  } catch (error) {
    console.error("PATCH /api/dashboard/storefront error:", error);

    return jsonResponse(
      {
        success: false,
        message: "حدث خطأ أثناء حفظ محتوى واجهة المتجر",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}