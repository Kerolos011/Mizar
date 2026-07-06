import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

async function enrichOrderItems(order: any) {
  const items = Array.isArray(order?.items) ? order.items : [];

  if (!items.length) return order;

  const productIds = Array.from(
    new Set(items.map((item: any) => cleanText(item.productId)).filter(Boolean)),
  ) as string[];
  const variantIds = Array.from(
    new Set(items.map((item: any) => cleanText(item.variantId)).filter(Boolean)),
  ) as string[];

  const [products, variants] = await Promise.all([
    productIds.length
      ? prisma.product.findMany({
          where: {
            id: {
              in: productIds,
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        })
      : Promise.resolve([]),
    variantIds.length
      ? prisma.productVariant.findMany({
          where: {
            id: {
              in: variantIds,
            },
          },
          select: {
            id: true,
            productId: true,
            title: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const productMap = new Map(products.map((product: any) => [product.id, product]));
  const variantMap = new Map(variants.map((variant: any) => [variant.id, variant]));

  return {
    ...order,
    items: items.map((item: any) => ({
      ...item,
      product: productMap.get(item.productId) || item.product || null,
      variant: item.variantId ? variantMap.get(item.variantId) || item.variant || null : null,
    })),
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const orderId = cleanText(id);
    const { searchParams } = new URL(request.url);
    const storeSlug = cleanText(searchParams.get("storeSlug"));
    const storeId = cleanText(searchParams.get("storeId"));
    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الطلب مطلوب",
        },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        store: true,
        customer: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير موجود",
        },
        { status: 404 },
      );
    }

    if (storeId && order.storeId !== storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير تابع لهذا المتجر",
        },
        { status: 403 },
      );
    }

    if (storeSlug && order.store?.slug !== storeSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير تابع لهذا المتجر",
        },
        { status: 403 },
      );
    }

    let safeOrder: any = order;

    try {
      safeOrder = await enrichOrderItems(order);
    } catch (enrichError) {
      console.warn("STOREFRONT_TRACK_ORDER_ENRICH_WARNING", enrichError);
      safeOrder = order;
    }

    return NextResponse.json(
      {
        success: true,
        order: safeOrder,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("STOREFRONT_TRACK_ORDER_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "تعذر تحميل بيانات الطلب الآن. حاول مرة أخرى أو تواصل مع المتجر.",
      },
      { status: 500 },
    );
  }
}
