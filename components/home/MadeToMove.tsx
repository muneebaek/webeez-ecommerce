import Image from "next/image";
import Link from "next/link";

export default function MadeToMove() {
  return (
    <section className="border-y-2 border-rule bg-rose py-16 lg:py-28">
      <div className="page-shell grid items-center gap-12 lg:grid-cols-[1fr_35.5rem] lg:gap-16">
        {/* ---------- Left: text (custom CSS: made-to-move.css) ---------- */}
        <div className="move">
          <p className="move__label">
            <span className="size-2 bg-ivory" aria-hidden="true" />
            Campaign Report 04
          </p>

          <h2 className="move__title">
            Made To
            <br />
            Move.
          </h2>

          <p className="mt-6 max-w-[31rem] font-serif text-[1.2rem] leading-[1.6] text-[#f3ebe7] lg:text-[1.375rem]">
            Clothing that respects the kinetic human body. Designed around walking,
            sitting on gallery benches, long dining tables, and cross-continental air
            transit.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/products" className="move__btn group">
              Shop the Edit
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
            <span className="text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-[#f3ebe7]/85">
              100% Breathable Fibers
            </span>
          </div>
        </div>

        {/* ---------- Right: framed image + caption ---------- */}
        <figure className="relative border-2 border-[#dfdcd6] bg-ivory p-3.5 shadow-[0_24px_48px_-20px_rgb(15_30_34/0.45)]">
          <div className="relative aspect-4/5 overflow-hidden">
            <Image
              src="/images/made-to-move/made-to-move.jpg"
              alt="Model in a lehenga with flowing dupatta on a palace terrace, black and white"
              fill
              sizes="(min-width: 1024px) 568px, 100vw"
              className="object-cover object-[50%_60%] grayscale"
            />
          </div>
          {/* caption frame-inte thazhe left corner-il purathekku irangi nilkkum */}
          <figcaption className="absolute -bottom-4 -left-2 border border-ivory bg-slate sm:-left-4 px-6 py-3.5 text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-ivory lg:text-[0.625rem]">
            Zero Restriction Drape
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
