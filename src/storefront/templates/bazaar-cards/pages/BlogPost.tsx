"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import {
  firstText,
  getBlogPosts,
  getLocale,
  getStoreName,
  homeUrl,
  labels,
  resolveUrl,
  t,
} from "../components/helpers";

function normalizeComparable(value: any) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function findPost(posts: any[], rawSlug: string) {
  const decoded = decodeURIComponent(String(rawSlug || "").trim());
  const normalized = normalizeComparable(decoded);

  const exact = posts.find((post: any) =>
    [post?.slug, post?.id, post?.handle].some((value) => String(value || "") === decoded),
  );

  if (exact) return exact;

  const normalizedMatch = posts.find((post: any) =>
    [post?.slug, post?.id, post?.title, post?.titleAr, post?.titleEn]
      .map(normalizeComparable)
      .some((value) => value && value === normalized),
  );

  if (normalizedMatch) return normalizedMatch;

  if ((decoded === "slug" || decoded === "post") && posts.length === 1) {
    return posts[0];
  }

  return null;
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

function renderContent(content: string) {
  const clean = String(content || "").trim();

  if (!clean) return null;

  return clean
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={`${paragraph.slice(0, 16)}-${index}`} className={styles.sectionText} style={{ marginTop: 16 }}>
        {paragraph}
      </p>
    ));
}

export function BlogPost(props: any) {
  const store = props.store || {};
  const locale = getLocale(props);
  const label = labels(locale);
  const params = useParams<{ postSlug?: string }>();
  const posts = getBlogPosts(props);
  const post = findPost(posts, String(params?.postSlug || ""));
  const name = getStoreName(store, locale);

  if (!post) {
    return (
      <PageShell {...props} active="home">
        <section className={styles.sectionSoft}>
          <div className={styles.container}>
            <div className={styles.emptyState}>
              <strong>{t(locale, "المقال غير موجود", "Post not found")}</strong>
              <span>{t(locale, "تأكد من رابط المقال أو ارجع لقائمة المدونة.", "Check the post link or go back to the blog list.")}</span>
              <Link href={`${homeUrl(store)}/blog`} className={styles.secondaryButton}>
                {label.blog || t(locale, "المدونة", "Blog")}
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const title = localizedValue(post, locale, ["titleAr", "title"], ["titleEn", "title"], name);
  const excerpt = localizedValue(
    post,
    locale,
    ["excerptAr", "excerpt", "summaryAr", "summary", "description"],
    ["excerptEn", "excerpt", "summaryEn", "summary", "description"],
  );
  const content = localizedValue(
    post,
    locale,
    ["contentAr", "content", "bodyAr", "body"],
    ["contentEn", "content", "bodyEn", "body"],
  );
  const image = resolveUrl(firstText(post.imageUrl, post.coverUrl, post.thumbnailUrl));
  const date = formatDate(firstText(post.publishedAt, post.createdAt), locale);

  return (
    <PageShell {...props} active="home">
      <article className={styles.sectionSoft}>
        <div className={styles.container} style={{ maxWidth: 980 }}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.kicker}>{firstText(date, label.blog, t(locale, "المدونة", "Blog"))}</span>
              <h1 className={styles.sectionTitle}>{title}</h1>
              {excerpt ? <p className={styles.sectionText}>{excerpt}</p> : null}
            </div>
            <Link href={`${homeUrl(store)}/blog`} className={styles.secondaryButton}>
              {t(locale, "كل المقالات", "All posts")}
            </Link>
          </div>

          {image ? (
            <div className={styles.aboutMedia} style={{ marginTop: 24, marginBottom: 24 }}>
              <img src={image} alt={title} loading="eager" />
            </div>
          ) : null}

          <div style={{ borderRadius: 28, background: "#fff", border: "1px solid rgba(0,0,0,.08)", padding: "24px" }}>
            {renderContent(content) || (
              <p className={styles.sectionText}>
                {t(
                  locale,
                  "لم يتم إضافة محتوى تفصيلي للمقال بعد. يمكنك إضافته من إعدادات الصفحة الرئيسية داخل لوحة التحكم.",
                  "No full article content has been added yet. You can add it from homepage settings in the dashboard.",
                )}
              </p>
            )}
          </div>
        </div>
      </article>
    </PageShell>
  );
}
