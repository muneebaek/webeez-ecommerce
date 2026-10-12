import ProductCard from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/data/products";
import { pickForSection } from "@/lib/home-sections";

export default async function NewArrivals() {
  // first product = flagship (large card), the other 2 normal
  const [flagship, ...rest] = pickForSection(await getAllProducts(), "new-arrivals", 3); // newest = the large card

  return (
    <section className="bg-paper py-14 lg:py-20">
      <div className="page-shell">
        {/* ---------- Heading row (same pattern as Trending) ---------- */}
        <header className="grid gap-5 border-b-2 border-rule pb-8 lg:grid-cols-[1fr_24rem] lg:items-end lg:gap-14">
          <div>
            <p className="text-[0.5625rem] font-medium uppercase tracking-[0.25em] text-taupe-dark lg:text-[0.625rem]">
              [ Archive Intake / March 2026 ]
            </p>
            <h2 className="mt-3 text-[clamp(2.5rem,4.4vw,3.5rem)] font-semibold leading-none tracking-[-0.01em] uppercase text-ink">
              New Arrivals
            </h2>
          </div>
          <p className="max-w-[24rem] text-[0.9375rem] leading-relaxed text-taupe-dark">
            Four asymmetrical entries exploring folded geometry and natural earth
            pigments.
          </p>
        </header>

        {/* ---------- Asymmetric grid: 1 large + 2 small, top-aligned ---------- */}
        <div className="mt-10 grid grid-cols-2 items-start gap-3 sm:gap-5 lg:mt-12 lg:grid-cols-[2.1fr_1fr_1fr] lg:gap-6">
          {flagship && (
            <div className="col-span-2 lg:col-span-1">
              <ProductCard product={flagship} variant="feature" />
            </div>
          )}
          {rest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
