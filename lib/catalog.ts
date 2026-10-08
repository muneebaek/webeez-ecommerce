import { products, type Category, type Product } from "./products";

// URL query (?category=women&sort=price-asc) → validated filters → filtered list

export const CATEGORIES: Category[] = ["women", "men", "essentials"];
export const COLLECTIONS = ["new-arrivals", "trending", "best-sellers", "current", "under-2999", "look-01"] as const;
export const SORTS = ["featured", "price-asc", "price-desc"] as const;

export type Sort = (typeof SORTS)[number];

export type Filters = {
  category?: Category;
  collection?: string;
  under?: number;
  sort: Sort;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Junk values ignore cheyyum — ?category=xyz pole vannaal filter illaatha pole */
export function parseFilters(params: RawParams): Filters {
  const category = first(params.category);
  const collection = first(params.collection);
  const under = Number(first(params.under));
  const sort = first(params.sort);

  return {
    category: CATEGORIES.includes(category as Category) ? (category as Category) : undefined,
    collection: COLLECTIONS.includes(collection as (typeof COLLECTIONS)[number]) ? collection : undefined,
    under: Number.isFinite(under) && under > 0 ? under : undefined,
    sort: SORTS.includes(sort as Sort) ? (sort as Sort) : "featured",
  };
}

export function filterProducts(f: Filters): Product[] {
  let list = products.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.collection && !p.collections.includes(f.collection)) return false;
    if (f.under && p.price > f.under) return false;
    // Look 01 pieces-inu ore wide image aanu — "All"-il kaanikkilla, collection=look-01-il mathram
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
  if (f.collection) return COLLECTION_TITLES[f.collection];
  if (f.under) return `Under ₹${f.under.toLocaleString("en-IN")}`;
  if (f.category) return f.category[0].toUpperCase() + f.category.slice(1);
  return "All Pieces";
}

/** Current filters-il ninnu oru value maatti puthiya URL — chips / sort links-inu */
export function hrefWith(f: Filters, patch: Partial<Record<keyof Filters, string | number | undefined>>) {
  const merged: Record<string, string | number | undefined> = {
    category: f.category,
    collection: f.collection,
    under: f.under,
    sort: f.sort === "featured" ? undefined : f.sort,
    ...patch,
  };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") qs.set(k, String(v));
  const s = qs.toString();
  return s ? `/products?${s}` : "/products";
}
