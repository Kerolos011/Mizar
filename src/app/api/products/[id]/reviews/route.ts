import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function toRating(value: unknown) {
  const rating = Number(value);

  if (!Number.isFinite(rating)) return 0;

  return Math.min(5, Math.max(1, Math.floor(rating)));
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
      ? approvedReviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0
        ) / ratingCount
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

async function hasVerifiedPurchase(userId: string, productId: string) {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: {
          not: "CANCELLED",
        },
      },
    },
    select: {
      orderId: true,
    },
    orderBy: {
      order: {
        createdAt: "desc",
      },
    },
  });

  return {
    verified: Boolean(orderItem),
    orderId: orderItem?.orderId || null,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productId = cleanText(id);

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم المنتج مطلوب",
          reviews: [],
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        name: true,
        ratingAverage: true,
        ratingCount: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "المنتج غير موجود",
          reviews: [],
        },
        { status: 404 }
      );
    }

    const reviews = await prisma.productReview.findMany({
      where: {
        productId,
        status: "APPROVED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const normalizedReviews = reviews.map((review) => ({
      id: review.id,
      storeId: review.storeId,
      productId: review.productId,
      userId: review.userId,
      customerId: review.customerId,

      rating: review.rating,
      title: review.title,
      comment: review.body || "",

      status: review.status,

      isVerifiedPurchase: review.verifiedPurchase,
      verifiedPurchase: review.verifiedPurchase,
      orderId: review.orderId,

      customerName: review.displayName || "عميل",
      displayName: review.displayName || "عميل",
      isAnonymous: review.isAnonymous,

      helpfulCount: review.helpfulCount,
      reportCount: review.reportCount,

      merchantReply: review.merchantReply,
      merchantReplyAt: review.merchantReplyAt,

      adminReply: review.adminReply,
      adminReplyAt: review.adminReplyAt,

      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    }));

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        ratingAverage: product.ratingAverage,
        ratingCount: product.ratingCount,
      },
      ratingDistribution,
      reviews: normalizedReviews,
    });
  } catch (error) {
    console.error("Product reviews GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحميل تقييمات المنتج",
        reviews: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.userId || session.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول كعميل لإضافة تقييم",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const productId = cleanText(id);

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم المنتج مطلوب",
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    const rating = toRating(body?.rating);
    const title = cleanText(body?.title);
    const comment = cleanText(body?.comment);
    const isAnonymous = Boolean(body?.isAnonymous);

    if (!rating) {
      return NextResponse.json(
        {
          success: false,
          message: "التقييم يجب أن يكون من 1 إلى 5",
        },
        { status: 400 }
      );
    }

    if (!comment || comment.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "اكتب تعليق مناسب للتقييم",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            displayName: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "المنتج غير موجود",
        },
        { status: 404 }
      );
    }

    if (session.customerStoreId && session.customerStoreId !== product.storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا العميل غير مرتبط بهذا المتجر",
        },
        { status: 403 }
      );
    }

    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId,
        userId: session.userId,
      },
      select: {
        id: true,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "لقد قمت بتقييم هذا المنتج من قبل",
        },
        { status: 409 }
      );
    }

    const verifiedPurchase = await hasVerifiedPurchase(session.userId, productId);

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    const customer = await prisma.customer.findFirst({
      where: {
        userId: session.userId,
        storeId: product.storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    const displayName = isAnonymous
      ? "عميل"
      : customer?.name || user?.name || "عميل";

    const review = await prisma.productReview.create({
      data: {
        storeId: product.storeId,
        productId,
        userId: session.userId,
        customerId: customer?.id || null,

        rating,
        title: title || null,
        body: comment,

        status: "PENDING",

        displayName,
        isAnonymous,

        verifiedPurchase: verifiedPurchase.verified,
        orderId: verifiedPurchase.orderId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم إرسال تقييمك بنجاح، وسيظهر بعد مراجعته من التاجر",
        review: {
          ...review,
          comment: review.body,
          customerName: review.displayName || "عميل",
          isVerifiedPurchase: review.verifiedPurchase,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product reviews POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إرسال التقييم",
      },
      { status: 500 }
    );
  }
}