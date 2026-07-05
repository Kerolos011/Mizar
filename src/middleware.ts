import { NextRequest, NextResponse } from "next/server";

const MERCHANT_SESSION_COOKIE_NAME = "mizar-auth-session";
const CUSTOMER_SESSION_COOKIE_NAME = "mizar_customer_session";

type MerchantSessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "MERCHANT" | "CUSTOMER";
  customerStoreId?: string | null;
  exp: number;
};

type CustomerSessionPayload = {
  userId: string;
  customerId: string;
  storeId: string;
  iat: number;
  exp: number;
};

function getMerchantAuthSecret() {
  return process.env.AUTH_SECRET || "";
}

function getCustomerAuthSecret() {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.MIZAR_SESSION_SECRET ||
    ""
  );
}

function base64UrlToText(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  const binary = atob(paddedBase64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function arrayBufferToBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signValue(value: string, secret: string) {
  if (!secret) return "";

  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return arrayBufferToBase64Url(signature);
}

async function verifyMerchantSessionToken(token?: string | null) {
  if (!token) return null;

  try {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) return null;

    const expectedSignature = await signValue(encodedPayload, getMerchantAuthSecret());

    if (!expectedSignature || signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlToText(encodedPayload)) as MerchantSessionPayload;

    if (!payload?.userId || !payload?.role || !payload?.exp) return null;

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

async function verifyCustomerSessionToken(token?: string | null) {
  if (!token) return null;

  try {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) return null;

    const secret =
      getCustomerAuthSecret() ||
      (process.env.NODE_ENV !== "production"
        ? "mizar-development-secret-change-me"
        : "");

    if (!secret) return null;

    const expectedSignature = await signValue(encodedPayload, secret);

    if (!expectedSignature || signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlToText(encodedPayload)) as CustomerSessionPayload;

    if (!payload?.userId || !payload?.customerId || !payload?.storeId || !payload?.exp) {
      return null;
    }

    if (Number(payload.exp) < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

function getStoreSlugFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] !== "store") return "";

  return parts[1] || "";
}

function redirectMerchantToLogin(request: NextRequest) {
  const url = new URL("/merchant/login", request.url);

  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);

  return NextResponse.redirect(url);
}

function redirectCustomerToLogin(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const slug = getStoreSlugFromPath(pathname);
  const loginPath = slug ? `/store/${slug}/login` : "/";

  const url = new URL(loginPath, request.url);

  url.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search);

  return NextResponse.redirect(url);
}

function isProtectedCustomerStorePath(pathname: string) {
  if (!pathname.startsWith("/store/")) return false;

  const parts = pathname.split("/").filter(Boolean);
  const section = parts[2];

  /*
    مهم:
    - account فقط محمية بالـ middleware.
    - cart والـ checkout لا يتم حمايتهم هنا عشان ما يحصلش redirect loop.
    - Checkout نفسه أو API الطلبات يقرر لو محتاج login.
  */
  return section === "account";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard")) {
    const merchantToken = request.cookies.get(MERCHANT_SESSION_COOKIE_NAME)?.value;
    const merchantSession = await verifyMerchantSessionToken(merchantToken);

    if (
      !merchantSession ||
      (merchantSession.role !== "MERCHANT" && merchantSession.role !== "SUPER_ADMIN")
    ) {
      return redirectMerchantToLogin(request);
    }
  }

  if (isProtectedCustomerStorePath(pathname)) {
    const customerToken = request.cookies.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
    const customerSession = await verifyCustomerSessionToken(customerToken);

    if (!customerSession) {
      return redirectCustomerToLogin(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",

    "/store/:slug/account",
    "/store/:slug/account/:path*",
  ],
};