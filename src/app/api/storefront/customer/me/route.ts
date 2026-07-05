import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCustomerSessionFromRequest } from "@/lib/storefront-customer-session";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

export async function GET(request: NextRequest) {
  try {
    const session = getCustomerSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        store: null,
        user: null,
        customer: null,
      });
    }

    const storeSlug = cleanText(request.nextUrl.searchParams.get("storeSlug"));
    const storeId = cleanText(request.nextUrl.searchParams.get("storeId"));

    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: session.storeId },
          ...(storeId ? [{ id: storeId }] : []),
          ...(storeSlug ? [{ slug: storeSlug }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        status: true,
      },
    });

    if (!store || store.id !== session.storeId || !store.isActive || store.status !== "OPEN") {
      return NextResponse.json({
        success: true,
        authenticated: false,
        store: null,
        user: null,
        customer: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const customer = await prisma.customer.findFirst({
      where: {
        id: session.customerId,
        storeId: store.id,
      },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!user || user.role !== UserRole.CUSTOMER || !customer) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        store: null,
        user: null,
        customer: null,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
      },
      user: {
        ...user,
        customerId: customer.id,
        storeId: store.id,
      },
      customer: {
        ...customer,
        user,
      },
    });
  } catch (error) {
    console.error("STOREFRONT_CUSTOMER_ME_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل حساب العميل",
      },
      { status: 500 },
    );
  }
}