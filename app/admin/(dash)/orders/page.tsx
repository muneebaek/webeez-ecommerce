import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LiveSearch from "@/components/admin/LiveSearch";
import OrdersList from "@/components/admin/OrdersList";
import Pagination from "@/components/catalog/Pagination";
import { ORDER_STATUSES, ORDERS_PAGE_SIZE, ordersHref, parseOrderFilters, STATUS_LABEL } from "@/lib/admin-orders";
import { requireAdmin } from "@/lib/auth/admin";
import { getOrders } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Orders" };

// The page shell renders instantly; everything that reads cookies, the URL or the DB streams in via Suspense
// (Cache Components rule — uncached data must sit inside a Suspense boundary of this route).
export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersView searchParams={searchParams} />
    </Suspense>
  );
}

// Live DB list. requireAdmin() first (security check), then read ?q / ?status / ?page and query.
async function OrdersView({ searchParams }: Pick<PageProps<"/admin/orders">, "searchParams">) {
  await requireAdmin();
  const filters = parseOrderFilters(await searchParams);
  const { q, status } = filters;
  const { items, total, page, totalPages, counts, all } = await getOrders(filters);

  const chips = [
    { key: "all", label: "All", count: all, href: ordersHref({ q }), active: !status },
    ...ORDER_STATUSES.map((s) => ({
      key: s,
      label: STATUS_LABEL[s],
      count: counts[s],
      href: ordersHref({ q, status: s }), // changing the filter resets to page 1
      active: status === s,
    })),
  ];
  const from = total === 0 ? 0 : (page - 1) * ORDERS_PAGE_SIZE + 1;
  const to = Math.min(page * ORDERS_PAGE_SIZE, total);

  return (
    <div className="grid gap-5 lg:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="adm-hello">Orders</h1>
          <p className="adm-muted mt-1">
            {q ? `${all} result${all === 1 ? "" : "s"} for “${q}”` : `${all} order${all === 1 ? "" : "s"} in total`}
          </p>
        </div>
        <LiveSearch
          path="/admin/orders"
          initial={q}
          keep={{ status: status?.toLowerCase() }}
          placeholder="Search orders, customers…"
          className="w-full sm:w-72"
        />
      </header>

      {/* status filter — every chip is a URL that keeps the search (scrolls sideways on mobile) */}
      <nav aria-label="Filter by status" className="adm-chips">
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
            <p className="adm-muted">
              {q || status ? "No orders match these filters." : "No orders yet. Orders placed on the store appear here."}
            </p>
            {(q || status) && (
              <Link href="/admin/orders" className="adm-link">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <OrdersList orders={items} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
              <p className="adm-muted text-[0.75rem]">
                Showing {from}–{to} of {total}
              </p>
              <Pagination
                href={(n) => ordersHref({ q, status, page: n })}
                page={page}
                totalPages={totalPages}
                className="adm-pager"
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="grid gap-5 lg:gap-6" aria-busy="true">
      <div className="adm-skeleton h-12 w-48" />
      <div className="adm-skeleton h-9 w-full max-w-xl" />
      <div className="adm-skeleton h-96" />
    </div>
  );
}
