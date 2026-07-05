export type TemplateKey =
  | "MIZAR_PREMIUM"
  | "MIZAR_MODERN"
  | "LUXE_NOIR"
  | "SOFT_BOUTIQUE"
  | "BAZAAR_CARDS"
  | "TECH_MINIMAL";

export type LegacyTemplateKey = "GENERAL" | "FASHION" | "FOOD_BEVERAGE" | "ELECTRONICS";

export type TemplateStatus = "ready" | "soon";

export type TemplatePalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface?: string;
  text?: string;
};

export type TemplatePreview = {
  heroShape?: "rounded" | "sharp" | "soft" | "editorial";
  productShape?: "cards" | "minimal" | "tiles";
  density?: "compact" | "normal" | "spacious";
  mood?: "premium" | "fresh" | "luxury" | "soft" | "market" | "tech";
};

export type TemplateCatalogItem = {
  key: TemplateKey;
  legacyTemplate: LegacyTemplateKey;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  status: TemplateStatus;
  version: string;
  recommendedFor: string[];
  palette: TemplatePalette;
  features: string[];
  preview: TemplatePreview;
  implementationNote?: string;
};

export const TEMPLATE_CATALOG: TemplateCatalogItem[] = [
  {
    key: "MIZAR_PREMIUM",
    legacyTemplate: "GENERAL",
    title: "Mizar Premium",
    subtitle: "Premium SaaS storefront",
    description:
      "القالب الجديد الأول لميزار: تصميم حديث، فاخر، نظيف، سريع، ومرتب لرفع التحويلات. مناسب للتجار المصريين والمتاجر العامة.",
    badge: "جديد",
    status: "ready",
    version: "1.0.0",
    recommendedFor: ["متاجر عامة", "موضة", "إكسسوارات", "براندات ناشئة"],
    palette: {
      primary: "#C2185B",
      secondary: "#1565C0",
      accent: "#F9A825",
      background: "#FAFAFA",
      surface: "#FFFFFF",
      text: "#222222",
    },
    features: ["RTL / LTR", "Sticky Header", "Hero Slider", "Brands", "Blog", "Newsletter"],
    preview: { heroShape: "rounded", productShape: "cards", density: "normal", mood: "premium" },
  },
  {
    key: "MIZAR_MODERN",
    legacyTemplate: "GENERAL",
    title: "Neo Fresh RTL",
    subtitle: "Modern general storefront",
    description:
      "القالب العام الموجود لديك بالفعل. مناسب للمتاجر اليومية والمنتجات العامة مع تجربة موبايل قوية.",
    badge: "متاح",
    status: "ready",
    version: "1.0.0",
    recommendedFor: ["متاجر عامة", "منتجات يومية", "كتالوجات سريعة"],
    palette: {
      primary: "#168A52",
      secondary: "#0D5F3A",
      accent: "#FF8A1F",
      background: "#F6FBF4",
      surface: "#FFFFFF",
      text: "#0D2E1D",
    },
    features: ["RTL", "Product Grid", "Wishlist", "Cart", "Reviews"],
    preview: { heroShape: "soft", productShape: "cards", density: "normal", mood: "fresh" },
  },
  {
    key: "LUXE_NOIR",
    legacyTemplate: "GENERAL",
    title: "Ivory Atelier",
    subtitle: "Luxury brand style",
    description: "قالب فاخر للبراندات الراقية والعطور والإكسسوارات والمنتجات المختارة بعناية.",
    badge: "متاح",
    status: "ready",
    version: "1.0.0",
    recommendedFor: ["عطور", "إكسسوارات", "براندات فاخرة"],
    palette: {
      primary: "#1A1714",
      secondary: "#FCFAF8",
      accent: "#D96C4A",
      background: "#FCFAF8",
      surface: "#FFFFFF",
      text: "#1A1714",
    },
    features: ["Luxury Layout", "Editorial Sections", "Storytelling", "VIP Products"],
    preview: { heroShape: "editorial", productShape: "minimal", density: "spacious", mood: "luxury" },
  },
  {
    key: "SOFT_BOUTIQUE",
    legacyTemplate: "FASHION",
    title: "Soft Boutique",
    subtitle: "Fashion & beauty",
    description: "قالب ناعم للأزياء والبيوتي والهاند ميد والأطفال والمتاجر الهادئة.",
    badge: "متاح",
    status: "ready",
    version: "1.0.0",
    recommendedFor: ["أزياء", "بيوتي", "هاند ميد", "أطفال"],
    palette: {
      primary: "#E9A6A6",
      secondary: "#8B5E5E",
      accent: "#FFF7F2",
      background: "#FFF7F2",
      surface: "#FFFFFF",
      text: "#553B3B",
    },
    features: ["Lookbook", "Collections", "Mobile First", "Wishlist"],
    preview: { heroShape: "soft", productShape: "tiles", density: "spacious", mood: "soft" },
  },
  {
    key: "BAZAAR_CARDS",
    legacyTemplate: "FOOD_BEVERAGE",
    title: "Bazaar Cards",
    subtitle: "Full premium-style marketplace template",
    description:
      "قالب بازار كاردز أصبح مبنيًا بنفس طريقة Mizar Premium: صفحات كاملة، هيرو متعدد، منتجات، تصنيفات، براندات، مدونة، سلة، حساب عميل، ونفس نظام قراءة إعدادات الصفحة الرئيسية.",
    badge: "محدث",
    status: "ready",
    version: "2.0.0",
    recommendedFor: ["مطاعم", "منتجات منزلية", "سوبر ماركت", "متاجر كثيرة التصنيفات", "منتجات محلية"],
    palette: {
      primary: "#F97316",
      secondary: "#16A34A",
      accent: "#FACC15",
      background: "#FFFDF5",
      surface: "#FFFFFF",
      text: "#172554",
    },
    features: ["Hero Slider", "Category Grid", "Brands", "Blog", "Cart", "Customer Account"],
    preview: { heroShape: "rounded", productShape: "cards", density: "normal", mood: "market" },
    implementationNote: "Uses the same full template architecture as Mizar Premium with Bazaar Cards palette and layout styling.",
  },
  {
    key: "TECH_MINIMAL",
    legacyTemplate: "ELECTRONICS",
    title: "Tech Minimal",
    subtitle: "Electronics focused",
    description: "قالب بسيط للإلكترونيات والأجهزة، يركز على المواصفات، المقارنة، والضمان.",
    badge: "متاح",
    status: "ready",
    version: "1.0.0",
    recommendedFor: ["إلكترونيات", "أجهزة", "مستلزمات تقنية"],
    palette: {
      primary: "#1565C0",
      secondary: "#111827",
      accent: "#00BCD4",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      text: "#111827",
    },
    features: ["Specs", "Compare", "Warranty", "Tech Cards"],
    preview: { heroShape: "sharp", productShape: "minimal", density: "normal", mood: "tech" },
  },
];

export function parseTemplateConfig(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {};
}

export function normalizeTemplateKey(value: unknown): TemplateKey {
  const raw = String(value || "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  if (["MIZAR_PREMIUM", "PREMIUM", "PREMIUM_STORE"].includes(raw)) return "MIZAR_PREMIUM";
  if (["MIZAR_MODERN", "GENERAL", "MODERN"].includes(raw)) return "MIZAR_MODERN";
  if (["LUXE_NOIR", "LUXE", "NOIR", "IVORY", "IVORY_ATELIER"].includes(raw)) return "LUXE_NOIR";
  if (["SOFT_BOUTIQUE", "FASHION", "BEAUTY", "HANDMADE"].includes(raw)) return "SOFT_BOUTIQUE";
  if (["BAZAAR_CARDS", "FOOD_BEVERAGE", "FOOD", "HOME", "MARKET"].includes(raw)) return "BAZAAR_CARDS";
  if (["TECH_MINIMAL", "ELECTRONICS", "TECH"].includes(raw)) return "TECH_MINIMAL";

  return "MIZAR_MODERN";
}

export function getTemplateByKey(key: unknown) {
  const normalized = normalizeTemplateKey(key);
  return TEMPLATE_CATALOG.find((template) => template.key === normalized) || TEMPLATE_CATALOG[0];
}

export function getActiveTemplateKey(store: { template?: string | null; templateConfig?: any } | null): TemplateKey {
  const config = parseTemplateConfig(store?.templateConfig || null);
  return normalizeTemplateKey(config.templateKey || config.selectedTemplate || store?.template || "MIZAR_MODERN");
}

export function buildTemplateConfig(template: TemplateCatalogItem, currentConfig: unknown) {
  const previous = parseTemplateConfig(currentConfig);
  const previousContent = parseTemplateConfig(previous.content);

  return {
    ...previous,
    templateKey: template.key,
    selectedTemplate: template.key,
    storefrontTemplate: template.key,
    activeTemplate: template.key,
    templateName: template.title,
    templateVersion: template.version,
    selectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    palette: template.palette,
    preview: template.preview,
    content: {
      ...previousContent,
      templateKey: template.key,
      selectedTemplate: template.key,
      storefrontTemplate: template.key,
      activeTemplate: template.key,
    },
  };
}

export function themeCssVariables(template: TemplateCatalogItem) {
  return {
    "--template-primary": template.palette.primary,
    "--template-secondary": template.palette.secondary,
    "--template-accent": template.palette.accent,
    "--template-background": template.palette.background,
    "--template-surface": template.palette.surface || "#FFFFFF",
    "--template-text": template.palette.text || "#222222",
  } as Record<string, string>;
}
