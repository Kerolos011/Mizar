import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSessionFromRequest } from "@/lib/storefront-customer-session";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizePhone(value: unknown) {
  return cleanText(value).replace(/\s+/g, "");
}

async function findStore(body: any) {
  const storeId = cleanText(body.storeId);
  const storeSlug = cleanText(body.storeSlug || body.slug);

  if (!storeId && !storeSlug) return null;

  return prisma.store.findFirst({
    where: {
      OR: [
        ...(storeId ? [{ id: storeId }] : []),
        ...(storeSlug ? [{ slug: storeSlug }] : []),
      ],
      isActive: true,
      status: "OPEN" as any,
    },
    include: {
      shippingSettings: true,
      taxSettings: true,
      paymentMethods: {
        where: {
          isEnabled: true,
        },
      },
    },
  });
}

function itemProductId(item: any) {
  return cleanText(item.productId || item.id || item.product?.id);
}

function itemVariantId(item: any) {
  return cleanText(item.variantId || item.variant?.id);
}

function lineKey(item: { productId: string; variantId?: string | null }) {
  return `${item.productId}::${item.variantId || ""}`;
}

function variantIsAvailable(variant: any) {
  const status = String(variant?.status || "ACTIVE").toUpperCase();

  return !["OUT_OF_STOCK", "HIDDEN", "DISABLED", "INACTIVE", "ARCHIVED"].includes(status);
}

function productAllowsOverselling(product: any, variant?: any) {
  const policy = String(variant?.inventoryPolicy || product?.inventoryPolicy || "").toUpperCase();

  return product?.trackInventory === false || policy === "CONTINUE_SELLING";
}

function getAvailableQuantity(product: any, variant?: any) {
  if (productAllowsOverselling(product, variant)) return null;

  if (variant) {
    const available = variant.availableQuantity ?? Math.max(0, toNumber(variant.quantity, 0) - toNumber(variant.reservedQuantity, 0));
    return Math.max(0, Math.floor(toNumber(available, 0)));
  }

  const available = product.availableStock ?? Math.max(0, toNumber(product.stock, 0) - toNumber(product.reservedStock, 0));
  return Math.max(0, Math.floor(toNumber(available, 0)));
}

function getQuantityBefore(product: any, variant?: any) {
  return Math.floor(toNumber(variant ? variant.quantity : product.stock, 0));
}

function getCompareAtPrice(product: any, variant?: any) {
  const price = variant ? toNumber(variant.price, toNumber(product.price, 0)) : toNumber(product.discountPrice || product.price, 0);
  const compareAt = variant
    ? toNumber(variant.compareAtPrice ?? product.compareAtPrice, price)
    : toNumber(product.compareAtPrice || product.price, price);

  return compareAt > price ? compareAt : price;
}

function normalizeOptionTitle(variant: any) {
  const title = cleanText(variant?.title);

  if (title) return title;

  const options = variant?.options && typeof variant.options === "object" && !Array.isArray(variant.options)
    ? Object.values(variant.options).filter(Boolean).join(" / ")
    : "";

  return cleanText(options) || null;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const store = await findStore(body);
    const session = getCustomerSessionFromRequest(request);

    if (!store) {
      return jsonError("المتجر غير موجود أو غير متاح", 404);
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const normalizedItemsMap = new Map<string, { productId: string; variantId: string | null; quantity: number }>();

    for (const item of rawItems) {
      const productId = itemProductId(item);
      const variantId = itemVariantId(item) || null;
      const quantity = Math.max(1, Math.floor(toNumber(item.quantity, 1)));

      if (!productId) continue;

      const key = lineKey({ productId, variantId });
      const existing = normalizedItemsMap.get(key);

      normalizedItemsMap.set(key, {
        productId,
        variantId,
        quantity: (existing?.quantity || 0) + quantity,
      });
    }

    const normalizedItems = Array.from(normalizedItemsMap.values());

    if (!normalizedItems.length) {
      return jsonError("السلة فارغة. لا يمكن إنشاء طلب بدون منتجات.");
    }

    const productIds = Array.from(new Set(normalizedItems.map((item) => item.productId)));

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        storeId: store.id,
        status: "ACTIVE" as any,
      },
      include: {
        productVariants: true,
      },
    });

    if (products.length !== productIds.length) {
      return jsonError("بعض المنتجات لم تعد متاحة داخل المتجر. راجع السلة قبل إتمام الطلب.");
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    const orderItems = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("منتج غير موجود داخل الطلب");
      }

      const variants = Array.isArray(product.productVariants) ? product.productVariants : [];
      const productHasVariants = variants.length > 0;
      const variant = item.variantId
        ? variants.find((row: any) => row.id === item.variantId) || null
        : null;

      if (productHasVariants && !variant) {
        throw new Error(`يجب اختيار المقاس / اللون للمنتج: ${product.name}`);
      }

      if (variant && !variantIsAvailable(variant)) {
        throw new Error(`الاختيار غير متاح حاليًا: ${product.name} - ${normalizeOptionTitle(variant) || ""}`);
      }

      const availableQuantity = getAvailableQuantity(product, variant || undefined);

      if (availableQuantity !== null && availableQuantity < item.quantity) {
        const name = variant ? `${product.name} - ${normalizeOptionTitle(variant)}` : product.name;
        throw new Error(`الكمية المطلوبة غير متاحة للمنتج: ${name}. المتاح الآن ${availableQuantity} فقط.`);
      }

      const price = variant
        ? toNumber(variant.price, toNumber(product.price, 0))
        : toNumber(
            product.discountPrice && product.discountPrice > 0
              ? product.discountPrice
              : product.price,
            0,
          );

      const originalPrice = getCompareAtPrice(product, variant || undefined);
      const total = price * item.quantity;
      const originalTotal = originalPrice * item.quantity;

      return {
        product,
        variant,
        productId: product.id,
        variantId: variant?.id || null,
        quantity: item.quantity,
        price,
        productName: product.name,
        variantTitle: variant ? normalizeOptionTitle(variant) : null,
        sku: variant?.sku || null,
        total,
        originalPrice,
        finalPrice: price,
        discountAmount: Math.max(0, originalPrice - price),
        discountPercent: originalPrice > price ? ((originalPrice - price) / originalPrice) * 100 : 0,
        originalTotal,
        discountTotal: Math.max(0, originalTotal - total),
        finalTotal: total,
        quantityBefore: getQuantityBefore(product, variant || undefined),
      };
    });

    const customerName = cleanText(body.customer?.name || body.name);
    const customerPhone = normalizePhone(body.customer?.phone || body.phone);
    const customerEmail = cleanText(body.customer?.email || body.email).toLowerCase();
    const customerAddress = cleanText(body.customer?.address || body.address);
    const customerCity = cleanText(body.customer?.city || body.city);

    if (!customerName || !customerPhone || !customerAddress) {
      return jsonError("الاسم ورقم الموبايل والعنوان مطلوبون لإتمام الطلب");
    }

    const requestedPaymentMethod = cleanText(
      body.paymentMethod || body.payment || "CASH_ON_DELIVERY",
    ).toUpperCase();

    const enabledPaymentMethods = store.paymentMethods.map((method) =>
      String(method.type).toUpperCase(),
    );

    const paymentMethod =
      enabledPaymentMethods.length === 0
        ? requestedPaymentMethod
        : enabledPaymentMethods.includes(requestedPaymentMethod)
          ? requestedPaymentMethod
          : "";

    if (!paymentMethod) {
      return jsonError("طريقة الدفع المختارة غير مفعلة في هذا المتجر");
    }

    let customer =
      session?.storeId === store.id
        ? await prisma.customer.findFirst({
            where: {
              id: session.customerId,
              storeId: store.id,
            },
          })
        : null;

    if (!customer && customerEmail) {
      customer = await prisma.customer.findFirst({
        where: {
          storeId: store.id,
          email: customerEmail,
        },
      });
    }

    const subtotalBeforeDiscount = orderItems.reduce(
      (sum, item) => sum + item.originalTotal,
      0,
    );

    const subtotalAfterDiscount = orderItems.reduce(
      (sum, item) => sum + item.finalTotal,
      0,
    );

    const productDiscountTotal = Math.max(
      0,
      subtotalBeforeDiscount - subtotalAfterDiscount,
    );

    const freeThreshold = toNumber(store.shippingSettings?.freeShippingThreshold, 0);

    const shippingCost =
      subtotalAfterDiscount <= 0
        ? 0
        : freeThreshold > 0 && subtotalAfterDiscount >= freeThreshold
          ? 0
          : toNumber(store.shippingSettings?.shippingCost ?? store.shippingFee, 0);

    const taxPercentage = toNumber(store.taxSettings?.taxPercentage, 0);
    const pricesIncludeTax = Boolean(store.taxSettings?.pricesIncludeTax);
    const taxAmount = pricesIncludeTax ? 0 : (subtotalAfterDiscount * taxPercentage) / 100;

    const total = subtotalAfterDiscount + shippingCost + taxAmount;

    const result = await prisma.$transaction(async (tx) => {
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            storeId: store.id,
            userId: session?.storeId === store.id ? session.userId : null,
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null,
            address: customerAddress,
            city: customerCity || null,
          },
        });
      } else {
        customer = await tx.customer.update({
          where: {
            id: customer.id,
          },
          data: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail || customer.email,
            address: customerAddress,
            city: customerCity || customer.city,
            userId: customer.userId || (session?.storeId === store.id ? session.userId : null),
          },
        });
      }

      const order = await tx.order.create({
        data: {
          storeId: store.id,
          customerId: customer.id,
          userId: session?.storeId === store.id ? session.userId : null,

          subtotalBeforeDiscount,
          productDiscountTotal,
          subtotalAfterDiscount,
          shippingFeeSnapshot: shippingCost,
          total,

          payment: paymentMethod === "CASH_ON_DELIVERY" ? "COD" : paymentMethod,
          paymentMethod,

          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              productName: item.productName,
              variantTitle: item.variantTitle,
              sku: item.sku,
              total: item.total,
              originalPrice: item.originalPrice,
              finalPrice: item.finalPrice,
              discountAmount: item.discountAmount,
              discountPercent: item.discountPercent,
              originalTotal: item.originalTotal,
              discountTotal: item.discountTotal,
              finalTotal: item.finalTotal,
            })),
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      for (const item of orderItems) {
        const quantityAfter = item.quantityBefore - item.quantity;
        const movementData: any = {
          storeId: store.id,
          productId: item.productId,
          variantId: item.variantId,
          type: "ORDER_CREATED",
          quantityBefore: item.quantityBefore,
          quantityChange: -item.quantity,
          quantityAfter,
          reason: "Order created stock deduction",
          note: item.variantTitle ? `${item.productName} - ${item.variantTitle}` : item.productName,
          referenceType: "ORDER",
          referenceId: order.id,
          createdByUserId: session?.userId || store.ownerId,
        };

        if (item.variantId) {
          const variantData: any = {
            quantity: {
              decrement: item.quantity,
            },
            availableQuantity: {
              decrement: item.quantity,
            },
          };

          if (quantityAfter <= 0 && !productAllowsOverselling(item.product, item.variant)) {
            variantData.status = "OUT_OF_STOCK" as any;
          }

          await tx.productVariant.update({
            where: {
              id: item.variantId,
            },
            data: variantData,
          });
        }

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
          data: movementData,
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الطلب بنجاح",
      order: result,
      totals: {
        subtotalBeforeDiscount,
        subtotalAfterDiscount,
        productDiscountTotal,
        shippingCost,
        taxAmount,
        total,
      },
    });
  } catch (error) {
    console.error("STOREFRONT_CREATE_ORDER_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "حدث خطأ أثناء إنشاء الطلب",
      },
      { status: error instanceof Error ? 400 : 500 },
    );
  }
}
