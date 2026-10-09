import { Suspense } from "react";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TrackOrderForm from "@/components/order/TrackOrderForm";

export const metadata: Metadata = {
  title: "Track an Order — Neythra",
  description: "Check the status of your Neythra order with your order number and email.",
  robots: { index: false },
};

// Static shell; the form reads ?order= (prefill) on the client, so it sits inside Suspense (Cache Components rule).
// The lookup itself runs in a server action — the email never goes into the URL.
export default function TrackOrderPage() {
  return (
    <div className="bg-ivory">
      <div className="page-shell py-12 lg:py-16">
        <Breadcrumbs items={[{ label: "Help", href: "/help/shipping" }, { label: "Track an Order" }]} />
        <header className="mb-10 mt-6 border-b-2 border-rule pb-6 lg:mb-12">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ Orders ]</p>
          <h1 className="mt-3 text-[clamp(2.5rem,5vw,4rem)] font-semibold uppercase leading-none text-ink">Track an Order.</h1>
        </header>
        <Suspense fallback={<div className="min-h-80" aria-busy="true" />}>
          <TrackOrderForm />
        </Suspense>
      </div>
    </div>
  );
}
