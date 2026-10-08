import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Your Bag — Neythra",
};

// Page shell renders on the server; cart items live in browser localStorage, so CartView is a client component
export default function CartPage() {
  return (
    <div className="bg-ivory">
      <div className="page-shell py-12 lg:py-16">
        <Breadcrumbs items={[{ label: "Your Bag" }]} />
        <header className="mb-10 mt-6 border-b-2 border-rule pb-6 lg:mb-12">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-semibold uppercase leading-none text-ink">
            Shopping Bag.
          </h1>
        </header>
        <CartView />
      </div>
    </div>
  );
}
