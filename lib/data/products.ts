import "server-only";
import { cacheTag } from "next/cache";
import type { Product as DbProduct } from "@prisma/client";
import { db } from "@/lib/db";
import type { Product } from "@/lib/products";
import type { Review } from "@/lib/reviews";

// Database queries — server-il mathram. 'use cache' + cacheTag:
// result cache-il vekkum (page vegam), admin edit cheyyumbol updateTag('products') vechu refresh.

/** DB row → app-ile Product shape (components maattenda) */
function toProduct(row: DbProduct): Product {
  return {
    id: row.id,
    slug: row.slug,
    code: row.code,
    name: row.name,
    subtitle: row.subtitle,
    fabric: row.fabric,
    category: row.category,
    collections: row.collections,
    price: row.price,
    images: row.images,
    sizes: row.sizes,
    stock: row.stock,
    badge: row.badgeLabel ? { label: row.badgeLabel, tone: (row.badgeTone ?? "dark") as "dark" | "rose" | "sage" } : undefined,
    status: row.status ?? undefined,
    statusAccent: row.statusAccent || undefined,
    eyebrow: row.eyebrow ?? undefined,
    description: row.description,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheTag("products");
  const rows = await db.product.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(toProduct);
}

export async function getProductsByCollection(collection: string): Promise<Product[]> {
  "use cache";
  cacheTag("products");
  const rows = await db.product.findMany({
    where: { collections: { has: collection } },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheTag("products");
  const row = await db.product.findUnique({ where: { slug } });
  return row ? toProduct(row) : null;
}

export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("products");
  const rows = await db.product.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

/** Same category first, kuravaanenkil vere category; Look 01 pieces ozhivaakki */
export async function getSimilarProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getAllProducts();
  const visible = all.filter((p) => p.id !== product.id && !p.collections.includes("look-01"));
  const same = visible.filter((p) => p.category === product.category);
  const rest = visible.filter((p) => p.category !== product.category);
  return [...same, ...rest].slice(0, limit);
}

export async function getReviews(productId: string): Promise<Review[]> {
  "use cache";
  cacheTag("reviews");
  const rows = await db.review.findMany({ where: { productId }, orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    city: r.city,
    rating: r.rating,
    title: r.title,
    body: r.body,
    date: r.createdAt.toISOString(),
  }));
}
