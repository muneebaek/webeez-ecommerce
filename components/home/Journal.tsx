import Image from "next/image";
import Link from "next/link";

export default function Journal() {
  return (
    // id="journal" — the header nav "Journal" link (/#journal) scrolls here
    <section id="journal" className="scroll-mt-28 border-b border-rule bg-ivory py-16 lg:py-20">
      <div className="page-shell grid items-center gap-12 lg:grid-cols-[1fr_41rem] lg:gap-16">
        {/* ---------- Left: essay (custom CSS: journal.css) ---------- */}
        <article className="journal">
          <p className="journal__label">The Neythra Journal · Essay 18</p>

          <h2 className="journal__title">
            India, Seen
            <br />
            Differently.
          </h2>

          <p className="mt-8 max-w-[29rem] text-[1.0625rem] leading-[1.7] text-taupe-dark">
            For generations, traditional Indian wear has been treated as ceremonial
            costume—confined to weddings and rigid festivities. Neythra deconstructs
            this limitation.
          </p>
          <p className="mt-5 max-w-[29rem] text-[0.875rem] leading-[1.75] text-taupe-dark">
            We isolate the geometric logic of the angrakha, the breathable structural
            drape of the dhoti, and translate them into minimalist daily uniforms
            intended for boardroom presentations, art fairs, and quiet mornings.
          </p>

          <Link href="/#journal" className="journal__cta group mt-10">
            Read Complete Dispatch
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
        </article>

        {/* ---------- Right: 2 staggered images ---------- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          <figure className="self-start border border-rule">
            <div className="relative aspect-3/4 overflow-hidden">
              <Image
                src="/images/journal/handloom.jpg"
                alt="Close-up of a wooden handloom with warp threads in warm light"
                fill
                sizes="(min-width: 1024px) 320px, 50vw"
                className="object-cover object-center"
              />
            </div>
          </figure>
          {/* second image sits 48px lower — staggered layout (like the PDF) */}
          <figure className="mt-12 self-start border border-rule">
            <div className="relative aspect-3/4 overflow-hidden">
              <Image
                src="/images/journal/linen-kurta.jpg"
                alt="Natural linen band-collar kurta on a wooden hanger"
                fill
                sizes="(min-width: 1024px) 320px, 50vw"
                className="object-cover object-center"
              />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
