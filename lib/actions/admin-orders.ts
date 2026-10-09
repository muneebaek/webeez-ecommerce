"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { sendOrderEmail } from "@/lib/email/send-order-email";

export type OrderActionState = { ok?: boolean; message?: string };

// Statuses an admin can pick from the dropdown — cancelling has its own action (it restocks).
const editableStatus = z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]);
const orderId = z.string().min(1).max(50);

/** Change an order's status (not to/from Cancelled). */
export async function updateOrderStatus(_prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  await requireAdmin();
  const parsed = z.object({ id: orderId, status: editableStatus }).safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, message: "Choose a valid status." };

  // a cancelled order stays cancelled — its stock has already gone back to the shelf
  const { count } = await db.order.updateMany({
    where: { id: parsed.data.id, status: { not: "CANCELLED" } },
    data: { status: parsed.data.status },
  });
  if (count === 0) return { ok: false, message: "This order can't be changed (it may be cancelled)." };

  refresh(); // re-render the page, dashboard counts and bell badge with the new status
  return { ok: true, message: "Status updated." };
}

/** Cancel an order and put its items back into stock — runs only once per order. */
export async function cancelOrder(_prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  await requireAdmin();
  const parsed = orderId.safeParse(formData.get("id"));
  if (!parsed.success) return { ok: false, message: "Order not found." };
  const id = parsed.data;

  const cancelled = await db.$transaction(async (tx) => {
    // flips the status only if it isn't cancelled yet — a double click or a second tab can't restock twice
    const { count } = await tx.order.updateMany({ where: { id, status: { not: "CANCELLED" } }, data: { status: "CANCELLED" } });
    if (count === 0) return false;

    const items = await tx.orderItem.findMany({ where: { orderId: id, productId: { not: null } }, select: { productId: true, qty: true } });
    for (const it of items) {
      // updateMany: skips silently if the product was deleted meanwhile
      await tx.product.updateMany({ where: { id: it.productId! }, data: { stock: { increment: it.qty } } });
    }
    return true;
  });
  if (!cancelled) return { ok: false, message: "This order is already cancelled." };

  updateTag("products"); // stock changed → refresh cached store pages
  refresh();
  return { ok: true, message: "Order cancelled and items restocked." };
}

/** Send the confirmation email again (also fixes orders where the first send failed). */
export async function resendOrderEmail(_prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  await requireAdmin();
  const parsed = orderId.safeParse(formData.get("id"));
  if (!parsed.success) return { ok: false, message: "Order not found." };

  const order = await db.order.findUnique({ where: { id: parsed.data }, select: { status: true } });
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status === "CANCELLED") return { ok: false, message: "Cancelled orders don’t get a confirmation email." };

  const sent = await sendOrderEmail(parsed.data);
  if (!sent) return { ok: false, message: "Email could not be sent. Check the SMTP settings and try again." };

  refresh();
  return { ok: true, message: "Confirmation email sent." };
}
