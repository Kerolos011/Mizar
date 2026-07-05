"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ErrorStorefront, LoadingStorefront, useStorefrontPageData, useStoreLocale } from "@/storefront/StorefrontPagesShared";
import StorefrontTemplateRouter from "./StorefrontTemplateRouter";
import type { StorefrontTemplatePage } from "./template-types";
import { PremiumLoading } from "../mizar-premium/components/PremiumLoading";

function TemplateLoading({ slug, locale = "ar" }: { slug: string; locale?: "ar" | "en" }) {
  const [template, setTemplate] = useState("");

  useEffect(() => {
    try {
      setTemplate(window.localStorage.getItem(`mizar-active-template:${slug}`) || "");
    } catch {
      setTemplate("");
    }
  }, [slug]);

  if (template === "MIZAR_PREMIUM") return <PremiumLoading locale={locale} />;
  return <LoadingStorefront locale={locale} />;
}

export default function TemplatePageClient({ page }: { page: StorefrontTemplatePage }) {
  const params = useParams<{ slug?: string }>();
  const slug = String(params?.slug || "");
  const data = useStorefrontPageData(slug);
  const locale = useStoreLocale(data.store, data.content);

  if (data.loading) return <TemplateLoading slug={slug} locale={locale} />;
  if (data.error || !data.store) return <ErrorStorefront message={data.error || "المتجر غير موجود"} locale={locale} />;

  return <StorefrontTemplateRouter page={page} data={data} />;
}
