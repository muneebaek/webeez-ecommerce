"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Simple line icons (24×24, stroke = currentColor)
const icons = {
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  wishlist: (
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  ),
  cart: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
};

type Tab = { label: string; href: string; icon: keyof typeof icons; count?: number };

// counts ippo hardcoded — cart store (Step 17) varumbol live aakkum
const tabs: Tab[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Search", href: "/products", icon: "search" },
  { label: "Wishlist", href: "/wishlist", icon: "wishlist", count: 0 },
  { label: "Cart", href: "/cart", icon: "cart", count: 2 },
  { label: "Account", href: "/admin", icon: "account" },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="tab-bar md:hidden" aria-label="Quick actions">
      <ul className="tab-bar__list">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.label}>
              <Link
                href={tab.href}
                className={`tab-bar__item ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="tab-bar__icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {icons[tab.icon]}
                  </svg>
                  {tab.count ? <span className="tab-bar__badge">{tab.count}</span> : null}
                </span>
                <span className="tab-bar__label">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
