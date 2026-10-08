"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AdminSearch from "./AdminSearch";

// Mobile: top bar (hamburger | NEYTHRA | avatar). Floating search icon (above the bell) → search line in the top bar.
// Hamburger → sidebar slides in from the left as a drawer (closes on backdrop, Esc or link click).
// Desktop (lg+): drawer CSS is off — sidebar is a sticky column; the edge button collapses it (icons-only rail, width transition).
// Sidebar content is rendered on the server and passed in as `children` (nav, sign out form).
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // desktop sidebar collapse — lives in the layout, so state survives page navigation
  const [collapsed, setCollapsed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Esc closes the search line
  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // stop the page behind from scrolling
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="adm-topbar lg:hidden">
        <div className="adm-topbar__row">
          <button type="button" className="adm-round" aria-label="Open menu" aria-expanded={open} aria-controls="adm-sidebar" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
          <Link href="/admin" className="justify-self-center font-serif text-[1.15rem] font-semibold tracking-[0.3em] text-ink">
            NEYTHRA
          </Link>
          <span className="adm-avatar adm-avatar--sm justify-self-end" aria-hidden="true">
            A
          </span>
        </div>
        {/* floating search icon click → search line below NEYTHRA (autoFocus on mount) */}
        {searchOpen && (
          <div className="adm-topbar__search">
            <AdminSearch autoFocus />
          </div>
        )}
      </div>

      {/* mobile floating search — above the bell button */}
      <button
        type="button"
        className={`adm-fab adm-fab--search lg:hidden ${searchOpen ? "is-active" : ""}`}
        aria-label={searchOpen ? "Close search" : "Search orders"}
        aria-expanded={searchOpen}
        onClick={() => setSearchOpen((s) => !s)}
      >
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {searchOpen ? (
            <path d="M6 6l12 12M18 6 6 18" />
          ) : (
            <>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </>
          )}
        </svg>
      </button>

      <div className={`adm-backdrop lg:hidden ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside
        id="adm-sidebar"
        className={`adm-side ${open ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}
        // close the drawer when a nav link is clicked (navigating to a new page)
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <button ref={closeRef} type="button" className="adm-round adm-side__close lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {/* desktop collapse toggle — on the sidebar's right edge */}
        <button
          type="button"
          className="adm-side__toggle hidden lg:grid"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="adm-sidebar"
          onClick={() => setCollapsed((c) => !c)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 6-6 6 6 6" />
          </svg>
        </button>
        {children}
      </aside>
    </>
  );
}
