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

function normalizeEgyptianMobile(value: unknown) {
  let digits = String(value || "").trim().replace(/[^0-9+]/g, "");

  if (digits.startsWith("+20")) {
    digits = `0${digits.slice(3)}`;
  } else if (digits.startsWith("0020")) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith("20")) {
    digits = `0${digits.slice(2)}`;
  }

  digits = digits.replace(/[^0-9]/g, "");

  return digits;
}

function isValidEgyptianMobile(value: unknown) {
  return /^01[0125][0-9]{8}$/.test(normalizeEgyptianMobile(value));
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

    const name = cleanText(body.name);
    const email = cleanEmail(body.email);
    const phone = normalizeEgyptianMobile(body.phone);
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

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم العميل مطلوب",
        },
        { status: 400 },
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني غير صحيح",
        },
        { status: 400 },
      );
    }

    if (!isValidEgyptianMobile(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الموبايل يجب أن يكون رقم مصري صحيح مثل 01012345678 أو +201012345678",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "كلمة المرور يجب ألا تقل عن 6 أحرف",
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا البريد مسجل بالفعل. استخدم تسجيل الدخول بدلًا من إنشاء حساب جديد.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role: UserRole.CUSTOMER,
          customerStoreId: store.id,
          acceptedTerms: true,
          termsAcceptedAt: new Date(),
        },
      });

      const customer = await tx.customer.create({
        data: {
          storeId: store.id,
          userId: user.id,
          name,
          email,
          phone,
        },
      });

      return { user, customer };
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "تم إنشاء حساب العميل بنجاح",
        authenticated: true,
        store,
        user: publicUser(result.user, result.customer),
        customer: publicCustomer(result.customer),
      },
      { status: 201 },
    );

    return setCustomerSessionCookie(
      response,
      {
        userId: result.user.id,
        customerId: result.customer.id,
        storeId: store.id,
      },
      request,
    );
  } catch (error) {
    console.error("STOREFRONT_CUSTOMER_REGISTER_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إنشاء حساب العميل",
      },
      { status: 500 },
    );
  }
}