import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function getReviewStatus(value: unknown) {
  const status = cleanText(value);

  const allowed = ["PENDING", "APPROVED", "REJECTED", "HIDDEN", "SPAM"];

  if (allowed.includes(status)) return status;

  return "";
}

async function updateProductRating(productId: string) {
  const approvedReviews = await prisma.productReview.findMany({
    where: {
      productId,
      status: "APPROVED",
    },
    select: {
      rating: true,
    },
  });

  const ratingCount = approvedReviews.length;
  const ratingAverage =
    ratingCount > 0
      ? approvedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        ratingCount
      : 0;

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      ratingAverage,
      ratingCount,
    },
  });

  return {
    ratingAverage,
    ratingCount,
  };
}

async function getReviewWithProduct(reviewId: string) {
  return prisma.productReview.findUnique({
    where: {
      id: reviewId,
    },
    include: {
      product: {
        include: {
          store: {
            select: {
              id: true,
              ownerId: true,
              name: true,
              displayName: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

function canManageReview(
  review: Awaited<ReturnType<typeof getReviewWithProduct>>,
  session: {
    userId: string;
    role: "MERCHANT" | "SUPER_ADMIN" | "CUSTOMER";
  }
) {
  if (!review) return false;

  if (session.role === "SUPER_ADMIN") return true;

  if (session.role === "MERCHANT") {
    return review.product.store.ownerId === session.userId;
  }

  return false;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (
      !session?.userId ||
      (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول كتاجر",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const reviewId = cleanText(id);

    if (!reviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم التقييم مطلوب",
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    const nextStatus = getReviewStatus(body?.status);
    const merchantReply = cleanText(body?.merchantReply);

    if (!nextStatus && !Object.prototype.hasOwnProperty.call(body || {}, "merchantReply")) {
      return NextResponse.json(
        {
          success: false,
          message: "لا توجد بيانات صالحة للتحديث",
        },
        { status: 400 }
      );
    }

    const existingReview = await getReviewWithProduct(reviewId);

    if (!existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "التقييم غير موجود",
        },
        { status: 404 }
      );
    }

    if (!canManageReview(existingReview, session)) {
      return NextResponse.json(
        {
          success: false,
          message: "لا تملك صلاحية تعديل هذا التقييم",
        },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (nextStatus) {
      updateData.status = nextStatus;
    }

    if (Object.prototype.hasOwnProperty.call(body || {}, "merchantReply")) {
      updateData.merchantReply = merchantReply || null;
      updateData.merchantReplyAt = merchantReply ? new Date() : null;
    }

    const updatedReview = await prisma.productReview.update({
      where: {
        id: reviewId,
      },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            ratingAverage: true,
            ratingCount: true,
          },
        },
      },
    });

    const ratingStats = await updateProductRating(existingReview.productId);

    return NextResponse.json({
      success: true,
      message: "تم تحديث التقييم بنجاح",
      review: updatedReview,
      ratingStats,
    });
  } catch (error) {
    console.error("Dashboard review PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحديث التقييم",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (
      !session?.userId ||
      (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول كتاجر",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const reviewId = cleanText(id);

    if (!reviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم التقييم مطلوب",
        },
        { status: 400 }
      );
    }

    const existingReview = await getReviewWithProduct(reviewId);

    if (!existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "التقييم غير موجود",
        },
        { status: 404 }
      );
    }

    if (!canManageReview(existingReview, session)) {
      return NextResponse.json(
        {
          success: false,
          message: "لا تملك صلاحية حذف هذا التقييم",
        },
        { status: 403 }
      );
    }

    await prisma.productReview.delete({
      where: {
        id: reviewId,
      },
    });

    const ratingStats = await updateProductRating(existingReview.productId);

    return NextResponse.json({
      success: true,
      message: "تم حذف التقييم بنجاح",
      ratingStats,
    });
  } catch (error) {
    console.error("Dashboard review DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء حذف التقييم",
      },
      { status: 500 }
    );
  }
}