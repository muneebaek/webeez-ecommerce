"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export type ReviewActionState = { ok?: boolean; message?: string };

/** Delete a review (spam, abuse, wrong product). The product page's list and average update right away. */
export async function deleteReview(_prev: ReviewActionState, formData: FormData): Promise<ReviewActionState> {
  await requireAdmin();
  const parsed = z.string().min(1).max(50).safeParse(formData.get("id"));
  if (!parsed.success) return { ok: false, message: "Review not found." };

  const { count } = await db.review.deleteMany({ where: { id: parsed.data } });
  if (count === 0) return { ok: false, message: "This review was already deleted." };

  updateTag("reviews"); // store product pages read reviews from the cache
  refresh(); // re-render this admin list without the review
  return { ok: true };
}
