import Form from "next/form";

// Orders search — submits to /admin/orders?q=… (next/form: client navigation, works without JS too)
export default function AdminSearch({ className = "", autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  return (
    <Form action="/admin/orders" className={`adm-search ${className}`} role="search">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input type="search" name="q" placeholder="Search orders, customers…" aria-label="Search orders" autoComplete="off" autoFocus={autoFocus} />
    </Form>
  );
}
