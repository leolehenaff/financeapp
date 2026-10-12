"use client";
import { useState } from "react";
import { dateFr, eur } from "@/lib/format";

type Point = { date: string; value: number; cost: number | null };

/** Valeur (trait plein) et versé net (pointillé). Survol ou doigt posé : date et valeurs du jour. */
export function Chart({ points }: { points: Point[] }) {
  const [i, setI] = useState<number | null>(null);
  if (points.length < 2) return null;
  const W = 600, H = 120;
  const all = points.flatMap((p) => [p.value, p.cost ?? p.value]), min = Math.min(...all) * 0.97, max = Math.max(...all) * 1.02;
  const x = (k: number) => (k / (points.length - 1)) * W;
  const xy = (k: number, v: number) => `${x(k)},${H - ((v - min) / (max - min)) * H}`;
  const value = points.map((p, k) => xy(k, p.value));
  const cost = points.flatMap((p, k) => (p.cost == null ? [] : [xy(k, p.cost)]));
  const from = points.findIndex((p) => p.cost != null);
  const pick = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setI(Math.round(((e.clientX - r.left) / r.width) * (points.length - 1)));
  };
  const p = i == null ? null : points[Math.max(0, Math.min(points.length - 1, i))];
  const left = i == null ? 0 : (i / (points.length - 1)) * 100;
  return (
    <div className="relative mt-4 touch-pan-y select-none" onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setI(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32 block" preserveAspectRatio="none" role="img" aria-label="Valeur et montant versé sur un an">
        {cost.length > 1
          ? <polygon points={[...value.slice(from), ...[...cost].reverse()].join(" ")} fill="var(--c-stock)" opacity="0.2" />
          : <polygon points={`0,${H} ${value.join(" ")} ${W},${H}`} fill="var(--c-stock)" opacity="0.15" />}
        {cost.length > 1 && <polyline points={cost.join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
        <polyline points={value.join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {i != null && <line x1={x(i)} x2={x(i)} y1="0" y2={H} stroke="var(--accent)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
      </svg>
      {p && (
        <div className="absolute top-0 pointer-events-none panel px-2.5 py-1.5 text-[12px] whitespace-nowrap"
          style={{ left: `${left}%`, transform: `translateX(${left > 70 ? "calc(-100% - 8px)" : "8px"})` }}>
          <div className="text-ink-3">{dateFr(p.date)}</div>
          <div className="font-semibold tnum">{eur(p.value)}</div>
          {p.cost != null && <div className="text-ink-2 tnum">versé {eur(p.cost)}</div>}
        </div>
      )}
    </div>
  );
}
