import "server-only";
import { db } from "@/lib/db";

// Admin data — no cache (admin always needs live numbers). Admin pages call these only after requireAdmin().

export const LOW_STOCK = 5;

export async function getDashboardStats() {
  const [orders, revenue, toFulfil, products, lowStock] = await Promise.all([
    db.order.count(),
    // cancelled orders aren't counted in revenue
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
    db.product.count(),
    db.product.count({ where: { stock: { lte: LOW_STOCK } } }),
  ]);
  return { orders, revenue: revenue._sum.total ?? 0, toFulfil, products, lowStock };
}

/** Bell badge — count of orders to fulfil only */
export async function countToFulfil() {
  return db.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } });
}

export async function getRecentOrders(take = 8) {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      email: true,
      total: true,
      status: true,
      emailSent: true,
      createdAt: true,
      items: { select: { qty: true } },
    },
  });
}

export async function getLowStockProducts(take = 5) {
  return db.product.findMany({
    where: { stock: { lte: LOW_STOCK } },
    orderBy: { stock: "asc" },
    take,
    select: { id: true, name: true, code: true, stock: true, images: true },
  });
}

// ---------- Dashboard extras (grouped by IST timezone) ----------
const IST = "Asia/Kolkata";
/** Date → "2026-10-08" (IST) */
const istDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: IST });

/** Last N days — orders count + revenue per day (for the chart) */
export async function getDailySeries(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const orders = await db.order.findMany({
    where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
    select: { createdAt: true, total: true },
  });
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return { key: istDay(d), label: d.toLocaleDateString("en-IN", { weekday: "short", timeZone: IST }), orders: 0, revenue: 0 };
  });
  for (const o of orders) {
    const s = series.find((x) => x.key === istDay(o.createdAt));
    if (s) {
      s.orders += 1;
      s.revenue += o.total;
    }
  }
  return series;
}

/** Today's orders + revenue (the "+N today" on stat cards) */
export async function getTodayCounts() {
  const today = istDay(new Date());
  const recent = await db.order.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 36 * 60 * 60 * 1000) } },
    select: { createdAt: true, total: true, status: true },
  });
  const todays = recent.filter((o) => istDay(o.createdAt) === today);
  return {
    orders: todays.length,
    revenue: todays.filter((o) => o.status !== "CANCELLED").reduce((n, o) => n + o.total, 0),
  };
}

/** Orders to fulfil — To-Do list */
export async function getToFulfil(take = 4) {
  return db.order.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED"] } },
    orderBy: { createdAt: "asc" }, // oldest first
    take,
    select: { id: true, orderNumber: true, customerName: true, total: true },
  });
}

/** Days this month with orders (calendar dots) — IST day numbers */
export async function getOrderDaysThisMonth() {
  const now = new Date();
  const [y, m] = istDay(now).split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1) - 5.5 * 60 * 60 * 1000); // IST month start
  const orders = await db.order.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } });
  const days = new Set<number>();
  for (const o of orders) {
    const [oy, om, od] = istDay(o.createdAt).split("-").map(Number);
    if (oy === y && om === m) days.add(od);
  }
  return { year: y, month: m, today: Number(istDay(now).split("-")[2]), days: [...days] };
}

/** Recent activity feed — orders + email events */
export async function getActivity(take = 6) {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, orderNumber: true, customerName: true, total: true, emailSent: true, createdAt: true },
  });
  return orders.flatMap((o) => [
    { id: `${o.id}-placed`, kind: "order" as const, orderId: o.id, text: `New order ${o.orderNumber} from ${o.customerName}`, at: o.createdAt, amount: o.total },
    ...(o.emailSent
      ? [{ id: `${o.id}-email`, kind: "email" as const, orderId: o.id, text: `Confirmation email sent for ${o.orderNumber}`, at: o.createdAt, amount: null }]
      : []),
  ]).slice(0, take);
}
