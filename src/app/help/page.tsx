import Link from "next/link";
import { PublicPageLayout } from "@/components/public/PublicPageLayout";

const helpCards = [
  {
    title: "بدء استخدام ميزار",
    description:
      "تعرف على خطوات إنشاء الحساب، تجهيز بيانات المتجر، وإضافة أول منتج.",
  },
  {
    title: "إدارة المنتجات",
    description:
      "نصائح لإضافة المنتجات والصور والأسعار والمخزون بطريقة منظمة.",
  },
  {
    title: "إدارة الطلبات",
    description:
      "تابع الطلبات الجديدة، حدّث الحالة، وتأكد من بيانات العميل قبل الشحن.",
  },
  {
    title: "صفحة المتجر",
    description:
      "تعرف على طريقة مشاركة رابط المتجر مع عملائك عبر واتساب وفيسبوك وإنستجرام.",
  },
  {
    title: "الحساب والباقات",
    description:
      "معلومات عن الاشتراك، الترقية، وإدارة بيانات الحساب.",
  },
  {
    title: "الدعم الفني",
    description:
      "لو واجهتك مشكلة، فريقنا يساعدك في حلها خطوة بخطوة.",
  },
];

export default function HelpPage() {
  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">مركز المساعدة</div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
              كل ما تحتاجه لاستخدام ميزار بثقة
            </h1>

            <p className="mt-6 text-lg font-medium leading-9 text-[var(--text-body)]">
              جمعنا لك أهم الموضوعات التي تساعدك على إنشاء متجرك وإدارة
              عملياتك اليومية بسهولة.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {helpCards.map((card) => (
              <div key={card.title} className="premium-card p-7">
                <span className="badge">مساعدة</span>

                <h2 className="mt-5 text-xl font-black text-[var(--text-main)]">
                  {card.title}
                </h2>

                <p className="mt-4 text-sm font-medium leading-8 text-[var(--text-body)]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-[2rem] border border-[var(--border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
            <h2 className="text-3xl font-black text-[var(--text-main)]">
              لم تجد إجابتك؟
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-[var(--text-body)]">
              أرسل لنا استفسارك وسنقوم بالرد عليك في أقرب وقت لمساعدتك في
              استخدام المنصة.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-primary">
                تواصل معنا
              </Link>

              <Link href="/faq" className="btn-secondary">
                الأسئلة الشائعة
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}