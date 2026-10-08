// Current month calendar — rose dot on days with orders, today highlighted. Server component (no state).
const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

export default function MiniCalendar({
  year,
  month,
  today,
  days,
}: {
  year: number;
  month: number; // 1–12
  today: number;
  days: number[];
}) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday start
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const orderDays = new Set(days);
  const title = first.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div className="adm-panel adm-panel--sky">
      <div className="adm-panel__head">
        <h2>Calendar</h2>
        <span className="adm-muted text-[0.75rem]">{title}</span>
      </div>
      <div className="adm-cal">
        {WEEK.map((d, i) => (
          <span key={i} className="adm-cal__dow">
            {d}
          </span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={`e${i}`} />
          ) : (
            <span
              key={d}
              className={`adm-cal__day ${d === today ? "is-today" : ""} ${orderDays.has(d) ? "has-order" : ""}`}
              title={orderDays.has(d) ? "Orders placed" : undefined}
            >
              {d}
            </span>
          ),
        )}
      </div>
      <p className="adm-cal__legend">
        <span aria-hidden="true" /> Days with orders
      </p>
    </div>
  );
}
