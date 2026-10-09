"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import type { GlobalSearchResult } from "@/lib/data/admin";
import { formatINR } from "@/lib/format";

const DEBOUNCE_MS = 250;

// Global admin search (header + mobile floating search): results appear while typing,
// grouped into Orders and Products. Enter opens the full orders list for the term.
export default function GlobalSearch({
  className = "",
  autoFocus = false,
  onNavigate,
}: {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void; // lets the parent close its search box after a result is picked
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [term, setTerm] = useState(""); // the term the current results belong to
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const request = useRef<AbortController>(undefined);

  // stop pending work when the box closes
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      request.current?.abort();
    },
    [],
  );

  // click outside → hide the results (focusing the input shows them again)
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPanelOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const fetchResults = async (q: string) => {
    request.current?.abort(); // an older, slower response must not overwrite newer results
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    try {
      const res = await fetch(`/admin/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
      if (!res.ok || !res.headers.get("content-type")?.includes("json")) throw new Error(String(res.status));
      setResults(await res.json());
      setTerm(q);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setResults(null);
      setTerm(q);
    } finally {
      if (request.current === controller) setLoading(false);
    }
  };

  const onChange = (next: string) => {
    setValue(next);
    setPanelOpen(true);
    clearTimeout(timer.current);
    const q = next.trim();
    if (!q) {
      request.current?.abort();
      setResults(null);
      setTerm("");
      setLoading(false);
      return;
    }
    timer.current = setTimeout(() => fetchResults(q), DEBOUNCE_MS);
  };

  const done = () => {
    setPanelOpen(false);
    onNavigate?.();
  };

  const q = value.trim();
  const empty = results && results.orders.length === 0 && results.products.length === 0;

  return (
    <div ref={rootRef} className={`adm-gs ${className}`}>
      <form
        role="search"
        className="adm-search"
        onSubmit={(e) => {
          e.preventDefault();
          if (!q) return;
          router.push(`/admin/orders?q=${encodeURIComponent(q)}`);
          done();
        }}
      >
        {loading ? (
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
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setPanelOpen(true)}
          placeholder="Search orders, customers, products…"
          aria-label="Search orders, customers and products"
          autoComplete="off"
          autoFocus={autoFocus}
        />
      </form>

      {panelOpen && q && term && (
        <div className="adm-gs__panel" role="region" aria-label="Search results" aria-busy={loading}>
          {!results ? (
            <p className="adm-gs__empty">Search is unavailable right now. Try again.</p>
          ) : empty ? (
            <p className="adm-gs__empty">No results for “{term}”.</p>
          ) : (
            <>
              {results.orders.length > 0 && (
                <section>
                  <p className="adm-gs__group">Orders · {results.orderTotal}</p>
                  <ul>
                    {results.orders.map((o) => (
                      <li key={o.id}>
                        <Link href={`/admin/orders/${o.id}`} className="adm-gs__item" onClick={done}>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold text-ink">{o.orderNumber}</span>
                            <span className="adm-muted block truncate text-[0.75rem]">{o.customerName}</span>
                          </span>
                          <span className="adm-price text-[0.8125rem]">{formatINR(o.total)}</span>
                          <StatusBadge status={o.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {results.orderTotal > results.orders.length && (
                    <Link href={`/admin/orders?q=${encodeURIComponent(term)}`} className="adm-gs__more" onClick={done}>
                      View all {results.orderTotal} orders →
                    </Link>
                  )}
                </section>
              )}

              {results.products.length > 0 && (
                <section>
                  <p className="adm-gs__group">Products · {results.productTotal}</p>
                  <ul>
                    {results.products.map((p) => (
                      <li key={p.id}>
                        <Link href={`/admin/products/${p.id}`} className="adm-gs__item" onClick={done}>
                          <span className="adm-gs__thumb">
                            {p.image && <Image src={p.image} alt="" fill sizes="36px" className="object-cover object-top" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-ink">{p.name}</span>
                            <span className="adm-muted block truncate text-[0.75rem]">
                              {p.code} · {p.stock === 0 ? "Sold out" : `${p.stock} in stock`}
                            </span>
                          </span>
                          <span className="adm-price text-[0.8125rem]">{formatINR(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
