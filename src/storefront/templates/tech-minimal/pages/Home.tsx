import Link from "next/link";
import { buildStoreHref, getStoreName } from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import { getActiveHero, safeCategoryList } from "../../_shared/template-helpers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import styles from "../styles.module.css";
import { theme } from "../theme";

export function Home(props: TemplatePageProps) {
  const { store, content, products, featuredProducts, latestProducts, categories, locale, text } = props;
  const hero = getActiveHero(content, store);
  const selected = (featuredProducts.length ? featuredProducts : latestProducts.length ? latestProducts : products).slice(0, 8);
  const cats = safeCategoryList(products, categories).slice(0, 8);
  const title = hero.title || getStoreName(store);
  const words = title.split(" ").filter(Boolean);
  const first = words.slice(0, Math.max(1, words.length - 1)).join(" ");
  const last = words.length > 1 ? words[words.length - 1] : "";

  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="home" />
      <section className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <div className={styles.eyebrow}>{theme.name}</div>
            <h1 className={styles.display}>{first}{last ? <><br /><em>{last}</em></> : null}</h1>
            <p className={styles.lead}>{hero.description}</p>
            <div className={styles.heroActions}>
              <Link href={hero.primaryButtonHref} className={styles.primaryButton}>{hero.primaryButtonText}</Link>
              <Link href={hero.secondaryButtonHref} className={styles.secondaryButton}>{hero.secondaryButtonText}</Link>
            </div>
          </div>
          <div className={styles.heroMedia}>
            {hero.imageUrl ? <img src={hero.imageUrl} alt={getStoreName(store)} /> : <div className={styles.heroPlaceholder}>{text.home.coverHint}</div>}
            <div className={styles.floatingStats}>
              <div className={styles.stat}><strong>{products.length}</strong><span>{text.home.productCount}</span></div>
              <div className={styles.stat}><strong>{cats.length || 1}</strong><span>{text.home.categoryCount}</span></div>
              <div className={styles.stat}><strong>24/7</strong><span>{text.home.support}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.eyebrow}>{text.common.collection}</div>
              <h2 className={styles.sectionTitle}>{text.nav.products}</h2>
              <p className={styles.sectionSubtitle}>{text.pages.productsSubtitle}</p>
            </div>
            <Link href={buildStoreHref(store, "products")} className={styles.secondaryButton}>{text.home.viewAll}</Link>
          </div>
          <div className={styles.categoryGrid}>
            {(cats.length ? cats : [text.pages.allCategories, text.common.selected, text.home.selectedTitle, text.common.collection]).slice(0, 8).map((category, index) => (
              <Link key={`${category}-${index}`} href={buildStoreHref(store, `products?category=${encodeURIComponent(category)}`)} className={styles.categoryCard}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{category}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.alt}`}>
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.eyebrow}>{text.home.lookbookTitle}</div>
              <h2 className={styles.sectionTitle}>{text.home.selectedTitle}</h2>
              <p className={styles.sectionSubtitle}>{text.home.selectedText}</p>
            </div>
          </div>
          {selected.length ? <div className={styles.productGrid}>{selected.map((product) => <ProductCard key={product.id} store={store} product={product} locale={locale} text={text} />)}</div> : <div className={styles.empty}><h3>{text.home.noProductsTitle}</h3><p>{text.home.noProductsText}</p></div>}
        </div>
      </section>

      <Footer store={store} text={text} />
    </main>
  );
}
