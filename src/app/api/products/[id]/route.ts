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
      ownerId: true,
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
  if (value === undefined || value === null || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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

function hasOwn(body: any, key: string) {
  return Object.prototype.hasOwnProperty.call(body || {}, key);
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
  productId: string,
  preferredSlug?: string
) {
  const baseSlug = normalizeSlug(preferredSlug || name);

  for (let index = 0; index < 20; index += 1) {
    const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;

    const existingProduct = await prisma.product.findFirst({
      where: {
        storeId,
        slug,
        NOT: {
          id: productId,
        },
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

async function getProductWithPermission(request: NextRequest, productId: string) {
  const session = await getSessionFromRequest(request);

  if (!session?.userId) {
    return {
      ok: false,
      status: 401,
      message: "يجب تسجيل الدخول أولًا",
      session: null,
      product: null,
    };
  }

  if (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN) {
    return {
      ok: false,
      status: 403,
      message: "هذه العملية مخصصة للتجار فقط",
      session,
      product: null,
    };
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      store: {
        select: {
          id: true,
          ownerId: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product) {
    return {
      ok: false,
      status: 404,
      message: "المنتج غير موجود",
      session,
      product: null,
    };
  }

  if (
    session.role !== UserRole.SUPER_ADMIN &&
    product.store.ownerId !== session.userId
  ) {
    return {
      ok: false,
      status: 403,
      message: "لا تملك صلاحية إدارة هذا المنتج",
      session,
      product,
    };
  }

  return {
    ok: true,
    status: 200,
    message: "",
    session,
    product,
  };
}

function isForeignKeyConstraintError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code || "")
      : "";

  const message = error instanceof Error ? error.message : String(error || "");

  return code === "P2003" || message.includes("Foreign key constraint");
}

async function archiveProductInsteadOfDeleting(productId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.productVariant.updateMany({
      where: {
        productId,
      },
      data: {
        status: ProductVariantStatus.DISABLED,
      },
    });

    await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        status: ProductStatus.ARCHIVED,
        stock: 0,
        availableStock: 0,
        showOnHome: false,
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
      },
    });
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: productInclude,
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "المنتج غير موجود",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل المنتج",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);

    const permission = await getProductWithPermission(request, id);

    if (!permission.ok || !permission.product) {
      return NextResponse.json(
        {
          success: false,
          message: permission.message,
        },
        { status: permission.status }
      );
    }

    const currentProduct = permission.product;

    const name = hasOwn(body, "name")
      ? normalizeText(body?.name)
      : currentProduct.name;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم المنتج مطلوب",
        },
        { status: 400 }
      );
    }

    const price = hasOwn(body, "price")
      ? toNumber(body?.price, 0)
      : currentProduct.price;

    if (price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "سعر المنتج يجب أن يكون أكبر من صفر",
        },
        { status: 400 }
      );
    }

    const compareAtPrice = hasOwn(body, "compareAtPrice")
      ? toOptionalNumber(body?.compareAtPrice)
      : currentProduct.compareAtPrice;

    const costPrice = hasOwn(body, "costPrice")
      ? toOptionalNumber(body?.costPrice)
      : currentProduct.costPrice;

    const minSellingPrice = hasOwn(body, "minSellingPrice")
      ? toOptionalNumber(body?.minSellingPrice)
      : currentProduct.minSellingPrice;

    const maxDiscountPercent = hasOwn(body, "maxDiscountPercent")
      ? toOptionalNumber(body?.maxDiscountPercent)
      : currentProduct.maxDiscountPercent;

    if (
      compareAtPrice !== null &&
      compareAtPrice > 0 &&
      compareAtPrice < price
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "السعر قبل الخصم لا يمكن أن يكون أقل من السعر بعد الخصم",
        },
        { status: 400 }
      );
    }

    if (minSellingPrice !== null && price < minSellingPrice) {
      return NextResponse.json(
        {
          success: false,
          message: "السعر بعد الخصم أقل من أقل سعر مسموح للبيع",
        },
        { status: 400 }
      );
    }

    const discountPrice =
      compareAtPrice !== null && compareAtPrice > price ? price : null;

    const stock = hasOwn(body, "stock")
      ? toInt(body?.stock, 0)
      : currentProduct.stock;

    if (stock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "المخزون لا يمكن أن يكون أقل من صفر",
        },
        { status: 400 }
      );
    }

    const reservedStock = hasOwn(body, "reservedStock")
      ? toInt(body?.reservedStock, 0)
      : currentProduct.reservedStock;

    const availableStock = Math.max(0, stock - reservedStock);

    const slug = hasOwn(body, "slug")
      ? await createUniqueProductSlug(
          currentProduct.storeId,
          name,
          currentProduct.id,
          body?.slug
        )
      : currentProduct.slug ||
        (await createUniqueProductSlug(
          currentProduct.storeId,
          name,
          currentProduct.id
        ));

    const shouldReplaceMedia = hasOwn(body, "media");
    const mediaItems = shouldReplaceMedia
      ? normalizeMediaItems(body?.media, body?.imageUrl)
      : [];

    const imageUrl = shouldReplaceMedia
      ? getImageUrlFromMedia(mediaItems, body?.imageUrl)
      : hasOwn(body, "imageUrl")
        ? toOptionalText(body?.imageUrl)
        : currentProduct.imageUrl;

    const shouldReplaceOptions = hasOwn(body, "productOptions");
    const productOptions = shouldReplaceOptions
      ? normalizeProductOptions(body?.productOptions)
      : [];

    const shouldReplaceVariants = hasOwn(body, "productVariants");
    const productVariants = shouldReplaceVariants
      ? normalizeProductVariants(
          body?.productVariants,
          currentProduct.storeId,
          price,
          costPrice,
          compareAtPrice
        )
      : [];

    const nextType =
      shouldReplaceVariants && productVariants.length > 0
        ? ProductType.VARIABLE
        : hasOwn(body, "type")
          ? getProductType(body?.type)
          : currentProduct.type;

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: {
          id,
        },
        data: {
          name,
          slug,

          shortDescription: hasOwn(body, "shortDescription")
            ? toOptionalText(body?.shortDescription)
            : undefined,
          description: hasOwn(body, "description")
            ? toOptionalText(body?.description)
            : undefined,
          fullDescription: hasOwn(body, "fullDescription")
            ? toOptionalText(body?.fullDescription)
            : undefined,

          price,
          compareAtPrice,
          discountPrice,
          costPrice,
          minSellingPrice,
          maxDiscountPercent,

          stock,
          imageUrl,
          category: hasOwn(body, "category")
            ? toOptionalText(body?.category)
            : undefined,
          status: hasOwn(body, "status")
            ? getProductStatus(body?.status)
            : undefined,
          type: nextType,

          brand: hasOwn(body, "brand") ? toOptionalText(body?.brand) : undefined,
          supplierName: hasOwn(body, "supplierName")
            ? toOptionalText(body?.supplierName)
            : undefined,
          countryOfOrigin: hasOwn(body, "countryOfOrigin")
            ? toOptionalText(body?.countryOfOrigin)
            : undefined,
          warrantyInfo: hasOwn(body, "warrantyInfo")
            ? toOptionalText(body?.warrantyInfo)
            : undefined,

          tags: hasOwn(body, "tags") ? body?.tags : undefined,
          keywords: hasOwn(body, "keywords") ? body?.keywords : undefined,

          currency: hasOwn(body, "currency")
            ? normalizeText(body?.currency) || "EGP"
            : undefined,
          includesTax: hasOwn(body, "includesTax")
            ? Boolean(body?.includesTax)
            : undefined,
          taxRate: hasOwn(body, "taxRate")
            ? toOptionalNumber(body?.taxRate)
            : undefined,

          reservedStock,
          availableStock,
          lowStockAlert: hasOwn(body, "lowStockAlert")
            ? toInt(body?.lowStockAlert, 5)
            : undefined,
          trackInventory: hasOwn(body, "trackInventory")
            ? body?.trackInventory === false
              ? false
              : true
            : undefined,
          inventoryPolicy: hasOwn(body, "inventoryPolicy")
            ? getInventoryPolicy(body?.inventoryPolicy)
            : undefined,

          requiresShipping: hasOwn(body, "requiresShipping")
            ? body?.requiresShipping === false
              ? false
              : true
            : undefined,
          weight: hasOwn(body, "weight")
            ? toOptionalNumber(body?.weight)
            : undefined,
          length: hasOwn(body, "length")
            ? toOptionalNumber(body?.length)
            : undefined,
          width: hasOwn(body, "width")
            ? toOptionalNumber(body?.width)
            : undefined,
          height: hasOwn(body, "height")
            ? toOptionalNumber(body?.height)
            : undefined,
          packageType: hasOwn(body, "packageType")
            ? toOptionalText(body?.packageType)
            : undefined,
          preparationDays: hasOwn(body, "preparationDays")
            ? toOptionalInt(body?.preparationDays)
            : undefined,
          shippingNotes: hasOwn(body, "shippingNotes")
            ? toOptionalText(body?.shippingNotes)
            : undefined,

          metaTitle: hasOwn(body, "metaTitle")
            ? toOptionalText(body?.metaTitle)
            : undefined,
          metaDescription: hasOwn(body, "metaDescription")
            ? toOptionalText(body?.metaDescription)
            : undefined,
          canonicalUrl: hasOwn(body, "canonicalUrl")
            ? toOptionalText(body?.canonicalUrl)
            : undefined,
          ogTitle: hasOwn(body, "ogTitle")
            ? toOptionalText(body?.ogTitle)
            : undefined,
          ogDescription: hasOwn(body, "ogDescription")
            ? toOptionalText(body?.ogDescription)
            : undefined,
          ogImage: hasOwn(body, "ogImage")
            ? toOptionalText(body?.ogImage)
            : undefined,
          seoKeywords: hasOwn(body, "seoKeywords") ? body?.seoKeywords : undefined,

          isFeatured: hasOwn(body, "isFeatured")
            ? Boolean(body?.isFeatured)
            : undefined,
          isNewArrival: hasOwn(body, "isNewArrival")
            ? Boolean(body?.isNewArrival)
            : undefined,
          isBestSeller: hasOwn(body, "isBestSeller")
            ? Boolean(body?.isBestSeller)
            : undefined,
          showOnHome: hasOwn(body, "showOnHome")
            ? Boolean(body?.showOnHome)
            : undefined,
          badges: hasOwn(body, "badges") ? body?.badges : undefined,
          campaignIds: hasOwn(body, "campaignIds")
            ? body?.campaignIds
            : undefined,

          customFields: hasOwn(body, "customFields")
            ? body?.customFields
            : undefined,
          internalNotes: hasOwn(body, "internalNotes")
            ? toOptionalText(body?.internalNotes)
            : undefined,
          externalProductId: hasOwn(body, "externalProductId")
            ? toOptionalText(body?.externalProductId)
            : undefined,

          attributes: hasOwn(body, "attributes") ? body?.attributes : undefined,
          options: hasOwn(body, "options") ? body?.options : undefined,
          variants: hasOwn(body, "variants") ? body?.variants : undefined,
        },
      });

      if (shouldReplaceMedia) {
        await tx.productMedia.deleteMany({
          where: {
            productId: id,
          },
        });

        if (mediaItems.length > 0) {
          await tx.productMedia.createMany({
            data: mediaItems.map((item) => ({
              ...item,
              productId: id,
            })),
          });
        }
      }

      if (shouldReplaceOptions) {
        await tx.productOption.deleteMany({
          where: {
            productId: id,
          },
        });

        if (productOptions.length > 0) {
          await tx.productOption.createMany({
            data: productOptions.map((item) => ({
              ...item,
              productId: id,
            })),
          });
        }
      }

      if (shouldReplaceVariants) {
        await tx.productVariant.deleteMany({
          where: {
            productId: id,
          },
        });

        if (productVariants.length > 0) {
          await tx.productVariant.createMany({
            data: productVariants.map((item) => ({
              ...item,
              productId: id,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: {
          id,
        },
        include: productInclude,
      });
    });

    return NextResponse.json({
      success: true,
      message: "تم تعديل المنتج بنجاح",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تعديل المنتج",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const permission = await getProductWithPermission(request, id);

    if (!permission.ok) {
      return NextResponse.json(
        {
          success: false,
          message: permission.message,
        },
        { status: permission.status }
      );
    }

    const relatedOrderItemsCount = await prisma.orderItem.count({
      where: {
        productId: id,
      },
    });

    if (relatedOrderItemsCount > 0) {
      await archiveProductInsteadOfDeleting(id);

      return NextResponse.json({
        success: true,
        message: "تم حذف المنتج من الكتالوج مع الاحتفاظ بسجل الطلبات السابقة",
        archived: true,
      });
    }

    try {
      await prisma.product.delete({
        where: {
          id,
        },
      });
    } catch (deleteError) {
      if (!isForeignKeyConstraintError(deleteError)) {
        throw deleteError;
      }

      await archiveProductInsteadOfDeleting(id);

      return NextResponse.json({
        success: true,
        message: "تم حذف المنتج من الكتالوج مع الاحتفاظ بالبيانات المرتبطة به",
        archived: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء حذف المنتج",
      },
      { status: 500 }
    );
  }
}