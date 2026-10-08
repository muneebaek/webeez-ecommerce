"use client";

import { useCartUi } from "@/store/cart-ui";
import { CartCountText } from "./HeaderCounts";

// Header "CART [02]" — opens the cart drawer instead of navigating
export default function HeaderCartButton() {
  const openCart = useCartUi((s) => s.openCart);
  return (
    <button
      type="button"
      onClick={openCart}
      className="site-header__action site-header__action--cart"
      aria-label="Open shopping bag"
    >
      Cart
      <span className="site-header__count">
        <CartCountText />
      </span>
    </button>
  );
}
