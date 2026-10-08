"use server";

import { randomInt } from "node:crypto";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { sendOrderEmail } from "@/lib/email/send-order-email";
import { shippingFor } from "@/lib/pricing";
import { checkoutSchema, orderItemsSchema } from "@/lib/validators";

export type CheckoutState = {
  ok: boolean;
  orderNumber?: string;
  message?: string; // form-inte mukalil kaanikkunna general error
  fieldErrors?: Partial<Record<string, string>>; // field-wise errors
  values?: Record<string, string>; // error vannaal form values thirichu kodukkaan
};

class OrderError extends Error {}

/** NYT-261234 — year + 4 random digits (unique illenkil retry) */
const makeOrderNumber = () => `NYT-${new Date().getFullYear() % 100}${randomInt(1000, 10000)}`;

/**
 * Checkout form submit → ithu server-il run aakum.
 * 1. Form validate (zod)  2. Products DB-il ninnu — REAL price + stock
 * 3. Transaction: stock kurakkuka + Order + OrderItems  4. Cache refresh (stock maari)
 * 5. Confirmation email — response kazhinju background-il (after), user wait cheyyenda
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

  // ---------- 2. Real products (browser price vishwasikkilla) ----------
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

  // same product pala size-il undenkil total qty stock-il kooduthal aakaruthu
  const qtyByProduct = new Map<string, number>();
  for (const l of lines) qtyByProduct.set(l.product.id, (qtyByProduct.get(l.product.id) ?? 0) + l.qty);

  const subtotal = lines.reduce((n, l) => n + l.product.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  const data = parsed.data;

  // ---------- 3. Transaction — ellaam orumichu, allenkil onnum illa ----------
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const order = await db.$transaction(async (tx) => {
        for (const [productId, qty] of qtyByProduct) {
          // stock >= qty aanenkil mathram kurakkum — 2 per orumichu vaangiyaalum oversell aakilla
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
                name: l.product.name, // snapshot — product pinne maariyaalum order maarilla
                image: l.product.images[0] ?? "",
                size: l.size,
                qty: l.qty,
                unitPrice: l.product.price,
              })),
            },
          },
        });
      });

      // ---------- 4. Stock maari → product pages cache refresh ----------
      updateTag("products");

      // ---------- 5. Email — response user-inu poyathinu shesham send (fail aayaalum order safe) ----------
      after(() => sendOrderEmail(order.id));

      return { ok: true, orderNumber: order.orderNumber };
    } catch (e) {
      if (e instanceof OrderError) return { ok: false, values: fields, message: e.message };
      // orderNumber duplicate aayaal (unique constraint) — puthiya number vechu retry
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      console.error("placeOrder failed", e);
      return { ok: false, values: fields, message: "Something went wrong. Please try again." };
    }
  }
  return { ok: false, values: fields, message: "Something went wrong. Please try again." };
}
