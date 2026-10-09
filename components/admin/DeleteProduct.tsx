"use client";

import { useActionState, useState } from "react";
import { deleteProduct, type ProductActionState } from "@/lib/actions/admin-products";

// "Delete product" with an on-page confirmation; on success the server action redirects to the products list.
export default function DeleteProduct({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(deleteProduct, {} as ProductActionState);
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="adm-panel grid gap-3">
      <div className="adm-panel__head mb-0">
        <h2>Delete</h2>
      </div>
      {!confirming ? (
        <button type="button" onClick={() => setConfirming(true)} className="adm-btn adm-btn--danger adm-btn--pill justify-center">
          Delete product
        </button>
      ) : (
        <form action={action} className="adm-confirm">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="name" value={name} />
          <p>
            Delete <strong>{name}</strong>? It disappears from the store and its reviews are removed. Past orders keep their copy of
            the item. This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="adm-btn adm-btn--rose adm-btn--pill flex-1 justify-center">
              {pending ? "Deleting…" : "Yes, delete"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="adm-btn adm-btn--pill flex-1 justify-center">
              Keep
            </button>
          </div>
        </form>
      )}
      {state.message && (
        <p role="status" className="adm-msg is-error">
          {state.message}
        </p>
      )}
    </section>
  );
}
