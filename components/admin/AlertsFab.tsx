import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { countToFulfil } from "@/lib/data/admin";

// Mobile floating bell at the bottom-right, like a chat icon.
// The button is static, so it shows immediately on refresh (no pop-in). Only the badge, which needs the DB count, streams in via Suspense.
export default function AlertsFab() {
  return (
    <Link href="/admin/orders" className="adm-fab lg:hidden" aria-label="Orders to fulfil">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      <Suspense fallback={null}>
        <FulfilBadge />
      </Suspense>
    </Link>
  );
}

// Count badge for the bell (mobile FAB + desktop top bar). Request-time: session check + count (cookies + DB).
export async function FulfilBadge({ className = "adm-fab__badge" }: { className?: string }) {
  await requireAdmin();
  const count = await countToFulfil();
  if (count === 0) return null;
  return (
    <span className={className}>
      {count > 9 ? "9+" : count}
      <span className="sr-only"> pending</span>
    </span>
  );
}
