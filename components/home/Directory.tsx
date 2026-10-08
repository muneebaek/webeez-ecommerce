import Image from "next/image";
import Link from "next/link";

// Each row links to a filtered product list
const divisions = [
  { label: "Women", href: "/products?category=women" },
  { label: "Men", href: "/products?category=men" },
  { label: "New Arrivals", href: "/products?collection=new-arrivals" },
  { label: "Best Sellers", href: "/products?collection=best-sellers" },
  { label: "Everyday Weave", href: "/products?collection=everyday" },
  { label: "Occasion Silhouettes", href: "/products?collection=occasion" },
  { label: "Under ₹2,999", href: "/products?under=2999", accent: true },
];

export default function Directory() {
  return (
    <section className="bg-ivory py-14 lg:py-20">
      <div className="page-shell">
        {/* ---------- Top row ---------- */}
        <div className="flex items-center justify-between gap-4 whitespace-nowrap border-b-2 border-rule pb-4 text-[0.5rem] font-medium uppercase tracking-[0.15em] sm:text-[0.5625rem] sm:tracking-[0.25em] lg:text-[0.625rem]">
          <span className="text-taupe-dark">[ Architectural Directory ]</span>
          <span className="text-rose">Catalogue Navigator</span>
        </div>

        <div className="mt-6 grid gap-10 lg:mt-10 lg:grid-cols-[1fr_20.5rem] lg:gap-0">
          {/* ---------- Left: numbered list (custom CSS: directory.css) ---------- */}
          <ol className="directory lg:pr-12">
            {divisions.map((d, i) => (
              <li key={d.href}>
                <Link
                  href={d.href}
                  className={`directory__row ${d.accent ? "directory__row--accent" : ""}`}
                >
                  <span className="directory__label">
                    0{i + 1} / {d.label}
                  </span>
                  <span className="directory__arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>

          {/* ---------- Right: archive exhibit image + note ---------- */}
          {/* divider only on the aside (image + text) — self-start so it doesn't take the list's height */}
          <aside className="lg:self-start lg:border-l-2 lg:border-rule lg:pl-10">
            <figure className="border-2 border-rule bg-paper p-3">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/directory/archive-exhibit.jpg"
                  alt="Pastel linen shirts hanging on a rail"
                  fill
                  sizes="(min-width: 1024px) 300px, 100vw"
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-3 bottom-3 border-2 border-[#d4d0c8] bg-[#f9f7f2]/95 px-3 py-2.5 text-center">
                  <span className="block text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-slate">
                    Archive Exhibit #09
                  </span>
                  <span className="mt-1 block text-[0.75rem] leading-snug text-taupe-dark">
                    Selected from Contemporary South Asia
                    <br />
                    2026
                  </span>
                </figcaption>
              </div>
            </figure>
            <p className="mt-8 text-[0.8125rem] leading-[1.55] text-taupe-dark">
              Select any division to expand full archival specifications, weave
              density, artisan village source, and limited edition availability.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
