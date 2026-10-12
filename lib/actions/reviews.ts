"use server";

import { Prisma } from "@prisma/client";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { isValidOrderToken } from "@/lib/order-link";

export type ReviewFields = "rating" | "title" | "body" | "name" | "city";

export type ReviewState = {
  ok?: boolean;
  edited?: boolean; // true when an existing review was updated
  error?: string;
  fieldErrors?: Partial<Record<ReviewFields, string>>;
  values?: Record<ReviewFields, string>; // what the customer typed, returned on error so the form keeps it
};

/** The buyer's own review, sent back so they can edit it */
export type OwnReview = { rating: number; title: string; body: string; name: string; city: string };

/** "ok" = can review · "reviewed" = already reviewed from this order (can edit it) · "no" = not a buyer (or cancelled / bad token) */
export type ReviewAccess = { status: "ok" | "reviewed" | "no"; name?: string; city?: string; review?: OwnReview };

const accessSchema = z.object({
  orderNumber: z.string().trim().min(1).max(20).toUpperCase(),
  token: z.string().min(10).max(100),
  productId: z.string().min(1).max(50),
});

const reviewSchema = z.object({
  rating: z.coerce.number({ error: "Choose a star rating." }).int().min(1, "Choose a star rating.").max(5, "Choose a star rating."),
  title: z.string().trim().min(2, "Add a short title.").max(80, "Keep the title under 80 characters."),
  body: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(1000, "Keep it under 1,000 characters."),
  name: z.string().trim().min(2, "Enter your name.").max(40, "Keep your name under 40 characters."),
  city: z.string().trim().min(2, "Enter your city.").max(40, "Keep the city under 40 characters."),
});

/** The order behind the review: token must match, not cancelled, and it must contain this product. */
async function findBuyerOrder({ orderNumber, token, productId }: z.infer<typeof accessSchema>) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      accessToken: true,
      status: true,
      customerName: true,
      city: true,
      items: { where: { productId }, select: { id: true } },
    },
  });
  if (!order || !isValidOrderToken(token, order.accessToken)) return null;
  if (order.status === "CANCELLED" || order.items.length === 0) return null;
  return order;
}

/** Product page asks: may this browser's order review this product? (Also prefills name + city.) */
export async function checkReviewAccess(input: { orderNumber: string; token: string; productId: string }): Promise<ReviewAccess> {
  const parsed = accessSchema.safeParse(input);
  if (!parsed.success) return { status: "no" };
  const order = await findBuyerOrder(parsed.data);
  if (!order) return { status: "no" };

  const existing = await db.review.findUnique({
    where: { orderId_productId: { orderId: order.id, productId: parsed.data.productId } },
    select: { rating: true, title: true, body: true, name: true, city: true },
  });
  if (existing) return { status: "reviewed", review: existing };
  return { status: "ok", name: order.customerName.split(" ")[0], city: order.city };
}

/**
 * Save a review with a star rating — only for the buyer. Posting again from the same order edits that review. The order number + secret token come from this browser's
 * remembered order; the server checks them again here, so the form can't be used for products not bought.
 * One review per product per order (unique index), so an edit can only ever change the buyer's own review.
 */
export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const values = Object.fromEntries(
    (["rating", "title", "body", "name", "city"] as const).map((k) => [k, String(formData.get(k) ?? "")]),
  ) as Record<ReviewFields, string>;

  // honeypot: a hidden field real visitors never fill — bots do; pretend it worked
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const access = accessSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    token: formData.get("token"),
    productId: formData.get("productId"),
  });
  if (!access.success) return { error: "Only customers who bought this piece can review it.", values };

  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) {
    const e = z.flattenError(parsed.error).fieldErrors;
    return { fieldErrors: Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v?.[0]])), values };
  }

  const order = await findBuyerOrder(access.data);
  if (!order) return { error: "Only customers who bought this piece can review it.", values };

  const key = { orderId: order.id, productId: access.data.productId };
  const before = await db.review.count({ where: key });
  try {
    // first time → create; again from the same order → update that review (rating, text, name, city)
    await db.review.upsert({
      where: { orderId_productId: key },
      create: { ...parsed.data, ...key, verified: true },
      update: parsed.data,
    });
  } catch (e) {
    // two submits at the same moment — the second one loses the unique-index race
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Your review was just saved. Refresh the page to see it.", values };
    }
    throw e;
  }

  updateTag("reviews"); // the product page shows the new / edited review and average right away
  return { ok: true, edited: before > 0 };
}
