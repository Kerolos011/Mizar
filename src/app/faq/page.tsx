import Link from "next/link";
import { PublicPageLayout } from "@/components/public/PublicPageLayout";

const faqs = [
  {
    question: "هل أحتاج خبرة تقنية لاستخدام ميزار؟",
    answer:
      "لا. ميزار مصممة للتجار وأصحاب المشاريع الذين يريدون إنشاء متجر إلكتروني بدون برمجة أو إعدادات تقنية معقدة.",
  },
  {
    question: "هل أقدر أبيع من خلال واتساب وفيسبوك وإنستجرام؟",
    answer:
      "نعم. يمكنك مشاركة رابط متجرك مع العملاء عبر منصات التواصل، واستقبال الطلبات بشكل أكثر تنظيمًا بدل الاعتماد الكامل على الرسائل اليدوية.",
  },
  {
    question: "هل يوجد تجربة مجانية؟",
    answer:
      "نعم، يمكنك البدء مجانًا وتجربة المنصة قبل اختيار الخطة المناسبة لنشاطك.",
  },
  {
    question: "هل أقدر أضيف المنتجات بنفسي؟",
    answer:
      "نعم. تستطيع إضافة المنتجات والصور والأسعار وتحديث المخزون من لوحة التحكم الخاصة بك.",
  },
  {
    question: "هل المتجر يعمل على الموبايل؟",
    answer:
      "نعم. صفحات المتجر مصممة لتظهر بشكل مناسب على الهاتف والتابلت والكمبيوتر.",
  },
  {
    question: "هل ميزار مناسبة للمشاريع الصغيرة؟",
    answer:
      "نعم. المنصة مناسبة لأصحاب المشاريع الصغيرة، التجار، البراندات المحلية، ومتاجر السوشيال ميديا.",
  },
];

export default function FAQPage() {
  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">الأسئلة الشائعة</div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
              إجابات واضحة قبل ما تبدأ
            </h1>

            <p className="mt-6 text-lg font-medium leading-9 text-[var(--text-body)]">
              هنا هتلاقي أهم الأسئلة اللي بتقابل التجار قبل استخدام ميزار.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-4xl space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <summary className="cursor-pointer list-none text-lg font-black text-[var(--text-main)]">
                  <div className="flex items-center justify-between gap-4">
                    <span>{faq.question}</span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--mint-soft)] text-[var(--mint-hover)] transition group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>

                <p className="mt-4 text-sm font-medium leading-8 text-[var(--text-body)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/contact" className="btn-primary">
              عندك سؤال تاني؟ تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}