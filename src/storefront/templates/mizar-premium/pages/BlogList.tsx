"use client";

import Link from "next/link";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import {
  firstText,
  getBlogPosts,
  getLocale,
  getStoreDescription,
  getStoreName,
  homeUrl,
  labels,
  resolveUrl,
  t,
} from "../components/helpers";

function postSlug(post: any) {
  return firstText(post?.slug, post?.id, "post");
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

function formatDate(value: any, locale: "ar" | "en") {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function BlogList(props: any) {
  const store = props.store || {};
  const locale = getLocale(props);
  const label = labels(locale);
  const posts = getBlogPosts(props);
  const name = getStoreName(store, locale);
  const description = getStoreDescription(store, locale);

  return (
    <PageShell {...props} active="home">
      <section className={styles.sectionSoft}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.kicker}>{t(locale, "مدونة المتجر", "Store blog")}</span>
              <h1 className={styles.sectionTitle}>{firstText(label.blog, t(locale, "المدونة", "Blog"))}</h1>
              <p className={styles.sectionText}>
                {firstText(
                  description,
                  t(locale, `تابع أحدث أخبار ومقالات ${name}.`, `Read the latest news and articles from ${name}.`),
                )}
              </p>
            </div>
            <Link href={homeUrl(store)} className={styles.secondaryButton}>
              {label.home || t(locale, "الرئيسية", "Home")}
            </Link>
          </div>

          {posts.length ? (
            <div className={styles.infoGrid}>
              {posts.map((post: any, index: number) => {
                const slug = postSlug(post);
                const image = resolveUrl(firstText(post.imageUrl, post.coverUrl, post.thumbnailUrl));
                const title = localizedValue(post, locale, ["titleAr", "title"], ["titleEn", "title"], label.blog);
                const excerpt = localizedValue(
                  post,
                  locale,
                  ["excerptAr", "excerpt", "summaryAr", "summary", "description"],
                  ["excerptEn", "excerpt", "summaryEn", "summary", "description"],
                );
                const date = formatDate(firstText(post.publishedAt, post.createdAt), locale);

                return (
                  <Link
                    className={styles.infoCard}
                    href={`${homeUrl(store)}/blog/${encodeURIComponent(slug)}`}
                    key={firstText(post.id, post.slug, title, index)}
                  >
                    {image ? (
                      <span style={{ display: "block", overflow: "hidden", borderRadius: 22, marginBottom: 14 }}>
                        <img src={image} alt={title} loading="lazy" style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }} />
                      </span>
                    ) : (
                      <span className={styles.infoIcon}>✦</span>
                    )}
                    {date ? <span className={styles.kicker}>{date}</span> : null}
                    <strong>{title}</strong>
                    {excerpt ? <span>{excerpt}</span> : null}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>{t(locale, "لا توجد مقالات منشورة حاليًا", "No published posts yet")}</strong>
              <span>
                {t(
                  locale,
                  "أضف مقالات من إعدادات الصفحة الرئيسية ثم فعّل قسم المدونة ليظهر هنا.",
                  "Add posts from homepage settings, then enable the blog section to show them here.",
                )}
              </span>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
