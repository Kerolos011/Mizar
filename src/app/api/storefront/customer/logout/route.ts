import { NextRequest, NextResponse } from "next/server";
import { clearCustomerSessionCookie } from "@/lib/storefront-customer-session";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "تم تسجيل الخروج بنجاح",
  });

  return clearCustomerSessionCookie(response, request);
}