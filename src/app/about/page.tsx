import Link from "next/link";
import { PublicPageLayout } from "@/components/public/PublicPageLayout";

const values = [
  {
    title: "البساطة أولًا",
    description:
      "نصمم كل خطوة بحيث يقدر التاجر يبدأ بسرعة بدون تعقيد تقني أو مصطلحات مربكة.",
  },
  {
    title: "نمو حقيقي للتاجر",
    description:
      "هدفنا ليس إنشاء متجر فقط، بل مساعدة التاجر على تنظيم الطلبات وبناء تجربة شراء أفضل.",
  },
  {
    title: "ثقة واحتراف",
    description:
      "نهتم بشكل المتجر وسهولة الاستخدام حتى يظهر نشاطك بصورة احترافية أمام العملاء.",
  },
];

export default function AboutPage() {
  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">من نحن</div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
              ميزار دليلك لبناء تجارة رقمية أكثر تنظيمًا واحترافًا
            </h1>

            <p className="mt-6 text-lg font-medium leading-9 text-[var(--text-body)]">
              ميزار منصة SaaS عربية تساعد التجار وأصحاب المشاريع الصغيرة على
              إنشاء متجر إلكتروني وإدارة المنتجات والطلبات والعملاء من مكان
              واحد، بدون الحاجة إلى خبرة برمجية.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="premium-card p-7">
                <span className="badge">MIZAR</span>
                <h2 className="mt-5 text-2xl font-black text-[var(--text-main)]">
                  {value.title}
                </h2>
                <p className="mt-4 text-sm font-medium leading-8 text-[var(--text-body)]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-[2rem] bg-[var(--primary)] p-8 text-white md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-black leading-tight md:text-4xl">
                  مهمتنا
                </h2>
                <p className="mt-5 text-base font-medium leading-9 text-[var(--text-light)]">
                  نساعد التاجر العربي ينتقل من البيع العشوائي عبر الرسائل
                  والشيتات إلى نظام واضح ومنظم يسهّل البيع والمتابعة والنمو.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6">
                <p className="text-sm font-black text-[var(--mint)]">
                  ابدأ بذكاء. وانمُ بسرعة.
                </p>
                <p className="mt-3 text-sm font-medium leading-7 text-[var(--text-light)]">
                  هذا هو الوعد الذي نبني عليه تجربة ميزار لكل تاجر يستخدم
                  المنصة.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/merchant/register" className="btn-primary">
              ابدأ الآن مجانًا
            </Link>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}