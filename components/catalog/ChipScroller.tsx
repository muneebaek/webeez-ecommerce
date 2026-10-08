"use client";

import { useEffect, useRef } from "react";

// Mobile-il chips row horizontal scroll aanu — active chip screen-inu purathaanenkil athine view-ilekku kondu varum
export default function ChipScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = ref.current;
    const active = nav?.querySelector<HTMLElement>(".is-active");
    if (!nav || !active) return;
    // page scroll aakaathe row mathram scroll — active chip naduvil
    nav.scrollLeft = active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2;
  });

  return (
    <nav ref={ref} className="catalog-chips" aria-label="Filter products">
      {children}
    </nav>
  );
}
