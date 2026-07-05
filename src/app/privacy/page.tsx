import Link from "next/link";
import { PublicPageLayout } from "@/components/public/PublicPageLayout";

const sections = [
  {
    title: "1. البيانات التي نجمعها",
    content:
      "قد نجمع بيانات مثل الاسم، البريد الإلكتروني، رقم الهاتف، بيانات المتجر، بيانات المنتجات، الطلبات، وأي معلومات يضيفها المستخدم أثناء استخدام المنصة.",
  },
  {
    title: "2. كيفية استخدام البيانات",
    content:
      "نستخدم البيانات لتشغيل المنصة، إنشاء الحسابات، إدارة المتاجر، تحسين تجربة المستخدم، تقديم الدعم، إرسال إشعارات مهمة، وتطوير الخدمات.",
  },
  {
    title: "3. بيانات العملاء داخل المتاجر",
    content:
      "قد يقوم صاحب المتجر بإدخال أو استقبال بيانات عملائه من خلال المنصة. يتحمل صاحب المتجر مسؤولية استخدام هذه البيانات بطريقة قانونية ومناسبة.",
  },
  {
    title: "4. ملفات تعريف الارتباط",
    content:
      "قد نستخدم ملفات تعريف الارتباط أو تقنيات مشابهة لتحسين تجربة الاستخدام، حفظ الجلسات، وتحليل الأداء العام للمنصة.",
  },
  {
    title: "5. مشاركة البيانات",
    content:
      "لا نبيع بيانات المستخدمين. قد تتم مشاركة بعض البيانات مع مزودي خدمات موثوقين عند الحاجة لتشغيل المنصة أو تقديم الدعم أو تحسين الخدمة.",
  },
  {
    title: "6. حماية البيانات",
    content:
      "نعمل على استخدام إجراءات مناسبة لحماية البيانات من الوصول غير المصرح به أو الفقدان أو سوء الاستخدام، مع العلم أنه لا توجد وسيلة حماية رقمية مضمونة بنسبة كاملة.",
  },
  {
    title: "7. الاحتفاظ بالبيانات",
    content:
      "نحتفظ بالبيانات طالما كان ذلك ضروريًا لتقديم الخدمة أو للوفاء بالالتزامات التشغيلية أو القانونية أو لحماية حقوق المنصة والمستخدمين.",
  },
  {
    title: "8. حقوق المستخدم",
    content:
      "يمكن للمستخدم طلب تحديث بياناته أو حذفها أو الاستفسار عن طريقة استخدامها من خلال التواصل مع فريق الدعم.",
  },
  {
    title: "9. تحديثات السياسة",
    content:
      "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر النسخة المحدثة على هذه الصفحة.",
  },
];

export default function PrivacyPage() {
  return (
    <PublicPageLayout>
      <section className="page-section">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow mx-auto">سياسة الخصوصية</div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] md:text-6xl">
              خصوصيتك وثقة بياناتك جزء أساسي من ميزار
            </h1>

            <p className="mt-6 text-lg font-medium leading-9 text-[var(--text-body)]">
              نوضح هنا كيف نتعامل مع البيانات التي يتم تقديمها أو استخدامها من
              خلال منصة ميزار.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-4xl rounded-[2rem] border border-[var(--border)] bg-white p-7 shadow-[var(--shadow-card)] md:p-10">
            <p className="rounded-2xl bg-[var(--bg-soft)] p-4 text-sm font-bold leading-8 text-[var(--text-muted)]">
              آخر تحديث: يونيو 2026. هذه السياسة صياغة عامة مناسبة للمنصة،
              ويُفضل مراجعتها قانونيًا قبل الإطلاق التجاري الرسمي.
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
                التواصل بخصوص الخصوصية
              </h2>
              <p className="mt-3 text-sm font-medium leading-8 text-[var(--text-body)]">
                إذا كان لديك أي سؤال حول بياناتك أو طريقة استخدامها، يمكنك
                التواصل معنا.
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