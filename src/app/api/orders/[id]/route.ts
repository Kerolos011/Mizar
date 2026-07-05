import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function getNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isValidOrderStatus(status: string) {
  return Object.values(OrderStatus).includes(status as OrderStatus);
}

const orderInclude = {
  store: true,
  customer: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  },
  items: {
    include: {
      product: {
        include: {
          media: {
            orderBy: {
              sortOrder: "asc" as const,
            },
          },
        },
      },
      variant: {
        include: {
          media: {
            orderBy: {
              sortOrder: "asc" as const,
            },
          },
        },
      },
    },
  },
};

async function getOrderWithDetails(orderId: string) {
  return prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: orderInclude,
  });
}

function canReadOrder(
  order: Awaited<ReturnType<typeof getOrderWithDetails>>,
  session: {
    userId: string;
    role: "SUPER_ADMIN" | "MERCHANT" | "CUSTOMER";
    customerStoreId?: string | null;
  }
) {
  if (!order) return false;

  if (session.role === "SUPER_ADMIN") return true;

  if (session.role === "MERCHANT") {
    return order.store.ownerId === session.userId;
  }

  if (session.role === "CUSTOMER") {
    return (
      order.userId === session.userId &&
      order.storeId === session.customerStoreId
    );
  }

  return false;
}

function canManageOrder(
  order: Awaited<ReturnType<typeof getOrderWithDetails>>,
  session: {
    userId: string;
    role: "SUPER_ADMIN" | "MERCHANT" | "CUSTOMER";
  }
) {
  if (!order) return false;

  if (session.role === "SUPER_ADMIN") return true;

  if (session.role === "MERCHANT") {
    return order.store.ownerId === session.userId;
  }

  return false;
}

function shouldRestoreStock(
  previousStatus: OrderStatus | string,
  nextStatus: OrderStatus | string
) {
  return previousStatus !== OrderStatus.CANCELLED && nextStatus === OrderStatus.CANCELLED;
}

function shouldDeductStock(
  previousStatus: OrderStatus | string,
  nextStatus: OrderStatus | string
) {
  return previousStatus === OrderStatus.CANCELLED && nextStatus !== OrderStatus.CANCELLED;
}

async function restoreOrderStock(
  tx: any,
  order: Awaited<ReturnType<typeof getOrderWithDetails>>,
  createdByUserId: string
) {
  if (!order) return;

  for (const item of order.items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({
        where: {
          id: item.variantId,
        },
        select: {
          id: true,
          productId: true,
          storeId: true,
          title: true,
          quantity: true,
        },
      });

      if (!variant) {
        throw new Error(
          `النسخة المختارة غير موجودة: ${item.variantTitle || item.sku || item.variantId}`
        );
      }

      const quantityBefore = getNumber(variant.quantity, 0);
      const quantityAfter = quantityBefore + item.quantity;

      await tx.productVariant.update({
        where: {
          id: item.variantId,
        },
        data: {
          quantity: {
            increment: item.quantity,
          },
          availableQuantity: {
            increment: item.quantity,
          },
        },
      });

      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            increment: item.quantity,
          },
          availableStock: {
            increment: item.quantity,
          },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          storeId: order.storeId,
          productId: item.productId,
          variantId: item.variantId,
          type: "ORDER_CANCELLED",
          quantityBefore,
          quantityChange: item.quantity,
          quantityAfter,
          reason: "Order cancelled stock restore",
          note: `Order cancelled: ${
            item.productName || item.product?.name || "Product"
          }${item.variantTitle ? ` - ${item.variantTitle}` : ""}`,
          referenceType: "ORDER",
          referenceId: order.id,
          createdByUserId,
        },
      });

      continue;
    }

    const product = await tx.product.findUnique({
      where: {
        id: item.productId,
      },
      select: {
        id: true,
        storeId: true,
        name: true,
        stock: true,
      },
    });

    if (!product) {
      throw new Error("المنتج غير موجود أثناء إرجاع المخزون");
    }

    const quantityBefore = getNumber(product.stock, 0);
    const quantityAfter = quantityBefore + item.quantity;

    await tx.product.update({
      where: {
        id: item.productId,
      },
      data: {
        stock: {
          increment: item.quantity,
        },
        availableStock: {
          increment: item.quantity,
        },
      },
    });

    await tx.inventoryMovement.create({
      data: {
        storeId: order.storeId,
        productId: item.productId,
        variantId: null,
        type: "ORDER_CANCELLED",
        quantityBefore,
        quantityChange: item.quantity,
        quantityAfter,
        reason: "Order cancelled stock restore",
        note: `Order cancelled: ${item.productName || product.name}`,
        referenceType: "ORDER",
        referenceId: order.id,
        createdByUserId,
      },
    });
  }
}

async function validateStockBeforeDeduct(
  tx: any,
  order: Awaited<ReturnType<typeof getOrderWithDetails>>
) {
  if (!order) return;

  for (const item of order.items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({
        where: {
          id: item.variantId,
        },
        select: {
          id: true,
          title: true,
          quantity: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!variant) {
        throw new Error(
          `النسخة المختارة غير موجودة: ${item.variantTitle || item.sku || item.variantId}`
        );
      }

      if (variant.quantity < item.quantity) {
        throw new Error(
          `المخزون غير كافٍ للمنتج: ${variant.product.name} - ${variant.title}`
        );
      }

      continue;
    }

    const product = await tx.product.findUnique({
      where: {
        id: item.productId,
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    if (!product) {
      throw new Error("المنتج غير موجود أثناء تحديث المخزون");
    }

    if (product.stock < item.quantity) {
      throw new Error(`المخزون غير كافٍ للمنتج: ${product.name}`);
    }
  }
}

async function deductOrderStock(
  tx: any,
  order: Awaited<ReturnType<typeof getOrderWithDetails>>,
  createdByUserId: string
) {
  if (!order) return;

  for (const item of order.items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({
        where: {
          id: item.variantId,
        },
        select: {
          id: true,
          productId: true,
          storeId: true,
          title: true,
          quantity: true,
        },
      });

      if (!variant) {
        throw new Error(
          `النسخة المختارة غير موجودة: ${item.variantTitle || item.sku || item.variantId}`
        );
      }

      const quantityBefore = getNumber(variant.quantity, 0);
      const quantityAfter = quantityBefore - item.quantity;

      await tx.productVariant.update({
        where: {
          id: item.variantId,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
          availableQuantity: {
            decrement: item.quantity,
          },
        },
      });

      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
          availableStock: {
            decrement: item.quantity,
          },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          storeId: order.storeId,
          productId: item.productId,
          variantId: item.variantId,
          type: "ORDER_RESTORED",
          quantityBefore,
          quantityChange: -item.quantity,
          quantityAfter,
          reason: "Order restored stock deduction",
          note: `Order restored: ${
            item.productName || item.product?.name || "Product"
          }${item.variantTitle ? ` - ${item.variantTitle}` : ""}`,
          referenceType: "ORDER",
          referenceId: order.id,
          createdByUserId,
        },
      });

      continue;
    }

    const product = await tx.product.findUnique({
      where: {
        id: item.productId,
      },
      select: {
        id: true,
        storeId: true,
        name: true,
        stock: true,
      },
    });

    if (!product) {
      throw new Error("المنتج غير موجود أثناء تحديث المخزون");
    }

    const quantityBefore = getNumber(product.stock, 0);
    const quantityAfter = quantityBefore - item.quantity;

    await tx.product.update({
      where: {
        id: item.productId,
      },
      data: {
        stock: {
          decrement: item.quantity,
        },
        availableStock: {
          decrement: item.quantity,
        },
      },
    });

    await tx.inventoryMovement.create({
      data: {
        storeId: order.storeId,
        productId: item.productId,
        variantId: null,
        type: "ORDER_RESTORED",
        quantityBefore,
        quantityChange: -item.quantity,
        quantityAfter,
        reason: "Order restored stock deduction",
        note: `Order restored: ${item.productName || product.name}`,
        referenceType: "ORDER",
        referenceId: order.id,
        createdByUserId,
      },
    });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولًا",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const orderId = cleanText(id);

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الطلب مطلوب",
        },
        { status: 400 }
      );
    }

    const order = await getOrderWithDetails(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير موجود",
        },
        { status: 404 }
      );
    }

    if (!canReadOrder(order, session)) {
      return NextResponse.json(
        {
          success: false,
          message: "لا تملك صلاحية عرض هذا الطلب",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل الطلب",
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
    const session = await getSessionFromRequest(request);

    if (
      !session ||
      (session.role !== "MERCHANT" && session.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول كتاجر",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const orderId = cleanText(id);

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الطلب مطلوب",
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const nextStatus = cleanText(body?.status);

    if (!nextStatus || !isValidOrderStatus(nextStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "حالة الطلب غير صحيحة",
        },
        { status: 400 }
      );
    }

    const existingOrder = await getOrderWithDetails(orderId);

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير موجود",
        },
        { status: 404 }
      );
    }

    if (!canManageOrder(existingOrder, session)) {
      return NextResponse.json(
        {
          success: false,
          message: "لا تملك صلاحية تعديل هذا الطلب",
        },
        { status: 403 }
      );
    }

    if (existingOrder.status === nextStatus) {
      return NextResponse.json({
        success: true,
        message: "حالة الطلب محدثة بالفعل",
        order: existingOrder,
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (shouldRestoreStock(existingOrder.status, nextStatus)) {
        await restoreOrderStock(tx, existingOrder, session.userId);
      }

      if (shouldDeductStock(existingOrder.status, nextStatus)) {
        await validateStockBeforeDeduct(tx, existingOrder);
        await deductOrderStock(tx, existingOrder, session.userId);
      }

      const order = await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: nextStatus as OrderStatus,
        },
        include: orderInclude,
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message:
        nextStatus === OrderStatus.CANCELLED
          ? "تم إلغاء الطلب وإرجاع المخزون بنجاح"
          : "تم تحديث حالة الطلب بنجاح",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحديث حالة الطلب",
      },
      { status: 500 }
    );
  }
}