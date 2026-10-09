// Static data from lib/products.ts → Neon database
// Run: npm run db:seed   (safe to run repeatedly, no duplicates — upsert)
import { db } from "../lib/db"; // same client as the app (pg driver adapter)
import { products } from "../lib/products";
import { getReviews } from "../lib/reviews";

async function main() {
  for (const [index, p] of products.entries()) {
    const data = {
      slug: p.slug,
      code: p.code,
      name: p.name,
      subtitle: p.subtitle,
      fabric: p.fabric,
      category: p.category,
      collections: p.collections,
      price: p.price,
      images: p.images,
      sizes: p.sizes,
      stock: p.stock,
      badgeLabel: p.badge?.label ?? null,
      badgeTone: p.badge?.tone ?? null,
      status: p.status ?? null,
      statusAccent: p.statusAccent ?? false,
      eyebrow: p.eyebrow ?? null,
      description: p.description,
      sortOrder: index, // keep the current order
    };

    // update if it exists, otherwise create
    await db.product.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });

    // reviews: delete the old ones and recreate (safe to re-run)
    await db.review.deleteMany({ where: { productId: p.id } });
    await db.review.createMany({
      data: getReviews(p.id).map((r) => ({
        productId: p.id,
        name: r.name,
        city: r.city,
        rating: r.rating,
        title: r.title,
        body: r.body,
        createdAt: new Date(r.date),
      })),
    });
  }

  console.log(`Seeded ${products.length} products + reviews`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
