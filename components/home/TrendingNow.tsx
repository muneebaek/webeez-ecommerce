import ProductCard from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/data/products";
import { pickForSection } from "@/lib/home-sections";

export default async function TrendingNow() {
  const items = pickForSection(await getAllProducts(), "trending", 4);

  return (
    <section className="border-t-2 border-rule bg-paper py-14 lg:py-20">
      <div className="page-shell">
        {/* ---------- Heading row (same layout as the Portals heading) ---------- */}
        <header className="grid gap-5 border-b-2 border-rule pb-8 lg:grid-cols-[1fr_24rem] lg:items-end lg:gap-14 lg:pb-8">
          <div>
            <p className="text-[0.5625rem] font-medium uppercase tracking-[0.25em] text-rose lg:text-[0.625rem]">
              [ 03 / Currently ]
            </p>
            <h2 className="mt-3 text-[clamp(2.5rem,4.4vw,3.5rem)] font-semibold leading-none tracking-[-0.01em] uppercase text-ink">
              Trending Now
            </h2>
          </div>
          <p className="max-w-[24rem] text-[0.9375rem] leading-relaxed text-taupe-dark">
            Pieces experiencing continuous requests across Mumbai, Bengaluru, London,
            and New York ateliers.
          </p>
        </header>

        {/* ---------- Product grid — ProductCard reuse ---------- */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-12 lg:grid-cols-4 lg:gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
