// Estimated delivery dates for the cart — the same rules as the Shipping help page:
// dispatch in 3–5 working days, then 2–4 days to metro cities and 4–7 days elsewhere (Sundays are skipped).

const DISPATCH = [3, 5] as const;
const TRANSIT = {
  metro: [2, 4],
  standard: [4, 7],
  unknown: [2, 7], // no pincode yet → widest range
} as const;

// pincode starts of the big metros: Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad
const METRO_PREFIXES = ["11", "400", "560", "600", "700", "500", "411", "380"];

export type DeliveryZone = keyof typeof TRANSIT;

export const isValidPincode = (pin: string) => /^[1-9]\d{5}$/.test(pin);

export function zoneFor(pincode?: string | null): DeliveryZone {
  if (!pincode || !isValidPincode(pincode)) return "unknown";
  return METRO_PREFIXES.some((p) => pincode.startsWith(p)) ? "metro" : "standard";
}

/** Today in India as a UTC-midnight date, so the day doesn't depend on the viewer's timezone */
function todayIST(now: Date) {
  const [y, m, d] = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Adds n working days (Monday–Saturday) */
function addWorkingDays(date: Date, n: number) {
  const d = new Date(date);
  while (n > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0) n--;
  }
  return d;
}

/** Earliest / latest delivery dates for an order placed now */
export function estimateDelivery(pincode?: string | null, now = new Date()) {
  const zone = zoneFor(pincode);
  const today = todayIST(now);
  return {
    zone,
    earliest: addWorkingDays(today, DISPATCH[0] + TRANSIT[zone][0]),
    latest: addWorkingDays(today, DISPATCH[1] + TRANSIT[zone][1]),
  };
}

// built from parts so the separators stay the same ("Thu 15 Oct"), whatever the locale adds
const part = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" });
const dayLabel = (d: Date, withMonth: boolean) =>
  `${part(d, { weekday: "short" })} ${d.getUTCDate()}${withMonth ? ` ${part(d, { month: "short" })}` : ""}`;

/** "Thu 15 – Fri 23 Oct", or "Thu 29 Oct – Tue 3 Nov" across months */
export function formatDeliveryRange(earliest: Date, latest: Date) {
  const sameMonth = earliest.getUTCMonth() === latest.getUTCMonth();
  return `${dayLabel(earliest, !sameMonth)} – ${dayLabel(latest, true)}`;
}
