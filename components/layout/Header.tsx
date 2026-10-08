import Link from "next/link";
import { navLinks } from "@/lib/navigation";
import MobileMenu from "./MobileMenu";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__top page-shell">
        <div className="site-header__left">
          <MobileMenu />
          <p className="site-header__folio hidden md:flex">
            <span>01</span>
            <span className="site-header__sep">/</span>
            <span>Gallery</span>
          </p>
        </div>

        <Link href="/" className="site-header__logo">
          Neythra
        </Link>

        {/* mobile-il ivayellam MobileTabBar-il (screen-inte thazhe) aanu */}
        <div className="site-header__actions hidden md:flex">
          <button type="button" className="site-header__action hidden lg:inline-flex">
            Search
          </button>
          <Link href="/wishlist" className="site-header__action">
            Wishlist (0)
          </Link>
          <Link href="/cart" className="site-header__action site-header__action--cart">
            Cart
            <span className="site-header__count">[02]</span>
          </Link>
          <Link href="/admin" className="site-header__avatar" aria-label="Account">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </Link>
        </div>
      </div>

      <nav className="site-header__nav hidden md:block">
        <ul className="page-shell">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="site-header__link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
