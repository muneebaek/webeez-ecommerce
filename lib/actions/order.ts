"use server";

import { randomBytes, randomInt } from "node:crypto";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { sendOrderEmail } from "@/lib/email/send-order-email";
import { orderPath } from "@/lib/order-link";
import { shippingFor } from "@/lib/pricing";
import { checkoutSchema, orderItemsSchema } from "@/lib/validators";

export type CheckoutState = {
  ok: boolean;
  orderNumber?: string;
  orderUrl?: string; // confirmation page link with the order's secret token
  message?: string; // general error shown at the top of the form
  fieldErrors?: Partial<Record<string, string>>; // field-wise errors
  values?: Record<string, string>; // form values returned on error
};

class OrderError extends Error {}

/** NYT-261234 — year + 4 random digits (retried if not unique) */
const makeOrderNumber = () => `NYT-${new Date().getFullYear() % 100}${randomInt(1000, 10000)}`;

/**
 * Checkout form submit → runs on the server.
 * 1. Validate the form (zod)  2. Load products from the DB — REAL price + stock
 * 3. Transaction: decrement stock + Order + OrderItems  4. Refresh cache (stock changed)
 * 5. Confirmation email — sent in the background after the response (after), so the user doesn't wait
 */
export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const { items: itemsJson, ...fields } = raw;

  // ---------- 1. Validate ----------
  const parsed = checkoutSchema.safeParse(fields);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, fieldErrors, values: fields, message: "Please check the highlighted fields." };
  }

  let itemsInput: unknown;
  try {
    itemsInput = JSON.parse(itemsJson ?? "[]");
  } catch {
    itemsInput = [];
  }
  const items = orderItemsSchema.safeParse(itemsInput);
  if (!items.success) return { ok: false, values: fields, message: "Your bag is empty." };

  // ---------- 2. Real products (never trust the browser's price) ----------
  const ids = [...new Set(items.data.map((i) => i.productId))];
  const products = await db.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: { product: (typeof products)[number]; size: string; qty: number }[] = [];
  for (const item of items.data) {
    const p = byId.get(item.productId);
    if (!p) return { ok: false, values: fields, message: "A piece in your bag is no longer available." };
    if (!p.sizes.includes(item.size))
      return { ok: false, values: fields, message: `Size ${item.size} is not available for ${p.name}.` };
    lines.push({ product: p, size: item.size, qty: item.qty });
  }

  // if the same product appears in several sizes, the total qty must not exceed stock
  const qtyByProduct = new Map<string, number>();
  for (const l of lines) qtyByProduct.set(l.product.id, (qtyByProduct.get(l.product.id) ?? 0) + l.qty);

  const subtotal = lines.reduce((n, l) => n + l.product.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  const data = parsed.data;

  // ---------- 3. Transaction — all or nothing ----------
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const order = await db.$transaction(async (tx) => {
        for (const [productId, qty] of qtyByProduct) {
          // only decrements when stock >= qty — no overselling even if two people buy at once
          const res = await tx.product.updateMany({
            where: { id: productId, stock: { gte: qty } },
            data: { stock: { decrement: qty } },
          });
          if (res.count === 0) {
            const name = byId.get(productId)?.name ?? "A piece";
            throw new OrderError(`${name} has only ${byId.get(productId)?.stock ?? 0} left in stock.`);
          }
        }

        return tx.order.create({
          data: {
            orderNumber: makeOrderNumber(),
            accessToken: randomBytes(24).toString("base64url"), // 192-bit secret for the confirmation link
            customerName: data.customerName,
            email: data.email,
            phone: data.phone,
            address1: data.address1,
            address2: data.address2,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            notes: data.notes,
            subtotal,
            shipping,
            total: subtotal + shipping,
            items: {
              create: lines.map((l) => ({
                productId: l.product.id,
                name: l.product.name, // snapshot — the order stays the same even if the product changes later
                image: l.product.images[0] ?? "",
                size: l.size,
                qty: l.qty,
                unitPrice: l.product.price,
              })),
            },
          },
        });
      });

      // ---------- 4. Stock changed → refresh product page cache ----------
      updateTag("products");

      // ---------- 5. Email — sent after the response reaches the user (the order is safe even if it fails) ----------
      after(() => sendOrderEmail(order.id));

      return { ok: true, orderNumber: order.orderNumber, orderUrl: orderPath(order.orderNumber, order.accessToken) };
    } catch (e) {
      if (e instanceof OrderError) return { ok: false, values: fields, message: e.message };
      // duplicate orderNumber (unique constraint) — retry with a new number
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      console.error("placeOrder failed", e);
      return { ok: false, values: fields, message: "Something went wrong. Please try again." };
    }
  }
  return { ok: false, values: fields, message: "Something went wrong. Please try again." };
}
