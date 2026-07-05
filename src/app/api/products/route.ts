import { NextRequest, NextResponse } from "next/server";
import {
  InventoryPolicy,
  MediaSource,
  ProductMediaType,
  ProductStatus,
  ProductType,
  ProductVariantStatus,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

const productInclude = {
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  media: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  productOptions: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  productVariants: {
    orderBy: {
      sortOrder: "asc" as const,
    },
    include: {
      media: {
        orderBy: {
          sortOrder: "asc" as const,
        },
      },
    },
  },
  attachments: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
};

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function toOptionalText(value: unknown) {
  const text = normalizeText(value);
  return text || null;
}

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildPriceFields(body: any) {
  const price = toNumber(body?.price, 0);
  const compareAtPrice = toOptionalNumber(body?.compareAtPrice);
  const costPrice = toOptionalNumber(body?.costPrice);
  const minSellingPrice = toOptionalNumber(body?.minSellingPrice);
  const maxDiscountPercent = toOptionalNumber(body?.maxDiscountPercent);

  return {
    price,
    compareAtPrice,
    discountPrice: compareAtPrice !== null && compareAtPrice > price ? price : null,
    costPrice,
    minSellingPrice,
    maxDiscountPercent,
  };
}

function toInt(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.floor(number) : fallback;
}

function toOptionalInt(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? Math.floor(number) : null;
}

function normalizeSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return slug || "product";
}

async function createUniqueProductSlug(
  storeId: string,
  name: string,
  preferredSlug?: string
) {
  const baseSlug = normalizeSlug(preferredSlug || name);

  for (let index = 0; index < 20; index += 1) {
    const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;

    const existingProduct = await prisma.product.findFirst({
      where: {
        storeId,
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingProduct) {
      return slug;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

function getProductStatus(value: unknown): ProductStatus {
  if (value === ProductStatus.DRAFT || value === "DRAFT") return ProductStatus.DRAFT;
  if (value === ProductStatus.ACTIVE || value === "ACTIVE") return ProductStatus.ACTIVE;
  if (value === ProductStatus.HIDDEN || value === "HIDDEN") return ProductStatus.HIDDEN;
  if (value === ProductStatus.ARCHIVED || value === "ARCHIVED") {
    return ProductStatus.ARCHIVED;
  }

  return ProductStatus.ACTIVE;
}

function getProductType(value: unknown): ProductType {
  if (value === ProductType.SIMPLE || value === "SIMPLE") return ProductType.SIMPLE;
  if (value === ProductType.VARIABLE || value === "VARIABLE") {
    return ProductType.VARIABLE;
  }
  if (value === ProductType.DIGITAL || value === "DIGITAL") return ProductType.DIGITAL;
  if (value === ProductType.SERVICE || value === "SERVICE") return ProductType.SERVICE;
  if (value === ProductType.BUNDLE || value === "BUNDLE") return ProductType.BUNDLE;
  if (value === ProductType.SUBSCRIPTION || value === "SUBSCRIPTION") {
    return ProductType.SUBSCRIPTION;
  }

  return ProductType.SIMPLE;
}

function getInventoryPolicy(value: unknown): InventoryPolicy {
  if (
    value === InventoryPolicy.CONTINUE_SELLING ||
    value === "CONTINUE_SELLING"
  ) {
    return InventoryPolicy.CONTINUE_SELLING;
  }

  return InventoryPolicy.STOP_WHEN_OUT;
}

function getMediaType(value: unknown): ProductMediaType {
  if (value === ProductMediaType.VIDEO || value === "VIDEO") {
    return ProductMediaType.VIDEO;
  }

  return ProductMediaType.IMAGE;
}

function getMediaSource(value: unknown): MediaSource {
  if (value === MediaSource.YOUTUBE || value === "YOUTUBE") return MediaSource.YOUTUBE;
  if (value === MediaSource.VIMEO || value === "VIMEO") return MediaSource.VIMEO;
  if (value === MediaSource.URL || value === "URL") return MediaSource.URL;

  return MediaSource.UPLOAD;
}

function getVariantStatus(value: unknown): ProductVariantStatus {
  if (value === ProductVariantStatus.HIDDEN || value === "HIDDEN") {
    return ProductVariantStatus.HIDDEN;
  }

  if (value === ProductVariantStatus.OUT_OF_STOCK || value === "OUT_OF_STOCK") {
    return ProductVariantStatus.OUT_OF_STOCK;
  }

  if (value === ProductVariantStatus.DISABLED || value === "DISABLED") {
    return ProductVariantStatus.DISABLED;
  }

  return ProductVariantStatus.ACTIVE;
}

function normalizeMediaItems(media: unknown, fallbackImageUrl?: string | null) {
  const items = Array.isArray(media) ? media : [];

  const normalized = items
    .map((item: any, index) => {
      const url = normalizeText(item?.url);

      if (!url) return null;

      return {
        type: getMediaType(item?.type),
        source: getMediaSource(item?.source),
        url,
        thumbnailUrl: toOptionalText(item?.thumbnailUrl),
        webpUrl: toOptionalText(item?.webpUrl),
        sortOrder: toInt(item?.sortOrder, index),
        isCover: Boolean(item?.isCover || index === 0),
        altText: toOptionalText(item?.altText),
        title: toOptionalText(item?.title),
        description: toOptionalText(item?.description),
        width: toOptionalInt(item?.width),
        height: toOptionalInt(item?.height),
        sizeBytes: toOptionalInt(item?.sizeBytes),
        mimeType: toOptionalText(item?.mimeType),
        durationSeconds: toOptionalInt(item?.durationSeconds),
        displayMode: toOptionalText(item?.displayMode),
      };
    })
    .filter(Boolean);

  if (normalized.length === 0 && fallbackImageUrl) {
    return [
      {
        type: ProductMediaType.IMAGE,
        source: MediaSource.URL,
        url: fallbackImageUrl,
        thumbnailUrl: null,
        webpUrl: null,
        sortOrder: 0,
        isCover: true,
        altText: null,
        title: null,
        description: null,
        width: null,
        height: null,
        sizeBytes: null,
        mimeType: null,
        durationSeconds: null,
        displayMode: null,
      },
    ];
  }

  return normalized as any[];
}

function normalizeProductOptions(options: unknown) {
  const items = Array.isArray(options) ? options : [];

  return items
    .map((item: any, index) => {
      const name = normalizeText(item?.name);

      if (!name) return null;

      return {
        name,
        values: Array.isArray(item?.values) ? item.values : [],
        sortOrder: toInt(item?.sortOrder, index),
      };
    })
    .filter(Boolean) as any[];
}

function normalizeProductVariants(
  variants: unknown,
  storeId: string,
  basePrice: number,
  baseCostPrice: number | null,
  baseCompareAtPrice: number | null
) {
  const items = Array.isArray(variants) ? variants : [];

  return items
    .map((item: any, index) => {
      const options =
        item?.options && typeof item.options === "object" && !Array.isArray(item.options)
          ? item.options
          : {};

      const title =
        normalizeText(item?.title) ||
        Object.values(options)
          .filter(Boolean)
          .join(" / ") ||
        `Variant ${index + 1}`;

      const quantity = toInt(item?.quantity, 0);
      const reservedQuantity = toInt(item?.reservedQuantity, 0);
      const availableQuantity = Math.max(0, quantity - reservedQuantity);

      const variantPrice = toNumber(item?.price, basePrice);
      const variantCompareAtPrice =
        toOptionalNumber(item?.compareAtPrice) ?? baseCompareAtPrice;

      return {
        storeId,
        title,
        sku: toOptionalText(item?.sku),
        barcode: toOptionalText(item?.barcode),
        options,
        imageUrl: toOptionalText(item?.imageUrl),

        price: variantPrice,
        compareAtPrice: variantCompareAtPrice,
        costPrice: toOptionalNumber(item?.costPrice) ?? baseCostPrice,

        weight: toOptionalNumber(item?.weight),
        length: toOptionalNumber(item?.length),
        width: toOptionalNumber(item?.width),
        height: toOptionalNumber(item?.height),

        quantity,
        reservedQuantity,
        availableQuantity,
        lowStockAlert: toInt(item?.lowStockAlert, 5),

        location: toOptionalText(item?.location),
        supplierSku: toOptionalText(item?.supplierSku),
        serialNumber: toOptionalText(item?.serialNumber),
        batchNumber: toOptionalText(item?.batchNumber),
        expirationDate: item?.expirationDate ? new Date(item.expirationDate) : null,

        inventoryPolicy: getInventoryPolicy(item?.inventoryPolicy),
        status: getVariantStatus(item?.status),
        sortOrder: toInt(item?.sortOrder, index),
      };
    })
    .filter((item) => item.title) as any[];
}

function getImageUrlFromMedia(mediaItems: any[], fallbackImageUrl?: string | null) {
  const coverImage =
    mediaItems.find((item) => item.type === ProductMediaType.IMAGE && item.isCover) ||
    mediaItems.find((item) => item.type === ProductMediaType.IMAGE);

  return coverImage?.url || fallbackImageUrl || null;
}

async function ensureMerchantOwnsStore(request: NextRequest, storeId: string) {
  const session = await getSessionFromRequest(request);

  if (!session?.userId) {
    return {
      ok: false,
      status: 401,
      message: "يجب تسجيل الدخول أولًا",
      session: null,
      store: null,
    };
  }

  if (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN) {
    return {
      ok: false,
      status: 403,
      message: "هذه العملية مخصصة للتجار فقط",
      session,
      store: null,
    };
  }

  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      id: true,
      ownerId: true,
      name: true,
      slug: true,
    },
  });

  if (!store) {
    return {
      ok: false,
      status: 404,
      message: "المتجر غير موجود",
      session,
      store: null,
    };
  }

  if (session.role !== UserRole.SUPER_ADMIN && store.ownerId !== session.userId) {
    return {
      ok: false,
      status: 403,
      message: "لا تملك صلاحية إدارة هذا المتجر",
      session,
      store,
    };
  }

  return {
    ok: true,
    status: 200,
    message: "",
    session,
    store,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const storeId = searchParams.get("storeId") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const query = searchParams.get("q") || "";

    if (!storeId) {
      return NextResponse.json({
        success: true,
        products: [],
        message: "لم يتم تحديد المتجر",
      });
    }

    const where: any = {
      storeId,
    };

    if (status) {
      where.status = getProductStatus(status);
    } else {
      where.status = {
        not: ProductStatus.ARCHIVED,
      };
    }

    if (category) {
      where.category = category;
    }

    if (query) {
      where.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل المنتجات",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const storeId = normalizeText(body?.storeId);
    const name = normalizeText(body?.name);

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "معرّف المتجر مطلوب",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم المنتج مطلوب",
        },
        { status: 400 }
      );
    }

    const ownership = await ensureMerchantOwnsStore(request, storeId);

    if (!ownership.ok) {
      return NextResponse.json(
        {
          success: false,
          message: ownership.message,
        },
        { status: ownership.status }
      );
    }

    const priceFields = buildPriceFields(body);
    const price = priceFields.price;

    if (price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "سعر المنتج يجب أن يكون أكبر من صفر",
        },
        { status: 400 }
      );
    }

    if (
      priceFields.compareAtPrice !== null &&
      priceFields.compareAtPrice > 0 &&
      priceFields.compareAtPrice < price
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "السعر قبل الخصم لا يمكن أن يكون أقل من السعر بعد الخصم",
        },
        { status: 400 }
      );
    }

    if (
      priceFields.minSellingPrice !== null &&
      price < priceFields.minSellingPrice
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "السعر بعد الخصم أقل من أقل سعر مسموح للبيع",
        },
        { status: 400 }
      );
    }

    const stock = toInt(body?.stock, 0);

    if (stock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "المخزون لا يمكن أن يكون أقل من صفر",
        },
        { status: 400 }
      );
    }

    const reservedStock = toInt(body?.reservedStock, 0);
    const availableStock = Math.max(0, stock - reservedStock);

    const slug = await createUniqueProductSlug(storeId, name, body?.slug);

    const mediaItems = normalizeMediaItems(body?.media, body?.imageUrl);
    const imageUrl = getImageUrlFromMedia(mediaItems, body?.imageUrl);

    const productOptions = normalizeProductOptions(body?.productOptions);
    const productVariants = normalizeProductVariants(
      body?.productVariants,
      storeId,
      price,
      priceFields.costPrice,
      priceFields.compareAtPrice
    );

    const type =
      productVariants.length > 0
        ? ProductType.VARIABLE
        : getProductType(body?.type);

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          storeId,
          name,
          slug,

          shortDescription: toOptionalText(body?.shortDescription),
          description: toOptionalText(body?.description),
          fullDescription: toOptionalText(body?.fullDescription),

          price: priceFields.price,
          compareAtPrice: priceFields.compareAtPrice,
          discountPrice: priceFields.discountPrice,
          costPrice: priceFields.costPrice,
          minSellingPrice: priceFields.minSellingPrice,
          maxDiscountPercent: priceFields.maxDiscountPercent,

          stock,
          imageUrl,
          category: toOptionalText(body?.category),
          status: getProductStatus(body?.status),
          type,

          brand: toOptionalText(body?.brand),
          supplierName: toOptionalText(body?.supplierName),
          countryOfOrigin: toOptionalText(body?.countryOfOrigin),
          warrantyInfo: toOptionalText(body?.warrantyInfo),

          tags: body?.tags ?? undefined,
          keywords: body?.keywords ?? undefined,

          currency: normalizeText(body?.currency) || "EGP",
          includesTax: Boolean(body?.includesTax),
          taxRate: toOptionalNumber(body?.taxRate),

          reservedStock,
          availableStock,
          lowStockAlert: toInt(body?.lowStockAlert, 5),
          trackInventory: body?.trackInventory === false ? false : true,
          inventoryPolicy: getInventoryPolicy(body?.inventoryPolicy),

          requiresShipping: body?.requiresShipping === false ? false : true,
          weight: toOptionalNumber(body?.weight),
          length: toOptionalNumber(body?.length),
          width: toOptionalNumber(body?.width),
          height: toOptionalNumber(body?.height),
          packageType: toOptionalText(body?.packageType),
          preparationDays: toOptionalInt(body?.preparationDays),
          shippingNotes: toOptionalText(body?.shippingNotes),

          metaTitle: toOptionalText(body?.metaTitle),
          metaDescription: toOptionalText(body?.metaDescription),
          canonicalUrl: toOptionalText(body?.canonicalUrl),
          ogTitle: toOptionalText(body?.ogTitle),
          ogDescription: toOptionalText(body?.ogDescription),
          ogImage: toOptionalText(body?.ogImage),
          seoKeywords: body?.seoKeywords ?? undefined,

          isFeatured: Boolean(body?.isFeatured),
          isNewArrival: Boolean(body?.isNewArrival),
          isBestSeller: Boolean(body?.isBestSeller),
          showOnHome: Boolean(body?.showOnHome),
          badges: body?.badges ?? undefined,
          campaignIds: body?.campaignIds ?? undefined,

          customFields: body?.customFields ?? undefined,
          internalNotes: toOptionalText(body?.internalNotes),
          externalProductId: toOptionalText(body?.externalProductId),

          attributes: body?.attributes ?? undefined,
          options: body?.options ?? undefined,
          variants: body?.variants ?? undefined,
        },
        select: {
          id: true,
        },
      });

      if (mediaItems.length > 0) {
        await tx.productMedia.createMany({
          data: mediaItems.map((item) => ({
            ...item,
            productId: createdProduct.id,
          })),
        });
      }

      if (productOptions.length > 0) {
        await tx.productOption.createMany({
          data: productOptions.map((item) => ({
            ...item,
            productId: createdProduct.id,
          })),
        });
      }

      if (productVariants.length > 0) {
        await tx.productVariant.createMany({
          data: productVariants.map((item) => ({
            ...item,
            productId: createdProduct.id,
          })),
        });
      }

      return tx.product.findUnique({
        where: {
          id: createdProduct.id,
        },
        include: productInclude,
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم إضافة المنتج بنجاح",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إضافة المنتج",
      },
      { status: 500 }
    );
  }
}