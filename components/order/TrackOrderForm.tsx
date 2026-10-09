"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackOrder, type TrackedOrder, type TrackState } from "@/lib/actions/track-order";
import { formatINR } from "@/lib/format";

const STEPS = [
  { key: "placed", label: "Placed", note: "We've received your order." },
  { key: "confirmed", label: "Confirmed", note: "Your pieces are being prepared." },
  { key: "shipped", label: "Shipped", note: "On its way with our courier." },
  { key: "delivered", label: "Delivered", note: "Delivered — enjoy wearing it." },
] as const;

// how far along the timeline each status is (Pending = placed, not confirmed yet)
const REACHED: Record<Exclude<TrackedOrder["status"], "CANCELLED">, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

// Order lookup form + result. The order number can be prefilled from ?order= (link on the confirmation page).
export default function TrackOrderForm() {
  const prefill = useSearchParams().get("order") ?? "";
  const [state, action, pending] = useActionState(trackOrder, {} as TrackState);
  const err = state.fieldErrors ?? {};

  return (
    <div className="grid gap-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-14">
      <form action={action} className="track-form" noValidate>
        <div className="co-field">
          <label htmlFor="orderNumber">Order number</label>
          <input
            id="orderNumber"
            name="orderNumber"
            placeholder="NYT-260001"
            defaultValue={state.values?.orderNumber ?? prefill}
            autoComplete="off"
            aria-invalid={!!err.orderNumber}
            aria-describedby={err.orderNumber ? "orderNumber-error" : undefined}
          />
          {err.orderNumber && (
            <p id="orderNumber-error" className="co-field__error">
              {err.orderNumber}
            </p>
          )}
        </div>
        <div className="co-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={state.values?.email ?? ""}
            autoComplete="email"
            aria-invalid={!!err.email}
            aria-describedby={err.email ? "email-error" : undefined}
          />
          {err.email && (
            <p id="email-error" className="co-field__error">
              {err.email}
            </p>
          )}
        </div>
        <button type="submit" disabled={pending} className="co-btn">
          {pending ? "Looking up…" : "Track order"}
        </button>
        <p className="text-[0.75rem] leading-relaxed text-taupe">Your order number is in the confirmation email we sent you.</p>
        {state.error && (
          <p role="alert" className="track-form__error">
            {state.error}
          </p>
        )}
      </form>

      <div aria-live="polite">{state.order ? <OrderResult order={state.order} /> : <EmptyResult />}</div>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="track-empty">
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ Status ]</p>
      <p className="mt-3 text-[0.9375rem] text-taupe-dark">Enter your order number and email to see where your order is.</p>
    </div>
  );
}

function OrderResult({ order }: { order: TrackedOrder }) {
  const placed = new Date(order.placedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
  const cancelled = order.status === "CANCELLED";
  const reached = order.status === "CANCELLED" ? -1 : REACHED[order.status];
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);

  return (
    <section className="track-result">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-rule pb-5">
        <div>
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ Order ]</p>
          <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.25rem)] font-semibold uppercase leading-none text-ink">{order.orderNumber}</h2>
        </div>
        <p className="text-[0.8125rem] text-taupe-dark">
          Placed {placed} · Delivering to {order.city}
        </p>
      </header>

      {/* ---------- Status ---------- */}
      {cancelled ? (
        <p className="track-cancelled">This order was cancelled. If you didn&apos;t ask for this, reply to your confirmation email and we&apos;ll help.</p>
      ) : (
        <ol className="track-steps">
          {STEPS.map((s, i) => (
            <li key={s.key} className={`track-step ${i <= reached ? "is-done" : ""} ${i === reached ? "is-current" : ""}`}>
              <span className="track-step__dot" aria-hidden="true" />
              <span className="track-step__label">{s.label}</span>
              {i === reached && <span className="track-step__note">{s.note}</span>}
              <span className="sr-only">{i <= reached ? "(done)" : "(upcoming)"}</span>
            </li>
          ))}
        </ol>
      )}

      {/* ---------- Items ---------- */}
      <ul className="grid gap-4 border-t-2 border-rule pt-5">
        {order.items.map((it, i) => (
          <li key={`${it.name}-${it.size}-${i}`} className="flex items-center gap-4">
            <span className="relative aspect-4/5 w-14 shrink-0 overflow-hidden bg-paper">
              <Image src={it.image} alt="" fill sizes="56px" className="object-cover object-top" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-serif text-[1.15rem] font-semibold text-ink">{it.name}</span>
              <span className="text-[0.75rem] text-taupe">
                Size {it.size} · Qty {it.qty}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="flex justify-between border-t-2 border-rule pt-4 text-[0.875rem] text-ink">
        <span>
          {itemCount} item{itemCount === 1 ? "" : "s"} · Cash on Delivery
        </span>
        <span className="font-semibold [font-variant-numeric:lining-nums]">{formatINR(order.total)}</span>
      </p>
      <Link href="/help/shipping" className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ink hover:text-rose">
        Shipping times & help →
      </Link>
    </section>
  );
}
