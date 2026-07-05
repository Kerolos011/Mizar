"use client";

import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { firstText, getAddressSettings, getContactSettings, getLocale, getSocialLinks, t } from "../components/helpers";

export function Contact(props: any) {
  const locale = getLocale(props);
  const contact = getContactSettings(props);
  const address = getAddressSettings(props);
  const socials = getSocialLinks(props);
  return <PageShell {...props} active="contact"><section className={styles.section}><div className={`${styles.container} ${styles.checkoutGrid}`}><div className={styles.card}><span className={styles.kicker}>{t(locale, "تواصل معنا", "Contact us")}</span><h1 className={styles.sectionTitle}>{t(locale, "نحن هنا لمساعدتك", "We are here to help")}</h1><div className={styles.tabs}><div className={styles.tabCard}><h3>{t(locale, "الهاتف", "Phone")}</h3><p>{firstText(contact.mobileNumber, contact.landlineNumber, "-")}</p></div><div className={styles.tabCard}><h3>WhatsApp</h3><p>{firstText(contact.whatsappNumber, "-")}</p></div><div className={styles.tabCard}><h3>Email</h3><p>{firstText(contact.businessEmail, contact.supportEmail, "-")}</p></div><div className={styles.tabCard}><h3>{t(locale, "العنوان", "Address")}</h3><p>{firstText(address.address, address.city, "-")}</p></div>{contact.workingHours ? <div className={styles.tabCard}><h3>{t(locale, "ساعات العمل", "Working hours")}</h3><p>{contact.workingHours}</p></div> : null}{socials.length ? <div className={styles.tabCard}><h3>{t(locale, "السوشيال", "Social")}</h3><p>{socials.map((s) => s.platform).join(" • ")}</p></div> : null}</div></div><form className={styles.card} onSubmit={(e) => e.preventDefault()}><div className={styles.formGrid}><input className={styles.input} placeholder={t(locale, "الاسم", "Name")} /><input className={styles.input} placeholder={t(locale, "البريد", "Email")} /><textarea className={`${styles.textarea} ${styles.full}`} placeholder={t(locale, "رسالتك", "Your message")} /><button className={`${styles.primaryButton} ${styles.full}`} type="submit">{t(locale, "إرسال", "Send")}</button></div></form></div></section></PageShell>;
}
