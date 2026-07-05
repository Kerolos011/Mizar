import { NextRequest, NextResponse } from "next/server";
import { StoreTemplate, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

type StoreTemplateSetup = {
  template: StoreTemplate;
  theme: string;
  primaryColor: string;
  accentColor: string;
  layoutPreset: string;
  productSchema: Record<string, unknown>;
  templateConfig: Record<string, unknown>;
};

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function normalizeOptionalUrl(value: unknown) {
  const url = normalizeText(value);

  if (!url) return null;

  if (!/^https?:\/\//i.test(url)) {
    return url;
  }

  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
}

function normalizePhone(phone: string) {
  const clean = phone.replace(/\s+/g, "").replace(/-/g, "");

  if (clean.startsWith("+20")) {
    return `0${clean.slice(3)}`;
  }

  if (clean.startsWith("20")) {
    return `0${clean.slice(2)}`;
  }

  return clean;
}

function normalizeSlug(value: string) {
  const basicSlug = value
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return basicSlug || "store";
}

async function createUniqueStoreSlug(storeName: string, existingStoreId?: string) {
  const baseSlug = normalizeSlug(storeName);

  for (let index = 0; index < 10; index += 1) {
    const suffix =
      index === 0
        ? Math.random().toString(36).slice(2, 7)
        : `${Math.random().toString(36).slice(2, 7)}-${index}`;

    const slug = `${baseSlug}-${suffix}`;

    const existingStore = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingStore || existingStore.id === existingStoreId) {
      return slug;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

function getTemplateSetup(businessType: string): StoreTemplateSetup {
  const normalized = businessType.trim();

  if (normalized === "ملابس وأزياء") {
    return {
      template: StoreTemplate.FASHION,
      theme: "fashion",
      primaryColor: "#18213F",
      accentColor: "#2ED9B3",
      layoutPreset: "fashion-modern",
      productSchema: {
        productType: "fashion",
        fields: [
          { key: "sizes", label: "المقاسات", type: "multi-select" },
          { key: "colors", label: "الألوان", type: "color-list" },
          { key: "material", label: "الخامة", type: "text" },
          { key: "fit", label: "القَصّة / الستايل", type: "text" },
          { key: "sizeChart", label: "جدول المقاسات", type: "text" },
        ],
        defaultOptions: {
          sizes: ["S", "M", "L", "XL", "XXL"],
          colors: [],
        },
      },
      templateConfig: {
        heroStyle: "editorial",
        cardStyle: "large-image",
        showSizes: true,
        showColors: true,
      },
    };
  }

  if (normalized === "عطور وتجميل") {
    return {
      template: StoreTemplate.PERFUMES_BEAUTY,
      theme: "beauty",
      primaryColor: "#18213F",
      accentColor: "#F59E0B",
      layoutPreset: "luxury-beauty",
      productSchema: {
        productType: "perfumes_beauty",
        fields: [
          { key: "volume", label: "حجم العبوة", type: "text" },
          { key: "concentration", label: "التركيز", type: "text" },
          { key: "gender", label: "مناسب لـ", type: "select" },
          { key: "scentFamily", label: "عائلة الرائحة", type: "text" },
          { key: "longevity", label: "مدة الثبات", type: "text" },
        ],
        defaultOptions: {
          gender: ["رجالي", "حريمي", "يونيسكس"],
        },
      },
      templateConfig: {
        heroStyle: "luxury",
        cardStyle: "premium",
        showVolume: true,
        showScentFamily: true,
      },
    };
  }

  if (normalized === "إكسسوارات") {
    return {
      template: StoreTemplate.ACCESSORIES,
      theme: "accessories",
      primaryColor: "#18213F",
      accentColor: "#2ED9B3",
      layoutPreset: "accessories-clean",
      productSchema: {
        productType: "accessories",
        fields: [
          { key: "material", label: "الخامة", type: "text" },
          { key: "color", label: "اللون", type: "text" },
          { key: "size", label: "المقاس", type: "text" },
          { key: "style", label: "الستايل", type: "text" },
        ],
      },
      templateConfig: {
        heroStyle: "clean",
        cardStyle: "minimal",
        showMaterial: true,
      },
    };
  }

  if (normalized === "منتجات هاند ميد") {
    return {
      template: StoreTemplate.HANDMADE,
      theme: "handmade",
      primaryColor: "#18213F",
      accentColor: "#F59E0B",
      layoutPreset: "warm-handmade",
      productSchema: {
        productType: "handmade",
        fields: [
          { key: "material", label: "الخامة", type: "text" },
          { key: "customizable", label: "قابل للتخصيص", type: "boolean" },
          { key: "productionTime", label: "مدة التنفيذ", type: "text" },
        ],
      },
      templateConfig: {
        heroStyle: "warm",
        cardStyle: "story",
        showHandmadeBadge: true,
      },
    };
  }

  if (normalized === "مطعم أو كافيه") {
    return {
      template: StoreTemplate.FOOD_BEVERAGE,
      theme: "food",
      primaryColor: "#18213F",
      accentColor: "#F59E0B",
      layoutPreset: "food-menu",
      productSchema: {
        productType: "food_beverage",
        fields: [
          { key: "portion", label: "الحجم / الكمية", type: "text" },
          { key: "ingredients", label: "المكونات", type: "text" },
          { key: "calories", label: "السعرات", type: "text" },
          { key: "spicyLevel", label: "درجة الحِدة", type: "select" },
        ],
        defaultOptions: {
          spicyLevel: ["بدون", "خفيف", "متوسط", "حار"],
        },
      },
      templateConfig: {
        heroStyle: "menu",
        cardStyle: "food",
        showIngredients: true,
      },
    };
  }

  if (normalized === "إلكترونيات") {
    return {
      template: StoreTemplate.ELECTRONICS,
      theme: "electronics",
      primaryColor: "#18213F",
      accentColor: "#2ED9B3",
      layoutPreset: "tech-clean",
      productSchema: {
        productType: "electronics",
        fields: [
          { key: "brand", label: "الماركة", type: "text" },
          { key: "model", label: "الموديل", type: "text" },
          { key: "warranty", label: "الضمان", type: "text" },
          { key: "specifications", label: "المواصفات", type: "list" },
        ],
      },
      templateConfig: {
        heroStyle: "tech",
        cardStyle: "specs",
        showSpecs: true,
      },
    };
  }

  if (normalized === "منتجات منزلية") {
    return {
      template: StoreTemplate.HOME_PRODUCTS,
      theme: "home",
      primaryColor: "#18213F",
      accentColor: "#2ED9B3",
      layoutPreset: "home-modern",
      productSchema: {
        productType: "home_products",
        fields: [
          { key: "dimensions", label: "الأبعاد", type: "text" },
          { key: "material", label: "الخامة", type: "text" },
          { key: "color", label: "اللون", type: "text" },
          { key: "usage", label: "الاستخدام", type: "text" },
        ],
      },
      templateConfig: {
        heroStyle: "home",
        cardStyle: "clean",
        showDimensions: true,
      },
    };
  }

  return {
    template: StoreTemplate.GENERAL,
    theme: "general",
    primaryColor: "#18213F",
    accentColor: "#2ED9B3",
    layoutPreset: "modern",
    productSchema: {
      productType: "general",
      fields: [
        { key: "details", label: "تفاصيل المنتج", type: "text" },
        { key: "options", label: "اختيارات المنتج", type: "list" },
      ],
    },
    templateConfig: {
      heroStyle: "modern",
      cardStyle: "standard",
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولًا",
        },
        { status: 401 }
      );
    }

    if (session.role !== UserRole.MERCHANT) {
      return NextResponse.json(
        {
          success: false,
          message: "هذه الصفحة مخصصة للتجار فقط",
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    const storeName = normalizeText(body?.storeName);
    const businessType = normalizeText(body?.businessType);
    const description = normalizeText(body?.description);
    const tagline = normalizeText(body?.tagline);

    const contactPhone = normalizePhone(normalizeText(body?.contactPhone));
    const whatsapp = normalizePhone(normalizeText(body?.whatsapp));
    const contactEmail = normalizeText(body?.contactEmail).toLowerCase();

    const city = normalizeText(body?.city);
    const area = normalizeText(body?.area);
    const address = normalizeText(body?.address);

    const logoUrl = normalizeOptionalUrl(body?.logoUrl);
    const coverUrl = normalizeOptionalUrl(body?.coverUrl);

    const facebookUrl = normalizeOptionalUrl(body?.facebookUrl);
    const instagramUrl = normalizeOptionalUrl(body?.instagramUrl);
    const tiktokUrl = normalizeOptionalUrl(body?.tiktokUrl);
    const websiteUrl = normalizeOptionalUrl(body?.websiteUrl);

    if (!storeName) {
      return NextResponse.json(
        { success: false, message: "من فضلك أدخل اسم المتجر" },
        { status: 400 }
      );
    }

    if (!businessType) {
      return NextResponse.json(
        { success: false, message: "من فضلك اختر نوع النشاط" },
        { status: 400 }
      );
    }

    if (!description || description.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "من فضلك اكتب وصفًا واضحًا للمتجر لا يقل عن 10 أحرف",
        },
        { status: 400 }
      );
    }

    if (!contactPhone) {
      return NextResponse.json(
        { success: false, message: "من فضلك أدخل رقم التواصل" },
        { status: 400 }
      );
    }

    if (!whatsapp) {
      return NextResponse.json(
        { success: false, message: "من فضلك أدخل رقم واتساب" },
        { status: 400 }
      );
    }

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { success: false, message: "البريد التجاري غير صحيح" },
        { status: 400 }
      );
    }

    const setup = getTemplateSetup(businessType);
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          role: true,
          email: true,
          name: true,
          ownedStores: {
            select: {
              id: true,
              slug: true,
            },
            take: 1,
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!user || user.role !== UserRole.MERCHANT) {
        throw new Error("حساب التاجر غير موجود");
      }

      const existingStore = user.ownedStores[0] || null;
      const slug = existingStore?.slug || (await createUniqueStoreSlug(storeName));

      const storeData = {
        name: storeName,
        displayName: storeName,
        slug,
        category: businessType,
        description,
        tagline: tagline || null,

        contactPhone,
        whatsapp,
        contactEmail: contactEmail || null,

        city: city || null,
        area: area || null,
        address: address || null,

        logoUrl,
        coverUrl,

        facebookUrl,
        instagramUrl,
        tiktokUrl,
        websiteUrl,

        theme: setup.theme,
        template: setup.template,
        templateConfig: setup.templateConfig,
        productSchema: setup.productSchema,

        primaryColor: setup.primaryColor,
        accentColor: setup.accentColor,
        layoutPreset: setup.layoutPreset,

        isActive: true,
        onboardingCompleted: true,
        onboardingCompletedAt: now,
      };

      const store = existingStore
        ? await tx.store.update({
            where: { id: existingStore.id },
            data: storeData,
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              template: true,
              ownerId: true,
            },
          })
        : await tx.store.create({
            data: {
              ...storeData,
              ownerId: user.id,
            },
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              template: true,
              ownerId: true,
            },
          });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          businessType,
          merchantOnboardingCompleted: true,
          merchantOnboardingCompletedAt: now,
          welcomeSeenAt: now,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          businessType: true,
          merchantOnboardingCompleted: true,
        },
      });

      return { store, user: updatedUser };
    });

    return NextResponse.json({
      success: true,
      message: "تم إعداد المتجر بنجاح",
      store: result.store,
      user: result.user,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("Store onboarding error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إعداد المتجر",
      },
      { status: 500 }
    );
  }
}