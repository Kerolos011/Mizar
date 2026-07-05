import Link from "next/link";
import { PublicPageLayout } from "@/components/public/PublicPageLayout";

const steps = [
  {
    number: "01",
    title: "أنشئ حسابك",
    description:
      "ابدأ بإنشاء حساب تاجر على ميزار خلال دقائق، بدون خطوات تقنية معقدة.",
  },
  {
    number: "02",
    title: "جهّز بيانات متجرك",
    description:
      "أضف اسم المتجر، وصف النشاط، بيانات التواصل، وأي تفاصيل تساعد العملاء على الثقة فيك.",
  },
  {
    number: "03",
    title: "أضف منتجاتك",
    description:
      "ارفع صور المنتجات، اكتب الوصف، حدّد الأسعار والكميات، ونظّم منتجاتك بطريقة واضحة.",
  },
  {
    number: "04",
    title: "شارك رابط المتجر",
    description:
      "انشر رابط متجرك على واتساب، فيسبوك، إنستجرام، أو أي قناة تستخدمها للبيع.",
  },
  {
    number: "05",
    title: "استقبل الطلبات",
    description:
      "عندما يطلب العميل، يظهر الطلب داخل لوحة التحكم لتتابعه وتحدّث حالته بسهولة.",
  },
  {
    number: "06",
    title: "تابع ونمّي تجارتك",
    description:
      "راقب المنتجات والطلبات والعملاء، وابدأ في تحسين طريقة البيع بناءً على بيانات أوضح.",
  },
];

const comparison = [
  {
    title: "قبل ميزار",
    items: [
      "طلبات متفرقة بين واتساب وفيسبوك.",
      "صعوبة معرفة حالة كل طلب.",
      "تحديث الأسعار والمخزون يدويًا.",
      "مظهر غير موحد أمام العملاء.",
    ],
  },
  {
    title: "بعد ميزار",
    items: [
      "متجر واضح يجمع المنتجات في مكان واحد.",
      "طلبات منظمة داخل لوحة التحكم.",
      "سهولة مشاركة الرابط مع العملاء.",
      "تجربة أكثر احترافًا وثقة.",
    ],
  },
];

const notes = [
  {
    title: "لا تحتاج مطور",
    description:
      "ميزار مصممة لتكون سهلة على التاجر، فلا تحتاج معرفة برمجية لبدء متجرك.",
  },
  {
    title: "ابدأ صغيرًا وتوسع",
    description:
      "يمكنك البدء بعدد قليل من المنتجات ثم تطوير متجرك مع نمو نشاطك.",
  },
  {
    title: "مناسبة لطبيعة البيع الحالية",
    description:
      "لو تبيع الآن من خلال السوشيال ميديا، ميزار يساعدك تنظم البيع بدل تغييره بالكامل.",
  },
];

export default function HowItWorksPage() {
  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">طريقة العمل</div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
              من فكرة المتجر إلى أول طلب بخطوات بسيطة
            </h1>

            <p className="mt-6 text-lg font-medium leading-9 text-[var(--text-body)]">
              ميزار تساعدك على تحويل نشاطك من بيع متفرق عبر الرسائل إلى متجر
              إلكتروني واضح ومنظم يمكن للعملاء الطلب منه بسهولة.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/merchant/register" className="btn-primary">
                ابدأ الآن مجانًا
              </Link>

              <Link href="/features" className="btn-secondary">
                استعرض المميزات
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="relative">
              <div className="absolute right-[31px] top-6 hidden h-[calc(100%-48px)] w-px bg-[var(--border)] md:block" />

              <div className="space-y-6">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="relative grid gap-5 md:grid-cols-[64px_1fr]"
                  >
                    <div className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white shadow-[var(--shadow-card)]">
                      {step.number}
                    </div>

                    <div className="premium-card p-7">
                      <h2 className="text-2xl font-black text-[var(--text-main)]">
                        {step.title}
                      </h2>

                      <p className="mt-3 text-sm font-medium leading-8 text-[var(--text-body)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {comparison.map((block) => (
              <div key={block.title} className="premium-card p-7 md:p-8">
                <h2 className="text-3xl font-black text-[var(--text-main)]">
                  {block.title}
                </h2>

                <ul className="mt-6 space-y-4">
                  {block.items.map((item) => (
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

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {notes.map((note) => (
              <div key={note.title} className="premium-card p-7">
                <span className="badge">معلومة مهمة</span>

                <h2 className="mt-5 text-xl font-black text-[var(--text-main)]">
                  {note.title}
                </h2>

                <p className="mt-4 text-sm font-medium leading-8 text-[var(--text-body)]">
                  {note.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-[2rem] bg-[var(--primary)] p-8 text-center text-white md:p-10">
            <h2 className="text-3xl font-black leading-tight md:text-4xl">
              ابدأ بذكاء. وانمُ بسرعة.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-[var(--text-light)]">
              كل خطوة في ميزار مصممة لتقليل التعقيد ومساعدة التاجر على إدارة
              البيع بطريقة أوضح.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/merchant/register" className="btn-primary">
                أنشئ حسابك الآن
              </Link>

              <Link href="/contact" className="btn-secondary">
                اطلب مساعدة
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}