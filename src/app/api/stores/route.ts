import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function normalizeSlug(value: unknown) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeWhatsapp(value: unknown) {
  return cleanText(value)
    .replace(/\s+/g, "")
    .replace(/\+/g, "")
    .replace(/-/g, "")
    .replace(/[()]/g, "");
}

function normalizeColor(value: unknown) {
  const color = cleanText(value);

  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color;
  }

  return "#2563EB";
}

function normalizeNumber(value: unknown) {
  const number = Number(value);

  if (Number.isNaN(number)) return 0;

  return number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session || (session.role !== "MERCHANT" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          message: "Merchant login is required",
          stores: [],
        },
        { status: 401 }
      );
    }

    const stores = await prisma.store.findMany({
      where:
        session.role === "SUPER_ADMIN"
          ? {}
          : {
              ownerId: session.userId,
            },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      stores,
    });
  } catch (error) {
    console.error("Get stores error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load stores",
        stores: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session || (session.role !== "MERCHANT" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          message: "Merchant login is required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = cleanText(body.name);
    const slug = normalizeSlug(body.slug || name);
    const category = cleanText(body.category || "General");
    const theme = cleanText(body.theme || "modern");

    const description = cleanText(body.description);
    const whatsapp = normalizeWhatsapp(body.whatsapp);
    const shippingFee = normalizeNumber(body.shippingFee);
    const shippingPolicy = cleanText(body.shippingPolicy);
    const primaryColor = normalizeColor(body.primaryColor);
    const isActive =
      typeof body.isActive === "boolean" ? body.isActive : true;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Store name is required",
        },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid store slug is required",
        },
        { status: 400 }
      );
    }

    const existingStore = await prisma.store.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingStore) {
      return NextResponse.json(
        {
          success: false,
          message: "Store slug already exists",
        },
        { status: 409 }
      );
    }

    const store = await prisma.store.create({
      data: {
        ownerId: session.userId,
        name,
        slug,
        category,
        theme,
        description: description || null,
        whatsapp: whatsapp || null,
        shippingFee,
        shippingPolicy: shippingPolicy || null,
        primaryColor,
        isActive,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Store created successfully",
        store,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create store error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create store",
      },
      { status: 500 }
    );
  }
}