import Image from "next/image";
import Link from "next/link";

export default function QuietlyUnexpected() {
  return (
    <section className="grid border-y border-rule lg:h-145 lg:grid-cols-[58fr_42fr]">
      {/* ---------- Left: image ---------- */}
      <div className="relative aspect-4/5 overflow-hidden bg-paper-dark sm:aspect-video lg:aspect-auto lg:border-r lg:border-rule">
        <Image
          src="/images/quietly/quietly-layered-drape.jpg"
          alt="Model walking in layered lilac and slate linen drapes over black trousers, in a concrete courtyard"
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover object-[62%_35%]"
        />
        <span className="absolute bottom-4 left-4 border-2 border-[#b9b5ad] bg-ivory px-4 py-3 text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-slate lg:bottom-6 lg:left-6 lg:text-[0.625rem]">
          Plate 07 — Atelier Jaipur
        </span>
      </div>

      {/* ---------- Right: sage text panel (custom CSS: quietly.css) ---------- */}
      <div className="quietly bg-sage px-5 py-12 sm:px-10 lg:px-16 lg:py-16">
        <p className="quietly__label">
          <span className="size-1.75 bg-rose" aria-hidden="true" />
          Collection / 02
        </p>

        <h2 className="quietly__title">
          Quietly
          <br />
          Unexpected.
        </h2>

        <span className="quietly__accent" aria-hidden="true" />

        <p className="mt-7 max-w-[25rem] text-[1.0625rem] leading-[1.7] text-[#28353a]">
          Pieces designed to feel deeply familiar against your skin, yet structurally
          unpredictable to the spectator. Woven slowly by master weavers in Gujarat and
          Madhya Pradesh.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#9fafac] pt-8">
          <Link href="/products?collection=quietly-unexpected" className="quietly__btn group">
            Explore Collection
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
          <span className="text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-sage-ink">
            24 Looks Documented
          </span>
        </div>
      </div>
    </section>
  );
}
