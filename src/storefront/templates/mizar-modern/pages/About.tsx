import type { TemplatePageProps } from "../../_shared/template-types";
import { getActiveHero } from "../../_shared/template-helpers";
import { getStoreName, resolveMediaUrl } from "@/storefront/StorefrontPagesShared";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "../styles.module.css";
import { theme } from "../theme";

function t(locale: string, ar: string, en: string) { return locale === "ar" ? ar : en; }

export function About(props: TemplatePageProps) {
  const { store, content, products, categories, locale, text } = props;
  const hero = getActiveHero(content, store);
  const about = content?.aboutSection;
  const imageUrl = resolveMediaUrl(about?.imageUrl || hero.imageUrl || store?.coverUrl || "");
  const highlights = about?.highlights?.length ? about.highlights : [
    t(locale, "منتجات يتم اختيارها بعناية", "Carefully selected products"),
    t(locale, "سياسة شحن واضحة", "Clear shipping policy"),
    t(locale, "دعم سريع ومنظم", "Fast and organized support"),
    t(locale, "تجربة شراء مناسبة للموبايل", "Mobile-first shopping experience"),
  ];
  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="about" />
      <section className={styles.pageHero}><div className={styles.shell}><span className={styles.kicker}>{about?.subtitle || theme.name}</span><h1 className={styles.pageTitle}>{about?.title || text.pages.aboutTitle}</h1><p className={styles.sectionSubtitle}>{about?.description || store?.description || text.pages.aboutFallback}</p></div></section>
      <section className={styles.section}>
        <div className={`${styles.shell} ${styles.storyGrid}`}>
          <div className={styles.storyImage}>{imageUrl ? <img src={imageUrl} alt={about?.title || getStoreName(store)} /> : <div className={styles.heroPlaceholder}>{text.home.coverHint}</div>}</div>
          <div className={styles.storyCard}>
            <span className={styles.kicker}>{getStoreName(store)}</span>
            <h2 className={styles.sectionTitle}>{t(locale, "متجر مصمم لتجربة شراء واضحة", "A store designed for clear shopping")}</h2>
            <p className={styles.sectionSubtitle}>{about?.description || store?.description || text.pages.aboutFallback}</p>
            <div className={styles.metricsRow}>
              <div><strong>{products.length}</strong><span>{text.home.productCount}</span></div>
              <div><strong>{categories.length || 1}</strong><span>{text.home.categoryCount}</span></div>
            </div>
            <div className={styles.highlightList}>{highlights.map((item) => <div className={styles.highlight} key={item}>✓ {item}</div>)}</div>
          </div>
        </div>
      </section>
      <Footer store={store} text={text} locale={locale} />
    </main>
  );
}
