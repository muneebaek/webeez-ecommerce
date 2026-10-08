import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ProductCard from "@/components/product/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchase from "@/components/product/ProductPurchase";
import Stars from "@/components/product/Stars";
import { formatINR } from "@/lib/format";
import { getProductBySlug, getProductSlugs, getReviews, getSimilarProducts } from "@/lib/data/products";
import { averageRating } from "@/lib/reviews";

// Ella product pages-um build time-il static aayi undakkum (Cache Components-il ithu venam)
export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Not found — Neythra" };
  return {
    title: `${product.name} — Neythra`,
    description: product.description,
    openGraph: { images: [product.images[0]] },
  };
}

const CATEGORY_LABEL = { women: "Women", men: "Men", essentials: "Essentials" } as const;

// await params Suspense-inte ullil — ariyaatha slug-inu fallback shell prerender aakaan (Cache Components rule).
// generateStaticParams-il ulla 18 products build-il full static thanne.
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: Pick<PageProps<"/products/[slug]">, "params">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound(); // illaatha slug → styled 404

  const reviews = await getReviews(product.id);
  const rating = averageRating(reviews);
  const similar = await getSimilarProducts(product);
  const lowStock = product.stock > 0 && product.stock <= 5;
  const categoryLabel = CATEGORY_LABEL[product.category];

  return (
    <div className="bg-ivory">
      <div className="page-shell py-10 lg:py-14">
        <Breadcrumbs
          items={[
            { label: "Collections", href: "/products" },
            { label: categoryLabel, href: `/products?category=${product.category}` },
            { label: product.name },
          ]}
        />

        {/* ---------- Gallery | Info ---------- */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-taupe">
              <span className="text-rose">[ {product.code} ]</span>
              <span>{product.fabric}</span>
              {product.badge && <span className="text-ink">{product.badge.label}</span>}
            </p>

            <h1 className="mt-4 text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[1.02] text-ink">
              {product.name}
            </h1>
            <p className="mt-3 text-[0.875rem] text-taupe-dark">{product.subtitle}</p>

            <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-[0.75rem] text-taupe-dark hover:text-ink">
              <Stars rating={rating} />
              <span>
                {rating} · {reviews.length} reviews
              </span>
            </a>

            <div className="mt-6 flex items-baseline gap-4 border-y-2 border-rule py-5">
              <span className="font-serif text-[2rem] font-semibold leading-none text-ink [font-variant-numeric:lining-nums]">
                {formatINR(product.price)}
              </span>
              <span className="text-[0.625rem] uppercase tracking-[0.15em] text-taupe">Inclusive of all taxes</span>
              <span
                className={`ml-auto text-[0.625rem] font-semibold uppercase tracking-[0.15em] ${
                  product.stock === 0 || lowStock ? "text-rose" : "text-taupe-dark"
                }`}
              >
                {product.stock === 0 ? "Sold Out" : lowStock ? `Only ${product.stock} left` : "In Stock"}
              </span>
            </div>

            <div className="mt-7">
              <ProductPurchase
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: product.images[0],
                  price: product.price,
                  sizes: product.sizes,
                  stock: product.stock,
                }}
              />
            </div>

            <ul className="pdp-perks mt-7">
              <li>Cash on delivery available</li>
              <li>Complimentary shipping over ₹5,000</li>
              <li>Easy 14-day returns</li>
            </ul>

            {/* ---------- Accordion — native <details>, JS venda ---------- */}
            <div className="pdp-acc mt-8">
              <details open>
                <summary>Description</summary>
                <p>{product.description}</p>
              </details>
              <details>
                <summary>Fabric &amp; Care</summary>
                <p>
                  {product.fabric}. Hand-woven by artisan clusters; slight irregularities are part of the
                  handloom character. Gentle hand wash in cold water, dry in shade, warm iron on reverse.
                </p>
              </details>
              <details>
                <summary>Shipping &amp; Returns</summary>
                <p>
                  Dispatched within 3–5 working days across India with cash on delivery. Complimentary
                  shipping over ₹5,000, otherwise ₹150. Unworn pieces can be returned within 14 days.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* ---------- Reviews ---------- */}
        <section id="reviews" className="mt-20 scroll-mt-32 border-t-2 border-rule pt-12 lg:mt-24">
          <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
            <div>
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ Voices ]</p>
              <h2 className="mt-3 text-[clamp(2rem,3.5vw,2.75rem)] font-semibold uppercase leading-none text-ink">
                Reviews
              </h2>
              <div className="mt-6 flex items-end gap-3">
                <span className="font-serif text-[3.5rem] font-semibold leading-none text-ink [font-variant-numeric:lining-nums]">
                  {rating}
                </span>
                <div className="pb-2">
                  <Stars rating={rating} size={16} />
                  <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.12em] text-taupe">
                    Based on {reviews.length} reviews
                  </p>
                </div>
              </div>
            </div>

            <ul className="divide-y divide-rule border-y border-rule">
              {reviews.map((r) => (
                <li key={r.id} className="py-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars rating={r.rating} />
                    <time dateTime={r.date} className="text-[0.625rem] uppercase tracking-[0.15em] text-taupe">
                      {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </time>
                  </div>
                  <p className="mt-3 font-serif text-[1.25rem] font-semibold text-ink">{r.title}</p>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-taupe-dark">{r.body}</p>
                  <p className="mt-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink">
                    {r.name} <span className="text-taupe">· {r.city} · Verified Purchase</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Similar products ---------- */}
        <section className="mt-20 border-t-2 border-rule pt-12 lg:mt-24">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ You May Also Like ]</p>
          <h2 className="mt-3 text-[clamp(2rem,3.5vw,2.75rem)] font-semibold uppercase leading-none text-ink">
            Similar Pieces
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Load aakumbol kaanikkunna placeholder (gallery + info shape)
function ProductSkeleton() {
  return (
    <div className="bg-ivory">
      <div className="page-shell grid gap-10 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:py-14" aria-busy="true">
        <div className="catalog-skeleton aspect-4/5" />
        <div className="space-y-4 pt-10">
          <div className="catalog-skeleton h-4 w-1/3 aspect-auto" />
          <div className="catalog-skeleton h-12 w-3/4 aspect-auto" />
          <div className="catalog-skeleton h-10 w-1/2 aspect-auto" />
        </div>
      </div>
    </div>
  );
}
