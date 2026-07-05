import type { TemplatePageProps } from "../../_shared/template-types";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AuthCard } from "../components/AuthCard";
import styles from "../styles.module.css";
import { theme } from "../theme";

export function Login(props: TemplatePageProps) {
  const { store, locale, text } = props;
  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="login" />
      <section className={styles.authHero}><div className={styles.shell}><AuthCard mode="login" store={store} locale={locale} text={text} /></div></section>
      <Footer store={store} text={text} locale={locale} />
    </main>
  );
}
