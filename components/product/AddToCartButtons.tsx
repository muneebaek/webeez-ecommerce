"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useCartUi } from "@/store/cart-ui";

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string; // first size when added from a card (users choose on the product page)
  inStock: boolean;
};

// ProductCard is a server component — only the buttons with click logic are client
export default function AddToCartButtons({ product }: { product: CartProduct }) {
  const add = useCart((s) => s.add);
  const openCart = useCartUi((s) => s.openCart);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  // "Added ✓" feedback reverts to the original text after 1.5s
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(t);
  }, [added]);

  const addItem = () =>
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: product.size,
      price: product.price,
    });

  if (!product.inStock) {
    return (
      <div className="product-card__actions">
        <button type="button" disabled className="product-card__btn product-card__btn--solid col-span-full opacity-50">
          Sold Out
        </button>
      </div>
    );
  }

  return (
    <div className="product-card__actions">
      <button
        type="button"
        className="product-card__btn product-card__btn--solid"
        onClick={() => {
          addItem();
          setAdded(true);
          openCart(); // open the drawer to show what was added
        }}
      >
        {added ? "Added ✓" : "Add to Cart"}
      </button>
      <button
        type="button"
        className="product-card__btn product-card__btn--outline"
        onClick={() => {
          addItem();
          router.push("/checkout"); // straight to checkout
        }}
      >
        Buy Now
      </button>
    </div>
  );
}
