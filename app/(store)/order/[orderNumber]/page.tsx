import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { isValidOrderToken } from "@/lib/order-link";

export const metadata: Metadata = {
  title: "Order Confirmed — Neythra",
  robots: { index: false },
};

// Every order is different — no cache, read from the database at request time. params inside Suspense (Cache Components rule).
export default function OrderPage({ params, searchParams }: PageProps<"/order/[orderNumber]">) {
  return (
    <div className="bg-ivory">
      <div className="page-shell py-12 lg:py-16">
        <Suspense fallback={<div className="min-h-[50vh]" aria-busy="true" />}>
          <OrderDetail params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

// The details (address, phone, email) are shown only with the secret token from the checkout redirect / email link.
async function OrderDetail({ params, searchParams }: Pick<PageProps<"/order/[orderNumber]">, "params" | "searchParams">) {
  const [{ orderNumber }, sp] = await Promise.all([params, searchParams]);
  const token = typeof sp.t === "string" ? sp.t : undefined;
  const order = await db.order.findUnique({
    where: { orderNumber: decodeURIComponent(orderNumber) },
    include: { items: true },
  });
  if (!order) notFound();
  if (!isValidOrderToken(token, order.accessToken)) return <PrivateOrder orderNumber={order.orderNumber} />;

  const placed = order.createdAt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return (
    <>
      {/* ---------- Success header ---------- */}
      <header className="flex flex-col items-center border-b-2 border-rule pb-10 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-sage text-slate" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5 9-10" />
          </svg>
        </span>
        <p className="mt-5 text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ Order Confirmed ]</p>
        <h1 className="mt-3 text-[clamp(2.25rem,5vw,3.75rem)] font-semibold uppercase leading-none text-ink">
          Thank you, {order.customerName.split(" ")[0]}.
        </h1>
        <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-taupe-dark">
          Your order is confirmed and will be dispatched within 3–5 working days. A confirmation has been sent to{" "}
          <strong className="text-ink">{order.email}</strong>.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-x-10 gap-y-4 text-left sm:grid-cols-4">
          {[
            ["Order No.", order.orderNumber],
            ["Placed", placed],
            ["Payment", "Cash on Delivery"],
            ["Total", formatINR(order.total)],
          ].map(([k, val]) => (
            <div key={k}>
              <dt className="text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-taupe">{k}</dt>
              <dd className="mt-1 text-[0.875rem] font-semibold text-ink [font-variant-numeric:lining-nums]">{val}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        {/* ---------- Items ---------- */}
        <section>
          <h2 className="border-b-2 border-rule pb-3 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-ink">
            Items ({order.items.reduce((n, i) => n + i.qty, 0)})
          </h2>
          <ul className="divide-y divide-rule">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-4">
                <span className="relative aspect-4/5 w-16 shrink-0 overflow-hidden border border-rule bg-paper">
                  {i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-cover object-top" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-[1.1rem] font-semibold text-ink">{i.name}</span>
                  <span className="text-[0.625rem] uppercase tracking-[0.12em] text-taupe">
                    Size: {i.size} · Qty: {i.qty} · {formatINR(i.unitPrice)} each
                  </span>
                </span>
                <span className="font-serif text-[1.1rem] font-semibold text-ink [font-variant-numeric:lining-nums]">
                  {formatINR(i.unitPrice * i.qty)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Address + totals ---------- */}
        <aside className="bag__summary self-start">
          <p className="bag__summary-title">Delivering To</p>
          <address className="py-4 text-[0.875rem] not-italic leading-relaxed text-taupe-dark">
            <strong className="text-ink">{order.customerName}</strong>
            <br />
            {order.address1}
            {order.address2 && (
              <>
                <br />
                {order.address2}
              </>
            )}
            <br />
            {order.city}, {order.state} — {order.pincode}
            <br />
            {order.phone}
          </address>
          <dl className="bag__sum">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{order.shipping === 0 ? "Complimentary" : formatINR(order.shipping)}</dd>
            </div>
            <div className="bag__total">
              <dt>Pay on Delivery</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-12 flex flex-col items-center gap-5">
        <Link href="/products" className="co-btn px-10">
          Continue Shopping
        </Link>
        {/* prefills the order number only — the customer still enters their email to see the status */}
        <Link
          href={`/orders?order=${encodeURIComponent(order.orderNumber)}`}
          className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ink hover:text-rose"
        >
          Track this order →
        </Link>
      </div>
    </>
  );
}

// Shown for a link without (or with a wrong) token — no customer details, just a way to look the order up
function PrivateOrder({ orderNumber }: { orderNumber: string }) {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center py-10 text-center">
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ Order ]</p>
      <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-semibold uppercase leading-none text-ink">This link is private</h1>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-taupe-dark">
        To keep your details safe, order details open only from the link in your confirmation email. You can also check your
        order with its number and the email you used.
      </p>
      <Link href={`/orders?order=${encodeURIComponent(orderNumber)}`} className="co-btn mt-8 px-10">
        Track your order
      </Link>
    </section>
  );
}
