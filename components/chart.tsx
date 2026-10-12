"use client";
import { useState } from "react";
import { addDays, dateFr, eur, today } from "@/lib/format";
import { Delta } from "@/components/ui";

type Point = { date: string; value: number; cost: number | null };
const RANGES: [string, number][] = [["1 m", 30], ["3 m", 91], ["6 m", 182], ["1 an", 365], ["Max", 0]];

/** Valeur (trait plein) et versé net (pointillé), sur une période au choix. Survol ou doigt posé : date et valeurs du jour. */
export function Chart({ points: all }: { points: Point[] }) {
  const [days, setDays] = useState(365);
  const points = days ? all.filter((p) => p.date >= addDays(today(), -days)) : all;
  const first = points[0], last = points.at(-1);
  const tracked = points.find((p) => p.cost != null);
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mt-3">
        <p className="text-[14px] text-ink-2 tnum">
          {first && last && first !== last ? <>Depuis le {dateFr(first.date)} : <Delta value={Math.round(last.value - first.value)} suffix=" €" />
            {tracked && tracked !== last && last.cost != null && <>, dont {eur(Math.round(last.cost - tracked.cost!))} versés et <Delta value={Math.round((last.value - last.cost) - (tracked.value - tracked.cost!))} suffix=" €" /> de performance</>}.</>
            : "Pas assez d'historique sur cette période."}
        </p>
        <div className="flex gap-0.5 p-0.5 rounded-full bg-surface-2 text-[12px]" role="tablist" aria-label="Période">
          {RANGES.map(([l, d]) => (
            <button key={l} role="tab" aria-selected={d === days} onClick={() => setDays(d)}
              className={`px-2.5 py-1 rounded-full tnum transition-colors ${d === days ? "bg-surface font-semibold shadow-[var(--shadow)]" : "text-ink-2 hover:text-ink"}`}>{l}</button>
          ))}
        </div>
      </div>
      <Curve points={points} />
    </div>
  );
}

function Curve({ points }: { points: Point[] }) {
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
    <div className="relative mt-3 touch-pan-y select-none" onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setI(null)}>
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
