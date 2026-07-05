export type StorefrontCartItem = {
  id?: string | null;
  productId: string;
  variantId?: string | null;
  name?: string | null;
  variantTitle?: string | null;
  selectedOptions?: Record<string, string> | null;
  sku?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  quantity: number;
  imageUrl?: string | null;
  stock?: number | null;
  product?: any;
  variant?: any;
};

export function getStorefrontCartKeys(storeId: string) {
  const value = String(storeId || "").trim();

  if (!value) return [];

  return Array.from(
    new Set([
      value,
      `mizar-cart:${value}`,
      `mizar-cart-${value}`,
      `cart:${value}`,
      `cart-${value}`,
    ])
  );
}

function normalizeVariantId(item: Partial<StorefrontCartItem>) {
  if (item.variantId) return String(item.variantId);
  if (item.variant?.id) return String(item.variant.id);

  const id = String(item.id || "");
  const parts = id.split(":");

  if (parts.length >= 2 && parts[1] && parts[1] !== "default") {
    return parts[1];
  }

  return null;
}

function normalizeProductId(item: Partial<StorefrontCartItem>) {
  if (item.productId) return String(item.productId);
  if (item.product?.id) return String(item.product.id);

  const id = String(item.id || "");
  const parts = id.split(":");

  return parts[0] || "";
}

export function getStorefrontCartItemKey(item: Partial<StorefrontCartItem>) {
  const productId = normalizeProductId(item);
  const variantId = normalizeVariantId(item);

  return variantId ? `${productId}:${variantId}` : productId;
}

function normalizeImageUrl(value?: string | null) {
  const url = String(value || "").trim();

  if (!url) return null;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  return `/${url.replace(/^\/+/, "")}`;
}

function normalizeNumber(value: unknown, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function normalizeLegacyCartItem(value: unknown): StorefrontCartItem | null {
  if (!value || typeof value !== "object") return null;

  const item = value as any;
  const productId = normalizeProductId(item);

  if (!productId) return null;

  const variantId = normalizeVariantId(item);
  const product = item.product || null;
  const variant = item.variant || null;
  const price = normalizeNumber(
    item.price ?? variant?.price ?? product?.discountPrice ?? product?.price,
    0
  );
  const compareAtPrice = normalizeNumber(
    item.compareAtPrice ?? variant?.compareAtPrice ?? product?.compareAtPrice,
    0
  );

  return {
    ...item,
    id: `${productId}:${variantId || "default"}`,
    productId,
    variantId,
    name: item.name || product?.name || "منتج",
    variantTitle: item.variantTitle || variant?.title || null,
    selectedOptions: item.selectedOptions || variant?.options || null,
    sku: item.sku || variant?.sku || null,
    price,
    compareAtPrice: compareAtPrice > price ? compareAtPrice : null,
    quantity: Math.max(1, normalizeNumber(item.quantity, 1)),
    imageUrl: normalizeImageUrl(
      item.imageUrl || variant?.imageUrl || product?.imageUrl || null
    ),
    stock: normalizeNumber(item.stock ?? variant?.availableQuantity ?? product?.availableStock ?? product?.stock, 999999),
    product,
    variant,
  };
}

function readCartFromKey(key: string): StorefrontCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeLegacyCartItem)
      .filter(Boolean) as StorefrontCartItem[];
  } catch {
    return [];
  }
}

export function mergeStorefrontCarts(...carts: StorefrontCartItem[][]) {
  const map = new Map<string, StorefrontCartItem>();

  carts.flat().forEach((item) => {
    const normalized = normalizeLegacyCartItem(item);

    if (!normalized?.productId) return;

    const key = getStorefrontCartItemKey(normalized);
    const current = map.get(key);

    if (!current) {
      map.set(key, normalized);
      return;
    }

    map.set(key, {
      ...current,
      ...normalized,
      quantity: Math.max(
        Math.max(1, Number(current.quantity || 1)),
        Math.max(1, Number(normalized.quantity || 1))
      ),
    });
  });

  return Array.from(map.values());
}

export function readStorefrontCart(storeId?: string | null): StorefrontCartItem[] {
  if (!storeId || typeof window === "undefined") return [];

  const carts = getStorefrontCartKeys(storeId).map(readCartFromKey);

  return mergeStorefrontCarts(...carts);
}

export function writeStorefrontCart(storeId: string, cart: StorefrontCartItem[]) {
  if (!storeId || typeof window === "undefined") return;

  const normalizedCart = mergeStorefrontCarts(cart);
  const value = JSON.stringify(normalizedCart);

  getStorefrontCartKeys(storeId).forEach((key) => {
    localStorage.setItem(key, value);
  });

  window.dispatchEvent(new Event("mizar-cart-updated"));
}

export function clearStorefrontCart(storeId: string) {
  if (!storeId || typeof window === "undefined") return;

  getStorefrontCartKeys(storeId).forEach((key) => {
    localStorage.removeItem(key);
  });

  window.dispatchEvent(new Event("mizar-cart-updated"));
}

export function getStorefrontCartCount(storeId?: string | null) {
  return readStorefrontCart(storeId).reduce((sum, item) => {
    return sum + Number(item.quantity || 0);
  }, 0);
}

export function getStorefrontCartSubtotal(storeId?: string | null) {
  return readStorefrontCart(storeId).reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);
}

export function addStorefrontCartItem(storeId: string, item: StorefrontCartItem) {
  const cart = readStorefrontCart(storeId);
  const normalizedItem = normalizeLegacyCartItem(item);

  if (!normalizedItem) return cart;

  const itemKey = getStorefrontCartItemKey(normalizedItem);

  const existingIndex = cart.findIndex((cartItem) => {
    return getStorefrontCartItemKey(cartItem) === itemKey;
  });

  if (existingIndex >= 0) {
    const currentQuantity = Number(cart[existingIndex].quantity || 0);
    const addedQuantity = Number(normalizedItem.quantity || 1);

    cart[existingIndex] = {
      ...cart[existingIndex],
      ...normalizedItem,
      quantity: currentQuantity + addedQuantity,
    };
  } else {
    cart.push(normalizedItem);
  }

  writeStorefrontCart(storeId, cart);

  return cart;
}

export function updateStorefrontCartItemQuantity(
  storeId: string,
  itemKey: string,
  quantity: number
) {
  const cart = readStorefrontCart(storeId);

  const nextCart = cart
    .map((item) => {
      if (getStorefrontCartItemKey(item) !== itemKey) return item;

      return {
        ...item,
        quantity: Math.max(0, quantity),
      };
    })
    .filter((item) => Number(item.quantity || 0) > 0);

  writeStorefrontCart(storeId, nextCart);

  return nextCart;
}

export function removeStorefrontCartItem(storeId: string, itemKey: string) {
  const cart = readStorefrontCart(storeId);

  const nextCart = cart.filter((item) => {
    return getStorefrontCartItemKey(item) !== itemKey;
  });

  writeStorefrontCart(storeId, nextCart);

  return nextCart;
}
