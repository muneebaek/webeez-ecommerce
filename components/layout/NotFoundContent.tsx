import Link from "next/link";

// 404 content — root not-found-um (store)/not-found-um ithu thanne use cheyyunnu
export default function NotFoundContent() {
  return (
    <div className="bg-ivory">
      <section className="page-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ Archive 404 ]</p>
        <h1 className="mt-4 text-[clamp(2.5rem,6vw,4.5rem)] font-semibold uppercase leading-none text-ink">
          Still on the Loom.
        </h1>
        <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-taupe-dark">
          This page is being woven and will be ready soon. Meanwhile, explore the current collection.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center gap-2 bg-slate px-8 text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-ivory transition-colors hover:bg-rose"
        >
          Back to Home <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
