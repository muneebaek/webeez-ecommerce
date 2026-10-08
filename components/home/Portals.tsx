import Image from "next/image";
import Link from "next/link";

// Each portal links to a category — kept as a data array so the JSX isn't repeated
const portals = [
  {
    no: "01",
    title: "Women",
    href: "/products?category=women",
    image: "/images/portals/women.jpg",
    position: "50% 25%", // keep the face from being cropped
    text: "Structured saris, flowing angrakhas, and tailored mineral palazzos engineered for unencumbered movement.",
  },
  {
    no: "02",
    title: "Men",
    href: "/products?category=men",
    image: "/images/portals/men.jpg",
    position: "50% 40%",
    text: "Architectural short kurtas, relaxed linen bandhgalas, and utility trousers woven from coarse organic cotton.",
  },
  {
    no: "03",
    title: "Essentials",
    href: "/products?category=essentials",
    image: "/images/portals/essentials.jpg",
    position: "50% 50%",
    text: "Curated trans-seasonal building blocks, minimalist layering scarves, and accessible wardrobe foundation staples.",
  },
];

export default function Portals() {
  return (
    <section className="portals">
      <div className="page-shell">
        {/* ---------- Section heading (custom CSS: portals.css) ---------- */}
        <header className="portals__head">
          <div>
            <p className="portals__label">[ Section 02 / Exhibition Portals ]</p>
            <h2 className="portals__title">Choose Your Direction</h2>
          </div>
          <p className="portals__intro">
            Three architectural entry points into natural fiber tailoring, fluid
            movement, and everyday ceremonial form.
          </p>
        </header>

        {/* ---------- Portal cards (Tailwind inline) ---------- */}
        <div className="mt-10 grid border border-rule divide-y divide-rule md:mt-12 md:grid-cols-3 md:divide-x md:divide-y-0">
          {portals.map((portal) => (
            <Link
              key={portal.no}
              href={portal.href}
              className="group flex flex-col bg-paper p-5 sm:p-6 lg:p-8"
            >
              {/* top row: PORTAL / 01 ........ EXPLORE → */}
              <div className="flex items-center justify-between text-[0.5625rem] font-medium uppercase tracking-[0.25em]">
                <span className="text-taupe">Portal / {portal.no}</span>
                <span className="text-rose">
                  Explore{" "}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>

              {/* image 3:4 + tag */}
              <div className="relative mt-4 aspect-[3/4] overflow-hidden border-2 border-rule">
                <Image
                  src={portal.image}
                  alt={`${portal.title} collection`}
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{ objectPosition: portal.position }}
                />
                <span className="absolute bottom-3 left-3 bg-slate px-2.5 py-1 text-[0.5625rem] font-medium uppercase tracking-[0.15em] text-ivory">
                  {portal.title}
                </span>
              </div>

              {/* Cormorant 600 ≈ the weight of the PDF's EB Garamond regular */}
              <h3 className="mt-6 font-serif text-[2rem] font-semibold leading-none uppercase text-ink">
                {portal.title}
              </h3>
              <p className="mt-3 max-w-88 text-[0.8125rem] leading-[1.55] text-taupe">
                {portal.text}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
