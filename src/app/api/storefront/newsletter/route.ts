import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function normalizeEmail(value: unknown) {
  return cleanText(value).toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function makeId() {
  return `nl_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
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

async function upsertSubscriber(storeId: string, email: string, source: string) {
  const newsletterModel = (prisma as any).newsletterSubscriber;

  if (newsletterModel?.upsert) {
    return await newsletterModel.upsert({
      where: {
        storeId_email: {
          storeId,
          email,
        },
      },
      update: {
        status: "ACTIVE",
        source,
      },
      create: {
        storeId,
        email,
        source,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  const id = makeId();
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `INSERT INTO "NewsletterSubscriber" ("id", "storeId", "email", "source", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'ACTIVE', NOW(), NOW())
     ON CONFLICT ("storeId", "email")
     DO UPDATE SET "status" = 'ACTIVE', "source" = EXCLUDED."source", "updatedAt" = NOW()
     RETURNING "id", "email", "status", "createdAt", "updatedAt"`,
    id,
    storeId,
    email,
    source,
  );

  return rows[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const email = normalizeEmail(body.email);
    const storeId = cleanText(body.storeId);
    const storeSlug = cleanText(body.storeSlug);
    const source = cleanText(body.source) || "storefront";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني غير صحيح",
        },
        { status: 400 },
      );
    }

    if (!storeId && !storeSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات المتجر غير مكتملة",
        },
        { status: 400 },
      );
    }

    const store = await prisma.store.findFirst({
      where: {
        ...(storeId ? { id: storeId } : { slug: storeSlug }),
        isActive: true,
        status: {
          not: "CLOSED",
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "المتجر غير متاح حاليًا",
        },
        { status: 404 },
      );
    }

    const subscriber = await upsertSubscriber(store.id, email, source);

    return NextResponse.json({
      success: true,
      message: "تم الاشتراك في النشرة البريدية بنجاح",
      subscriber,
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);

    const details = error instanceof Error ? error.message : String(error || "");
    const setupError = isNewsletterSetupError(error);

    return NextResponse.json(
      {
        success: false,
        message: setupError
          ? "النشرة البريدية غير جاهزة. شغل npx prisma migrate dev ثم npx prisma generate وبعدها أعد تشغيل السيرفر."
          : "حدث خطأ أثناء الاشتراك في النشرة البريدية",
        details: process.env.NODE_ENV !== "production" ? details : undefined,
      },
      { status: 500 },
    );
  }
}
