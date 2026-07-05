"use client";

import { useMemo, useState } from "react";
import type { TemplatePageProps } from "../../_shared/template-types";
import { safeCategoryList } from "../../_shared/template-helpers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import styles from "../styles.module.css";
import { theme } from "../theme";

function t(locale: string, ar: string, en: string) { return locale === "ar" ? ar : en; }

export function Products(props: TemplatePageProps) {
  const { store, products, categories, locale, text } = props;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const cats = safeCategoryList(products, categories);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((product) => {
      const matchesQuery = !q || `${product.name} ${product.description || ""} ${product.category || ""}`.toLowerCase().includes(q);
      const matchesCategory = !category || product.category === category;
      return matchesQuery && matchesCategory;
    });
    return [...list].sort((a, b) => {
      if (sort === "priceLow") return Number(a.price || 0) - Number(b.price || 0);
      if (sort === "priceHigh") return Number(b.price || 0) - Number(a.price || 0);
      if (sort === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      return 0;
    });
  }, [products, query, category, sort]);

  return (
    <main className={styles.root} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} data-template={theme.key}>
      <Header store={store} locale={locale} text={text} active="products" />
      <section className={styles.pageHero}>
        <div className={styles.shell}>
          <span className={styles.kicker}>{store?.category || theme.name}</span>
          <h1 className={styles.pageTitle}>{text.nav.products}</h1>
          <p className={styles.sectionSubtitle}>{t(locale, "كل المنتجات التي يضيفها التاجر تظهر هنا مع البحث والتصنيف والترتيب.", "All merchant products appear here with search, category filters and sorting.")}</p>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.shell}>
          <div className={styles.filters}>
            <input className={styles.input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(locale, "ابحث عن منتج", "Search products")} />
            <select className={styles.select} value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">{text.pages.allCategories}</option>
              {cats.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select className={styles.select} value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="latest">{t(locale, "الأحدث", "Latest")}</option>
              <option value="priceLow">{t(locale, "السعر الأقل", "Lowest price")}</option>
              <option value="priceHigh">{t(locale, "السعر الأعلى", "Highest price")}</option>
              <option value="name">{t(locale, "الاسم", "Name")}</option>
            </select>
          </div>
          {filtered.length ? <div className={styles.productGrid}>{filtered.map((product) => <ProductCard key={product.id} store={store} product={product} locale={locale} text={text} />)}</div> : <div className={styles.empty}><h3>{text.pages.noProducts}</h3><p>{text.pages.noProductsText}</p></div>}
        </div>
      </section>
      <Footer store={store} text={text} locale={locale} />
    </main>
  );
}
