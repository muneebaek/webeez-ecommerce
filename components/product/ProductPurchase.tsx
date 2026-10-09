"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_QTY, useCart } from "@/store/cart";
import { useCartUi } from "@/store/cart-ui";
import { useHydrated } from "@/store/use-hydrated";
import { useWishlist } from "@/store/wishlist";
import SizeGuide from "./SizeGuide";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    sizes: string[];
    stock: number;
  };
};

// Size select + qty + Add to Cart / Buy Now / Wishlist — only the interactive part of the product page is client
export default function ProductPurchase({ product }: Props) {
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(oneSize ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);

  const add = useCart((s) => s.add);
  const openCart = useCartUi((s) => s.openCart);
  const router = useRouter();
  const hydrated = useHydrated();
  const saved = useWishlist((s) => s.ids.includes(product.id)) && hydrated;
  const toggleWish = useWishlist((s) => s.toggle);

  const soldOut = product.stock === 0;
  const maxQty = Math.min(MAX_QTY, product.stock);

  // can't add without choosing a size — shows an error
  const addToCart = () => {
    if (!size) {
      setError(true);
      return false;
    }
    add(
      { productId: product.id, slug: product.slug, name: product.name, image: product.image, size, price: product.price },
      qty,
    );
    return true;
  };

  return (
    <div className="pdp-buy">
      {/* ---------- Size ---------- */}
      <fieldset>
        <div className="flex items-center justify-between">
          <legend className="pdp-buy__label">
            Size{size && <span className="text-ink"> — {size}</span>}
          </legend>
          {/* accessories are One Size — no chart needed */}
          {!oneSize && <SizeGuide />}
        </div>
        <div className={`pdp-sizes ${error ? "has-error" : ""}`} role="radiogroup" aria-label="Choose size">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={size === s}
              className={`pdp-sizes__btn ${size === s ? "is-active" : ""}`}
              onClick={() => {
                setSize(s);
                setError(false);
              }}
            >
              {s}
            </button>
          ))}
        </div>
        {error && (
          <p className="pdp-buy__error" role="alert">
            Please select a size to continue.
          </p>
        )}
      </fieldset>

      {/* ---------- Qty ---------- */}
      {!soldOut && (
        <div className="mt-6">
          <p className="pdp-buy__label">Quantity</p>
          <div className="qty-stepper cart-line__qty mt-3" role="group" aria-label="Quantity">
            <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>
              −
            </button>
            <span aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" disabled={qty >= maxQty} onClick={() => setQty(qty + 1)}>
              +
            </button>
          </div>
        </div>
      )}

      {/* ---------- Actions ---------- */}
      <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <button
          type="button"
          disabled={soldOut}
          className="pdp-buy__btn pdp-buy__btn--solid"
          onClick={() => addToCart() && openCart()}
        >
          {soldOut ? "Sold Out" : "Add to Cart"}
        </button>
        <button
          type="button"
          disabled={soldOut}
          className="pdp-buy__btn pdp-buy__btn--rose"
          onClick={() => addToCart() && router.push("/checkout")}
        >
          Buy Now
        </button>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          className={`pdp-buy__wish ${saved ? "is-saved" : ""}`}
          onClick={() => toggleWish(product.id)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span className="sm:hidden">{saved ? "Saved" : "Wishlist"}</span>
        </button>
      </div>
    </div>
  );
}
