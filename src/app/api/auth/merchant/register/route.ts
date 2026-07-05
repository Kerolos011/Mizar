import { NextRequest, NextResponse } from "next/server";
import { AuthProvider, Gender, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

function normalizeEgyptianPhone(phone: string) {
  const clean = phone.replace(/\s+/g, "").replace(/-/g, "");

  if (clean.startsWith("+20")) {
    return `0${clean.slice(3)}`;
  }

  if (clean.startsWith("20")) {
    return `0${clean.slice(2)}`;
  }

  return clean;
}

function isValidEgyptianPhone(phone: string) {
  const normalized = normalizeEgyptianPhone(phone);
  return /^01[0125][0-9]{8}$/.test(normalized);
}

function getGender(value: unknown): Gender | null {
  if (value === Gender.MALE || value === "MALE") {
    return Gender.MALE;
  }

  if (value === Gender.FEMALE || value === "FEMALE") {
    return Gender.FEMALE;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const firstName = String(body?.firstName || "").trim();
    const secondName = String(body?.secondName || "").trim();
    const thirdName = String(body?.thirdName || "").trim();

    const name = [firstName, secondName, thirdName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const gender = getGender(body?.gender);
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = normalizeEgyptianPhone(String(body?.phone || "").trim());

    const password = String(body?.password || "");
    const confirmPassword = String(body?.confirmPassword || "");

    const acceptedTerms = Boolean(body?.acceptedTerms || body?.acceptTerms);
    const marketingConsent = Boolean(body?.marketingConsent);

    if (!firstName) {
      return NextResponse.json(
        { success: false, message: "من فضلك أدخل الاسم الأول" },
        { status: 400 }
      );
    }

    if (!secondName) {
      return NextResponse.json(
        { success: false, message: "من فضلك أدخل الاسم الثاني" },
        { status: 400 }
      );
    }

    if (!thirdName) {
      return NextResponse.json(
        { success: false, message: "من فضلك أدخل الاسم الثالث" },
        { status: 400 }
      );
    }

    if (!gender) {
      return NextResponse.json(
        { success: false, message: "من فضلك اختر الجنس" },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "من فضلك أدخل بريد إلكتروني صحيح" },
        { status: 400 }
      );
    }

    if (!phone || !isValidEgyptianPhone(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "من فضلك أدخل رقم هاتف مصري صحيح مثل 01012345678",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "كلمة المرور يجب ألا تقل عن 8 أحرف",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
        },
        { status: 400 }
      );
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب الموافقة على الشروط والأحكام وسياسة الخصوصية",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني مسجل بالفعل",
        },
        { status: 409 }
      );
    }

    const existingPhone = await prisma.user.findFirst({
      where: { phone },
      select: { id: true },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف مسجل بالفعل",
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        firstName,
        secondName,
        thirdName,
        gender,
        email,
        phone,
        passwordHash,
        role: UserRole.MERCHANT,
        authProvider: AuthProvider.EMAIL,

        acceptedTerms: true,
        termsAcceptedAt: now,
        termsVersion: "v1",
        privacyVersion: "v1",

        marketingConsent,
        marketingConsentAt: marketingConsent ? now : null,

        merchantOnboardingCompleted: false,
        merchantOnboardingCompletedAt: null,
        welcomeSeenAt: null,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        secondName: true,
        thirdName: true,
        gender: true,
        email: true,
        phone: true,
        role: true,
        customerStoreId: true,
        merchantOnboardingCompleted: true,
        createdAt: true,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerStoreId: user.customerStoreId,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "تم إنشاء حساب التاجر بنجاح",
        user,
        redirectTo: "/merchant/welcome",
      },
      { status: 201 }
    );

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("Merchant register error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إنشاء الحساب",
      },
      { status: 500 }
    );
  }
}