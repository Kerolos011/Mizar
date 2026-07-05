import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

type InventoryItemType = "PRODUCT" | "VARIANT";

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function getNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getDateRange(period: string) {
  const now = new Date();

  if (period === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { from, to: now };
  }

  if (period === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from, to: now };
  }

  if (period === "90d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 90);
    return { from, to: now };
  }

  if (period === "365d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 365);
    return { from, to: now };
  }

  return { from: null, to: null };
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
  storeIdFromQuery?: string | null
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

  if (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN) {
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

function addToMap<T extends Record<string, any>>(
  map: Map<string, T>,
  key: string,
  initialValue: T,
  updater: (current: T) => T
) {
  const current = map.get(key) || initialValue;
  map.set(key, updater(current));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const storeId = searchParams.get("storeId");
    const period = normalizeText(searchParams.get("period")) || "30d";

    const ownership = await getCurrentMerchantStore(request, storeId);

    if (!ownership.ok || !ownership.store) {
      return NextResponse.json(
        {
          success: false,
          message: ownership.message,
          redirectTo:
            ownership.status === 401
              ? "/merchant/login?next=/dashboard/inventory/reports"
              : "/merchant/welcome",
        },
        { status: ownership.status }
      );
    }

    const dateRange = getDateRange(period);

    const orderDateFilter =
      dateRange.from && dateRange.to
        ? {
            gte: dateRange.from,
            lte: dateRange.to,
          }
        : undefined;

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

    const inventoryRows = products.flatMap((product) => {
      const productImage = getCoverImage(product);

      if (product.productVariants.length > 0) {
        return product.productVariants.map((variant) => {
          const quantity = getNumber(variant.quantity, 0);
          const reservedQuantity = getNumber(variant.reservedQuantity, 0);
          const availableQuantity = Math.max(0, quantity - reservedQuantity);
          const lowStockAlert = getNumber(variant.lowStockAlert, 0);
          const price = getNumber(variant.price, getNumber(product.price, 0));

          const costPrice =
            variant.costPrice !== null && variant.costPrice !== undefined
              ? getNumber(variant.costPrice, 0)
              : product.costPrice !== null && product.costPrice !== undefined
                ? getNumber(product.costPrice, 0)
                : null;

          const stockValue = (costPrice ?? price) * quantity;
          const potentialSalesValue = price * quantity;
          const potentialProfitValue =
            costPrice === null ? 0 : Math.max(0, price - costPrice) * quantity;

          return {
            id: variant.id,
            itemType: "VARIANT" as InventoryItemType,
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            variantTitle: variant.title,
            displayName: `${product.name} - ${variant.title}`,
            category: product.category || "غير مصنف",
            sku: variant.sku,
            barcode: variant.barcode,
            imageUrl: getVariantImage(product, variant),
            status: variant.status,
            price,
            costPrice,
            quantity,
            reservedQuantity,
            availableQuantity,
            lowStockAlert,
            stockValue,
            potentialSalesValue,
            potentialProfitValue,
            missingCost: costPrice === null,
            updatedAt: variant.updatedAt,
          };
        });
      }

      const quantity = getNumber(product.stock, 0);
      const reservedQuantity = getNumber(product.reservedStock, 0);
      const availableQuantity = Math.max(0, quantity - reservedQuantity);
      const lowStockAlert = getNumber(product.lowStockAlert, 0);
      const price = getNumber(product.price, 0);

      const costPrice =
        product.costPrice !== null && product.costPrice !== undefined
          ? getNumber(product.costPrice, 0)
          : null;

      const stockValue = (costPrice ?? price) * quantity;
      const potentialSalesValue = price * quantity;
      const potentialProfitValue =
        costPrice === null ? 0 : Math.max(0, price - costPrice) * quantity;

      return [
        {
          id: product.id,
          itemType: "PRODUCT" as InventoryItemType,
          productId: product.id,
          variantId: null,
          productName: product.name,
          variantTitle: null,
          displayName: product.name,
          category: product.category || "غير مصنف",
          sku: null,
          barcode: null,
          imageUrl: productImage,
          status: product.status,
          price,
          costPrice,
          quantity,
          reservedQuantity,
          availableQuantity,
          lowStockAlert,
          stockValue,
          potentialSalesValue,
          potentialProfitValue,
          missingCost: costPrice === null,
          updatedAt: product.updatedAt,
        },
      ];
    });

    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          storeId: ownership.store.id,
        },
        order: {
          status: {
            not: "CANCELLED",
          },
          ...(orderDateFilter
            ? {
                createdAt: orderDateFilter,
              }
            : {}),
        },
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            costPrice: true,
          },
        },
        variant: {
          select: {
            id: true,
            title: true,
            sku: true,
            price: true,
            costPrice: true,
            options: true,
          },
        },
      },
    });

    const productSalesMap = new Map<string, any>();
    const variantSalesMap = new Map<string, any>();
    const categorySalesMap = new Map<string, any>();

    for (const item of orderItems) {
      const quantity = getNumber(item.quantity, 0);
      const revenue = item.total !== null && item.total !== undefined
        ? getNumber(item.total, 0)
        : getNumber(item.price, 0) * quantity;

      const unitCost =
        item.unitCost !== null && item.unitCost !== undefined
          ? getNumber(item.unitCost, 0)
          : item.variant?.costPrice !== null && item.variant?.costPrice !== undefined
            ? getNumber(item.variant.costPrice, 0)
            : item.product.costPrice !== null && item.product.costPrice !== undefined
              ? getNumber(item.product.costPrice, 0)
              : null;

      const profit =
        item.profit !== null && item.profit !== undefined
          ? getNumber(item.profit, 0)
          : unitCost === null
            ? 0
            : revenue - unitCost * quantity;

      const category = item.product.category || "غير مصنف";

      addToMap(
        productSalesMap,
        item.productId,
        {
          productId: item.productId,
          productName: item.product.name,
          category,
          quantitySold: 0,
          revenue: 0,
          profit: 0,
          orderLines: 0,
        },
        (current) => ({
          ...current,
          quantitySold: current.quantitySold + quantity,
          revenue: current.revenue + revenue,
          profit: current.profit + profit,
          orderLines: current.orderLines + 1,
        })
      );

      if (item.variantId && item.variant) {
        addToMap(
          variantSalesMap,
          item.variantId,
          {
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            variantTitle: item.variant.title,
            sku: item.variant.sku,
            category,
            quantitySold: 0,
            revenue: 0,
            profit: 0,
            orderLines: 0,
          },
          (current) => ({
            ...current,
            quantitySold: current.quantitySold + quantity,
            revenue: current.revenue + revenue,
            profit: current.profit + profit,
            orderLines: current.orderLines + 1,
          })
        );
      }

      addToMap(
        categorySalesMap,
        category,
        {
          category,
          quantitySold: 0,
          revenue: 0,
          profit: 0,
          orderLines: 0,
        },
        (current) => ({
          ...current,
          quantitySold: current.quantitySold + quantity,
          revenue: current.revenue + revenue,
          profit: current.profit + profit,
          orderLines: current.orderLines + 1,
        })
      );
    }

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        storeId: ownership.store.id,
        ...(orderDateFilter
          ? {
              createdAt: orderDateFilter,
            }
          : {}),
      },
      select: {
        id: true,
        type: true,
        quantityChange: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1000,
    });

    const movementTypeMap = new Map<string, number>();

    for (const movement of movements) {
      movementTypeMap.set(
        movement.type,
        (movementTypeMap.get(movement.type) || 0) + 1
      );
    }

    const totalQuantity = inventoryRows.reduce((sum, row) => sum + row.quantity, 0);
    const totalAvailable = inventoryRows.reduce(
      (sum, row) => sum + row.availableQuantity,
      0
    );
    const totalReserved = inventoryRows.reduce(
      (sum, row) => sum + row.reservedQuantity,
      0
    );
    const stockValue = inventoryRows.reduce((sum, row) => sum + row.stockValue, 0);
    const potentialSalesValue = inventoryRows.reduce(
      (sum, row) => sum + row.potentialSalesValue,
      0
    );
    const potentialProfitValue = inventoryRows.reduce(
      (sum, row) => sum + row.potentialProfitValue,
      0
    );

    const soldQuantity = orderItems.reduce(
      (sum, item) => sum + getNumber(item.quantity, 0),
      0
    );
    const revenue = orderItems.reduce((sum, item) => {
      if (item.total !== null && item.total !== undefined) {
        return sum + getNumber(item.total, 0);
      }

      return sum + getNumber(item.price, 0) * getNumber(item.quantity, 0);
    }, 0);

    const profit = Array.from(productSalesMap.values()).reduce(
      (sum, item) => sum + item.profit,
      0
    );

    const lowStockItems = inventoryRows
      .filter(
        (row) =>
          row.availableQuantity > 0 && row.availableQuantity <= row.lowStockAlert
      )
      .sort((a, b) => a.availableQuantity - b.availableQuantity)
      .slice(0, 20);

    const outOfStockItems = inventoryRows
      .filter((row) => row.availableQuantity <= 0)
      .sort((a, b) => a.productName.localeCompare(b.productName))
      .slice(0, 20);

    const topStockItems = [...inventoryRows]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 20);

    const lowestStockItems = [...inventoryRows]
      .sort((a, b) => a.availableQuantity - b.availableQuantity)
      .slice(0, 20);

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 20);

    const topSellingVariants = Array.from(variantSalesMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 20);

    const productProfit = Array.from(productSalesMap.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 20);

    const variantProfit = Array.from(variantSalesMap.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 20);

    const categorySales = Array.from(categorySalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20);

    const movementSummary = Array.from(movementTypeMap.entries())
      .map(([type, count]) => ({
        type,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const summary = {
      period,
      totalProducts: products.length,
      totalInventoryRows: inventoryRows.length,
      totalVariants: inventoryRows.filter((row) => row.itemType === "VARIANT").length,

      totalQuantity,
      totalAvailable,
      totalReserved,

      stockValue,
      potentialSalesValue,
      potentialProfitValue,

      missingCostCount: inventoryRows.filter((row) => row.missingCost).length,

      lowStockCount: inventoryRows.filter(
        (row) =>
          row.availableQuantity > 0 && row.availableQuantity <= row.lowStockAlert
      ).length,
      outOfStockCount: inventoryRows.filter((row) => row.availableQuantity <= 0)
        .length,

      orderLinesCount: orderItems.length,
      soldQuantity,
      revenue,
      profit,
      averageLineRevenue: orderItems.length > 0 ? revenue / orderItems.length : 0,

      movementsCount: movements.length,
      movementIncrease: movements
        .filter((movement) => movement.quantityChange > 0)
        .reduce((sum, movement) => sum + movement.quantityChange, 0),
      movementDecrease: Math.abs(
        movements
          .filter((movement) => movement.quantityChange < 0)
          .reduce((sum, movement) => sum + movement.quantityChange, 0)
      ),
    };

    return NextResponse.json({
      success: true,
      store: ownership.store,
      summary,
      lowStockItems,
      outOfStockItems,
      topStockItems,
      lowestStockItems,
      topSellingProducts,
      topSellingVariants,
      productProfit,
      variantProfit,
      categorySales,
      movementSummary,
    });
  } catch (error) {
    console.error("Inventory reports GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحميل تقارير المخزون",
      },
      { status: 500 }
    );
  }
}