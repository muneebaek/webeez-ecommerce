"use client";

import { cartCount, useCart } from "./cart";
import { useHydrated } from "./use-hydrated";
import { useWishlist } from "./wishlist";

// Header, mobile tab bar, drawer — all use these hooks (single source)
export function useCartCount() {
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.items));
  return hydrated ? count : 0;
}

export function useWishlistCount() {
  const hydrated = useHydrated();
  const count = useWishlist((s) => s.ids.length);
  return hydrated ? count : 0;
}

/** 2 → "02" (PDF style: CART [02]) */
export const pad2 = (n: number) => String(n).padStart(2, "0");
