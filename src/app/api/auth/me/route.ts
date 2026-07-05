import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
          user: null,
        },
        { status: 401 }
      );
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
        customerStoreId: true,
        customerStore: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        ownedStores: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load current user",
        user: null,
      },
      { status: 500 }
    );
  }
}