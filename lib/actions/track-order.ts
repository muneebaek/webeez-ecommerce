"use server";

import type { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";

export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  placedAt: string; // ISO — formatted in the browser
  city: string;
  total: number;
  items: { name: string; image: string; size: string; qty: number }[];
};

export type TrackState = {
  error?: string;
  fieldErrors?: Partial<Record<"orderNumber" | "email", string>>;
  values?: { orderNumber: string; email: string };
  order?: TrackedOrder;
};

const trackSchema = z.object({
  orderNumber: z.string().trim().min(1, "Enter your order number.").max(20).toUpperCase(),
  email: z.string().trim().min(1, "Enter the email used for the order.").email("Enter a valid email.").max(120).toLowerCase(),
});

const NOT_FOUND = "No order found with that number and email. Check both and try again.";

/**
 * Public order lookup. Both the order number and the email must match, and the answer never says which one was wrong,
 * so order numbers can't be probed. Only what a customer needs is returned — no phone or full address.
 */
export async function trackOrder(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const values = { orderNumber: String(formData.get("orderNumber") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = trackSchema.safeParse(values);
  if (!parsed.success) {
    const e = z.flattenError(parsed.error).fieldErrors;
    return { fieldErrors: { orderNumber: e.orderNumber?.[0], email: e.email?.[0] }, values };
  }

  const order = await db.order.findUnique({
    where: { orderNumber: parsed.data.orderNumber },
    select: {
      orderNumber: true,
      email: true,
      status: true,
      createdAt: true,
      city: true,
      total: true,
      items: { select: { name: true, image: true, size: true, qty: true } },
    },
  });
  if (!order || order.email.toLowerCase() !== parsed.data.email) return { error: NOT_FOUND, values };

  return {
    values,
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      placedAt: order.createdAt.toISOString(),
      city: order.city,
      total: order.total,
      items: order.items,
    },
  };
}
