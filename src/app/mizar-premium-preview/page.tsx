"use client";

import { useMemo, useState } from "react";
import { Home as MizarPremiumHome } from "@/storefront/templates/mizar-premium/pages/Home";

const demoStore = {
  id: "mizar-premium-demo-store",
  name: "Mizar Premium Store",
  nameAr: "متجر ميزار بريميوم",
  nameEn: "Mizar Premium Store",
  displayName: "متجر ميزار بريميوم",
  slug: "mizar-premium-demo",
  category: "Fashion & Lifestyle",
  tagline: "تجربة تسوق راقية لمنتجات مختارة بعناية",
  description:
    "متجر إلكتروني حديث يقدم تجربة شراء سهلة، آمنة، وسريعة بتصميم Premium يناسب البراندات المصرية الطموحة.",
  descriptionAr:
    "متجر إلكتروني حديث يقدم تجربة شراء سهلة، آمنة، وسريعة بتصميم Premium يناسب البراندات المصرية الطموحة.",
  descriptionEn:
    "A modern premium storefront for Egyptian merchants with a clean, trustworthy and conversion-focused shopping experience.",
  logoUrl:
    "https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=300&q=80",
  coverUrl:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85",
  bannerUrl:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85",
  defaultLanguage: "ar",
  currency: "EGP",
  announcementText: "خصم خاص لفترة محدودة وشحن سريع داخل مصر",
  phone: "01000000000",
  whatsapp: "201000000000",
  email: "support@mizar-demo.com",
  contactEmail: "support@mizar-demo.com",
  country: "Egypt",
  city: "Cairo",
  address: "Cairo, Egypt",
  contactSettings: {
    businessEmail: "support@mizar-demo.com",
    supportEmail: "support@mizar-demo.com",
    mobileNumber: "01000000000",
    whatsappNumber: "201000000000",
    workingHours: "يوميًا من 10 صباحًا حتى 10 مساءً",
  },
  addressSettings: {
    country: "Egypt",
    city: "Cairo",
    address: "Cairo, Egypt",
  },
  shippingSettings: {
    shippingCost: 45,
    freeShippingThreshold: 1500,
    estimatedDeliveryTime: "التوصيل خلال 2 - 5 أيام عمل",
    pickupAvailable: true,
    shippingPolicy: "شحن سريع وآمن داخل مصر.",
    shippingCompanies: ["Bosta", "Aramex", "Mizar Express"],
  },
  homepageSettings: {
    enableHeroBanner: true,
    enableFeaturedCategories: true,
    enableFeaturedProducts: true,
    enableBestSellers: true,
    enableNewArrivals: true,
    enableOffers: true,
    enableBrands: true,
    enableReviews: true,
    enableNewsletter: true,
    enableBlogPreview: true,
    enableServices: true,
    enableInstagramGallery: true,
  },
  footerSettings: {
    aboutStoreAr:
      "ميزار بريميوم قالب متجر احترافي مصمم للبراندات التي تريد تجربة شراء نظيفة وسريعة.",
    aboutStoreEn:
      "Mizar Premium is a clean premium storefront designed for modern ecommerce brands.",
    copyrightText: "© 2026 Mizar Premium Demo",
    paymentIcons: ["Visa", "Mastercard", "Meeza", "Cash on Delivery"],
    shippingPartners: ["Bosta", "Aramex", "DHL"],
  },
  paymentMethods: ["CASH_ON_DELIVERY", "VISA", "MASTERCARD", "MEEZA", "INSTAPAY"],
  socialLinks: [
    { platform: "FACEBOOK", url: "https://facebook.com" },
    { platform: "INSTAGRAM", url: "https://instagram.com" },
    { platform: "TIKTOK", url: "https://tiktok.com" },
    { platform: "WHATSAPP", url: "https://wa.me/201000000000" },
  ],
  brands: [
    { name: "Mizar Select", logoUrl: "" },
    { name: "Urban Line", logoUrl: "" },
    { name: "Cairo Basics", logoUrl: "" },
    { name: "Premium Home", logoUrl: "" },
  ],
  customerReviews: [
    {
      name: "سارة أحمد",
      rating: 5,
      comment: "التجربة كانت سهلة جدًا والتوصيل سريع، شكل المتجر مريح وموثوق.",
    },
    {
      name: "كريم محمود",
      rating: 5,
      comment: "المنتجات واضحة والأسعار والعروض ظاهرة بشكل ممتاز.",
    },
    {
      name: "Nour Ali",
      rating: 4.8,
      comment: "Clean storefront and smooth checkout experience.",
    },
  ],
  blogPosts: [
    {
      title: "إزاي تختار منتجات مناسبة لستايلك؟",
      excerpt: "دليل سريع لاختيار منتجات تجمع بين الجودة والسعر المناسب.",
      imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      url: "#",
    },
    {
      title: "نصائح لتجربة تسوق أذكى",
      excerpt: "استخدم الفلاتر والمفضلة والعروض للحصول على أفضل تجربة.",
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
      url: "#",
    },
  ],
  instagramImages: [
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=500&q=80",
  ],
};

const demoProducts = [
  {
    id: "p-001",
    slug: "premium-cotton-shirt",
    name: "Premium Cotton Shirt",
    nameAr: "قميص قطن بريميوم",
    nameEn: "Premium Cotton Shirt",
    category: "Fashion",
    brand: "Mizar Select",
    sku: "MZ-FSH-001",
    price: 650,
    compareAtPrice: 850,
    stock: 18,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    ratingAverage: 4.9,
    reviewCount: 126,
    shortDescription: "قميص قطن فاخر مناسب للخروج والعمل.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85",
        isCover: true,
      },
    ],
  },
  {
    id: "p-002",
    slug: "minimal-leather-bag",
    name: "Minimal Leather Bag",
    nameAr: "شنطة جلد مينيمال",
    nameEn: "Minimal Leather Bag",
    category: "Bags",
    brand: "Urban Line",
    sku: "MZ-BAG-002",
    price: 1250,
    compareAtPrice: 1590,
    stock: 9,
    status: "ACTIVE",
    isFeatured: true,
    isRecommended: true,
    ratingAverage: 4.8,
    reviewCount: 84,
    shortDescription: "شنطة جلد أنيقة بتصميم بسيط وعملي.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=85",
        isCover: true,
      },
    ],
  },
  {
    id: "p-003",
    slug: "daily-sneakers",
    name: "Daily Sneakers",
    nameAr: "سنيكرز يومي مريح",
    nameEn: "Daily Sneakers",
    category: "Shoes",
    brand: "Cairo Basics",
    sku: "MZ-SHO-003",
    price: 980,
    compareAtPrice: 0,
    stock: 22,
    status: "ACTIVE",
    isFeatured: true,
    isNewArrival: true,
    ratingAverage: 4.7,
    reviewCount: 63,
    shortDescription: "سنيكرز مريح للاستخدام اليومي.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85",
        isCover: true,
      },
    ],
  },
  {
    id: "p-004",
    slug: "smart-watch-lite",
    name: "Smart Watch Lite",
    nameAr: "ساعة ذكية لايت",
    nameEn: "Smart Watch Lite",
    category: "Electronics",
    brand: "Mizar Tech",
    sku: "MZ-TEC-004",
    price: 1450,
    compareAtPrice: 1790,
    stock: 15,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.6,
    reviewCount: 97,
    shortDescription: "ساعة ذكية خفيفة بتصميم عصري.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
        isCover: true,
      },
    ],
  },
  {
    id: "p-005",
    slug: "ceramic-home-set",
    name: "Ceramic Home Set",
    nameAr: "طقم سيراميك منزلي",
    nameEn: "Ceramic Home Set",
    category: "Home",
    brand: "Premium Home",
    sku: "MZ-HOM-005",
    price: 720,
    compareAtPrice: 920,
    stock: 11,
    status: "ACTIVE",
    isFeatured: true,
    isRecommended: true,
    ratingAverage: 4.8,
    reviewCount: 41,
    shortDescription: "طقم أنيق للمنزل بتشطيب Premium.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85",
        isCover: true,
      },
    ],
  },
  {
    id: "p-006",
    slug: "premium-perfume",
    name: "Premium Perfume",
    nameAr: "عطر بريميوم",
    nameEn: "Premium Perfume",
    category: "Beauty",
    brand: "Mizar Select",
    sku: "MZ-BTY-006",
    price: 540,
    compareAtPrice: 690,
    stock: 0,
    status: "OUT_OF_STOCK",
    isFeatured: true,
    ratingAverage: 4.5,
    reviewCount: 38,
    shortDescription: "عطر ثابت مناسب للاستخدام اليومي والمناسبات.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85",
        isCover: true,
      },
    ],
  },
];

const demoContent = {
  templateKey: "MIZAR_PREMIUM",
  navigation: {
    showHome: true,
    showAbout: true,
    showProducts: true,
    showContact: true,
    showWishlist: true,
    showCart: true,
    showLogin: true,
  },
  heroSlides: [
    {
      id: "hero-1",
      title: "متجر Premium جاهز للبيع من أول لحظة",
      subtitle:
        "واجهة نظيفة وسريعة بتصميم عالمي، تعرض منتجات التاجر وبياناته بشكل واضح ومقنع للعميل.",
      imageUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85",
      buttonText: "تسوق الآن",
      buttonLink: "#products",
      secondaryButtonText: "شاهد التصنيفات",
      secondaryButtonLink: "#categories",
      isActive: true,
    },
  ],
  homeSections: {
    showCategories: true,
    showFeaturedProducts: true,
    showLatestProducts: true,
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
  aboutSection: {
    enabled: true,
    subtitle: "عن القالب",
    title: "واجهة متجر مصممة للثقة والتحويل",
    description:
      "Mizar Premium يركز على إبراز المنتجات، تسهيل القرار الشرائي، وتقليل التشتيت داخل تجربة تسوق سلسة.",
    imageUrl:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=85",
    highlights: ["تصميم سريع ومتجاوب", "أزرار واضحة", "بيانات التاجر والمنتجات تظهر تلقائيًا"],
  },
  reviewSettings: {
    enabled: true,
    showRatingSummary: true,
    showProductReviews: true,
    showMerchantReply: true,
  },
  footerSettings: {
    text: "قالب Mizar Premium التجريبي لعرض شكل القالب منفصلًا عن اختيار التاجر.",
    showSocialLinks: true,
    showContactInfo: true,
    showPoweredByMizar: true,
  },
};

export default function MizarPremiumPreviewPage() {
  const [toast, setToast] = useState("");

  const actions = useMemo(
    () => ({
      async addToCart(product: any) {
        setToast(`تمت إضافة ${product.nameAr || product.name || "المنتج"} للسلة`);
        window.setTimeout(() => setToast(""), 1800);
      },
      toggleWishlist(product: any) {
        setToast(`تم تحديث المفضلة: ${product.nameAr || product.name || "المنتج"}`);
        window.setTimeout(() => setToast(""), 1800);
      },
      openProductQuickView(product: any) {
        setToast(`عرض سريع: ${product.nameAr || product.name || "المنتج"}`);
        window.setTimeout(() => setToast(""), 1800);
      },
    }),
    [],
  );

  return (
    <>
      <MizarPremiumHome
        store={demoStore}
        products={demoProducts}
        content={demoContent}
        cartItems={[]}
        wishlistItems={[]}
        customer={null}
        actions={actions}
        templateKey="MIZAR_PREMIUM"
        locale="ar"
        isPreview
      />

      {toast ? (
        <div
          style={{
            position: "fixed",
            left: 20,
            bottom: 20,
            zIndex: 9999,
            borderRadius: 16,
            background: "#222222",
            color: "#ffffff",
            padding: "12px 16px",
            fontFamily: "Cairo, Inter, sans-serif",
            fontSize: 13,
            fontWeight: 800,
            boxShadow: "0 20px 50px rgba(0,0,0,.18)",
          }}
          dir="rtl"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
