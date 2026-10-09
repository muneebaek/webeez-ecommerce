import type { Category, Product } from "./products";

// URL query (?category=women&sort=price-asc) → validated filters → filtered list

export const CATEGORIES: Category[] = ["women", "men", "essentials"];
export const COLLECTIONS = ["new-arrivals", "trending", "best-sellers", "current", "under-2999", "look-01"] as const;
export const SORTS = ["featured", "price-asc", "price-desc"] as const;

export type Sort = (typeof SORTS)[number];

export const PAGE_SIZE = 8; // products per page

export type Filters = {
  q?: string; // search text
  category?: Category;
  collection?: string;
  under?: number;
  sort: Sort;
  page: number; // starts at 1
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Ignores junk values — ?category=xyz behaves like no filter */
export function parseFilters(params: RawParams): Filters {
  const category = first(params.category);
  const collection = first(params.collection);
  const under = Number(first(params.under));
  const sort = first(params.sort);
  const page = Number(first(params.page));
  const q = first(params.q)?.trim().replace(/\s+/g, " ").slice(0, 60); // collapse repeated spaces

  return {
    q: q || undefined,
    category: CATEGORIES.includes(category as Category) ? (category as Category) : undefined,
    collection: COLLECTIONS.includes(collection as (typeof COLLECTIONS)[number]) ? collection : undefined,
    under: Number.isFinite(under) && under > 0 ? under : undefined,
    sort: SORTS.includes(sort as Sort) ? (sort as Sort) : "featured",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Every word of the search must appear in the product's name, fabric, details, code or category */
function matchesSearch(p: Product, q: string) {
  const haystack = [p.name, p.fabric, p.subtitle, p.code, p.category].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(" ")
    .every((word) => haystack.includes(word));
}

/** list = products from the database (getAllProducts) */
export function filterProducts(all: Product[], f: Filters): Product[] {
  let list = all.filter((p) => {
    if (f.q && !matchesSearch(p, f.q)) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.collection && !p.collections.includes(f.collection)) return false;
    if (f.under && p.price > f.under) return false;
    // Look 01 pieces share one wide image — hidden from "All", shown only in collection=look-01
    if (f.collection !== "look-01" && p.collections.includes("look-01")) return false;
    return true;
  });

  if (f.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (f.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  return list;
}

const COLLECTION_TITLES: Record<string, string> = {
  "new-arrivals": "New Arrivals",
  trending: "Trending Now",
  "best-sellers": "Best Sellers",
  current: "Current Pieces",
  "under-2999": "Under ₹2,999",
  "look-01": "Look 01",
};

export function titleFor(f: Filters) {
  if (f.q) return "Search";
  if (f.collection) return COLLECTION_TITLES[f.collection];
  if (f.under) return `Under ₹${f.under.toLocaleString("en-IN")}`;
  if (f.category) return f.category[0].toUpperCase() + f.category.slice(1);
  return "All Pieces";
}

/** Items for the current page + page info from the filtered list.
 *  Out-of-range values like ?page=99 clamp to the last page */
export function paginate<T>(list: T[], page: number, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(list.length / size));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * size;
  return {
    items: list.slice(start, start + size),
    page: current,
    totalPages,
    from: list.length === 0 ? 0 : start + 1,
    to: Math.min(start + size, list.length),
    total: list.length,
  };
}

/** New URL from the current filters with one value changed — for chips / sort links */
export function hrefWith(f: Filters, patch: Partial<Record<keyof Filters, string | number | undefined>>) {
  const merged: Record<string, string | number | undefined> = {
    q: f.q,
    category: f.category,
    collection: f.collection,
    under: f.under,
    sort: f.sort === "featured" ? undefined : f.sort,
    page: undefined, // reset to page 1 when filter / sort changes
    ...patch,
  };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === "" || (k === "page" && v === 1)) continue; // omit page=1 from the URL
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `/products?${s}` : "/products";
}
