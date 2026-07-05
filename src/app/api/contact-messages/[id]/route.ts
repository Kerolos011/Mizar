import { NextRequest, NextResponse } from "next/server";
import { ContactMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminSession = getAdminSessionFromRequest(request);

    if (!adminSession) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بتعديل رسائل التواصل",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => null);

    const status = normalizeStatus(body?.status);

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "حالة الرسالة غير صحيحة",
        },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Update contact message error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تعديل الرسالة",
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
          message: "غير مصرح لك بحذف رسائل التواصل",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await prisma.contactMessage.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف الرسالة بنجاح",
    });
  } catch (error) {
    console.error("Delete contact message error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حذف الرسالة",
      },
      { status: 500 }
    );
  }
}