import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/data/products";
import { pickForSection } from "@/lib/home-sections";

export default async function CurrentPieces() {
  // always exactly 4 — fits one row; the rest via "Browse All"
  const items = pickForSection(await getAllProducts(), "current", 4);

  return (
    <section className="bg-paper py-14 lg:py-20">
      <div className="page-shell flex flex-col gap-10 lg:flex-row lg:gap-16">
        {/* ---------- Left column: intro + curator note + browse ---------- */}
        <aside className="flex flex-col lg:w-74 lg:shrink-0 lg:border-r-2 lg:border-rule lg:pr-10">
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.25em] text-rose">
            [ Index 04 ]
          </p>
          <h2 className="mt-3 text-[clamp(2.75rem,4.4vw,4rem)] leading-[0.9] uppercase text-ink">
            Current
            <br />
            Pieces.
          </h2>
          <p className="mt-6 max-w-72 text-[0.9375rem] leading-relaxed text-taupe-dark">
            Handpicked garments currently exiting the loom. Each numbered
            edition is cut from hand-spun warp and weft fibers.
          </p>

          <figure className="mt-8 border-2 border-rule bg-ivory p-4 lg:mt-10">
            <figcaption className="text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-rose">
              Curator Note
            </figcaption>
            <blockquote className="mt-2 text-[0.8125rem] leading-[1.55] text-taupe-dark">
              &ldquo;The Mineral Tunic pairs directly with the raw pleated
              palazzo for an uninterrupted silhouette from noon to gallery
              opening.The Mineral Tunic pairs directly with the raw pleated
              palazzo for an uninterrupted silhouette from noon to gallery
              opening.&rdquo;
            </blockquote>
          </figure>

          <Link
            href="/products"
            className="group mt-8 flex min-h-11 items-center justify-center gap-2 bg-slate text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-ivory transition-colors hover:bg-rose"
          >
            Browse All 24 Pieces
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </aside>

        {/* ---------- Right: product grid (ProductCard reusable) ---------- */}
        <div className="grid flex-1 grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4 xl:gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
