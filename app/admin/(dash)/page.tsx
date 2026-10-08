import type { Metadata } from "next";
import Link from "next/link";
import HeaderSearch from "@/components/admin/HeaderSearch";
import MiniCalendar from "@/components/admin/MiniCalendar";
import OrdersChart from "@/components/admin/OrdersChart";
import StatusBadge, { formatOrderDate } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getActivity,
  getDailySeries,
  getDashboardStats,
  getOrderDaysThisMonth,
  getRecentOrders,
  getTodayCounts,
  getToFulfil,
  LOW_STOCK,
} from "@/lib/data/admin";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

// relative time like "2h ago"
function timeAgo(d: Date) {
  const s = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

// greeting based on the current IST time
function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

const ICONS = {
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  rupee: "M6 3h12M6 8h12M14 21 6 13h3a5 5 0 0 0 0-10",
  check: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9",
  tag: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01",
};

// Live DB data. requireAdmin() runs first: (1) security check (2) cookies() is a request-time API —
// so Next.js knows this page is request-time only (the uncached DB queries never run at build).
export default async function AdminDashboardPage() {
  await requireAdmin();
  const [stats, today, series, toFulfil, calendar, activity, recent] = await Promise.all([
    getDashboardStats(),
    getTodayCounts(),
    getDailySeries(7),
    getToFulfil(4),
    getOrderDaysThisMonth(),
    getActivity(5),
    getRecentOrders(6),
  ]);

  const cards = [
    { label: "Total Orders", value: String(stats.orders), note: `+${today.orders} today`, tone: "rose", icon: ICONS.bag },
    { label: "Revenue", value: formatINR(stats.revenue), note: `+${formatINR(today.revenue)} today`, tone: "sage", icon: ICONS.rupee },
    { label: "To Fulfil", value: String(stats.toFulfil), note: "Pending + confirmed", tone: "sky", icon: ICONS.check },
    { label: "Products", value: String(stats.products), note: `${stats.lowStock} low on stock (≤ ${LOW_STOCK})`, tone: "amber", icon: ICONS.tag },
  ];

  return (
    <div className="grid gap-5 lg:gap-6">
      {/* ---------- Greeting header ---------- */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="adm-hello">{greeting()}, Admin</h1>
          <p className="adm-muted mt-1">Here&apos;s what&apos;s happening in the store today.</p>
        </div>
        {/* desktop only — on mobile, search and bell are floating buttons */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <HeaderSearch />
          <Link href="/admin/orders" className="adm-round" aria-label={`${stats.toFulfil} orders to fulfil`}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            {stats.toFulfil > 0 && <span className="adm-round__badge">{stats.toFulfil > 9 ? "9+" : stats.toFulfil}</span>}
          </Link>
          <span className="adm-avatar adm-avatar--sm" aria-hidden="true">
            A
          </span>
        </div>
      </header>

      {/* ---------- Stat cards ---------- */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`adm-stat adm-stat--${c.tone}`}>
            <span className={`adm-icon adm-icon--lg adm-icon--${c.tone}`}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={c.icon} />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="adm-stat__label">{c.label}</p>
              <p className="adm-stat__value">{c.value}</p>
              <p className="adm-stat__note">{c.note}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ---------- Chart | To-do + Calendar ---------- */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <OrdersChart data={series} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="adm-panel adm-panel--rose">
            <div className="adm-panel__head">
              <h2>To Fulfil</h2>
              <Link href="/admin/orders" className="adm-link">
                All →
              </Link>
            </div>
            {toFulfil.length === 0 ? (
              <p className="adm-muted py-4 text-center text-[0.8125rem]">All caught up ✦</p>
            ) : (
              <ul className="grid grid-cols-1 gap-2">
                {toFulfil.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="adm-todo">
                      <span className="adm-todo__box" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-ink">{o.orderNumber}</span>
                        <span className="adm-muted block truncate text-[0.6875rem]">{o.customerName}</span>
                      </span>
                      <span className="adm-price text-[0.8125rem]">{formatINR(o.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <MiniCalendar {...calendar} />
        </div>
      </section>

      {/* ---------- Recent activity | Encouragement ---------- */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="adm-panel">
          <div className="adm-panel__head">
            <h2>Recent Activity</h2>
          </div>
          {activity.length === 0 ? (
            <p className="adm-muted py-6 text-center">No activity yet. Orders placed on the store appear here.</p>
          ) : (
            <ul className="grid grid-cols-1">
              {activity.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/orders/${a.orderId}`} className="adm-activity">
                    <span className={`adm-icon adm-icon--${a.kind === "order" ? "sage" : "sky"}`} aria-hidden="true">
                      {a.kind === "order" ? "✓" : "✉"}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{a.text}</span>
                    {a.amount !== null && <span className="adm-price hidden text-[0.8125rem] sm:inline">{formatINR(a.amount)}</span>}
                    <span className="adm-muted w-14 shrink-0 text-right text-[0.6875rem]">{timeAgo(a.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="adm-cheer">
          <p className="adm-kicker">[ Keep going ]</p>
          <p className="mt-2 text-[1.3rem] font-semibold leading-tight tracking-[-0.02em] text-ink">You&apos;re doing amazing!</p>
          <p className="adm-muted mt-2 text-[0.8125rem]">
            {stats.toFulfil > 0
              ? `${stats.toFulfil} order${stats.toFulfil > 1 ? "s are" : " is"} waiting to be packed. One parcel at a time.`
              : "Every order is out the door. Lovely work."}
          </p>
          <span className="adm-cheer__art" aria-hidden="true">
            🧶
          </span>
        </div>
      </section>

      {/* ---------- Recent orders table ---------- */}
      <section className="adm-panel adm-panel--flush">
        <div className="adm-panel__head">
          <h2>Recent Orders</h2>
          <Link href="/admin/orders" className="adm-link">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="adm-muted py-8 text-center">No orders yet.</p>
        ) : (
          <>
          {/* mobile: each order as its own card */}
          <ul className="grid grid-cols-1 gap-3 p-4 md:hidden">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="adm-order-card">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-ink">{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-2 min-w-0">
                    <span className="block truncate text-ink">{o.customerName}</span>
                    <span className="adm-muted block truncate text-[0.75rem]">{o.email}</span>
                  </div>
                  <div className="adm-order-card__foot">
                    <span className="adm-price text-[0.9375rem]">{formatINR(o.total)}</span>
                    <span className="adm-muted">
                      {o.items.reduce((n, i) => n + i.qty, 0)} item{o.items.reduce((n, i) => n + i.qty, 0) > 1 ? "s" : ""}
                    </span>
                    <span className={o.emailSent ? "text-[#2f6b3a]" : "text-rose"}>{o.emailSent ? "✓ Email" : "✗ Email"}</span>
                    <span className="adm-muted ml-auto">{formatOrderDate(o.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* tablet / desktop: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Email</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-ink hover:text-rose">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <span className="block text-ink">{o.customerName}</span>
                      <span className="adm-muted text-[0.75rem]">{o.email}</span>
                    </td>
                    <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                    <td className="adm-price">{formatINR(o.total)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td title={o.emailSent ? "Confirmation email sent" : "Email not sent"}>
                      {o.emailSent ? <span className="text-[#2f6b3a]">✓ Sent</span> : <span className="text-rose">✗ Not sent</span>}
                    </td>
                    <td className="adm-muted">{formatOrderDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>
    </div>
  );
}
