import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductEditForm from "@/components/admin/ProductEditForm";
import { stockState } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminProduct } from "@/lib/data/admin";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Edit product" };

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Shell renders instantly; the session check, params and DB read stream in via Suspense (Cache Components rule).
export default function AdminProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: Pick<PageProps<"/admin/products/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();

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
          {product.code} · {formatINR(product.price)} · Last updated {updated} ·{" "}
          <Link href={`/products/${product.slug}`} target="_blank" className="font-medium text-ink hover:text-rose">
            View on store ↗
          </Link>
        </p>
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ---------- Left: what the customer sees (read-only) ---------- */}
        <section className="adm-panel">
          <div className="adm-panel__head">
            <h2>Product</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-[11rem_minmax(0,1fr)]">
            <div className="adm-product__image w-28 sm:w-auto">
              {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="176px" className="object-cover object-top" />}
            </div>
            <dl className="adm-info">
              <div>
                <dt>Name</dt>
                <dd>{product.name}</dd>
              </div>
              <div>
                <dt>Details</dt>
                <dd>{product.subtitle}</dd>
              </div>
              <div>
                <dt>Fabric</dt>
                <dd>{product.fabric}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{capitalize(product.category)}</dd>
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
                        {c.replace(/-/g, " ")}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        {/* ---------- Right: editable price + stock — first on mobile, sticky on desktop ---------- */}
        <div className="order-first xl:order-none xl:sticky xl:top-5">
          <ProductEditForm id={product.id} price={product.price} stock={product.stock} />
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-5 lg:gap-6" aria-busy="true">
      <div className="adm-skeleton h-20 w-72" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="adm-skeleton h-80" />
        <div className="adm-skeleton h-80" />
      </div>
    </div>
  );
}
