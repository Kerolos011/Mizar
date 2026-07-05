"use client";

import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { useEffect, useMemo, useRef, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "SUPER_ADMIN" | "MERCHANT" | "CUSTOMER";
  ownedStores?: {
    id: string;
    name: string;
    slug: string;
  }[];
};

type FeatureCard = {
  title: string;
  description: string;
  icon: string;
  tone?: "mint" | "gold" | "navy";
};

type PricingPlan = {
  name: string;
  description: string;
  price: string;
  popular?: boolean;
  features: string[];
};

type Testimonial = {
  name: string;
  type: string;
  rating: number;
  text: string;
  published?: boolean;
};

const trustBadges = [
  "بدون كود",
  "جاهز خلال دقائق",
  "دعم عربي",
  "مصمم للتجار في مصر",
  "تجربة مجانية",
];

const socialCards: FeatureCard[] = [
  {
    title: "تجار فيسبوك",
    description: "حوّل تعليقات ورسائل العملاء إلى طلبات منظمة داخل لوحة واحدة.",
    icon: "FB",
    tone: "navy",
  },
  {
    title: "بائعو واتساب",
    description: "شارك روابط المنتجات بدل إرسال الصور والأسعار يدويًا لكل عميل.",
    icon: "WA",
    tone: "mint",
  },
  {
    title: "إنستجرام",
    description: "حوّل المتابعين إلى عملاء من خلال روابط منتجات احترافية وسريعة.",
    icon: "IG",
    tone: "gold",
  },
  {
    title: "المحلات الصغيرة",
    description: "ابدأ وجودك الرقمي بدون مبرمج أو تكلفة تقنية عالية.",
    icon: "SM",
    tone: "navy",
  },
];

const features: FeatureCard[] = [
  {
    title: "متجر احترافي جاهز",
    description: "واجهة حديثة وسريعة ومتوافقة مع الموبايل لعرض منتجاتك بشكل موثوق.",
    icon: "01",
    tone: "mint",
  },
  {
    title: "لوحة تحكم سهلة",
    description: "إدارة المنتجات والطلبات والعملاء من مكان واحد بدون تعقيد.",
    icon: "02",
    tone: "navy",
  },
  {
    title: "مناسب للسوشيال",
    description: "شارك روابط المنتجات على واتساب وفيسبوك وانستجرام بسهولة.",
    icon: "03",
    tone: "gold",
  },
  {
    title: "إدارة الطلبات",
    description: "تابع حالة الطلب من جديد إلى تم الشحن والتسليم والمكتمل.",
    icon: "04",
    tone: "mint",
  },
  {
    title: "تقارير ذكية",
    description: "اعرف مبيعاتك وأفضل المنتجات وأداء متجرك خلال آخر الأيام.",
    icon: "05",
    tone: "navy",
  },
  {
    title: "قابل للتوسع",
    description: "ابدأ صغيرًا ثم أضف الدفع والشحن والتسويق مع نمو تجارتك.",
    icon: "06",
    tone: "gold",
  },
  {
    title: "تجربة موبايل",
    description: "متجرك يعمل بسلاسة على الهاتف والكمبيوتر لكل العملاء.",
    icon: "07",
    tone: "mint",
  },
  {
    title: "روابط منتجات",
    description: "حوّل كل منتج إلى رابط جاهز للبيع والمشاركة مع العملاء.",
    icon: "08",
    tone: "navy",
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    description: "للتجار الجدد الذين يبدأون البيع الإلكتروني.",
    price: "199 ج.م",
    features: [
      "عدد منتجات محدود",
      "إدارة الطلبات",
      "روابط منتجات قابلة للمشاركة",
      "Checkout جاهز",
      "دعم أساسي",
    ],
  },
  {
    name: "Growth",
    description: "للتجار الذين لديهم طلبات يومية ويريدون النمو.",
    price: "399 ج.م",
    popular: true,
    features: [
      "منتجات أكثر",
      "تقارير المبيعات",
      "إدارة العملاء",
      "رفع صور وفيديوهات",
      "دعم فني أسرع",
      "تكاملات دفع وشحن لاحقًا",
    ],
  },
  {
    name: "Pro",
    description: "للماركات والمتاجر النامية التي تحتاج أدوات متقدمة.",
    price: "799 ج.م",
    features: [
      "منتجات غير محدودة",
      "دومين مخصص",
      "فريق عمل وصلاحيات",
      "تقارير متقدمة",
      "أولوية في الدعم",
      "تكاملات متقدمة",
    ],
  },
];

const faqs = [
  {
    question: "هل أحتاج إلى خبرة تقنية؟",
    answer:
      "لا. ميزار مصممة للتاجر العادي، تقدر تنشئ متجرك وتضيف منتجاتك وتتابع الطلبات بدون أي خبرة برمجية.",
  },
  {
    question: "هل يمكنني البيع عبر فيسبوك وواتساب؟",
    answer:
      "نعم. تقدر تشارك رابط متجرك أو روابط المنتجات مباشرة مع العملاء على واتساب وفيسبوك وانستجرام.",
  },
  {
    question: "هل توجد تجربة مجانية؟",
    answer:
      "نعم، يمكن البدء مجانًا لتجربة المنصة وتجهيز المتجر قبل اختيار الخطة المناسبة.",
  },
  {
    question: "هل يمكنني إضافة منتجاتي بنفسي؟",
    answer:
      "نعم. من لوحة التحكم تقدر تضيف الصور، الفيديوهات، الأسعار، الوصف، والمخزون بسهولة.",
  },
  {
    question: "هل المتجر يعمل على الموبايل؟",
    answer: "نعم. واجهة المتجر مصممة لتعمل بسلاسة على الموبايل والكمبيوتر.",
  },
  {
    question: "ما وسائل الدفع المتاحة؟",
    answer:
      "حاليًا يمكن استخدام الدفع عند الاستلام، ومع تطور المنصة يمكن إضافة تكاملات دفع إلكتروني ومحافظ وشحن.",
  },
];

const fallbackTestimonials: Testimonial[] = [
  {
    name: "أحمد محمود",
    type: "متجر ملابس",
    rating: 5,
    text: "بدل ما كنت براجع طلبات واتساب يدويًا، بقيت أستقبل كل الطلبات في مكان واحد.",
  },
  {
    name: "سارة علي",
    type: "براند عطور",
    rating: 5,
    text: "شكل المتجر ساعد العملاء يثقوا أكتر في البراند ويطلبوا بسهولة.",
  },
  {
    name: "محمود حسن",
    type: "منتجات هاند ميد",
    rating: 5,
    text: "إضافة المنتجات ومتابعة الطلبات بقت أسهل بكتير من الشيتات والرسائل.",
  },
  {
    name: "نور خالد",
    type: "منتجات تجميل",
    rating: 5,
    text: "الميزة الأهم بالنسبة لي إن العميل بقى يشوف المنتجات والأسعار من رابط واحد واضح.",
  },
  {
    name: "كريم عادل",
    type: "إكسسوارات",
    rating: 5,
    text: "لوحة الطلبات وفرت عليا وقت كبير بدل المتابعة اليدوية على الرسائل.",
  },
  {
    name: "منة شريف",
    type: "هاند ميد",
    rating: 5,
    text: "الواجهة شكلها احترافي وساعدتني أظهر البراند بتاعي بشكل أفضل.",
  },
];

const homeStyles = `
.mizar-home {
  font-family: var(--font-ar);
  color: var(--text-main);
  background: #ffffff;
}

.home-navbar {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 90;
  border-bottom: 1px solid rgba(46, 217, 179, 0.14);
  background: rgba(24, 33, 63, 0.98);
  backdrop-filter: blur(18px);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.12);
}

.home-nav-spacer {
  height: 78px;
}

.home-nav-inner {
  min-height: 78px;
  padding-block: 14px;
}

.home-logo,
.home-logo * {
  color: #ffffff !important;
}

.home-logo-sub {
  color: var(--mint) !important;
}

.home-login-link {
  color: #ffffff !important;
  opacity: 1;
}

.home-login-link:hover {
  color: var(--mint) !important;
}

.nav-link {
  position: relative;
  color: var(--text-light);
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  transition: color 240ms var(--ease-premium);
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link.active::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: -18px;
  width: 22px;
  height: 3px;
  border-radius: 999px;
  background: var(--mint);
}

.hero-animated {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 20%, rgba(245, 158, 11, 0.10), transparent 28%),
    radial-gradient(circle at 80% 40%, rgba(46, 217, 179, 0.15), transparent 32%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.hero-animated::before,
.hero-animated::after {
  content: "";
  position: absolute;
  z-index: 0;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(44px);
  opacity: 0.82;
  animation: mizar-orb-float 7s ease-in-out infinite;
}

.hero-animated::before {
  width: 340px;
  height: 340px;
  top: 92px;
  right: 7%;
  background: rgba(46, 217, 179, 0.16);
}

.hero-animated::after {
  width: 280px;
  height: 280px;
  top: 150px;
  left: 5%;
  background: rgba(245, 158, 11, 0.11);
  animation-delay: -2.4s;
}

.guiding-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(24, 33, 63, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24, 33, 63, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.72), transparent 78%);
}

.hero-content-motion {
  position: relative;
  z-index: 2;
}

.hero-content-motion > * {
  animation: hero-item-in 760ms var(--ease-premium) both;
}

.hero-content-motion > *:nth-child(1) { animation-delay: 80ms; }
.hero-content-motion > *:nth-child(2) { animation-delay: 160ms; }
.hero-content-motion > *:nth-child(3) { animation-delay: 240ms; }
.hero-content-motion > *:nth-child(4) { animation-delay: 320ms; }
.hero-content-motion > *:nth-child(5) { animation-delay: 400ms; }

.hero-title {
  margin-top: 28px;
  max-width: 780px;
  color: var(--text-main);
  font-size: clamp(40px, 5.2vw, 66px);
  font-weight: 900;
  line-height: 1.18;
  letter-spacing: -0.055em;
}

.hero-accent {
  position: relative;
  display: inline-block;
  color: var(--mint-hover);
  white-space: nowrap;
}

.hero-accent::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 8px;
  z-index: -1;
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.18);
}

.hero-description {
  margin-top: 24px;
  max-width: 660px;
  color: var(--text-body);
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 500;
  line-height: 2;
}

.hero-actions {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.hero-badges {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-mini-stats {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.hero-mini-stat {
  border: 1px solid var(--border);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  padding: 22px;
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(16px);
}

.hero-mini-stat strong {
  display: block;
  color: var(--primary);
  font-family: var(--font-en);
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.05em;
}

.hero-mini-stat span {
  display: block;
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.7;
}

.home-section {
  padding-block: 104px;
}

.home-section-sm {
  padding-block: 64px;
}

.home-section-title {
  margin-top: 20px;
  color: var(--text-main);
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: -0.04em;
}

.home-section-description {
  margin-top: 18px;
  color: var(--text-body);
  font-size: clamp(16px, 2vw, 19px);
  font-weight: 500;
  line-height: 1.95;
}

.home-card-title {
  color: var(--text-main);
  font-size: 21px;
  font-weight: 900;
  line-height: 1.45;
  letter-spacing: -0.025em;
}

.home-card-text {
  color: var(--text-body);
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.9;
}

.feature-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  font-family: var(--font-en);
  font-size: 14px;
  font-weight: 900;
}

.feature-icon.mint {
  background: var(--mint-soft);
  color: var(--mint-hover);
}

.feature-icon.gold {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.feature-icon.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.pricing-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

.pricing-features {
  flex: 1;
}

.testimonial-track {
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.testimonial-track::-webkit-scrollbar {
  display: none;
}

.testimonial-card {
  min-width: 360px;
  max-width: 360px;
}

.scroll-top-button {
  position: fixed;
  left: 22px;
  bottom: 24px;
  z-index: 80;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 999px;
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 14px 34px rgba(24, 33, 63, 0.22);
  transition:
    transform 240ms var(--ease-premium),
    background 240ms var(--ease-premium);
}

.scroll-top-button:hover {
  transform: translateY(-4px);
  background: var(--navy-soft);
}

.mizar-dashboard-stage {
  position: relative;
  z-index: 2;
  min-height: 560px;
}

.mizar-dashboard-stage::before {
  content: "";
  position: absolute;
  inset: 52px 28px;
  z-index: -1;
  border-radius: 48px;
  background:
    radial-gradient(circle at 20% 25%, rgba(245, 158, 11, 0.18), transparent 34%),
    radial-gradient(circle at 75% 70%, rgba(46, 217, 179, 0.20), transparent 38%);
  filter: blur(18px);
  animation: mockup-glow-pulse 4.6s ease-in-out infinite;
}

.mizar-dashboard-shell {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 32px;
  background: #ffffff;
  box-shadow: var(--shadow-mockup);
  transform: rotate(-1deg);
  animation: dashboard-float 6s ease-in-out infinite;
}

.mizar-dashboard-body {
  display: grid;
  grid-template-columns: 180px 1fr;
  min-height: 438px;
}

.mizar-dashboard-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding-inline: 22px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
}

.window-dots {
  display: flex;
  gap: 7px;
}

.window-dots span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.36);
}

.mizar-dashboard-sidebar {
  border-left: 1px solid var(--border);
  background: var(--bg-soft);
  padding: 18px;
}

.mock-side-item {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 39px;
  margin-bottom: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  background: #ffffff;
  color: var(--text-muted);
  padding-inline: 12px;
  font-size: 12px;
  font-weight: 900;
}

.mock-side-item.active {
  border-color: rgba(46, 217, 179, 0.28);
  background: var(--primary);
  color: #ffffff;
}

.mock-side-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--mint);
}

.mizar-dashboard-content {
  background: #ffffff;
  padding: 22px;
}

.mock-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.mock-metric {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: #ffffff;
  padding: 16px;
}

.mock-metric-label {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 900;
  line-height: 1.6;
}

.mock-metric-value {
  margin-top: 7px;
  color: var(--primary);
  font-family: var(--font-en);
  font-size: 25px;
  font-weight: 900;
  line-height: 1;
}

.mock-metric-up {
  margin-top: 6px;
  color: var(--mint-hover);
  font-size: 12px;
  font-weight: 900;
}

.mock-chart {
  position: relative;
  overflow: hidden;
  height: 164px;
  margin-top: 18px;
  border: 1px solid var(--border);
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(46, 217, 179, 0.10), transparent 74%),
    #ffffff;
  padding: 18px;
}

.mock-chart-bars {
  position: absolute;
  inset-inline: 18px;
  bottom: 20px;
  display: flex;
  align-items: flex-end;
  gap: 9px;
  height: 92px;
}

.mock-chart-bar {
  flex: 1;
  min-width: 10px;
  border-radius: 14px 14px 5px 5px;
  background: linear-gradient(180deg, var(--mint) 0%, var(--mint-hover) 100%);
  transform-origin: bottom;
  animation: bar-rise 950ms var(--ease-premium) both;
}

.mock-orders {
  overflow: hidden;
  margin-top: 18px;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: #ffffff;
}

.mock-order-row {
  display: grid;
  grid-template-columns: 1.1fr 0.8fr 0.8fr;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-body);
  font-size: 12px;
  font-weight: 900;
}

.mock-status {
  width: fit-content;
  border-radius: 999px;
  background: var(--mint-soft);
  color: #087f69;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 900;
}

.mock-mobile-card {
  position: absolute;
  right: -22px;
  bottom: 12px;
  width: 196px;
  border: 1px solid var(--border);
  border-radius: 32px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(24, 33, 63, 0.18);
  padding: 12px;
  transform: rotate(4deg);
  animation: phone-float 5.4s ease-in-out infinite;
}

.mock-phone-screen {
  overflow: hidden;
  border-radius: 24px;
  background: var(--bg-soft);
  padding: 12px;
}

.mock-product-img {
  height: 96px;
  border-radius: 20px;
  background:
    radial-gradient(circle at 32% 30%, rgba(46, 217, 179, 0.42), transparent 35%),
    linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%);
}

.mock-phone-line {
  height: 9px;
  margin-top: 10px;
  border-radius: 999px;
  background: #e5e7eb;
}

.mock-phone-line.short {
  width: 62%;
}

.mock-phone-btn {
  display: grid;
  place-items: center;
  height: 36px;
  margin-top: 12px;
  border-radius: 14px;
  background: var(--mint);
  color: var(--primary);
  font-size: 12px;
  font-weight: 900;
}

.guiding-point {
  position: absolute;
  z-index: 4;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow:
    0 0 0 8px rgba(245, 158, 11, 0.12),
    0 0 22px rgba(245, 158, 11, 0.42);
  animation: guiding-orbit 4.4s ease-in-out infinite;
}

.storefront-motion-card {
  position: relative;
  overflow: hidden;
}

.product-card-motion {
  transition:
    transform 280ms var(--ease-premium),
    box-shadow 280ms var(--ease-premium);
}

.product-card-motion:hover {
  transform: translateY(-6px) rotate(-0.5deg);
  box-shadow: var(--shadow-card-hover);
}

.product-thumb-motion {
  position: relative;
  overflow: hidden;
}

.product-thumb-motion::after {
  content: "";
  position: absolute;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  top: 22px;
  left: 22px;
  background: rgba(46, 217, 179, 0.34);
  animation: product-blob 4s ease-in-out infinite;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item[open] .faq-plus {
  transform: rotate(45deg);
}

.mobile-sticky-cta {
  box-shadow: 0 -16px 42px rgba(24, 33, 63, 0.08);
}

@keyframes hero-item-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes mizar-orb-float {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(12px, -18px, 0) scale(1.04);
  }
}

@keyframes mockup-glow-pulse {
  0%, 100% {
    opacity: 0.74;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.03);
  }
}

@keyframes dashboard-float {
  0%, 100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-12px) rotate(-0.4deg);
  }
}

@keyframes bar-rise {
  from {
    transform: scaleY(0.08);
    opacity: 0.3;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes phone-float {
  0%, 100% {
    transform: translateY(0) rotate(4deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}

@keyframes guiding-orbit {
  0% {
    top: 22px;
    left: 18%;
    opacity: 0.55;
  }
  35% {
    top: 18px;
    left: 72%;
    opacity: 1;
  }
  70% {
    top: 82%;
    left: 80%;
    opacity: 0.85;
  }
  100% {
    top: 22px;
    left: 18%;
    opacity: 0.55;
  }
}

@keyframes product-blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-10px, 8px) scale(1.12);
  }
}

@media (max-width: 1024px) {
  .home-section {
    padding-block: 84px;
  }

  .mizar-dashboard-stage {
    min-height: auto;
  }

  .mizar-dashboard-shell {
    transform: none;
  }

  .mizar-dashboard-body {
    grid-template-columns: 1fr;
  }

  .mizar-dashboard-sidebar {
    display: none;
  }

  .mock-metrics-grid {
    grid-template-columns: 1fr;
  }

  .mock-order-row {
    grid-template-columns: 1fr;
  }

  .mock-mobile-card {
    position: relative;
    right: auto;
    bottom: auto;
    width: 100%;
    margin-top: 20px;
    transform: none;
  }
}

@media (max-width: 768px) {
  .home-nav-spacer {
    height: 70px;
  }

  .home-nav-inner {
    min-height: 70px;
  }

  .hero-title {
    margin-top: 22px;
    font-size: clamp(34px, 10vw, 42px);
    line-height: 1.28;
    letter-spacing: -0.04em;
  }

  .hero-description {
    margin-top: 20px;
    font-size: 16px;
    line-height: 1.9;
  }

  .hero-mini-stats {
    grid-template-columns: 1fr;
    margin-top: 30px;
  }

  .home-section {
    padding-block: 68px;
  }

  .home-section-sm {
    padding-block: 48px;
  }

  .home-section-title {
    font-size: clamp(28px, 8vw, 36px);
    line-height: 1.34;
  }

  .testimonial-card {
    min-width: 82vw;
    max-width: 82vw;
  }

  .scroll-top-button {
    left: 16px;
    bottom: 84px;
  }
}
`;

export default function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showTopButton, setShowTopButton] = useState(false);

  const [comment, setComment] = useState("");
  const [testimonialBusinessType, setTestimonialBusinessType] = useState("");
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(fallbackTestimonials);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");

  const testimonialRef = useRef<HTMLDivElement | null>(null);

  async function loadCurrentUser() {
    try {
      const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  async function loadTestimonials() {
    setLoadingTestimonials(true);

    try {
      const response = await fetch(`/api/testimonials?limit=20&t=${Date.now()}`, {
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && Array.isArray(data.testimonials)) {
        const loadedTestimonials: Testimonial[] = data.testimonials
          .map(
            (item: {
              name?: string | null;
              businessType?: string | null;
              rating?: number | null;
              message?: string | null;
              status?: string;
              isFeatured?: boolean;
            }) => ({
              name: item.name || "تاجر على ميزار",
              type: item.businessType || "تاجر على ميزار",
              rating: Number(item.rating || 5),
              text: item.message || "",
              published: item.status === "APPROVED" && item.isFeatured === true,
            })
          )
          .filter((item: Testimonial) => item.text.trim().length > 0);

        if (loadedTestimonials.length > 0) {
          setTestimonials(loadedTestimonials);
        }
      }
    } catch {
      setTestimonials(fallbackTestimonials);
    } finally {
      setLoadingTestimonials(false);
    }
  }


  useEffect(() => {
    loadCurrentUser();
    loadTestimonials();

    function onScroll() {
      setShowTopButton(window.scrollY > 500);
    }

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const isPlatformAdmin = user?.role === "SUPER_ADMIN";
  const isMerchant = user?.role === "MERCHANT";

  const primaryHref = useMemo(() => {
    if (isPlatformAdmin) return "/admin/testimonials";
    if (isMerchant) return "/dashboard";
    return "/merchant/register";
  }, [isPlatformAdmin, isMerchant]);

  const primaryText = isPlatformAdmin
    ? "لوحة إدارة ميزار"
    : isMerchant
      ? "دخول لوحة التحكم"
      : "ابدأ الآن مجانًا";

  function scrollTestimonials(direction: "next" | "prev") {
    const element = testimonialRef.current;
    if (!element) return;

    const amount = 420;

    element.scrollBy({
      left: direction === "next" ? -amount : amount,
      behavior: "smooth",
    });
  }

  async function submitComment() {
    setCommentMessage("");

    if (!isMerchant) {
      window.location.href = "/merchant/login?next=/";
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setCommentMessage("من فضلك اكتب تعليق واضح لا يقل عن 10 أحرف.");
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: comment,
          businessType: testimonialBusinessType,
          rating: testimonialRating,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "تعذر إرسال التعليق");
      }

      setComment("");
      setTestimonialBusinessType("");
      setTestimonialRating(5);
      setCommentMessage("تم استلام تعليقك وسيظهر بعد مراجعته من إدارة المنصة.");
    } catch (error) {
      setCommentMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء إرسال التعليق"
      );
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <main
      className="mizar-home min-h-screen overflow-hidden bg-white pb-20 md:pb-0"
      dir="rtl"
    >
      <style>{homeStyles}</style>

      <PublicHeader />

      <div className="home-nav-spacer" />

      <section id="home" className="hero-animated">
        <div className="guiding-grid" />

        <div className="section-shell grid min-h-[calc(100vh-78px)] gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-24">
          <div className="hero-content-motion">
            <div className="section-eyebrow">منصة مصرية للتجارة الرقمية</div>

            <h1 className="hero-title">
              أنشئ متجرك الإلكتروني في{" "}
              <span className="hero-accent">5 دقائق</span>
            </h1>

            <p className="hero-description">
              منصة ميزار تساعد التجار وأصحاب المشاريع الصغيرة على إنشاء وإدارة
              متجر إلكتروني احترافي بدون برمجة، واستقبال الطلبات وتنظيم المنتجات
              والعملاء بسهولة.
            </p>

            <div className="hero-actions">
              <Link href={primaryHref} className="btn-primary text-center">
                {primaryText}
              </Link>

              <a href="/how-it-works" className="btn-secondary text-center">
                شاهد طريقة العمل
              </a>
            </div>

            <div className="hero-badges">
              {trustBadges.map((badge) => (
                <span key={badge} className="badge">
                  {badge}
                </span>
              ))}
            </div>

            <div className="hero-mini-stats">
              {[
                ["5 دقائق", "لإطلاق متجرك"],
                ["100%", "بدون كود"],
                ["24/7", "روابط جاهزة للبيع"],
              ].map(([value, label]) => (
                <div key={label} className="hero-mini-stat">
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <DashboardMockup />
        </div>
      </section>

      <section className="home-section-sm border-y border-[var(--border-soft)] bg-white">
        <div className="section-shell">
          <div className="grid gap-4 text-center md:grid-cols-4">
            {["فيسبوك", "واتساب", "انستجرام", "المحلات الصغيرة"].map((item) => (
              <div
                key={item}
                className="rounded-3xl bg-[var(--bg-soft)] p-6 transition hover:-translate-y-1 hover:bg-white"
              >
                <span className="gold-dot" />
                <p className="mt-3 text-base font-black leading-7 text-[var(--text-main)]">
                  {item}
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[var(--text-muted)]">
                  مناسب للبيع اليومي
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section soft-section">
        <div className="section-shell">
          <SectionHeader
            eyebrow="من السوشيال إلى متجر احترافي"
            title="من فيسبوك وواتساب إلى متجر منظم"
            description="ميزار مصممة للتجار الذين يبيعون عبر السوشيال ميديا ويريدون تحويل الرسائل والطلبات المتفرقة إلى نظام واضح ومنظم."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {socialCards.map((card) => (
              <article key={card.title} className="premium-card hover-lift p-7">
                <div className={`feature-icon ${card.tone || "mint"}`}>
                  {card.icon}
                </div>
                <h3 className="home-card-title mt-5">{card.title}</h3>
                <p className="home-card-text mt-3">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section bg-white">
        <div className="section-shell">
          <SectionHeader
            eyebrow="قبل وبعد"
            title="من البيع العشوائي إلى تجارة منظمة"
            description="ميزار تساعدك على نقل تجارتك من الرسائل والشيتات إلى متجر احترافي ولوحة تحكم واحدة."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <CompareCard
              title="قبل ميزار"
              tone="before"
              items={[
                "طلبات على واتساب وفيسبوك",
                "رسائل كثيرة وصعوبة في المتابعة",
                "شيتات Excel غير منظمة",
                "صعوبة معرفة حالة كل طلب",
                "مظهر غير احترافي أمام العميل",
                "لا توجد تقارير واضحة",
              ]}
            />

            <CompareCard
              title="بعد ميزار"
              tone="after"
              items={[
                "متجر إلكتروني احترافي",
                "طلبات منظمة في لوحة واحدة",
                "إدارة منتجات ومخزون بسهولة",
                "رابط متجر قابل للمشاركة",
                "تقارير مبيعات واضحة",
                "تجربة أفضل للعميل",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="home-section soft-section">
        <div className="section-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="section-eyebrow">حل واحد لكل تجارتك</div>

            <h2 className="home-section-title">
              ميزار يجمع تجارتك في مكان واحد
            </h2>

            <p className="home-section-description max-w-xl">
              بدل ما تدير البيع من رسائل وشيتات، تمنحك ميزار متجرًا إلكترونيًا
              احترافيًا ولوحة تحكم سهلة لإدارة المنتجات والطلبات والعملاء
              والتقارير.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {[
                "إدارة المنتجات",
                "إدارة الطلبات",
                "تقارير ذكية",
                "روابط قابلة للمشاركة",
                "إدارة العملاء",
                "الشحن والدفع",
              ].map((item) => (
                <span key={item} className="badge">
                  {item}
                </span>
              ))}
            </div>

            <Link href={primaryHref} className="btn-primary mt-8">
              {primaryText}
            </Link>
          </div>

          <StorefrontMockup />
        </div>
      </section>

      <section id="how-it-works" className="home-section bg-white">
        <div className="section-shell">
          <SectionHeader
            eyebrow="طريقة العمل"
            title="متجرك جاهز في 3 خطوات"
            description="ابدأ بسرعة، بدون كود، وبدون أي خبرة تقنية."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["01", "أنشئ حسابك", "سجل بياناتك واختر اسم متجرك خلال دقائق."],
              [
                "02",
                "أضف منتجاتك",
                "ارفع الصور، الأسعار، والأوصاف بسهولة من لوحة التحكم.",
              ],
              [
                "03",
                "ابدأ البيع",
                "شارك رابط متجرك مع العملاء واستقبل الطلبات مباشرة.",
              ],
            ].map(([number, title, description]) => (
              <article
                key={title}
                className="premium-card hover-lift relative overflow-hidden p-8"
              >
                <span className="absolute left-7 top-7 gold-dot" />

                <p className="font-[var(--font-en)] text-5xl font-black leading-none text-[rgba(24,33,63,0.10)]">
                  {number}
                </p>

                <h3 className="mt-7 text-2xl font-black leading-9 text-[var(--text-main)]">
                  {title}
                </h3>

                <p className="mt-3 text-base font-medium leading-8 text-[var(--text-body)]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="home-section soft-section">
        <div className="section-shell">
          <SectionHeader
            eyebrow="مميزات ميزار"
            title="كل ما يحتاجه التاجر للنمو الرقمي"
            description="أدوات واضحة وبسيطة تساعدك على إدارة متجرك من أول منتج وحتى تقارير المبيعات."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="premium-card hover-lift p-7"
              >
                <div className={`feature-icon ${feature.tone || "mint"}`}>
                  {feature.icon}
                </div>
                <h3 className="home-card-title mt-5">{feature.title}</h3>
                <p className="home-card-text mt-3">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section dark-section">
        <div className="section-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="badge-dark">قصة الاسم</div>

            <h2 className="mt-6 text-4xl font-black leading-tight tracking-[-0.04em] text-white md:text-5xl">
              لماذا تختار ميزار؟
            </h2>

            <p className="mt-6 max-w-2xl text-lg font-medium leading-9 text-[var(--text-light)]">
              اسم ميزار مستوحى من نجم كان يُستخدم قديمًا في التوجيه والملاحة.
              وبنفس الفكرة، تساعد ميزار التجار على الانتقال من البيع العشوائي
              إلى تجارة رقمية منظمة وقابلة للنمو.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {["بسيط", "موثوق", "ذكي", "قابل للنمو"].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <span className="gold-dot" />
                  <p className="mt-4 text-xl font-black leading-8 text-white">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mizar-glow rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="rounded-[1.6rem] bg-[rgba(15,23,42,0.72)] p-6">
              <div className="flex items-center justify-between">
                <span className="badge-dark">Growth Path</span>
                <span className="gold-dot" />
              </div>

              <div className="mt-8 space-y-5">
                {[
                  ["بيع عشوائي", "رسائل وشيتات"],
                  ["تنظيم", "منتجات وطلبات"],
                  ["نمو", "تقارير وروابط"],
                  ["توسع", "دفع وشحن وتسويق"],
                ].map(([title, desc], index) => (
                  <div key={title} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(46,217,179,0.12)] font-[var(--font-en)] font-black text-[var(--mint)]">
                      {index + 1}
                    </div>

                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-black leading-7 text-white">{title}</p>
                      <p className="mt-1 text-sm font-medium leading-6 text-[var(--text-light)]">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="home-section bg-white">
        <div className="section-shell">
          <SectionHeader
            eyebrow="الباقات"
            title="باقات مرنة تناسب كل تاجر"
            description="ابدأ بالخطة المناسبة لك، وطورها مع نمو تجارتك."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`pricing-card premium-card relative p-8 ${
                  plan.popular
                    ? "border-[var(--mint)] shadow-[0_20px_60px_rgba(46,217,179,0.16)]"
                    : ""
                }`}
              >
                {plan.popular && (
                  <span className="badge absolute left-6 top-6">
                    الأكثر شعبية
                  </span>
                )}

                <p className="font-[var(--font-en)] text-2xl font-black leading-none text-[var(--primary)]">
                  {plan.name}
                </p>

                <p className="mt-4 min-h-[58px] text-base font-medium leading-8 text-[var(--text-body)]">
                  {plan.description}
                </p>

                <div className="mt-7 flex items-end gap-2">
                  <strong className="text-4xl font-black leading-none text-[var(--text-main)]">
                    {plan.price}
                  </strong>
                  <span className="pb-1 text-sm font-bold text-[var(--text-muted)]">
                    / شهريًا
                  </span>
                </div>

                <ul className="pricing-features mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[var(--mint)]" />
                      <span className="text-sm font-bold leading-7 text-[var(--text-body)]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/merchant/register"
                  className="btn-primary mt-8 w-full"
                >
                  ابدأ الآن مجانًا
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section bg-white">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">آراء التجار</div>
            <h2 className="home-section-title">
              تجار بدأوا ينظمون بيعهم مع ميزار
            </h2>
            <p className="home-section-description mx-auto max-w-2xl">
              تعليقات قابلة للنشر بعد المراجعة، علشان صاحب المنصة يختار الآراء
              المناسبة للعرض.
            </p>
          </div>

          <div className="mt-10 flex justify-end gap-3">
            <button
              onClick={() => scrollTestimonials("prev")}
              className="rounded-full border border-[var(--border)] bg-white px-4 py-3 font-black text-[var(--primary)] shadow-sm transition hover:-translate-y-1 hover:border-[var(--mint)]"
              type="button"
            >
              →
            </button>

            <button
              onClick={() => scrollTestimonials("next")}
              className="rounded-full border border-[var(--border)] bg-white px-4 py-3 font-black text-[var(--primary)] shadow-sm transition hover:-translate-y-1 hover:border-[var(--mint)]"
              type="button"
            >
              ←
            </button>
          </div>

          {loadingTestimonials && (
            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-4 text-center text-sm font-black text-[var(--text-muted)]">
              جاري تحميل آراء التجار...
            </div>
          )}

          <div
            ref={testimonialRef}
            className="testimonial-track mt-5 flex gap-5 overflow-x-auto pb-5"
          >
            {testimonials.map((testimonial, index) => (
              <article
                key={`${testimonial.name}-${index}`}
                className="testimonial-card premium-card p-7"
              >
                <div className="flex gap-1 text-[var(--gold)]">
                  {Array.from({
                    length: Math.min(Math.max(testimonial.rating, 1), 5),
                  }).map((_, starIndex) => (
                    <span key={starIndex}>★</span>
                  ))}
                </div>

                <p className="mt-5 text-base font-medium leading-9 text-[var(--text-body)]">
                  “{testimonial.text}”
                </p>

                <div className="mt-7 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mint-soft)] font-black text-[var(--mint-hover)]">
                    {testimonial.name.slice(0, 1)}
                  </div>

                  <div>
                    <p className="font-black leading-7 text-[var(--text-main)]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm font-semibold leading-6 text-[var(--text-muted)]">
                      {testimonial.type}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="premium-card mx-auto mt-8 max-w-3xl p-7">
            <h3 className="text-2xl font-black leading-9 text-[var(--text-main)]">
              اكتب رأيك في ميزار
            </h3>

            <p className="mt-2 text-sm font-semibold leading-7 text-[var(--text-muted)]">
              يجب تسجيل الدخول كتاجر لإرسال تعليق. التعليق سيظهر بعد موافقة
              إدارة المنصة.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                  نوع النشاط
                </label>

                <input
                  value={testimonialBusinessType}
                  onChange={(event) =>
                    setTestimonialBusinessType(event.target.value)
                  }
                  className="input"
                  placeholder="مثال: متجر ملابس / عطور / هاند ميد"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-[var(--text-main)]">
                  التقييم
                </label>

                <select
                  value={testimonialRating}
                  onChange={(event) =>
                    setTestimonialRating(Number(event.target.value))
                  }
                  className="input"
                >
                  <option value={5}>5 نجوم</option>
                  <option value={4}>4 نجوم</option>
                  <option value={3}>3 نجوم</option>
                  <option value={2}>2 نجمة</option>
                  <option value={1}>1 نجمة</option>
                </select>
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="input mt-5 min-h-32 resize-none leading-8"
              placeholder="اكتب تجربتك مع ميزار..."
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={submitComment}
                className="btn-primary"
                type="button"
                disabled={submittingComment}
              >
                {submittingComment
                  ? "جاري الإرسال..."
                  : "إرسال التعليق للمراجعة"}
              </button>

              {!isMerchant && (
                <Link href="/merchant/login?next=/" className="btn-secondary">
                  تسجيل الدخول كتاجر
                </Link>
              )}
            </div>

            {commentMessage && (
              <p className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-4 text-sm font-black leading-7 text-[var(--text-body)]">
                {commentMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      <section id="faq" className="home-section soft-section">
        <div className="section-shell">
          <SectionHeader
            eyebrow="الأسئلة الشائعة"
            title="إجابات سريعة قبل ما تبدأ"
            description="كل ما تحتاج معرفته قبل إنشاء متجرك على ميزار."
          />

          <div className="mx-auto mt-12 max-w-4xl space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="faq-item premium-card group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black leading-8 text-[var(--text-main)]">
                  {faq.question}

                  <span className="faq-plus flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--mint-soft)] text-[var(--mint-hover)] transition">
                    +
                  </span>
                </summary>

                <p className="mt-4 text-base font-medium leading-8 text-[var(--text-body)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section bg-white">
        <div className="section-shell">
          <div className="dark-section mizar-glow rounded-[2rem] p-8 md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <span className="gold-dot" />

              <h2 className="mt-6 text-4xl font-black leading-tight tracking-[-0.04em] text-white md:text-5xl">
                جاهز تبدأ رحلتك مع ميزار؟
              </h2>

              <p className="mt-5 text-lg font-medium leading-9 text-[var(--text-light)]">
                أنشئ متجرك الآن وابدأ في تنظيم طلباتك ومبيعاتك خلال دقائق.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href={primaryHref} className="btn-primary">
                  {primaryText}
                </Link>

                <Link href="/contact" className="btn-secondary">
                  تواصل معنا
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      {showTopButton && (
        <button
          type="button"
          className="scroll-top-button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="الرجوع إلى أعلى الصفحة"
        >
          ↑
        </button>
      )}

      {!isMerchant && !isPlatformAdmin && (
        <div className="mobile-sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/92 p-3 backdrop-blur-xl md:hidden">
          <Link href="/merchant/register" className="btn-primary">
            ابدأ الآن مجانًا
          </Link>
        </div>
      )}
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="section-eyebrow mx-auto">{eyebrow}</div>

      <h2 className="home-section-title">{title}</h2>

      <p className="home-section-description mx-auto max-w-2xl">
        {description}
      </p>
    </div>
  );
}

function DashboardMockup() {
  const metrics = [
    ["مبيعات اليوم", "12,450", "+18%"],
    ["طلبات جديدة", "37", "+9%"],
    ["عملاء جدد", "128", "+24%"],
  ];

  const bars = [42, 58, 46, 76, 64, 92, 80];

  const orders = [
    ["طلب #1024", "القاهرة", "تم التأكيد"],
    ["طلب #1025", "الإسكندرية", "جاري الشحن"],
    ["طلب #1026", "المنصورة", "جديد"],
  ];

  return (
    <div className="mizar-dashboard-stage">
      <span className="guiding-point" />

      <div className="mizar-dashboard-shell">
        <div className="mizar-dashboard-top">
          <strong>لوحة تحكم ميزار</strong>

          <div className="window-dots">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="mizar-dashboard-body">
          <aside className="mizar-dashboard-sidebar">
            {["الرئيسية", "الطلبات", "المنتجات", "العملاء", "التقارير"].map(
              (item, index) => (
                <div
                  key={item}
                  className={`mock-side-item ${index === 0 ? "active" : ""}`}
                >
                  <span className="mock-side-dot" />
                  {item}
                </div>
              )
            )}
          </aside>

          <div className="mizar-dashboard-content">
            <div className="mock-metrics-grid">
              {metrics.map(([label, value, up]) => (
                <div key={label} className="mock-metric">
                  <div className="mock-metric-label">{label}</div>
                  <div className="mock-metric-value">{value}</div>
                  <div className="mock-metric-up">{up}</div>
                </div>
              ))}
            </div>

            <div className="mock-chart">
              <strong className="relative z-10 text-sm font-black text-[var(--text-main)]">
                نمو المبيعات
              </strong>

              <div className="mock-chart-bars">
                {bars.map((height, index) => (
                  <div
                    key={index}
                    className="mock-chart-bar"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="mock-orders">
              {orders.map(([code, city, status]) => (
                <div key={code} className="mock-order-row">
                  <strong>{code}</strong>
                  <span>{city}</span>
                  <span className="mock-status">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mock-mobile-card">
        <div className="mock-phone-screen">
          <div className="mock-product-img" />
          <div className="mock-phone-line" />
          <div className="mock-phone-line short" />
          <div className="mock-phone-btn">اطلب الآن</div>
        </div>
      </div>
    </div>
  );
}

function StorefrontMockup() {
  return (
    <div className="premium-card storefront-motion-card p-5">
      <div className="relative z-10 rounded-[1.6rem] bg-[var(--bg-soft)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold leading-6 text-[var(--text-muted)]">
              متجر تجريبي
            </p>

            <h3 className="mt-1 text-2xl font-black leading-9 text-[var(--text-main)]">
              Cairo Fashion
            </h3>
          </div>

          <span className="badge">متاح الآن</span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ["تيشيرت قطن", "350 ج.م"],
            ["شنطة جلد", "890 ج.م"],
            ["حذاء رياضي", "1,250 ج.م"],
            ["ساعة كلاسيك", "650 ج.م"],
          ].map(([name, price], index) => (
            <div
              key={name}
              className="product-card-motion rounded-3xl bg-white p-4 shadow-sm"
            >
              <div
                className={`product-thumb-motion h-28 rounded-2xl ${
                  index % 2 === 0 ? "bg-[var(--mint-soft)]" : "bg-[#EEF2FF]"
                }`}
              />

              <p className="mt-4 font-black leading-7 text-[var(--text-main)]">
                {name}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <strong className="text-sm font-black leading-6 text-[var(--mint-hover)]">
                  {price}
                </strong>

                <button className="rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-black text-white transition hover:-translate-y-1 hover:bg-[var(--navy-soft)]">
                  اطلب الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "before" | "after";
}) {
  const isAfter = tone === "after";

  return (
    <article
      className={`premium-card p-8 ${
        isAfter ? "border-[rgba(46,217,179,0.42)]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-black leading-9 text-[var(--text-main)]">
          {title}
        </h3>

        <span className={isAfter ? "mint-dot" : "gold-dot"} />
      </div>

      <ul className="mt-7 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span
              className={`mt-2.5 h-2 w-2 shrink-0 rounded-full ${
                isAfter ? "bg-[var(--mint)]" : "bg-[var(--gold)]"
              }`}
            />
            <span className="text-base font-bold leading-8 text-[var(--text-body)]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
