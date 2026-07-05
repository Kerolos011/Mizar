import Link from "next/link";
import { PublicPageLayout } from "@/components/public/PublicPageLayout";

const mainFeatures = [
  {
    title: "متجر إلكتروني جاهز بسرعة",
    description:
      "أنشئ متجرًا احترافيًا لعرض منتجاتك واستقبال الطلبات بدون برمجة أو إعدادات معقدة.",
  },
  {
    title: "إدارة المنتجات والمخزون",
    description:
      "أضف المنتجات والصور والأسعار والكميات، وتابع المخزون بشكل منظم من لوحة تحكم واحدة.",
  },
  {
    title: "إدارة الطلبات",
    description:
      "استقبل الطلبات الجديدة، تابع حالة كل طلب، وقلّل الاعتماد على الرسائل العشوائية والشيتات.",
  },
  {
    title: "تجربة مناسبة للموبايل",
    description:
      "متجرك يظهر بشكل واضح وسهل الاستخدام على الهاتف، وهو المكان الذي يشتري منه أغلب العملاء.",
  },
  {
    title: "رابط متجر قابل للمشاركة",
    description:
      "شارك رابط متجرك بسهولة على واتساب وفيسبوك وإنستجرام بدل إرسال صور وأسعار يدويًا.",
  },
  {
    title: "لوحة تحكم للتاجر",
    description:
      "تابع المنتجات والطلبات والعملاء والإحصائيات من مكان واحد يساعدك على اتخاذ قرارات أفضل.",
  },
];

const businessBenefits = [
  "تقليل ضياع الطلبات بين رسائل واتساب وفيسبوك.",
  "عرض المنتجات بشكل احترافي يزيد ثقة العميل.",
  "تسهيل تحديث الأسعار والمخزون في أي وقت.",
  "تحسين تجربة العميل من مشاهدة المنتج حتى إرسال الطلب.",
  "تجهيز متجرك للنمو بدل الاعتماد على طرق يدوية.",
  "مناسب للتجار الصغار والبراندات المحلية ومتاجر السوشيال ميديا.",
];

const featureGroups = [
  {
    title: "للبيع عبر السوشيال ميديا",
    items: [
      "شارك رابط المتجر مع العملاء.",
      "استقبل الطلبات بطريقة أوضح.",
      "حوّل المتابعين إلى عملاء بسهولة.",
    ],
  },
  {
    title: "لتنظيم العمليات",
    items: [
      "منتجات منظمة.",
      "طلبات واضحة.",
      "عملاء وبيانات محفوظة.",
    ],
  },
  {
    title: "للنمو والاحتراف",
    items: [
      "واجهة متجر موثوقة.",
      "تجربة شراء أسهل.",
      "قابلية للتوسع مع الوقت.",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">المميزات</div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
              كل ما يحتاجه التاجر لبناء متجر إلكتروني منظم واحترافي
            </h1>

            <p className="mt-6 text-lg font-medium leading-9 text-[var(--text-body)]">
              ميزار تجمع أدوات إنشاء المتجر، إدارة المنتجات، متابعة الطلبات،
              وتنظيم العملاء في منصة واحدة بسيطة ومناسبة للتجار في مصر
              والمنطقة العربية.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/merchant/register" className="btn-primary">
                ابدأ الآن مجانًا
              </Link>

              <Link href="/demo-store" className="btn-secondary">
                شاهد المتجر التجريبي
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mainFeatures.map((feature) => (
              <div key={feature.title} className="premium-card p-7">
                <span className="badge">ميزة</span>

                <h2 className="mt-5 text-xl font-black leading-8 text-[var(--text-main)]">
                  {feature.title}
                </h2>

                <p className="mt-4 text-sm font-medium leading-8 text-[var(--text-body)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-[2rem] bg-[var(--primary)] p-8 text-white md:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <span className="badge-dark">لماذا ميزار؟</span>

                <h2 className="mt-5 text-3xl font-black leading-tight md:text-4xl">
                  من البيع اليدوي إلى نظام واضح يساعدك تنمو
                </h2>

                <p className="mt-5 text-base font-medium leading-9 text-[var(--text-light)]">
                  كثير من التجار يبدأون بالبيع عبر الرسائل، لكن مع زيادة
                  الطلبات يصبح التنظيم صعبًا. ميزار يساعدك على ترتيب المنتجات
                  والطلبات والعملاء في تجربة واحدة أكثر احترافًا.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {businessBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4"
                  >
                    <p className="text-sm font-bold leading-7 text-white">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {featureGroups.map((group) => (
              <div key={group.title} className="premium-card p-7">
                <h2 className="text-2xl font-black text-[var(--text-main)]">
                  {group.title}
                </h2>

                <ul className="mt-5 space-y-4">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm font-bold leading-7 text-[var(--text-body)]"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--mint)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-[2rem] border border-[var(--border)] bg-white p-8 text-center shadow-[var(--shadow-card)] md:p-10">
            <h2 className="text-3xl font-black text-[var(--text-main)]">
              جاهز تشوف الفرق في طريقة إدارة تجارتك؟
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-[var(--text-body)]">
              ابدأ بتجربة ميزار، وأنشئ متجرك الأول بخطوات بسيطة وواضحة.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/merchant/register" className="btn-primary">
                ابدأ الآن مجانًا
              </Link>

              <Link href="/contact" className="btn-secondary">
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}