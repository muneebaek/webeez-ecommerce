"use client";

import Link from "next/link";
import { formatINR } from "@/lib/format";
import {
  FREE_SHIPPING_MIN,
  cartCount,
  cartSubtotal,
  shippingFor,
  useCart,
} from "@/store/cart";
import { useHydrated } from "@/store/use-hydrated";
import CartLine from "./CartLine";

// /cart page — items on the left, order summary on the right (desktop); stacked on mobile
export default function CartView() {
  const hydrated = useHydrated();
  const storeItems = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const items = hydrated ? storeItems : [];
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_MIN - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100);

  // small placeholder until localStorage loads (avoids flashing the empty state)
  if (!hydrated) {
    return <div className="bag__loading" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="bag__empty">
        <p className="font-serif text-[clamp(2rem,4vw,3rem)] font-semibold uppercase leading-none text-ink">
          Your bag is empty.
        </p>
        <p className="mt-4 text-[0.9375rem] text-taupe-dark">
          Pieces you add will be held here until checkout.
        </p>
        <Link href="/" className="bag__btn bag__btn--solid mt-8">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-14">
      {/* ---------- Items ---------- */}
      <section aria-label="Items in your bag">
        <div className="flex items-center justify-between border-b-2 border-rule pb-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-taupe-dark">
          <span>
            {count} {count === 1 ? "Piece" : "Pieces"}
          </span>
          <button type="button" onClick={clear} className="uppercase tracking-[0.2em] hover:text-rose">
            Clear Bag
          </button>
        </div>
        <ul>
          {items.map((item) => (
            <CartLine key={item.key} item={item} size="lg" />
          ))}
        </ul>
        <Link href="/" className="bag__back group mt-6">
          <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
          Continue Shopping
        </Link>
      </section>

      {/* ---------- Summary (sticky on desktop) ---------- */}
      <aside className="bag__summary lg:sticky lg:top-32">
        <p className="bag__summary-title">Order Summary</p>

        <div className="bag__ship">
          <p>
            {remaining > 0 ? (
              <>
                Add <strong>{formatINR(remaining)}</strong> more for complimentary shipping
              </>
            ) : (
              <>Complimentary shipping unlocked</>
            )}
          </p>
          <div className="bag__bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <dl className="bag__sum">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatINR(subtotal)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{shipping === 0 ? "Complimentary" : formatINR(shipping)}</dd>
          </div>
          <div className="bag__total">
            <dt>Total</dt>
            <dd>{formatINR(subtotal + shipping)}</dd>
          </div>
        </dl>

        <Link href="/checkout" className="bag__btn bag__btn--rose mt-6 w-full">
          Proceed to Checkout <span aria-hidden="true">→</span>
        </Link>

        <ul className="bag__notes">
          <li>Cash on delivery across India</li>
          <li>Dispatched within 3–5 working days</li>
          <li>Easy 14-day returns</li>
        </ul>
      </aside>
    </div>
  );
}
