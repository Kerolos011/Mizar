import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const CUSTOMER_SESSION_COOKIE = "mizar_customer_session";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type CustomerSessionPayload = {
  userId: string;
  customerId: string;
  storeId: string;
  iat: number;
  exp: number;
};

export type CustomerSession = CustomerSessionPayload;

function getSecret() {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.MIZAR_SESSION_SECRET ||
    "";

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("Missing customer session secret in production.");
  }

  return secret || "mizar-development-secret-change-me";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

function shouldUseSecureCookie(request?: NextRequest) {
  const forwardedProto = request?.headers.get("x-forwarded-proto") || "";
  const protocol = request?.nextUrl.protocol.replace(":", "") || "";
  const host = request?.headers.get("host") || "";

  const isLocalhost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("0.0.0.0");

  if (isLocalhost) return false;

  if (forwardedProto === "https" || protocol === "https") return true;

  return process.env.NODE_ENV === "production" && process.env.MIZAR_SECURE_COOKIES === "true";
}

export function createCustomerSessionToken(input: {
  userId: string;
  customerId: string;
  storeId: string;
}) {
  const now = Date.now();

  const payload: CustomerSessionPayload = {
    userId: input.userId,
    customerId: input.customerId,
    storeId: input.storeId,
    iat: now,
    exp: now + THIRTY_DAYS_MS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyCustomerSessionToken(token?: string | null): CustomerSession | null {
  const raw = String(token || "").trim();

  if (!raw || !raw.includes(".")) return null;

  const [encodedPayload, signature] = raw.split(".");

  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return null;

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as CustomerSessionPayload;

    if (!payload?.userId || !payload?.customerId || !payload?.storeId) {
      return null;
    }

    if (Number(payload.exp || 0) < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getCustomerSessionFromRequest(request: NextRequest) {
  return verifyCustomerSessionToken(request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
}

export function setCustomerSessionCookie(
  response: NextResponse,
  input: {
    userId: string;
    customerId: string;
    storeId: string;
  },
  request?: NextRequest,
) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, createCustomerSessionToken(input), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: Math.floor(THIRTY_DAYS_MS / 1000),
  });

  return response;
}

export function clearCustomerSessionCookie(response: NextResponse, request?: NextRequest) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: 0,
  });

  return response;
}