import { getProductsByCollection } from "@/lib/data/products";
import LookInteractive from "./LookInteractive";

// Image-il oro piece-um evide aanu (% — image box-inte left / top)
const hotspots: Record<string, { x: number; y: number }> = {
  lk01: { x: 47, y: 31 }, // tunic — chest
  lk02: { x: 48, y: 84 }, // trouser
  lk03: { x: 43, y: 40 }, // brass cuff — wrist
};

export default async function LookDossier() {
  // server-il data edukkunnu; click / hover ulla bhaagam mathram client component
  const items = (await getProductsByCollection("look-01")).map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    slug: p.slug,
    image: p.images[0],
    size: p.sizes[0] ?? "One Size",
    spot: hotspots[p.id] ?? { x: 50, y: 50 },
  }));

  return (
    <section className="bg-ivory py-14 lg:py-20">
      <div className="page-shell">
        {/* ---------- Top row ---------- */}
        <div className="flex items-center justify-between gap-4 whitespace-nowrap border-b-2 border-rule pb-4 text-[0.5rem] font-medium uppercase tracking-[0.15em] sm:text-[0.5625rem] sm:tracking-[0.25em] lg:text-[0.625rem]">
          <span className="text-taupe-dark">[ Look Archive 01 ]</span>
          <span className="text-rose">Interactive Wardrobe Dossier</span>
        </div>

        <LookInteractive items={items} />
      </div>
    </section>
  );
}
