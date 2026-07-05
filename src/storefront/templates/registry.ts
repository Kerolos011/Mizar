import type {
  StorefrontContent,
  StorefrontTemplateDefinition,
  StorefrontTemplateKey,
} from "../types";

export const STOREFRONT_TEMPLATE_KEYS: StorefrontTemplateKey[] = [
  "MIZAR_PREMIUM",
  "MIZAR_MODERN",
  "LUXE_NOIR",
  "SOFT_BOUTIQUE",
  "BAZAAR_CARDS",
  "TECH_MINIMAL",
];

export const STOREFRONT_TEMPLATES: StorefrontTemplateDefinition[] = [
  {
    key: "MIZAR_PREMIUM",
    name: "Mizar Premium",
    shortName: "Premium",
    description:
      "قالب متجر حديث وفاخر بأسلوب SaaS نظيف، مناسب للتجار المصريين، يدعم RTL/LTR ويجمع بين تجربة شراء سريعة وتحويلات أعلى.",
    category: "general",
    isPremium: false,
    price: 0,
    badge: "مجاني",
    recommendedFor: ["متاجر عامة", "أزياء", "إلكترونيات", "منتجات منزلية", "براندات ناشئة"],
    preview: {
      background: "#FAFAFA",
      foreground: "#222222",
      primary: "#C2185B",
      secondary: "#1565C0",
      accent: "#F9A825",
      card: "#FFFFFF",
      fontHeading: "Cairo",
      fontBody: "Cairo",
    },
    features: [
      "تصميم Premium Minimal",
      "Sticky Header",
      "Hero Slider جاهز",
      "Flash Sale وBest Sellers",
      "Language & Currency Switch",
      "Footer متكامل وسوشيال ديناميكي",
    ],
  },
  {
    key: "MIZAR_MODERN",
    name: "Neo Fresh RTL",
    shortName: "Neo Fresh",
    description: "قالب عربي RTL جديد بالكامل بأسلوب متجر احترافي سريع، مناسب للمنتجات العامة والملابس والمتاجر اليومية مع هيدر متكامل وحساب عميل وتجربة موبايل قوية.",
    category: "market",
    isPremium: false,
    price: 0,
    badge: "مجاني",
    recommendedFor: ["متاجر عامة", "إلكترونيات", "ملابس", "منتجات متنوعة"],
    preview: {
      background: "#F6FBF4",
      foreground: "#10231F",
      primary: "#168A52",
      secondary: "#0D5F3A",
      accent: "#FF8A1F",
      card: "#ffffff",
      fontHeading: "Cairo",
      fontBody: "Cairo",
    },
    features: [
      "هيدر علوي شبيه بمتاجر السوبر ماركت",
      "هيرو كبير بصورة الغلاف وبيانات التاجر",
      "كروت منتجات Fresh Market",
      "مفضلة وسلة",
      "تقييمات المنتجات",
      "صنع بواسطة ميزار",
    ],
  },
  {
    key: "LUXE_NOIR",
    name: "Ivory Atelier",
    shortName: "Atelier",
    description: "قالب فاخر فاتح بأسلوب Editorial مناسب للمنتجات الراقية، العطور، الديكور والهدايا.",
    category: "luxury",
    isPremium: false,
    price: 0,
    badge: "مجاني",
    recommendedFor: ["عطور", "ديكور", "هدايا", "براندات فاخرة", "منتجات لايف ستايل"],
    preview: {
      background: "#FCFAF8",
      foreground: "#1A1714",
      primary: "#D96C4A",
      secondary: "#8A8279",
      accent: "#D96C4A",
      card: "#FFFFFF",
      fontHeading: "Cormorant Garamond",
      fontBody: "Cairo",
    },
    features: [
      "ستايل Editorial فاخر",
      "ألوان Ivory وTerracotta",
      "هيدر عائم",
      "Lookbook أفقي",
      "كروت منتجات راقية",
      "صنع بواسطة ميزار",
    ],
  },
  {
    key: "SOFT_BOUTIQUE",
    name: "Soft Boutique",
    shortName: "Boutique",
    description: "قالب ناعم مناسب للملابس، التجميل، الأطفال، الهاند ميد والمتاجر الهادئة.",
    category: "fashion",
    isPremium: false,
    price: 0,
    badge: "مجاني",
    recommendedFor: ["أزياء", "تجميل", "عناية", "هاند ميد", "أطفال"],
    preview: {
      background: "#fff7f2",
      foreground: "#3b2f2f",
      primary: "#e9a6a6",
      secondary: "#8b5e5e",
      accent: "#c08457",
      card: "#ffffff",
      fontHeading: "Cormorant Garamond",
      fontBody: "Cairo",
    },
    features: [
      "ألوان هادئة",
      "كروت ناعمة",
      "بانرات Editorial",
      "تجربة مناسبة للموبايل",
      "مفضلة وتقييمات",
      "صنع بواسطة ميزار",
    ],
  },
  {
    key: "BAZAAR_CARDS",
    name: "Bazaar Cards",
    shortName: "Bazaar",
    description: "قالب تجاري سريع مناسب للمنتجات الكثيرة والعروض والسوبر ماركت.",
    category: "market",
    isPremium: false,
    price: 0,
    badge: "مجاني",
    recommendedFor: ["سوبر ماركت", "عروض", "منتجات كثيرة", "متاجر يومية"],
    preview: {
      background: "#fffdf5",
      foreground: "#172554",
      primary: "#16a34a",
      secondary: "#2563eb",
      accent: "#f97316",
      card: "#ffffff",
      fontHeading: "Cairo",
      fontBody: "Cairo",
    },
    features: [
      "Grid منتجات قوي",
      "بادجات خصم",
      "عرض سريع",
      "تصميم تجاري مباشر",
      "سلة ومفضلة",
      "صنع بواسطة ميزار",
    ],
  },
  {
    key: "TECH_MINIMAL",
    name: "Tech Minimal",
    shortName: "Tech",
    description: "قالب بسيط وتقني مناسب للإلكترونيات، الإكسسوارات والمنتجات الرقمية.",
    category: "tech",
    isPremium: false,
    price: 0,
    badge: "مجاني",
    recommendedFor: ["إلكترونيات", "إكسسوارات", "منتجات رقمية", "أدوات تقنية"],
    preview: {
      background: "#f6f8fb",
      foreground: "#0f172a",
      primary: "#2563eb",
      secondary: "#111827",
      accent: "#06b6d4",
      card: "#ffffff",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
    features: [
      "تصميم Minimal",
      "ألوان تقنية",
      "كروت منظمة",
      "قراءة سريعة للمواصفات",
      "تقييمات واضحة",
      "صنع بواسطة ميزار",
    ],
  },
];

export function normalizeTemplateKey(value?: string | null): StorefrontTemplateKey {
  const key = String(value || "").trim().toUpperCase();

  const legacyMap: Record<string, StorefrontTemplateKey> = {
    PREMIUM: "MIZAR_PREMIUM",
    MIZAR_PREMIUM: "MIZAR_PREMIUM",
    PREMIUM_STORE: "MIZAR_PREMIUM",
    MIZAR_PREMIUM_V1: "MIZAR_PREMIUM",
    GENERAL: "MIZAR_MODERN",
    MODERN: "MIZAR_MODERN",
    MIZAR: "MIZAR_MODERN",
    MIZAR_MODERN: "MIZAR_MODERN",

    LUXE: "LUXE_NOIR",
    LUXE_NOIR: "LUXE_NOIR",
    NOIR: "LUXE_NOIR",
    ATELIER: "LUXE_NOIR",
    ATELIER_LUXE: "LUXE_NOIR",
    IVORY: "LUXE_NOIR",
    IVORY_FLOW: "LUXE_NOIR",
    IVORY_ATELIER: "LUXE_NOIR",

    SOFT: "SOFT_BOUTIQUE",
    BOUTIQUE: "SOFT_BOUTIQUE",
    SOFT_BOUTIQUE: "SOFT_BOUTIQUE",
    FASHION: "SOFT_BOUTIQUE",
    HANDMADE: "SOFT_BOUTIQUE",
    ACCESSORIES: "SOFT_BOUTIQUE",
    PERFUMES_BEAUTY: "SOFT_BOUTIQUE",

    BAZAAR: "BAZAAR_CARDS",
    BAZAAR_CARDS: "BAZAAR_CARDS",
    MARKET: "BAZAAR_CARDS",
    FOOD_BEVERAGE: "BAZAAR_CARDS",
    HOME_PRODUCTS: "BAZAAR_CARDS",

    TECH: "TECH_MINIMAL",
    TECH_MINIMAL: "TECH_MINIMAL",
    ELECTRONICS: "TECH_MINIMAL",
  };

  return legacyMap[key] || "MIZAR_MODERN";
}

export function getStorefrontTemplate(
  value?: string | null
): StorefrontTemplateDefinition {
  const key = normalizeTemplateKey(value);

  const template = STOREFRONT_TEMPLATES.find((item) => item.key === key);

  return template || STOREFRONT_TEMPLATES[0];
}

export function getFreeStorefrontTemplates() {
  return STOREFRONT_TEMPLATES.filter((template) => !template.isPremium);
}

export function createDefaultStorefrontContent(
  templateKey: StorefrontTemplateKey = "MIZAR_MODERN"
): StorefrontContent {
  const safeTemplateKey = normalizeTemplateKey(templateKey);

  return {
    templateKey: safeTemplateKey,

    navigation: {
      showHome: true,
      showAbout: true,
      showProducts: true,
      showWishlist: true,
      showCart: true,
      showLogin: true,
      showContact: true,
    },

    heroSlides: [
      {
        id: "default-slide-1",
        imageUrl: "",
        title:
          safeTemplateKey === "MIZAR_PREMIUM"
            ? "تجربة تسوق Premium لعملائك"
            : safeTemplateKey === "LUXE_NOIR"
              ? "فن الاختيار الهادئ"
              : "اكتشف أحدث منتجاتنا",
        subtitle:
          safeTemplateKey === "MIZAR_PREMIUM"
            ? "واجهة حديثة، واضحة، وسريعة تساعد العميل يشتري بثقة من أول زيارة."
            : safeTemplateKey === "LUXE_NOIR"
              ? "تجربة متجر راقية تجمع بين البساطة، التفاصيل، والمنتجات المختارة بعناية."
              : "تسوق بسهولة من متجرنا واستمتع بتجربة شراء بسيطة وسريعة.",
        buttonText: "تسوق الآن",
        buttonLink: "/products",
        secondaryButtonText: "من نحن",
        secondaryButtonLink: "/about",
        isActive: true,
      },
      {
        id: "default-slide-2",
        imageUrl: "",
        title: "عروض مختارة لعملائنا",
        subtitle: "منتجات مميزة، أسعار واضحة، وتجربة مناسبة لكل الأجهزة.",
        buttonText: "شاهد المنتجات",
        buttonLink: "/products",
        secondaryButtonText: "تواصل معنا",
        secondaryButtonLink: "/contact",
        isActive: true,
      },
    ],

    aboutSection: {
      enabled: true,
      title: "من نحن",
      subtitle: "قصة المتجر",
      description:
        "نقدم لعملائنا تجربة تسوق سهلة ومنظمة، مع منتجات مختارة بعناية وخدمة عملاء تهتم بالتفاصيل.",
      imageUrl: "",
      highlights: [
        "منتجات مختارة بعناية",
        "تجربة شراء سهلة",
        "دعم عملاء مستمر",
        "شحن وتوصيل منظم",
      ],
    },

    homeSections: {
      showFeaturedProducts: true,
      showLatestProducts: true,
      showCategories: true,
      showOffers: true,
      showAbout: true,
      showReviews: true,
    },

    productDisplay: {
      showWishlist: true,
      showRatings: true,
      showReviewCount: true,
      showDiscountBadge: true,
      showStockStatus: true,
      showCategory: true,
      enableQuickView: true,
      enableAddToCart: true,
    },

    reviewSettings: {
      enabled: true,
      requireVerifiedPurchase: true,
      showMerchantReply: true,
      showRatingSummary: true,
      showProductReviews: true,
    },

    footerSettings: {
      text: "متجر إلكتروني يعمل بتقنيات ميزار لتجربة شراء سهلة وسريعة.",
      showSocialLinks: true,
      showContactInfo: true,
      showPoweredByMizar: true,
    },

    seoSettings: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    },
  };
}
