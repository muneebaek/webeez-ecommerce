import type { Product } from "@/lib/products";

/**
 * Products for a home section (Trending, New Arrivals, Current Pieces):
 * pieces tagged with the section's collection come first, newest first — so a product the admin just added
 * shows up right away; if there are fewer than `slots`, the rest fill with other in-stock pieces, newest first.
 * `all` must be in store order (getAllProducts). New products get the highest sortOrder, so the end of the list is the newest.
 */
export function pickForSection(all: Product[], collection: string, slots: number): Product[] {
  const newestFirst = [...all].reverse();
  const tagged = newestFirst.filter((p) => p.collections.includes(collection));
  const fill = newestFirst.filter((p) => !p.collections.includes(collection) && p.stock > 0);
  return [...tagged, ...fill].slice(0, slots);
}
