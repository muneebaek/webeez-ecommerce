"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { hrefWith, type Filters } from "@/lib/catalog";

const DEBOUNCE_MS = 300;

// Store search on /products: results update while typing (short pause → URL ?q= → server re-renders the grid).
// Category / collection / sort stay as they are; a new search starts at page 1.
// Header "Search" and the mobile tab link to /products#search, which puts the cursor straight in this box.
export default function CatalogSearch({ filters }: { filters: Filters }) {
  const router = useRouter();
  const initial = filters.q ?? "";
  const [value, setValue] = useState(initial);
  const [pushed, setPushed] = useState(initial); // last query this box sent to the URL
  const [prevInitial, setPrevInitial] = useState(initial);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // URL changed from outside (e.g. "Clear search") → show that term in the box
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    if (initial !== pushed) {
      setValue(initial);
      setPushed(initial);
    }
  }

  // arriving from the header / tab bar search link
  useEffect(() => {
    if (window.location.hash === "#search") inputRef.current?.focus();
    return () => clearTimeout(timer.current);
  }, []);

  const search = (raw: string) => {
    const q = raw.trim();
    setPushed(q);
    startTransition(() => router.replace(hrefWith(filters, { q: q || undefined }), { scroll: false }));
  };

  return (
    <form
      role="search"
      className={`catalog-search ${pending ? "is-loading" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(timer.current);
        search(value);
        inputRef.current?.blur(); // closes the phone keyboard
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={inputRef}
        id="search"
        type="search"
        name="q"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => search(next), DEBOUNCE_MS);
        }}
        placeholder="Search pieces, fabrics…"
        aria-label="Search the collection"
        autoComplete="off"
        enterKeyHint="search"
      />
      {pending && <span className="catalog-search__spinner" aria-hidden="true" />}
    </form>
  );
}
