"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export type ProductActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"price" | "stock", string>>;
  values?: { price: string; stock: string }; // what the admin typed, returned on error so the form keeps it
};

// form values arrive as strings; an empty box must be an error, not silently 0
const wholeNumber = (missing: string) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.coerce.number({ error: missing }).int("Use a whole number."));

const productUpdate = z.object({
  id: z.string().min(1).max(50),
  price: wholeNumber("Enter a price.").pipe(z.number().min(1, "Price must be at least ₹1.").max(100000, "Price can't be above ₹1,00,000.")),
  stock: wholeNumber("Enter the stock.").pipe(z.number().min(0, "Stock can't be negative.").max(9999, "Stock can't be above 9,999.")),
});

/** Update a product's price and stock, then refresh the cached store pages so the change shows right away. */
export async function updateProduct(_prev: ProductActionState, formData: FormData): Promise<ProductActionState> {
  await requireAdmin();
  const values = { price: String(formData.get("price") ?? ""), stock: String(formData.get("stock") ?? "") };
  const parsed = productUpdate.safeParse({ id: formData.get("id"), ...values });
  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: { price: errors.price?.[0], stock: errors.stock?.[0] },
      values,
    };
  }

  const { id, price, stock } = parsed.data;
  const { count } = await db.product.updateMany({ where: { id }, data: { price, stock } });
  if (count === 0) return { ok: false, message: "Product not found." };

  updateTag("products"); // home, listing and product pages read products from the cache
  refresh(); // re-render this admin page with the saved values
  return { ok: true, message: "Saved — the store shows the new price and stock now." };
}
