export type StorefrontStoreLike = {
  id?: string | null;
  slug?: string | null;
};

export type StorefrontCartProduct = {
  id?: string | null;
  slug?: string | null;
  handle?: string | null;
  name?: string | null;
  title?: string | null;
  sku?: string | null;
  price?: number | string | null;
  finalPrice?: number | string | null;
  discountPrice?: number | string | null;
  compareAtPrice?: number | string | null;
  stock?: number | string | null;
  availableStock?: number | string | null;
  availableQuantity?: number | string | null;
  quantity?: number | string | null;
  inventoryQuantity?: number | string | null;
  reservedStock?: number | string | null;
  trackInventory?: boolean | null;
  inventoryPolicy?: string | null;
  imageUrl?: string | null;
  coverUrl?: string | null;
  thumbnailUrl?: string | null;
  media?: any[] | null;
  productOptions?: any[] | null;
  productVariants?: any[] | null;
  variants?: any[] | null;
};

export type StorefrontCartItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  price?: number;
  unitPrice?: number;
  lineTotal?: number;
  compareAtPrice?: number | null;
  name?: string;
  variantTitle?: string | null;
  selectedOptions?: Record<string, string> | null;
  imageUrl?: string;
  sku?: string | null;
  slug?: string | null;
  stock?: number | null;
  availableStock?: number | null;
  product?: any;
  variant?: any;
};

const CART_EVENT_NAME = "mizar-cart-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function firstText(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }

  return "";
}

function toNumber(value: any, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstNumber(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;

    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }

  return null;
}

function resolveUrl(value?: string | null) {
  const url = String(value || "").trim();

  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  return `/${url.replace(/^\/+/, "")}`;
}

export function getStoreIdentityCandidates(store: StorefrontStoreLike | null | undefined) {
  const values = [
    firstText(store?.id),
    firstText(store?.slug),
    firstText(store?.id, store?.slug, "default"),
    "default",
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return Array.from(new Set(values));
}

export function getCartStorageKeys(store: StorefrontStoreLike | null | undefined) {
  const keys: string[] = [];

  for (const value of getStoreIdentityCandidates(store)) {
    keys.push(
      `mizar-cart:${value}`,
      `mizar-cart-${value}`,
      `cart:${value}`,
      `cart-${value}`,
      `storefront-cart:${value}`,
    );
  }

  keys.push("mizar-cart", "cart", "storefront-cart");

  return Array.from(new Set(keys));
}

export function readJsonArray(key: string) {
  if (!isBrowser()) return [] as any[];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function productIdFromAny(value: any) {
  return firstText(
    value?.productId,
    value?.product?.id,
    value?.id,
    value?.product?.slug,
    value?.slug,
  );
}

function variantIdFromAny(value: any) {
  return firstText(
    value?.variantId,
    value?.variant?.id,
    value?.productVariantId,
  );
}

function lineKey(value: any) {
  return `${productIdFromAny(value)}::${variantIdFromAny(value)}`;
}

function variantTitle(variant: any) {
  return firstText(
    variant?.title,
    variant?.name,
    variant?.label,
    variant?.options && typeof variant.options === "object"
      ? Object.values(variant.options).filter(Boolean).join(" / ")
      : "",
  );
}

function normalizeSelectedOptions(value: any) {
  const source = value?.selectedOptions || value?.options || value?.variant?.options;

  if (!source || typeof source !== "object" || Array.isArray(source)) return null;

  const entries = Object.entries(source)
    .map(([key, optionValue]) => [String(key || "").trim(), String(optionValue || "").trim()] as const)
    .filter(([key, optionValue]) => key && optionValue);

  return entries.length ? Object.fromEntries(entries) : null;
}

export function getProductImage(product: any) {
  const media = Array.isArray(product?.media) ? product.media : [];

  const cover =
    media.find((item: any) => item?.isCover && (item?.url || item?.imageUrl || item?.fileUrl)) ||
    media.find((item: any) => item?.url || item?.imageUrl || item?.fileUrl);

  return resolveUrl(
    firstText(
      product?.imageUrl,
      product?.coverUrl,
      product?.thumbnailUrl,
      cover?.url,
      cover?.imageUrl,
      cover?.fileUrl,
    ),
  );
}

function getVariantImage(product: any, variant: any) {
  if (!variant) return getProductImage(product);

  const media = Array.isArray(variant?.media) ? variant.media : [];
  const cover =
    media.find((item: any) => item?.isCover && (item?.url || item?.imageUrl || item?.fileUrl)) ||
    media.find((item: any) => item?.url || item?.imageUrl || item?.fileUrl);

  return resolveUrl(
    firstText(
      variant?.imageUrl,
      variant?.coverUrl,
      variant?.thumbnailUrl,
      cover?.url,
      cover?.imageUrl,
      cover?.fileUrl,
      getProductImage(product),
    ),
  );
}

export function getProductPrice(product: any, variant?: any) {
  if (variant) {
    return toNumber(variant.price, toNumber(product?.price, 0));
  }

  return toNumber(
    firstText(
      product?.finalPrice,
      product?.discountPrice,
      product?.price,
    ),
    0,
  );
}

function getCompareAtPrice(product: any, variant?: any) {
  const compareAtPrice = variant
    ? firstNumber(variant?.compareAtPrice, product?.compareAtPrice)
    : firstNumber(product?.compareAtPrice, product?.oldPrice, product?.originalPrice);

  const price = getProductPrice(product, variant);

  return compareAtPrice !== null && compareAtPrice > price ? compareAtPrice : null;
}

function findProduct(products: any[], productId: string) {
  return products.find((product) => {
    const ids = [
      product?.id,
      product?.slug,
      product?.handle,
    ].map((value) => String(value || ""));

    return ids.includes(String(productId));
  });
}

export function getProductVariants(product: any) {
  return Array.isArray(product?.productVariants) && product.productVariants.length
    ? product.productVariants
    : Array.isArray(product?.variants)
      ? product.variants
      : [];
}

function findVariant(product: any, variantId?: string | null) {
  if (!variantId) return null;

  return getProductVariants(product).find((variant: any) => String(variant?.id) === String(variantId)) || null;
}

function inventoryIsUnlimited(product: any, variant?: any) {
  const policy = String(variant?.inventoryPolicy || product?.inventoryPolicy || "").toUpperCase();

  return product?.trackInventory === false || policy === "CONTINUE_SELLING";
}

export function getAvailableStock(product: any, variant?: any) {
  if (inventoryIsUnlimited(product, variant)) return null;

  const quantity = variant
    ? firstNumber(variant?.availableStock, variant?.availableQuantity, variant?.inventoryQuantity, variant?.stock, variant?.quantity)
    : firstNumber(product?.availableStock, product?.availableQuantity, product?.inventoryQuantity, product?.stock, product?.quantity);

  if (quantity === null) return null;

  return Math.max(0, Math.floor(quantity));
}

function variantIsActive(variant: any) {
  const status = String(variant?.status || "ACTIVE").toUpperCase();

  return !["OUT_OF_STOCK", "HIDDEN", "DISABLED", "INACTIVE", "ARCHIVED"].includes(status);
}

function productIsActive(product: any) {
  const status = String(product?.status || "ACTIVE").toUpperCase();

  return !["OUT_OF_STOCK", "HIDDEN", "DISABLED", "INACTIVE", "ARCHIVED", "DRAFT"].includes(status);
}

function clampQuantity(product: any, variant: any, quantity: number) {
  const safeQuantity = Math.max(1, Math.floor(toNumber(quantity, 1)));
  const stock = variant ? getAvailableStock(product, variant) : getProductVariants(product).length ? null : getAvailableStock(product);

  if (stock === null) return safeQuantity;

  return Math.max(0, Math.min(safeQuantity, stock));
}

export function cartItemNeedsVariant(item: any) {
  return getProductVariants(item?.product).length > 0 && !variantIdFromAny(item);
}

export function normalizeCartItem(item: any, products: any[] = []): StorefrontCartItem {
  const productId = productIdFromAny(item);
  const variantId = variantIdFromAny(item) || null;
  const product = item?.product || findProduct(products, productId) || null;
  const variants = getProductVariants(product);
  const variant = item?.variant || findVariant(product, variantId) || null;

  const quantity = Math.max(1, Math.floor(toNumber(item?.quantity, 1)));
  const price = toNumber(
    firstText(
      item?.price,
      item?.unitPrice,
      variant?.price,
      product?.finalPrice,
      product?.discountPrice,
      product?.price,
    ),
    0,
  );
  const selectedOptions = normalizeSelectedOptions({ ...item, variant });
  const selectedStock = variant ? getAvailableStock(product, variant) : variants.length ? null : getAvailableStock(product);
  const fallbackStock = firstNumber(item?.stock, item?.availableStock);
  const stock = selectedStock ?? fallbackStock;
  const imageUrl = resolveUrl(firstText(item?.imageUrl, getVariantImage(product, variant), getProductImage(product)));

  return {
    ...item,
    productId,
    variantId,
    product,
    variant,
    quantity,
    price,
    unitPrice: price,
    lineTotal: price * quantity,
    compareAtPrice: getCompareAtPrice(product, variant),
    imageUrl,
    name: firstText(item?.name, product?.name, product?.title, productId),
    variantTitle: firstText(item?.variantTitle, variantTitle(variant)) || null,
    selectedOptions,
    sku: firstText(item?.sku, variant?.sku, product?.sku) || null,
    slug: firstText(item?.slug, product?.slug) || null,
    stock: stock === null || stock === undefined ? null : Math.max(0, Math.floor(stock)),
    availableStock: stock === null || stock === undefined ? null : Math.max(0, Math.floor(stock)),
  };
}

export function readRawCart(store: StorefrontStoreLike | null | undefined) {
  if (!isBrowser()) return [] as any[];

  const merged: any[] = [];
  const seen = new Set<string>();

  for (const key of getCartStorageKeys(store)) {
    const rows = readJsonArray(key);

    for (const row of rows) {
      const productId = productIdFromAny(row);

      if (!productId) continue;

      const key = lineKey(row);
      const existingIndex = merged.findIndex((item) => lineKey(item) === key);

      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...row,
          quantity: Math.max(
            toNumber(merged[existingIndex].quantity, 1),
            toNumber(row.quantity, 1),
          ),
        };

        continue;
      }

      if (seen.has(key)) continue;

      seen.add(key);
      merged.push(row);
    }
  }

  return merged;
}

export function readCart(store: StorefrontStoreLike | null | undefined, products: any[] = []) {
  return readRawCart(store).map((item) => normalizeCartItem(item, products));
}

export function saveCart(store: StorefrontStoreLike | null | undefined, items: any[]) {
  if (!isBrowser()) return;

  const normalized = Array.isArray(items)
    ? items
        .map((item) => normalizeCartItem(item))
        .filter((item) => item.productId)
    : [];

  for (const key of getCartStorageKeys(store)) {
    window.localStorage.setItem(key, JSON.stringify(normalized));
  }

  window.dispatchEvent(
    new CustomEvent(CART_EVENT_NAME, {
      detail: {
        storeId: firstText(store?.id, store?.slug, "default"),
        cart: normalized,
      },
    }),
  );
}

export function addCartItem(
  storeOrProps: any,
  product: StorefrontCartProduct,
  quantity = 1,
  variant?: any,
) {
  if (!isBrowser()) return;

  const store = storeOrProps?.store || storeOrProps || {};
  const productId = firstText(product?.id, product?.slug);
  const selectedVariant = variant?.id ? variant : null;

  if (!productId || !productIsActive(product) || (selectedVariant && !variantIsActive(selectedVariant))) return;

  const stock = selectedVariant ? getAvailableStock(product, selectedVariant) : getProductVariants(product).length ? null : getAvailableStock(product);

  if (stock !== null && stock <= 0) return;

  const variantId = firstText(selectedVariant?.id);
  const targetKey = `${productId}::${variantId}`;
  const current = readRawCart(store);
  const existingIndex = current.findIndex((item) => lineKey(item) === targetKey);
  const price = getProductPrice(product, selectedVariant);
  const addedQuantity = Math.max(1, Math.floor(toNumber(quantity, 1)));

  if (existingIndex >= 0) {
    const currentQuantity = toNumber(current[existingIndex].quantity, 1);
    const nextQuantity = stock === null ? currentQuantity + addedQuantity : Math.min(stock, currentQuantity + addedQuantity);

    current[existingIndex] = {
      ...current[existingIndex],
      product,
      variant: selectedVariant || current[existingIndex].variant || null,
      quantity: Math.max(1, nextQuantity),
      price,
      unitPrice: price,
      compareAtPrice: getCompareAtPrice(product, selectedVariant),
      imageUrl: getVariantImage(product, selectedVariant),
      name: firstText(product?.name, product?.title),
      variantTitle: variantTitle(selectedVariant) || null,
      selectedOptions: normalizeSelectedOptions({ variant: selectedVariant }),
      slug: product?.slug || null,
      sku: firstText(selectedVariant?.sku, product?.sku) || null,
      stock,
      availableStock: stock,
    };
  } else {
    const safeQuantity = clampQuantity(product, selectedVariant, addedQuantity);

    if (safeQuantity <= 0) return;

    current.push({
      productId,
      variantId: variantId || null,
      product,
      variant: selectedVariant || null,
      quantity: safeQuantity,
      price,
      unitPrice: price,
      compareAtPrice: getCompareAtPrice(product, selectedVariant),
      imageUrl: getVariantImage(product, selectedVariant),
      name: firstText(product?.name, product?.title),
      variantTitle: variantTitle(selectedVariant) || null,
      selectedOptions: normalizeSelectedOptions({ variant: selectedVariant }),
      slug: product?.slug || null,
      sku: firstText(selectedVariant?.sku, product?.sku) || null,
      stock,
      availableStock: stock,
    });
  }

  saveCart(store, current);
}

export function updateCartItemVariant(
  store: StorefrontStoreLike | null | undefined,
  productId: string,
  variant: any,
  oldVariantId?: string | null,
  productOverride?: any,
) {
  if (!variant?.id) return false;

  const variantId = firstText(variant.id);
  const sourceKey = `${productId}::${oldVariantId || ""}`;
  const targetKey = `${productId}::${variantId}`;
  const current = readRawCart(store);
  const sourceIndex = current.findIndex((item) => lineKey(item) === sourceKey);

  if (sourceIndex < 0 || !variantIsActive(variant)) return false;

  const source = current[sourceIndex];
  const product = productOverride || source.product || {};
  const stock = getAvailableStock(product, variant);

  if (stock !== null && stock <= 0) return false;

  const sourceQuantity = Math.max(1, Math.floor(toNumber(source.quantity, 1)));
  const selectedQuantity = stock === null ? sourceQuantity : Math.min(sourceQuantity, stock);
  const price = getProductPrice(product, variant);
  const updatedItem = {
    ...source,
    productId,
    product,
    variantId,
    variant,
    quantity: selectedQuantity,
    price,
    unitPrice: price,
    compareAtPrice: getCompareAtPrice(product, variant),
    imageUrl: getVariantImage(product, variant),
    name: firstText(product?.name, product?.title, source.name),
    variantTitle: variantTitle(variant) || null,
    selectedOptions: normalizeSelectedOptions({ variant }),
    slug: product?.slug || source.slug || null,
    sku: firstText(variant?.sku, product?.sku) || null,
    stock,
    availableStock: stock,
  };

  let next = current.slice();

  if (sourceKey === targetKey) {
    next[sourceIndex] = updatedItem;
  } else {
    next = next.filter((_, index) => index !== sourceIndex);
    const existingIndex = next.findIndex((item) => lineKey(item) === targetKey);

    if (existingIndex >= 0) {
      const existingQuantity = Math.max(1, Math.floor(toNumber(next[existingIndex].quantity, 1)));
      const mergedQuantity = stock === null
        ? existingQuantity + selectedQuantity
        : Math.min(stock, existingQuantity + selectedQuantity);

      next[existingIndex] = {
        ...next[existingIndex],
        ...updatedItem,
        quantity: mergedQuantity,
      };
    } else {
      next.push(updatedItem);
    }
  }

  saveCart(store, next);
  return true;
}

export function updateCartItemQuantity(
  store: StorefrontStoreLike | null | undefined,
  productId: string,
  quantity: number,
  variantId?: string | null,
) {
  const targetKey = `${productId}::${variantId || ""}`;
  const current = readRawCart(store);

  const next =
    quantity <= 0
      ? current.filter((item) => lineKey(item) !== targetKey)
      : current.map((item) => {
          if (lineKey(item) !== targetKey) return item;

          const normalized = normalizeCartItem(item);
          const stock = normalized.stock;
          const safeQuantity = Math.max(1, Math.floor(quantity));

          return {
            ...item,
            quantity: stock !== null && stock !== undefined ? Math.min(safeQuantity, stock) : safeQuantity,
          };
        });

  saveCart(store, next);
}

export function removeCartItem(
  store: StorefrontStoreLike | null | undefined,
  productId: string,
  variantId?: string | null,
) {
  updateCartItemQuantity(store, productId, 0, variantId);
}

export function clearCart(store: StorefrontStoreLike | null | undefined) {
  saveCart(store, []);
}

export function getCartCount(store: StorefrontStoreLike | null | undefined) {
  return readCart(store).reduce((sum, item) => sum + Number(item.quantity || 1), 0);
}

export function getCartSubtotal(store: StorefrontStoreLike | null | undefined, products: any[] = []) {
  return readCart(store, products).reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
}
