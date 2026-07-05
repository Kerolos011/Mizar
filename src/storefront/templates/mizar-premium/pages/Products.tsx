"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import {
  firstText,
  getLocale,
  getProductPrice,
  getProductSettings,
  labels,
  productImage,
  t,
  uniqueCategories,
} from "../components/helpers";

function normalize(value: any) {
  return String(value || "").trim().toLowerCase();
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value || 0);
}

export function Products(props: any) {
  const products = Array.isArray(props.products) ? props.products : [];
  const locale = getLocale(props);
  const label = labels(locale);
  const productSettings = getProductSettings(props);
  const categories = uniqueCategories(products);
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const perPage = Number(productSettings.defaultProductsPerPage || 24);

  useEffect(() => {
    const categoryFromUrl = searchParams?.get("category") || "";
    if (categoryFromUrl) setCategory(categoryFromUrl);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const query = normalize(search);
    const selectedCategory = normalize(category);

    let rows = products.filter((product: any) => {
      const productCategory = firstText(product.category, product.categoryName, product.categoryTitle);
      const matchesSearch =
        !query ||
        [
          product.nameAr,
          product.nameEn,
          product.name,
          product.title,
          product.description,
          product.shortDescription,
          product.sku,
          productCategory,
          product.brand,
          product.brandName,
        ].some((value) => normalize(value).includes(query));

      const matchesCategory = !selectedCategory || normalize(productCategory) === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    rows = rows.sort((a: any, b: any) => {
      if (sort === "price-low") return getProductPrice(a) - getProductPrice(b);
      if (sort === "price-high") return getProductPrice(b) - getProductPrice(a);
      if (sort === "name") return String(firstText(a.nameAr, a.nameEn, a.name, a.title)).localeCompare(String(firstText(b.nameAr, b.nameEn, b.name, b.title)));
      return String(b.createdAt || b.updatedAt || "").localeCompare(String(a.createdAt || a.updatedAt || ""));
    });

    return rows.slice(0, perPage || 24);
  }, [products, search, category, sort, perPage]);

  const heroProducts = filtered.length ? filtered.slice(0, 3) : products.slice(0, 3);

  return (
    <PageShell {...props} active="products">
      <main className={styles.productsPage}>
        <section className={styles.productsHero}>
          <div className={`${styles.container} ${styles.productsHeroInner}`}>
            <div>
              <span className={styles.moodboardOverline}>{t(locale, "مجموعة المتجر", "Store collection")}</span>
              <h1>{label.allProducts}</h1>
              <p>
                {t(
                  locale,
                  "تصفح المنتجات بتجربة هادئة، فلاتر واضحة، ومساحات عرض تشبه واجهات البراندات الراقية.",
                  "Browse products with a calm premium layout, clear filters, and refined ecommerce spacing.",
                )}
              </p>
            </div>

            <div className={styles.productsHeroStack} aria-hidden="true">
              {heroProducts.map((product: any, index: number) => {
                const image = productImage(product);
                return (
                  <span key={`${firstText(product.id, product.slug, product.name, "product")}-${index}`}>
                    {image ? <img src={image} alt="" /> : <b>{String(firstText(product.name, product.title, "P")).slice(0, 1)}</b>}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.productsPanelSection}>
          <div className={styles.container}>
            <div className={styles.productsPanel}>
              <div className={styles.categoryRail}>
                <button
                  type="button"
                  className={!category ? styles.categoryRailActive : ""}
                  onClick={() => setCategory("")}
                >
                  {t(locale, "الكل", "All")}
                </button>
                {categories.map((item: any) => (
                  <button
                    type="button"
                    key={item.name}
                    className={normalize(category) === normalize(item.name) ? styles.categoryRailActive : ""}
                    onClick={() => setCategory(item.name)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              <div className={styles.productsToolbar}>
                <div className={styles.productsSearchBox}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m21 21-4.35-4.35M10.8 18.2a7.4 7.4 0 1 1 0-14.8 7.4 7.4 0 0 1 0 14.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={label.search} />
                </div>

                <select className={styles.luxurySelect} value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="latest">{t(locale, "الأحدث", "Latest")}</option>
                  <option value="price-low">{t(locale, "الأقل سعرًا", "Lowest price")}</option>
                  <option value="price-high">{t(locale, "الأعلى سعرًا", "Highest price")}</option>
                  <option value="name">{t(locale, "الاسم", "Name")}</option>
                </select>

                <div className={styles.productsViewToggle}>
                  <button className={layout === "grid" ? styles.activeLayout : ""} type="button" onClick={() => setLayout("grid")}>
                    {t(locale, "شبكة", "Grid")}
                  </button>
                  <button className={layout === "list" ? styles.activeLayout : ""} type="button" onClick={() => setLayout("list")}>
                    {t(locale, "قائمة", "List")}
                  </button>
                </div>
              </div>

              <div className={styles.productsResultBar}>
                <span>
                  {t(locale, "النتائج", "Results")}: <strong>{formatCount(filtered.length)}</strong>
                </span>
                {category ? <button type="button" onClick={() => setCategory("")}>{t(locale, "مسح التصنيف", "Clear category")}</button> : null}
              </div>

              {filtered.length ? (
                <div className={layout === "grid" ? `${styles.productGrid} ${styles.luxuryProductGrid}` : styles.luxuryListGrid}>
                  {filtered.map((product: any) => (
                    <ProductCard key={firstText(product.id, product.slug)} product={product} compact={layout === "list"} {...props} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <strong>{t(locale, "لا توجد منتجات مطابقة", "No matching products")}</strong>
                  <span>{t(locale, "جرب تغيير البحث أو التصنيف.", "Try changing search or category.")}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
