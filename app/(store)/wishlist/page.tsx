import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import WishlistView from "@/components/wishlist/WishlistView";
import { getAllProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Wishlist — Neythra",
};

// Shell renders on the server; saved ids live in browser localStorage, so the content is a client component
export default async function WishlistPage() {
  const products = await getAllProducts(); // cached DB read

  return (
    <div className="bg-ivory">
      <div className="page-shell py-12 lg:py-16">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />
        <header className="mb-8 mt-6 lg:mb-10">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-semibold uppercase leading-none text-ink">
            Saved Pieces.
          </h1>
        </header>
        <WishlistView products={products} />
      </div>
    </div>
  );
}
