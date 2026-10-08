// Suspense boundary for admin pages (Next.js loading.tsx convention).
// Navigating from the sidebar shows this skeleton instantly; the page replaces it once DB data arrives.
export default function AdminLoading() {
  return (
    <div className="grid gap-8" aria-busy="true">
      <div className="adm-skeleton h-12 w-56" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="adm-skeleton h-28" />
        ))}
      </div>
      <div className="adm-skeleton h-80" />
    </div>
  );
}
