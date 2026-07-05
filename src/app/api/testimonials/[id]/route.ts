import { NextRequest, NextResponse } from "next/server";
import { TestimonialStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeRating(value: unknown) {
  const rating = Number(value || 5);

  if (!Number.isFinite(rating)) return 5;
  if (rating < 1) return 1;
  if (rating > 5) return 5;

  return Math.round(rating);
}

function normalizeStatus(value: unknown) {
  const status = String(value || "").trim();

  if (
    status === TestimonialStatus.PENDING ||
    status === TestimonialStatus.APPROVED ||
    status === TestimonialStatus.REJECTED
  ) {
    return status;
  }

  return null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminSession = getAdminSessionFromRequest(request);

    if (!adminSession) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بتعديل آراء التجار",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => null);

    const updateData: {
      name?: string;
      businessType?: string | null;
      message?: string;
      rating?: number;
      status?: TestimonialStatus;
      isFeatured?: boolean;
    } = {};

    if (typeof body?.name === "string") {
      const name = body.name.trim();

      if (name) {
        updateData.name = name;
      }
    }

    if (typeof body?.businessType === "string") {
      updateData.businessType = body.businessType.trim() || null;
    }

    if (typeof body?.message === "string") {
      const message = body.message.trim();

      if (message.length < 10) {
        return NextResponse.json(
          {
            success: false,
            message: "التعليق يجب ألا يقل عن 10 أحرف",
          },
          { status: 400 }
        );
      }

      updateData.message = message;
    }

    if (body?.rating !== undefined) {
      updateData.rating = normalizeRating(body.rating);
    }

    if (body?.status !== undefined) {
      const status = normalizeStatus(body.status);

      if (!status) {
        return NextResponse.json(
          {
            success: false,
            message: "حالة التعليق غير صحيحة",
          },
          { status: 400 }
        );
      }

      updateData.status = status;

      if (status === TestimonialStatus.REJECTED) {
        updateData.isFeatured = false;
      }
    }

    if (typeof body?.isFeatured === "boolean") {
      updateData.isFeatured = body.isFeatured;

      if (body.isFeatured) {
        updateData.status = TestimonialStatus.APPROVED;
      }
    }

    const testimonial = await prisma.testimonial.update({
      where: {
        id,
      },
      data: updateData,
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
      testimonial,
    });
  } catch (error) {
    console.error("Update testimonial error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تعديل التعليق",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const adminSession = getAdminSessionFromRequest(request);

    if (!adminSession) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بحذف آراء التجار",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await prisma.testimonial.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف التعليق بنجاح",
    });
  } catch (error) {
    console.error("Delete testimonial error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حذف التعليق",
      },
      { status: 500 }
    );
  }
}