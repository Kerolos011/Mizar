import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

async function getCurrentMerchantStore(
  request: NextRequest,
  storeIdFromQuery?: string | null
) {
  const session = await getSessionFromRequest(request);

  if (!session?.userId) {
    return {
      ok: false,
      status: 401,
      message: "يجب تسجيل الدخول أولًا",
      session: null,
      store: null,
    };
  }

  if (session.role !== UserRole.MERCHANT && session.role !== UserRole.SUPER_ADMIN) {
    return {
      ok: false,
      status: 403,
      message: "هذه الصفحة مخصصة للتجار فقط",
      session,
      store: null,
    };
  }

  const where =
    session.role === UserRole.SUPER_ADMIN && storeIdFromQuery
      ? { id: storeIdFromQuery }
      : { ownerId: session.userId };

  const store = await prisma.store.findFirst({
    where,
    select: {
      id: true,
      name: true,
      displayName: true,
      slug: true,
      ownerId: true,
    },
  });

  if (!store) {
    return {
      ok: false,
      status: 404,
      message: "لا يوجد متجر مرتبط بحسابك",
      session,
      store: null,
    };
  }

  return {
    ok: true,
    status: 200,
    message: "",
    session,
    store,
  };
}

function getReviewStatus(value: string) {
  const allowed = ["PENDING", "APPROVED", "REJECTED", "HIDDEN", "SPAM"];

  if (allowed.includes(value)) return value;

  return "";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const storeId = searchParams.get("storeId");
    const q = cleanText(searchParams.get("q"));
    const status = getReviewStatus(cleanText(searchParams.get("status")));
    const ratingValue = Number(searchParams.get("rating") || 0);
    const rating =
      Number.isFinite(ratingValue) && ratingValue >= 1 && ratingValue <= 5
        ? Math.floor(ratingValue)
        : 0;

    const ownership = await getCurrentMerchantStore(request, storeId);

    if (!ownership.ok || !ownership.store) {
      return NextResponse.json(
        {
          success: false,
          message: ownership.message,
          redirectTo:
            ownership.status === 401
              ? "/merchant/login?next=/dashboard/reviews"
              : "/merchant/welcome",
        },
        { status: ownership.status }
      );
    }

    const where: any = {
      storeId: ownership.store.id,
    };

    if (status) {
      where.status = status;
    }

    if (rating) {
      where.rating = rating;
    }

    const reviews = await prisma.productReview.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            ratingAverage: true,
            ratingCount: true,
            media: {
              orderBy: {
                sortOrder: "asc",
              },
              take: 1,
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 300,
    });

    const normalizedReviews = reviews.map((review) => {
      const productImage =
        review.product.media?.find((item) => item.type === "IMAGE")?.url ||
        review.product.imageUrl ||
        null;

      const customerName =
        review.displayName ||
        review.customer?.name ||
        review.user?.name ||
        "عميل";

      return {
        id: review.id,
        storeId: review.storeId,
        productId: review.productId,
        userId: review.userId,
        customerId: review.customerId,

        rating: review.rating,
        title: review.title,
        comment: review.body || "",
        body: review.body || "",
        status: review.status,

        isVerifiedPurchase: review.verifiedPurchase,
        verifiedPurchase: review.verifiedPurchase,
        orderId: review.orderId,

        customerName,
        displayName: customerName,
        customerEmail: review.user?.email || null,
        customerPhone: review.customer?.phone || review.user?.phone || null,
        isAnonymous: review.isAnonymous,

        helpfulCount: review.helpfulCount,
        reportCount: review.reportCount,

        merchantReply: review.merchantReply,
        merchantReplyAt: review.merchantReplyAt,

        adminReply: review.adminReply,
        adminReplyAt: review.adminReplyAt,

        product: {
          id: review.product.id,
          name: review.product.name,
          imageUrl: productImage,
          ratingAverage: review.product.ratingAverage,
          ratingCount: review.product.ratingCount,
        },

        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });

    const filteredReviews = q
      ? normalizedReviews.filter((review) => {
          const searchText = [
            review.product.name,
            review.customerName,
            review.customerEmail,
            review.customerPhone,
            review.title,
            review.comment,
            review.status,
            review.orderId,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchText.includes(q.toLowerCase());
        })
      : normalizedReviews;

    const allReviewsForStats = await prisma.productReview.findMany({
      where: {
        storeId: ownership.store.id,
      },
      select: {
        id: true,
        rating: true,
        status: true,
      },
    });

    const approvedReviews = allReviewsForStats.filter(
      (review) => review.status === "APPROVED"
    );

    const stats = {
      total: allReviewsForStats.length,
      pending: allReviewsForStats.filter((review) => review.status === "PENDING")
        .length,
      approved: approvedReviews.length,
      rejected: allReviewsForStats.filter(
        (review) => review.status === "REJECTED"
      ).length,
      hidden: allReviewsForStats.filter((review) => review.status === "HIDDEN")
        .length,
      spam: allReviewsForStats.filter((review) => review.status === "SPAM")
        .length,
      averageRating:
        allReviewsForStats.length > 0
          ? allReviewsForStats.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0
            ) / allReviewsForStats.length
          : 0,
      approvedAverageRating:
        approvedReviews.length > 0
          ? approvedReviews.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0
            ) / approvedReviews.length
          : 0,
    };

    return NextResponse.json({
      success: true,
      store: ownership.store,
      stats,
      reviews: filteredReviews,
    });
  } catch (error) {
    console.error("Dashboard reviews GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحميل التقييمات",
        reviews: [],
      },
      { status: 500 }
    );
  }
}