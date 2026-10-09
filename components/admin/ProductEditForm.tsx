"use client";

import { useActionState } from "react";
import { updateProduct, type ProductActionState } from "@/lib/actions/admin-products";

// Price + stock editor. Saving runs a server action that validates, updates the DB and refreshes the store cache.
export default function ProductEditForm({ id, price, stock }: { id: string; price: number; stock: number }) {
  const [state, action, pending] = useActionState(updateProduct, {} as ProductActionState);
  const err = state.fieldErrors ?? {};
  // after an error show what was typed; after a save the page refresh brings the stored values
  const shownPrice = state.values?.price ?? String(price);
  const shownStock = state.values?.stock ?? String(stock);

  return (
    <form action={action} className="adm-panel grid gap-4" noValidate>
      <div className="adm-panel__head mb-0">
        <h2>Edit</h2>
      </div>
      <input type="hidden" name="id" value={id} />

      <div className="adm-field">
        <label htmlFor="price">Price (₹)</label>
        {/* key: remount when the shown value changes (React resets the form after every submit) */}
        <input
          key={`price-${shownPrice}-${price}`}
          id="price"
          name="price"
          type="number"
          inputMode="numeric"
          min={1}
          max={100000}
          step={1}
          defaultValue={shownPrice}
          required
          aria-invalid={!!err.price}
          aria-describedby={err.price ? "price-error" : undefined}
        />
        {err.price && (
          <span id="price-error" className="adm-field__error">
            {err.price}
          </span>
        )}
      </div>

      <div className="adm-field">
        <label htmlFor="stock">Stock (pieces)</label>
        <input
          key={`stock-${shownStock}-${stock}`}
          id="stock"
          name="stock"
          type="number"
          inputMode="numeric"
          min={0}
          max={9999}
          step={1}
          defaultValue={shownStock}
          required
          aria-invalid={!!err.stock}
          aria-describedby={err.stock ? "stock-error" : undefined}
        />
        {err.stock && (
          <span id="stock-error" className="adm-field__error">
            {err.stock}
          </span>
        )}
      </div>

      <button type="submit" disabled={pending} className="adm-btn adm-btn--primary adm-btn--pill justify-center">
        {pending ? "Saving…" : "Save changes"}
      </button>

      {state.message && (
        <p role="status" className={`adm-msg ${state.ok ? "is-ok" : "is-error"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
