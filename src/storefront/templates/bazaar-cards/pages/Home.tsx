"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import {
  firstText,
  getBestSellers,
  getBlogPosts,
  getBrands,
  getContactSettings,
  getCoverImage,
  getDiscountedProducts,
  getFeaturedProducts,
  getHeroSlides,
  getHomepageSettings,
  getInstagramImages,
  getLatestProducts,
  getLocale,
  getNewArrivals,
  getReviews,
  getShippingSettings,
  getStoreDescription,
  getStoreName,
  labels,
  localizedSlide,
  normalizeHref,
  productsUrl,
  t,
  uniqueCategories,
} from "../components/helpers";

function SectionHeader({ title, description, href, action }: any) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description ? <p className={styles.sectionText}>{description}</p> : null}
      </div>
      {href ? (
        <Link href={href} className={styles.secondaryButton}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

function EmptyState({ title, textValue, href, action }: any) {
  return (
    <div className={styles.emptyState}>
      <strong>{title}</strong>
      <span>{textValue}</span>
      {href ? (
        <Link href={href} className={styles.secondaryButton}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

function normalizeKey(value: any) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function resolveCategoryList(products: any[], locale: "ar" | "en", label: any, selectedCategories: any[] = []) {
  const categories = uniqueCategories(products);
  const selected = selectedCategories.map(normalizeKey).filter(Boolean);

  const filteredCategories = selected.length
    ? categories.filter((category: any) => selected.includes(normalizeKey(category.name)) || selected.includes(normalizeKey(category.id)))
    : categories;

  if (filteredCategories.length) return filteredCategories;

  if (products.length) {
    return [
      {
        name: label.allProducts || t(locale, "كل المنتجات", "All products"),
        count: products.length,
        fallback: true,
      },
    ];
  }

  return [];
}

function resolveFeaturedProducts(props: any, products: any[]) {
  const homepage = getHomepageSettings(props);
  const selected = (homepage.featuredProductIds || []).map(normalizeKey).filter(Boolean);

  if (selected.length) {
    const selectedProducts = products.filter((product: any) =>
      selected.includes(normalizeKey(product.id)) ||
      selected.includes(normalizeKey(product.slug)) ||
      selected.includes(normalizeKey(product.sku)),
    );

    if (selectedProducts.length) return selectedProducts;
  }

  const featured = getFeaturedProducts(props);

  return featured.length ? featured : products.slice(0, 8);
}

function resolveBestSellerProducts(props: any, products: any[]) {
  const bestSellers = getBestSellers(props);

  return bestSellers.length ? bestSellers : products.slice(0, 4);
}

function resolveNewArrivalProducts(props: any, products: any[]) {
  const newArrivals = getNewArrivals(props);

  if (newArrivals.length) return newArrivals;

  const latest = getLatestProducts(props);

  return latest.length ? latest : products.slice(0, 4);
}

function localizedValue(row: any, locale: "ar" | "en", arKeys: string[], enKeys: string[], fallback = "") {
  const keys = locale === "ar" ? arKeys : enKeys;
  const alternateKeys = locale === "ar" ? enKeys : arKeys;

  return firstText(
    ...keys.map((key) => row?.[key]),
    ...alternateKeys.map((key) => row?.[key]),
    fallback,
  );
}


function normalizeHeroSlide(store: any, slide: any, index: number) {
  return {
    ...slide,
    id: firstText(slide?.id, `hero-slide-${index + 1}`),
    title: firstText(slide?.titleAr, slide?.title, slide?.heading, store?.tagline, store?.nameAr, store?.name),
    titleEn: firstText(slide?.titleEn, slide?.title, slide?.headingEn, store?.nameEn, store?.name),
    subtitle: firstText(slide?.subtitleAr, slide?.subtitle, slide?.descriptionAr, slide?.description, store?.shortDescription, store?.descriptionAr, store?.description),
    subtitleEn: firstText(slide?.subtitleEn, slide?.subtitle, slide?.descriptionEn, slide?.description, store?.descriptionEn, store?.shortDescription, store?.description),
    imageUrl: firstText(slide?.imageUrl, slide?.image, slide?.url, slide?.fileUrl, slide?.bannerUrl, store?.bannerUrl, store?.coverUrl, store?.logoUrl),
    buttonText: firstText(slide?.buttonText, slide?.primaryButtonText, "تسوق الآن"),
    buttonTextEn: firstText(slide?.buttonTextEn, slide?.primaryButtonTextEn, "Shop now"),
    buttonLink: firstText(slide?.buttonLink, slide?.primaryButtonHref, slide?.href, "/products"),
    secondaryButtonText: firstText(slide?.secondaryButtonText, slide?.secondaryButtonTextAr, "من نحن"),
    secondaryButtonTextEn: firstText(slide?.secondaryButtonTextEn, "About us"),
    secondaryButtonLink: firstText(slide?.secondaryButtonLink, slide?.secondaryButtonHref, "/about"),
    isActive: slide?.isActive !== false && slide?.enabled !== false,
  };
}

function resolveHeroSlidesForHome(store: any, content: any, homepage: any) {
  const fromHomepage = Array.isArray(homepage?.heroBanners)
    ? homepage.heroBanners
    : Array.isArray(homepage?.heroSlides)
      ? homepage.heroSlides
      : [];

  const homepageSlides = fromHomepage
    .filter((slide: any) => slide?.isActive !== false && slide?.enabled !== false)
    .map((slide: any, index: number) => normalizeHeroSlide(store, slide, index));

  if (homepageSlides.length) return homepageSlides;

  return getHeroSlides(store, content)
    .filter((slide: any) => slide?.isActive !== false && slide?.enabled !== false)
    .map((slide: any, index: number) => normalizeHeroSlide(store, slide, index));
}

function brandImage(brand: any) {
  return firstText(brand?.logoUrl, brand?.imageUrl, brand?.logo, brand?.image, brand?.fileUrl);
}

export function Home(props: any) {
  const store = props.store || {};
  const products = Array.isArray(props.products) ? props.products : [];
  const content = props.content || {};
  const locale = getLocale(props);
  const label = labels(locale);
  const name = getStoreName(store, locale);
  const description = getStoreDescription(store, locale);
  const homepage = getHomepageSettings(props);
  const heroSlides = resolveHeroSlidesForHome(store, content, homepage);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const heroRaw = heroSlides[activeHeroIndex] || heroSlides[0] || {};
  const hero = localizedSlide(heroRaw, locale);
  const cover = firstText(heroRaw.imageUrl, heroRaw.url, getCoverImage(store, content));

  useEffect(() => {
    if (!heroSlides.length && activeHeroIndex !== 0) {
      setActiveHeroIndex(0);
      return;
    }

    if (heroSlides.length && activeHeroIndex > heroSlides.length - 1) {
      setActiveHeroIndex(0);
    }
  }, [heroSlides.length, activeHeroIndex]);

  useEffect(() => {
    if (!homepage.enableHeroBanner || heroSlides.length <= 1 || isHeroPaused) return;

    const timer = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [homepage.enableHeroBanner, heroSlides.length, isHeroPaused]);

  function goToHero(index: number) {
    if (!heroSlides.length) return;

    setActiveHeroIndex(((index % heroSlides.length) + heroSlides.length) % heroSlides.length);
  }

  function goToPreviousHero() {
    goToHero(activeHeroIndex - 1);
  }

  function goToNextHero() {
    goToHero(activeHeroIndex + 1);
  }

  const categories = resolveCategoryList(products, locale, label, homepage.featuredCategoryIds || []);
  const featured = resolveFeaturedProducts(props, products);
  const latest = getLatestProducts(props).length ? getLatestProducts(props) : products.slice(0, 8);
  const bestSellers = resolveBestSellerProducts(props, products);
  const newArrivals = resolveNewArrivalProducts(props, products);
  const offers = getDiscountedProducts(props);
  const brands = getBrands(props);
  const reviews = getReviews(props);
  const blogPosts = getBlogPosts(props);
  const instagramImages = getInstagramImages(props);
  const contact = getContactSettings(props);
  const shipping = getShippingSettings(props);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterError, setNewsletterError] = useState("");

  async function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = newsletterEmail.trim().toLowerCase();

    setNewsletterMessage("");
    setNewsletterError("");

    if (!email) {
      setNewsletterError(t(locale, "اكتب البريد الإلكتروني أولًا.", "Please enter your email first."));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterError(t(locale, "البريد الإلكتروني غير صحيح.", "Invalid email address."));
      return;
    }

    try {
      setNewsletterLoading(true);

      const response = await fetch("/api/storefront/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: store.id,
          storeSlug: store.slug,
          email,
          source: "BAZAAR_CARDS_HOME",
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success === false) {
        throw new Error(
          payload?.message ||
            t(locale, "تعذر الاشتراك في النشرة البريدية.", "Could not subscribe to newsletter."),
        );
      }

      setNewsletterEmail("");
      setNewsletterMessage(
        t(locale, "تم الاشتراك في النشرة البريدية بنجاح.", "You have subscribed successfully."),
      );
    } catch (error) {
      setNewsletterError(
        error instanceof Error
          ? error.message
          : t(locale, "تعذر الاشتراك في النشرة البريدية.", "Could not subscribe to newsletter."),
      );
    } finally {
      setNewsletterLoading(false);
    }
  }

  return (
    <PageShell {...props} active="home">
      {homepage.enableHeroBanner ? (
        <section className={styles.hero}>
          <div
            className={`${styles.container} ${styles.heroCarouselShell}`}
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
          >
            <div className={`${styles.heroGrid} ${heroSlides.length > 1 ? styles.heroGridWithSlides : ""}`}>
              <div className={styles.heroCard}>
                <span className={styles.kicker}>
                  {firstText(store.category, t(locale, "متجر موثوق", "Trusted store"))}
                </span>

                {heroSlides.length > 1 ? (
                  <div className={styles.heroMetaRow}>
                    <span className={styles.heroCounter}>
                      {activeHeroIndex + 1} / {heroSlides.length}
                    </span>
                    <span className={styles.heroAutoStatus}>
                      {isHeroPaused
                        ? t(locale, "متوقف مؤقتًا", "Paused")
                        : t(locale, "يتحرك تلقائيًا", "Auto slider")}
                    </span>
                  </div>
                ) : null}

                <h1 className={styles.heading}>{firstText(hero.title, store.tagline, name)}</h1>
                <p className={styles.description}>{firstText(hero.subtitle, description)}</p>

                <div className={styles.heroActions}>
                  <Link href={normalizeHref(store, hero.buttonLink)} className={styles.primaryButton}>
                    {firstText(hero.buttonText, label.shopNow)}
                  </Link>
                  <Link href={normalizeHref(store, hero.secondaryButtonLink)} className={styles.secondaryButton}>
                    {firstText(hero.secondaryButtonText, label.about)}
                  </Link>
                </div>

                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <strong>{products.length}</strong>
                    <span>{label.products}</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>{categories.length}</strong>
                    <span>{label.categories}</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>{firstText(contact.whatsappNumber, contact.mobileNumber) ? "24/7" : "✓"}</strong>
                    <span>{t(locale, "دعم المتجر", "Store support")}</span>
                  </div>
                </div>

                {heroSlides.length > 1 ? (
                  <div className={styles.heroSlideTabs}>
                    {heroSlides.map((slide: any, index: number) => {
                      const slideTitle = localizedSlide(slide, locale).title;

                      return (
                        <button
                          key={firstText(slide.id, index)}
                          type="button"
                          className={index === activeHeroIndex ? styles.activeHeroTab : ""}
                          onClick={() => goToHero(index)}
                        >
                          <b>{String(index + 1).padStart(2, "0")}</b>
                          <span>{firstText(slideTitle, t(locale, "بانر رئيسي", "Hero banner"))}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className={styles.heroMedia}>
                {cover ? (
                  <img src={cover} alt={name} loading="eager" />
                ) : (
                  <div className={styles.heroMediaFallback}>{name}</div>
                )}

                {heroSlides.length > 1 ? (
                  <>
                    <div className={`${styles.heroProgress} ${isHeroPaused ? styles.heroProgressPaused : ""}`}>
                      <i key={`hero-progress-${activeHeroIndex}`} />
                    </div>

                    <div className={styles.heroNavButtons}>
                      <button
                        type="button"
                        onClick={goToPreviousHero}
                        aria-label={t(locale, "السابق", "Previous")}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={goToNextHero}
                        aria-label={t(locale, "التالي", "Next")}
                      >
                        ›
                      </button>
                    </div>

                    <div className={styles.heroThumbs}>
                    {heroSlides.map((slide: any, index: number) => {
                      const image = firstText(slide.imageUrl, slide.url, store.bannerUrl, store.coverUrl, store.logoUrl);

                      return (
                        <button
                          key={firstText(slide.id, image, index)}
                          type="button"
                          className={index === activeHeroIndex ? styles.activeHeroThumb : ""}
                          onClick={() => goToHero(index)}
                          aria-label={`Hero ${index + 1}`}
                        >
                          {image ? <img src={image} alt="" /> : <span>{index + 1}</span>}
                        </button>
                      );
                    })}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {homepage.enableFeaturedCategories ? (
        <section className={styles.section} id="categories">
          <div className={styles.container}>
            <SectionHeader
              title={label.categories}
              description={t(
                locale,
                "التصنيفات تظهر من منتجات المتجر، ولو المنتجات بدون تصنيف يظهر قسم كل المنتجات.",
                "Categories are generated from products; if products have no categories, all products is shown.",
              )}
              href={productsUrl(store)}
              action={label.viewProducts}
            />
            {categories.length ? (
              <div className={styles.categoryGrid}>
                {categories.slice(0, 8).map((category: any) => (
                  <Link
                    key={category.name}
                    href={category.fallback ? productsUrl(store) : `${productsUrl(store)}?category=${encodeURIComponent(category.name)}`}
                    className={styles.categoryCard}
                  >
                    <span className={styles.categoryIcon}>{String(category.name).slice(0, 1).toUpperCase()}</span>
                    <strong>{category.name}</strong>
                    <span>
                      {category.count} {label.products}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title={t(locale, "لا توجد منتجات بعد", "No products yet")}
                textValue={t(
                  locale,
                  "أضف منتجات من لوحة التحكم ليظهر هذا القسم تلقائيًا.",
                  "Add products from the dashboard and this section will appear automatically.",
                )}
                href={productsUrl(store)}
                action={label.viewProducts}
              />
            )}
          </div>
        </section>
      ) : null}

      {homepage.enableOffers && offers.length ? (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.offerCard}>
              <div>
                <h2>{label.offers}</h2>
                <p>{t(locale, "عروض يتم اكتشافها من السعر قبل الخصم داخل المنتجات.", "Offers are detected from product compare-at prices.")}</p>
              </div>
              <Link href={productsUrl(store)} className={styles.primaryButton}>
                {label.shopNow}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {homepage.enableFeaturedProducts ? (
        <section className={styles.sectionSoft} id="products">
          <div className={styles.container}>
            <SectionHeader
              title={label.featured}
              description={t(locale, "منتجات مميزة أو أول منتجات متاحة في المتجر.", "Featured products or first available products.")}
              href={productsUrl(store)}
              action={label.viewProducts}
            />
            {featured.length ? (
              <div className={styles.productGrid}>
                {featured.slice(0, 8).map((product: any) => (
                  <ProductCard key={product.id} product={product} {...props} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t(locale, "لا توجد منتجات بعد", "No products yet")}
                textValue={t(locale, "أضف منتجات من لوحة التاجر لتظهر هنا مباشرة.", "Add products from the merchant dashboard to show them here.")}
              />
            )}
          </div>
        </section>
      ) : null}

      {homepage.enableBestSellers && bestSellers.length ? (
        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHeader
              title={label.bestSeller}
              description={t(
                locale,
                "يعرض المنتجات المحددة كأكثر مبيعًا، أو منتجات من المتجر كبديل عند عدم تحديدها.",
                "Shows best-seller products, or store products as a fallback if none are marked.",
              )}
              href={productsUrl(store)}
              action={label.viewProducts}
            />
            <div className={styles.productGrid}>
              {bestSellers.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} {...props} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {homepage.enableNewArrivals && newArrivals.length ? (
        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHeader
              title={label.latest}
              description={t(locale, "أحدث منتجات تمت إضافتها للمتجر.", "Latest products added to the store.")}
              href={productsUrl(store)}
              action={label.viewProducts}
            />
            <div className={styles.productGrid}>
              {newArrivals.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} {...props} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {homepage.enableServices ? (
        <section className={styles.sectionSoft}>
          <div className={`${styles.container} ${styles.infoGrid}`}>
            {(homepage.services.length
              ? homepage.services
              : [
                  {
                    title: t(locale, "شحن مرن", "Flexible shipping"),
                    description: firstText(
                      shipping.estimatedDeliveryTime,
                      shipping.shippingPolicy,
                      store.shippingPolicy,
                      t(locale, "حسب سياسة المتجر.", "Based on store policy."),
                    ),
                    icon: "↗",
                  },
                  {
                    title: t(locale, "دفع مناسب", "Convenient payment"),
                    description: t(locale, "طرق الدفع تظهر من إعدادات التاجر.", "Payment methods are read from merchant settings."),
                    icon: "✓",
                  },
                  {
                    title: t(locale, "دعم مباشر", "Direct support"),
                    description: firstText(
                      contact.whatsappNumber,
                      contact.businessEmail,
                      t(locale, "بيانات التواصل من الإعدادات.", "Contact data comes from settings."),
                    ),
                    icon: "☎",
                  },
                  {
                    title: t(locale, "منتجات فعلية", "Real products"),
                    description: t(locale, "القالب يقرأ منتجات المتجر مباشرة.", "The template reads store products directly."),
                    icon: "★",
                  },
                ]
            )
              .filter((item: any) => item.enabled !== false && item.isActive !== false)
              .slice(0, 4)
              .map((item: any) => (
                <div className={styles.infoCard} key={firstText(item.id, item.title, item.titleAr)}>
                  <span className={styles.infoIcon}>{firstText(item.icon, "✓")}</span>
                  <strong>{localizedValue(item, locale, ["titleAr", "title"], ["titleEn", "title"], label.services)}</strong>
                  <span>{localizedValue(item, locale, ["descriptionAr", "description"], ["descriptionEn", "description"])}</span>
                </div>
              ))}
          </div>
        </section>
      ) : null}

      {content.aboutSection?.enabled !== false ? (
        <section className={styles.section}>
          <div className={`${styles.container} ${styles.aboutGrid}`}>
            <div className={styles.aboutMedia}>
              {firstText(store.bannerUrl, store.coverUrl, content.aboutSection?.imageUrl) ? (
                <img src={firstText(store.bannerUrl, store.coverUrl, content.aboutSection?.imageUrl)} alt={name} loading="lazy" />
              ) : null}
            </div>
            <div className={styles.aboutContent}>
              <span className={styles.kicker}>{t(locale, "عن المتجر", "About store")}</span>
              <h2 className={styles.sectionTitle}>{firstText(content.aboutSection?.title, name)}</h2>
              <p className={styles.sectionText}>{firstText(content.aboutSection?.description, description)}</p>
              <div className={styles.highlightList}>
                {(content.aboutSection?.highlights || [t(locale, "تجربة سهلة", "Easy experience"), t(locale, "دعم سريع", "Fast support")]).map((item: string) => (
                  <span key={item} className={styles.highlight}>
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {homepage.enableBrands && brands.length ? (
        <section className={styles.sectionSoft} id="brands">
          <div className={styles.container}>
            <SectionHeader
              title={label.brands}
              description={t(
                locale,
                "البراندات تظهر من إعدادات الصفحة الرئيسية أو من بيانات البراندات الخاصة بالمتجر.",
                "Brands are shown from homepage settings or store brand records.",
              )}
            />
            <div className={styles.brandGrid}>
              {brands.slice(0, 12).map((brand: any) => {
                const logo = brandImage(brand);
                const brandName = firstText(brand.nameAr, brand.titleAr, brand.name, brand.title, brand.label);
                const brandHref = firstText(brand.url, brand.websiteUrl, brand.link);
                const CardTag: any = brandHref ? Link : "div";

                return (
                  <CardTag
                    className={styles.brandCard}
                    key={firstText(brand.id, brandName, logo)}
                    href={brandHref ? normalizeHref(store, brandHref) : undefined}
                    target={brandHref && /^https?:/i.test(brandHref) ? "_blank" : undefined}
                  >
                    <span className={styles.brandLogo}>
                      {logo ? <img src={logo} alt={brandName || label.brands} /> : String(brandName || "B").slice(0, 1).toUpperCase()}
                    </span>
                    <strong>{brandName || label.brands}</strong>
                    {brand.description || brand.descriptionAr ? (
                      <small>{localizedValue(brand, locale, ["descriptionAr", "description"], ["descriptionEn", "description"])}</small>
                    ) : null}
                  </CardTag>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {homepage.enableReviews && reviews.length ? (
        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHeader title={label.reviews} />
            <div className={styles.reviewGrid}>
              {reviews.slice(0, 3).map((review: any) => (
                <div className={styles.reviewCard} key={firstText(review.id, review.createdAt)}>
                  <div className={styles.reviewStars}>★★★★★</div>
                  <p>{firstText(review.comment, review.content, review.message)}</p>
                  <strong>{firstText(review.customerName, review.name, t(locale, "عميل المتجر", "Store customer"))}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {homepage.enableBlogPreview && blogPosts.length ? (
        <section className={styles.sectionSoft}>
          <div className={styles.container}>
            <SectionHeader title={label.blog} />
            <div className={styles.infoGrid}>
              {blogPosts.slice(0, 3).map((post: any) => (
                <Link className={styles.infoCard} href={normalizeHref(store, post.slug ? `/blog/${post.slug}` : "/blog")} key={firstText(post.id, post.slug, post.title)}>
                  <span className={styles.infoIcon}>✦</span>
                  <strong>{localizedValue(post, locale, ["titleAr", "title"], ["titleEn", "title"], label.blog)}</strong>
                  <span>{localizedValue(post, locale, ["excerptAr", "excerpt", "description"], ["excerptEn", "excerpt", "description"])}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {homepage.enableInstagramGallery && instagramImages.length ? (
        <section className={styles.sectionSoft}>
          <div className={styles.container}>
            <SectionHeader title={label.instagram} />
            <div className={styles.productGrid}>
              {instagramImages.slice(0, 8).map((img: any, idx: number) => {
                const image = firstText(img.url, img.imageUrl, img.fileUrl, img);
                return image ? (
                  <div className={styles.aboutMedia} key={`${image}-${idx}`}>
                    <img src={image} alt="Instagram" />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </section>
      ) : null}

      {homepage.enableNewsletter ? (
        <section className={styles.section}>
          <div className={`${styles.container} ${styles.offerCard}`}>
            <div>
              <h2>{label.newsletterTitle}</h2>
              <p>{label.newsletterText}</p>
            </div>
            <form className={styles.headerSearch} onSubmit={submitNewsletter}>
              <input
                type="email"
                value={newsletterEmail}
                placeholder={t(locale, "البريد الإلكتروني", "Email address")}
                onChange={(event) => {
                  setNewsletterEmail(event.target.value);
                  setNewsletterMessage("");
                  setNewsletterError("");
                }}
              />
              <button type="submit" disabled={newsletterLoading}>
                {newsletterLoading ? "..." : "✓"}
              </button>
              {newsletterMessage ? (
                <small style={{ display: "block", width: "100%", marginTop: 8 }}>
                  {newsletterMessage}
                </small>
              ) : null}
              {newsletterError ? (
                <small style={{ display: "block", width: "100%", marginTop: 8 }}>
                  {newsletterError}
                </small>
              ) : null}
            </form>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
