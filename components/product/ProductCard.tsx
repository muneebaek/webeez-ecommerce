import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/products";
import WishlistButton from "./WishlistButton";

// Reusable card — Current Pieces, Trending, New Arrivals, Under ₹2,999 ellaam ithu use cheyyum
// variant="feature" — New Arrivals-ile valiya flagship card (wide image, valiya text)
export default function ProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "feature";
}) {
  const href = `/products/${product.slug}`;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const stockLabel =
    product.status ??
    (product.stock === 0 ? "Sold Out" : lowStock ? `${product.stock} Left` : "In Stock");

  return (
    <article className={`product-card ${variant === "feature" ? "product-card--feature" : ""}`}>
      <div className="product-card__media">
        <Link href={href} aria-label={product.name}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes={
              variant === "feature"
                ? "(min-width: 1024px) 45vw, 100vw"
                : "(min-width: 1280px) 15vw, (min-width: 768px) 30vw, 50vw"
            }
            className="product-card__image"
          />
        </Link>
        <WishlistButton productId={product.id} productName={product.name} />
        {product.badge && (
          <span className={`product-card__badge product-card__badge--${product.badge.tone}`}>
            {product.badge.label}
          </span>
        )}
      </div>

      <div className="product-card__body">
        <p className="product-card__meta">
          {product.eyebrow ? (
            <span className="product-card__eyebrow">{product.eyebrow}</span>
          ) : (
            <>
              <span>[ {product.code} ]</span>
              <span>{product.fabric}</span>
            </>
          )}
        </p>
        <h3 className="product-card__name">
          <Link href={href}>{product.name}</Link>
        </h3>
        <p className="product-card__sub">{product.subtitle}</p>

        <div className="product-card__price-row">
          <span className="product-card__price">{formatINR(product.price)}</span>
          {/* "3 Left" / "Bestseller" — rose colour-il */}
          <span
            className={`product-card__stock ${lowStock || product.statusAccent ? "product-card__stock--low" : ""}`}
          >
            {stockLabel}
          </span>
        </div>

        {/* Cart logic (Add to Cart / Buy Now) cart step-il connect cheyyum */}
        <div className="product-card__actions">
          <button type="button" className="product-card__btn product-card__btn--solid">
            Add to Cart
          </button>
          <button type="button" className="product-card__btn product-card__btn--outline">
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
