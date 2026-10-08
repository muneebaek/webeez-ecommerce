"use client";

import { pad2, useCartCount, useWishlistCount } from "@/store/counts";

// Header server component aanu — live count mathram ee cheriya client pieces-il

export function WishlistCountText() {
  return <>({useWishlistCount()})</>;
}

export function CartCountText() {
  return <>[{pad2(useCartCount())}]</>;
}
