// 4.7 → ★★★★★ (5-aamathe star 70% fill) — CSS width vechu partial star
export default function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const row = "★★★★★";
  return (
    <span className="stars" style={{ fontSize: size }} role="img" aria-label={`${rating} out of 5 stars`}>
      <span className="stars__base" aria-hidden="true">{row}</span>
      <span className="stars__fill" style={{ width: `${pct}%` }} aria-hidden="true">
        {row}
      </span>
    </span>
  );
}
