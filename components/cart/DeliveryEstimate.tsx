"use client";

import { useState } from "react";
import { estimateDelivery, formatDeliveryRange, isValidPincode } from "@/lib/delivery";
import { useDelivery } from "@/store/delivery";
import { useHydrated } from "@/store/use-hydrated";

// Dates depend on "today" and the saved pincode (localStorage), so they only render in the browser after hydration.
function useEstimate() {
  const hydrated = useHydrated();
  const pincode = useDelivery((s) => s.pincode);
  if (!hydrated) return null;
  const { earliest, latest, zone } = estimateDelivery(pincode);
  return { range: formatDeliveryRange(earliest, latest), zone, pincode };
}

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7M7.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
  </svg>
);

/** One line under each cart item: "Arrives Mon 14 – Thu 17 Oct" */
export function LineDelivery() {
  const est = useEstimate();
  if (!est) return null;
  return (
    <p className="cart-eta">
      <TruckIcon />
      Arrives {est.range}
    </p>
  );
}

/** Summary box: estimated dates + pincode check (saved for next time) */
export function DeliveryBox() {
  const est = useEstimate();
  const setPincode = useDelivery((s) => s.setPincode);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  if (!est) return <div className="cart-eta-box" aria-busy="true" />;
  const showForm = !est.pincode || editing;

  return (
    <div className="cart-eta-box">
      <p className="cart-eta-box__label">
        <TruckIcon />
        Estimated delivery
        {est.pincode && !editing && (
          <>
            {" "}
            to {est.pincode} ·{" "}
            <button
              type="button"
              className="cart-eta-box__change"
              onClick={() => {
                setValue(est.pincode ?? "");
                setEditing(true);
              }}
            >
              Change
            </button>
          </>
        )}
      </p>
      <p className="cart-eta-box__range">{est.range}</p>

      {showForm && (
        <form
          className="cart-eta-box__form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const pin = value.trim();
            if (!isValidPincode(pin)) {
              setError("Enter a valid 6-digit pincode.");
              return;
            }
            setPincode(pin);
            setError("");
            setEditing(false);
          }}
        >
          <label htmlFor="eta-pincode" className="sr-only">
            Delivery pincode
          </label>
          <input
            id="eta-pincode"
            inputMode="numeric"
            maxLength={6}
            placeholder="Pincode"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
            aria-invalid={!!error}
            aria-describedby={error ? "eta-pincode-error" : "eta-pincode-hint"}
          />
          <button type="submit">Check</button>
        </form>
      )}
      {showForm &&
        (error ? (
          <p id="eta-pincode-error" className="cart-eta-box__error" role="alert">
            {error}
          </p>
        ) : (
          <p id="eta-pincode-hint" className="cart-eta-box__hint">
            Enter your pincode for a closer date.
          </p>
        ))}
    </div>
  );
}
