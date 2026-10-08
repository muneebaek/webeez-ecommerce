"use client";

import { useHydrated } from "@/store/use-hydrated";
import { useWishlist } from "@/store/wishlist";

// Global wishlist store — one state per product across all sections; survives reloads
export default function WishlistButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const hydrated = useHydrated();
  const saved = useWishlist((s) => s.ids.includes(productId)) && hydrated;
  const toggle = useWishlist((s) => s.toggle);

  return (
    <button
      type="button"
      className={`product-card__wish ${saved ? "is-saved" : ""}`}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
      aria-pressed={saved}
      onClick={() => toggle(productId)}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
