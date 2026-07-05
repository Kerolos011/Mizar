import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passwordHash: true,
        role: true,
        customerStoreId: true,
      },
    });

    if (!user || user.role !== UserRole.MERCHANT || !user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid merchant email or password",
        },
        { status: 401 }
      );
    }

    const passwordIsValid = await verifyPassword(password, user.passwordHash);

    if (!passwordIsValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid merchant email or password",
        },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerStoreId: user.customerStoreId,
    });

    const response = NextResponse.json({
      success: true,
      message: "Merchant logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        customerStoreId: user.customerStoreId,
      },
    });

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("Merchant login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to login merchant",
      },
      { status: 500 }
    );
  }
}