import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Checkout — Neythra",
  robots: { index: false }, // checkout Google-il venda
};

export default function CheckoutPage() {
  return (
    <div className="bg-ivory">
      <div className="page-shell py-12 lg:py-16">
        <Breadcrumbs items={[{ label: "Your Bag", href: "/cart" }, { label: "Checkout" }]} />
        <header className="mb-10 mt-6 border-b-2 border-rule pb-6 lg:mb-12">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-semibold uppercase leading-none text-ink">
            Checkout.
          </h1>
        </header>
        <CheckoutForm />
      </div>
    </div>
  );
}
