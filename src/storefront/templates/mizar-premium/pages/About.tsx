"use client";

import styles from "../styles.module.css";
import { PageShell } from "../components/PageShell";
import { firstText, getAddressSettings, getCoverImage, getLocale, getStoreDescription, getStoreName, t } from "../components/helpers";

export function About(props: any) {
  const store = props.store || {};
  const content = props.content || {};
  const locale = getLocale(props);
  const name = getStoreName(store, locale);
  const address = getAddressSettings(props);
  const image = firstText(content.aboutSection?.imageUrl, getCoverImage(store, content));
  return <PageShell {...props} active="about"><section className={styles.section}><div className={`${styles.container} ${styles.aboutGrid}`}><div className={styles.aboutMedia}>{image ? <img src={image} alt={name} /> : null}</div><div className={styles.aboutContent}><span className={styles.kicker}>{t(locale, "قصة المتجر", "Store story")}</span><h1 className={styles.sectionTitle}>{firstText(content.aboutSection?.title, name)}</h1><p className={styles.sectionText}>{firstText(content.aboutSection?.description, getStoreDescription(store, locale))}</p><div className={styles.highlightList}>{(content.aboutSection?.highlights || [store.category, store.ownerName, store.establishedYear, address.city].filter(Boolean)).map((item: string) => <span className={styles.highlight} key={item}>✓ {item}</span>)}</div></div></div></section></PageShell>;
}
