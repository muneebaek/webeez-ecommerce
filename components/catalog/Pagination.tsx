import Link from "next/link";
import { hrefWith, type Filters } from "@/lib/catalog";

const pad2 = (n: number) => String(n).padStart(2, "0");

// "←  01 02 03  →" — every page is a URL (?page=2), rendered on the server, no JS needed
export default function Pagination({
  filters,
  page,
  totalPages,
}: {
  filters: Filters;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="pager mt-10 border-t-2 border-rule pt-6">
      {page > 1 ? (
        <Link href={hrefWith(filters, { page: page - 1 })} className="pager__link pager__link--prev" rel="prev" aria-label="Previous page">
          <span aria-hidden="true">←</span>
        </Link>
      ) : (
        <span className="pager__link pager__link--prev pager__disabled" aria-disabled="true">
          <span aria-hidden="true">←</span>
        </span>
      )}

      {/* page numbers — on mobile and desktop */}
      <ol className="pager__nums">
        {pages.map((n) => (
          <li key={n}>
            {n === page ? (
              <span className="pager__num is-current" aria-current="page">
                {pad2(n)}
              </span>
            ) : (
              <Link href={hrefWith(filters, { page: n })} className="pager__num" aria-label={`Page ${n}`}>
                {pad2(n)}
              </Link>
            )}
          </li>
        ))}
      </ol>


      {page < totalPages ? (
        <Link href={hrefWith(filters, { page: page + 1 })} className="pager__link pager__link--next" rel="next" aria-label="Next page">
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className="pager__link pager__link--next pager__disabled" aria-disabled="true">
          <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
