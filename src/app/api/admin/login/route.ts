import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  createAdminSessionToken,
  setAdminSessionCookie,
} from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "من فضلك أدخل البريد الإلكتروني وكلمة المرور",
        },
        { status: 400 }
      );
    }

    const admin = await prisma.platformAdmin.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الدخول غير صحيحة",
        },
        { status: 401 }
      );
    }

    const validPassword = await verifyPassword(password, admin.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الدخول غير صحيحة",
        },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken({
      adminId: admin.id,
      name: admin.name,
      email: admin.email,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });

    setAdminSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول",
      },
      { status: 500 }
    );
  }
}