"use client";

import { useActionState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { placeOrder, type CheckoutState } from "@/lib/actions/order";
import { formatINR } from "@/lib/format";
import { INDIAN_STATES } from "@/lib/validators";
import { cartCount, cartSubtotal, shippingFor, useCart } from "@/store/cart";
import { useHydrated } from "@/store/use-hydrated";

const initial: CheckoutState = { ok: false };

export default function CheckoutForm() {
  const hydrated = useHydrated();
  const storeItems = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  // useActionState: form submit → server action → result (errors / orderNumber) in state
  const [state, formAction, pending] = useActionState(placeOrder, initial);

  const items = hydrated ? storeItems : [];
  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);

  // order success → clear the cart, go to the confirmation page
  useEffect(() => {
    if (state.ok && state.orderUrl) {
      clear();
      router.replace(state.orderUrl);
    }
  }, [state, clear, router]);

  if (!hydrated) return <div className="min-h-[50vh]" aria-busy="true" />;

  if (items.length === 0 && !state.ok) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <p className="font-serif text-[clamp(2rem,4vw,3rem)] font-semibold uppercase leading-none text-ink">
          Your bag is empty.
        </p>
        <p className="mt-4 text-[0.9375rem] text-taupe-dark">Add a few pieces before checking out.</p>
        <Link href="/products" className="co-btn mt-8 px-8">
          Explore the Collection
        </Link>
      </div>
    );
  }

  const v = state.values ?? {};
  const err = state.fieldErrors ?? {};
  // send only id + size + qty — the server reads prices from the DB
  const itemsPayload = JSON.stringify(items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })));

  return (
    <form
      action={formAction}
      noValidate
      // keep form values after an error — remount when values change
      key={JSON.stringify(v)}
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-14"
    >
      <input type="hidden" name="items" value={itemsPayload} />

      {/* ---------- Left: details ---------- */}
      <div className="co">
        {state.message && !state.ok && (
          <p className="co__alert" role="alert">
            {state.message}
          </p>
        )}

        <fieldset className="co__section">
          <legend className="co__legend">
            <span>01</span> Contact
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="customerName" label="Full name" autoComplete="name" value={v.customerName} error={err.customerName} className="sm:col-span-2" />
            <Field name="email" label="Email" type="email" autoComplete="email" value={v.email} error={err.email} hint="Order confirmation will be sent here" />
            <Field name="phone" label="Mobile number" type="tel" inputMode="numeric" autoComplete="tel-national" value={v.phone} error={err.phone} hint="For delivery updates" />
          </div>
        </fieldset>

        <fieldset className="co__section">
          <legend className="co__legend">
            <span>02</span> Shipping Address
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="address1" label="House / flat, street" autoComplete="address-line1" value={v.address1} error={err.address1} className="sm:col-span-2" />
            <Field name="address2" label="Landmark / area (optional)" autoComplete="address-line2" value={v.address2} error={err.address2} className="sm:col-span-2" />
            <Field name="city" label="City" autoComplete="address-level2" value={v.city} error={err.city} />
            <Field name="pincode" label="Pincode" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={v.pincode} error={err.pincode} />
            <div className="co-field sm:col-span-2">
              <label htmlFor="state">State</label>
              <select id="state" name="state" defaultValue={v.state ?? ""} aria-invalid={!!err.state} autoComplete="address-level1">
                <option value="" disabled>
                  Select state
                </option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {err.state && <p className="co-field__error">{err.state}</p>}
            </div>
            <div className="co-field sm:col-span-2">
              <label htmlFor="notes">Delivery notes (optional)</label>
              <textarea id="notes" name="notes" rows={3} defaultValue={v.notes} maxLength={300} />
            </div>
          </div>
        </fieldset>

        <fieldset className="co__section">
          <legend className="co__legend">
            <span>03</span> Payment
          </legend>
          {/* COD only — shown as selected */}
          <label className="co__pay">
            <input type="radio" name="payment" value="COD" defaultChecked readOnly />
            <span>
              <strong>Cash on Delivery</strong>
              <small>Pay in cash or UPI when your order arrives.</small>
            </span>
          </label>
        </fieldset>
      </div>

      {/* ---------- Right: summary ---------- */}
      <aside className="bag__summary lg:sticky lg:top-32">
        <p className="bag__summary-title">Order Summary ({cartCount(items)})</p>
        <ul className="co-items">
          {items.map((i) => (
            <li key={i.key}>
              <span className="co-items__img">
                <Image src={i.image} alt="" fill sizes="56px" className="object-cover object-top" />
                <span className="co-items__qty">{i.qty}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif text-[1rem] font-semibold text-ink">{i.name}</span>
                <span className="text-[0.625rem] uppercase tracking-[0.12em] text-taupe">Size: {i.size}</span>
              </span>
              <span className="font-serif text-[1rem] font-semibold text-ink [font-variant-numeric:lining-nums]">
                {formatINR(i.price * i.qty)}
              </span>
            </li>
          ))}
        </ul>
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

        <button type="submit" disabled={pending} className="co-btn mt-6 w-full">
          {pending ? "Placing Order…" : `Place Order · ${formatINR(subtotal + shipping)}`}
        </button>
        <p className="mt-3 text-center text-[0.625rem] uppercase tracking-[0.12em] text-taupe">
          Pay on delivery · No card needed
        </p>
      </aside>
    </form>
  );
}

// ---------- A single input field (label + input + error) ----------
function Field({
  name,
  label,
  value,
  error,
  hint,
  className = "",
  ...rest
}: {
  name: string;
  label: string;
  value?: string;
  error?: string;
  hint?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`co-field ${className}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        defaultValue={value}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...rest}
      />
      {error ? (
        <p id={`${name}-error`} className="co-field__error">
          {error}
        </p>
      ) : (
        hint && <p className="co-field__hint">{hint}</p>
      )}
    </div>
  );
}
