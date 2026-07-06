import Link from "next/link";
import {
  buildStoreHref,
  getStoreName,
  resolveMediaUrl,
} from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import { getActiveHero, safeCategoryList } from "../../_shared/template-helpers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import styles from "../styles.module.css";
import { theme } from "../theme";

function t(locale: string, ar: string, en: string) {
  return locale === "ar" ? ar : en;
}

export function Home(props: TemplatePageProps) {
  const { store, content, products, featuredProducts, latestProducts, categories, locale, text } = props;
  const hero = getActiveHero(content, store);
  const selected = (featuredProducts.length ? featuredProducts : latestProducts.length ? latestProducts : products).slice(0, 8);
  const cats = safeCategoryList(products, categories).slice(0, 8);
  const name = getStoreName(store);
  const coverUrl = resolveMediaUrl(hero.imageUrl || store?.coverUrl || store?.bannerUrl || "");
  const about = content?.aboutSection as any;
  const highlights = about?.highlights?.length ? about.highlights.slice(0, 4) : [
    t(locale, "منتجات مختارة بعناية", "Carefully selected products"),
    t(locale, "تجربة شراء سهلة", "Easy shopping experience"),
    t(locale, "دعم سريع للعملاء", "Fast customer support"),
    store?.shippingPolicy || t(locale, "شحن منظم وواضح", "Clear and organized shipping"),
  ];

  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="home" />

      <section className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>{store?.category || t(locale, "متجر إلكتروني", "Online store")}</div>
            <h1 className={styles.display}>{hero.title || name}</h1>
            <p className={styles.lead}>{hero.description || store?.description || t(locale, "تسوق منتجاتك المفضلة بسهولة من متجر مصمم لتجربة شراء سريعة وواضحة.", "Shop your favorite products easily from a store designed for a smooth shopping experience.")}</p>
            <div className={styles.heroActions}>
              <Link href={hero.primaryButtonHref || buildStoreHref(store, "products")} className={styles.primaryButton}>{hero.primaryButtonText || (text.common as any).shopNow || text.home.heroPrimary}</Link>
              <Link href={hero.secondaryButtonHref || buildStoreHref(store, "about")} className={styles.secondaryButton}>{hero.secondaryButtonText || text.nav.about}</Link>
            </div>
            <div className={styles.serviceRow}>
              <span>✓ {t(locale, "منتجات متاحة", "Available products")}: {products.length}</span>
              <span>✓ {t(locale, "تصنيفات", "Categories")}: {cats.length || 1}</span>
              <span>✓ {store?.currency || "EGP"}</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroBlob} />
            <div className={styles.heroImageCard}>
              {coverUrl ? <img src={coverUrl} alt={name} /> : <div className={styles.heroPlaceholder}>{t(locale, "أضف صورة غلاف من إعدادات المتجر لتظهر هنا", "Add a cover image from store settings to display here")}</div>}
            </div>
            <div className={styles.freshCard}>
              <strong>{t(locale, "توصيل", "Delivery")}</strong>
              <span>{store?.shippingPolicy || t(locale, "سياسة الشحن تظهر هنا", "Shipping policy appears here")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.categorySection}>
        <div className={styles.shell}>
          <div className={styles.sectionHeadCentered}>
            <span className={styles.kicker}>{t(locale, "تصنيفات المتجر", "Store categories")}</span>
            <h2>{t(locale, "تسوق حسب التصنيف", "Shop by category")}</h2>
          </div>
          <div className={styles.categoryStrip}>
            {(cats.length ? cats : [t(locale, "كل المنتجات", "All products"), t(locale, "منتجات مختارة", "Selected products"), store?.category || t(locale, "المتجر", "Store")]).map((category, index) => (
              <Link key={`${category}-${index}`} href={buildStoreHref(store, `products?category=${encodeURIComponent(category)}`)} className={styles.categoryPillCard}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{category}</strong>
                <small>{t(locale, "عرض المنتجات", "View products")}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>{t(locale, "منتجات مميزة", "Featured products")}</span>
              <h2 className={styles.sectionTitle}>{t(locale, "الأكثر طلبًا في المتجر", "Most wanted in store")}</h2>
              <p className={styles.sectionSubtitle}>{t(locale, "يعرض القالب المنتجات التي يدخلها التاجر من لوحة المنتجات، مع السعر والصورة والتصنيف وحالة المخزون.", "The template displays merchant products with images, prices, categories and stock status.")}</p>
            </div>
            <Link href={buildStoreHref(store, "products")} className={styles.secondaryButton}>{text.home.viewAll}</Link>
          </div>
          {selected.length ? <div className={styles.productGrid}>{selected.map((product) => <ProductCard key={product.id} store={store} product={product} locale={locale} text={text} />)}</div> : <div className={styles.empty}><h3>{text.home.noProductsTitle}</h3><p>{text.home.noProductsText}</p></div>}
        </div>
      </section>

      <section className={styles.infoBand}>
        <div className={`${styles.shell} ${styles.infoGrid}`}>
          <div className={styles.infoCardMain}>
            <span className={styles.kicker}>{about?.subtitle || t(locale, "عن المتجر", "About the store")}</span>
            <h2>{about?.title || t(locale, "قصة المتجر وتجربة الشراء", "Store story and shopping experience")}</h2>
            <p>{about?.description || store?.description || t(locale, "استخدم إعدادات الواجهة لإضافة وصف من نحن، وسيقوم القالب بعرضه هنا بشكل منظم ومتوافق مع الهوية.", "Use storefront settings to add your story, and this template will present it clearly.")}</p>
            <Link href={buildStoreHref(store, "about")} className={styles.primaryButton}>{text.nav.about}</Link>
          </div>
          <div className={styles.benefitsGrid}>
            {highlights.map((item: string) => <div className={styles.benefitItem} key={item}>✓ <span>{item}</span></div>)}
          </div>
        </div>
      </section>

      <Footer store={store} text={text} locale={locale} />
    </main>
  );
}
