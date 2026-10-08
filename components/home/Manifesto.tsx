import Image from "next/image";
import Link from "next/link";

export default function Manifesto() {
  return (
    // 760px — PDF height
    <section className="relative overflow-hidden border-b border-rule bg-slate lg:h-190">
      {/* ---------- Full-bleed background image ----------
          desktop: image box is 96px taller than the section (-top-24) —
          the image grows slightly and shifts up, so the model's chest meets the card's top edge */}
      <div className="relative aspect-4/5 sm:aspect-video lg:absolute lg:inset-x-0 lg:-top-24 lg:bottom-0 lg:aspect-auto">
        <Image
          src="/images/manifesto/new-everyday.png"
          alt="Model in an ivory linen kurta beside a reflecting pool at a stone pavilion"
          fill
          sizes="100vw"
          // slight blur; scale hides the light border the blur creates at the edges
          // mobile: model is on the left, so 32% position — centred on desktop
          className="scale-[1.01] object-cover object-[32%_50%] blur-[0.75px] lg:object-center"
        />

        {/* dark gradient at the bottom of the image — legs below the card fade into dark */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-slate/85 via-slate/40 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* top-left label (outside the image box — moving the image doesn't move the label) */}
      <p className="absolute left-4 top-5 z-10 flex items-center gap-2.5 text-[0.5625rem] font-semibold uppercase tracking-[0.25em] text-ivory sm:left-8 lg:left-16 lg:top-9 lg:text-[0.625rem]">
        <span className="size-2 bg-rose" aria-hidden="true" />
        Neythra / Archive 02 — Chandigarh
      </p>

      {/* ---------- Frosted card (custom CSS: manifesto.css) ---------- */}
      <div className="manifesto-card lg:absolute lg:bottom-20 lg:left-16 lg:w-2xl">
        <p className="manifesto-card__meta">
          <span className="text-rose">[ Exhibition Manifesto ]</span>
          <span className="text-rule">/</span>
          <span>Plate IV</span>
        </p>

        <h2 className="manifesto-card__title">
          The New
          <br />
          Everyday.
        </h2>

        <p className="mt-4 max-w-[35rem] text-[0.9375rem] leading-relaxed text-taupe">
          Stripping historic royal draping of excessive ornamentation to isolate
          line, weight, and breathing comfort for modern metropolitan existence.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/products" className="manifesto-card__cta">
            View the Exhibition Edit <span aria-hidden="true">→</span>
          </Link>
          <span className="text-[0.5625rem] font-medium uppercase tracking-[0.15em] text-taupe">
            Limited Batch of 40
          </span>
        </div>
      </div>
    </section>
  );
}
