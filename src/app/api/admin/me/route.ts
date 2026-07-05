import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          admin: null,
        },
        { status: 401 }
      );
    }

    const admin = await prisma.platformAdmin.findUnique({
      where: {
        id: session.adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        {
          success: false,
          admin: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin me error:", error);

    return NextResponse.json(
      {
        success: false,
        admin: null,
      },
      { status: 500 }
    );
  }
}