import { timingSafeEqual } from "node:crypto";

// The confirmation page shows the customer's address, phone and email, and order numbers are short and guessable.
// So its link carries the order's secret token: /order/NYT-261234?t=<accessToken>.

/** Confirmation page path for an order (used after checkout and in the email) */
export const orderPath = (orderNumber: string, accessToken: string) =>
  `/order/${encodeURIComponent(orderNumber)}?t=${encodeURIComponent(accessToken)}`;

/** Constant-time check of the token from the URL against the order's token */
export function isValidOrderToken(given: string | undefined, expected: string) {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
