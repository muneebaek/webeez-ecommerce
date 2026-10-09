import "server-only";
import type { OrderStatus, Prisma } from "@prisma/client";
import { ORDER_STATUSES, ORDERS_PAGE_SIZE, type OrderFilters } from "@/lib/admin-orders";
import { LOW_STOCK, PRODUCTS_PAGE_SIZE, type ProductFilters, type StockFilter } from "@/lib/admin-products";
import { REVIEWS_PAGE_SIZE, type ReviewFilters } from "@/lib/admin-reviews";
import { db } from "@/lib/db";

// Admin data — no cache (admin always needs live numbers). Admin pages call these only after requireAdmin().

export { LOW_STOCK };

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

// Fields shown in an order row (dashboard + orders list)
const orderRowSelect = {
  id: true,
  orderNumber: true,
  customerName: true,
  email: true,
  total: true,
  status: true,
  emailSent: true,
  createdAt: true,
  items: { select: { qty: true } },
} satisfies Prisma.OrderSelect;

export async function getRecentOrders(take = 8) {
  return db.order.findMany({ orderBy: { createdAt: "desc" }, take, select: orderRowSelect });
}

/** q matches order number, name, email or phone (case-insensitive) — shared by the list and global search */
function orderSearchWhere(q?: string): Prisma.OrderWhereInput {
  const term = q?.trim();
  if (!term) return {};
  return {
    OR: [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { customerName: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term } },
    ],
  };
}

/**
 * Orders list — newest first, filtered by q + status, one page at a time.
 * counts = orders per status for the current search (status ignored), for the filter chips.
 */
export async function getOrders({ q, status, page }: OrderFilters) {
  const searchWhere = orderSearchWhere(q);
  const where: Prisma.OrderWhereInput = status ? { AND: [searchWhere, { status }] } : searchWhere;

  const [total, groups] = await Promise.all([
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], where: searchWhere, _count: { _all: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));
  const current = Math.min(page, totalPages); // ?page=99 → last page
  const items = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (current - 1) * ORDERS_PAGE_SIZE,
    take: ORDERS_PAGE_SIZE,
    select: orderRowSelect,
  });

  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const g of groups) counts[g.status] = g._count._all;
  const all = Object.values(counts).reduce((n, c) => n + c, 0);

  return { items, total, page: current, totalPages, counts, all };
}

/** One order with its items for the detail page (null when the id doesn't exist). */
export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { slug: true, stock: true } } } } },
  });
}

// ---------- Products (admin list) ----------

const stockWhere: Record<StockFilter, Prisma.ProductWhereInput> = {
  in: { stock: { gt: LOW_STOCK } },
  low: { stock: { gt: 0, lte: LOW_STOCK } },
  out: { stock: 0 },
};

/** q matches name, code, fabric or subtitle (case-insensitive) — shared by the list and global search */
function productSearchWhere(q?: string): Prisma.ProductWhereInput {
  const term = q?.trim();
  if (!term) return {};
  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { code: { contains: term, mode: "insensitive" } },
      { fabric: { contains: term, mode: "insensitive" } },
      { subtitle: { contains: term, mode: "insensitive" } },
    ],
  };
}

/** Products list in store order, filtered by q + stock level, one page at a time (+ counts for the chips). */
export async function getAdminProducts({ q, stock, page }: ProductFilters) {
  const searchWhere = productSearchWhere(q);
  const where: Prisma.ProductWhereInput = stock ? { AND: [searchWhere, stockWhere[stock]] } : searchWhere;

  const [total, all, inStock, low, out] = await Promise.all([
    db.product.count({ where }),
    db.product.count({ where: searchWhere }),
    db.product.count({ where: { AND: [searchWhere, stockWhere.in] } }),
    db.product.count({ where: { AND: [searchWhere, stockWhere.low] } }),
    db.product.count({ where: { AND: [searchWhere, stockWhere.out] } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const items = await db.product.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    skip: (current - 1) * PRODUCTS_PAGE_SIZE,
    take: PRODUCTS_PAGE_SIZE,
    select: { id: true, slug: true, name: true, code: true, fabric: true, category: true, price: true, stock: true, images: true },
  });

  return { items, total, page: current, totalPages, counts: { all, in: inStock, low, out } };
}

/** One product for the admin edit page (null when the id doesn't exist). */
export async function getAdminProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      code: true,
      name: true,
      subtitle: true,
      fabric: true,
      category: true,
      collections: true,
      price: true,
      stock: true,
      sizes: true,
      images: true,
      description: true,
      updatedAt: true,
    },
  });
}

/** Choices for the product form's photo picker: uploaded photos (newest first), then every photo a product uses */
export async function getProductImageOptions() {
  const [uploads, rows] = await Promise.all([
    db.productImage.findMany({ orderBy: { createdAt: "desc" }, select: { id: true } }),
    db.product.findMany({ orderBy: { sortOrder: "asc" }, select: { images: true } }),
  ]);
  return [...new Set([...uploads.map((u) => `/media/${u.id}`), ...rows.flatMap((r) => r.images)])];
}

// ---------- Reviews (admin list) ----------

/** q matches the review title / text, the reviewer's name / city, or the product name (case-insensitive) */
function reviewSearchWhere(q?: string): Prisma.ReviewWhereInput {
  const term = q?.trim();
  if (!term) return {};
  return {
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { body: { contains: term, mode: "insensitive" } },
      { name: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { product: { name: { contains: term, mode: "insensitive" } } },
    ],
  };
}

/** Reviews newest first, filtered by q + verified / unverified, one page at a time (+ counts for the chips). */
export async function getAdminReviews({ q, type, page }: ReviewFilters) {
  const searchWhere = reviewSearchWhere(q);
  const where: Prisma.ReviewWhereInput = type ? { AND: [searchWhere, { verified: type === "verified" }] } : searchWhere;

  const [total, all, verified] = await Promise.all([
    db.review.count({ where }),
    db.review.count({ where: searchWhere }),
    db.review.count({ where: { AND: [searchWhere, { verified: true }] } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (current - 1) * REVIEWS_PAGE_SIZE,
    take: REVIEWS_PAGE_SIZE,
    select: {
      id: true,
      name: true,
      city: true,
      rating: true,
      title: true,
      body: true,
      verified: true,
      orderId: true,
      createdAt: true,
      product: { select: { id: true, name: true, slug: true, images: true } },
    },
  });

  // the order that verified each review (orderId has no relation in the schema, so look the numbers up)
  const orderIds = rows.flatMap((r) => (r.orderId ? [r.orderId] : []));
  const orders = orderIds.length
    ? await db.order.findMany({ where: { id: { in: orderIds } }, select: { id: true, orderNumber: true } })
    : [];
  const orderNumber = new Map(orders.map((o) => [o.id, o.orderNumber]));
  const items = rows.map((r) => ({ ...r, orderNumber: r.orderId ? (orderNumber.get(r.orderId) ?? null) : null }));

  return { items, total, page: current, totalPages, counts: { all, verified, unverified: all - verified } };
}

const SEARCH_TAKE = 5;

/** Global admin search — top orders + products for the header / floating search. */
export async function globalSearch(q: string) {
  const term = q.trim();
  const orderWhere = orderSearchWhere(term);
  const productWhere = productSearchWhere(term);
  const [orders, orderTotal, products, productTotal] = await Promise.all([
    db.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: "desc" },
      take: SEARCH_TAKE,
      select: { id: true, orderNumber: true, customerName: true, total: true, status: true },
    }),
    db.order.count({ where: orderWhere }),
    db.product.findMany({
      where: productWhere,
      orderBy: { sortOrder: "asc" },
      take: SEARCH_TAKE,
      select: { id: true, slug: true, name: true, code: true, price: true, stock: true, images: true },
    }),
    db.product.count({ where: productWhere }),
  ]);
  return {
    orders,
    orderTotal,
    products: products.map(({ images, ...p }) => ({ ...p, image: images[0] ?? null })),
    productTotal,
  };
}

export type GlobalSearchResult = Awaited<ReturnType<typeof globalSearch>>;

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
