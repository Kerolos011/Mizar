import type { Metadata } from "next";
import { headers } from "next/headers";
import { ReactNode } from "react";

type StoreLayoutParams = {
  slug?: string;
};

type StoreLayoutProps = {
  children: ReactNode;
  params: Promise<StoreLayoutParams> | StoreLayoutParams;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (value === undefined || value === null) continue;

    const text = String(value).trim();

    if (text) return text;
  }

  return "";
}

function normalizeUrl(value?: string | null) {
  const url = String(value || "").trim();

  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  return `/${url.replace(/^\/+/, "")}`;
}

function absoluteUrl(value: string, baseUrl: string) {
  const url = normalizeUrl(value);

  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function withVersion(url: string, version: string) {
  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) return "";
  if (/^(data:|blob:)/i.test(cleanUrl)) return cleanUrl;

  const separator = cleanUrl.includes("?") ? "&" : "?";

  return `${cleanUrl}${separator}v=${encodeURIComponent(version || Date.now())}`;
}

function iconMimeType(url: string) {
  const clean = String(url || "").split("?")[0].toLowerCase();

  if (clean.endsWith(".svg")) return "image/svg+xml";
  if (clean.endsWith(".ico")) return "image/x-icon";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".gif")) return "image/gif";

  return "image/png";
}

function splitKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function resolveParams(params: StoreLayoutProps["params"]) {
  return await Promise.resolve(params);
}

async function getRequestBaseUrl() {
  const headersList = await headers();

  const host =
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    "localhost:3000";

  const protocol =
    headersList.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");

  return {
    baseUrl: `${protocol}://${host}`,
    cookie: headersList.get("cookie") || "",
  };
}

async function fetchStorefrontData(slug: string) {
  try {
    const { baseUrl, cookie } = await getRequestBaseUrl();

    const response = await fetch(`${baseUrl}/api/storefront/${encodeURIComponent(slug)}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Cookie: cookie,
      },
    });

    if (!response.ok) return null;

    const data = await response.json().catch(() => null);

    if (!data || data.success === false) return null;

    return {
      data,
      baseUrl,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: StoreLayoutProps): Promise<Metadata> {
  const resolvedParams = await resolveParams(params);
  const slug = firstText(resolvedParams?.slug, "store");

  const result = await fetchStorefrontData(slug);

  if (!result) {
    return {
      title: "Mizar Store",
      description: "Online store powered by Mizar.",
    };
  }

  const { data, baseUrl } = result;
  const store = data.store || {};
  const seo = store.seoSettings || data.seoSettings || {};

  const title = firstText(
    seo.metaTitle,
    store.metaTitle,
    store.nameAr,
    store.nameEn,
    store.name,
    "Mizar Store",
  );

  const description = firstText(
    seo.metaDescription,
    store.metaDescription,
    store.shortDescription,
    store.descriptionAr,
    store.descriptionEn,
    store.description,
    "Online store powered by Mizar.",
  );

  const keywords = splitKeywords(firstText(seo.metaKeywords, store.metaKeywords));

  const faviconRaw = firstText(store.faviconUrl, store.favicon, store.logoUrl);

  const faviconUrl = faviconRaw
    ? withVersion(
        absoluteUrl(faviconRaw, baseUrl),
        firstText(store.updatedAt, store.faviconUpdatedAt, data.meta?.generatedAt, faviconRaw, store.id, slug),
      )
    : "";

  const ogImageRaw = firstText(
    seo.ogImageUrl,
    store.ogImageUrl,
    store.bannerUrl,
    store.coverUrl,
    store.logoUrl,
    faviconRaw,
  );

  const ogImageUrl = ogImageRaw ? absoluteUrl(ogImageRaw, baseUrl) : "";

  const canonicalUrl = firstText(
    seo.canonicalUrl,
    store.canonicalUrl,
    `${baseUrl}/store/${encodeURIComponent(slug)}`,
  );

  const robotsIndex =
    seo.robotsIndex === false ||
    seo.noIndex === true ||
    String(seo.robots || "").toLowerCase().includes("noindex")
      ? false
      : true;

  return {
    metadataBase: new URL(baseUrl),

    title,
    description,
    keywords,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: robotsIndex,
      follow: robotsIndex,
    },

    icons: faviconUrl
      ? {
          icon: [
            {
              url: faviconUrl,
              type: iconMimeType(faviconUrl),
            },
          ],
          shortcut: [
            {
              url: faviconUrl,
              type: iconMimeType(faviconUrl),
            },
          ],
          apple: [
            {
              url: faviconUrl,
              type: iconMimeType(faviconUrl),
            },
          ],
        }
      : undefined,

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: title,
      type: "website",
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              alt: title,
            },
          ]
        : [],
    },

    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return children;
}