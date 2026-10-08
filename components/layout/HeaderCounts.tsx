"use client";

import { pad2, useCartCount, useWishlistCount } from "@/store/counts";

// Header is a server component — only the live counts live in these small client pieces

export function WishlistCountText() {
  return <>({useWishlistCount()})</>;
}

export function CartCountText() {
  return <>[{pad2(useCartCount())}]</>;
}
