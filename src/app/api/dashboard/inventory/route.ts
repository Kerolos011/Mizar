import { NextRequest, NextResponse } from "next/server";
import {
  ProductStatus,
  ProductVariantStatus,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

type InventoryItemType = "PRODUCT" | "VARIANT";

function hasOwn(body: any, key: string) {
  return Object.prototype.hasOwnProperty.call(body || {}, key);
}

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function toOptionalText(value: unknown) {
  const text = normalizeText(value);
  return text || null;
}

function toInt(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.floor(number) : fallback;
}

function getProductStatus(value: unknown): ProductStatus {
  if (value === ProductStatus.DRAFT || value === "DRAFT") {
    return ProductStatus.DRAFT;
  }

  if (value === ProductStatus.ACTIVE || value === "ACTIVE") {
    return ProductStatus.ACTIVE;
  }

  if (value === ProductStatus.HIDDEN || value === "HIDDEN") {
    return ProductStatus.HIDDEN;
  }

  if (value === ProductStatus.ARCHIVED || value === "ARCHIVED") {
    return ProductStatus.ARCHIVED;
  }

  return ProductStatus.ACTIVE;
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

function getCoverImage(product: any) {
  const cover =
    product.media?.find((item: any) => item.type === "IMAGE" && item.isCover) ||
    product.media?.find((item: any) => item.type === "IMAGE");

  return cover?.url || product.imageUrl || null;
}

function getVariantImage(product: any, variant: any) {
  const variantCover =
    variant.media?.find((item: any) => item.type === "IMAGE" && item.isCover) ||
    variant.media?.find((item: any) => item.type === "IMAGE");

  return variantCover?.url || variant.imageUrl || getCoverImage(product);
}

async function getCurrentMerchantStore(
  request: NextRequest,
  storeIdFromQuery?: string | null,
) {
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

  if (
    session.role !== UserRole.MERCHANT &&
    session.role !== UserRole.SUPER_ADMIN
  ) {
    return {
      ok: false,
      status: 403,
      message: "هذه الصفحة مخصصة للتجار فقط",
      session,
      store: null,
    };
  }

  const where =
    session.role === UserRole.SUPER_ADMIN && storeIdFromQuery
      ? { id: storeIdFromQuery }
      : { ownerId: session.userId };

  const store = await prisma.store.findFirst({
    where,
    select: {
      id: true,
      name: true,
      displayName: true,
      slug: true,
      ownerId: true,
      category: true,
    },
  });

  if (!store) {
    return {
      ok: false,
      status: 404,
      message: "لا يوجد متجر مرتبط بحسابك",
      session,
      store: null,
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

    const storeId = searchParams.get("storeId");
    const q = normalizeText(searchParams.get("q"));
    const stockFilter = normalizeText(searchParams.get("stockFilter"));
    const statusFilter = normalizeText(searchParams.get("status"));

    const ownership = await getCurrentMerchantStore(request, storeId);

    if (!ownership.ok || !ownership.store) {
      return NextResponse.json(
        {
          success: false,
          message: ownership.message,
          redirectTo:
            ownership.status === 401
              ? "/merchant/login?next=/dashboard/inventory"
              : "/merchant/welcome",
        },
        { status: ownership.status },
      );
    }

    const products = await prisma.product.findMany({
      where: {
        storeId: ownership.store.id,
      },
      include: {
        media: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        productVariants: {
          orderBy: {
            sortOrder: "asc",
          },
          include: {
            media: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const rows = products.flatMap((product): any[] => {
      const productImage = getCoverImage(product);

      if (product.productVariants.length > 0) {
        return product.productVariants.map((variant) => {
          const quantity = Number(variant.quantity || 0);
          const reservedQuantity = Number(variant.reservedQuantity || 0);
          const availableQuantity = Math.max(0, quantity - reservedQuantity);
          const lowStockAlert = Number(variant.lowStockAlert || 0);
          const price = Number(variant.price || product.price || 0);
          const costPrice =
            variant.costPrice !== null && variant.costPrice !== undefined
              ? Number(variant.costPrice)
              : product.costPrice !== null && product.costPrice !== undefined
                ? Number(product.costPrice)
                : null;

          return {
            id: variant.id,
            itemType: "VARIANT" as InventoryItemType,
            storeId: ownership.store!.id,
            productId: product.id,
            variantId: variant.id,

            productName: product.name,
            variantTitle: variant.title,
            displayName: `${product.name} - ${variant.title}`,

            category: product.category,
            productStatus: product.status,
            status: variant.status,

            sku: variant.sku,
            barcode: variant.barcode,
            options: variant.options,

            imageUrl: getVariantImage(product, variant),
            productImageUrl: productImage,

            price,
            costPrice,
            quantity,
            reservedQuantity,
            availableQuantity,
            lowStockAlert,

            stockValue: (costPrice ?? price) * quantity,
            potentialSalesValue: price * quantity,

            location: variant.location,
            supplierSku: variant.supplierSku,
            batchNumber: variant.batchNumber,
            expirationDate: variant.expirationDate,

            updatedAt: variant.updatedAt,
            productUpdatedAt: product.updatedAt,
          };
        });
      }

      const quantity = Number(product.stock || 0);
      const reservedQuantity = Number(product.reservedStock || 0);
      const availableQuantity = Math.max(0, quantity - reservedQuantity);
      const lowStockAlert = Number(product.lowStockAlert || 0);
      const price = Number(product.price || 0);
      const costPrice =
        product.costPrice !== null && product.costPrice !== undefined
          ? Number(product.costPrice)
          : null;

      return [
        {
          id: product.id,
          itemType: "PRODUCT" as InventoryItemType,
          storeId: ownership.store!.id,
          productId: product.id,
          variantId: null,

          productName: product.name,
          variantTitle: null,
          displayName: product.name,

          category: product.category,
          productStatus: product.status,
          status: product.status,

          sku: null,
          barcode: null,
          options: null,

          imageUrl: productImage,
          productImageUrl: productImage,

          price,
          costPrice,
          quantity,
          reservedQuantity,
          availableQuantity,
          lowStockAlert,

          stockValue: (costPrice ?? price) * quantity,
          potentialSalesValue: price * quantity,

          location: null,
          supplierSku: null,
          batchNumber: null,
          expirationDate: null,

          updatedAt: product.updatedAt,
          productUpdatedAt: product.updatedAt,
        },
      ];
    });

    const filteredRows = rows.filter((row) => {
      const searchText = [
        row.productName,
        row.variantTitle,
        row.sku,
        row.barcode,
        row.category,
        row.status,
        row.options ? JSON.stringify(row.options) : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = q ? searchText.includes(q.toLowerCase()) : true;

      const matchesStock =
        stockFilter === "out"
          ? row.availableQuantity <= 0
          : stockFilter === "low"
            ? row.availableQuantity > 0 &&
              row.availableQuantity <= row.lowStockAlert
            : stockFilter === "available"
              ? row.availableQuantity > 0
              : true;

      const matchesStatus = statusFilter ? row.status === statusFilter : true;

      return matchesSearch && matchesStock && matchesStatus;
    });

    const stats = {
      totalRows: rows.length,
      totalProducts: products.length,
      totalVariants: rows.filter((row) => row.itemType === "VARIANT").length,
      totalQuantity: rows.reduce((sum, row) => sum + row.quantity, 0),
      totalReserved: rows.reduce((sum, row) => sum + row.reservedQuantity, 0),
      totalAvailable: rows.reduce((sum, row) => sum + row.availableQuantity, 0),
      lowStockCount: rows.filter(
        (row) =>
          row.availableQuantity > 0 &&
          row.availableQuantity <= row.lowStockAlert,
      ).length,
      outOfStockCount: rows.filter((row) => row.availableQuantity <= 0).length,
      stockValue: rows.reduce((sum, row) => sum + row.stockValue, 0),
      potentialSalesValue: rows.reduce(
        (sum, row) => sum + row.potentialSalesValue,
        0,
      ),
    };

    return NextResponse.json({
      success: true,
      store: ownership.store,
      stats,
      items: filteredRows,
      totalItems: filteredRows.length,
    });
  } catch (error) {
    console.error("Dashboard inventory GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل المخزون",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const itemType = normalizeText(body?.itemType) as InventoryItemType;
    const id = normalizeText(body?.id);
    const note = toOptionalText(body?.note);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "معرّف عنصر المخزون مطلوب",
        },
        { status: 400 },
      );
    }

    if (itemType !== "PRODUCT" && itemType !== "VARIANT") {
      return NextResponse.json(
        {
          success: false,
          message: "نوع عنصر المخزون غير صحيح",
        },
        { status: 400 },
      );
    }

    const ownership = await getCurrentMerchantStore(request);

    if (!ownership.ok || !ownership.store || !ownership.session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: ownership.message,
        },
        { status: ownership.status },
      );
    }

    if (itemType === "VARIANT") {
      const variant = await prisma.productVariant.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          storeId: true,
          productId: true,
          quantity: true,
          reservedQuantity: true,
          lowStockAlert: true,
          status: true,
        },
      });

      if (!variant || variant.storeId !== ownership.store.id) {
        return NextResponse.json(
          {
            success: false,
            message: "هذا المتغير غير موجود أو لا تملك صلاحية تعديله",
          },
          { status: 404 },
        );
      }

      const data: any = {};
      let quantityChanged = false;
      const quantityBefore = Number(variant.quantity || 0);
      let quantityAfter = quantityBefore;

      if (hasOwn(body, "quantity")) {
        const quantity = toInt(body.quantity, 0);

        if (quantity < 0) {
          return NextResponse.json(
            {
              success: false,
              message: "الكمية لا يمكن أن تكون أقل من صفر",
            },
            { status: 400 },
          );
        }

        quantityAfter = quantity;
        quantityChanged = quantityAfter !== quantityBefore;

        data.quantity = quantity;
        data.availableQuantity = Math.max(
          0,
          quantity - Number(variant.reservedQuantity || 0),
        );
      }

      if (hasOwn(body, "lowStockAlert")) {
        data.lowStockAlert = Math.max(0, toInt(body.lowStockAlert, 0));
      }

      if (hasOwn(body, "status")) {
        data.status = getVariantStatus(body.status);
      }

      if (hasOwn(body, "sku")) {
        data.sku = toOptionalText(body.sku);
      }

      if (hasOwn(body, "barcode")) {
        data.barcode = toOptionalText(body.barcode);
      }

      if (hasOwn(body, "location")) {
        data.location = toOptionalText(body.location);
      }

      if (Object.keys(data).length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "لا توجد بيانات للتحديث",
          },
          { status: 400 },
        );
      }

      const updatedVariant = await prisma.$transaction(async (tx) => {
        const updated = await tx.productVariant.update({
          where: {
            id,
          },
          data,
        });

        if (quantityChanged) {
          await tx.inventoryMovement.create({
            data: {
              storeId: ownership.store!.id,
              productId: variant.productId,
              variantId: variant.id,
              type: "MANUAL_ADJUSTMENT",
              quantityBefore,
              quantityChange: quantityAfter - quantityBefore,
              quantityAfter,
              reason: "Manual inventory adjustment from dashboard",
              note,
              referenceType: "DASHBOARD_INVENTORY",
              referenceId: variant.id,
              createdByUserId: ownership.session!.userId,
            },
          });
        }

        const variants = await tx.productVariant.findMany({
          where: {
            productId: variant.productId,
          },
          select: {
            quantity: true,
            reservedQuantity: true,
            availableQuantity: true,
          },
        });

        const totalQuantity = variants.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0,
        );

        const totalReserved = variants.reduce(
          (sum, item) => sum + Number(item.reservedQuantity || 0),
          0,
        );

        const totalAvailable = variants.reduce(
          (sum, item) => sum + Number(item.availableQuantity || 0),
          0,
        );

        await tx.product.update({
          where: {
            id: variant.productId,
          },
          data: {
            stock: totalQuantity,
            reservedStock: totalReserved,
            availableStock: totalAvailable,
          },
        });

        return updated;
      });

      return NextResponse.json({
        success: true,
        message: quantityChanged
          ? "تم تحديث مخزون المتغير وتسجيل الحركة بنجاح"
          : "تم تحديث بيانات المتغير بنجاح",
        item: updatedVariant,
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        storeId: true,
        stock: true,
        reservedStock: true,
        lowStockAlert: true,
        status: true,
      },
    });

    if (!product || product.storeId !== ownership.store.id) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا المنتج غير موجود أو لا تملك صلاحية تعديله",
        },
        { status: 404 },
      );
    }

    const data: any = {};
    let quantityChanged = false;
    const quantityBefore = Number(product.stock || 0);
    let quantityAfter = quantityBefore;

    if (hasOwn(body, "quantity")) {
      const quantity = toInt(body.quantity, 0);

      if (quantity < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "الكمية لا يمكن أن تكون أقل من صفر",
          },
          { status: 400 },
        );
      }

      quantityAfter = quantity;
      quantityChanged = quantityAfter !== quantityBefore;

      data.stock = quantity;
      data.availableStock = Math.max(
        0,
        quantity - Number(product.reservedStock || 0),
      );
    }

    if (hasOwn(body, "lowStockAlert")) {
      data.lowStockAlert = Math.max(0, toInt(body.lowStockAlert, 0));
    }

    if (hasOwn(body, "status")) {
      data.status = getProductStatus(body.status);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "لا توجد بيانات للتحديث",
        },
        { status: 400 },
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: {
          id,
        },
        data,
      });

      if (quantityChanged) {
        await tx.inventoryMovement.create({
          data: {
            storeId: ownership.store!.id,
            productId: product.id,
            variantId: null,
            type: "MANUAL_ADJUSTMENT",
            quantityBefore,
            quantityChange: quantityAfter - quantityBefore,
            quantityAfter,
            reason: "Manual inventory adjustment from dashboard",
            note,
            referenceType: "DASHBOARD_INVENTORY",
            referenceId: product.id,
            createdByUserId: ownership.session!.userId,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: quantityChanged
        ? "تم تحديث مخزون المنتج وتسجيل الحركة بنجاح"
        : "تم تحديث بيانات المنتج بنجاح",
      item: updatedProduct,
    });
  } catch (error) {
    console.error("Dashboard inventory PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحديث المخزون",
      },
      { status: 500 },
    );
  }
}