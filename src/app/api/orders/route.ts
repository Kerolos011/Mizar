import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

type IncomingOrderItem = {
  productId?: string;
  variantId?: string | null;
  quantity?: number | string;
};

type IncomingCustomer = {
  name?: string;
  phone?: string;
  city?: string;
  address?: string;
  notes?: string;
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function getSafeQuantity(value: unknown) {
  const quantity = Number(value);

  if (Number.isNaN(quantity)) return 0;

  return Math.floor(quantity);
}

function getNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isValidOrderStatus(status: string) {
  return Object.values(OrderStatus).includes(status as OrderStatus);
}

function getVariantAvailableQuantity(variant: {
  status?: string | null;
  quantity?: number | null;
  reservedQuantity?: number | null;
  availableQuantity?: number | null;
}) {
  if (variant.status && variant.status !== "ACTIVE") return 0;

  if (
    variant.availableQuantity !== null &&
    variant.availableQuantity !== undefined &&
    Number.isFinite(Number(variant.availableQuantity))
  ) {
    return Math.max(0, Number(variant.availableQuantity));
  }

  return Math.max(
    0,
    getNumber(variant.quantity, 0) - getNumber(variant.reservedQuantity, 0)
  );
}

function getLineKey(item: { productId: string; variantId?: string | null }) {
  return item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
}

function buildPriceSnapshot({
  finalPrice,
  compareAtPrice,
  quantity,
}: {
  finalPrice: number;
  compareAtPrice?: number | null;
  quantity: number;
}) {
  const safeFinalPrice = Math.max(0, getNumber(finalPrice, 0));
  const safeCompareAtPrice =
    compareAtPrice !== null && compareAtPrice !== undefined
      ? Math.max(0, getNumber(compareAtPrice, 0))
      : null;

  const originalPrice =
    safeCompareAtPrice !== null && safeCompareAtPrice > safeFinalPrice
      ? safeCompareAtPrice
      : safeFinalPrice;

  const discountAmount = Math.max(0, originalPrice - safeFinalPrice);
  const discountPercent =
    originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;

  const originalTotal = originalPrice * quantity;
  const discountTotal = discountAmount * quantity;
  const finalTotal = safeFinalPrice * quantity;

  return {
    originalPrice,
    finalPrice: safeFinalPrice,
    discountAmount,
    discountPercent,
    originalTotal,
    discountTotal,
    finalTotal,
  };
}

async function getMerchantAllowedStoreIds(userId: string) {
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

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Login is required",
          orders: [],
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const requestedStoreId = cleanText(searchParams.get("storeId"));
    const requestedStatus = cleanText(searchParams.get("status"));

    if (requestedStatus && !isValidOrderStatus(requestedStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status",
          orders: [],
        },
        { status: 400 }
      );
    }

    let allowedStoreIds: string[] = [];

    if (session.role === "SUPER_ADMIN") {
      if (requestedStoreId) {
        allowedStoreIds = [requestedStoreId];
      }
    }

    if (session.role === "MERCHANT") {
      const merchantStoreIds = await getMerchantAllowedStoreIds(session.userId);

      if (requestedStoreId) {
        if (!merchantStoreIds.includes(requestedStoreId)) {
          return NextResponse.json(
            {
              success: false,
              message: "You are not allowed to view orders for this store",
              orders: [],
            },
            { status: 403 }
          );
        }

        allowedStoreIds = [requestedStoreId];
      } else {
        allowedStoreIds = merchantStoreIds;
      }
    }

    if (session.role === "CUSTOMER") {
      if (!session.customerStoreId) {
        return NextResponse.json(
          {
            success: false,
            message: "Customer store is missing",
            orders: [],
          },
          { status: 403 }
        );
      }

      if (requestedStoreId && requestedStoreId !== session.customerStoreId) {
        return NextResponse.json(
          {
            success: false,
            message: "You are not allowed to view orders for this store",
            orders: [],
          },
          { status: 403 }
        );
      }

      allowedStoreIds = [session.customerStoreId];
    }

    if (session.role !== "SUPER_ADMIN" && allowedStoreIds.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        ...(session.role === "SUPER_ADMIN" && !requestedStoreId
          ? {}
          : {
              storeId: {
                in: allowedStoreIds,
              },
            }),

        ...(requestedStatus
          ? {
              status: requestedStatus as OrderStatus,
            }
          : {}),

        ...(session.role === "CUSTOMER"
          ? {
              userId: session.userId,
            }
          : {}),
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            whatsapp: true,
            ownerId: true,
          },
        },
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load orders",
        orders: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const body = await request.json();

    const storeId = cleanText(body.storeId);
    const storeSlug = cleanText(body.storeSlug);

    const customer = (body.customer || {}) as IncomingCustomer;
    const incomingItems = Array.isArray(body.items)
      ? (body.items as IncomingOrderItem[])
      : [];

    const paymentMethod = cleanText(body.paymentMethod || "CASH_ON_DELIVERY");

    const customerName = cleanText(customer.name);
    const customerPhone = cleanText(customer.phone);
    const customerCity = cleanText(customer.city);
    const customerAddress = cleanText(customer.address);
    const customerNotes = cleanText(customer.notes);

    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Customer login is required to create an order",
        },
        { status: 401 }
      );
    }

    if (!storeId && !storeSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Store ID or store slug is required",
        },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone || !customerCity || !customerAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name, phone, city, and address are required",
        },
        { status: 400 }
      );
    }

    if (incomingItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order items are required",
        },
        { status: 400 }
      );
    }

    const store = await prisma.store.findFirst({
      where: {
        OR: [
          ...(storeId ? [{ id: storeId }] : []),
          ...(storeSlug ? [{ slug: storeSlug }] : []),
        ],
      },
    });

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found",
        },
        { status: 404 }
      );
    }

    if (store.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message: "Store is currently inactive",
        },
        { status: 403 }
      );
    }

    if (session.customerStoreId !== store.id) {
      return NextResponse.json(
        {
          success: false,
          message: "This customer account is not linked to this store",
        },
        { status: 403 }
      );
    }

    const normalizedItemsMap = new Map<
      string,
      { productId: string; variantId: string | null; quantity: number }
    >();

    for (const item of incomingItems) {
      const productId = cleanText(item.productId);
      const variantId = cleanText(item.variantId) || null;
      const quantity = getSafeQuantity(item.quantity);

      if (!productId || quantity <= 0) continue;

      const key = getLineKey({ productId, variantId });
      const existing = normalizedItemsMap.get(key);

      normalizedItemsMap.set(key, {
        productId,
        variantId,
        quantity: (existing?.quantity || 0) + quantity,
      });
    }

    const normalizedItems = Array.from(normalizedItemsMap.values());

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid order items are required",
        },
        { status: 400 }
      );
    }

    const productIds = Array.from(new Set(normalizedItems.map((item) => item.productId)));

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        storeId: store.id,
      },
      include: {
        productVariants: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Some products are invalid or do not belong to this store",
        },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    const orderLines = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const hasVariants = product.productVariants.length > 0;
      const variant = item.variantId
        ? product.productVariants.find((current) => current.id === item.variantId) || null
        : null;

      if (hasVariants && !variant) {
        throw new Error(`Variant selection is required for product: ${product.name}`);
      }

      const availableQuantity = variant
        ? getVariantAvailableQuantity(variant)
        : Math.max(0, getNumber(product.stock, 0));

      if (availableQuantity < item.quantity) {
        const name = variant ? `${product.name} - ${variant.title}` : product.name;
        throw new Error(`Insufficient stock for product: ${name}`);
      }

      const finalUnitPrice = variant
        ? getNumber(variant.price, getNumber(product.price, 0))
        : getNumber(product.price, 0);

      const compareAtPrice =
        variant && variant.compareAtPrice !== null && variant.compareAtPrice !== undefined
          ? getNumber(variant.compareAtPrice, 0)
          : product.compareAtPrice !== null && product.compareAtPrice !== undefined
            ? getNumber(product.compareAtPrice, 0)
            : null;

      const priceSnapshot = buildPriceSnapshot({
        finalPrice: finalUnitPrice,
        compareAtPrice,
        quantity: item.quantity,
      });

      const unitCost = variant ? variant.costPrice : product.costPrice;
      const safeUnitCost =
        unitCost === null || unitCost === undefined ? null : getNumber(unitCost, 0);

      const profit =
        safeUnitCost === null
          ? null
          : (priceSnapshot.finalPrice - safeUnitCost) * item.quantity;

      return {
        product,
        variant,
        productId: product.id,
        variantId: variant?.id || null,
        quantity: item.quantity,

        originalPrice: priceSnapshot.originalPrice,
        finalPrice: priceSnapshot.finalPrice,
        discountAmount: priceSnapshot.discountAmount,
        discountPercent: priceSnapshot.discountPercent,
        originalTotal: priceSnapshot.originalTotal,
        discountTotal: priceSnapshot.discountTotal,
        finalTotal: priceSnapshot.finalTotal,

        unitCost: safeUnitCost,
        profit,
      };
    });

    const subtotalBeforeDiscount = orderLines.reduce(
      (sum, item) => sum + item.originalTotal,
      0
    );

    const productDiscountTotal = orderLines.reduce(
      (sum, item) => sum + item.discountTotal,
      0
    );

    const subtotalAfterDiscount = orderLines.reduce(
      (sum, item) => sum + item.finalTotal,
      0
    );

    const safeShippingFee = Number(store.shippingFee || 0);
    const shippingFee = Number.isNaN(safeShippingFee) ? 0 : safeShippingFee;
    const total = subtotalAfterDiscount + shippingFee;

    const result = await prisma.$transaction(async (tx) => {
      const createdCustomer = await tx.customer.create({
        data: {
          storeId: store.id,
          userId: session.userId,
          name: customerName,
          phone: customerPhone,
          city: customerCity,
          address: customerAddress,
          notes: customerNotes || null,
        },
      });

      const order = await tx.order.create({
        data: {
          storeId: store.id,
          customerId: createdCustomer.id,
          userId: session.userId,

          payment: paymentMethod,
          paymentMethod,

          subtotalBeforeDiscount,
          productDiscountTotal,
          subtotalAfterDiscount,
          shippingFeeSnapshot: shippingFee,

          total,
          status: OrderStatus.NEW,

          items: {
            create: orderLines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              quantity: line.quantity,

              price: line.finalPrice,
              productName: line.product.name,
              variantTitle: line.variant?.title || null,
              sku: line.variant?.sku || null,

              unitCost: line.unitCost,
              profit: line.profit,
              total: line.finalTotal,

              originalPrice: line.originalPrice,
              finalPrice: line.finalPrice,
              discountAmount: line.discountAmount,
              discountPercent: line.discountPercent,
              originalTotal: line.originalTotal,
              discountTotal: line.discountTotal,
              finalTotal: line.finalTotal,
            })),
          },
        },
        include: {
          store: true,
          customer: true,
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      for (const line of orderLines) {
        if (line.variantId) {
          const quantityBefore = getNumber(line.variant?.quantity, 0);
          const quantityAfter = quantityBefore - line.quantity;

          await tx.productVariant.update({
            where: {
              id: line.variantId,
            },
            data: {
              quantity: {
                decrement: line.quantity,
              },
              availableQuantity: {
                decrement: line.quantity,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              storeId: store.id,
              productId: line.productId,
              variantId: line.variantId,
              type: "ORDER_CREATED",
              quantityBefore,
              quantityChange: -line.quantity,
              quantityAfter,
              reason: "Order created stock deduction",
              note: `Order created for ${line.product.name}${
                line.variant?.title ? ` - ${line.variant.title}` : ""
              }`,
              referenceType: "ORDER",
              referenceId: order.id,
              createdByUserId: session.userId,
            },
          });
        } else {
          const quantityBefore = getNumber(line.product.stock, 0);
          const quantityAfter = quantityBefore - line.quantity;

          await tx.inventoryMovement.create({
            data: {
              storeId: store.id,
              productId: line.productId,
              variantId: null,
              type: "ORDER_CREATED",
              quantityBefore,
              quantityChange: -line.quantity,
              quantityAfter,
              reason: "Order created stock deduction",
              note: `Order created for ${line.product.name}`,
              referenceType: "ORDER",
              referenceId: order.id,
              createdByUserId: session.userId,
            },
          });
        }

        await tx.product.update({
          where: {
            id: line.productId,
          },
          data: {
            stock: {
              decrement: line.quantity,
            },
            availableStock: {
              decrement: line.quantity,
            },
          },
        });
      }

      return {
        order,
        subtotalBeforeDiscount,
        productDiscountTotal,
        subtotalAfterDiscount,
        shippingFee,
        total,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        order: result.order,
        orderId: result.order.id,
        subtotalBeforeDiscount: result.subtotalBeforeDiscount,
        productDiscountTotal: result.productDiscountTotal,
        subtotalAfterDiscount: result.subtotalAfterDiscount,
        shippingFee: result.shippingFee,
        total: result.total,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}