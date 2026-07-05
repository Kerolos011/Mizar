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

    if (session.role !== UserRole.MERCHANT) {
      return NextResponse.json(
        {
          success: false,
          message: "هذه الصفحة مخصصة للتجار فقط",
        },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        email: true,
        phone: true,
        role: true,
        businessType: true,
        merchantOnboardingCompleted: true,
        ownedStores: {
          take: 1,
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            name: true,
            displayName: true,
            slug: true,
            category: true,
            description: true,
            tagline: true,
            whatsapp: true,
            contactPhone: true,
            contactEmail: true,
            logoUrl: true,
            coverUrl: true,
            city: true,
            area: true,
            address: true,
            facebookUrl: true,
            instagramUrl: true,
            tiktokUrl: true,
            websiteUrl: true,
            template: true,
            templateConfig: true,
            productSchema: true,
            theme: true,
            primaryColor: true,
            accentColor: true,
            layoutPreset: true,
            onboardingCompleted: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
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

    const store = user.ownedStores[0] || null;

    if (!store) {
      return NextResponse.json({
        success: true,
        hasStore: false,
        redirectTo: "/merchant/welcome",
        user: {
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          businessType: user.businessType,
          merchantOnboardingCompleted: user.merchantOnboardingCompleted,
        },
        store: null,
      });
    }

    if (!store.onboardingCompleted) {
      return NextResponse.json({
        success: true,
        hasStore: true,
        redirectTo: "/merchant/onboarding/store",
        user: {
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          businessType: user.businessType,
          merchantOnboardingCompleted: user.merchantOnboardingCompleted,
        },
        store,
      });
    }

    return NextResponse.json({
      success: true,
      hasStore: true,
      redirectTo: "/dashboard",
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessType: user.businessType,
        merchantOnboardingCompleted: user.merchantOnboardingCompleted,
      },
      store,
      storeUrl: `/store/${store.slug}`,
    });
  } catch (error) {
    console.error("Current merchant store error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل بيانات المتجر",
      },
      { status: 500 }
    );
  }
}