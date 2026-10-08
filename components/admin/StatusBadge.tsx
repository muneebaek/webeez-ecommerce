import type { OrderStatus } from "@prisma/client";

const LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// Order status — colour comes from a CSS class (admin.css .adm-badge.is-*)
export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`adm-badge is-${status.toLowerCase()}`}>{LABEL[status]}</span>;
}

export const formatOrderDate = (d: Date) =>
  d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
