import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ChipScroller from "@/components/catalog/ChipScroller";
import Pagination from "@/components/catalog/Pagination";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ProductCard from "@/components/product/ProductCard";
import { filterProducts, hrefWith, paginate, parseFilters, titleFor, type Filters } from "@/lib/catalog";
import { getAllProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Collections — Neythra",
};

// Static shell (label) udane varum; searchParams-il depend cheyyunna results Suspense-il stream aakum.
// cacheComponents on aayathukondu searchParams vaayikkunna bhaagam Suspense-il venam (Next.js rule).
export default function ProductsPage(props: PageProps<"/products">) {
  return (
    <div className="bg-ivory">
      <div className="page-shell py-12 lg:py-16">
        <Suspense fallback={<GridSkeleton />}>
          <Results searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

// ---------- Filter chips — oro chip-um oru URL (back button, share ellaam work aakum) ----------
const clear = { category: undefined, collection: undefined, under: undefined };

const chips = (f: Filters) => [
  { label: "All", href: hrefWith(f, clear), active: !f.category && !f.collection && !f.under },
  { label: "Women", href: hrefWith(f, { ...clear, category: "women" }), active: f.category === "women" },
  { label: "Men", href: hrefWith(f, { ...clear, category: "men" }), active: f.category === "men" },
  { label: "Essentials", href: hrefWith(f, { ...clear, category: "essentials" }), active: f.category === "essentials" },
  { label: "New In", href: hrefWith(f, { ...clear, collection: "new-arrivals" }), active: f.collection === "new-arrivals" },
  { label: "Trending", href: hrefWith(f, { ...clear, collection: "trending" }), active: f.collection === "trending" },
  { label: "Best Sellers", href: hrefWith(f, { ...clear, collection: "best-sellers" }), active: f.collection === "best-sellers" },
  { label: "Under ₹2,999", href: hrefWith(f, { ...clear, under: 2999 }), active: f.under === 2999 },
];

const sorts = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price ↑︎" },
  { value: "price-desc", label: "Price ↓︎" },
] as const;

async function Results({ searchParams }: Pick<PageProps<"/products">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  // filter → sort → current page-inte 8 items
  const pg = paginate(filterProducts(await getAllProducts(), filters), filters.page);
  const items = pg.items;

  const title = titleFor(filters);
  const isAll = title === "All Pieces";

  return (
    <>
      {/* Home / Collections / Women — back to home */}
      <Breadcrumbs
        items={isAll ? [{ label: "Collections" }] : [{ label: "Collections", href: "/products" }, { label: title }]}
      />

      {/* ---------- Title + count ---------- */}
      <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-rule pb-6">
        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-semibold uppercase leading-none text-ink [font-variant-numeric:lining-nums]">
          {title}
        </h1>
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-taupe-dark">
          {pg.totalPages > 1
            ? `Showing ${pg.from}–${pg.to} of ${pg.total}`
            : `${pg.total} ${pg.total === 1 ? "Piece" : "Pieces"}`}
        </p>
      </header>

      {/* ---------- Filters + sort ---------- */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ChipScroller>
          {chips(filters).map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={`catalog-chips__chip ${c.active ? "is-active" : ""}`}
              aria-current={c.active ? "page" : undefined}
            >
              {c.label}
            </Link>
          ))}
        </ChipScroller>

        <div className="catalog-sort">
          <span className="catalog-sort__label">Sort</span>
          {sorts.map((s) => (
            <Link
              key={s.value}
              href={hrefWith(filters, { sort: s.value === "featured" ? undefined : s.value })}
              className={`catalog-sort__link ${filters.sort === s.value ? "is-active" : ""}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ---------- Grid / empty ---------- */}
      {items.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:mt-10 xl:grid-cols-4 xl:gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <p className="font-serif text-[2rem] font-semibold uppercase leading-none text-ink">
            Nothing here yet.
          </p>
          <p className="mt-3 text-[0.875rem] text-taupe-dark">This edit is still on the loom.</p>
          <Link
            href="/products"
            className="mt-6 bg-slate px-8 py-3.5 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-rose"
          >
            View All Pieces
          </Link>
        </div>
      )}

      <Pagination filters={filters} page={pg.page} totalPages={pg.totalPages} />
    </>
  );
}

// Results load aakumbol kaanikkunna placeholder (card shape)
function GridSkeleton() {
  return (
    <div className="mt-28 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 xl:gap-6" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="catalog-skeleton" />
      ))}
    </div>
  );
}
