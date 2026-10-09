import Image from "next/image";
import Link from "next/link";
import { stockState } from "@/lib/admin-products";
import type { getAdminProducts } from "@/lib/data/admin";
import { formatINR } from "@/lib/format";

type ProductRow = Awaited<ReturnType<typeof getAdminProducts>>["items"][number];

const categoryLabel = (c: string) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();

function StockBadge({ stock }: { stock: number }) {
  const s = stockState(stock);
  return <span className={`adm-stock is-${s.tone}`}>{s.label}</span>;
}

// Products list — cards on mobile, table from md up. Every row opens the product's edit page.
export default function ProductsList({ products }: { products: ProductRow[] }) {
  return (
    <>
      {/* mobile: each product as its own card */}
      <ul className="grid grid-cols-1 gap-3 p-4 md:hidden">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/products/${p.id}`} className="adm-order-card flex items-center gap-3">
              <span className="adm-line__thumb">
                {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover object-top" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">{p.name}</span>
                <span className="adm-muted block truncate text-[0.75rem]">
                  {p.code} · {categoryLabel(p.category)}
                </span>
                <span className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="adm-price">{formatINR(p.price)}</span>
                  <StockBadge stock={p.stock} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* tablet / desktop: table — every cell links to the product (see OrdersList) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Code</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const href = `/admin/products/${p.id}`;
              return (
                <tr key={p.id} className="adm-table__row-link">
                  <td>
                    <Link href={href} className="adm-cell adm-cell--row">
                      <span className="adm-line__thumb adm-line__thumb--sm">
                        {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover object-top" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-72 truncate font-semibold text-ink">{p.name}</span>
                        <span className="adm-muted block text-[0.75rem]">{p.fabric}</span>
                      </span>
                    </Link>
                  </td>
                  <Cell href={href} className="adm-muted">
                    {p.code}
                  </Cell>
                  <Cell href={href}>{categoryLabel(p.category)}</Cell>
                  <Cell href={href} className="adm-price">
                    {formatINR(p.price)}
                  </Cell>
                  <Cell href={href}>
                    <StockBadge stock={p.stock} />
                  </Cell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// extra cells are links too, but out of the tab order (one stop per row)
function Cell({ href, className = "", children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <td className={className}>
      <Link href={href} className="adm-cell" tabIndex={-1}>
        {children}
      </Link>
    </td>
  );
}
