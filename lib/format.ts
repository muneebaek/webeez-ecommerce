const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** 3690 → "₹3,690" (Indian grouping: 1,00,000) */
export function formatINR(amount: number) {
  return inr.format(amount);
}
