import Link from "next/link";

type Crumb = { label: string; href?: string }; // no href = current page

// "← Home / Collections / Women" — shared by all inner pages (product, cart, checkout…)
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        <li>
          <Link href="/" className="crumbs__home">
            <span className="crumbs__arrow" aria-hidden="true">←</span>
            Home
          </Link>
        </li>
        {items.map((c) => (
          <li key={c.label}>
            <span className="crumbs__sep" aria-hidden="true">/</span>
            {c.href ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span aria-current="page" className="crumbs__current">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
