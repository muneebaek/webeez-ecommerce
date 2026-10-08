"use client";

import { useState } from "react";
import Image from "next/image";
import { formatINR } from "@/lib/format";

type LookItem = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  spot: { x: number; y: number };
};

export default function LookInteractive({ items }: { items: LookItem[] }) {
  // image-ile number-um list-ile row-um link aanu — onninu hover cheythaal mattathum highlight
  const [active, setActive] = useState<string | null>(null);
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="look mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[1fr_24rem] lg:items-center lg:gap-12 xl:grid-cols-[minmax(0,1fr)_29rem] xl:items-stretch">
      {/* ---------- Left: image + hotspots ---------- */}
      {/* Wide image (16:9). xl: box = baaki width × right content height.
          Ullile wrapper image ratio-il box-ine cover cheyyum (container query units) —
          model center-il aayathukondu sides mathram crop aakum, head + kaal full kaanum.
          Hotspot dots wrapper-inte ullil — crop aayaalum correct sthalathu nilkkum */}
      <div className="relative aspect-[1672/941] overflow-hidden border border-rule [container-type:size] xl:aspect-auto">
        <div className="absolute left-1/2 top-1/2 aspect-[1672/941] w-[max(100cqw,calc(100cqh*1.7768))] -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/images/look/look-01-wide.png"
            alt="Model in a layered ivory linen tunic, wide-leg trousers and brass cuffs in a stone courtyard"
            fill
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover"
          />
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`look__spot ${active === item.id ? "is-active" : ""}`}
              style={{ left: `${item.spot.x}%`, top: `${item.spot.y}%` }}
              aria-label={`${item.name} — ${formatINR(item.price)}`}
              onMouseEnter={() => setActive(item.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(item.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === item.id ? null : item.id)}
            >
              0{i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Right: look details ---------- */}
      <div className="flex flex-col">
        <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-rose lg:text-[0.625rem]">
          Complete Installation Look
        </p>
        <h2 className="mt-3 text-[clamp(2rem,3.4vw,2.75rem)] leading-[1.02] uppercase text-ink [font-variant-numeric:lining-nums]">
          Look 01: Monolithic Drape
        </h2>
        <p className="mt-4 text-[0.875rem] leading-relaxed text-taupe-dark">
          Curated together as a continuous volumetric composition. Can be acquired
          individually or collectively as an ensemble.
        </p>

        <ul className="mt-8">
          {items.map((item, i) => (
            <li
              key={item.id}
              className={`look__row ${active === item.id ? "is-active" : ""}`}
              onMouseEnter={() => setActive(item.id)}
              onMouseLeave={() => setActive(null)}
            >
              <span className="look__num">0{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[1.25rem] font-semibold leading-tight text-ink lg:text-[1.4rem]">
                  {item.name}
                </p>
                <p className="mt-1 text-[0.75rem] text-taupe-dark">{item.subtitle}</p>
              </div>
              <span className="look__price">{formatINR(item.price)}</span>
              {/* cart step-il connect cheyyum */}
              <button type="button" className="look__add">
                Add
              </button>
            </li>
          ))}
        </ul>

        {/* ---------- Total ---------- */}
        <div className="mt-6 border-2 border-rule bg-paper p-5 lg:p-6 xl:mt-auto">
          <div className="flex items-end justify-between gap-4">
            <span className="text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-taupe-dark">
              Total Suite Ensemble
            </span>
            <span className="look__total">{formatINR(total)}</span>
          </div>
          <button type="button" className="look__cta group mt-4">
            Add Complete Look to Cart
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
