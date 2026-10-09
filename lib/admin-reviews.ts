// /admin/reviews URL state (?q=&type=&page=) — shared by the server page and its links.

export const REVIEWS_PAGE_SIZE = 10;

export const REVIEW_FILTERS = ["verified", "unverified"] as const;
export type ReviewFilter = (typeof REVIEW_FILTERS)[number];

export const REVIEW_FILTER_LABEL: Record<ReviewFilter, string> = {
  verified: "Verified buyers",
  unverified: "Unverified",
};

export type ReviewFilters = { q: string; type?: ReviewFilter; page: number };

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Validated filters from the URL — junk values fall back to "no filter" / page 1 */
export function parseReviewFilters(sp: SearchParams): ReviewFilters {
  const q = first(sp.q).trim().slice(0, 100);
  const typeRaw = first(sp.type);
  const type = REVIEW_FILTERS.find((t) => t === typeRaw);
  const pageNum = Number.parseInt(first(sp.page), 10);
  return { q, type, page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1 };
}

/** Builds /admin/reviews?… — empty values and page 1 are left out of the URL */
export function reviewsHref({ q, type, page }: Partial<ReviewFilters>) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (type) params.set("type", type);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/reviews?${qs}` : "/admin/reviews";
}
