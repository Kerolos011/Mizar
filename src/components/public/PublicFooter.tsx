"use client";

import Link from "next/link";

const footerGroups = [
  {
    title: "المنصة",
    links: [
      { href: "/features", label: "المميزات" },
      { href: "/how-it-works", label: "طريقة العمل" },
      { href: "/pricing", label: "الباقات" },
      { href: "/demo-store", label: "المتجر التجريبي" },
    ],
  },
  {
    title: "الدعم",
    links: [
      { href: "/help", label: "مركز المساعدة" },
      { href: "/contact", label: "تواصل معنا" },
      { href: "/faq", label: "الأسئلة الشائعة" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/terms", label: "الشروط والأحكام" },
      { href: "/privacy", label: "سياسة الخصوصية" },
    ],
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14 8.5h2.2V5.1C15.8 5 14.6 5 13.4 5c-2.8 0-4.7 1.7-4.7 4.8v2.7H5.6V16h3.1v8h3.8v-8h3.1l.5-3.5h-3.6V10.2c0-1 .3-1.7 1.5-1.7Z"
        />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm8.7 2.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
        />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.7 3c.3 2.2 1.6 3.7 3.8 3.9v3.5a7 7 0 0 1-3.8-1.1v6.1c0 4-2.6 6.6-6.3 6.6-3.2 0-5.9-2.3-5.9-5.7 0-3.8 3.1-6 6.8-5.6v3.7c-1.7-.5-3.1.3-3.1 1.8 0 1.2 1 2.1 2.2 2.1 1.4 0 2.4-.8 2.4-2.8V3h3.9Z"
        />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M6.7 8.9H3.1V21h3.6V8.9ZM4.9 3a2.1 2.1 0 1 0 0 4.2A2.1 2.1 0 0 0 4.9 3Zm6.2 5.9H7.7V21h3.6v-6.4c0-1.8.8-2.8 2.3-2.8 1.3 0 1.9.9 1.9 2.6V21h3.6v-7.1c0-3.4-1.8-5.2-4.6-5.2-1.7 0-2.7.7-3.4 1.7V8.9Z"
        />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.6 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C15.2 3.7 12 3.7 12 3.7h-.1s-3.2 0-6.4.2c-.5.1-1.5.1-2.3 1-.7.7-.9 2.3-.9 2.3S2 9.1 2 11v1.8c0 1.9.3 3.8.3 3.8s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 6.2.2 6.2.2s3.2 0 6.4-.3c.5 0 1.5-.1 2.3-1 .7-.7.9-2.3.9-2.3s.3-1.9.3-3.8V11c0-1.9-.3-3.8-.3-3.8ZM10 15.1V8.6l5.8 3.3-5.8 3.2Z"
        />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20.5 3.5A11.8 11.8 0 0 0 2.1 17.7L1 23l5.4-1.4A11.8 11.8 0 0 0 12 23h.1A11.8 11.8 0 0 0 20.5 3.5Zm-8.4 17.4H12a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.2.8.9-3.1-.2-.4A9.8 9.8 0 1 1 12.1 21Zm5.4-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.7 0 1.6 1.2 3.1 1.3 3.3.2.2 2.3 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2 .1.6-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z"
        />
      </svg>
    ),
  },
];

export function PublicFooter() {
  return (
    <footer className="bg-[var(--primary-dark)] text-white" dir="rtl">
      <div className="section-shell py-14">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="mizar-mark">
                <span className="mizar-mark-text">M</span>
              </span>

              <span>
                <span className="block font-[var(--font-en)] text-2xl font-black leading-none text-white">
                  MIZAR
                </span>
                <span className="mt-1 block text-sm font-extrabold leading-none text-[var(--mint)]">
                  ميزار
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm font-medium leading-8 text-[var(--text-light)]">
              منصة عربية تساعد التجار وأصحاب المشاريع على إنشاء متجر إلكتروني
              احترافي وإدارة المنتجات والطلبات والنمو بثقة.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="badge-dark">بدون كود</span>
              <span className="badge-dark">مصممة للتجار</span>
              <span className="badge-dark">دعم عربي</span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-base font-black text-white">
                  {group.title}
                </h3>

                <ul className="mt-5 space-y-4">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-bold text-[var(--text-light)] transition hover:text-[var(--mint)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-6 border-t border-white/10 pt-7 md:flex-row md:items-center">
          <p className="text-sm font-bold text-[var(--text-light)]">
            © 2026 MIZAR. جميع الحقوق محفوظة.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="ml-1 text-sm font-black text-[var(--text-light)]">
              تابعنا
            </span>

            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                title={social.label}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-[var(--text-light)] transition hover:-translate-y-1 hover:border-[var(--mint)] hover:bg-[var(--mint)] hover:text-[var(--primary)]"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}