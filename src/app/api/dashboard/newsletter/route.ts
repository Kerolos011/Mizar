import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function isNewsletterSetupError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");

  return (
    message.includes("NewsletterSubscriber") ||
    message.includes("newsletterSubscriber") ||
    message.includes("does not exist") ||
    message.includes("P2021") ||
    message.includes("P2022") ||
    message.includes("not a function") ||
    message.includes("undefined")
  );
}

function buildErrorMessage(error: unknown) {
  const details = error instanceof Error ? error.message : String(error || "");

  if (isNewsletterSetupError(error)) {
    return {
      message:
        "جدول مشتركي النشرة البريدية غير جاهز. شغل npx prisma migrate dev ثم npx prisma generate وبعدها أعد تشغيل السيرفر.",
      details,
    };
  }

  return {
    message: "Failed to load newsletter subscribers",
    details,
  };
}

async function getAllowedStore(storeId: string, userId: string, role: string) {
  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      ownerId: true,
    },
  });

  if (!store) return null;
  if (role === "SUPER_ADMIN") return store;
  if (store.ownerId !== userId) return null;

  return store;
}

async function listSubscribers(storeId: string) {
  const newsletterModel = (prisma as any).newsletterSubscriber;

  if (newsletterModel?.findMany) {
    return await newsletterModel.findMany({
      where: {
        storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        source: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return await prisma.$queryRawUnsafe<any[]>(
    `SELECT "id", "email", "source", "status", "createdAt", "updatedAt"
     FROM "NewsletterSubscriber"
     WHERE "storeId" = $1
     ORDER BY "createdAt" DESC`,
    storeId,
  );
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session || (session.role !== "MERCHANT" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          message: "Merchant login is required",
        },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const storeId = cleanText(url.searchParams.get("storeId"));

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Store ID is required",
        },
        { status: 400 },
      );
    }

    const store = await getAllowedStore(storeId, session.userId, session.role);

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found or you are not allowed to access it",
        },
        { status: 403 },
      );
    }

    const subscribers = await listSubscribers(store.id);

    return NextResponse.json({
      success: true,
      store,
      subscribers,
      count: subscribers.length,
    });
  } catch (error) {
    console.error("Dashboard newsletter list error:", error);

    const errorPayload = buildErrorMessage(error);

    return NextResponse.json(
      {
        success: false,
        message: errorPayload.message,
        details: process.env.NODE_ENV !== "production" ? errorPayload.details : undefined,
      },
      { status: 500 },
    );
  }
}
