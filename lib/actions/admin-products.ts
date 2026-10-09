"use server";

import { randomUUID } from "node:crypto";
import type { Category } from "@prisma/client";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { COLLECTION_OPTIONS, SIZE_OPTIONS, type ProductFormValues } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth/admin";
import { getProductImageOptions } from "@/lib/data/admin";
import { db } from "@/lib/db";

type Field = keyof ProductFormValues;

export type ProductActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  values?: ProductFormValues; // what the admin entered, returned on error so the form keeps it
};

// form values arrive as strings; an empty box must be an error, not silently 0
const wholeNumber = (missing: string) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.coerce.number({ error: missing }).int("Use a whole number."));

const text = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, min === 1 ? `Enter ${label}.` : `${label[0].toUpperCase() + label.slice(1)} needs at least ${min} characters.`)
    .max(max, `Keep it under ${max} characters.`);

const productSchema = z.object({
  name: text("a name", 2, 80),
  code: text("a code", 1, 20),
  category: z.enum(["women", "men", "essentials"], { error: "Choose a category." }),
  subtitle: text("the details line", 1, 120),
  fabric: text("the fabric", 1, 60),
  description: text("the description", 10, 2000),
  price: wholeNumber("Enter a price.").pipe(z.number().min(1, "Price must be at least ₹1.").max(100000, "Price can't be above ₹1,00,000.")),
  stock: wholeNumber("Enter the stock.").pipe(z.number().min(0, "Stock can't be negative.").max(9999, "Stock can't be above 9,999.")),
  sizes: z
    .array(z.enum(SIZE_OPTIONS))
    .min(1, "Choose at least one size.")
    .refine((s) => !(s.includes("One Size") && s.length > 1), "One Size can't be combined with other sizes."),
  collections: z.array(z.enum(COLLECTION_OPTIONS.map((c) => c.value) as [string, ...string[]])),
  image: z.string().min(1, "Choose a photo."),
});

const readValues = (formData: FormData): ProductFormValues => ({
  name: String(formData.get("name") ?? ""),
  code: String(formData.get("code") ?? ""),
  category: String(formData.get("category") ?? ""),
  subtitle: String(formData.get("subtitle") ?? ""),
  fabric: String(formData.get("fabric") ?? ""),
  description: String(formData.get("description") ?? ""),
  price: String(formData.get("price") ?? ""),
  stock: String(formData.get("stock") ?? ""),
  sizes: formData.getAll("sizes").map(String),
  collections: formData.getAll("collections").map(String),
  image: String(formData.get("image") ?? ""),
});

/** "Raw Silk Kaftan" → "raw-silk-kaftan" (the product's URL on the store) */
const slugify = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // drop accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "product";

/** First free slug: name, name-2, name-3 … */
async function uniqueSlug(name: string) {
  const base = slugify(name);
  const taken = new Set((await db.product.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map((p) => p.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/**
 * Validate the product form, then create a new product (no id) or update an existing one (id).
 * The store cache is refreshed so the change shows right away.
 */
export async function saveProduct(_prev: ProductActionState, formData: FormData): Promise<ProductActionState> {
  await requireAdmin();
  const values = readValues(formData);
  const rawId = formData.get("id");
  const id = z.string().min(1).max(50).safeParse(rawId);
  const parsed = productSchema.safeParse(values);

  const fail = (fieldErrors: ProductActionState["fieldErrors"], message = "Please fix the highlighted fields.") => ({
    ok: false,
    message,
    fieldErrors,
    values,
  });

  if (!parsed.success) {
    const e = z.flattenError(parsed.error).fieldErrors;
    return fail(Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v?.[0]])) as ProductActionState["fieldErrors"]);
  }
  // the photo must be one the store already serves (no arbitrary paths / URLs)
  if (!(await getProductImageOptions()).includes(parsed.data.image)) return fail({ image: "Choose one of the photos shown." });

  // ---------- create ----------
  if (rawId === null) {
    const { image, category, ...data } = parsed.data;
    const [slug, last] = await Promise.all([
      uniqueSlug(data.name),
      db.product.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } }),
    ]);
    const created = await db.product.create({
      data: {
        ...data,
        id: randomUUID(),
        slug,
        category: category as Category,
        images: [image],
        sortOrder: (last?.sortOrder ?? 0) + 1, // new pieces go to the end of the store order
      },
      select: { id: true },
    });
    updateTag("products");
    redirect(`/admin/products/${created.id}?created=1`);
  }

  // ---------- update ----------
  if (!id.success) return { ok: false, message: "Product not found." };

  const existing = await db.product.findUnique({ where: { id: id.data }, select: { images: true, collections: true } });
  if (!existing) return { ok: false, message: "Product not found." };

  const { image, category, ...data } = parsed.data;
  await db.product.update({
    where: { id: id.data },
    data: {
      ...data,
      category: category as Category,
      // keep "look-01" (not offered in the form) so the home page look stays intact
      collections: [...data.collections, ...existing.collections.filter((c) => c === "look-01")],
      // chosen photo first; any extra gallery photos stay after it
      images: [image, ...existing.images.filter((i) => i !== image)],
    },
  });

  updateTag("products"); // home, listing and product pages read products from the cache
  redirect(`/admin/products/${id.data}?saved=1`); // back to the details page, which shows a "Saved" note
}

const UPLOAD_MAX_BYTES = 1.5 * 1024 * 1024; // the browser resizes first, so real uploads are far smaller

// first bytes of each allowed format — a renamed non-image file is rejected even if its type claims image/*
const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  "image/webp": (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
};

/** Save a photo picked from the admin's computer / phone gallery; returns its /media URL for the photo picker. */
export async function uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo." };
  if (!(file.type in SIGNATURES)) return { error: "Use a JPG, PNG or WebP photo." };
  if (file.size > UPLOAD_MAX_BYTES) return { error: "This photo is too large. Try a smaller one." };

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!SIGNATURES[file.type](bytes)) return { error: "This file isn't a valid image." };

  const row = await db.productImage.create({ data: { data: bytes, mime: file.type, size: bytes.length }, select: { id: true } });
  return { url: `/media/${row.id}` };
}

/**
 * Delete a product. Its reviews go with it (onDelete: Cascade); past orders keep their own copy of the
 * name / photo / price (order items are snapshots, the product link just becomes null).
 */
export async function deleteProduct(_prev: ProductActionState, formData: FormData): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = z.string().min(1).max(50).safeParse(formData.get("id"));
  if (!parsed.success) return { ok: false, message: "Product not found." };

  const deleted = await db.product.deleteMany({ where: { id: parsed.data } });
  if (deleted.count === 0) return { ok: false, message: "This product was already deleted." };

  updateTag("products"); // the store stops showing it
  updateTag("reviews");
  redirect(`/admin/products?deleted=${encodeURIComponent(String(formData.get("name") ?? ""))}`);
}
