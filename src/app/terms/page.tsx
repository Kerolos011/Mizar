import Link from "next/link";
import { PublicPageLayout } from "@/components/public/PublicPageLayout";

const sections = [
  {
    title: "1. قبول الشروط",
    content:
      "باستخدام منصة ميزار أو إنشاء حساب عليها، فإنك توافق على الالتزام بهذه الشروط والأحكام وأي تحديثات مستقبلية يتم نشرها على المنصة.",
  },
  {
    title: "2. طبيعة الخدمة",
    content:
      "ميزار منصة رقمية تساعد التجار على إنشاء وإدارة متاجر إلكترونية، وإضافة المنتجات، واستقبال الطلبات، وتنظيم بيانات العملاء والعمليات المرتبطة بالمتجر.",
  },
  {
    title: "3. حساب المستخدم",
    content:
      "يلتزم المستخدم بتقديم بيانات صحيحة عند التسجيل، والحفاظ على سرية بيانات الدخول، ويتحمل المسؤولية عن أي نشاط يتم من خلال حسابه.",
  },
  {
    title: "4. محتوى المتجر",
    content:
      "يتحمل صاحب المتجر المسؤولية الكاملة عن المنتجات والصور والأسعار والوصف والسياسات التي يضيفها داخل متجره، ويجب ألا يخالف المحتوى القوانين أو حقوق الغير.",
  },
  {
    title: "5. الاستخدام المسموح",
    content:
      "يُمنع استخدام المنصة في أنشطة غير قانونية أو مضللة أو مخالفة للآداب العامة أو تنتهك حقوق الملكية الفكرية أو تسبب ضررًا للمنصة أو للمستخدمين الآخرين.",
  },
  {
    title: "6. الاشتراكات والباقات",
    content:
      "قد توفر ميزار باقات مجانية أو مدفوعة. تختلف المميزات والحدود حسب كل باقة، ويحق للمنصة تعديل الباقات أو الأسعار مع إخطار المستخدمين عند الحاجة.",
  },
  {
    title: "7. توفر الخدمة",
    content:
      "نسعى لتوفير الخدمة بأفضل شكل ممكن، لكن قد تحدث فترات توقف مؤقتة لأغراض الصيانة أو لأسباب خارجة عن الإرادة.",
  },
  {
    title: "8. إنهاء أو تعليق الحساب",
    content:
      "تحتفظ ميزار بحق تعليق أو إنهاء أي حساب يثبت مخالفته لهذه الشروط أو استخدامه للمنصة بطريقة تضر بالخدمة أو بالمستخدمين.",
  },
  {
    title: "9. التعديلات",
    content:
      "قد يتم تحديث هذه الشروط من وقت لآخر. استمرار استخدام المنصة بعد نشر التحديثات يعني موافقتك على الشروط المعدلة.",
  },
];

export default function TermsPage() {
  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">الشروط والأحكام</div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
              شروط استخدام منصة ميزار
            </h1>

            <p className="mt-6 text-lg font-medium leading-9 text-[var(--text-body)]">
              هذه الصفحة توضح القواعد العامة لاستخدام منصة ميزار وخدماتها.
              يُفضل مراجعتها بعناية قبل استخدام المنصة.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-4xl rounded-[2rem] border border-[var(--border)] bg-white p-7 shadow-[var(--shadow-card)] md:p-10">
            <p className="rounded-2xl bg-[var(--bg-soft)] p-4 text-sm font-bold leading-8 text-[var(--text-muted)]">
              آخر تحديث: يونيو 2026. هذا المحتوى قالب عام مناسب للمنصة، ويُفضل
              مراجعته قانونيًا قبل الإطلاق التجاري الرسمي.
            </p>

            <div className="mt-8 space-y-8">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-xl font-black text-[var(--text-main)]">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-8 text-[var(--text-body)]">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-5">
              <h2 className="text-lg font-black text-[var(--text-main)]">
                التواصل بخصوص الشروط
              </h2>
              <p className="mt-3 text-sm font-medium leading-8 text-[var(--text-body)]">
                لأي استفسار حول هذه الشروط، يمكنك التواصل معنا من خلال صفحة
                تواصل معنا.
              </p>
              <Link href="/contact" className="btn-primary mt-5">
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}