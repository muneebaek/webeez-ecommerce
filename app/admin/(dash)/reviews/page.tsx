import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DeleteReview from "@/components/admin/DeleteReview";
import LiveSearch from "@/components/admin/LiveSearch";
import Pagination from "@/components/catalog/Pagination";
import Stars from "@/components/product/Stars";
import { parseReviewFilters, REVIEW_FILTER_LABEL, REVIEW_FILTERS, REVIEWS_PAGE_SIZE, reviewsHref } from "@/lib/admin-reviews";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminReviews } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Reviews" };

// Shell renders instantly; the session check, URL and DB read stream in via Suspense (Cache Components rule).
export default function AdminReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <ReviewsView searchParams={searchParams} />
    </Suspense>
  );
}

// Live DB list. requireAdmin() first, then read ?q / ?type / ?page and query.
async function ReviewsView({ searchParams }: Pick<PageProps<"/admin/reviews">, "searchParams">) {
  await requireAdmin();
  const filters = parseReviewFilters(await searchParams);
  const { q, type } = filters;
  const { items, total, page, totalPages, counts } = await getAdminReviews(filters);

  const chips = [
    { key: "all", label: "All", count: counts.all, href: reviewsHref({ q }), active: !type },
    ...REVIEW_FILTERS.map((t) => ({
      key: t,
      label: REVIEW_FILTER_LABEL[t],
      count: counts[t],
      href: reviewsHref({ q, type: t }), // changing the filter resets to page 1
      active: type === t,
    })),
  ];
  const from = total === 0 ? 0 : (page - 1) * REVIEWS_PAGE_SIZE + 1;
  const to = Math.min(page * REVIEWS_PAGE_SIZE, total);

  return (
    <div className="grid gap-5 lg:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="adm-hello">Reviews</h1>
          <p className="adm-muted mt-1">
            {q ? `${counts.all} result${counts.all === 1 ? "" : "s"} for “${q}”` : `${counts.all} reviews on the store`}
          </p>
        </div>
        <LiveSearch path="/admin/reviews" initial={q} keep={{ type }} placeholder="Search review, name, product…" className="w-full sm:w-80" />
      </header>

      {/* verified filter — every chip is a URL that keeps the search (scrolls sideways on mobile) */}
      <nav aria-label="Filter reviews" className="adm-chips">
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
            <p className="adm-muted">{q || type ? "No reviews match these filters." : "No reviews yet."}</p>
            {(q || type) && (
              <Link href="/admin/reviews" className="adm-link">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <ul className="adm-reviews">
              {items.map((r) => (
                <li key={r.id} className="adm-review">
                  <div className="adm-review__top">
                    <Stars rating={r.rating} size={15} />
                    {r.verified ? (
                      <span className="adm-stock is-in">✓ Verified buyer</span>
                    ) : (
                      <span className="adm-stock is-low">Unverified</span>
                    )}
                    <time dateTime={r.createdAt.toISOString()} className="adm-muted ml-auto text-[0.75rem]">
                      {r.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
                    </time>
                  </div>

                  <p className="adm-review__title">{r.title}</p>
                  <p className="adm-review__body">{r.body}</p>
                  <p className="adm-muted text-[0.75rem]">
                    <span className="font-semibold text-ink">{r.name}</span> · {r.city}
                    {r.orderNumber && r.orderId && (
                      <>
                        {" · "}
                        <Link href={`/admin/orders/${r.orderId}`} className="adm-review__order">
                          {r.orderNumber}
                        </Link>
                      </>
                    )}
                  </p>

                  <div className="adm-review__foot">
                    <Link href={`/admin/products/${r.product.id}`} className="adm-review__product">
                      <span className="adm-line__thumb adm-line__thumb--sm">
                        {r.product.images[0] && <Image src={r.product.images[0]} alt="" fill sizes="40px" className="object-cover object-top" />}
                      </span>
                      <span className="truncate">{r.product.name}</span>
                    </Link>
                    <DeleteReview id={r.id} title={r.title} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
              <p className="adm-muted text-[0.75rem]">
                Showing {from}–{to} of {total}
              </p>
              <Pagination href={(n) => reviewsHref({ q, type, page: n })} page={page} totalPages={totalPages} className="adm-pager" />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="grid gap-5 lg:gap-6" aria-busy="true">
      <div className="adm-skeleton h-12 w-48" />
      <div className="adm-skeleton h-9 w-full max-w-xl" />
      <div className="adm-skeleton h-96" />
    </div>
  );
}
