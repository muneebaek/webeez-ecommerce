"use client";

import { useActionState, useState } from "react";
import type { OrderStatus } from "@prisma/client";
import { cancelOrder, resendOrderEmail, updateOrderStatus, type OrderActionState } from "@/lib/actions/admin-orders";
import { STATUS_LABEL } from "@/lib/admin-orders";

const EDITABLE = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;

function Message({ state }: { state: OrderActionState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={`adm-msg ${state.ok ? "is-ok" : "is-error"}`}>
      {state.message}
    </p>
  );
}

// Order management on the detail page: change status, cancel (+ restock), confirmation email state + resend.
// Each form calls a server action; the action refreshes the page so the badge, counts and email state update.
export default function OrderActions({
  id,
  status,
  email,
  emailSent,
}: {
  id: string;
  status: OrderStatus;
  email: string;
  emailSent: boolean;
}) {
  const [statusState, statusAction, statusPending] = useActionState(updateOrderStatus, {});
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelOrder, {});
  const [emailState, emailAction, emailPending] = useActionState(resendOrderEmail, {});
  const [confirming, setConfirming] = useState(false);
  const cancelled = status === "CANCELLED";

  return (
    <section className="adm-panel">
      <div className="adm-panel__head">
        <h2>Manage order</h2>
      </div>

      {cancelled ? (
        <p className="adm-msg is-error">This order was cancelled and its items were put back into stock.</p>
      ) : (
        <div className="grid gap-4">
          {/* ---------- Status ---------- */}
          <form action={statusAction} className="grid gap-2">
            <input type="hidden" name="id" value={id} />
            <label htmlFor="order-status" className="adm-info__label">
              Status
            </label>
            <div className="flex gap-2">
              {/* key: after a refresh the select shows the saved status */}
              <select key={status} id="order-status" name="status" defaultValue={status} className="adm-input min-w-0 flex-1">
                {EDITABLE.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={statusPending} className="adm-btn adm-btn--primary adm-btn--pill">
                {statusPending ? "Saving…" : "Update"}
              </button>
            </div>
            <Message state={statusState} />
          </form>

          {/* ---------- Cancel (asks first, on the page) ---------- */}
          <div className="grid gap-2 border-t border-dashed border-line pt-4">
            {!confirming ? (
              <button type="button" onClick={() => setConfirming(true)} className="adm-btn adm-btn--danger adm-btn--pill justify-center">
                Cancel order
              </button>
            ) : (
              <form action={cancelAction} className="adm-confirm">
                <input type="hidden" name="id" value={id} />
                <p>Cancel this order? Its items go back into stock. This can&apos;t be undone.</p>
                <div className="flex gap-2">
                  <button type="submit" disabled={cancelPending} className="adm-btn adm-btn--rose adm-btn--pill flex-1 justify-center">
                    {cancelPending ? "Cancelling…" : "Yes, cancel"}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} disabled={cancelPending} className="adm-btn adm-btn--pill flex-1 justify-center">
                    Keep order
                  </button>
                </div>
              </form>
            )}
            <Message state={cancelState} />
          </div>
        </div>
      )}

      {/* ---------- Confirmation email: state + (re)send — no sending for cancelled orders ---------- */}
      <div className="mt-4 grid gap-2 border-t border-dashed border-line pt-4">
        <span className="adm-info__label">Confirmation email</span>
        {emailSent ? (
          <p className="text-[0.8125rem] text-[#2f6b3a]">✓ Sent to {email}</p>
        ) : (
          <p className="text-[0.8125rem] text-rose">✗ Not sent yet</p>
        )}
        {!cancelled && (
          <form action={emailAction} className="grid gap-2">
            <input type="hidden" name="id" value={id} />
            <button type="submit" disabled={emailPending} className="adm-btn adm-btn--pill justify-center">
              {emailPending ? "Sending…" : emailSent ? "Resend email" : "Send email"}
            </button>
            <Message state={emailState} />
          </form>
        )}
      </div>
    </section>
  );
}
