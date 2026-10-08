import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import AlertsFab from "@/components/admin/AlertsFab";
import AdminShell from "@/components/admin/AdminShell";
import { logout } from "@/lib/actions/admin-auth";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: { template: "%s — Neythra Admin", default: "Neythra Admin" },
  robots: { index: false },
};

// Admin shell: soft sidebar (avatar greeting + nav) | content.
// On mobile the sidebar is a hamburger drawer (AdminShell). The session check reads cookies(), so it sits inside Suspense.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // the aside controls its own width (collapse animation) — grid column is auto
    <div className="adm min-h-screen lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-6 lg:p-5">
      <AdminShell>
        {/* logo hides completely when collapsed (icons only). pl-[0.3em] balances the trailing letter-spacing so it is exactly centred */}
        <Link
          href="/admin"
          className="adm-side__label adm-side__label--block pl-[0.3em] text-center font-serif text-[1.25rem] font-semibold tracking-[0.3em] text-ink"
        >
          NEYTHRA
        </Link>

        {/* avatar greeting */}
        <div className="flex flex-col items-center text-center">
          <span className="adm-avatar" aria-hidden="true">
            A
          </span>
          <div className="adm-side__label adm-side__label--block">
            <p className="mt-3 text-[1.05rem] font-semibold text-ink">Hi, Admin 👋</p>
            <p className="adm-muted text-[0.75rem]">Good to see you again</p>
          </div>
        </div>

        <Suspense fallback={null}>
          <AdminNav />
        </Suspense>

        <div className="adm-side__foot mt-auto">
          <Link href="/" target="_blank" className="adm-link" title="View store">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
            <span className="adm-side__label">View store</span>
          </Link>
          <form action={logout}>
            <button type="submit" className="adm-link" title="Sign out">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
              </svg>
              <span className="adm-side__label">Sign out</span>
            </button>
          </form>
        </div>
      </AdminShell>

      <main className="min-w-0 px-4 py-5 sm:px-5 lg:p-0 lg:py-2">
        <Suspense fallback={<div className="adm-skeleton h-64" aria-busy="true" />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>

      {/* mobile floating bell (static button; only the badge streams) */}
      <AlertsFab />
    </div>
  );
}

// redirects to /admin/login when not signed in (second check after proxy.ts)
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
