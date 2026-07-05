import { NextRequest, NextResponse } from "next/server";

export const AUTH_SESSION_COOKIE_NAME = "mizar-auth-session";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionRole = "SUPER_ADMIN" | "MERCHANT" | "CUSTOMER";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: SessionRole;
  customerStoreId?: string | null;
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable");
  }

  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

async function signValue(value: string) {
  const { createHmac } = await import("crypto");

  return createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("base64url");
}

export async function createSessionToken(
  payload: Omit<SessionPayload, "exp">
) {
  const sessionPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + AUTH_SESSION_MAX_AGE,
  };

  const encodedPayload = toBase64Url(JSON.stringify(sessionPayload));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null;

  try {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) return null;

    const expectedSignature = await signValue(encodedPayload);

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;

    if (!payload?.userId || !payload?.role || !payload?.exp) return null;

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;

  return verifySessionToken(token);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function getSafeRedirectPath(value?: string | null, fallback = "/") {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;

  return value;
}