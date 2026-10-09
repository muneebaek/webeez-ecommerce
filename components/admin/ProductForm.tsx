"use client";

import { useActionState } from "react";
import { saveProduct, type ProductActionState } from "@/lib/actions/admin-products";
import PhotoPicker from "./PhotoPicker";
import { CATEGORY_OPTIONS, COLLECTION_OPTIONS, SIZE_OPTIONS, type ProductFormValues } from "@/lib/admin-products";

type Props = {
  id?: string; // set when editing; empty for a new product
  initial: ProductFormValues;
  imageOptions: string[];
  submitLabel?: string;
};

// Full product form (edit now, create later). Saving runs the saveProduct server action, which validates
// everything again on the server, writes the DB and refreshes the store cache.
export default function ProductForm({ id, initial, imageOptions, submitLabel = "Save changes" }: Props) {
  const [state, action, pending] = useActionState(saveProduct, {} as ProductActionState);
  const err = state.fieldErrors ?? {};
  // after an error show what was entered; after a save the page refresh brings the stored values
  const v = state.values ?? initial;
  // React resets a form after every submit — remounting the fields makes them show `v` again
  const fieldsKey = JSON.stringify(v);

  return (
    <form action={action} className="grid gap-4" noValidate>
      {id && <input type="hidden" name="id" value={id} />}

      <div key={fieldsKey} className="grid gap-4">
        {/* ---------- Basics ---------- */}
        <section className="adm-panel grid gap-4">
          <div className="adm-panel__head mb-0">
            <h2>Basics</h2>
          </div>
          <Field name="name" label="Name" error={err.name}>
            <input id="name" name="name" defaultValue={v.name} maxLength={80} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="code" label="Code" error={err.code} hint="Shown on the card, e.g. NO. 05">
              <input id="code" name="code" defaultValue={v.code} maxLength={20} />
            </Field>
            <Field name="category" label="Category" error={err.category}>
              <select id="category" name="category" defaultValue={v.category}>
                <option value="" disabled>
                  Choose…
                </option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {/* ---------- Details ---------- */}
        <section className="adm-panel grid gap-4">
          <div className="adm-panel__head mb-0">
            <h2>Details</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="subtitle" label="Details line" error={err.subtitle} hint="Colour / cut, e.g. Forest Green / Origami Tuck">
              <input id="subtitle" name="subtitle" defaultValue={v.subtitle} maxLength={120} />
            </Field>
            <Field name="fabric" label="Fabric" error={err.fabric}>
              <input id="fabric" name="fabric" defaultValue={v.fabric} maxLength={60} />
            </Field>
          </div>
          <Field name="description" label="Description" error={err.description}>
            <textarea id="description" name="description" defaultValue={v.description} rows={5} maxLength={2000} />
          </Field>
        </section>

        {/* ---------- Price, stock, sizes, collections ---------- */}
        <section className="adm-panel grid gap-4">
          <div className="adm-panel__head mb-0">
            <h2>Price &amp; stock</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="price" label="Price (₹)" error={err.price}>
              <input id="price" name="price" type="number" inputMode="numeric" min={1} max={100000} step={1} defaultValue={v.price} />
            </Field>
            <Field name="stock" label="Stock (pieces)" error={err.stock}>
              <input id="stock" name="stock" type="number" inputMode="numeric" min={0} max={9999} step={1} defaultValue={v.stock} />
            </Field>
          </div>

          <fieldset className="adm-field" aria-describedby={err.sizes ? "sizes-error" : undefined}>
            <legend className="adm-info__label">Sizes</legend>
            <div className="adm-checks">
              {SIZE_OPTIONS.map((s) => (
                <label key={s} className="adm-check">
                  <input type="checkbox" name="sizes" value={s} defaultChecked={v.sizes.includes(s)} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
            {err.sizes && (
              <span id="sizes-error" className="adm-field__error">
                {err.sizes}
              </span>
            )}
          </fieldset>

          <fieldset className="adm-field">
            <legend className="adm-info__label">Collections</legend>
            <div className="adm-checks">
              {COLLECTION_OPTIONS.map((c) => (
                <label key={c.value} className="adm-check">
                  <input type="checkbox" name="collections" value={c.value} defaultChecked={v.collections.includes(c.value)} />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* ---------- Photo ---------- */}
        <section className="adm-panel grid gap-3">
          <div className="adm-panel__head mb-0">
            <h2>Photo</h2>
          </div>
          <PhotoPicker initial={v.image} options={imageOptions} error={err.image} />
        </section>
      </div>

      {/* ---------- Save ---------- */}
      <div className="adm-form-bar">
        {state.message && (
          <p role="status" className={`adm-msg ${state.ok ? "is-ok" : "is-error"}`}>
            {state.message}
          </p>
        )}
        <button type="submit" disabled={pending} className="adm-btn adm-btn--primary adm-btn--pill justify-center sm:col-start-2">
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

// label + control + error/hint; the control's id must equal `name`
function Field({ name, label, error, hint, children }: { name: string; label: string; error?: string; hint?: string; children: React.ReactElement }) {
  return (
    <div className="adm-field" data-invalid={error ? "true" : undefined}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error ? (
        <span id={`${name}-error`} className="adm-field__error" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="adm-field__hint">{hint}</span>
      )}
    </div>
  );
}
