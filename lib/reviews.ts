// Reviews — ippo static (database step-il Review table-il ninnu varum, ithe shape)

export type Review = {
  id: string;
  name: string;
  city: string;
  rating: number; // 1–5
  title: string;
  body: string;
  date: string; // ISO
};

const pool: Omit<Review, "id">[] = [
  { name: "Ananya V.", city: "Mumbai", rating: 5, title: "Feels like an heirloom", body: "The weave is beautiful up close and the fall is effortless. Wore it to a gallery opening and to dinner the same evening.", date: "2026-09-18" },
  { name: "Rohan M.", city: "Bengaluru", rating: 5, title: "Perfect everyday piece", body: "Breathable even in humid weather and softens with every wash. The fit is exactly as the size guide says.", date: "2026-09-02" },
  { name: "Meera K.", city: "London", rating: 4, title: "Beautiful, runs slightly large", body: "Gorgeous colour and finishing. I would size down if you prefer a closer fit — otherwise perfect.", date: "2026-08-27" },
  { name: "Ishita P.", city: "Delhi", rating: 5, title: "Quietly special", body: "Minimal at first glance but the details reveal themselves. Packaging was lovely too.", date: "2026-08-14" },
  { name: "Arjun S.", city: "Pune", rating: 4, title: "Great quality", body: "Fabric feels substantial without being heavy. Delivery took four days with cash on delivery.", date: "2026-07-30" },
  { name: "Nisha R.", city: "Chennai", rating: 5, title: "Worth every rupee", body: "Compliments every time I wear it. The handloom texture photographs beautifully.", date: "2026-07-21" },
];

/** Oro product-inum 2–3 reviews (product id anusarichu same set — refresh cheythaalum maarilla) */
export function getReviews(productId: string): Review[] {
  const seed = [...productId].reduce((n, c) => n + c.charCodeAt(0), 0);
  const count = 2 + (seed % 2);
  return Array.from({ length: count }, (_, i) => {
    const r = pool[(seed + i * 2) % pool.length];
    return { ...r, id: `${productId}-r${i}` };
  });
}

export function averageRating(reviews: Review[]) {
  if (reviews.length === 0) return 0;
  return Math.round((reviews.reduce((n, r) => n + r.rating, 0) / reviews.length) * 10) / 10;
}
