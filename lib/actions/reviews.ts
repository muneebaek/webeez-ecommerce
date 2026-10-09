"use server";

import { Prisma } from "@prisma/client";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

export type ReviewFields = "rating" | "title" | "body" | "name" | "city" | "orderNumber" | "email";

export type ReviewState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<ReviewFields, string>>;
  values?: Record<ReviewFields, string>; // what the customer typed, returned on error so the form keeps it
};

const reviewSchema = z.object({
  rating: z.coerce.number({ error: "Choose a star rating." }).int().min(1, "Choose a star rating.").max(5, "Choose a star rating."),
  title: z.string().trim().min(2, "Add a short title.").max(80, "Keep the title under 80 characters."),
  body: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(1000, "Keep it under 1,000 characters."),
  name: z.string().trim().min(2, "Enter your name.").max(40, "Keep your name under 40 characters."),
  city: z.string().trim().min(2, "Enter your city.").max(40, "Keep the city under 40 characters."),
  orderNumber: z.string().trim().min(1, "Enter your order number.").max(20).toUpperCase(),
  email: z.string().trim().min(1, "Enter the email used for the order.").email("Enter a valid email.").max(120).toLowerCase(),
});

const NOT_VERIFIED = "We couldn't find an order with that number and email that includes this piece. Check both and try again.";

/**
 * Customer review — only for someone who bought this product.
 * The order number + email must match an order (not cancelled) that contains this product; the error never says
 * which part was wrong, so order numbers can't be probed. One review per product per order (unique index).
 */
export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const values = Object.fromEntries(
    (["rating", "title", "body", "name", "city", "orderNumber", "email"] as const).map((k) => [k, String(formData.get(k) ?? "")]),
  ) as Record<ReviewFields, string>;

  // honeypot: a hidden field real visitors never fill — bots do; pretend it worked
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const productId = z.string().min(1).max(50).safeParse(formData.get("productId"));
  if (!productId.success) return { error: "This product is no longer available.", values };

  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) {
    const e = z.flattenError(parsed.error).fieldErrors;
    return { fieldErrors: Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v?.[0]])), values };
  }
  const { orderNumber, email, ...review } = parsed.data;

  const order = await db.order.findUnique({
    where: { orderNumber },
    select: { id: true, email: true, status: true, items: { where: { productId: productId.data }, select: { id: true } } },
  });
  if (!order || order.email.toLowerCase() !== email || order.status === "CANCELLED" || order.items.length === 0) {
    return { error: NOT_VERIFIED, values };
  }

  try {
    await db.review.create({ data: { ...review, productId: productId.data, orderId: order.id, verified: true } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "You've already reviewed this piece for this order. Thank you!", values };
    }
    throw e;
  }

  updateTag("reviews"); // the product page shows the new review and average right away
  return { ok: true };
}
