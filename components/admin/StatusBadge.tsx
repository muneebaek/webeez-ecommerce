import type { OrderStatus } from "@prisma/client";
import { STATUS_LABEL } from "@/lib/admin-orders";

// Order status — colour comes from a CSS class (admin.css .adm-badge.is-*)
export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`adm-badge is-${status.toLowerCase()}`}>{STATUS_LABEL[status]}</span>;
}

export const formatOrderDate = (d: Date) =>
  d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
