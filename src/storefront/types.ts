export type StorefrontTemplateKey =
  | "MIZAR_PREMIUM"
  | "MIZAR_MODERN"
  | "LUXE_NOIR"
  | "SOFT_BOUTIQUE"
  | "BAZAAR_CARDS"
  | "TECH_MINIMAL";

export type StorefrontTemplateCategory =
  | "general"
  | "luxury"
  | "fashion"
  | "market"
  | "tech";

export type StorefrontTemplateDefinition = {
  key: StorefrontTemplateKey;
  name: string;
  shortName: string;
  description: string;
  category: StorefrontTemplateCategory;
  isPremium: boolean;
  price: number;
  badge: string;
  recommendedFor: string[];
  preview: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    fontHeading: string;
    fontBody: string;
  };
  features: string[];
};

export type StorefrontMediaType = "IMAGE" | "VIDEO";

export type StorefrontMedia = {
  id?: string;
  type?: StorefrontMediaType | string;
  url: string;
  thumbnailUrl?: string | null;
  sortOrder?: number | null;
  isCover?: boolean | null;
};

export type StorefrontStore = {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
  template?: string | null;
  theme?: string | null;
  category?: string | null;
  description?: string | null;

  logoUrl?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;

  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  contactEmail?: string | null;
  website?: string | null;

  country?: string | null;
  governorate?: string | null;
  city?: string | null;
  address?: string | null;

  shippingFee?: number | string | null;
  freeShippingThreshold?: number | string | null;
  shippingPolicy?: string | null;

  currency?: string | null;
  paymentMethod?: string | null;
  paymentMethods?: string[] | string | null;

  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;

  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  snapchat?: string | null;
  x?: string | null;

  isActive?: boolean | null;
};

export type StorefrontProductVariant = {
  id: string;
  title: string;
  sku?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  options?: Record<string, string> | null;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  quantity?: number | string | null;
  availableQuantity?: number | string | null;
  status?: string | null;
  media?: StorefrontMedia[];
};

export type StorefrontProduct = {
  id: string;
  storeId?: string;
  name: string;
  description?: string | null;
  category?: string | null;

  price: number | string;
  compareAtPrice?: number | string | null;
  costPrice?: number | string | null;
  minSellingPrice?: number | string | null;
  maxDiscountPercent?: number | string | null;

  stock?: number | string | null;
  type?: string | null;
  status?: string | null;

  imageUrl?: string | null;
  media?: StorefrontMedia[];

  ratingAverage?: number | string | null;
  ratingCount?: number | string | null;
  reviewCount?: number | string | null;

  variants?: StorefrontProductVariant[];
  productVariants?: StorefrontProductVariant[];

  createdAt?: string;
  updatedAt?: string;
};

export type StorefrontCustomer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type StorefrontCartItem = {
  id?: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product?: StorefrontProduct;
  variant?: StorefrontProductVariant | null;
};

export type StorefrontWishlistItem = {
  id?: string;
  productId: string;
  product?: StorefrontProduct;
};

export type StorefrontNavigationSettings = {
  showHome: boolean;
  showAbout: boolean;
  showProducts: boolean;
  showWishlist: boolean;
  showCart: boolean;
  showLogin: boolean;
  showContact: boolean;
};

export type StorefrontHeroSlide = {
  id?: string;
  imageUrl?: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  isActive?: boolean;
};

export type StorefrontAboutSection = {
  enabled: boolean;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl?: string;
  highlights: string[];
};

export type StorefrontHomeSections = {
  showFeaturedProducts: boolean;
  showLatestProducts: boolean;
  showCategories: boolean;
  showOffers: boolean;
  showAbout: boolean;
  showReviews: boolean;
};

export type StorefrontProductDisplaySettings = {
  showWishlist: boolean;
  showRatings: boolean;
  showReviewCount: boolean;
  showDiscountBadge: boolean;
  showStockStatus: boolean;
  showCategory: boolean;
  enableQuickView: boolean;
  enableAddToCart: boolean;
};

export type StorefrontReviewSettings = {
  enabled: boolean;
  requireVerifiedPurchase: boolean;
  showMerchantReply: boolean;
  showRatingSummary: boolean;
  showProductReviews: boolean;
};

export type StorefrontFooterSettings = {
  text: string;
  showSocialLinks: boolean;
  showContactInfo: boolean;
  showPoweredByMizar: boolean;
};

export type StorefrontSeoSettings = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
};

export type StorefrontContent = {
  templateKey: StorefrontTemplateKey;
  navigation: StorefrontNavigationSettings;
  heroSlides: StorefrontHeroSlide[];
  aboutSection: StorefrontAboutSection;
  homeSections: StorefrontHomeSections;
  productDisplay: StorefrontProductDisplaySettings;
  reviewSettings: StorefrontReviewSettings;
  footerSettings: StorefrontFooterSettings;
  seoSettings: StorefrontSeoSettings;
};

export type StorefrontActions = {
  addToCart?: (product: StorefrontProduct, variant?: StorefrontProductVariant | null) => void;
  removeFromCart?: (productId: string, variantId?: string | null) => void;
  updateCartQuantity?: (productId: string, quantity: number, variantId?: string | null) => void;
  toggleWishlist?: (product: StorefrontProduct) => void;
  openProductQuickView?: (product: StorefrontProduct) => void;
  openCart?: () => void;
  openWishlist?: () => void;
  openLogin?: () => void;
};

export type StorefrontTemplateProps = {
  store: StorefrontStore;
  products: StorefrontProduct[];
  content: StorefrontContent;
  customer?: StorefrontCustomer | null;
  cartItems: StorefrontCartItem[];
  wishlistItems: StorefrontWishlistItem[];
  actions?: StorefrontActions;
  isPreview?: boolean;
};