import { NextRequest, NextResponse } from "next/server";
import { ContactMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-session";

export const runtime = "nodejs";

function normalizeStatus(value: unknown) {
  const status = String(value || "").trim();

  if (
    status === ContactMessageStatus.NEW ||
    status === ContactMessageStatus.READ ||
    status === ContactMessageStatus.ARCHIVED
  ) {
    return status;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(request);

    if (!adminSession) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بعرض رسائل التواصل",
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");

    const where =
      statusParam && statusParam !== "ALL"
        ? {
            status: normalizeStatus(statusParam) || ContactMessageStatus.NEW,
          }
        : {};

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get contact messages error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل رسائل التواصل",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();
    const company = String(body?.company || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "من فضلك أدخل الاسم بشكل صحيح",
        },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          message: "من فضلك أدخل بريد إلكتروني صحيح",
        },
        { status: 400 }
      );
    }

    if (!subject || subject.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "من فضلك أدخل عنوان الرسالة",
        },
        { status: 400 }
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "من فضلك اكتب رسالة واضحة لا تقل عن 10 أحرف",
        },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        subject,
        message,
        status: ContactMessageStatus.NEW,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إرسال رسالتك بنجاح",
      contactMessage,
    });
  } catch (error) {
    console.error("Create contact message error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إرسال الرسالة",
      },
      { status: 500 }
    );
  }
}