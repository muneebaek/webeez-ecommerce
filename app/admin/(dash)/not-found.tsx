import Link from "next/link";

// notFound() inside admin pages (e.g. an unknown order id) — stays inside the admin shell
export default function AdminNotFound() {
  return (
    <div className="adm-panel grid justify-items-center gap-3 px-5 py-16 text-center">
      <p className="adm-kicker">[ 404 ]</p>
      <h1 className="adm-hello">Not found</h1>
      <p className="adm-muted max-w-sm">This record doesn&apos;t exist or was removed.</p>
      <Link href="/admin/orders" className="adm-link mt-2">
        ← Back to orders
      </Link>
    </div>
  );
}
