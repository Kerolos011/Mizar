import { NextRequest, NextResponse } from "next/server";
import { TestimonialStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import { getAdminSessionFromRequest } from "@/lib/admin-session";

export const runtime = "nodejs";

function normalizeRating(value: unknown) {
  const rating = Number(value || 5);

  if (!Number.isFinite(rating)) return 5;
  if (rating < 1) return 1;
  if (rating > 5) return 5;

  return Math.round(rating);
}

export async function GET(request: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(request);

    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get("scope") || "public";
    const limitParam = Number(searchParams.get("limit") || 12);

    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 100)
      : 12;

    const isAdminRequest = scope === "all";

    if (isAdminRequest && !adminSession) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بعرض آراء التجار",
        },
        { status: 401 }
      );
    }

    const where = isAdminRequest
      ? {}
      : {
          status: TestimonialStatus.APPROVED,
          isFeatured: true,
        };

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error("Get testimonials error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل آراء التجار",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session || session.role !== "MERCHANT") {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول كتاجر لإرسال تعليق",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const message = String(body?.message || "").trim();
    const businessType = String(body?.businessType || "").trim();
    const rating = normalizeRating(body?.rating);

    if (!message || message.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "من فضلك اكتب تعليق واضح لا يقل عن 10 أحرف",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    if (!user || user.role !== "MERCHANT") {
      return NextResponse.json(
        {
          success: false,
          message: "الحساب غير مؤهل لإرسال تعليق كتاجر",
        },
        { status: 403 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        merchantId: user.id,
        name: user.name,
        businessType: businessType || "تاجر على ميزار",
        rating,
        message,
        status: TestimonialStatus.PENDING,
        isFeatured: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم استلام تعليقك وسيظهر بعد مراجعته من إدارة المنصة",
      testimonial,
    });
  } catch (error) {
    console.error("Create testimonial error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إرسال التعليق",
      },
      { status: 500 }
    );
  }
}