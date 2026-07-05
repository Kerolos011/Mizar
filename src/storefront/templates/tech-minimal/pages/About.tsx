import type { TemplatePageProps } from "../../_shared/template-types";
import { getActiveHero } from "../../_shared/template-helpers";
import { resolveMediaUrl } from "@/storefront/StorefrontPagesShared";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "../styles.module.css";
import { theme } from "../theme";

export function About(props: TemplatePageProps) {
  const { store, content, products, categories, locale, text } = props;
  const hero = getActiveHero(content, store);
  const about = content?.aboutSection;
  const imageUrl = resolveMediaUrl(about?.imageUrl || hero.imageUrl || store?.coverUrl || "");
  const highlights = [text.home.steps[0], text.home.steps[1], text.home.steps[2], text.home.steps[3]];
  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="about" />
      <section className={styles.pageHero}><div className={styles.shell}><div className={styles.eyebrow}>{about?.subtitle || theme.name}</div><h1 className={styles.pageTitle}>{about?.title || text.pages.aboutTitle}</h1><p className={styles.sectionSubtitle}>{text.pages.aboutSubtitle}</p></div></section>
      <section className={styles.section}>
        <div className={`${styles.shell} ${styles.storyGrid}`}>
          <div className={styles.storyCard}>
            <h2 className={styles.sectionTitle}>{text.home.storyTitle}</h2>
            <p className={styles.sectionSubtitle}>{about?.description || store?.description || text.pages.aboutFallback}</p>
            <div className={styles.highlightList}>{highlights.map((item) => <div className={styles.highlight} key={item}>{item} — {text.home.stepText}</div>)}</div>
          </div>
          <div className={styles.storyImage}>{imageUrl ? <img src={imageUrl} alt={about?.title || text.pages.aboutTitle} /> : <div className={styles.heroPlaceholder}>{text.home.coverHint}</div>}</div>
        </div>
      </section>
      <Footer store={store} text={text} />
    </main>
  );
}
