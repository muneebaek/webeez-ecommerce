import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderActions from "@/components/admin/OrderActions";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/auth/admin";
import { getOrderById } from "@/lib/data/admin";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Order" };

const formatPlaced = (d: Date) =>
  d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

// Shell renders instantly; the session check, params and DB read stream in via Suspense (Cache Components rule).
export default function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<OrderSkeleton />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}

async function OrderDetail({ params }: Pick<PageProps<"/admin/orders/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  const address = [order.address1, order.address2, order.city, `${order.state} — ${order.pincode}`].filter(Boolean);

  return (
    <div className="grid gap-5 lg:gap-6">
      {/* ---------- Header ---------- */}
      <header className="grid gap-3">
        <Link href="/admin/orders" className="adm-link w-fit">
          ← Orders
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="adm-hello">{order.orderNumber}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="adm-muted">
          Placed {formatPlaced(order.createdAt)} · {itemCount} item{itemCount === 1 ? "" : "s"} · {formatINR(order.total)}
        </p>
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ---------- Left: items + totals, then customer | address ---------- */}
        <div className="grid min-w-0 gap-4">
          <section className="adm-panel">
            <div className="adm-panel__head">
              <h2>Items</h2>
              <span className="adm-muted text-[0.75rem]">{itemCount} total</span>
            </div>
            <ul className="grid grid-cols-1">
              {order.items.map((it) => (
                <li key={it.id} className="adm-line">
                  <span className="adm-line__thumb">
                    <Image src={it.image} alt="" fill sizes="56px" className="object-cover object-top" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {it.product ? (
                      // the item is a snapshot; the link opens the live product on the store
                      <Link href={`/products/${it.product.slug}`} target="_blank" className="block truncate font-medium text-ink hover:text-rose">
                        {it.name}
                      </Link>
                    ) : (
                      <span className="block truncate font-medium text-ink">{it.name}</span>
                    )}
                    <span className="adm-muted block text-[0.75rem]">
                      Size {it.size} · {formatINR(it.unitPrice)} × {it.qty}
                    </span>
                  </div>
                  <span className="adm-price">{formatINR(it.unitPrice * it.qty)}</span>
                </li>
              ))}
            </ul>

            <dl className="adm-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatINR(order.subtotal)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd>
              </div>
              <div className="adm-totals__grand">
                <dt>Total</dt>
                <dd>{formatINR(order.total)}</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</dd>
              </div>
            </dl>
          </section>

          <div className="grid items-start gap-4 md:grid-cols-2">
            <section className="adm-panel">
              <div className="adm-panel__head">
                <h2>Customer</h2>
              </div>
              <dl className="adm-info">
                <div>
                  <dt>Name</dt>
                  <dd>{order.customerName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${order.email}`} className="hover:text-rose">
                      {order.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${order.phone}`} className="hover:text-rose">
                      {order.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </section>

            <section className="adm-panel">
              <div className="adm-panel__head">
                <h2>Shipping address</h2>
              </div>
              <address className="text-[0.875rem] not-italic leading-relaxed text-ink">
                {address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              {order.notes && (
                <p className="adm-note">
                  <span>Note</span>
                  {order.notes}
                </p>
              )}
            </section>
          </div>
        </div>

        {/* ---------- Right: manage (stays in view while scrolling on desktop) ---------- */}
        <div className="xl:sticky xl:top-5">
          <OrderActions id={order.id} status={order.status} email={order.email} emailSent={order.emailSent} />
        </div>
      </div>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="grid gap-5 lg:gap-6" aria-busy="true">
      <div className="adm-skeleton h-20 w-72" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="adm-skeleton h-96" />
        <div className="adm-skeleton h-96" />
      </div>
    </div>
  );
}
