"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const DEBOUNCE_MS = 250;

// Search-as-you-type for admin lists (orders, products): waits for a short pause in typing, then replaces ?q= in the URL.
// The server page re-renders with the new results; the old list stays visible until they arrive (transition).
// Other filters in `keep` stay in the URL; a new search starts again at page 1 (page is never kept).
export default function LiveSearch({
  path,
  initial,
  keep = {},
  placeholder = "Search…",
  className = "",
}: {
  path: string;
  initial: string;
  keep?: Record<string, string | undefined>;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [pushed, setPushed] = useState(initial); // last query this box sent to the URL
  const [prevInitial, setPrevInitial] = useState(initial);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // URL changed from outside (e.g. "Clear search" link) → show that term in the box
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    if (initial !== pushed) {
      setValue(initial);
      setPushed(initial);
    }
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const search = (raw: string) => {
    const q = raw.trim();
    setPushed(q);
    startTransition(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      for (const [k, v] of Object.entries(keep)) if (v) params.set(k, v);
      const qs = params.toString();
      router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
    });
  };

  return (
    <form
      role="search"
      className={`adm-search ${pending ? "is-loading" : ""} ${className}`}
      onSubmit={(e) => {
        e.preventDefault(); // Enter searches immediately
        clearTimeout(timer.current);
        search(value);
      }}
    >
      {pending ? (
        <span className="adm-search__spinner" aria-hidden="true" />
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      )}
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => search(next), DEBOUNCE_MS);
        }}
        placeholder={placeholder}
        aria-label={placeholder.replace(/…$/, "")}
        autoComplete="off"
      />
    </form>
  );
}
