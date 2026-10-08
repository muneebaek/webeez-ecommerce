import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Bag — Neythra",
};

// Page shell server-il; cart items browser localStorage-il aayathukondu CartView client component
export default function CartPage() {
  return (
    <div className="bg-ivory">
      <div className="page-shell py-12 lg:py-16">
        <header className="mb-10 border-b-2 border-rule pb-6 lg:mb-12">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">
            [ Your Bag ]
          </p>
          <h1 className="mt-3 text-[clamp(2.5rem,5vw,4rem)] font-semibold uppercase leading-none text-ink">
            Shopping Bag.
          </h1>
        </header>
        <CartView />
      </div>
    </div>
  );
}
