import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Old login endpoint is disabled. Use /merchant/login instead.",
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Old login endpoint is disabled. Use /api/auth/merchant/login instead.",
    },
    { status: 410 }
  );
}