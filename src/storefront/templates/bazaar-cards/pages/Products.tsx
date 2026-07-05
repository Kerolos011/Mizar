"use client";

import { useMemo, useState } from "react";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import { getLocale, getProductPrice, getProductSettings, labels, t, uniqueCategories } from "../components/helpers";

export function Products(props: any) {
  const products = Array.isArray(props.products) ? props.products : [];
  const locale = getLocale(props);
  const label = labels(locale);
  const productSettings = getProductSettings(props);
  const categories = uniqueCategories(products);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const perPage = Number(productSettings.defaultProductsPerPage || 24);

  const filtered = useMemo(() => {
    let rows = products.filter((product: any) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || [product.name, product.title, product.description, product.sku, product.category].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesCategory = !category || String(product.category || "") === category;
      return matchesSearch && matchesCategory;
    });
    rows = rows.sort((a: any, b: any) => {
      if (sort === "price-low") return getProductPrice(a) - getProductPrice(b);
      if (sort === "price-high") return getProductPrice(b) - getProductPrice(a);
      if (sort === "name") return String(a.name || a.title || "").localeCompare(String(b.name || b.title || ""));
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
    return rows.slice(0, perPage || 24);
  }, [products, search, category, sort, perPage]);

  return (
    <PageShell {...props} active="products">
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div><span className={styles.kicker}>{label.products}</span><h1 className={styles.sectionTitle}>{label.allProducts}</h1><p className={styles.sectionText}>{t(locale, "تصفح المنتجات الفعلية من كتالوج التاجر مع البحث والفلترة.", "Browse real merchant products with search and filters.")}</p></div>
          </div>
          <div className={styles.filtersBar}>
            <input className={styles.input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={label.search} />
            <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">{t(locale, "كل التصنيفات", "All categories")}</option>{categories.map((item) => <option value={item.name} key={item.name}>{item.name}</option>)}</select>
            <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}><option value="latest">{t(locale, "الأحدث", "Latest")}</option><option value="price-low">{t(locale, "الأقل سعرًا", "Lowest price")}</option><option value="price-high">{t(locale, "الأعلى سعرًا", "Highest price")}</option><option value="name">{t(locale, "الاسم", "Name")}</option></select>
          </div>
          <div className={styles.layoutToggle} style={{ maxWidth: 240, marginBottom: 16 }}><button className={layout === "grid" ? styles.activeLayout : ""} type="button" onClick={() => setLayout("grid")}>Grid</button><button className={layout === "list" ? styles.activeLayout : ""} type="button" onClick={() => setLayout("list")}>List</button></div>
          {filtered.length ? <div className={layout === "grid" ? styles.productGrid : styles.listGrid}>{filtered.map((product: any) => <ProductCard key={product.id} product={product} compact={layout === "list"} {...props} />)}</div> : <div className={styles.emptyState}><strong>{t(locale, "لا توجد منتجات مطابقة", "No matching products")}</strong><span>{t(locale, "جرب تغيير البحث أو التصنيف.", "Try changing search or category.")}</span></div>}
        </div>
      </section>
    </PageShell>
  );
}
