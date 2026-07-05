import type { ReactNode } from "react";
import type { TemplatePageProps } from "../../_shared/template-types";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "../styles.module.css";
import { theme } from "../theme";

function contactItem(key: string, label: string, value?: string | null, href?: string) {
  if (!value) return null;
  return (
    <a key={key} className={styles.contactItem} href={href || "#"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </a>
  );
}

export function Contact(props: TemplatePageProps) {
  const { store, locale, text } = props;
  const isAr = locale === "ar";
  const phone = (store as any)?.phone || store?.whatsapp || "";
  const email = (store as any)?.email || store?.contactEmail || "";
  const address = [store?.city, store?.area, store?.address].filter(Boolean).join(" - ");
  const items: ReactNode[] = [
    contactItem("phone", isAr ? "الهاتف" : "Phone", phone, phone ? `tel:${phone}` : undefined),
    contactItem("whatsapp", "WhatsApp", store?.whatsapp, store?.whatsapp ? `https://wa.me/${String(store.whatsapp).replace(/[^0-9]/g, "")}` : undefined),
    contactItem("email", isAr ? "البريد" : "Email", email, email ? `mailto:${email}` : undefined),
    contactItem("address", isAr ? "العنوان" : "Address", address),
    contactItem("website", isAr ? "الموقع" : "Website", (store as any)?.website || store?.websiteUrl, (store as any)?.website || store?.websiteUrl || undefined),
  ].filter(Boolean);

  return (
    <main className={styles.root} dir={isAr ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="contact" />
      <section className={styles.pageHero}><div className={styles.shell}><span className={styles.kicker}>{theme.name}</span><h1 className={styles.pageTitle}>{text.nav.contact}</h1><p className={styles.sectionSubtitle}>{isAr ? "كل بيانات التواصل التي يدخلها التاجر في الإعدادات تظهر هنا تلقائيًا." : "All contact details entered in settings are displayed here automatically."}</p></div></section>
      <section className={styles.section}>
        <div className={`${styles.shell} ${styles.contactGrid}`}>
          <div className={styles.contactCard}>
            <h2>{isAr ? "تواصل معنا" : "Get in touch"}</h2>
            <p>{store?.description || (isAr ? "يسعدنا مساعدتك في أي استفسار عن المنتجات أو الطلبات أو الشحن." : "We are happy to help with products, orders and shipping.")}</p>
            <div className={styles.contactList}>{items.length ? items : <div className={styles.emptyInline}>{isAr ? "أضف بيانات التواصل من إعدادات المتجر." : "Add contact details from store settings."}</div>}</div>
          </div>
          <form className={styles.contactCard}>
            <h2>{isAr ? "رسالة سريعة" : "Quick message"}</h2>
            <input className={styles.input} placeholder={isAr ? "الاسم" : "Name"} />
            <input className={styles.input} placeholder={isAr ? "رقم الجوال" : "Phone"} />
            <textarea className={styles.textarea} placeholder={isAr ? "رسالتك" : "Your message"} />
            <button className={styles.primaryButton} type="button">{isAr ? "إرسال" : "Send"}</button>
          </form>
        </div>
      </section>
      <Footer store={store} text={text} locale={locale} />
    </main>
  );
}
