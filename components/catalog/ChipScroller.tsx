"use client";

import { useEffect, useRef } from "react";

// On mobile the chip row scrolls horizontally — brings the active chip into view if it's off-screen
export default function ChipScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = ref.current;
    const active = nav?.querySelector<HTMLElement>(".is-active");
    if (!nav || !active) return;
    // scroll only the row, not the page — active chip centred
    nav.scrollLeft = active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2;
  });

  return (
    <nav ref={ref} className="catalog-chips" aria-label="Filter products">
      {children}
    </nav>
  );
}
