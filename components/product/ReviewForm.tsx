"use client";

import { useActionState, useEffect, useState } from "react";
import { checkReviewAccess, submitReview, type OwnReview, type ReviewFields, type ReviewState } from "@/lib/actions/reviews";
import { useOrders, type RememberedOrder } from "@/store/orders";
import { useHydrated } from "@/store/use-hydrated";

const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Loved it"];

type Access =
  | { status: "checking" | "none" }
  | { status: "ok"; order: RememberedOrder; name: string; city: string; existing?: OwnReview };

// "Write a review" shows only on products this browser bought: an order remembered from the confirmation page
// that contains this product. The server confirms the order (token, not cancelled, has the product) before the
// button appears, and again when the review is posted. A buyer who already reviewed can edit that review.
export default function ReviewForm({ productId }: { productId: string }) {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  const [access, setAccess] = useState<Access>({ status: "checking" });

  // orders from this browser that include this product
  const candidates = hydrated ? orders.filter((o) => o.productIds.includes(productId)) : [];
  const candidateKey = candidates.map((o) => o.orderNumber).join(",");

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      // newest order first: the first one that may review (or already did → edit) wins
      for (const order of candidates) {
        const res = await checkReviewAccess({ orderNumber: order.orderNumber, token: order.token, productId });
        if (cancelled) return;
        if (res.status === "ok") return setAccess({ status: "ok", order, name: res.name ?? "", city: res.city ?? "" });
        if (res.status === "reviewed") return setAccess({ status: "ok", order, name: "", city: "", existing: res.review });
      }
      if (!cancelled) setAccess({ status: "none" });
    })();
    return () => {
      cancelled = true;
    };
    // candidates is derived from candidateKey — re-check only when that list changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, candidateKey, productId]);

  if (access.status !== "ok") return null; // not bought in this browser → no review option

  // key: a different order (or a just-loaded review) starts the form fresh
  return (
    <BuyerReview
      key={access.order.orderNumber + (access.existing ? "-edit" : "")}
      productId={productId}
      order={access.order}
      name={access.existing?.name ?? access.name}
      city={access.existing?.city ?? access.city}
      existing={access.existing}
    />
  );
}

function BuyerReview({
  productId,
  order,
  name,
  city,
  existing,
}: {
  productId: string;
  order: RememberedOrder;
  name: string;
  city: string;
  existing?: OwnReview;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<OwnReview | undefined>(existing); // the review that is live now — "Edit" starts from it
  const [notice, setNotice] = useState(""); // "Thank you…" / "Review updated." after a save
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);

  // on success: remember what was posted (for the next edit) and close the form
  const [state, action, pending] = useActionState(async (prev: ReviewState, formData: FormData) => {
    const res = await submitReview(prev, formData);
    if (res.ok) {
      const get = (k: string) => String(formData.get(k) ?? "").trim();
      setSaved({ rating: Number(get("rating")), title: get("title"), body: get("body"), name: get("name"), city: get("city") });
      setNotice(res.edited ? "Review updated." : "Thank you — your review is live below.");
      setOpen(false);
    }
    return res;
  }, {} as ReviewState);

  const err = state.ok ? {} : (state.fieldErrors ?? {});
  const v = state.ok ? undefined : state.values;
  const shown = hover || rating;

  if (!open) {
    return (
      <div className="grid gap-3">
        {notice && (
          <p role="status" className="review-form__done">
            {notice}
          </p>
        )}
        <div className="review-invite">
          <p>
            {saved ? "You reviewed this piece" : "You bought this piece"} <span className="text-taupe">(order {order.orderNumber})</span>
            {saved ? "." : ". How do you like it?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setNotice("");
              setRating(saved?.rating ?? 0);
              setOpen(true);
            }}
            className="review-open"
          >
            {saved ? "Edit your review" : "Write a review"}
          </button>
        </div>
      </div>
    );
  }

  const field = (key: ReviewFields, label: string, initial: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="co-field">
      <label htmlFor={`rv-${key}`}>{label}</label>
      <input
        id={`rv-${key}`}
        name={key}
        defaultValue={v?.[key] ?? initial}
        aria-invalid={!!err[key]}
        aria-describedby={err[key] ? `rv-${key}-error` : undefined}
        {...props}
      />
      {err[key] && (
        <p id={`rv-${key}-error`} className="co-field__error">
          {err[key]}
        </p>
      )}
    </div>
  );

  return (
    <form action={action} className="review-form" noValidate>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="orderNumber" value={order.orderNumber} />
      <input type="hidden" name="token" value={order.token} />
      {/* honeypot — hidden from people, bots fill it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="review-form__trap" aria-hidden="true" />

      <fieldset className="review-stars" aria-describedby={err.rating ? "rv-rating-error" : undefined}>
        <legend>Your rating</legend>
        <div className="review-stars__row" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={`review-stars__star ${n <= shown ? "is-on" : ""}`} onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"} — ${RATING_WORDS[n]}`}
              />
              <span aria-hidden="true">★</span>
            </label>
          ))}
          <span className="review-stars__word" aria-hidden="true">
            {RATING_WORDS[shown]}
          </span>
        </div>
        {err.rating && (
          <p id="rv-rating-error" className="co-field__error">
            {err.rating}
          </p>
        )}
      </fieldset>

      {field("title", "Title", saved?.title ?? "", { placeholder: "Sum it up in a few words", maxLength: 80 })}
      <div className="co-field">
        <label htmlFor="rv-body">Your review</label>
        <textarea
          id="rv-body"
          name="body"
          rows={4}
          maxLength={1000}
          placeholder="Fit, fabric, how it wears…"
          defaultValue={v?.body ?? saved?.body ?? ""}
          aria-invalid={!!err.body}
          aria-describedby={err.body ? "rv-body-error" : undefined}
        />
        {err.body && (
          <p id="rv-body-error" className="co-field__error">
            {err.body}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Name shown", saved?.name ?? name, { autoComplete: "given-name", maxLength: 40 })}
        {field("city", "City", saved?.city ?? city, { autoComplete: "address-level2", maxLength: 40 })}
      </div>

      {state.error && (
        <p role="alert" className="review-form__error">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="co-btn px-8">
          {pending ? "Saving…" : saved ? "Save changes" : "Post review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="review-cancel">
          Cancel
        </button>
      </div>
    </form>
  );
}
