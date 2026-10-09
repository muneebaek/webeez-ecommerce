import { Suspense } from "react";
import Link from "next/link";
import { FulfilBadge } from "@/components/admin/AlertsFab";
import HeaderSearch from "@/components/admin/HeaderSearch";

// Desktop top bar on every admin page: global search + bell + avatar (mobile uses the floating buttons).
// Static, so it renders instantly; only the bell's count badge streams in via Suspense.
export default function TopActions() {
  return (
    <div className="mb-4 hidden items-center justify-end gap-2.5 lg:flex">
      <HeaderSearch />
      <Link href="/admin/orders" className="adm-round" aria-label="Orders to fulfil">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        <Suspense fallback={null}>
          <FulfilBadge className="adm-round__badge" />
        </Suspense>
      </Link>
      <span className="adm-avatar adm-avatar--sm" aria-hidden="true">
        A
      </span>
    </div>
  );
}
