import { db } from "@/lib/db";

// GET /media/<id> — a photo uploaded from the admin, read from the database.
// Ids never change content, so browsers and the CDN may cache the response for a year.
export async function GET(_req: Request, ctx: RouteContext<"/media/[id]">) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{20,40}$/i.test(id)) return new Response("Not found", { status: 404 });

  const image = await db.productImage.findUnique({ where: { id }, select: { data: true, mime: true } });
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
