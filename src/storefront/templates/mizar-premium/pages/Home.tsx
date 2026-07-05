"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
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

type Locale = "ar" | "en";

function SectionHeader({ title, description, href, action, eyebrow }: any) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        {eyebrow ? <span className={styles.kicker}>{eyebrow}</span> : null}
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

function ProductStrip({ eyebrow, title, description, products, props, store, action, soft = false, emptyTitle, emptyText }: any) {
  return (
    <section className={soft ? styles.moodboardSectionSoft : styles.moodboardSection}>
      <div className={styles.container}>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          href={productsUrl(store)}
          action={action}
        />

        {products.length ? (
          <div className={`${styles.productGrid} ${styles.moodboardFeaturedProducts} ${styles.moodboardProductGridWide}`}>
            {products.slice(0, 8).map((product: any) => (
              <ProductCard key={firstText(product.id, product.slug, product.name)} product={product} {...props} />
            ))}
          </div>
        ) : (
          <EmptyState title={emptyTitle} textValue={emptyText} />
        )}
      </div>
    </section>
  );
}

function ReviewCard({ review, locale }: any) {
  const name = firstText(review?.customerName, review?.authorName, review?.name, t(locale, "عميل موثوق", "Verified customer"));
  const content = firstText(review?.comment, review?.content, review?.text, t(locale, "تجربة شراء ممتازة وخدمة راقية.", "Excellent shopping experience and refined service."));
  const rating = Number(firstText(review?.rating, review?.stars, 5)) || 5;

  return (
    <article className={styles.reviewCard}>
      <div className={styles.reviewStars} aria-label={`${rating}/5`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index}>{index < Math.round(rating) ? "★" : "☆"}</span>
        ))}
      </div>
      <p>{content}</p>
      <footer>
        <strong>{name}</strong>
        <small>{firstText(review?.product?.name, review?.productName, t(locale, "مراجعة متجر", "Store review"))}</small>
      </footer>
    </article>
  );
}

function normalizeKey(value: any) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function productImage(product: any) {
  return firstText(
    product?.imageUrl,
    product?.mainImageUrl,
    product?.thumbnailUrl,
    product?.coverUrl,
    product?.image,
    product?.images?.[0]?.url,
    product?.images?.[0]?.imageUrl,
    product?.images?.[0],
  );
}

function productName(product: any, locale: Locale, fallback = "") {
  return firstText(
    locale === "ar" ? product?.nameAr : product?.nameEn,
    product?.name,
    product?.title,
    product?.productName,
    fallback,
  );
}

function localizedValue(row: any, locale: Locale, arKeys: string[], enKeys: string[], fallback = "") {
  const keys = locale === "ar" ? arKeys : enKeys;
  const alternateKeys = locale === "ar" ? enKeys : arKeys;

  return firstText(
    ...keys.map((key) => row?.[key]),
    ...alternateKeys.map((key) => row?.[key]),
    fallback,
  );
}

function resolveCategoryList(products: any[], selectedCategories: any[] = []) {
  const categories = uniqueCategories(products);
  const selected = selectedCategories.map(normalizeKey).filter(Boolean);

  const filteredCategories = selected.length
    ? categories.filter((category: any) =>
        selected.includes(normalizeKey(category.name)) || selected.includes(normalizeKey(category.id)),
      )
    : categories;

  return filteredCategories.map((category: any) => {
    const match = products.find((product: any) =>
      normalizeKey(firstText(product?.category, product?.categoryName, product?.categoryTitle)) === normalizeKey(category.name),
    );

    return {
      ...category,
      image: productImage(match),
    };
  });
}

function normalizeHeroSlide(store: any, slide: any, index: number) {
  return {
    ...slide,
    id: firstText(slide?.id, `hero-slide-${index + 1}`),
    title: firstText(slide?.titleAr, slide?.title, slide?.heading, store?.tagline, store?.nameAr, store?.name),
    titleEn: firstText(slide?.titleEn, slide?.title, slide?.headingEn, store?.nameEn, store?.name),
    subtitle: firstText(
      slide?.subtitleAr,
      slide?.subtitle,
      slide?.descriptionAr,
      slide?.description,
      store?.shortDescription,
      store?.descriptionAr,
      store?.description,
    ),
    subtitleEn: firstText(
      slide?.subtitleEn,
      slide?.subtitle,
      slide?.descriptionEn,
      slide?.description,
      store?.descriptionEn,
      store?.shortDescription,
      store?.description,
    ),
    imageUrl: firstText(
      slide?.imageUrl,
      slide?.image,
      slide?.url,
      slide?.fileUrl,
      slide?.bannerUrl,
      store?.bannerUrl,
      store?.coverUrl,
      store?.logoUrl,
    ),
    buttonText: firstText(slide?.buttonText, slide?.primaryButtonText, "تسوق الآن"),
    buttonTextEn: firstText(slide?.buttonTextEn, slide?.primaryButtonTextEn, "Shop now"),
    buttonLink: firstText(slide?.buttonLink, slide?.primaryButtonHref, slide?.href, "/products"),
    secondaryButtonText: firstText(slide?.secondaryButtonText, slide?.secondaryButtonTextAr, "استكشف المنتجات"),
    secondaryButtonTextEn: firstText(slide?.secondaryButtonTextEn, "Explore products"),
    secondaryButtonLink: firstText(slide?.secondaryButtonLink, slide?.secondaryButtonHref, "/products"),
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

function brandImage(brand: any) {
  return firstText(brand?.logoUrl, brand?.imageUrl, brand?.logo, brand?.image, brand?.fileUrl);
}

function postImage(post: any) {
  return firstText(post?.imageUrl, post?.coverUrl, post?.thumbnailUrl, post?.image, post?.fileUrl);
}

export function Home(props: any) {
  const store = props.store || {};
  const products = Array.isArray(props.products) ? props.products : [];
  const content = props.content || {};
  const locale = getLocale(props) as Locale;
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
  const selectedCategories = Array.isArray(homepage.featuredCategoryIds)
    ? homepage.featuredCategoryIds
    : Array.isArray(homepage.featuredCategories)
      ? homepage.featuredCategories
      : [];
  const homepageServices = Array.isArray(homepage.services) ? homepage.services : [];

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
    }, 4800);

    return () => window.clearInterval(timer);
  }, [homepage.enableHeroBanner, heroSlides.length, isHeroPaused]);

  function goToHero(index: number) {
    if (!heroSlides.length) return;

    setActiveHeroIndex(((index % heroSlides.length) + heroSlides.length) % heroSlides.length);
  }

  const categories = useMemo(() => resolveCategoryList(products, selectedCategories), [products, selectedCategories]);
  const featured = resolveFeaturedProducts(props, products);
  const offerProducts = getDiscountedProducts(props);
  const bestSellerProducts = resolveBestSellerProducts(props, products);
  const newArrivalProducts = resolveNewArrivalProducts(props, products);
  const reviews = getReviews(props);
  const brands = getBrands(props);
  const blogPosts = getBlogPosts(props);
  const instagramImages = getInstagramImages(props);
  const contact = getContactSettings(props);
  const shipping = getShippingSettings(props);
  const photographyTiles = [
    ...instagramImages.map((item: any) => firstText(item?.url, item?.imageUrl, item?.fileUrl, item)),
    ...featured.map((product: any) => productImage(product)),
    store.bannerUrl,
    store.coverUrl,
  ]
    .map((image) => firstText(image))
    .filter(Boolean)
    .slice(0, 8);
  const personalityWords = [
    t(locale, "أنيق", "Elegant"),
    t(locale, "هادئ", "Calm"),
    t(locale, "موثوق", "Trustworthy"),
    t(locale, "فاخر", "Premium"),
    t(locale, "عصري", "Modern"),
    t(locale, "بسيط", "Minimal"),
    t(locale, "راقٍ", "Refined"),
  ];

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
          source: "MIZAR_PREMIUM_HOME",
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success === false) {
        throw new Error(
          payload?.message || t(locale, "تعذر الاشتراك في النشرة البريدية.", "Could not subscribe to newsletter."),
        );
      }

      setNewsletterEmail("");
      setNewsletterMessage(t(locale, "تم الاشتراك في النشرة البريدية بنجاح.", "You have subscribed successfully."));
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
      <main className={styles.moodboardHome}>
        {homepage.enableHeroBanner ? (
          <section
            className={styles.moodboardHeroSection}
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
          >
            <div className={styles.fullBleedHero}>
              <div className={styles.fullBleedHeroMedia}>
                {cover ? <img src={cover} alt={name} loading="eager" /> : <div className={styles.heroMediaFallback}>{name}</div>}
              </div>
              <div className={styles.fullBleedHeroScrim} />

              <div className={`${styles.container} ${styles.fullBleedHeroInner}`}>
                <div className={styles.fullBleedHeroContent}>
                  <span className={styles.moodboardOverline}>{t(locale, "مجموعة جديدة", "New collection")}</span>
                  <h1>{firstText(hero.title, store.tagline, name)}</h1>
                  <p>{firstText(hero.subtitle, description)}</p>

                  <div className={styles.moodboardHeroActions}>
                    <Link href={normalizeHref(store, hero.buttonLink)} className={`${styles.moodboardButton} ${styles.moodboardButtonPrimary}`}>
                      <span>{firstText(hero.buttonText, label.shopNow)}</span>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    <Link href={productsUrl(store)} className={`${styles.moodboardButton} ${styles.moodboardButtonGhost}`}>
                      {t(locale, "اكتشف المزيد", "Explore more")}
                    </Link>
                  </div>

                  {heroSlides.length > 1 ? (
                    <div className={styles.moodboardHeroPager}>
                      {heroSlides.map((slide: any, index: number) => (
                        <button
                          key={`${firstText(slide.id, slide.imageUrl, "hero")}-${index}`}
                          type="button"
                          className={index === activeHeroIndex ? styles.moodboardHeroPagerActive : ""}
                          onClick={() => goToHero(index)}
                        >
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <i />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <aside className={styles.fullBleedHeroHighlights} aria-label={t(locale, "مختاراتنا الفاخرة", "Luxury highlights")}>
                  <div className={styles.heroHighlightsHeader}>
                    <span />
                    <strong>{t(locale, "مختاراتنا الفاخرة", "Luxury highlights")}</strong>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 3.5 14.15 9.85 20.5 12l-6.35 2.15L12 20.5l-2.15-6.35L3.5 12l6.35-2.15L12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <p className={styles.heroHighlightsLead}>
                    {t(
                      locale,
                      "قطع مختارة بعناية لتمنحك إطلالة راقية وجودة تدوم.",
                      "Curated pieces selected for refined style and lasting quality.",
                    )}
                  </p>

                  <div className={styles.heroHighlightsBody}>
                    <div className={styles.heroHighlightsList}>
                      {[
                        {
                          icon: "crown",
                          title: t(locale, "تصاميم حصرية", "Exclusive designs"),
                          text: t(locale, "قطع محدودة بتفاصيل عصرية وجودة استثنائية.", "Limited pieces with modern details and exceptional quality."),
                        },
                        {
                          icon: "leaf",
                          title: t(locale, "خامات فاخرة", "Premium materials"),
                          text: t(locale, "أجود الخامات لأعلى درجات الراحة والأناقة.", "Fine materials for elevated comfort and elegance."),
                        },
                        {
                          icon: "gift",
                          title: t(locale, "تجربة راقية", "Refined experience"),
                          text: t(locale, "تغليف فاخر وخدمة عملاء تليق بك.", "Elegant packaging and customer care made for you."),
                        },
                      ].map((item) => (
                        <div className={styles.heroHighlightItem} key={item.title}>
                          <span className={styles.heroHighlightIcon} aria-hidden="true">
                            {item.icon === "crown" ? (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="m4 8 4.5 4L12 5l3.5 7L20 8l-1.5 10h-13L4 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : item.icon === "leaf" ? (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M5 19c8.5.5 13.5-4.5 14-14-9.5.5-14.5 5.5-14 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 19 15 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M4.5 10h15v10h-15V10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                                <path d="M4 7h16v3H4V7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                                <path d="M12 7v13M12 7c-2.7 0-4.3-1-4.3-2.3C7.7 3.8 8.5 3 9.5 3c1.4 0 2.5 1.5 2.5 4Zm0 0c2.7 0 4.3-1 4.3-2.3 0-.9-.8-1.7-1.8-1.7-1.4 0-2.5 1.5-2.5 4Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span>
                            <strong>{item.title}</strong>
                            <small>{item.text}</small>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.heroHighlightVisual}>
                      {cover ? <img src={cover} alt={name} /> : <div className={styles.heroMediaFallback}>{name}</div>}
                      <em>{t(locale, "تشكيلة ربيع 2024", "Spring edit 2024")}</em>
                    </div>
                  </div>

                  <div className={styles.heroHighlightStats}>
                    <span>
                      <strong>+10K</strong>
                      <small>{t(locale, "عميلة راضية", "Happy customers")}</small>
                    </span>
                    <span>
                      <strong>4.9</strong>
                      <small>{t(locale, "تقييم المتجر", "Store rating")}</small>
                    </span>
                  </div>
                </aside>
              </div>

              {heroSlides.length > 1 ? (
                <div className={`${styles.fullBleedHeroProgress} ${isHeroPaused ? styles.heroProgressPaused : ""}`}>
                  <i key={`full-bleed-hero-progress-${activeHeroIndex}`} />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {homepage.enableFeaturedCategories ? (
          <section className={styles.moodboardSection} id="categories">
            <div className={styles.container}>
              <SectionHeader
                eyebrow={t(locale, "بطاقات التصنيفات", "Category cards")}
                title={label.categories}
                description={t(locale, "مداخل سريعة وواضحة لأهم أقسام المتجر بتصميم بصري فاخر.", "Fast visual entrances into the store's key categories.")}
                href={productsUrl(store)}
                action={label.viewProducts}
              />
              {categories.length ? (
                <div className={styles.moodboardCategoryGridWide}>
                  {categories.slice(0, 4).map((category: any, index: number) => (
                    <Link
                      key={`${category.name}-${index}`}
                      href={category.fallback ? productsUrl(store) : `${productsUrl(store)}?category=${encodeURIComponent(category.name)}`}
                      className={styles.moodboardCategoryCard}
                    >
                      <span>
                        {category.image ? <img src={category.image} alt={category.name} /> : <b>{String(category.name).slice(0, 1).toUpperCase()}</b>}
                      </span>
                      <strong>{category.name}</strong>
                      <small>{t(locale, "تسوق الآن", "Shop now")} ←</small>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t(locale, "لا توجد تصنيفات بعد", "No categories yet")}
                  textValue={t(locale, "أضف منتجات بتصنيفات ليظهر هذا القسم تلقائيًا.", "Add products with categories and this section will appear automatically.")}
                />
              )}
            </div>
          </section>
        ) : null}


        {homepage.enableFeaturedProducts ? (
          <section className={styles.moodboardSectionSoft} id="products">
            <div className={styles.container}>
              <SectionHeader
                eyebrow={t(locale, "مختارات راقية", "Curated selection")}
                title={label.featured}
                description={t(locale, "شبكة منتجات واسعة بأحجام ومسافات هادئة مثل واجهات البراندات الفاخرة.", "A spacious product grid with calm rhythm and premium spacing.")}
                href={productsUrl(store)}
                action={label.viewProducts}
              />
              {featured.length ? (
                <div className={`${styles.productGrid} ${styles.moodboardFeaturedProducts} ${styles.moodboardProductGridWide}`}>
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

        {homepage.enableOffers ? (
          <ProductStrip
            soft
            eyebrow={t(locale, "العروض", "Offers")}
            title={t(locale, "عروض مختارة", "Selected offers")}
            description={t(locale, "منتجات عليها خصومات واضحة لرفع التحويلات بدون ازدحام بصري.", "Discounted products presented clearly without visual clutter.")}
            products={offerProducts}
            props={props}
            store={store}
            action={label.viewProducts}
            emptyTitle={t(locale, "لا توجد عروض حاليًا", "No offers right now")}
            emptyText={t(locale, "أضف سعرًا قديمًا أو خصمًا على المنتجات لعرضها هنا.", "Add compare-at prices or discounts to show products here.")}
          />
        ) : null}

        {homepage.enableBestSellers ? (
          <ProductStrip
            eyebrow={t(locale, "الأكثر مبيعًا", "Best sellers")}
            title={t(locale, "الأكثر مبيعًا", "Best sellers")}
            description={t(locale, "منتجات يثق بها العملاء وتستحق الظهور في واجهة المتجر.", "Trusted products that deserve a prime storefront position.")}
            products={bestSellerProducts}
            props={props}
            store={store}
            action={label.viewProducts}
            emptyTitle={t(locale, "لا توجد منتجات أكثر مبيعًا بعد", "No best sellers yet")}
            emptyText={t(locale, "حدد المنتجات الأكثر مبيعًا من إدارة المنتجات أو سيتم استخدام أفضل المنتجات المتاحة.", "Mark best sellers from products management or the template will use available products.")}
          />
        ) : null}

        {homepage.enableNewArrivals ? (
          <ProductStrip
            soft
            eyebrow={t(locale, "وصل حديثًا", "New arrivals")}
            title={t(locale, "وصل حديثًا", "New arrivals")}
            description={t(locale, "أحدث المنتجات في المتجر بترتيب واضح وسريع الشراء.", "The newest products in a clean, purchase-ready layout.")}
            products={newArrivalProducts}
            props={props}
            store={store}
            action={label.viewProducts}
            emptyTitle={t(locale, "لا توجد منتجات حديثة", "No new arrivals")}
            emptyText={t(locale, "أضف منتجات جديدة لتظهر هنا تلقائيًا.", "Add new products to show them here automatically.")}
          />
        ) : null}

        {homepage.enableReviews ? (
          <section className={styles.moodboardSection} id="reviews">
            <div className={styles.container}>
              <SectionHeader
                eyebrow={t(locale, "آراء العملاء", "Customer reviews")}
                title={t(locale, "ما يقوله العملاء", "What customers say")}
                description={t(locale, "مراجعات مختارة تعزز الثقة قبل قرار الشراء.", "Selected reviews that build trust before purchase.")}
              />
              {reviews.length ? (
                <div className={styles.reviewGrid}>
                  {reviews.slice(0, 3).map((review: any, index: number) => (
                    <ReviewCard key={firstText(review.id, index)} review={review} locale={locale} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t(locale, "لا توجد مراجعات بعد", "No reviews yet")}
                  textValue={t(locale, "بعد موافقة التاجر على مراجعات العملاء ستظهر هنا تلقائيًا.", "Approved customer reviews will appear here automatically.")}
                />
              )}
            </div>
          </section>
        ) : null}

        {homepage.enableInstagramGallery ? (
          <section className={styles.moodboardSectionSoft} id="instagram-gallery">
            <div className={styles.container}>
              <SectionHeader
                eyebrow={t(locale, "Instagram Gallery", "Instagram Gallery")}
                title={t(locale, "لقطات من العلامة", "Brand moments")}
                description={t(locale, "صور قصيرة لأسلوب المنتج، التفاصيل، والتجربة البصرية للمتجر.", "Short visual moments for products, details, and brand lifestyle.")}
              />
              {instagramImages.length ? (
                <div className={styles.instagramShowcaseGrid}>
                  {instagramImages.slice(0, 8).map((item: any, index: number) => {
                    const image = firstText(item?.imageUrl, item?.url, item?.fileUrl, item);
                    const href = firstText(item?.url, image);
                    const CardTag: any = href && /^https?:/i.test(href) ? "a" : "span";

                    return (
                      <CardTag
                        key={`${image}-${index}`}
                        className={styles.instagramShowcaseCard}
                        href={CardTag === "a" ? href : undefined}
                        target={CardTag === "a" ? "_blank" : undefined}
                        rel={CardTag === "a" ? "noreferrer" : undefined}
                      >
                        {image ? <img src={image} alt={firstText(item?.alt, "Instagram")} /> : <b>IG</b>}
                      </CardTag>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={t(locale, "لا توجد صور إنستجرام", "No Instagram images")}
                  textValue={t(locale, "أضف صورًا من إعدادات الرئيسية لعرض هذا القسم.", "Add images from homepage settings to show this section.")}
                />
              )}
            </div>
          </section>
        ) : null}

        {homepage.enableServices ? (
          <section className={styles.moodboardSection}>
            <div className={`${styles.container} ${styles.moodboardPromiseGrid}`}>
              {(homepageServices.length
                ? homepageServices
                : [
                    {
                      title: t(locale, "جودة بلا تنازلات", "Uncompromising quality"),
                      description: t(locale, "نختار تفاصيل وتجربة تسوق تعكس ثقة المتجر.", "Details and shopping experience designed to build trust."),
                      icon: "◇",
                    },
                    {
                      title: t(locale, "تصميم خالد", "Timeless design"),
                      description: t(locale, "عرض هادئ ومنظم يناسب المنتجات الراقية.", "A calm and organized presentation for premium products."),
                      icon: "▢",
                    },
                    {
                      title: t(locale, "تجربة مميزة", "Premium experience"),
                      description: t(locale, "تصفح واضح وحركات بسيطة بدون إزعاج.", "Clear browsing and subtle motion without noise."),
                      icon: "✦",
                    },
                    {
                      title: t(locale, "مسؤولية واهتمام", "Care and responsibility"),
                      description: firstText(contact.whatsappNumber, contact.businessEmail, t(locale, "تواصل واضح ودعم سريع.", "Clear contact and fast support.")),
                      icon: "⌁",
                    },
                  ]
              )
                .filter((item: any) => item.enabled !== false && item.isActive !== false)
                .slice(0, 4)
                .map((item: any, index: number) => (
                  <div className={styles.moodboardPromiseCard} key={`${firstText(item.id, item.title, item.titleAr, "service")}-${index}`}>
                    <span>{firstText(item.icon, "✦")}</span>
                    <strong>{localizedValue(item, locale, ["titleAr", "title"], ["titleEn", "title"], label.services)}</strong>
                    <small>{localizedValue(item, locale, ["descriptionAr", "description"], ["descriptionEn", "description"])}</small>
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        {(photographyTiles.length || homepage.enableBrands || homepage.enableBlogPreview) ? (
          <section className={styles.moodboardSectionSoft}>
            <div className={`${styles.container} ${styles.moodboardEditorialGrid}`}>
              <div>
                <SectionHeader
                  eyebrow={t(locale, "أسلوب التصوير", "Photography style")}
                  title={t(locale, "تفاصيل هادئة وصور تشبه المجلات", "Quiet details with editorial photography")}
                  description={t(locale, "استخدم صور منتجات، خامات، وتفاصيل قريبة لبناء إحساس فاخر.", "Use product, texture, and detail shots to build a premium feeling.")}
                />
                {photographyTiles.length ? (
                  <div className={styles.moodboardPhotoMosaic}>
                    {photographyTiles.map((image, index) => (
                      <span key={`${image}-${index}`}>
                        <img src={image} alt="" />
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <aside className={styles.moodboardPersonalityPanel}>
                <span className={styles.moodboardPanelTitle}>{t(locale, "شخصية العلامة", "Brand personality")}</span>
                <div className={styles.moodboardWords}>
                  {personalityWords.map((word) => (
                    <strong key={word}>{word}</strong>
                  ))}
                </div>
                <div className={styles.moodboardPersonalityNotes}>
                  <span>◇ {t(locale, "جودة بلا تنازلات", "Uncompromising quality")}</span>
                  <span>▢ {t(locale, "تصميم خالد", "Timeless design")}</span>
                  <span>✦ {t(locale, "تجربة تسوق سلسة", "Smooth shopping experience")}</span>
                  <span>⌁ {t(locale, "مسافات هادئة وتفاصيل دقيقة", "Calm spacing and precise details")}</span>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {homepage.enableBrands && brands.length ? (
          <section className={styles.moodboardSection} id="brands">
            <div className={styles.container}>
              <SectionHeader
                eyebrow={t(locale, "لوحة البراندات", "Brand strip")}
                title={label.brands}
                description={t(locale, "عرض بسيط يضيف ثقة وهدوء بصري بدون ازدحام.", "A simple trust-building strip without visual clutter.")}
              />
              <div className={styles.brandGrid}>
                {brands.slice(0, 12).map((brand: any, index: number) => {
                  const logo = brandImage(brand);
                  const brandName = firstText(brand.nameAr, brand.titleAr, brand.name, brand.title, brand.label);
                  const brandHref = firstText(brand.url, brand.websiteUrl, brand.link);
                  const CardTag: any = brandHref ? Link : "div";

                  return (
                    <CardTag
                      className={styles.brandCard}
                      key={`${firstText(brand.id, brandName, logo, "brand")}-${index}`}
                      href={brandHref ? normalizeHref(store, brandHref) : undefined}
                      target={brandHref && /^https?:/i.test(brandHref) ? "_blank" : undefined}
                    >
                      <span className={styles.brandLogo}>
                        {logo ? <img src={logo} alt={brandName || label.brands} /> : String(brandName || "B").slice(0, 1).toUpperCase()}
                      </span>
                      <strong>{brandName || label.brands}</strong>
                    </CardTag>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {homepage.enableBlogPreview && blogPosts.length ? (
          <section className={styles.moodboardSectionSoft}>
            <div className={styles.container}>
              <SectionHeader eyebrow={t(locale, "مجلة المتجر", "Store journal")} title={label.blog} href={`${normalizeHref(store, "/blog")}`} action={t(locale, "كل المقالات", "All posts")} />
              <div className={styles.journalGrid}>
                {blogPosts.slice(0, 3).map((post: any, index: number) => {
                  const image = postImage(post);
                  const title = localizedValue(post, locale, ["titleAr", "title"], ["titleEn", "title"], label.blog);

                  return (
                    <Link
                      className={styles.journalCard}
                      href={normalizeHref(store, post.slug ? `/blog/${post.slug}` : "/blog")}
                      key={`${firstText(post.id, post.slug, title, "post")}-${index}`}
                    >
                      <span className={styles.journalImage}>{image ? <img src={image} alt={title} /> : <b>✦</b>}</span>
                      <span className={styles.journalContent}>
                        <small>{t(locale, "قراءة قصيرة", "Short read")}</small>
                        <strong>{title}</strong>
                        <em>{localizedValue(post, locale, ["excerptAr", "excerpt", "description"], ["excerptEn", "excerpt", "description"])}</em>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {homepage.enableNewsletter ? (
          <section className={styles.moodboardSection}>
            <div className={`${styles.container} ${styles.moodboardNewsletter}`}>
              <div>
                <span className={styles.moodboardOverline}>{t(locale, "كن على اطلاع", "Stay in the know")}</span>
                <h2>{label.newsletterTitle}</h2>
                <p>{label.newsletterText}</p>
              </div>
              <form className={styles.newsletterForm} onSubmit={submitNewsletter}>
                <input
                  type="email"
                  value={newsletterEmail}
                  placeholder={t(locale, "أدخل بريدك الإلكتروني", "Enter your email")}
                  onChange={(event) => {
                    setNewsletterEmail(event.target.value);
                    setNewsletterMessage("");
                    setNewsletterError("");
                  }}
                />
                <button type="submit" className={styles.newsletterSubmitButton} disabled={newsletterLoading}>
                  <span>{newsletterLoading ? t(locale, "جاري الإرسال", "Sending") : t(locale, "اشترك الآن", "Subscribe now")}</span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {newsletterMessage ? <small>{newsletterMessage}</small> : null}
                {newsletterError ? <small>{newsletterError}</small> : null}
              </form>
            </div>
          </section>
        ) : null}
      </main>
    </PageShell>
  );

}
