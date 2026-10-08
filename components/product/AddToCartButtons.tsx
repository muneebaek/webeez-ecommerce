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
  size: string; // card-il ninnu aadyathe size (product page-il user choose cheyyum)
  inStock: boolean;
};

// ProductCard server component aanu — click logic ulla buttons mathram client
export default function AddToCartButtons({ product }: { product: CartProduct }) {
  const add = useCart((s) => s.add);
  const openCart = useCartUi((s) => s.openCart);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  // "Added ✓" feedback 1.5s kazhinju pazhaya text-ilekku
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
          openCart(); // add cheythathu kaanaan drawer thurakkum
        }}
      >
        {added ? "Added ✓" : "Add to Cart"}
      </button>
      <button
        type="button"
        className="product-card__btn product-card__btn--outline"
        onClick={() => {
          addItem();
          router.push("/checkout"); // nere checkout-ilekku
        }}
      >
        Buy Now
      </button>
    </div>
  );
}
