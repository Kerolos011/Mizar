import Link from "next/link";
import { PublicPageLayout } from "@/components/public/PublicPageLayout";

const demoFeatures = [
  "واجهة متجر مناسبة للموبايل",
  "عرض المنتجات والصور والأسعار",
  "صفحة تفاصيل لكل منتج",
  "سلة مشتريات وتجربة طلب واضحة",
  "إدارة الطلبات من لوحة التاجر",
  "مشاركة رابط المتجر بسهولة",
];

export default function DemoStorePage() {
  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="section-eyebrow">المتجر التجريبي</div>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
                شاهد شكل تجربة المتجر قبل أن تبدأ
              </h1>

              <p className="mt-6 text-lg font-medium leading-9 text-[var(--text-body)]">
                المتجر التجريبي يوضح كيف يمكن أن يظهر نشاطك للعملاء، من عرض
                المنتجات وحتى إرسال الطلب بطريقة منظمة وسهلة.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/merchant/register" className="btn-primary">
                  أنشئ متجرك الآن
                </Link>

                <Link href="/contact" className="btn-secondary">
                  اطلب شرح المنصة
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-mockup)]">
              <div className="rounded-[1.5rem] bg-[var(--primary)] p-5 text-white">
                <p className="text-sm font-black text-[var(--mint)]">
                  Demo Store
                </p>
                <h2 className="mt-3 text-2xl font-black">
                  متجر تجريبي على ميزار
                </h2>
                <p className="mt-3 text-sm font-medium leading-7 text-[var(--text-light)]">
                  تجربة مصممة لتوضيح شكل المتجر وسهولة الشراء للعميل.
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {["منتج تجريبي", "عرض خاص", "منتج مميز", "منتج جديد"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-4"
                    >
                      <div className="h-28 rounded-xl bg-white" />
                      <h3 className="mt-4 font-black text-[var(--text-main)]">
                        {item}
                      </h3>
                      <p className="mt-2 text-sm font-bold text-[var(--mint-hover)]">
                        199 جنيه
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {demoFeatures.map((feature) => (
              <div key={feature} className="premium-card p-6">
                <span className="badge">ميزة</span>
                <p className="mt-4 text-base font-black leading-8 text-[var(--text-main)]">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}