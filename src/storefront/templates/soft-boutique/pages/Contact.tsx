import type { TemplatePageProps } from "../../_shared/template-types";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "../styles.module.css";
import { theme } from "../theme";

function item(label: string, value?: string | null, href?: string) {
  if (!value) return null;
  return <a className={styles.contactItem} href={href || "#"}><strong>{label}</strong><span>{value}</span></a>;
}

export function Contact(props: TemplatePageProps) {
  const { store, content, products, categories, locale, text } = props;
  const phone = (store as any)?.phone || store?.contactPhone || "";
  const email = (store as any)?.email || store?.contactEmail || "";
  const whatsapp = store?.whatsapp || "";
  const address = [store?.city, store?.area, store?.address].filter(Boolean).join(" - ");
  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="contact" />
      <section className={styles.pageHero}><div className={styles.shell}><div className={styles.eyebrow}>{theme.name}</div><h1 className={styles.pageTitle}>{text.pages.contactTitle}</h1><p className={styles.sectionSubtitle}>{text.pages.contactSubtitle}</p></div></section>
      <section className={styles.section}>
        <div className={`${styles.shell} ${styles.contactGrid}`}>
          <div className={styles.contactCard}>
            <h2 className={styles.sectionTitle}>{text.pages.contactInfo}</h2>
            <p className={styles.sectionSubtitle}>{store?.description || text.pages.contactSubtitle}</p>
          </div>
          <div className={styles.contactCard}>
            <div className={styles.contactList}>
              {item(locale === "ar" ? "واتساب" : "WhatsApp", whatsapp, whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : undefined)}
              {item(locale === "ar" ? "الجوال" : "Phone", phone, phone ? `tel:${phone}` : undefined)}
              {item(locale === "ar" ? "البريد" : "Email", email, email ? `mailto:${email}` : undefined)}
              {item(locale === "ar" ? "العنوان" : "Address", address)}
              {!phone && !email && !whatsapp && !address ? <div className={styles.empty}><h3>{text.pages.contactInfo}</h3><p>{locale === "ar" ? "أضف بيانات التواصل من لوحة التحكم." : "Add contact details from the dashboard."}</p></div> : null}
            </div>
          </div>
        </div>
      </section>
      <Footer store={store} text={text} />
    </main>
  );
}
