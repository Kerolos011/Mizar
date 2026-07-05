import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export type AdminSession = {
  adminId: string;
  name: string;
  email: string;
};

const ADMIN_COOKIE_NAME = "mizar_platform_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "mizar-local-admin-secret-change-me"
  );
}

function signPayload(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function createAdminSessionToken(session: AdminSession) {
  const payload = Buffer.from(
    JSON.stringify({
      ...session,
      exp: Date.now() + MAX_AGE_SECONDS * 1000,
    })
  ).toString("base64url");

  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(
  token?: string | null
): AdminSession | null {
  try {
    if (!token) return null;

    const [payload, signature] = token.split(".");

    if (!payload || !signature) return null;

    const expectedSignature = signPayload(payload);

    if (!safeCompare(signature, expectedSignature)) return null;

    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as AdminSession & {
      exp: number;
    };

    if (!parsed.exp || parsed.exp < Date.now()) return null;

    return {
      adminId: parsed.adminId,
      name: parsed.name,
      email: parsed.email,
    };
  } catch {
    return null;
  }
}

export function getAdminSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  return verifyAdminSessionToken(token);
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}