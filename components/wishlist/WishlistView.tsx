"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/products";
import { useCart } from "@/store/cart";
import { useCartUi } from "@/store/cart-ui";
import { useHydrated } from "@/store/use-hydrated";
import { useWishlist } from "@/store/wishlist";

// Wishlist-il ids mathram save cheyyunnu → product details server page-il ninnu (database) prop aayi
export default function WishlistView({ products }: { products: Product[] }) {
  const hydrated = useHydrated();
  const ids = useWishlist((s) => s.ids);
  const clearAll = useWishlist((s) => s.clear);
  const add = useCart((s) => s.add);
  const openCart = useCartUi((s) => s.openCart);

  // saved order nilanirthaan ids-il ninnu map; delete aaya product undenkil skip
  const items = hydrated
    ? ids.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined)
    : [];
  const inStock = items.filter((p) => p.stock > 0);

  // ella in-stock pieces-um (aadyathe size) bag-il; wishlist-il ninnu maattunnilla
  const addAllToBag = () => {
    inStock.forEach((p) =>
      add({
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image: p.images[0],
        size: p.sizes[0] ?? "One Size",
        price: p.price,
      }),
    );
    openCart();
  };

  if (!hydrated) return <div className="min-h-[40vh]" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-rose" aria-hidden="true">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <p className="mt-5 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold uppercase leading-none text-ink">
          Nothing saved yet.
        </p>
        <p className="mt-4 text-[0.9375rem] text-taupe-dark">
          Tap the heart on any piece to keep it here for later.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex min-h-12 items-center bg-slate px-8 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-rose"
        >
          Explore the Collection
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ---------- Actions row ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-rule pb-4">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-taupe-dark">
          {items.length} Saved {items.length === 1 ? "Piece" : "Pieces"}
        </p>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={clearAll}
            className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-taupe-dark transition-colors hover:text-rose"
          >
            Clear All
          </button>
          {inStock.length > 0 && (
            <button
              type="button"
              onClick={addAllToBag}
              className="inline-flex min-h-10 items-center bg-rose px-5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-rose-deep"
            >
              Add All to Bag
            </button>
          )}
        </div>
      </div>

      {/* ---------- Grid — ♡ click cheythaal card ivide ninnu pokum ---------- */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
