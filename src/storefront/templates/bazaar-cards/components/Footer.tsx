import Link from "next/link";
import { buildStoreHref, getStoreName } from "@/storefront/StorefrontPagesShared";
import type { TemplatePageProps } from "../../_shared/template-types";
import styles from "../styles.module.css";

export function Footer({ store, text }: Pick<TemplatePageProps, "store" | "text">) {
  const name = getStoreName(store);
  const footerTitle = text.footer.title.split("\n");
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBg}>{name}</div>
      <div className={styles.shell}>
        <div className={styles.footerGrid}>
          <div>
            <h2>{footerTitle[0]}<br />{footerTitle[1] || ""}</h2>
            <p>{store?.description || store?.tagline || text.footer.text}</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href={buildStoreHref(store, "products")}>{text.footer.products}</Link>
            <Link href={buildStoreHref(store, "about")}>{text.footer.about}</Link>
            <Link href={buildStoreHref(store, "contact")}>{text.footer.contact}</Link>
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
