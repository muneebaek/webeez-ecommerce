"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFields, type ReviewState } from "@/lib/actions/reviews";

const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Loved it"];

// "Write a review" button → form with a 1–5 star picker. Only buyers can post: the server checks order number + email.
export default function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitReview, {} as ReviewState);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const err = state.fieldErrors ?? {};
  const v = state.values;
  const shown = hover || rating;

  if (state.ok) {
    return (
      <p role="status" className="review-form__done">
        Thank you — your review is live below.
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="review-open">
        Write a review
      </button>
    );
  }

  const field = (name: ReviewFields, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="co-field">
      <label htmlFor={`rv-${name}`}>{label}</label>
      <input
        id={`rv-${name}`}
        name={name}
        defaultValue={v?.[name] ?? ""}
        aria-invalid={!!err[name]}
        aria-describedby={err[name] ? `rv-${name}-error` : undefined}
        {...props}
      />
      {err[name] && (
        <p id={`rv-${name}-error`} className="co-field__error">
          {err[name]}
        </p>
      )}
    </div>
  );

  return (
    <form action={action} className="review-form" noValidate>
      <input type="hidden" name="productId" value={productId} />
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

      {field("title", "Title", { placeholder: "Sum it up in a few words", maxLength: 80 })}
      <div className="co-field">
        <label htmlFor="rv-body">Your review</label>
        <textarea
          id="rv-body"
          name="body"
          rows={4}
          maxLength={1000}
          placeholder="Fit, fabric, how it wears…"
          defaultValue={v?.body ?? ""}
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
        {field("name", "Name", { autoComplete: "name", maxLength: 40 })}
        {field("city", "City", { autoComplete: "address-level2", maxLength: 40 })}
      </div>

      <div className="review-form__verify">
        <p className="text-[0.75rem] leading-relaxed text-taupe-dark">
          Reviews are from customers only. Enter the order number and email from your confirmation email — they aren&apos;t shown.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("orderNumber", "Order number", { placeholder: "NYT-260001", autoComplete: "off" })}
          {field("email", "Email", { type: "email", placeholder: "you@example.com", autoComplete: "email" })}
        </div>
      </div>

      {state.error && (
        <p role="alert" className="review-form__error">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="co-btn px-8">
          {pending ? "Posting…" : "Post review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="review-cancel">
          Cancel
        </button>
      </div>
    </form>
  );
}
