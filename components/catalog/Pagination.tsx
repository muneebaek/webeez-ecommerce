import Link from "next/link";

const pad2 = (n: number) => String(n).padStart(2, "0");

// "←  01 02 03  →" — every page is a URL (?page=2), rendered on the server, no JS needed.
// href builds the link for a page number, so the store catalog and the admin lists share this component.
export default function Pagination({
  href,
  page,
  totalPages,
  className = "mt-10 border-t-2 border-rule pt-6",
}: {
  href: (page: number) => string;
  page: number;
  totalPages: number;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className={`pager ${className}`}>
      {page > 1 ? (
        <Link href={href(page - 1)} className="pager__link pager__link--prev" rel="prev" aria-label="Previous page">
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
              <Link href={href(n)} className="pager__num" aria-label={`Page ${n}`}>
                {pad2(n)}
              </Link>
            )}
          </li>
        ))}
      </ol>


      {page < totalPages ? (
        <Link href={href(page + 1)} className="pager__link pager__link--next" rel="next" aria-label="Next page">
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
