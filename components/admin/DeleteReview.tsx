"use client";

import { useActionState, useState } from "react";
import { deleteReview, type ReviewActionState } from "@/lib/actions/admin-reviews";

// Small "Delete" on each review card with an on-card confirmation; the list re-renders without it on success.
export default function DeleteReview({ id, title }: { id: string; title: string }) {
  const [state, action, pending] = useActionState(deleteReview, {} as ReviewActionState);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="adm-review__delete" aria-label={`Delete review “${title}”`}>
        Delete
      </button>
    );
  }

  return (
    <form action={action} className="adm-confirm w-full">
      <input type="hidden" name="id" value={id} />
      <p>Delete this review? It disappears from the product page and the rating is recalculated. This can&apos;t be undone.</p>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="adm-btn adm-btn--rose adm-btn--pill flex-1 justify-center">
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="adm-btn adm-btn--pill flex-1 justify-center">
          Keep
        </button>
      </div>
      {state.message && (
        <p role="status" className="adm-msg is-error">
          {state.message}
        </p>
      )}
    </form>
  );
}
