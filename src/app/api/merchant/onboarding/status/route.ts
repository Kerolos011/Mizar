import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولًا",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        firstName: true,
        email: true,
        role: true,
        merchantOnboardingCompleted: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            slug: true,
            onboardingCompleted: true,
          },
          take: 1,
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
          message: "الحساب غير موجود",
        },
        { status: 404 }
      );
    }

    if (user.role !== UserRole.MERCHANT) {
      return NextResponse.json(
        {
          success: false,
          message: "هذه الصفحة مخصصة للتجار فقط",
        },
        { status: 403 }
      );
    }

    const store = user.ownedStores[0] || null;
    const hasStore = Boolean(store?.id);
    const storeCompleted = Boolean(store?.onboardingCompleted);

    let redirectTo = "/merchant/welcome";

    if (hasStore && storeCompleted) {
      redirectTo = "/dashboard";
    } else if (hasStore && !storeCompleted) {
      redirectTo = "/merchant/onboarding/store";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
        merchantOnboardingCompleted: user.merchantOnboardingCompleted,
      },
      store,
      hasStore,
      storeCompleted,
      redirectTo,
    });
  } catch (error) {
    console.error("Merchant onboarding status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء قراءة حالة الحساب",
      },
      { status: 500 }
    );
  }
}