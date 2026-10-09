import type { OrderStatus } from "@prisma/client";

// /admin/orders URL state (?q=&status=&page=) — shared by the server page and the client search box.

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const satisfies readonly OrderStatus[];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDERS_PAGE_SIZE = 10;

export type OrderFilters = { q: string; status?: OrderStatus; page: number };

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Validated filters from the URL — junk values fall back to "no filter" / page 1 */
export function parseOrderFilters(sp: SearchParams): OrderFilters {
  const q = first(sp.q).trim().slice(0, 100);
  const statusRaw = first(sp.status).toUpperCase();
  const status = ORDER_STATUSES.find((s) => s === statusRaw);
  const pageNum = Number.parseInt(first(sp.page), 10);
  return { q, status, page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1 };
}

/** Builds /admin/orders?… — empty values and page 1 are left out of the URL */
export function ordersHref({ q, status, page }: Partial<OrderFilters>) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (status) params.set("status", status.toLowerCase());
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}
