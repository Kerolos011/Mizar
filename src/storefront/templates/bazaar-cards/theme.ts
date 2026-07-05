export const theme = {
  key: "BAZAAR_CARDS",
  name: "Bazaar Cards",
  primary: "#F97316",
  primaryHover: "#EA580C",
  secondary: "#16A34A",
  success: "#16A34A",
  warning: "#FACC15",
  danger: "#D32F2F",
  background: "#FFFDF5",
  card: "#FFFFFF",
  border: "#FED7AA",
  text: "#172554",
  muted: "#64748B",
  softPrimary: "rgba(249,115,22,.10)",
  softSecondary: "rgba(22,163,74,.10)",
  radius: "16px",
};

export const bazaarCardsLabels = {
  ar: {
    styleName: "بازار كاردز",
    mood: "قالب سريع للمنتجات والتصنيفات الكثيرة",
  },
  en: {
    styleName: "Bazaar Cards",
    mood: "Fast template for rich categories and local commerce",
  },
} as const;

export const bazaarCardsTheme = theme;

// Backward-compatible export because Bazaar Cards reuses helpers copied from Mizar Premium.
// This keeps existing imports working while the template has its own Bazaar labels.
export const premiumLabels = bazaarCardsLabels;
