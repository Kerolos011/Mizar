import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Customer login is required",
          orders: [],
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storeSlug = String(searchParams.get("storeSlug") || "").trim();

    if (!storeSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Store slug is required",
          orders: [],
        },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        slug: storeSlug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found",
          orders: [],
        },
        { status: 404 }
      );
    }

    if (session.customerStoreId !== store.id) {
      return NextResponse.json(
        {
          success: false,
          message: "This customer account is not linked to this store",
          orders: [],
        },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        storeId: store.id,
        userId: session.userId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            whatsapp: true,
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
    });

    return NextResponse.json({
      success: true,
      store,
      orders,
    });
  } catch (error) {
    console.error("Customer orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load customer orders",
        orders: [],
      },
      { status: 500 }
    );
  }
}