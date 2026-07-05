"use client";

import type { StorefrontTemplateProps } from "./types";
import StorefrontTemplateRouter from "@/storefront/templates/_shared/StorefrontTemplateRouter";
import { getTemplateKeyFromData } from "@/storefront/templates/_shared/template-helpers";
import type { TemplateRuntimeData } from "@/storefront/templates/_shared/template-types";

export default function StorefrontRenderer(props: StorefrontTemplateProps) {
  const store = props.store as any;
  const content = props.content as any;
  const products = Array.isArray(props.products) ? (props.products as any[]) : [];
  const templateKey = getTemplateKeyFromData({ content, store });

  const data: TemplateRuntimeData = {
    store,
    content,
    templateKey,
    products,
    featuredProducts: products.filter((product: any) => product?.isFeatured).slice(0, 8),
    latestProducts: products.slice(0, 8),
    bestSellerProducts: products.slice(0, 8),
    newArrivalProducts: products.slice(0, 8),
    categories: Array.from(new Set(products.map((product: any) => product?.category).filter(Boolean))) as string[],
  };

  return <StorefrontTemplateRouter page="home" data={data} />;
}
