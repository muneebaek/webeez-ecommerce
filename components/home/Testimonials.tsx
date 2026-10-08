"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// shows initials from the name when there's no avatar
const quotes: { text: string; name: string; meta: string; avatar?: string }[] = [
  {
    text: "It feels like something I’ll wear for years. The drape feels ancient and the silhouette feels twenty years ahead.",
    name: "Ananya V.",
    meta: "Architect · Mumbai · Verified Acquisition",
    avatar: "/images/testimonials/ananya.jpg",
  },
  {
    text: "The khadi overshirt has become my studio uniform. It softens with every wash and still holds its shape.",
    name: "Rohan M.",
    meta: "Ceramicist · Bengaluru · Verified Acquisition",
  },
  {
    text: "Finally, Indian textiles cut for the way I actually live — gallery openings, long flights, quiet Sundays.",
    name: "Meera K.",
    meta: "Curator · London · Verified Acquisition",
  },
];

const INTERVAL = 4000; // 4s — auto next quote

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // auto-rotate; pauses on hover / focus
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % quotes.length), INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  const q = quotes[index];
  const initials = q.name.split(" ").map((w) => w[0]).join("").replace(".", "");

  return (
    <section
      className="testi border-y border-rule bg-paper py-16 lg:py-24"
      aria-roledescription="carousel"
      aria-label="Customer voices"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="page-shell flex flex-col items-center text-center">
        <p className="testi__label">
          <span className="size-2 bg-rose" aria-hidden="true" />
          Voices / Experiences
          <span className="size-2 bg-rose" aria-hidden="true" />
        </p>

        {/* key={index} — replays the fade-in animation when the quote changes */}
        <figure key={index} className="testi__slide" aria-live="polite">
          <blockquote className="testi__quote">&ldquo;{q.text}&rdquo;</blockquote>
          <figcaption className="mt-10 flex items-center gap-4 text-left">
            <span className="testi__avatar" aria-hidden="true">
              {q.avatar ? (
                <Image src={q.avatar} alt="" fill sizes="48px" className="origin-[53%_34%] scale-[2.2] object-cover" />
              ) : (
                initials
              )}
            </span>
            <span>
              <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink">
                {q.name}
              </span>
              <span className="mt-1 block text-[0.5625rem] font-medium uppercase tracking-[0.15em] text-taupe-dark sm:text-[0.625rem]">
                {q.meta}
              </span>
            </span>
          </figcaption>
        </figure>

        {/* ---------- Pager: 01 / 03 (like the PDF — text only, auto-rotate) ---------- */}
        <p className="testi__pager">
          <span className="text-rose">0{index + 1}</span>
          <span className="mx-5 text-rule">/</span>
          <span>0{quotes.length}</span>
        </p>
      </div>
    </section>
  );
}
