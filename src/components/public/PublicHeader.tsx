"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "SUPER_ADMIN" | "MERCHANT" | "CUSTOMER";
  ownedStores?: {
    id: string;
    name: string;
    slug: string;
  }[];
};

type HeaderLink = {
  label: string;
  href: string;
};

const homeNavLinks: HeaderLink[] = [
  {
    href: "/",
    label: "الرئيسية",
  },
  {
    href: "/features",
    label: "المميزات",
  },
  {
    href: "/how-it-works",
    label: "طريقة العمل",
  },
  {
    href: "/pricing",
    label: "الباقات",
  },
  {
    href: "/demo-store",
    label: "المتجر التجريبي",
  },
  {
    href: "/about",
    label: "من نحن",
  },
  {
    href: "/contact",
    label: "تواصل معنا",
  },
];

const publicHeaderStyles = `
.home-navbar {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 90;
  border-bottom: 1px solid rgba(46, 217, 179, 0.14);
  background: rgba(24, 33, 63, 0.98);
  backdrop-filter: blur(18px);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.12);
}

.home-nav-spacer {
  height: 78px;
}

.home-nav-inner {
  min-height: 78px;
  padding-block: 14px;
}

.home-logo,
.home-logo * {
  color: #ffffff !important;
}

.home-logo-sub {
  color: var(--mint) !important;
}

.home-login-link {
  color: #ffffff !important;
  opacity: 1;
}

.home-login-link:hover {
  color: var(--mint) !important;
}

.nav-link {
  position: relative;
  color: var(--text-light);
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  transition: color 240ms var(--ease-premium);
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link.active {
  color: #ffffff;
}

.nav-link::after {
  content: "";
  position: absolute;
  right: 50%;
  bottom: -18px;
  width: 0;
  height: 3px;
  border-radius: 999px;
  background: var(--mint);
  transform: translateX(50%);
  transition: width 240ms var(--ease-premium);
}

.nav-link:hover::after {
  width: 22px;
}

.nav-link.active::after {
  width: 22px;
}

@media (max-width: 768px) {
  .home-nav-spacer {
    height: 70px;
  }

  .home-nav-inner {
    min-height: 70px;
  }
}
`;

export function PublicHeader() {
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  function isActiveLink(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function loadCurrentUser() {
    setLoadingUser(true);

    try {
      const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    window.location.href = "/";
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const isPlatformAdmin = user?.role === "SUPER_ADMIN";
  const isMerchant = user?.role === "MERCHANT";
  const firstStore = isMerchant ? user?.ownedStores?.[0] || null : null;

  const primaryHref = useMemo(() => {
    if (isPlatformAdmin) return "/admin/testimonials";
    if (isMerchant) return "/dashboard";
    return "/merchant/register";
  }, [isPlatformAdmin, isMerchant]);

  const primaryText = isPlatformAdmin
    ? "لوحة إدارة ميزار"
    : isMerchant
      ? "دخول لوحة التحكم"
      : "ابدأ الآن مجانًا";

  return (
    <>
      <style>{publicHeaderStyles}</style>

      <header className="home-navbar" dir="rtl">
        <div className="section-shell home-nav-inner flex items-center justify-between gap-4">
          <Link href="/" className="home-logo flex items-center gap-3">
            <span className="mizar-mark">
              <span className="mizar-mark-text">M</span>
            </span>

            <span>
              <span className="block font-[var(--font-en)] text-xl font-black leading-none tracking-[-0.04em]">
                MIZAR
              </span>
              <span className="home-logo-sub mt-1 block text-xs font-extrabold leading-none">
                ميزار
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
            {homeNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActiveLink(link.href) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!loadingUser && (isMerchant || isPlatformAdmin) ? (
              <>
                <Link href={primaryHref} className="btn-primary hidden sm:flex">
                  {primaryText}
                </Link>

                {firstStore?.slug && (
                  <Link
                    href={`/store/${firstStore.slug}`}
                    className="hidden rounded-xl border border-white/10 px-4 py-3 text-sm font-black text-white transition hover:border-[var(--mint)] hover:text-[var(--mint)] md:inline-flex"
                  >
                    عرض متجري
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/20"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/merchant/login"
                  className="home-login-link hidden rounded-xl border border-white/10 px-4 py-3 text-sm font-black transition hover:border-[var(--mint)] sm:inline-flex"
                >
                  تسجيل الدخول
                </Link>

                <Link href="/merchant/register" className="btn-primary">
                  ابدأ مجانًا
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}