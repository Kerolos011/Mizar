"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

type Store = {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean | null;
};

type AuthUser = {
  id?: string;
  name?: string | null;
  firstName?: string | null;
  email?: string | null;
};

type IconName =
  | "dashboard"
  | "store"
  | "products"
  | "orders"
  | "customers"
  | "inventory"
  | "movements"
  | "reports"
  | "storefront"
  | "themes"
  | "reviews"
  | "newsletter"
  | "analytics"
  | "settings"
  | "external"
  | "share"
  | "logout"
  | "menu"
  | "close"
  | "moon"
  | "sun"
  | "language"
  | "bell"
  | "user"
  | "chevron"
  | "help"
  | "link";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: IconName;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "إدارة البيع",
    items: [
      {
        href: "/dashboard",
        label: "لوحة التحكم",
        description: "نظرة عامة",
        icon: "dashboard",
      },
      {
        href: "/dashboard/products",
        label: "المنتجات",
        description: "إدارة الكتالوج",
        icon: "products",
      },
      {
        href: "/dashboard/orders",
        label: "الطلبات",
        description: "متابعة الطلبات",
        icon: "orders",
      },
      {
        href: "/dashboard/customers",
        label: "العملاء",
        description: "بيانات العملاء",
        icon: "customers",
      },
    ],
  },
  {
    title: "المخزون",
    items: [
      {
        href: "/dashboard/inventory",
        label: "المخزون",
        description: "الكميات والتنبيهات",
        icon: "inventory",
      },
      {
        href: "/dashboard/inventory/movements",
        label: "حركة المخزون",
        description: "دخول وخروج الكميات",
        icon: "movements",
      },
      {
        href: "/dashboard/inventory/reports",
        label: "تقارير المخزون",
        description: "تحليل المخزون",
        icon: "reports",
      },
    ],
  },
  {
    title: "واجهة المتجر",
    items: [
      {
        href: "/dashboard/themes",
        label: "قوالب المتجر",
        description: "اختيار شكل المتجر",
        icon: "themes",
      },
      {
        href: "/dashboard/stores",
        label: "بيانات المتجر",
        description: "تعديل بيانات متجرك",
        icon: "store",
      },
    ],
  },
  {
    title: "الأداء والإعدادات",
    items: [
      {
        href: "/dashboard/reviews",
        label: "التقييمات",
        description: "آراء العملاء",
        icon: "reviews",
      },
      {
        href: "/dashboard/newsletter",
        label: "النشرة البريدية",
        description: "مشتركو البريد",
        icon: "newsletter",
      },
      {
        href: "/dashboard/analytics",
        label: "التحليلات",
        description: "أداء المتجر",
        icon: "analytics",
      },
      {
        href: "/dashboard/settings",
        label: "الإعدادات",
        description: "إعدادات الحساب",
        icon: "settings",
      },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

const layoutStyles = `
.mizar-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 78% 0%, rgba(46, 217, 179, 0.09), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: var(--text-main);
}

.dark .mizar-shell {
  background:
    radial-gradient(circle at 78% 0%, rgba(46, 217, 179, 0.08), transparent 30%),
    linear-gradient(180deg, #0f172a 0%, #111827 100%);
}

.mizar-shell * {
  scrollbar-width: thin;
  scrollbar-color: rgba(46, 217, 179, 0.35) transparent;
}

.mizar-shell *::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.mizar-shell *::-webkit-scrollbar-track {
  background: transparent;
}

.mizar-shell *::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.28);
}

.mizar-shell *::-webkit-scrollbar-thumb:hover {
  background: rgba(46, 217, 179, 0.5);
}

.mizar-sidebar {
  background:
    radial-gradient(circle at 16% 8%, rgba(46, 217, 179, 0.12), transparent 26%),
    linear-gradient(180deg, #18213f 0%, #11182f 48%, #0f172a 100%);
  color: #ffffff;
  border-left: 1px solid rgba(203, 213, 225, 0.1);
  box-shadow: -18px 0 42px rgba(15, 23, 42, 0.2);
}

.mizar-brand-mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #d8fff5 100%);
  color: var(--primary);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}

.mizar-brand-mark::after {
  content: "";
  position: absolute;
  top: 8px;
  left: 8px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.16);
}

.mizar-store-card {
  border: 1px solid rgba(203, 213, 225, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  padding: 14px;
}

.mizar-store-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border-radius: 999px;
  background: rgba(46, 217, 179, 0.13);
  color: var(--mint);
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
}

.mizar-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--mint);
  box-shadow: 0 0 0 5px rgba(46, 217, 179, 0.12);
}

.mizar-nav-group {
  margin-bottom: 16px;
}

.mizar-nav-group:last-child {
  margin-bottom: 0;
}

.mizar-nav-group-title {
  margin: 0 6px 8px;
  color: rgba(203, 213, 225, 0.48);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.01em;
}

.mizar-nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 11px 12px;
  color: rgba(226, 232, 240, 0.76);
  transition:
    background 180ms var(--ease-premium),
    border-color 180ms var(--ease-premium),
    color 180ms var(--ease-premium),
    transform 180ms var(--ease-premium);
}

.mizar-nav-link:hover {
  transform: translateX(-2px);
  border-color: rgba(46, 217, 179, 0.18);
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

.mizar-nav-link.active {
  border-color: rgba(46, 217, 179, 0.3);
  background:
    linear-gradient(135deg, rgba(46, 217, 179, 0.18), rgba(255, 255, 255, 0.06));
  color: #ffffff;
  box-shadow: inset 3px 0 0 var(--mint);
}

.mizar-nav-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(226, 232, 240, 0.76);
  transition:
    background 180ms var(--ease-premium),
    color 180ms var(--ease-premium);
}

.mizar-nav-link:hover .mizar-nav-icon,
.mizar-nav-link.active .mizar-nav-icon {
  background: rgba(46, 217, 179, 0.15);
  color: var(--mint);
}

.mizar-sidebar-action {
  display: inline-flex;
  min-height: 42px;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 14px;
  padding: 10px 13px;
  font-size: 13px;
  font-weight: 700;
  transition:
    transform 180ms var(--ease-premium),
    background 180ms var(--ease-premium),
    border-color 180ms var(--ease-premium),
    color 180ms var(--ease-premium);
}

.mizar-sidebar-action:hover {
  transform: translateY(-1px);
}

.mizar-sidebar-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.42);
  background: var(--mint);
  color: var(--primary);
}

.mizar-sidebar-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.mizar-sidebar-action.secondary {
  border: 1px solid rgba(203, 213, 225, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.88);
}

.mizar-sidebar-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.25);
  background: rgba(46, 217, 179, 0.1);
  color: var(--mint);
}

.mizar-topbar {
  border-bottom: 1px solid rgba(226, 232, 240, 0.92);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(18px);
}

.dark .mizar-topbar {
  border-bottom-color: rgba(203, 213, 225, 0.12);
  background: rgba(15, 23, 42, 0.82);
}

.mizar-topbar-btn {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  background: #ffffff;
  color: var(--text-main);
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 700;
  transition:
    transform 180ms var(--ease-premium),
    border-color 180ms var(--ease-premium),
    background 180ms var(--ease-premium),
    color 180ms var(--ease-premium),
    box-shadow 180ms var(--ease-premium);
}

.mizar-topbar-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.dark .mizar-topbar-btn {
  border-color: rgba(203, 213, 225, 0.14);
  background: rgba(24, 33, 63, 0.72);
  color: #ffffff;
}

.mizar-topbar-btn.icon {
  width: 40px;
  padding-inline: 0;
}

.mizar-topbar-btn.primary {
  border-color: rgba(46, 217, 179, 0.44);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.mizar-topbar-btn.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.mizar-avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 13px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--navy-soft) 100%);
  color: var(--mint);
  font-family: var(--font-en);
  font-size: 13px;
  font-weight: 800;
}

.mizar-dropdown {
  position: absolute;
  left: 0;
  top: calc(100% + 10px);
  z-index: 80;
  width: 270px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
}

.dark .mizar-dropdown {
  border-color: rgba(203, 213, 225, 0.14);
  background: #18213f;
}

.mizar-dropdown-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 700;
  text-align: start;
  transition:
    background 170ms var(--ease-premium),
    color 170ms var(--ease-premium);
}

.mizar-dropdown-item:hover {
  background: rgba(46, 217, 179, 0.08);
  color: var(--mint-hover);
}

.dark .mizar-dropdown-item {
  color: #ffffff;
}

.mizar-dropdown-item.danger {
  color: #dc2626;
}

.mizar-toast {
  position: fixed;
  left: 24px;
  bottom: 24px;
  z-index: 100;
  border: 1px solid rgba(46, 217, 179, 0.24);
  border-radius: 16px;
  background: #ffffff;
  color: var(--mint-hover);
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 20px 46px rgba(15, 23, 42, 0.16);
}

.dark .mizar-toast {
  background: #18213f;
}

@media (max-width: 768px) {
  .mizar-topbar-btn .desktop-label {
    display: none;
  }

  .mizar-dropdown {
    width: min(270px, calc(100vw - 28px));
  }

  .mizar-toast {
    left: 14px;
    right: 14px;
    bottom: 14px;
  }
}
`;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getActiveNavItem(pathname: string) {
  return navItems
    .slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isActivePath(pathname, item.href));
}

function getPageTitle(pathname: string) {
  return getActiveNavItem(pathname)?.label || "إدارة المتجر";
}

function getPageSubtitle(pathname: string) {
  return getActiveNavItem(pathname)?.description || "كل أدوات البيع في مكان واحد";
}

function getInitials(user: AuthUser | null) {
  const value = String(user?.firstName || user?.name || user?.email || "M").trim();

  if (!value) return "M";

  const parts = value.split(" ").filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function getDisplayName(user: AuthUser | null) {
  return user?.name || user?.firstName || "تاجر ميزار";
}

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const props = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  if (name === "dashboard") {
    return (
      <svg {...props}>
        <path d="M4 13h6V4H4v9Z" />
        <path d="M14 20h6V4h-6v16Z" />
        <path d="M4 20h6v-3H4v3Z" />
      </svg>
    );
  }

  if (name === "store") {
    return (
      <svg {...props}>
        <path d="M4 10h16" />
        <path d="M5 10l1-5h12l1 5" />
        <path d="M6 10v9h12v-9" />
        <path d="M9 19v-5h6v5" />
      </svg>
    );
  }

  if (name === "storefront") {
    return (
      <svg {...props}>
        <path d="M4 5h16v14H4z" />
        <path d="M4 9h16" />
        <path d="M8 13h3" />
        <path d="M13 13h3" />
        <path d="M8 16h8" />
      </svg>
    );
  }

  if (name === "themes") {
    return (
      <svg {...props}>
        <path d="M12 3a9 9 0 0 0 0 18h1.2a2 2 0 0 0 1.4-3.4l-.4-.4a1.8 1.8 0 0 1 1.3-3.1H17a4 4 0 0 0 0-8h-1" />
        <path d="M7.5 10.5h.01" />
        <path d="M9.5 6.8h.01" />
        <path d="M13.5 6.5h.01" />
      </svg>
    );
  }

  if (name === "products") {
    return (
      <svg {...props}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "orders") {
    return (
      <svg {...props}>
        <path d="M7 7h10" />
        <path d="M7 12h10" />
        <path d="M7 17h6" />
        <path d="M5 3h14a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }

  if (name === "customers") {
    return (
      <svg {...props}>
        <path d="M16 11a4 4 0 1 0-8 0" />
        <path d="M6 21a6 6 0 0 1 12 0" />
        <path d="M19 8a3 3 0 0 1 2 2.8" />
        <path d="M21 21a4.5 4.5 0 0 0-3-4.2" />
      </svg>
    );
  }

  if (name === "inventory") {
    return (
      <svg {...props}>
        <path d="M4 7l8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </svg>
    );
  }

  if (name === "movements") {
    return (
      <svg {...props}>
        <path d="M7 7h11" />
        <path d="M15 4l3 3-3 3" />
        <path d="M17 17H6" />
        <path d="M9 14l-3 3 3 3" />
      </svg>
    );
  }

  if (name === "reports") {
    return (
      <svg {...props}>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M15 3v4h4" />
        <path d="M9 17v-4" />
        <path d="M12 17v-7" />
        <path d="M15 17v-2" />
      </svg>
    );
  }

  if (name === "reviews") {
    return (
      <svg {...props}>
        <path d="M12 3l2.3 4.7 5.2.8-3.8 3.7.9 5.2L12 15l-4.6 2.4.9-5.2-3.8-3.7 5.2-.8L12 3Z" />
      </svg>
    );
  }

  if (name === "newsletter") {
    return (
      <svg {...props}>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
        <path d="M7 20h10" />
      </svg>
    );
  }

  if (name === "analytics") {
    return (
      <svg {...props}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 15l3-4 3 2 5-7" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...props}>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19 12h2" />
        <path d="M3 12h2" />
        <path d="M12 3v2" />
        <path d="M12 19v2" />
      </svg>
    );
  }

  if (name === "external") {
    return (
      <svg {...props}>
        <path d="M14 4h6v6" />
        <path d="M10 14L20 4" />
        <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
      </svg>
    );
  }

  if (name === "share") {
    return (
      <svg {...props}>
        <path d="M18 8a3 3 0 1 0-2.83-4" />
        <path d="M6 15a3 3 0 1 0 2.83 4" />
        <path d="M8.6 8.7l6.8 3.6" />
        <path d="M15.4 15.3l-6.8 3.6" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...props}>
        <path d="M15 17l5-5-5-5" />
        <path d="M20 12H9" />
        <path d="M12 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7" />
      </svg>
    );
  }

  if (name === "menu") {
    return (
      <svg {...props}>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...props}>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </svg>
    );
  }

  if (name === "moon") {
    return (
      <svg {...props}>
        <path d="M20 15.3A8 8 0 0 1 8.7 4 8.5 8.5 0 1 0 20 15.3Z" />
      </svg>
    );
  }

  if (name === "sun") {
    return (
      <svg {...props}>
        <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  }

  if (name === "language") {
    return (
      <svg {...props}>
        <path d="M4 5h9" />
        <path d="M9 3v2" />
        <path d="M10 5c-.7 3.9-2.7 6.8-6 9" />
        <path d="M5.5 8.5c1.3 2.1 3 3.7 5.5 5" />
        <path d="M14 21l4-9 4 9" />
        <path d="M15.5 18h5" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...props}>
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...props}>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...props}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    );
  }

  if (name === "help") {
    return (
      <svg {...props}>
        <path d="M12 18h.01" />
        <path d="M9.2 9a3 3 0 1 1 5.3 2c-.8.8-1.5 1.2-1.9 2-.2.4-.3.7-.3 1" />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07" />
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState("");
  const [merchantUser, setMerchantUser] = useState<AuthUser | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<"AR" | "EN">("AR");
  const [toastMessage, setToastMessage] = useState("");

  const activeStore = useMemo(() => {
    return stores.find((store) => store.id === activeStoreId) || stores[0] || null;
  }, [stores, activeStoreId]);

  const activeNavItem = getActiveNavItem(pathname);
  const pageTitle = getPageTitle(pathname);
  const pageSubtitle = getPageSubtitle(pathname);
  const storePreviewUrl = activeStore?.slug ? `/store/${activeStore.slug}` : "";

  async function loadCurrentUser() {
    try {
      const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && data?.user) {
        setMerchantUser(data.user as AuthUser);
      }
    } catch {
      setMerchantUser(null);
    }
  }

  async function loadStores() {
    setLoadingStores(true);

    try {
      await loadCurrentUser();

      const response = await fetch(`/api/stores?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setStores([]);
        setActiveStoreId("");
        return;
      }

      const loadedStores = Array.isArray(data.stores)
        ? (data.stores as Store[])
        : [];

      setStores(loadedStores);

      if (loadedStores.length === 0) {
        setActiveStoreId("");
        return;
      }

      const savedStoreId =
        typeof window !== "undefined"
          ? localStorage.getItem("mizar-store-id")
          : "";

      const selectedStore =
        loadedStores.find((store) => store.id === savedStoreId) ||
        loadedStores[0];

      setActiveStoreId(selectedStore.id);

      if (typeof window !== "undefined") {
        localStorage.setItem("mizar-store-id", selectedStore.id);
        localStorage.setItem("mizar-store-slug", selectedStore.slug);
      }
    } finally {
      setLoadingStores(false);
    }
  }

  function getAbsoluteStoreUrl() {
    if (!activeStore?.slug) return "";

    if (typeof window === "undefined") {
      return `/store/${activeStore.slug}`;
    }

    return `${window.location.origin}/store/${activeStore.slug}`;
  }

  async function shareStoreLink() {
    if (!activeStore?.slug) {
      setToastMessage("لا يوجد متجر متاح للمشاركة");
      return;
    }

    const url = getAbsoluteStoreUrl();

    try {
      if (navigator.share) {
        await navigator.share({
          title: activeStore.name,
          text: `رابط متجر ${activeStore.name} على ميزار`,
          url,
        });

        setToastMessage("تم فتح نافذة مشاركة رابط المتجر");
        return;
      }

      await navigator.clipboard.writeText(url);
      setToastMessage("تم نسخ رابط المتجر");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setToastMessage("تم نسخ رابط المتجر");
      } catch {
        setToastMessage("تعذر مشاركة رابط المتجر");
      }
    }
  }

  async function logout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/merchant/login");
      router.refresh();
    }
  }

  function toggleTheme() {
    if (typeof document === "undefined") return;

    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("mizar-theme", nextTheme);
    setTheme(nextTheme);
  }

  function toggleLanguage() {
    const nextLanguage = language === "AR" ? "EN" : "AR";

    setLanguage(nextLanguage);

    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLanguage === "AR" ? "ar" : "en";
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("mizar-language", nextLanguage);
    }

    setToastMessage(
      nextLanguage === "AR"
        ? "تم التحويل إلى العربية"
        : "Language switched to English"
    );
  }

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    setNotificationMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const savedTheme = localStorage.getItem("mizar-theme");
    const savedLanguage = localStorage.getItem("mizar-language") as
      | "AR"
      | "EN"
      | null;

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }

    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }

    if (savedLanguage === "EN" || savedLanguage === "AR") {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage === "AR" ? "ar" : "en";
    }
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  return (
    <div className="mizar-shell" dir="rtl">
      <style>{layoutStyles}</style>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`mizar-sidebar fixed right-0 top-0 z-50 h-screen w-[292px] transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4 lg:hidden">
          <p className="text-sm font-semibold text-white">القائمة</p>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="mizar-brand-mark">
                <span className="font-[var(--font-en)] text-xl font-black tracking-[-0.08em]">
                  M
                </span>
              </div>

              <div>
                <h1 className="font-[var(--font-en)] text-xl font-black leading-none tracking-[-0.06em] text-white">
                  MIZAR
                </h1>

                <p className="mt-1 text-xs font-semibold text-[rgba(203,213,225,0.76)]">
                  لوحة التاجر
                </p>
              </div>
            </Link>

            <div className="mt-5 mizar-store-card">
              <span className="mizar-store-badge">
                <span className="mizar-status-dot" />
                المتجر الحالي
              </span>

              {activeStore ? (
                <>
                  <h2 className="mt-3 truncate text-sm font-semibold text-white">
                    {activeStore.name}
                  </h2>

                  <p
                    className="mt-1 truncate text-xs font-medium text-[rgba(203,213,225,0.72)]"
                    dir="ltr"
                  >
                    /store/{activeStore.slug}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[rgba(203,213,225,0.72)]">
                      {activeStore.isActive === false ? "متجر متوقف" : "متجر نشط"}
                    </span>

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        activeStore.isActive === false
                          ? "bg-red-500"
                          : "bg-[var(--mint)]"
                      }`}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-3 text-xs font-medium leading-6 text-[rgba(203,213,225,0.72)]">
                  لا يوجد متجر مرتبط بالحساب.
                </p>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            {navGroups.map((group) => (
              <div key={group.title} className="mizar-nav-group">
                <p className="mizar-nav-group-title">{group.title}</p>

                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const active = activeNavItem?.href === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`mizar-nav-link ${active ? "active" : ""}`}
                      >
                        <span className="mizar-nav-icon">
                          <Icon name={item.icon} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {item.label}
                          </span>

                          <span className="mt-0.5 block truncate text-[11px] font-medium text-[rgba(203,213,225,0.56)]">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="space-y-3 border-t border-white/10 p-4">
            {activeStore?.slug && (
              <>
                <Link
                  href={storePreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mizar-sidebar-action primary"
                >
                  <Icon name="external" />
                  معاينة المتجر
                </Link>

                <button
                  type="button"
                  onClick={shareStoreLink}
                  className="mizar-sidebar-action secondary"
                >
                  <Icon name="share" />
                  مشاركة الرابط
                </button>
              </>
            )}

            <Link
              href="/dashboard/settings"
              className="mizar-sidebar-action secondary"
            >
              <Icon name="settings" />
              إعدادات المتجر
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:mr-[292px]">
        <header className="mizar-topbar sticky top-0 z-30">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 py-3 lg:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="mizar-topbar-btn icon lg:hidden"
              >
                <Icon name="menu" />
              </button>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-[var(--foreground)] md:text-xl">
                  {pageTitle}
                </h2>

                <p className="mt-0.5 hidden truncate text-sm font-medium text-[var(--muted-foreground)] sm:block">
                  {pageSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeStore?.slug && (
                <Link
                  href={storePreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mizar-topbar-btn primary hidden sm:inline-flex"
                >
                  <Icon name="external" />
                  <span className="desktop-label">معاينة المتجر</span>
                </Link>
              )}

              {activeStore?.slug && (
                <button
                  type="button"
                  onClick={shareStoreLink}
                  className="mizar-topbar-btn icon"
                  title="مشاركة رابط المتجر"
                >
                  <Icon name="share" />
                </button>
              )}

              <button
                type="button"
                onClick={toggleLanguage}
                className="mizar-topbar-btn icon"
                title="تغيير اللغة"
              >
                <Icon name="language" />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="mizar-topbar-btn icon"
                title="تغيير الوضع"
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationMenuOpen((current) => !current);
                    setAccountMenuOpen(false);
                  }}
                  className="mizar-topbar-btn icon"
                  title="الإشعارات"
                >
                  <Icon name="bell" />
                </button>

                {notificationMenuOpen && (
                  <div className="mizar-dropdown">
                    <div className="border-b border-[var(--border-soft)] p-4">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        الإشعارات
                      </p>

                      <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
                        سيتم ربطها لاحقًا بالطلبات وتنبيهات المخزون.
                      </p>
                    </div>

                    <Link href="/dashboard/orders" className="mizar-dropdown-item">
                      <Icon name="orders" />
                      متابعة الطلبات الجديدة
                    </Link>

                    <Link
                      href="/dashboard/inventory"
                      className="mizar-dropdown-item"
                    >
                      <Icon name="inventory" />
                      مراجعة تنبيهات المخزون
                    </Link>

                    <Link
                      href="/dashboard/inventory/movements"
                      className="mizar-dropdown-item"
                    >
                      <Icon name="movements" />
                      حركة المخزون
                    </Link>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen((current) => !current);
                    setNotificationMenuOpen(false);
                  }}
                  className="mizar-topbar-btn gap-2 pl-2"
                >
                  <span className="mizar-avatar">
                    {getInitials(merchantUser)}
                  </span>

                  <span className="hidden max-w-[120px] truncate text-sm md:block">
                    {getDisplayName(merchantUser)}
                  </span>

                  <Icon name="chevron" className="h-3.5 w-3.5" />
                </button>

                {accountMenuOpen && (
                  <div className="mizar-dropdown">
                    <div className="border-b border-[var(--border-soft)] p-4">
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {getDisplayName(merchantUser)}
                      </p>

                      <p className="mt-1 truncate text-xs font-medium text-[var(--muted-foreground)]">
                        {merchantUser?.email || "حساب التاجر"}
                      </p>
                    </div>

                    <Link
                      href="/dashboard/settings"
                      className="mizar-dropdown-item"
                    >
                      <Icon name="settings" />
                      إعدادات الحساب والمتجر
                    </Link>

                    <Link
                      href="/dashboard/themes"
                      className="mizar-dropdown-item"
                    >
                      <Icon name="themes" />
                      قوالب المتجر
                    </Link>

                    {activeStore?.slug && (
                      <button
                        type="button"
                        onClick={shareStoreLink}
                        className="mizar-dropdown-item"
                      >
                        <Icon name="link" />
                        نسخ / مشاركة رابط المتجر
                      </button>
                    )}

                    <Link href="/dashboard/help" className="mizar-dropdown-item">
                      <Icon name="help" />
                      مركز المساعدة
                    </Link>

                    <button
                      type="button"
                      onClick={logout}
                      disabled={loggingOut}
                      className="mizar-dropdown-item danger"
                    >
                      <Icon name="logout" />
                      {loggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] p-4 lg:p-7">
          {loadingStores && stores.length === 0 ? (
            <div className="glass-card p-6 text-sm font-semibold text-[var(--muted-foreground)]">
              جاري تحميل بيانات المتجر...
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {toastMessage && <div className="mizar-toast">{toastMessage}</div>}
    </div>
  );
}