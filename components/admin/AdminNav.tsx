"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// each link has its own pastel icon tile (as in the reference image) — store palette
const links = [
  { href: "/admin", label: "Dashboard", tone: "rose", icon: "M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z" },
  { href: "/admin/orders", label: "Orders", tone: "sage", icon: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" },
  { href: "/admin/products", label: "Products", tone: "sky", icon: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01" },
  { href: "/admin/reviews", label: "Reviews", tone: "amber", icon: "m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="adm-nav" aria-label="Admin">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            title={l.label} // hover tooltip in the collapsed sidebar
            className={`adm-nav__link ${active ? "is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className={`adm-icon adm-icon--${l.tone}`}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={l.icon} />
              </svg>
            </span>
            <span className="adm-side__label">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
