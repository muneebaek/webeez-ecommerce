"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";

type Point = { key: string; label: string; orders: number; revenue: number };

// SVG line + area chart — no library needed. Orders / Revenue toggle (client state).
const W = 640;
const H = 350;
const PAD = { top: 28, right: 18, bottom: 36, left: 56 };

export default function OrdersChart({ data }: { data: Point[] }) {
  const [metric, setMetric] = useState<"orders" | "revenue">("orders");
  const values = data.map((d) => d[metric]);
  const max = Math.max(1, ...values);
  // y axis nice max: orders → whole number, revenue → multiple of 1000
  const top = metric === "orders" ? Math.max(4, Math.ceil(max / 4) * 4) : Math.ceil(max / 4000) * 4000 || 4000;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;

  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  const area = `${line} L${x(values.length - 1)},${PAD.top + innerH} L${x(0)},${PAD.top + innerH} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * top);
  const peak = values.indexOf(Math.max(...values));
  const fmt = (v: number) => (metric === "revenue" ? (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`) : String(v));

  // 7-day summary — below the chart
  const totalOrders = data.reduce((n, d) => n + d.orders, 0);
  const totalRevenue = data.reduce((n, d) => n + d.revenue, 0);
  const summary = [
    { label: "Orders · 7 days", value: String(totalOrders) },
    { label: "Revenue · 7 days", value: formatINR(totalRevenue) },
    { label: "Avg. order", value: formatINR(totalOrders ? Math.round(totalRevenue / totalOrders) : 0) },
  ];

  return (
    <div className="adm-panel flex flex-col">
      <div className="adm-panel__head">
        <h2>Orders Overview</h2>
        <div className="adm-toggle" role="tablist" aria-label="Chart metric">
          {(["orders", "revenue"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={metric === m} className={metric === m ? "is-active" : ""} onClick={() => setMetric(m)}>
              {m === "orders" ? "Orders" : "Revenue"}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="adm-chart" role="img" aria-label={`${metric} for the last 7 days`}>
        <defs>
          <linearGradient id="adm-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a85f67" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#a85f67" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="adm-chart__grid" />
            <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" className="adm-chart__axis">
              {fmt(t)}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#adm-area)" />
        <path d={line} className="adm-chart__line" />
        {values.map((v, i) => (
          <g key={data[i].key}>
            <circle cx={x(i)} cy={y(v)} r={i === peak && v > 0 ? 4.5 : 3.5} className="adm-chart__dot">
              <title>{`${data[i].label}: ${metric === "revenue" ? formatINR(v) : `${v} orders`}`}</title>
            </circle>
            <text x={x(i)} y={H - 8} textAnchor="middle" className="adm-chart__axis">
              {data[i].label}
            </text>
          </g>
        ))}
        {/* peak day bubble — like the "Great job!" in the reference image */}
        {values[peak] > 0 && (
          <g transform={`translate(${Math.min(Math.max(x(peak), PAD.left + 40), W - PAD.right - 40)}, ${Math.max(y(values[peak]) - 22, 12)})`}>
            <rect x="-40" y="-14" width="80" height="22" rx="11" className="adm-chart__bubble" />
            <text y="1" textAnchor="middle" className="adm-chart__bubble-text">
              Best day ✦
            </text>
          </g>
        )}
      </svg>

      <dl className="adm-chart__summary mt-auto">
        {summary.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
