"use client";

import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { MAX_QTY, useCart, type CartItem } from "@/store/cart";

// Oru cart item row — cart drawer-um /cart page-um ithu thanne use cheyyunnu
export default function CartLine({
  item,
  size = "sm",
  onNavigate,
}: {
  item: CartItem;
  size?: "sm" | "lg"; // sm = drawer, lg = cart page
  onNavigate?: () => void; // drawer-il ninnu product-ilekku pokumbol drawer close cheyyaan
}) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const href = `/products/${item.slug}`;

  return (
    <li className={`cart-line ${size === "lg" ? "cart-line--lg" : ""}`}>
      <Link href={href} onClick={onNavigate} className="cart-line__media">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes={size === "lg" ? "128px" : "80px"}
          className="object-cover object-top"
        />
      </Link>

      <div className="cart-line__info">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={href} onClick={onNavigate} className="cart-line__name">
              {item.name}
            </Link>
            <p className="cart-line__meta">
              Size: {item.size}
              {size === "lg" && <span className="ml-3">{formatINR(item.price)} each</span>}
            </p>
          </div>
          <p className="cart-line__price">{formatINR(item.price * item.qty)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          {/* qty stepper — 1 to MAX_QTY */}
          <div className="cart-line__qty" role="group" aria-label={`Quantity for ${item.name}`}>
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={item.qty <= 1}
              onClick={() => setQty(item.key, item.qty - 1)}
            >
              −
            </button>
            <span aria-live="polite">{item.qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={item.qty >= MAX_QTY}
              onClick={() => setQty(item.key, item.qty + 1)}
            >
              +
            </button>
          </div>
          <button type="button" className="cart-line__remove" onClick={() => remove(item.key)}>
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
