import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case OrderStatus.NEW:
      return "طلب جديد";

    case OrderStatus.PROCESSING:
      return "قيد التجهيز";

    case OrderStatus.SHIPPED:
      return "تم الشحن";

    case OrderStatus.DELIVERED:
      return "تم التسليم";

    case OrderStatus.COMPLETED:
      return "مكتمل";

    case OrderStatus.CANCELLED:
      return "ملغي";

    default:
      return status;
  }
}

function isCompletedStatus(status: OrderStatus) {
  return status === OrderStatus.COMPLETED || status === OrderStatus.DELIVERED;
}

function isActiveStatus(status: OrderStatus) {
  return (
    status === OrderStatus.NEW ||
    status === OrderStatus.PROCESSING ||
    status === OrderStatus.SHIPPED
  );
}

async function getMerchantStoreIds(userId: string) {
  const stores = await prisma.store.findMany({
    where: {
      ownerId: userId,
    },
    select: {
      id: true,
    },
  });

  return stores.map((store) => store.id);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (
      !session ||
      (session.role !== "MERCHANT" && session.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Merchant login is required",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedStoreId = cleanText(searchParams.get("storeId"));

    let allowedStoreIds: string[] = [];

    if (session.role === "SUPER_ADMIN") {
      if (requestedStoreId) {
        allowedStoreIds = [requestedStoreId];
      }
    }

    if (session.role === "MERCHANT") {
      const merchantStoreIds = await getMerchantStoreIds(session.userId);

      if (requestedStoreId) {
        if (!merchantStoreIds.includes(requestedStoreId)) {
          return NextResponse.json(
            {
              success: false,
              message: "You are not allowed to view analytics for this store",
            },
            { status: 403 }
          );
        }

        allowedStoreIds = [requestedStoreId];
      } else {
        allowedStoreIds = merchantStoreIds;
      }
    }

    if (session.role !== "SUPER_ADMIN" && allowedStoreIds.length === 0) {
      const emptySummary = {
        totalSales: 0,
        totalOrders: 0,
        activeOrders: 0,
        newOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
        customersCount: 0,
        productsCount: 0,
      };

      return NextResponse.json({
        success: true,
        summary: emptySummary,
        stats: emptySummary,
        statusSummary: [],
        topProducts: [],
        salesLast7Days: [],
        latestOrders: [],
      });
    }

    const storeWhere =
      session.role === "SUPER_ADMIN" && !requestedStoreId
        ? {}
        : {
            storeId: {
              in: allowedStoreIds,
            },
          };

    const [orders, customersCount, productsCount] = await Promise.all([
      prisma.order.findMany({
        where: storeWhere,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          customer: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.customer.count({
        where:
          session.role === "SUPER_ADMIN" && !requestedStoreId
            ? {}
            : {
                storeId: {
                  in: allowedStoreIds,
                },
              },
      }),

      prisma.product.count({
        where:
          session.role === "SUPER_ADMIN" && !requestedStoreId
            ? {}
            : {
                storeId: {
                  in: allowedStoreIds,
                },
              },
      }),
    ]);

    const nonCancelledOrders = orders.filter(
      (order) => order.status !== OrderStatus.CANCELLED
    );

    const newOrders = orders.filter((order) => order.status === OrderStatus.NEW);

    const processingOrders = orders.filter(
      (order) => order.status === OrderStatus.PROCESSING
    );

    const shippedOrders = orders.filter(
      (order) => order.status === OrderStatus.SHIPPED
    );

    const deliveredOrders = orders.filter(
      (order) => order.status === OrderStatus.DELIVERED
    );

    const completedOnlyOrders = orders.filter(
      (order) => order.status === OrderStatus.COMPLETED
    );

    const completedOrders = orders.filter((order) =>
      isCompletedStatus(order.status)
    );

    const cancelledOrders = orders.filter(
      (order) => order.status === OrderStatus.CANCELLED
    );

    const activeOrders = orders.filter((order) => isActiveStatus(order.status));

    const totalSales = nonCancelledOrders.reduce((sum, order) => {
      return sum + Number(order.total || 0);
    }, 0);

    const averageOrderValue =
      nonCancelledOrders.length > 0 ? totalSales / nonCancelledOrders.length : 0;

    const statusSummary = Object.values(OrderStatus).map((status) => {
      const statusOrders = orders.filter((order) => order.status === status);

      const total = statusOrders.reduce((sum, order) => {
        return sum + Number(order.total || 0);
      }, 0);

      return {
        status,
        label: getStatusLabel(status),
        count: statusOrders.length,
        total,
      };
    });

    const productMap = new Map<
      string,
      {
        productId: string;
        name: string;
        imageUrl?: string | null;
        quantity: number;
        sales: number;
      }
    >();

    for (const order of nonCancelledOrders) {
      for (const item of order.items) {
        const productId = item.product?.id || item.productId;
        const productName = item.product?.name || "منتج";
        const imageUrl = item.product?.imageUrl || null;

        const current = productMap.get(productId) || {
          productId,
          name: productName,
          imageUrl,
          quantity: 0,
          sales: 0,
        };

        current.quantity += Number(item.quantity || 0);
        current.sales += Number(item.price || 0) * Number(item.quantity || 0);

        productMap.set(productId, current);
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    const salesLast7DaysMap = new Map<
      string,
      {
        date: string;
        label: string;
        total: number;
        orders: number;
      }
    >();

    const today = new Date();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      date.setHours(0, 0, 0, 0);

      const key = formatDateKey(date);

      salesLast7DaysMap.set(key, {
        date: key,
        label: date.toLocaleDateString("ar-EG", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        total: 0,
        orders: 0,
      });
    }

    for (const order of nonCancelledOrders) {
      const orderDate = new Date(order.createdAt);
      const key = formatDateKey(orderDate);

      const current = salesLast7DaysMap.get(key);

      if (!current) continue;

      current.total += Number(order.total || 0);
      current.orders += 1;

      salesLast7DaysMap.set(key, current);
    }

    const salesLast7Days = Array.from(salesLast7DaysMap.values());

    const latestOrders = orders.slice(0, 8).map((order) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      statusLabel: getStatusLabel(order.status),
      createdAt: order.createdAt,
      store: order.store,
      customer: order.customer,
      itemsCount: order.items.reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
      }, 0),
    }));

    const summary = {
      totalSales,
      totalOrders: orders.length,

      activeOrders: activeOrders.length,

      newOrders: newOrders.length,
      processingOrders: processingOrders.length,
      shippedOrders: shippedOrders.length,
      deliveredOrders: deliveredOrders.length,

      completedOrders: completedOrders.length,
      completedOnlyOrders: completedOnlyOrders.length,

      cancelledOrders: cancelledOrders.length,

      averageOrderValue,
      customersCount,
      productsCount,
    };

    return NextResponse.json({
      success: true,

      summary,
      stats: summary,

      statusSummary,
      topProducts,
      salesLast7Days,
      latestOrders,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load analytics",
      },
      { status: 500 }
    );
  }
}