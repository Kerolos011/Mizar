import Link from "next/link";
import {
  buildStoreHref,
  getStoreName,
  resolveMediaUrl,
} from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import styles from "../styles.module.css";

function cleanPhone(value?: string | null) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function externalUrl(value?: string | null) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export function Footer({ store, text, locale }: Pick<TemplatePageProps, "store" | "text" | "locale">) {
  const name = getStoreName(store);
  const logoUrl = resolveMediaUrl(store?.logoUrl || "");
  const phone = (store as any)?.phone || store?.whatsapp || (store as any)?.contactPhone || "";
  const whatsapp = cleanPhone(store?.whatsapp || (store as any)?.phone || "");
  const email = (store as any)?.email || store?.contactEmail || "";
  const address = [store?.city, store?.area, store?.address].filter(Boolean).join(" - ");
  const facebook = externalUrl((store as any)?.facebook || store?.facebookUrl);
  const instagram = externalUrl((store as any)?.instagram || store?.instagramUrl);
  const tiktok = externalUrl((store as any)?.tiktok || store?.tiktokUrl);
  const website = externalUrl((store as any)?.website || store?.websiteUrl);
  const hasSocials = Boolean(facebook || instagram || tiktok || website || whatsapp);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGlow} aria-hidden="true" />
      <div className={styles.shell}>
        <div className={styles.footerGrid}>
          <div className={styles.footerIntro}>
            <Link href={buildStoreHref(store)} className={styles.footerBrand}>
              <span className={`${styles.footerLogo} ${logoUrl ? styles.footerLogoImage : ""}`}>
                {logoUrl ? <img src={logoUrl} alt={name} /> : name.slice(0, 1)}
              </span>
              <span>
                <strong>{name}</strong>
                <small>{store?.category || (locale === "ar" ? "متجر إلكتروني" : "Online store")}</small>
              </span>
            </Link>
            <p>{store?.description || store?.tagline || text.footer.text}</p>

            {hasSocials ? (
              <div className={styles.footerSocials} aria-label={locale === "ar" ? "روابط التواصل" : "Social links"}>
                {whatsapp ? <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">واتساب</a> : null}
                {facebook ? <a href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook">فيسبوك</a> : null}
                {instagram ? <a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram">انستجرام</a> : null}
                {tiktok ? <a href={tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">تيك توك</a> : null}
                {website ? <a href={website} target="_blank" rel="noreferrer" aria-label="Website">الموقع</a> : null}
              </div>
            ) : null}
          </div>

          <div>
            <h3>{locale === "ar" ? "روابط المتجر" : "Store links"}</h3>
            <div className={styles.footerLinks}>
              <Link href={buildStoreHref(store)}>{text.nav.home}</Link>
              <Link href={buildStoreHref(store, "products")}>{text.nav.products}</Link>
              <Link href={buildStoreHref(store, "about")}>{text.nav.about}</Link>
              <Link href={buildStoreHref(store, "contact")}>{text.nav.contact}</Link>
              <Link href={buildStoreHref(store, "wishlist")}>{text.nav.wishlist}</Link>
              <Link href={buildStoreHref(store, "cart")}>{text.nav.cart}</Link>
              <Link href={buildStoreHref(store, "account")}>{(text.nav as any).account || "حسابي"}</Link>
            </div>
          </div>

          <div>
            <h3>{locale === "ar" ? "تواصل معنا" : "Contact us"}</h3>
            <div className={styles.footerContacts}>
              {phone ? <a href={`tel:${phone}`}>📞 {phone}</a> : null}
              {email ? <a href={`mailto:${email}`}>✉️ {email}</a> : null}
              {address ? <span>📍 {address}</span> : null}
              {store?.shippingPolicy ? <span>🚚 {store.shippingPolicy}</span> : null}
              {typeof store?.shippingFee !== "undefined" && store?.shippingFee !== null ? <span>💳 {locale === "ar" ? "رسوم الشحن" : "Shipping fee"}: {String(store.shippingFee)} {store?.currency || ""}</span> : null}
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>{text.common.powered}</span>
        </div>
      </div>
    </footer>
  );
}
