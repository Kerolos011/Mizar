"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type ProductMediaType = "IMAGE" | "VIDEO";
type ProductTypeValue = "SIMPLE" | "VARIABLE";
type VariantStatusValue = "ACTIVE" | "HIDDEN" | "OUT_OF_STOCK" | "DISABLED";

type ProductMedia = {
  id?: string;
  type: ProductMediaType;
  url: string;
  sortOrder?: number;
};

type ProductSchemaField = {
  key: string;
  label: string;
  type?: string;
};

type ProductSchema = {
  productType?: string;
  fields?: ProductSchemaField[];
  defaultOptions?: Record<string, string[]>;
};

type Store = {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
  category?: string | null;
  template?: string | null;
  productSchema?: ProductSchema | null;
};

type ProductOptionInput = {
  name: string;
  valuesText: string;
};

type ProductVariantInput = {
  title: string;
  options: Record<string, string>;
  sku: string;
  barcode: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  quantity: string;
  reservedQuantity: string;
  lowStockAlert: string;
  weight: string;
  imageUrl: string;
  status: VariantStatusValue;
};

type ProductOptionFromApi = {
  id?: string;
  name?: string | null;
  values?: string[] | null;
  sortOrder?: number | null;
};

type ProductVariantFromApi = {
  id?: string;
  title?: string | null;
  options?: Record<string, string> | null;
  sku?: string | null;
  barcode?: string | null;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  costPrice?: number | string | null;
  quantity?: number | string | null;
  reservedQuantity?: number | string | null;
  lowStockAlert?: number | string | null;
  weight?: number | string | null;
  imageUrl?: string | null;
  status?: VariantStatusValue | string | null;
};

type Product = {
  id: string;
  storeId: string;
  name: string;
  description?: string | null;
  price: number | string;
  stock: number | string | null;
  reservedStock?: number | string | null;
  availableStock?: number | string | null;
  imageUrl?: string | null;
  category?: string | null;
  type?: ProductTypeValue | string;
  compareAtPrice?: number | string | null;
  discountPrice?: number | string | null;
  costPrice?: number | string | null;
  minSellingPrice?: number | string | null;
  maxDiscountPercent?: number | string | null;
  attributes?: Record<string, unknown> | null;
  options?: Record<string, unknown> | null;
  variants?: unknown;
  productOptions?: ProductOptionFromApi[];
  productVariants?: ProductVariantFromApi[];
  createdAt?: string;
  updatedAt?: string;
  media?: ProductMedia[];
};

type IconName =
  | "products"
  | "plus"
  | "edit"
  | "trash"
  | "copy"
  | "refresh"
  | "external"
  | "search"
  | "store"
  | "inventory"
  | "warning"
  | "check"
  | "image"
  | "upload"
  | "price"
  | "discount"
  | "box"
  | "layers"
  | "spark"
  | "close"
  | "arrow"
  | "tag"
  | "settings"
  | "chevron";

const productsPageStyles = `
.products-page {
  color: var(--text-main);
}

.products-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.products-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 24px;
  background:
    radial-gradient(circle at 12% 10%, rgba(46, 217, 179, 0.16), transparent 30%),
    radial-gradient(circle at 92% 20%, rgba(245, 158, 11, 0.08), transparent 24%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 14px 44px rgba(24, 33, 63, 0.06);
}

.products-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border: 1px solid rgba(46, 217, 179, 0.22);
  border-radius: 999px;
  background: rgba(216, 255, 245, 0.74);
  color: var(--mint-hover);
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 700;
}

.products-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.products-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 42px;
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  transition:
    transform 180ms var(--ease-premium),
    border-color 180ms var(--ease-premium),
    background 180ms var(--ease-premium),
    color 180ms var(--ease-premium),
    box-shadow 180ms var(--ease-premium);
}

.products-action:hover {
  transform: translateY(-1px);
}

.products-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.products-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.products-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.products-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.products-action.danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
}

.products-action.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.products-action.ghost {
  border: 1px solid rgba(226, 232, 240, 0.72);
  background: rgba(255, 255, 255, 0.55);
  color: var(--muted-foreground);
}

.products-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.products-icon.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.products-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.products-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.products-stat-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.products-input,
.products-select,
.products-textarea {
  width: 100%;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  background: #ffffff;
  color: var(--foreground);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  transition:
    border-color 180ms var(--ease-premium),
    box-shadow 180ms var(--ease-premium),
    background 180ms var(--ease-premium);
}

.products-input,
.products-select {
  min-height: 44px;
  padding: 10px 13px;
}

.products-textarea {
  min-height: 110px;
  resize: vertical;
  padding: 12px 13px;
  line-height: 1.8;
}

.products-input:focus,
.products-select:focus,
.products-textarea:focus {
  border-color: rgba(46, 217, 179, 0.52);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.10);
}

.products-label {
  display: block;
  margin-bottom: 7px;
  color: var(--muted-foreground);
  font-size: 12px;
  font-weight: 700;
}

.products-help {
  margin-top: 6px;
  color: var(--muted-foreground);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.7;
}

.products-price-note {
  border: 1px solid rgba(46, 217, 179, 0.18);
  border-radius: 18px;
  background: rgba(216, 255, 245, 0.5);
  padding: 14px;
}

.products-warning-note {
  border: 1px solid rgba(245, 158, 11, 0.24);
  border-radius: 18px;
  background: rgba(245, 158, 11, 0.08);
  padding: 14px;
  color: #92400e;
}

.products-error-note {
  border: 1px solid rgba(239, 68, 68, 0.24);
  border-radius: 18px;
  background: rgba(239, 68, 68, 0.08);
  padding: 14px;
  color: #dc2626;
}

.products-media-tile {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  background: #f8fafc;
  aspect-ratio: 1 / 1;
}

.products-media-tile img,
.products-media-tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.products-media-empty {
  display: grid;
  min-height: 180px;
  place-items: center;
  border: 1px dashed rgba(148, 163, 184, 0.55);
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.88);
  padding: 20px;
  text-align: center;
}

.products-row {
  transition:
    background 180ms var(--ease-premium),
    transform 180ms var(--ease-premium);
}

.products-row:hover {
  background: rgba(248, 250, 252, 0.78);
}

.products-thumbnail {
  width: 58px;
  height: 58px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 17px;
  background: #f8fafc;
}

.products-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.products-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 800;
}

.products-status.available {
  background: rgba(16, 185, 129, 0.10);
  color: #047857;
}

.products-status.low {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.products-status.out {
  background: rgba(239, 68, 68, 0.10);
  color: #dc2626;
}

.products-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.products-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.72),
    transparent
  );
  animation: products-skeleton-shimmer 1.25s infinite;
}

@keyframes products-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

.products-option-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
}

.products-variant-row {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  background: #ffffff;
  padding: 14px;
}

.products-add-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(46, 217, 179, 0.22);
  border-radius: 22px;
  background:
    radial-gradient(circle at 10% 10%, rgba(46, 217, 179, 0.12), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.products-form-wrap {
  scroll-margin-top: 96px;
}

.products-search-wrap {
  position: relative;
}

.products-search-icon {
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(100, 116, 139, 0.72);
}

.products-search-input {
  padding-right: 44px;
  padding-left: 14px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 36%),
    #ffffff;
}

.products-search-input::placeholder {
  color: rgba(100, 116, 139, 0.7);
  font-size: 13px;
  font-weight: 600;
}

.products-modern-select-wrap {
  position: relative;
}

.products-modern-select-wrap::before {
  content: "";
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  width: 22px;
  height: 22px;
  border-radius: 9px;
  transform: translateY(-50%);
  background:
    radial-gradient(circle at 40% 35%, rgba(46, 217, 179, 0.9), rgba(46, 217, 179, 0.18));
  box-shadow: 0 0 0 5px rgba(46, 217, 179, 0.08);
}

.products-modern-select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 48px;
  padding-left: 42px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: var(--foreground);
  box-shadow: 0 8px 20px rgba(24, 33, 63, 0.035);
}

.products-modern-select:hover {
  border-color: rgba(46, 217, 179, 0.38);
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.12), transparent 34%),
    #ffffff;
}

.products-select-chevron {
  pointer-events: none;
  position: absolute;
  left: 14px;
  top: 50%;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 10px;
  transform: translateY(-50%);
  color: rgba(24, 33, 63, 0.72);
  background: rgba(24, 33, 63, 0.045);
}

.products-modern-select option {
  color: #18213f;
  background: #ffffff;
  font-weight: 700;
}

@media (max-width: 768px) {
  .products-card,
  .products-hero,
  .products-add-panel {
    border-radius: 18px;
  }

  .products-action {
    width: 100%;
  }

  .products-stat-value {
    font-size: 24px;
  }
}
`;

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value: number | string | null | undefined) {
  return toNumber(value, 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function formatMoney(value: number | string | null | undefined) {
  return `${formatNumber(value)} ج.م`;
}

function formatPercent(value: number | string | null | undefined) {
  return `${toNumber(value, 0).toLocaleString("en-US", {
    maximumFractionDigits: 1,
  })}%`;
}

function getDiscountDetails({
  price,
  compareAtPrice,
  maxDiscountPercent,
}: {
  price: number | string | null | undefined;
  compareAtPrice: number | string | null | undefined;
  maxDiscountPercent?: number | string | null;
}) {
  const finalPrice = toNumber(price, 0);
  const originalPrice = toNumber(compareAtPrice, 0);
  const maxDiscount = toNumber(maxDiscountPercent, 0);

  const hasDiscount = originalPrice > 0 && finalPrice > 0 && originalPrice > finalPrice;
  const discountAmount = hasDiscount ? originalPrice - finalPrice : 0;
  const discountPercent = hasDiscount ? (discountAmount / originalPrice) * 100 : 0;

  return {
    hasDiscount,
    originalPrice,
    finalPrice,
    discountAmount,
    discountPercent,
    maxDiscount,
    exceedsMaxDiscount: maxDiscount > 0 && discountPercent > maxDiscount,
  };
}

function getProductPrice(product: Product) {
  return toNumber(product.discountPrice ?? product.price, 0);
}

function getProductCompareAtPrice(product: Product) {
  return toNumber(product.compareAtPrice, 0);
}

function getProductStock(product: Product) {
  if (product.availableStock !== undefined && product.availableStock !== null) {
    return toNumber(product.availableStock, 0);
  }

  return toNumber(product.stock, 0);
}

function getProductStatus(product: Product) {
  const stock = getProductStock(product);

  if (stock <= 0) {
    return {
      label: "نفد المخزون",
      className: "out",
    };
  }

  if (stock <= 5) {
    return {
      label: "مخزون منخفض",
      className: "low",
    };
  }

  return {
    label: "متاح للبيع",
    className: "available",
  };
}

function normalizeProductMedia(product: Product): ProductMedia[] {
  const media = Array.isArray(product.media) ? product.media : [];

  const normalized = media
    .filter((item) => item?.url)
    .map((item, index) => ({
      id: item.id,
      type: item.type === "VIDEO" ? "VIDEO" : "IMAGE",
      url: item.url,
      sortOrder: item.sortOrder ?? index,
    }))
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

  if (normalized.length > 0) return normalized;

  if (product.imageUrl) {
    return [
      {
        type: "IMAGE",
        url: product.imageUrl,
        sortOrder: 0,
      },
    ];
  }

  return [];
}

function getMainImageFromMedia(media: ProductMedia[]) {
  const image = media.find((item) => item.type === "IMAGE" && item.url);
  return image?.url || media[0]?.url || null;
}

function getProductThumbnail(product: Product) {
  return getMainImageFromMedia(normalizeProductMedia(product));
}

function normalizeAttributes(value: Product["attributes"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.entries(value).reduce<Record<string, string>>((result, [key, val]) => {
    result[key] = String(val ?? "");
    return result;
  }, {});
}

function cleanAttributes(value: Record<string, string>) {
  return Object.entries(value).reduce<Record<string, string>>((result, [key, val]) => {
    const cleanKey = String(key || "").trim();
    const cleanValue = String(val || "").trim();

    if (cleanKey && cleanValue) {
      result[cleanKey] = cleanValue;
    }

    return result;
  }, {});
}

function getSchemaFields(productSchema?: ProductSchema | null) {
  if (!productSchema?.fields || !Array.isArray(productSchema.fields)) return [];

  return productSchema.fields.filter((field) => field.key && field.label);
}

function getSchemaHint(productType?: string) {
  const type = String(productType || "").toLowerCase();

  if (type.includes("fashion")) return "حقول مناسبة للملابس والموضة مثل المقاس، اللون، والخامة.";
  if (type.includes("electronics")) return "حقول مناسبة للإلكترونيات مثل الموديل، الضمان، والمواصفات.";
  if (type.includes("food")) return "حقول مناسبة للأطعمة مثل الوزن، المكونات، ومدة الصلاحية.";
  if (type.includes("beauty")) return "حقول مناسبة للعناية والجمال مثل النوع والحجم والاستخدام.";

  return "حقول مرنة مناسبة لنشاط متجرك الحالي.";
}

function createDefaultVariantOptions(): ProductOptionInput[] {
  return [
    {
      name: "اللون",
      valuesText: "",
    },
    {
      name: "المقاس",
      valuesText: "",
    },
  ];
}

function parseOptionValues(value: string) {
  return String(value || "")
    .split(/[,،\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildVariantCombinations(
  options: {
    name: string;
    values: string[];
  }[]
) {
  return options.reduce<Record<string, string>[]>((combinations, option) => {
    const nextCombinations: Record<string, string>[] = [];

    for (const combination of combinations) {
      for (const value of option.values) {
        nextCombinations.push({
          ...combination,
          [option.name]: value,
        });
      }
    }

    return nextCombinations;
  }, [{}]);
}

function getVariantKey(options: Record<string, string>) {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}

function createVariantTitle(options: Record<string, string>, optionNames: string[]) {
  return optionNames.map((name) => options[name]).filter(Boolean).join(" / ");
}

function makeSafeSkuPart(value: string) {
  return (
    String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "MIZAR"
  );
}

function normalizeProductOptionsFromApi(product: Product): ProductOptionInput[] {
  const options = Array.isArray(product.productOptions) ? product.productOptions : [];

  if (options.length > 0) {
    return options
      .slice()
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .map((option) => ({
        name: String(option.name || ""),
        valuesText: Array.isArray(option.values) ? option.values.join("، ") : "",
      }));
  }

  return createDefaultVariantOptions();
}

function normalizeProductVariantsFromApi(product: Product): ProductVariantInput[] {
  const variants = Array.isArray(product.productVariants) ? product.productVariants : [];

  return variants.map((variant) => ({
    title: String(variant.title || ""),
    options: variant.options || {},
    sku: String(variant.sku || ""),
    barcode: String(variant.barcode || ""),
    price: String(variant.price ?? product.price ?? ""),
    compareAtPrice: String(variant.compareAtPrice ?? ""),
    costPrice: String(variant.costPrice ?? ""),
    quantity: String(variant.quantity ?? ""),
    reservedQuantity: String(variant.reservedQuantity ?? "0"),
    lowStockAlert: String(variant.lowStockAlert ?? "5"),
    weight: String(variant.weight ?? ""),
    imageUrl: String(variant.imageUrl || ""),
    status:
      variant.status === "HIDDEN" ||
      variant.status === "OUT_OF_STOCK" ||
      variant.status === "DISABLED"
        ? variant.status
        : "ACTIVE",
  }));
}

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const props = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  if (name === "products") {
    return (
      <svg {...props}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...props}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg {...props}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M6 6l1 15h10l1-15" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    );
  }

  if (name === "copy") {
    return (
      <svg {...props}>
        <path d="M9 9h10v10H9z" />
        <path d="M5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...props}>
        <path d="M20 6v5h-5" />
        <path d="M4 18v-5h5" />
        <path d="M6.2 9a7 7 0 0 1 11.6-2.6L20 11" />
        <path d="M17.8 15a7 7 0 0 1-11.6 2.6L4 13" />
      </svg>
    );
  }

  if (name === "external") {
    return (
      <svg {...props}>
        <path d="M14 4h6v6" />
        <path d="M10 14L20 4" />
        <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...props}>
        <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    );
  }

  if (name === "store") {
    return (
      <svg {...props}>
        <path d="M4 10h16" />
        <path d="M5 10l1-5h12l1 5" />
        <path d="M6 10v9h12v-9" />
        <path d="M9 19v-5h6v5" />
      </svg>
    );
  }

  if (name === "inventory") {
    return (
      <svg {...props}>
        <path d="M4 7l8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </svg>
    );
  }

  if (name === "warning") {
    return (
      <svg {...props}>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...props}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (name === "image") {
    return (
      <svg {...props}>
        <path d="M4 5h16v14H4z" />
        <path d="m4 15 4-4 4 4 2-2 6 6" />
        <path d="M15 9h.01" />
      </svg>
    );
  }

  if (name === "upload") {
    return (
      <svg {...props}>
        <path d="M12 16V4" />
        <path d="M7 9l5-5 5 5" />
        <path d="M5 20h14" />
      </svg>
    );
  }

  if (name === "price") {
    return (
      <svg {...props}>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }

  if (name === "discount") {
    return (
      <svg {...props}>
        <path d="M19 5 5 19" />
        <path d="M7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    );
  }

  if (name === "box") {
    return (
      <svg {...props}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
      </svg>
    );
  }

  if (name === "layers") {
    return (
      <svg {...props}>
        <path d="M12 2 3 7l9 5 9-5-9-5Z" />
        <path d="M3 12l9 5 9-5" />
        <path d="M3 17l9 5 9-5" />
      </svg>
    );
  }

  if (name === "spark") {
    return (
      <svg {...props}>
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
        <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...props}>
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...props}>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    );
  }

  if (name === "tag") {
    return (
      <svg {...props}>
        <path d="M20 12 12 20 4 12V4h8l8 8Z" />
        <path d="M8 8h.01" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...props}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19 12h2" />
      <path d="M3 12h2" />
      <path d="M12 3v2" />
      <path d="M12 19v2" />
    </svg>
  );
}

export default function DashboardProductsPage() {
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [activeStoreId, setActiveStoreId] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [minSellingPrice, setMinSellingPrice] = useState("");
  const [maxDiscountPercent, setMaxDiscountPercent] = useState("");
  const [stock, setStock] = useState("");
  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [productAttributes, setProductAttributes] = useState<Record<string, string>>({});

  const [productType, setProductType] = useState<ProductTypeValue>("SIMPLE");
  const [variantOptions, setVariantOptions] = useState<ProductOptionInput[]>(
    createDefaultVariantOptions()
  );
  const [generatedVariants, setGeneratedVariants] = useState<ProductVariantInput[]>([]);

  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkCompareAtPrice, setBulkCompareAtPrice] = useState("");
  const [bulkQuantity, setBulkQuantity] = useState("");
  const [bulkCostPrice, setBulkCostPrice] = useState("");

  const [previewMedia, setPreviewMedia] = useState<ProductMedia | null>(null);

  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const productSchema = activeStore?.productSchema || null;
  const productSchemaFields = useMemo(() => getSchemaFields(productSchema), [productSchema]);
  const schemaDefaultOptions = productSchema?.defaultOptions || {};

  const categories = useMemo(() => {
    const values = new Set<string>();

    for (const product of products) {
      if (product.category) values.add(product.category);
    }

    if (activeStore?.category) values.add(activeStore.category);

    return Array.from(values).sort();
  }, [products, activeStore?.category]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const productStock = getProductStock(product);

      if (stockFilter === "AVAILABLE" && productStock <= 5) return false;
      if (stockFilter === "LOW" && !(productStock > 0 && productStock <= 5)) return false;
      if (stockFilter === "OUT" && productStock > 0) return false;

      if (!search) return true;

      const attributes = normalizeAttributes(product.attributes);
      const text = [
        product.name,
        product.description,
        product.category,
        ...Object.values(attributes),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(search);
    });
  }, [products, searchTerm, stockFilter]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const availableProducts = products.filter((product) => getProductStock(product) > 5).length;

    const lowStockProducts = products.filter((product) => {
      const currentStock = getProductStock(product);
      return currentStock > 0 && currentStock <= 5;
    }).length;

    const outOfStockProducts = products.filter((product) => getProductStock(product) <= 0).length;

    const totalStockValue = products.reduce((sum, product) => {
      return sum + getProductPrice(product) * getProductStock(product);
    }, 0);

    const discountedProducts = products.filter((product) => {
      return getProductCompareAtPrice(product) > getProductPrice(product);
    }).length;

    return {
      totalProducts,
      availableProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
      discountedProducts,
    };
  }, [products]);

  const priceDetails = useMemo(() => {
    return getDiscountDetails({
      price,
      compareAtPrice,
      maxDiscountPercent,
    });
  }, [price, compareAtPrice, maxDiscountPercent]);

  const variantOptionsPreview = useMemo(() => {
    const activeOptions = variantOptions
      .map((option) => ({
        name: option.name.trim(),
        values: parseOptionValues(option.valuesText),
      }))
      .filter((option) => option.name && option.values.length > 0);

    const totalCombinations =
      activeOptions.length === 0
        ? 0
        : activeOptions.reduce((total, option) => total * option.values.length, 1);

    return {
      activeOptions,
      totalCombinations,
    };
  }, [variantOptions]);

  function scrollToProductForm() {
    window.setTimeout(() => {
      document.getElementById("product-form-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function openCreateProductForm() {
    resetForm(false);
    setShowProductForm(true);
    scrollToProductForm();
  }

  async function loadCurrentStore() {
    setLoadingStore(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/merchant/store/current?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/merchant/login?next=/dashboard/products";
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل بيانات المتجر");
      }

      if (!data?.hasStore || !data?.store) {
        window.location.href = data?.redirectTo || "/merchant/welcome";
        return;
      }

      const store = data.store as Store;

      setActiveStore(store);
      setActiveStoreId(store.id);
      setCategory(store.category || "");

      if (typeof window !== "undefined") {
        localStorage.setItem("mizar-store-id", store.id);
        localStorage.setItem("mizar-store-slug", store.slug);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل بيانات المتجر"
      );
    } finally {
      setLoadingStore(false);
    }
  }

  async function loadProducts(storeId = activeStoreId) {
    if (!storeId) return;

    setLoadingProducts(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/products?storeId=${storeId}&t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل المنتجات");
      }

      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل المنتجات"
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  function resetForm(hideForm = true) {
    setEditingProductId("");
    setName("");
    setDescription("");
    setCategory(activeStore?.category || "");
    setPrice("");
    setCompareAtPrice("");
    setCostPrice("");
    setMinSellingPrice("");
    setMaxDiscountPercent("");
    setStock("");
    setMedia([]);
    setProductAttributes({});
    setProductType("SIMPLE");
    setVariantOptions(createDefaultVariantOptions());
    setGeneratedVariants([]);
    setBulkPrice("");
    setBulkCompareAtPrice("");
    setBulkQuantity("");
    setBulkCostPrice("");
    setPreviewMedia(null);
    setErrorMessage("");
    setSuccessMessage("");

    if (hideForm) {
      setShowProductForm(false);
    }
  }

  function editProduct(product: Product) {
    setShowProductForm(true);
    setEditingProductId(product.id);
    setName(product.name || "");
    setDescription(product.description || "");
    setCategory(product.category || activeStore?.category || "");
    setPrice(String(product.discountPrice ?? product.price ?? ""));
    setCompareAtPrice(String(product.compareAtPrice ?? ""));
    setCostPrice(String(product.costPrice ?? ""));
    setMinSellingPrice(String(product.minSellingPrice ?? ""));
    setMaxDiscountPercent(String(product.maxDiscountPercent ?? ""));
    setStock(String(product.stock ?? ""));
    setMedia(normalizeProductMedia(product));
    setProductAttributes(normalizeAttributes(product.attributes));

    const apiVariants = normalizeProductVariantsFromApi(product);

    setProductType(apiVariants.length > 0 ? "VARIABLE" : "SIMPLE");
    setVariantOptions(normalizeProductOptionsFromApi(product));
    setGeneratedVariants(apiVariants);

    scrollToProductForm();
  }

  function updateAttribute(key: string, value: string) {
    setProductAttributes((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateVariantOption(index: number, key: keyof ProductOptionInput, value: string) {
    setVariantOptions((current) =>
      current.map((option, currentIndex) =>
        currentIndex === index
          ? {
              ...option,
              [key]: value,
            }
          : option
      )
    );
  }

  function addVariantOption() {
    if (variantOptions.length >= 3) {
      setErrorMessage("يمكن استخدام 3 اختيارات بحد أقصى.");
      return;
    }

    setVariantOptions((current) => [
      ...current,
      {
        name: "",
        valuesText: "",
      },
    ]);
  }

  function removeVariantOption(index: number) {
    setVariantOptions((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function generateVariants() {
    setErrorMessage("");
    setSuccessMessage("");

    const activeOptions = variantOptions
      .map((option) => ({
        name: option.name.trim(),
        values: parseOptionValues(option.valuesText),
      }))
      .filter((option) => option.name && option.values.length > 0);

    if (activeOptions.length === 0) {
      setErrorMessage("أدخل اختيار واحد على الأقل مثل اللون أو المقاس.");
      return;
    }

    const optionNames = activeOptions.map((option) => option.name);
    const combinations = buildVariantCombinations(activeOptions);

    if (combinations.length > 100) {
      setErrorMessage("عدد المتغيرات كبير جدًا. قلل عدد القيم أولًا.");
      return;
    }

    const existingVariantsMap = new Map(
      generatedVariants.map((variant) => [getVariantKey(variant.options), variant])
    );

    const skuBase = makeSafeSkuPart(
      `${activeStore?.slug || activeStore?.name || "MIZAR"}-${name || "PRODUCT"}`
    );

    const timePart = Date.now().toString(36).slice(-5).toUpperCase();

    const nextVariants = combinations.map((options, index) => {
      const key = getVariantKey(options);
      const existingVariant = existingVariantsMap.get(key);

      if (existingVariant) return existingVariant;

      return {
        title: createVariantTitle(options, optionNames),
        options,
        sku: `${skuBase}-${timePart}-${index + 1}`,
        barcode: "",
        price: price || "0",
        compareAtPrice: compareAtPrice || "",
        costPrice: "",
        quantity: "0",
        reservedQuantity: "0",
        lowStockAlert: "5",
        weight: "",
        imageUrl: "",
        status: "ACTIVE" as VariantStatusValue,
      };
    });

    setProductType("VARIABLE");
    setGeneratedVariants(nextVariants);
    setStock(
      String(
        nextVariants.reduce((sum, variant) => {
          return sum + toNumber(variant.quantity, 0);
        }, 0)
      )
    );
    setSuccessMessage(`تم توليد ${nextVariants.length} متغير للمنتج.`);
  }

  function updateGeneratedVariant<K extends keyof ProductVariantInput>(
    index: number,
    key: K,
    value: ProductVariantInput[K]
  ) {
    setGeneratedVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index
          ? {
              ...variant,
              [key]: value,
            }
          : variant
      )
    );
  }

  function removeGeneratedVariant(index: number) {
    setGeneratedVariants((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function applyBulkEdit() {
    if (!bulkPrice && !bulkCompareAtPrice && !bulkQuantity && !bulkCostPrice) {
      setErrorMessage("اكتب قيمة واحدة على الأقل للتعديل الجماعي.");
      return;
    }

    setGeneratedVariants((current) =>
      current.map((variant) => ({
        ...variant,
        price: bulkPrice || variant.price,
        compareAtPrice: bulkCompareAtPrice || variant.compareAtPrice,
        quantity: bulkQuantity || variant.quantity,
        costPrice: bulkCostPrice || variant.costPrice,
      }))
    );

    setSuccessMessage("تم تطبيق التعديل الجماعي على المتغيرات.");
  }

  function clearVariants() {
    setProductType("SIMPLE");
    setVariantOptions(createDefaultVariantOptions());
    setGeneratedVariants([]);
    setBulkPrice("");
    setBulkCompareAtPrice("");
    setBulkQuantity("");
    setBulkCostPrice("");
  }

  async function uploadFiles(files: FileList | File[]) {
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) return;

    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const uploadedMedia: ProductMedia[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products/media");

        const response = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "فشل رفع الملف");
        }

        if (!data?.url) {
          throw new Error("لم يتم استلام رابط الملف بعد الرفع");
        }

        uploadedMedia.push({
          type: data.type === "VIDEO" ? "VIDEO" : "IMAGE",
          url: data.url,
        });
      }

      setMedia((currentMedia) => [
        ...currentMedia,
        ...uploadedMedia.map((item, index) => ({
          ...item,
          sortOrder: currentMedia.length + index,
        })),
      ]);

      setSuccessMessage("تم رفع الملفات بنجاح");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "حدث خطأ أثناء رفع الملفات");
    } finally {
      setUploading(false);
    }
  }

  function removeMedia(index: number) {
    setMedia((currentMedia) =>
      currentMedia
        .filter((_, currentIndex) => currentIndex !== index)
        .map((item, currentIndex) => ({
          ...item,
          sortOrder: currentIndex,
        }))
    );
  }

  function moveMedia(index: number, direction: "up" | "down") {
    setMedia((currentMedia) => {
      const nextMedia = [...currentMedia];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= nextMedia.length) return currentMedia;

      const currentItem = nextMedia[index];
      const targetItem = nextMedia[targetIndex];

      nextMedia[index] = targetItem;
      nextMedia[targetIndex] = currentItem;

      return nextMedia.map((item, currentIndex) => ({
        ...item,
        sortOrder: currentIndex,
      }));
    });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeStoreId) {
      setErrorMessage("لا يوجد متجر نشط");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!name.trim()) throw new Error("اسم المنتج مطلوب");

      const priceNumber = Number(price);

      if (Number.isNaN(priceNumber) || priceNumber <= 0) {
        throw new Error("السعر بعد الخصم يجب أن يكون أكبر من صفر");
      }

      const compareAtPriceNumber = compareAtPrice ? Number(compareAtPrice) : null;
      const costPriceNumber = costPrice ? Number(costPrice) : null;
      const minSellingPriceNumber = minSellingPrice ? Number(minSellingPrice) : null;
      const maxDiscountPercentNumber = maxDiscountPercent ? Number(maxDiscountPercent) : null;

      if (compareAtPriceNumber !== null && priceNumber > compareAtPriceNumber) {
        throw new Error("السعر بعد الخصم لا يمكن أن يكون أكبر من السعر قبل الخصم");
      }

      if (minSellingPriceNumber !== null && priceNumber < minSellingPriceNumber) {
        throw new Error("السعر بعد الخصم أقل من أقل سعر مسموح للبيع");
      }

      const currentDiscount = getDiscountDetails({
        price: priceNumber,
        compareAtPrice: compareAtPriceNumber,
        maxDiscountPercent: maxDiscountPercentNumber,
      });

      if (currentDiscount.exceedsMaxDiscount) {
        throw new Error(
          `نسبة الخصم ${formatPercent(
            currentDiscount.discountPercent
          )} أكبر من الحد المسموح ${formatPercent(currentDiscount.maxDiscount)}`
        );
      }

      const stockNumber = Number(stock || 0);

      if (Number.isNaN(stockNumber) || stockNumber < 0) {
        throw new Error("المخزون يجب أن يكون رقم صحيح");
      }

      const normalizedMedia = media
        .filter((item) => item.url)
        .map((item, index) => ({
          type: item.type === "VIDEO" ? "VIDEO" : "IMAGE",
          url: item.url,
          sortOrder: index,
        }));

      const imageUrl = getMainImageFromMedia(normalizedMedia);
      const cleanedAttributes = cleanAttributes(productAttributes);

      const validVariantOptions = variantOptions
        .map((option, index) => ({
          name: option.name.trim(),
          values: parseOptionValues(option.valuesText),
          sortOrder: index,
        }))
        .filter((option) => option.name && option.values.length > 0);

      const validGeneratedVariants = generatedVariants
        .filter((variant) => variant.title.trim())
        .map((variant, index) => ({
          title: variant.title.trim(),
          options: variant.options,
          sku: variant.sku.trim() || null,
          barcode: variant.barcode.trim() || null,
          imageUrl: variant.imageUrl.trim() || null,
          price: Number(variant.price || priceNumber),
          compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
          costPrice: variant.costPrice ? Number(variant.costPrice) : null,
          quantity: Number(variant.quantity || 0),
          reservedQuantity: Number(variant.reservedQuantity || 0),
          lowStockAlert: Number(variant.lowStockAlert || 5),
          weight: variant.weight ? Number(variant.weight) : null,
          status: variant.status,
          sortOrder: index,
        }));

      for (const variant of validGeneratedVariants) {
        if (!Number.isFinite(variant.price) || variant.price <= 0) {
          throw new Error(`سعر المتغير "${variant.title}" يجب أن يكون أكبر من صفر`);
        }

        if (variant.compareAtPrice !== null && variant.price > variant.compareAtPrice) {
          throw new Error(
            `السعر بعد الخصم للمتغير "${variant.title}" لا يمكن أن يكون أكبر من السعر قبل الخصم`
          );
        }

        const variantDiscount = getDiscountDetails({
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          maxDiscountPercent: maxDiscountPercentNumber,
        });

        if (variantDiscount.exceedsMaxDiscount) {
          throw new Error(
            `خصم المتغير "${variant.title}" أكبر من الحد المسموح ${formatPercent(
              variantDiscount.maxDiscount
            )}`
          );
        }
      }

      if (productType === "VARIABLE") {
        if (validVariantOptions.length === 0) {
          throw new Error("أضف اختيارات المتغيرات مثل اللون أو المقاس.");
        }

        if (validGeneratedVariants.length === 0) {
          throw new Error("اضغط على توليد كل التركيبات أولًا.");
        }
      }

      const totalVariantStock =
        productType === "VARIABLE"
          ? validGeneratedVariants.reduce((sum, variant) => sum + Number(variant.quantity || 0), 0)
          : Math.floor(stockNumber);

      const payload = {
        storeId: activeStoreId,
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || activeStore?.category || null,
        price: priceNumber,
        compareAtPrice: compareAtPriceNumber,
        costPrice: costPriceNumber,
        minSellingPrice: minSellingPriceNumber,
        maxDiscountPercent: maxDiscountPercentNumber,
        stock: totalVariantStock,
        type: productType,
        imageUrl,
        media: normalizedMedia,
        attributes: cleanedAttributes,
        productOptions: productType === "VARIABLE" ? validVariantOptions : [],
        productVariants: productType === "VARIABLE" ? validGeneratedVariants : [],
        options: null,
        variants: null,
      };

      const response = await fetch(
        editingProductId ? `/api/products/${editingProductId}` : "/api/products",
        {
          method: editingProductId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || (editingProductId ? "فشل تعديل المنتج" : "فشل إضافة المنتج")
        );
      }

      setSuccessMessage(editingProductId ? "تم تعديل المنتج بنجاح" : "تم إضافة المنتج بنجاح");

      resetForm(true);
      await loadProducts(activeStoreId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "حدث خطأ أثناء حفظ المنتج");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`);

    if (!confirmed) return;

    setDeletingProductId(product.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل حذف المنتج");
      }

      setSuccessMessage("تم حذف المنتج بنجاح");

      if (editingProductId === product.id) {
        resetForm(true);
      }

      await loadProducts(activeStoreId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "حدث خطأ أثناء حذف المنتج");
    } finally {
      setDeletingProductId("");
    }
  }

  async function copyProductLink(product: Product) {
    if (!activeStore) return;

    const url = `${window.location.origin}/store/${activeStore.slug}/product/${product.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setSuccessMessage("تم نسخ رابط المنتج");
    } catch {
      setErrorMessage("تعذر نسخ رابط المنتج");
    }
  }

  useEffect(() => {
    loadCurrentStore();
  }, []);

  useEffect(() => {
    if (activeStoreId) {
      loadProducts(activeStoreId);
    }
  }, [activeStoreId]);

  if (loadingStore) {
    return (
      <main className="products-page space-y-5" dir="rtl">
        <style>{productsPageStyles}</style>
        <ProductsSkeleton />
      </main>
    );
  }

  if (!activeStore) {
    return (
      <main className="products-page space-y-5" dir="rtl">
        <style>{productsPageStyles}</style>

        <section className="products-card p-8 text-center">
          <div className="products-icon red mx-auto">
            <Icon name="warning" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            لا يوجد متجر مرتبط بحسابك
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
            لازم يكون عندك متجر واحد مرتبط بالحساب عشان تقدر تضيف المنتجات.
          </p>

          <Link href="/merchant/welcome" className="products-action primary mt-6">
            إعداد المتجر
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="products-page space-y-5" dir="rtl">
      <style>{productsPageStyles}</style>

      {previewMedia && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            onClick={() => setPreviewMedia(null)}
            className="absolute left-5 top-5 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black"
          >
            إغلاق
          </button>

          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-black">
            {previewMedia.type === "IMAGE" ? (
              <img
                src={previewMedia.url}
                alt="Preview"
                className="max-h-[90vh] w-full object-contain"
              />
            ) : (
              <video src={previewMedia.url} controls autoPlay className="max-h-[90vh] w-full" />
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      <section className="products-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <span className="products-pill">إدارة المنتجات</span>

            <h1 className="mt-4 text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
              منتجات {activeStore.displayName || activeStore.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              تابع منتجات المتجر أولًا، وبعدها أضف منتج جديد عند الحاجة. النموذج
              يظهر فقط بعد الضغط على زر إضافة منتج جديد.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                {activeStore.category || "نشاط عام"}
              </span>

              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                {activeStore.template || "GENERAL"}
              </span>

              <span
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"
                dir="ltr"
              >
                /store/{activeStore.slug}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="button"
              onClick={openCreateProductForm}
              className="products-action primary"
            >
              <Icon name="plus" />
              إضافة منتج جديد
            </button>

            <button
              type="button"
              onClick={() => loadProducts()}
              className="products-action secondary"
            >
              <Icon name="refresh" />
              تحديث المنتجات
            </button>

            <Link
              href={`/store/${activeStore.slug}`}
              target="_blank"
              rel="noreferrer"
              className="products-action secondary"
            >
              <Icon name="external" />
              معاينة المتجر
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="إجمالي المنتجات" value={formatNumber(stats.totalProducts)} note="كل المنتجات" icon="products" />
        <StatCard title="متاح للبيع" value={formatNumber(stats.availableProducts)} note="مخزون جيد" icon="check" />
        <StatCard title="مخزون منخفض" value={formatNumber(stats.lowStockProducts)} note="يحتاج متابعة" icon="warning" tone="gold" />
        <StatCard title="نفد المخزون" value={formatNumber(stats.outOfStockProducts)} note="غير متاح" icon="inventory" tone="red" />
        <StatCard title="بها خصم" value={formatNumber(stats.discountedProducts)} note="منتجات مخفضة" icon="discount" />
        <StatCard title="قيمة المخزون" value={formatMoney(stats.totalStockValue)} note="حسب سعر البيع" icon="price" />
      </section>

      <section className="products-card overflow-hidden">
        <div className="border-b border-[var(--border-soft)] p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                قائمة المنتجات
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                المنتجات تظهر أولًا لسهولة المتابعة، ويمكنك إضافة منتج جديد من الزر الموجود أعلى الصفحة أو أسفل القائمة.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,300px)_190px]">
              <div className="products-search-wrap">
                <Icon name="search" className="products-search-icon h-4 w-4" />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="products-input products-search-input"
                  placeholder="ابحث باسم المنتج أو التصنيف..."
                />
              </div>

              <div className="products-modern-select-wrap">
                <select
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value)}
                  className="products-select products-modern-select"
                >
                  <option value="ALL">كل الحالات</option>
                  <option value="AVAILABLE">المنتجات المتاحة</option>
                  <option value="LOW">مخزون منخفض</option>
                  <option value="OUT">نفد المخزون</option>
                </select>

                <span className="products-select-chevron">
                  <Icon name="chevron" className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {loadingProducts ? (
          <div className="p-5">
            <ProductsListSkeleton />
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="لا توجد منتجات مطابقة"
            description="اضغط على إضافة منتج جديد بالأسفل لبدء إضافة أول منتج."
          />
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {filteredProducts.map((product) => {
              const thumbnail = getProductThumbnail(product);
              const productStatus = getProductStatus(product);
              const discount = getDiscountDetails({
                price: getProductPrice(product),
                compareAtPrice: getProductCompareAtPrice(product),
              });

              return (
                <article
                  key={product.id}
                  className="products-row grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_170px_140px_260px] lg:items-center"
                >
                  <div className="flex min-w-0 gap-3">
                    <div className="products-thumbnail shrink-0">
                      {thumbnail ? (
                        <img src={thumbnail} alt={product.name} />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[var(--muted-foreground)]">
                          <Icon name="image" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {product.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted-foreground)]">
                        {product.description || "بدون وصف"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                          {product.category || "بدون تصنيف"}
                        </span>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                          {normalizeProductVariantsFromApi(product).length > 0 ? "متغيرات" : "بسيط"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-[var(--font-en)] text-sm font-bold text-[var(--foreground)]">
                      {formatMoney(getProductPrice(product))}
                    </p>

                    {discount.hasDiscount && (
                      <p className="mt-1 font-[var(--font-en)] text-xs font-semibold text-[var(--muted-foreground)] line-through">
                        {formatMoney(discount.originalPrice)}
                      </p>
                    )}

                    {discount.hasDiscount && (
                      <p className="mt-1 text-xs font-semibold text-emerald-700">
                        خصم {formatPercent(discount.discountPercent)}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className={`products-status ${productStatus.className}`}>
                      {productStatus.label}
                    </span>

                    <p className="mt-2 font-[var(--font-en)] text-xs font-semibold text-[var(--muted-foreground)]">
                      الكمية: {formatNumber(getProductStock(product))}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      className="products-action secondary"
                    >
                      <Icon name="edit" />
                      تعديل
                    </button>

                    <button
                      type="button"
                      onClick={() => copyProductLink(product)}
                      className="products-action secondary"
                    >
                      <Icon name="copy" />
                      نسخ الرابط
                    </button>

                    <Link
                      href={`/store/${activeStore.slug}/product/${product.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="products-action secondary"
                    >
                      <Icon name="external" />
                      معاينة
                    </Link>

                    <button
                      type="button"
                      onClick={() => deleteProduct(product)}
                      disabled={deletingProductId === product.id}
                      className="products-action danger disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Icon name="trash" />
                      {deletingProductId === product.id ? "حذف..." : "حذف"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {!showProductForm && (
        <section className="products-add-panel p-5 md:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div className="flex items-start gap-3">
              <span className="products-icon">
                <Icon name="plus" />
              </span>

              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  إضافة منتج جديد
                </h2>

                <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">
                  اضغط على الزر لفتح حقول إضافة المنتج. النموذج سيظهر أسفل هذا الكارت
                  بنفس تصميم الصفحة.
                </p>
              </div>
            </div>

            <button type="button" onClick={openCreateProductForm} className="products-action primary">
              <Icon name="plus" />
              إضافة منتج جديد
            </button>
          </div>
        </section>
      )}

      {showProductForm && (
        <form
          id="product-form-section"
          onSubmit={saveProduct}
          className="products-form-wrap grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]"
        >
          <section className="products-card p-5">
            <SectionHeader
              icon={editingProductId ? "edit" : "plus"}
              title={editingProductId ? "تعديل المنتج" : "إضافة منتج جديد"}
              description="البيانات الأساسية والسعر والمخزون."
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="اسم المنتج">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="products-input"
                  placeholder="مثال: تيشيرت قطن"
                />
              </Field>

              <Field label="التصنيف">
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="products-input"
                  placeholder="مثال: ملابس"
                  list="product-categories"
                />

                <datalist id="product-categories">
                  {categories.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </Field>

              <div className="md:col-span-2">
                <Field label="وصف المنتج">
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="products-textarea"
                    placeholder="اكتب وصف واضح ومختصر للمنتج..."
                  />
                </Field>
              </div>

              <Field label="نوع المنتج">
                <select
                  value={productType}
                  onChange={(event) => {
                    const value = event.target.value as ProductTypeValue;
                    setProductType(value);

                    if (value === "SIMPLE") {
                      clearVariants();
                    }
                  }}
                  className="products-select"
                >
                  <option value="SIMPLE">منتج بسيط</option>
                  <option value="VARIABLE">منتج بمتغيرات</option>
                </select>
              </Field>

              <Field label="المخزون">
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  className="products-input"
                  placeholder="0"
                  disabled={productType === "VARIABLE"}
                />
                {productType === "VARIABLE" && (
                  <p className="products-help">
                    يتم حساب المخزون تلقائيًا من مجموع كميات المتغيرات.
                  </p>
                )}
              </Field>
            </div>

            <div className="mt-6 rounded-3xl border border-[var(--border-soft)] bg-[rgba(248,250,252,0.72)] p-4">
              <SectionHeader
                icon="price"
                title="الأسعار والخصومات"
                description="السعر النهائي هو السعر الذي يظهر للعميل أثناء الشراء."
                small
              />

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="السعر بعد الخصم">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="products-input"
                    placeholder="0"
                  />
                </Field>

                <Field label="السعر قبل الخصم">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(event) => setCompareAtPrice(event.target.value)}
                    className="products-input"
                    placeholder="اختياري"
                  />
                </Field>

                <Field label="تكلفة المنتج">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(event) => setCostPrice(event.target.value)}
                    className="products-input"
                    placeholder="اختياري"
                  />
                </Field>

                <Field label="أقل سعر مسموح">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minSellingPrice}
                    onChange={(event) => setMinSellingPrice(event.target.value)}
                    className="products-input"
                    placeholder="اختياري"
                  />
                </Field>

                <Field label="أقصى نسبة خصم">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={maxDiscountPercent}
                    onChange={(event) => setMaxDiscountPercent(event.target.value)}
                    className="products-input"
                    placeholder="اختياري"
                  />
                </Field>

                <div className="products-price-note">
                  <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                    الخصم الحالي
                  </p>

                  <p className="mt-2 font-[var(--font-en)] text-xl font-bold text-[var(--foreground)]">
                    {formatPercent(priceDetails.discountPercent)}
                  </p>

                  <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
                    وفر للعميل {formatMoney(priceDetails.discountAmount)}
                  </p>
                </div>
              </div>

              {priceDetails.exceedsMaxDiscount && (
                <div className="products-error-note mt-4 text-sm font-semibold">
                  الخصم الحالي أكبر من أقصى نسبة خصم مسموحة.
                </div>
              )}
            </div>

            {productSchemaFields.length > 0 && (
              <div className="mt-6 rounded-3xl border border-[var(--border-soft)] bg-white p-4">
                <SectionHeader
                  icon="spark"
                  title="حقول مخصصة للنشاط"
                  description={getSchemaHint(productSchema?.productType)}
                  small
                />

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {productSchemaFields.map((field) => (
                    <Field key={field.key} label={field.label}>
                      <input
                        value={productAttributes[field.key] || ""}
                        onChange={(event) => updateAttribute(field.key, event.target.value)}
                        className="products-input"
                        placeholder={field.label}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-3xl border border-[var(--border-soft)] bg-white p-4">
              <SectionHeader
                icon="image"
                title="صور وفيديوهات المنتج"
                description="أول صورة سيتم استخدامها كصورة رئيسية للمنتج."
                small
              />

              <div className="mt-4 products-media-empty">
                <div>
                  <div className="products-icon mx-auto">
                    <Icon name="upload" />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                    ارفع صور أو فيديوهات المنتج
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    يفضل صور واضحة بخلفية بسيطة.
                  </p>

                  <label className="products-action secondary mt-4 cursor-pointer">
                    <Icon name="upload" />
                    {uploading ? "جاري الرفع..." : "اختيار الملفات"}
                    <input
                      type="file"
                      multiple
                      accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.bmp,.ico,.tif,.tiff,.heic,.heif,video/*,.mp4,.webm,.mov,.m4v,.avi,.mpeg,.mpg,.ogv"
                      className="hidden"
                      disabled={uploading}
                      onChange={(event) => {
                        if (event.target.files) {
                          uploadFiles(event.target.files);
                          event.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {media.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {media.map((item, index) => (
                    <div key={`${item.url}-${index}`} className="products-media-tile">
                      <button
                        type="button"
                        onClick={() => setPreviewMedia(item)}
                        className="h-full w-full"
                      >
                        {item.type === "IMAGE" ? (
                          <img src={item.url} alt={`media-${index}`} />
                        ) : (
                          <video src={item.url} />
                        )}
                      </button>

                      <div className="absolute inset-x-2 bottom-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveMedia(index, "up")}
                          className="flex-1 rounded-xl bg-white/90 px-2 py-2 text-xs font-bold text-[var(--foreground)]"
                        >
                          أعلى
                        </button>

                        <button
                          type="button"
                          onClick={() => moveMedia(index, "down")}
                          className="flex-1 rounded-xl bg-white/90 px-2 py-2 text-xs font-bold text-[var(--foreground)]"
                        >
                          أسفل
                        </button>

                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="rounded-xl bg-red-600 px-2 py-2 text-xs font-bold text-white"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {productType === "VARIABLE" && (
              <div className="mt-6 rounded-3xl border border-[var(--border-soft)] bg-white p-4">
                <SectionHeader
                  icon="layers"
                  title="متغيرات المنتج"
                  description="استخدمها للمنتجات التي لها لون، مقاس، موديل، أو أي اختيار."
                  small
                />

                <div className="mt-4 grid gap-3">
                  {variantOptions.map((option, index) => (
                    <div key={index} className="products-option-card">
                      <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-end">
                        <Field label="اسم الاختيار">
                          <input
                            value={option.name}
                            onChange={(event) =>
                              updateVariantOption(index, "name", event.target.value)
                            }
                            className="products-input"
                            placeholder="اللون"
                            list={`option-name-${index}`}
                          />

                          <datalist id={`option-name-${index}`}>
                            {Object.keys(schemaDefaultOptions).map((item) => (
                              <option key={item} value={item} />
                            ))}
                          </datalist>
                        </Field>

                        <Field label="القيم">
                          <input
                            value={option.valuesText}
                            onChange={(event) =>
                              updateVariantOption(index, "valuesText", event.target.value)
                            }
                            className="products-input"
                            placeholder="أحمر، أسود، أبيض"
                          />
                        </Field>

                        <button
                          type="button"
                          onClick={() => removeVariantOption(index)}
                          className="products-action danger"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={addVariantOption} className="products-action secondary">
                    <Icon name="plus" />
                    إضافة اختيار
                  </button>

                  <button type="button" onClick={generateVariants} className="products-action primary">
                    <Icon name="spark" />
                    توليد التركيبات
                  </button>

                  <button type="button" onClick={clearVariants} className="products-action ghost">
                    مسح المتغيرات
                  </button>
                </div>

                <div className="products-help">
                  المتغيرات المتوقعة: {formatNumber(variantOptionsPreview.totalCombinations)}
                </div>

                {generatedVariants.length > 0 && (
                  <div className="mt-5">
                    <div className="rounded-3xl border border-[var(--border-soft)] bg-[rgba(248,250,252,0.72)] p-4">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        تعديل جماعي للمتغيرات
                      </p>

                      <div className="mt-3 grid gap-3 md:grid-cols-4">
                        <input
                          value={bulkPrice}
                          onChange={(event) => setBulkPrice(event.target.value)}
                          className="products-input"
                          placeholder="السعر"
                        />

                        <input
                          value={bulkCompareAtPrice}
                          onChange={(event) => setBulkCompareAtPrice(event.target.value)}
                          className="products-input"
                          placeholder="قبل الخصم"
                        />

                        <input
                          value={bulkQuantity}
                          onChange={(event) => setBulkQuantity(event.target.value)}
                          className="products-input"
                          placeholder="الكمية"
                        />

                        <input
                          value={bulkCostPrice}
                          onChange={(event) => setBulkCostPrice(event.target.value)}
                          className="products-input"
                          placeholder="التكلفة"
                        />
                      </div>

                      <button type="button" onClick={applyBulkEdit} className="products-action secondary mt-3">
                        تطبيق على كل المتغيرات
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {generatedVariants.map((variant, index) => (
                        <div key={`${variant.title}-${index}`} className="products-variant-row">
                          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                            <div>
                              <p className="text-sm font-semibold text-[var(--foreground)]">
                                {variant.title || `متغير ${index + 1}`}
                              </p>

                              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                                {Object.entries(variant.options)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(" — ")}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeGeneratedVariant(index)}
                              className="products-action danger"
                            >
                              حذف
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-5">
                            <input
                              value={variant.price}
                              onChange={(event) =>
                                updateGeneratedVariant(index, "price", event.target.value)
                              }
                              className="products-input"
                              placeholder="السعر"
                            />

                            <input
                              value={variant.compareAtPrice}
                              onChange={(event) =>
                                updateGeneratedVariant(index, "compareAtPrice", event.target.value)
                              }
                              className="products-input"
                              placeholder="قبل الخصم"
                            />

                            <input
                              value={variant.quantity}
                              onChange={(event) =>
                                updateGeneratedVariant(index, "quantity", event.target.value)
                              }
                              className="products-input"
                              placeholder="الكمية"
                            />

                            <input
                              value={variant.sku}
                              onChange={(event) =>
                                updateGeneratedVariant(index, "sku", event.target.value)
                              }
                              className="products-input"
                              placeholder="SKU"
                            />

                            <select
                              value={variant.status}
                              onChange={(event) =>
                                updateGeneratedVariant(
                                  index,
                                  "status",
                                  event.target.value as VariantStatusValue
                                )
                              }
                              className="products-select"
                            >
                              <option value="ACTIVE">نشط</option>
                              <option value="HIDDEN">مخفي</option>
                              <option value="OUT_OF_STOCK">نفد المخزون</option>
                              <option value="DISABLED">معطل</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving || uploading}
                className="products-action primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="check" />
                {saving ? "جاري الحفظ..." : editingProductId ? "حفظ التعديل" : "إضافة المنتج"}
              </button>

              <button type="button" onClick={() => resetForm(true)} className="products-action secondary">
                <Icon name="close" />
                إغلاق النموذج
              </button>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="products-card p-5">
              <SectionHeader
                icon="store"
                title="المتجر الحالي"
                description="كل المنتجات ستضاف داخل هذا المتجر فقط."
                small
              />

              <div className="mt-4 rounded-2xl border border-[var(--border-soft)] bg-white p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {activeStore.displayName || activeStore.name}
                </p>

                <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]" dir="ltr">
                  /store/{activeStore.slug}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--mint-soft)] px-3 py-1 text-xs font-semibold text-[var(--mint-hover)]">
                    {activeStore.category || "نشاط عام"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {activeStore.template || "GENERAL"}
                  </span>
                </div>
              </div>
            </section>

            <section className="products-card p-5">
              <SectionHeader
                icon="discount"
                title="ملخص التسعير"
                description="راجع السعر والخصم قبل الحفظ."
                small
              />

              <div className="mt-4 grid gap-3">
                <SummaryRow label="السعر قبل الخصم" value={compareAtPrice ? formatMoney(compareAtPrice) : "غير محدد"} />
                <SummaryRow label="السعر بعد الخصم" value={price ? formatMoney(price) : "0 ج.م"} />
                <SummaryRow label="قيمة الخصم" value={formatMoney(priceDetails.discountAmount)} />
                <SummaryRow label="نسبة الخصم" value={formatPercent(priceDetails.discountPercent)} />
                <SummaryRow label="تكلفة المنتج" value={costPrice ? formatMoney(costPrice) : "غير محددة"} />
              </div>

              {priceDetails.exceedsMaxDiscount && (
                <div className="products-error-note mt-4 text-sm font-semibold">
                  الخصم الحالي أكبر من المسموح.
                </div>
              )}
            </section>

            <section className="products-card p-5">
              <SectionHeader
                icon="spark"
                title="نصيحة سريعة"
                description="خلي أول صورة واضحة وخلفيتها بسيطة، واكتب وصف قصير يساعد العميل يفهم المنتج بسرعة."
                small
              />
            </section>
          </aside>
        </form>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="products-label">{label}</span>
      {children}
    </label>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  small,
}: {
  icon: IconName;
  title: string;
  description?: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="products-icon">
        <Icon name={icon} />
      </span>

      <div>
        <h2
          className={`font-semibold text-[var(--foreground)] ${
            small ? "text-lg" : "text-xl"
          }`}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  note,
  icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: IconName;
  tone?: "gold" | "red";
}) {
  const iconClass =
    tone === "red" ? "products-icon red" : tone === "gold" ? "products-icon gold" : "products-icon";

  return (
    <article className="products-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>

          <p className="products-stat-value mt-4" dir="ltr">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{note}</p>
        </div>

        <span className={iconClass}>
          <Icon name={icon} />
        </span>
      </div>
    </article>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-white p-3">
      <span className="text-sm font-medium text-[var(--muted-foreground)]">{label}</span>

      <strong className="font-[var(--font-en)] text-sm font-semibold text-[var(--foreground)]">
        {value}
      </strong>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8 text-center">
      <div className="products-icon navy mx-auto">
        <Icon name="products" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{title}</h3>

      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <>
      <section className="products-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div>
            <div className="products-skeleton h-8 w-36" />
            <div className="products-skeleton mt-5 h-9 w-72 max-w-full" />
            <div className="products-skeleton mt-4 h-4 w-[560px] max-w-full" />
            <div className="products-skeleton mt-3 h-4 w-[440px] max-w-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="products-skeleton h-11 w-full" />
            <div className="products-skeleton h-11 w-full" />
            <div className="products-skeleton h-11 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="products-card p-5">
            <div className="products-skeleton h-4 w-28" />
            <div className="products-skeleton mt-4 h-8 w-20" />
            <div className="products-skeleton mt-3 h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="products-card p-5">
        <div className="products-skeleton h-7 w-44" />

        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="products-skeleton h-14 w-14 rounded-[17px]" />

                <div className="flex-1">
                  <div className="products-skeleton h-4 w-44 max-w-full" />
                  <div className="products-skeleton mt-2 h-3 w-64 max-w-full" />
                </div>
              </div>

              <div className="products-skeleton h-9 w-28" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ProductsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="products-skeleton h-14 w-14 rounded-[17px]" />

            <div className="flex-1">
              <div className="products-skeleton h-4 w-44 max-w-full" />
              <div className="products-skeleton mt-2 h-3 w-64 max-w-full" />
            </div>
          </div>

          <div className="products-skeleton h-9 w-28" />
        </div>
      ))}
    </div>
  );
}