"use client";

import { useEffect, useState } from "react";
import AdminSearch from "./AdminSearch";

// Desktop header: round search icon like the bell. Click → search box opens to the left (autoFocus), icon turns into ✕, Esc closes.
export default function HeaderSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex items-center gap-2.5">
      {open && <AdminSearch className="adm-search--pop w-64" autoFocus />}
      <button
        type="button"
        className={`adm-round ${open ? "is-active" : ""}`}
        aria-label={open ? "Close search" : "Search orders"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6 6 18" />
          ) : (
            <>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
