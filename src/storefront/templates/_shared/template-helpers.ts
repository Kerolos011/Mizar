import type { StorefrontTemplateKey } from "@/storefront/types";
import type { PublicStore, StorefrontContent, StorefrontProduct } from "@/storefront/StorefrontPagesShared";
import {
  buildStoreHref,
  getProductImage,
  getStoreName,
  normalizeHref,
  resolveMediaUrl,
} from "@/storefront/StorefrontPagesShared";
import { normalizeTemplateKey } from "@/storefront/templates/registry";

export function getActiveHero(content: StorefrontContent | null, store: PublicStore | null) {
  const slide = Array.isArray(content?.heroSlides) ? content?.heroSlides?.[0] : null;
  return {
    title: slide?.title || store?.tagline || "اكتشف أحدث منتجاتنا",
    subtitle: slide?.subtitle || store?.description || "تجربة تسوق سهلة ومنظمة",
    description: slide?.description || store?.description || "منتجات مختارة بعناية وتجربة شراء واضحة وسريعة.",
    imageUrl: resolveMediaUrl(slide?.imageUrl || store?.coverUrl || store?.bannerUrl || ""),
    primaryButtonText: slide?.primaryButtonText || (slide as any)?.buttonText || "تسوق الآن",
    primaryButtonHref: normalizeHref(store, slide?.primaryButtonHref || (slide as any)?.buttonLink || "/products"),
    secondaryButtonText: slide?.secondaryButtonText || (slide as any)?.secondaryButtonText || "من نحن",
    secondaryButtonHref: normalizeHref(store, slide?.secondaryButtonHref || (slide as any)?.secondaryButtonLink || "/about"),
  };
}

export function getTemplateKeyFromData(input: {
  content?: StorefrontContent | null;
  store?: PublicStore | null;
  templateKey?: string | null;
}): StorefrontTemplateKey {
  return normalizeTemplateKey(
    input.templateKey ||
      input.content?.templateKey ||
      input.store?.templateConfig?.templateKey ||
      input.store?.template ||
      "MIZAR_MODERN"
  );
}

export function getFeaturedProducts(products: StorefrontProduct[], featuredProducts?: StorefrontProduct[] | null) {
  const featured = Array.isArray(featuredProducts) && featuredProducts.length ? featuredProducts : products.filter((p) => p.isFeatured);
  return (featured.length ? featured : products).slice(0, 8);
}

export function getTemplateProductImage(product: StorefrontProduct) {
  return getProductImage(product);
}

export function getTemplateStoreName(store: PublicStore | null) {
  return getStoreName(store);
}

export function href(store: PublicStore | null, path = "") {
  return buildStoreHref(store, path);
}

export function safeCategoryList(products: StorefrontProduct[], categories: string[]) {
  return categories.length ? categories : Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
}
