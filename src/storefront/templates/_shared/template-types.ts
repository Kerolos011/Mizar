import type { ReactElement } from "react";
import type { StorefrontTemplateKey } from "@/storefront/types";
import type {
  PublicStore,
  StorefrontContent,
  StorefrontProduct,
  StoreLocale,
  getLocaleText,
} from "@/storefront/StorefrontPagesShared";

export type StorefrontTemplatePage =
  | "home"
  | "products"
  | "about"
  | "contact"
  | "wishlist"
  | "cart"
  | "blogList"
  | "blogPost"
  | "account"
  | "login"
  | "register"
  | "productDetails"
  | "checkout"
  | "orderSuccess";

export type TemplateText = ReturnType<typeof getLocaleText>;

export type TemplateRuntimeData = {
  store: PublicStore | null;
  content: StorefrontContent | null;
  templateKey: StorefrontTemplateKey;
  products: StorefrontProduct[];
  featuredProducts: StorefrontProduct[];
  latestProducts: StorefrontProduct[];
  bestSellerProducts: StorefrontProduct[];
  newArrivalProducts: StorefrontProduct[];
  categories: string[];
  brands?: any[];
  blogPosts?: any[];
  reviews?: any[];
  discountedProducts?: StorefrontProduct[];
  bestSellers?: StorefrontProduct[];
  newArrivals?: StorefrontProduct[];
  socialLinks?: any[];
  paymentMethods?: any[];
  policies?: any[];
  homepageSettings?: any;
  contactSettings?: any;
  addressSettings?: any;
  shippingSettings?: any;
  taxSettings?: any;
  seoSettings?: any;
  productSettings?: any;
  footerSettings?: any;
  ratingSummary?: any;
};

export type TemplatePageProps = TemplateRuntimeData & {
  locale: StoreLocale;
  text: TemplateText;
};

export type TemplateComponent = (props: TemplatePageProps) => ReactElement;
