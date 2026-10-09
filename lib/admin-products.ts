// /admin/products URL state (?q=&stock=&page=) — shared by the server page and its links.

export const LOW_STOCK = 5;
export const PRODUCTS_PAGE_SIZE = 12;

export const STOCK_FILTERS = ["in", "low", "out"] as const;
export type StockFilter = (typeof STOCK_FILTERS)[number];

export const STOCK_LABEL: Record<StockFilter, string> = {
  in: "In stock",
  low: `Low stock (≤ ${LOW_STOCK})`,
  out: "Sold out",
};

export type ProductFilters = { q: string; stock?: StockFilter; page: number };

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Validated filters from the URL — junk values fall back to "no filter" / page 1 */
export function parseProductFilters(sp: SearchParams): ProductFilters {
  const q = first(sp.q).trim().slice(0, 100);
  const stockRaw = first(sp.stock);
  const stock = STOCK_FILTERS.find((s) => s === stockRaw);
  const pageNum = Number.parseInt(first(sp.page), 10);
  return { q, stock, page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1 };
}

/** Builds /admin/products?… — empty values and page 1 are left out of the URL */
export function productsHref({ q, stock, page }: Partial<ProductFilters>) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (stock) params.set("stock", stock);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

/** Stock level → label + colour class for badges */
export function stockState(stock: number) {
  if (stock === 0) return { label: "Sold out", tone: "out" } as const;
  if (stock <= LOW_STOCK) return { label: `${stock} left`, tone: "low" } as const;
  return { label: `${stock} in stock`, tone: "in" } as const;
}
