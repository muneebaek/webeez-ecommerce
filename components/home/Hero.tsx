import Image from "next/image";
import Link from "next/link";

const slides = ["01", "02", "03", "04"];

export default function Hero() {
  return (
    <section className="hero">
      {/* ---------- Left: campaign image ---------- */}
      <div className="hero__media">
        <Image
          src="/images/hero/hero-wrap-dress.jpg"
          alt="Model in a rose linen wrap dress with ivory layered panels, standing in a sunlit concrete gallery"
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="hero__image"
        />
        <span className="hero__plate">
          <span className="hero__plate-dot" aria-hidden="true" />
          Plate 01 / Ed. 2026
        </span>
        <span className="hero__caption">Museum Installation · New Delhi</span>
      </div>

      {/* ---------- Right: editorial panel ---------- */}
      <div className="hero__panel">
        <div className="hero__content">
          <div className="hero__meta">
            <span>[ Folio 01 / SS26 ]</span>
            <span className="hero__meta-accent">New Season Archive</span>
          </div>

          <p className="hero__eyebrow">Neythra / Collection 01</p>

          <h1 className="hero__title">
            Form
            <br />
            Meets
            <br />
            <em>Everyday.</em>
          </h1>

          <p className="hero__lead">
            Contemporary clothing shaped by Indian texture, architectural drape,
            structural movement, and modern pace.
          </p>

          <div className="hero__actions">
            <Link href="/products" className="hero__btn hero__btn--solid">
              Enter Collection <span aria-hidden="true">→</span>
            </Link>
            <Link href="/products" className="hero__btn hero__btn--outline">
              Shop All
            </Link>
          </div>

          <div className="hero__footer">
            <p className="hero__coords">
              <span>28°36&apos;N / 77°12&apos;E</span>
              <span className="hero__sep">|</span>
              <span>Hand-Spun Khadi</span>
            </p>
            <ol className="hero__pager" aria-label="Hero slides">
              {slides.map((n, i) => (
                <li key={n} className={i === 0 ? "is-active" : undefined}>
                  {n}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* vertical rail on the right edge */}
        <div className="hero__rail" aria-hidden="true">
          <span className="hero__rail-text">Curatorial Monograph</span>
          <span className="hero__rail-line" />
          <span className="hero__rail-num">01</span>
        </div>
      </div>
    </section>
  );
}
