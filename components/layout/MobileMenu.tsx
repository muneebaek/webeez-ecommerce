"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { navLinks } from "@/lib/navigation";

const secondaryLinks = [
  { label: "Wishlist", href: "/wishlist", meta: "(0)" },
  { label: "Cart", href: "/cart", meta: "[02]" },
  { label: "Account", href: "/admin", meta: "→" },
];

// Server-il false, browser-il true — portal browser-il mathram render cheyyaan
const subscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(subscribe, () => true, () => false);

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  // open aayirikkumbol: scroll lock + Esc close + close button-il focus
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="mobile-menu md:hidden">
      <button
        type="button"
        className="mobile-menu__toggle"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
      </button>

      {/* body-lekku portal — sticky header-inte z-index-il kudungathirikkaan */}
      {isClient &&
        createPortal(
          <div className={`drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
            <div className="drawer__overlay" onClick={close} />

            <aside
              id="mobile-drawer"
              className="drawer__panel"
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
            >
              <div className="drawer__head">
                <Link href="/" className="drawer__logo" onClick={close}>
                  Neythra
                </Link>
                <button
                  ref={closeRef}
                  type="button"
                  className="drawer__close"
                  aria-label="Close menu"
                  onClick={close}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <p className="drawer__meta">
                <span>[ Catalogue No. 01 ]</span>
                <span className="drawer__meta-accent">SS26</span>
              </p>

              <nav className="drawer__nav" aria-label="Mobile">
                <ul>
                  {navLinks.map((link, i) => (
                    <li key={link.href} style={{ "--i": i } as React.CSSProperties}>
                      <Link href={link.href} className="drawer__link" onClick={close}>
                        <span className="drawer__num">0{i + 1}</span>
                        <span className="drawer__label">{link.label}</span>
                        <span className="drawer__arrow" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <ul className="drawer__secondary">
                {secondaryLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="drawer__sublink" onClick={close}>
                      {link.label}
                      <span>{link.meta}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="drawer__foot">
                <p>
                  <span className="drawer__dot" aria-hidden="true" />
                  Complimentary shipping over ₹5,000
                </p>
                <p className="drawer__foot-muted">Exhibition &amp; Atelier Archive</p>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}
