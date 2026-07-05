import Link from "next/link";
import { PublicPageLayout } from "@/components/public/PublicPageLayout";

const plans = [
  {
    name: "Starter",
    price: "199",
    description: "مناسبة للتجار في بداية الطريق وتجربة البيع المنظم.",
    badge: "للبداية",
    highlighted: false,
    features: [
      "متجر إلكتروني أساسي",
      "إضافة المنتجات",
      "استقبال الطلبات",
      "رابط متجر قابل للمشاركة",
      "تصميم مناسب للموبايل",
      "دعم أساسي",
    ],
  },
  {
    name: "Growth",
    price: "399",
    description: "الأفضل للتجار الذين يريدون تنظيم الطلبات والنمو بشكل أسرع.",
    badge: "الأكثر اختيارًا",
    highlighted: true,
    features: [
      "كل مميزات Starter",
      "إدارة عملاء أفضل",
      "متابعة الطلبات بشكل أوسع",
      "إحصائيات مبسطة",
      "تحسين تجربة المتجر",
      "أولوية في الدعم",
    ],
  },
  {
    name: "Pro",
    price: "799",
    description: "مناسبة للأنشطة الأكبر التي تحتاج إمكانيات أوسع ودعم أعلى.",
    badge: "للنمو المتقدم",
    highlighted: false,
    features: [
      "كل مميزات Growth",
      "مرونة أعلى في إدارة المتجر",
      "إعدادات متقدمة",
      "تقارير أوسع",
      "دعم مخصص",
      "مناسبة للفرق والأنشطة المتوسعة",
    ],
  },
];

const pricingNotes = [
  {
    title: "تجربة مجانية قبل الاشتراك",
    description:
      "ابدأ بتجربة المنصة وتعرّف على طريقة العمل قبل اختيار الخطة المناسبة.",
  },
  {
    title: "ابدأ بخطة صغيرة",
    description:
      "ابدأ بالخطة المناسبة لحجم نشاطك الحالي، ثم انتقل لخطة أكبر عندما تحتاج.",
  },
  {
    title: "بدون تعقيد تقني",
    description:
      "الباقات مصممة لتناسب التجار، وليس فرق تقنية أو مطورين.",
  },
];

const faqs = [
  {
    question: "هل الأسعار شهرية؟",
    answer:
      "نعم، الأسعار المعروضة هي أسعار شهرية مبدئية، وقد يتم توفير خطط سنوية أو عروض خاصة لاحقًا.",
  },
  {
    question: "هل يمكن تغيير الباقة لاحقًا؟",
    answer:
      "نعم، يمكنك البدء بخطة مناسبة ثم الترقية مع نمو نشاطك واحتياجك لمميزات إضافية.",
  },
  {
    question: "هل توجد تجربة مجانية؟",
    answer:
      "نعم، يمكنك بدء التجربة المجانية للتعرف على المنصة قبل الالتزام بأي باقة مدفوعة.",
  },
  {
    question: "هل ميزار مناسبة للتجار الجدد؟",
    answer:
      "نعم، خصوصًا لو كنت تبيع عبر واتساب أو فيسبوك أو إنستجرام وتريد تنظيم البيع بشكل احترافي.",
  },
];

export default function PricingPage() {
  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">الباقات</div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
              خطط بسيطة تناسب بداية تجارتك ونموها
            </h1>

            <p className="mt-6 text-lg font-medium leading-9 text-[var(--text-body)]">
              اختر الخطة المناسبة لحجم نشاطك الحالي، وابدأ في بناء متجر منظم
              يساعدك على البيع بثقة.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-[2rem] border p-7 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)] ${
                  plan.highlighted
                    ? "border-[rgba(46,217,179,0.45)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--text-main)]"
                }`}
              >
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${
                    plan.highlighted
                      ? "bg-[var(--mint)] text-[var(--primary)]"
                      : "bg-[var(--mint-soft)] text-[var(--mint-hover)]"
                  }`}
                >
                  {plan.badge}
                </span>

                <h2
                  className={`mt-6 font-[var(--font-en)] text-3xl font-black ${
                    plan.highlighted ? "text-white" : "text-[var(--text-main)]"
                  }`}
                >
                  {plan.name}
                </h2>

                <p
                  className={`mt-4 min-h-[64px] text-sm font-medium leading-8 ${
                    plan.highlighted
                      ? "text-[var(--text-light)]"
                      : "text-[var(--text-body)]"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-7 flex items-end gap-2">
                  <span
                    className={`text-5xl font-black ${
                      plan.highlighted ? "text-white" : "text-[var(--primary)]"
                    }`}
                  >
                    {plan.price}
                  </span>

                  <span
                    className={`pb-2 text-sm font-black ${
                      plan.highlighted
                        ? "text-[var(--text-light)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    جنيه / شهر
                  </span>
                </div>

                <Link
                  href="/merchant/register"
                  className={`mt-8 flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-black transition duration-300 ${
                    plan.highlighted
                      ? "bg-[var(--mint)] text-[var(--primary)] shadow-[var(--shadow-button)] hover:bg-[var(--mint-hover)] hover:text-white"
                      : "border border-[rgba(46,217,179,0.35)] bg-[var(--mint-soft)] text-[var(--primary)] hover:border-[var(--mint)] hover:bg-[var(--mint)] hover:text-[var(--primary)]"
                  }`}
                >
                  ابدأ الآن
                </Link>

                <div
                  className={`my-7 h-px ${
                    plan.highlighted ? "bg-white/10" : "bg-[var(--border)]"
                  }`}
                />

                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex gap-3 text-sm font-bold leading-7 ${
                        plan.highlighted
                          ? "text-white"
                          : "text-[var(--text-body)]"
                      }`}
                    >
                      <span
                        className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                          plan.highlighted
                            ? "bg-[var(--mint)]"
                            : "bg-[var(--mint-hover)]"
                        }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {pricingNotes.map((note) => (
              <div key={note.title} className="premium-card p-7">
                <span className="badge">معلومة</span>

                <h2 className="mt-5 text-xl font-black text-[var(--text-main)]">
                  {note.title}
                </h2>

                <p className="mt-4 text-sm font-medium leading-8 text-[var(--text-body)]">
                  {note.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-[2rem] border border-[var(--border)] bg-white p-7 shadow-[var(--shadow-card)] md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black text-[var(--text-main)]">
                أسئلة شائعة عن الباقات
              </h2>

              <p className="mt-4 text-base font-medium leading-8 text-[var(--text-body)]">
                إجابات سريعة تساعدك تختار الخطة المناسبة قبل البداية.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-4xl space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-3xl border border-[var(--border)] bg-[var(--bg-soft)] p-6"
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
          </div>

          <div className="mt-16 rounded-[2rem] bg-[var(--primary)] p-8 text-center text-white md:p-10">
            <h2 className="text-3xl font-black leading-tight text-white md:text-4xl">
              محتار تختار أي باقة؟
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-[var(--text-light)]">
              تواصل معنا وسنساعدك في اختيار الخطة الأنسب حسب حجم نشاطك وعدد
              منتجاتك وطريقة البيع الحالية.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-primary">
                تواصل معنا
              </Link>

              <Link
                href="/merchant/register"
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:border-[var(--mint)] hover:bg-[var(--mint)] hover:text-[var(--primary)]"
              >
                ابدأ التجربة الآن
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}