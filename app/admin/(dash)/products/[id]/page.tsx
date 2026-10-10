import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteProduct from "@/components/admin/DeleteProduct";
import DeleteReview from "@/components/admin/DeleteReview";
import Stars from "@/components/product/Stars";
import { CATEGORY_OPTIONS, COLLECTION_OPTIONS, stockState } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminProduct, getProductReviews } from "@/lib/data/admin";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Product" };

const categoryLabel = (c: string) => CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c;
const collectionLabel = (c: string) => COLLECTION_OPTIONS.find((o) => o.value === c)?.label ?? c.replace(/-/g, " ");

// Product details (read-only). Editing lives on /admin/products/[id]/edit.
// Shell renders instantly; the session check, params and DB read stream in via Suspense (Cache Components rule).
export default function AdminProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductDetail({ params, searchParams }: Pick<PageProps<"/admin/products/[id]">, "params" | "searchParams">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [product, reviews] = await Promise.all([getAdminProduct(id), getProductReviews(id)]);
  if (!product) notFound();
  const average = reviews.length ? Math.round((reviews.reduce((n, r) => n + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  // set by the product form after a successful save / create
  const notice = sp.created === "1" ? "Product created — it is live on the store now." : sp.saved === "1" ? "Saved — the store shows the changes now." : "";
  const stock = stockState(product.stock);
  const updated = product.updatedAt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="grid gap-5 lg:gap-6">
      {/* ---------- Header ---------- */}
      <header className="grid gap-3">
        <Link href="/admin/products" className="adm-link w-fit">
          ← Products
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="adm-hello">{product.name}</h1>
          <span className={`adm-stock is-${stock.tone}`}>{stock.label}</span>
        </div>
        <p className="adm-muted">
          {product.code} · {formatINR(product.price)} · Last updated {updated}
        </p>
      </header>

      {notice && (
        <p role="status" className="adm-msg is-ok">
          {notice}
        </p>
      )}

      {/* details + reviews on the left, delete on the right; on phones delete comes last */}
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ---------- Left: what the customer sees ---------- */}
        <section className="adm-panel">
          <div className="adm-panel__head">
            <h2>Product details</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-[12rem_minmax(0,1fr)]">
            <div className="adm-product__image w-32 sm:w-auto">
              {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="192px" className="object-cover object-top" />}
            </div>
            <dl className="adm-info">
              <div>
                <dt>Name</dt>
                <dd>{product.name}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt>Code</dt>
                  <dd>{product.code}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{categoryLabel(product.category)}</dd>
                </div>
              </div>
              <div>
                <dt>Details</dt>
                <dd>{product.subtitle}</dd>
              </div>
              <div>
                <dt>Fabric</dt>
                <dd>{product.fabric}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt>Price</dt>
                  <dd className="adm-price">{formatINR(product.price)}</dd>
                </div>
                <div>
                  <dt>Stock</dt>
                  <dd>{product.stock} pieces</dd>
                </div>
              </div>
              <div>
                <dt>Sizes</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => (
                    <span key={s} className="adm-tag">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
              {product.collections.length > 0 && (
                <div>
                  <dt>Collections</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {product.collections.map((c) => (
                      <span key={c} className="adm-tag">
                        {collectionLabel(c)}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              <div>
                <dt>Description</dt>
                <dd className="whitespace-pre-line leading-relaxed">{product.description}</dd>
              </div>
            </dl>
          </div>

          {/* actions under the details */}
          <div className="mt-6 flex flex-wrap gap-2.5 border-t border-dashed border-line pt-5">
            <Link href={`/admin/products/${product.id}/edit`} className="adm-btn adm-btn--primary adm-btn--pill justify-center px-6">
              Edit product
            </Link>
            <Link href={`/products/${product.slug}`} target="_blank" className="adm-btn adm-btn--pill justify-center px-6">
              View on store ↗
            </Link>
          </div>
        </section>

        {/* ---------- Reviews of this product (delete spam / abuse) ---------- */}
        <section className="adm-panel adm-panel--flush" aria-labelledby="reviews-title">
          <div className="adm-panel__head mb-0 px-5 pt-5 pb-4">
            <h2 id="reviews-title">Reviews ({reviews.length})</h2>
            {reviews.length > 0 && (
              <span className="flex items-center gap-2 text-[0.8125rem] text-ink">
                <Stars rating={average} size={14} />
                {average} average
              </span>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="adm-muted border-t border-line px-5 py-8 text-center">No reviews for this product yet.</p>
          ) : (
            <ul className="adm-reviews border-t border-line">
              {reviews.map((r) => (
                <li key={r.id} className="adm-review">
                  <div className="adm-review__top">
                    <Stars rating={r.rating} size={15} />
                    {r.verified ? <span className="adm-stock is-in">✓ Verified buyer</span> : <span className="adm-stock is-low">Unverified</span>}
                    <time dateTime={r.createdAt.toISOString()} className="adm-muted ml-auto text-[0.75rem]">
                      {r.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
                    </time>
                  </div>
                  <p className="adm-review__title">{r.title}</p>
                  <p className="adm-review__body">{r.body}</p>
                  <div className="adm-review__foot">
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
                    <DeleteReview id={r.id} title={r.title} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------- Delete — right column on desktop, last on phones ---------- */}
        <div className="xl:col-start-2 xl:row-start-1">
          <DeleteProduct id={product.id} name={product.name} />
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-5 lg:gap-6" aria-busy="true">
      <div className="adm-skeleton h-20 w-72" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="adm-skeleton h-96" />
        <div className="adm-skeleton h-48" />
      </div>
    </div>
  );
}
