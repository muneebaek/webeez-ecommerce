import Link from "next/link";

// 4 link columns — kept as data so the JSX isn't repeated
const columns = [
  {
    title: "Shop",
    links: [
      { label: "New In", href: "/products?collection=new-arrivals" },
      { label: "Collections", href: "/products" },
      { label: "Women", href: "/products?category=women" },
      { label: "Men", href: "/products?category=men" },
      { label: "Under ₹2,999", href: "/products?under=2999" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Artisanal Loom", href: "/#journal" },
      { label: "Architecture & Form", href: "/#journal" },
      { label: "Curatorial Journal", href: "/#journal" },
      { label: "Atelier Provenance", href: "/#journal" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Orders & Tracking", href: "/orders" },
      { label: "Shipping & Returns", href: "/help/shipping" },
      { label: "Size Guide", href: "/help/size-guide" },
      { label: "Inquiries", href: "/help/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Profile", href: "/account" },
      { label: "Saved Pieces", href: "/wishlist" },
      { label: "Bag Archive", href: "/cart" },
      { label: "Private Client Suite", href: "/admin" },
    ],
  },
];

const social = [
  { label: "Instagram", href: "https://instagram.com/neythra" },
  { label: "Facebook", href: "https://facebook.com/neythra" },
  { label: "Archive Folio", href: "/#journal" },
];

const legal = [
  { label: "Privacy", href: "/help/privacy" },
  { label: "Terms", href: "/help/terms" },
  { label: "Shipping", href: "/help/shipping" },
  { label: "Returns", href: "/help/returns" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="page-shell">
        {/* ---------- Top: big logo + tagline ---------- */}
        <div className="grid gap-8 border-b-2 border-[#e3d8da] pb-12 pt-14 lg:grid-cols-[1fr_24.25rem] lg:items-center lg:pb-16 lg:pt-16">
          <div>
            <p className="footer__kicker">Haute Couture &amp; Art Catalogue</p>
            <Link href="/" className="footer__logo">
              Neythra
            </Link>
          </div>
          <div>
            <p className="font-serif text-[1.3rem] font-semibold italic uppercase leading-tight text-ink-soft lg:whitespace-nowrap">
              Contemporary Indian Fashion
            </p>
            <p className="mt-2 text-[0.8125rem] leading-[1.55] text-[#857374]">
              Archival explorations of drape, geometric handloom weaves, and monumental
              silhouette tailoring from the subcontinent.
            </p>
          </div>
        </div>

        {/* ---------- Link columns: mobile 2, desktop 4 ---------- */}
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 border-b-2 border-[#e3d8da] py-12 lg:grid-cols-4 lg:py-16">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="footer__heading">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ---------- Bottom bar ---------- */}
        <div className="footer__bottom">
          <ul className="flex items-center gap-4">
            {social.map((s, i) => (
              <li key={s.label} className="flex items-center gap-4">
                {i > 0 && <span className="text-divider" aria-hidden="true">/</span>}
                <Link
                  href={s.href}
                  {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="hover:text-ink"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="order-last lg:order-none">© 2026 Neythra. All reproductions reserved.</p>

          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {legal.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
