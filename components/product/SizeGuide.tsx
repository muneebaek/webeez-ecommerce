"use client";

import { useRef } from "react";
import Link from "next/link";
import { MEASURE_TIPS, SIZE_CHART } from "@/lib/help";

// "Size Guide" on the product page → a modal with the size chart.
// Native <dialog>: showModal() gives the backdrop, Esc to close and keeps keyboard focus inside.
export default function SizeGuide() {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" className="pdp-buy__guide" onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        Size Guide
      </button>

      <dialog
        ref={ref}
        className="size-guide"
        aria-labelledby="size-guide-title"
        // a click on the backdrop lands on the <dialog> itself (the content is wrapped in a div)
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="size-guide__body">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ Fit ]</p>
              <h2 id="size-guide-title" className="mt-2 text-[2rem] font-semibold uppercase leading-none text-ink">
                Size Guide
              </h2>
            </div>
            <button type="button" onClick={close} className="size-guide__close" aria-label="Close size guide">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="help-table mt-6">
            <table>
              <caption>{SIZE_CHART.caption}</caption>
              <thead>
                <tr>
                  {SIZE_CHART.head.map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="size-guide__tips">
            {MEASURE_TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <Link href="/help/size-guide" className="mt-6 inline-block text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ink hover:text-rose" onClick={close}>
            Full size guide →
          </Link>
        </div>
      </dialog>
    </>
  );
}
