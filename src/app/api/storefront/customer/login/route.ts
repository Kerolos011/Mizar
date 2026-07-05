import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setCustomerSessionCookie } from "@/lib/storefront-customer-session";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanEmail(value: unknown) {
  return cleanText(value).toLowerCase();
}

async function getStoreFromBody(body: any) {
  const storeId = cleanText(body.storeId);
  const storeSlug = cleanText(body.storeSlug || body.slug);

  if (!storeId && !storeSlug) return null;

  return prisma.store.findFirst({
    where: {
      OR: [
        ...(storeId ? [{ id: storeId }] : []),
        ...(storeSlug ? [{ slug: storeSlug }] : []),
      ],
      isActive: true,
      status: "OPEN",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

function publicUser(user: any, customer: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    customerId: customer?.id || null,
    storeId: customer?.storeId || null,
  };
}

function publicCustomer(customer: any) {
  return {
    id: customer.id,
    storeId: customer.storeId,
    userId: customer.userId,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    notes: customer.notes,
    createdAt: customer.createdAt,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const store = await getStoreFromBody(body);
    const email = cleanEmail(body.email);
    const password = cleanText(body.password);

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "المتجر غير موجود أو غير متاح حاليًا",
        },
        { status: 404 },
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني وكلمة المرور مطلوبان",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== UserRole.CUSTOMER || !user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الدخول غير صحيحة",
        },
        { status: 401 },
      );
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الدخول غير صحيحة",
        },
        { status: 401 },
      );
    }

    let customer = await prisma.customer.findFirst({
      where: {
        storeId: store.id,
        OR: [{ userId: user.id }, { email }],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          storeId: store.id,
          userId: user.id,
          name: user.name || email.split("@")[0],
          email: user.email,
          phone: user.phone || "",
        },
      });
    } else if (!customer.userId) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          userId: user.id,
          name: customer.name || user.name || email.split("@")[0],
          email: customer.email || user.email,
          phone: customer.phone || user.phone || "",
        },
      });
    }

    if (!user.customerStoreId) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          customerStoreId: store.id,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      authenticated: true,
      store,
      user: publicUser(user, customer),
      customer: publicCustomer(customer),
    });

    return setCustomerSessionCookie(
      response,
      {
        userId: user.id,
        customerId: customer.id,
        storeId: store.id,
      },
      request,
    );
  } catch (error) {
    console.error("STOREFRONT_CUSTOMER_LOGIN_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول",
      },
      { status: 500 },
    );
  }
}