import { Fragment } from "react";
import Link from "next/link";

const links = [
  { label: "New In Archive", href: "/products?collection=new-arrivals" },
  { label: "Bestsellers", href: "/products?collection=best-sellers" },
  { label: "Under ₹2,999", href: "/products?under=2999" },
  { label: "Trending", href: "/products?collection=trending" },
  { label: "Collections", href: "/products" },
];

export default function SelectionStrip() {
  return (
    <section className="selection-strip">
      <div className="selection-strip__inner">
        <p className="selection-strip__title">
          <span className="selection-strip__square" aria-hidden="true" />
          Expedite
          <br />
          Selection
        </p>

        <nav className="selection-strip__links" aria-label="Quick selection">
          {/* link-um slash-um ore row-ile separate items — space-between kaaranam slash randu link-inte exact naduvil */}
          {links.map((link, i) => (
            <Fragment key={link.href}>
              {i > 0 && (
                <span className="selection-strip__slash" aria-hidden="true">
                  /
                </span>
              )}
              <Link href={link.href} className="selection-strip__link">
                {link.label}
              </Link>
            </Fragment>
          ))}
        </nav>

        <p className="selection-strip__note">
          Complimentary shipping over
          <br />
          ₹5,000
        </p>
      </div>
    </section>
  );
}
