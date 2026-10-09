import Link from "next/link";
import StatusBadge, { formatOrderDate } from "@/components/admin/StatusBadge";
import type { getRecentOrders } from "@/lib/data/admin";
import { formatINR } from "@/lib/format";

type OrderRow = Awaited<ReturnType<typeof getRecentOrders>>[number];

const itemCount = (o: OrderRow) => o.items.reduce((n, i) => n + i.qty, 0);

// Orders list shared by the dashboard and /admin/orders — cards on mobile, table from md up.
export default function OrdersList({ orders }: { orders: OrderRow[] }) {
  return (
    <>
      {/* mobile: each order as its own card */}
      <ul className="grid grid-cols-1 gap-3 p-4 md:hidden">
        {orders.map((o) => (
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
                  {itemCount(o)} item{itemCount(o) > 1 ? "s" : ""}
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
            {orders.map((o) => {
              const href = `/admin/orders/${o.id}`;
              return (
                // every cell links to the order, so a click anywhere on the row opens it;
                // only the first link is in the tab order (one stop per row for keyboard users)
                <tr key={o.id} className="adm-table__row-link">
                  <Cell href={href} first>
                    <span className="font-semibold text-ink">{o.orderNumber}</span>
                  </Cell>
                  <Cell href={href}>
                    <span className="block text-ink">{o.customerName}</span>
                    <span className="adm-muted text-[0.75rem]">{o.email}</span>
                  </Cell>
                  <Cell href={href}>{itemCount(o)}</Cell>
                  <Cell href={href} className="adm-price">
                    {formatINR(o.total)}
                  </Cell>
                  <Cell href={href}>
                    <StatusBadge status={o.status} />
                  </Cell>
                  <Cell href={href}>
                    {o.emailSent ? <span className="text-[#2f6b3a]">✓ Sent</span> : <span className="text-rose">✗ Not sent</span>}
                  </Cell>
                  <Cell href={href} className="adm-muted">
                    {formatOrderDate(o.createdAt)}
                  </Cell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Cell({ href, first = false, className = "", children }: { href: string; first?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <td className={className}>
      <Link href={href} className="adm-cell" tabIndex={first ? undefined : -1}>
        {children}
      </Link>
    </td>
  );
}
