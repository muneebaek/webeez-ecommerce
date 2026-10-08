import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { getProductsByCollection } from "@/lib/data/products";

export default async function UnderPrice() {
  const items = (await getProductsByCollection("under-2999")).slice(0, 4);

  return (
    <section className="border-y-2 border-rule bg-sage py-14 lg:py-20">
      <div className="page-shell">
        {/* ---------- Heading row ---------- */}
        <header className="flex flex-col gap-6 border-b-2 border-[#9fafac] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.25em] text-slate lg:text-[0.625rem]">
              [ Democratic Access ]
            </p>
            <h2 className="mt-3 text-[clamp(2.25rem,4.4vw,3.5rem)] font-semibold leading-none tracking-[-0.01em] uppercase text-ink [font-variant-numeric:lining-nums]">
              Everyday, Under ₹2,999.
            </h2>
            <p className="mt-3 font-serif text-[1.15rem] font-semibold uppercase text-[#28353a] lg:text-[1.4rem]">
              Easy on the wardrobe. Easy on the price.
            </p>
          </div>

          <Link
            href="/products?under=2999"
            className="group inline-flex items-center gap-2 self-start bg-[linear-gradient(currentColor,currentColor)] bg-size-[100%_1.5px] bg-bottom bg-no-repeat pb-1.5 text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-ink lg:self-auto lg:text-[0.625rem]"
          >
            View All Accessible Archives
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
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
