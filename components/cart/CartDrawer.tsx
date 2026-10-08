"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import {
  FREE_SHIPPING_MIN,
  MAX_QTY,
  cartCount,
  cartSubtotal,
  shippingFor,
  useCart,
} from "@/store/cart";
import { useCartUi } from "@/store/cart-ui";
import { useHydrated } from "@/store/use-hydrated";

export default function CartDrawer() {
  const open = useCartUi((s) => s.open);
  const closeCart = useCartUi((s) => s.closeCart);
  const hydrated = useHydrated();
  const storeItems = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const closeRef = useRef<HTMLButtonElement>(null);

  const items = hydrated ? storeItems : [];
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_MIN - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100);

  // open aayirikkumbol: scroll lock + Esc close + close button focus (mobile drawer-ile athe logic)
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeCart]);

  return (
    <div className={`cart-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="cart-drawer__overlay" onClick={closeCart} />

      <aside className="cart-drawer__panel" role="dialog" aria-modal="true" aria-label="Shopping bag">
        {/* ---------- Head ---------- */}
        <div className="cart-drawer__head">
          <p className="cart-drawer__title">
            Your Bag <span>[{String(count).padStart(2, "0")}]</span>
          </p>
          <button
            ref={closeRef}
            type="button"
            className="cart-drawer__close"
            aria-label="Close bag"
            onClick={closeCart}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          /* ---------- Empty state ---------- */
          <div className="cart-drawer__empty">
            <p className="font-serif text-[1.75rem] font-semibold uppercase leading-none text-ink">
              Your bag is empty.
            </p>
            <p className="mt-3 text-[0.8125rem] text-taupe-dark">
              Pieces you add will be held here.
            </p>
            <Link href="/" onClick={closeCart} className="cart-drawer__btn cart-drawer__btn--solid mt-8">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* ---------- Free shipping progress ---------- */}
            <div className="cart-drawer__ship">
              <p>
                {remaining > 0 ? (
                  <>
                    <strong>{formatINR(remaining)}</strong> away from complimentary shipping
                  </>
                ) : (
                  <>Complimentary shipping unlocked</>
                )}
              </p>
              <div className="cart-drawer__bar" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* ---------- Items ---------- */}
            <ul className="cart-drawer__items">
              {items.map((item) => (
                <li key={item.key} className="cart-line">
                  <Link href={`/products/${item.slug}`} onClick={closeCart} className="cart-line__media">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover object-top" />
                  </Link>

                  <div className="cart-line__info">
                    <div className="flex items-start justify-between gap-3">
                      <p className="cart-line__name">{item.name}</p>
                      <p className="cart-line__price">{formatINR(item.price * item.qty)}</p>
                    </div>
                    <p className="cart-line__meta">Size: {item.size}</p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* qty stepper — 1 to MAX_QTY */}
                      <div className="cart-line__qty" role="group" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={item.qty <= 1}
                          onClick={() => setQty(item.key, item.qty - 1)}
                        >
                          −
                        </button>
                        <span aria-live="polite">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={item.qty >= MAX_QTY}
                          onClick={() => setQty(item.key, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button type="button" className="cart-line__remove" onClick={() => remove(item.key)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* ---------- Summary + actions ---------- */}
            <div className="cart-drawer__foot">
              <dl className="cart-drawer__sum">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatINR(subtotal)}</dd>
                </div>
                <div>
                  <dt>Shipping</dt>
                  <dd>{shipping === 0 ? "Complimentary" : formatINR(shipping)}</dd>
                </div>
                <div className="cart-drawer__total">
                  <dt>Total</dt>
                  <dd>{formatINR(subtotal + shipping)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-[0.625rem] uppercase tracking-[0.12em] text-taupe">
                Cash on delivery available
              </p>
              <div className="mt-4 grid gap-2">
                <Link href="/checkout" onClick={closeCart} className="cart-drawer__btn cart-drawer__btn--rose">
                  Checkout <span aria-hidden="true">→</span>
                </Link>
                <Link href="/cart" onClick={closeCart} className="cart-drawer__btn cart-drawer__btn--outline">
                  View Bag
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
