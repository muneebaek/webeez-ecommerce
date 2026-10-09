import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LiveSearch from "@/components/admin/LiveSearch";
import ProductsList from "@/components/admin/ProductsList";
import Pagination from "@/components/catalog/Pagination";
import { parseProductFilters, PRODUCTS_PAGE_SIZE, productsHref, STOCK_FILTERS, STOCK_LABEL } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminProducts } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Products" };

// Shell renders instantly; the session check, URL and DB read stream in via Suspense (Cache Components rule).
export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsView searchParams={searchParams} />
    </Suspense>
  );
}

// Live DB list. requireAdmin() first, then read ?q / ?stock / ?page and query.
async function ProductsView({ searchParams }: Pick<PageProps<"/admin/products">, "searchParams">) {
  await requireAdmin();
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const deleted = typeof sp.deleted === "string" ? sp.deleted.slice(0, 120) : ""; // set by the delete action
  const { q, stock } = filters;
  const { items, total, page, totalPages, counts } = await getAdminProducts(filters);

  const chips = [
    { key: "all", label: "All", count: counts.all, href: productsHref({ q }), active: !stock },
    ...STOCK_FILTERS.map((s) => ({
      key: s,
      label: STOCK_LABEL[s],
      count: counts[s],
      href: productsHref({ q, stock: s }), // changing the filter resets to page 1
      active: stock === s,
    })),
  ];
  const from = total === 0 ? 0 : (page - 1) * PRODUCTS_PAGE_SIZE + 1;
  const to = Math.min(page * PRODUCTS_PAGE_SIZE, total);

  return (
    <div className="grid gap-5 lg:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="adm-hello">Products</h1>
          <p className="adm-muted mt-1">
            {q ? `${counts.all} result${counts.all === 1 ? "" : "s"} for “${q}”` : `${counts.all} products in the store`}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
          <LiveSearch path="/admin/products" initial={q} keep={{ stock }} placeholder="Search name, code, fabric…" className="min-w-0 flex-1 sm:w-72 sm:flex-none" />
          <Link href="/admin/products/new" className="adm-btn adm-btn--primary adm-btn--pill justify-center px-5">
            + Add product
          </Link>
        </div>
      </header>

      {deleted && (
        <p role="status" className="adm-msg is-ok">
          “{deleted}” was deleted.
        </p>
      )}

      {/* stock filter — every chip is a URL that keeps the search (scrolls sideways on mobile) */}
      <nav aria-label="Filter by stock" className="adm-chips">
        {chips.map((c) => (
          <Link key={c.key} href={c.href} className={`adm-chip ${c.active ? "is-active" : ""}`} aria-current={c.active ? "page" : undefined}>
            {c.label}
            <span className="adm-chip__count">{c.count}</span>
          </Link>
        ))}
      </nav>

      <section className="adm-panel adm-panel--flush">
        {items.length === 0 ? (
          <div className="grid justify-items-center gap-3 px-5 py-12 text-center">
            <p className="adm-muted">{q || stock ? "No products match these filters." : "No products yet."}</p>
            {(q || stock) && (
              <Link href="/admin/products" className="adm-link">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <ProductsList products={items} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
              <p className="adm-muted text-[0.75rem]">
                Showing {from}–{to} of {total}
              </p>
              <Pagination href={(n) => productsHref({ q, stock, page: n })} page={page} totalPages={totalPages} className="adm-pager" />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid gap-5 lg:gap-6" aria-busy="true">
      <div className="adm-skeleton h-12 w-48" />
      <div className="adm-skeleton h-9 w-full max-w-xl" />
      <div className="adm-skeleton h-96" />
    </div>
  );
}
