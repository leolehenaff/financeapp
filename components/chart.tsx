"use client";
import { useState } from "react";
import { addDays, dateFr, eur, today } from "@/lib/format";
import { Delta } from "@/components/ui";

type Point = { date: string; value: number; cost: number };
const RANGES: [string, number][] = [["1 m", 30], ["3 m", 91], ["6 m", 182], ["1 an", 365], ["Max", 0]];

/** Trois KPI de la période (variation nette des versements, performance, versé), sélecteur de période, puis la courbe. */
/** `start` : date du premier apport, base du calcul annualisé en mode Max. */
export function Chart({ points: all, start }: { points: Point[]; start: string }) {
  const [days, setDays] = useState(365);
  const points = days ? all.filter((p) => p.date >= addDays(today(), -days)) : all;
  const first = points[0], last = points.at(-1);
  // Max = depuis le premier euro : base zéro, les KPI retombent sur « valeur moins coût ».
  const base = days && first ? first : { value: 0, cost: 0 };
  const paid = last ? last.cost - base.cost : 0;
  const net = last ? last.value - base.value - paid : 0;
  const engaged = base.value + paid;
  const since = days && first ? `depuis le ${dateFr(first.date)}` : "depuis le début";
  // Annualisé sur la durée réelle couverte : du premier point (ou du premier apport en Max) au dernier.
  const span = last ? Math.max(1, (Date.parse(last.date) - Date.parse(days && first ? first.date : start)) / 864e5) : 1;
  const perYear = 365 / span;
  const pctNet = engaged ? net / engaged : 0;
  const annual = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${eur(Math.round(Math.abs(n)))} par an`;
  return (
    <div>
      <div className="flex justify-end mt-3">
        <div className="flex gap-0.5 p-0.5 rounded-full bg-surface-2 text-[12px]" role="tablist" aria-label="Période">
          {RANGES.map(([l, d]) => (
            <button key={l} role="tab" aria-selected={d === days} onClick={() => setDays(d)}
              className={`px-2.5 py-1 rounded-full tnum transition-colors ${d === days ? "bg-surface font-semibold shadow-[var(--shadow)]" : "text-ink-2 hover:text-ink"}`}>{l}</button>
          ))}
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-3 mt-3">
        {[
          ["Variation nette", <Delta key="n" value={Math.round(net)} suffix=" €" />, `hors versements, ${annual(net * perYear)}`],
          ["Performance", <Delta key="p" value={pctNet * 100} suffix=" %" />, `${(pctNet > -1 ? (Math.pow(1 + pctNet, perYear) - 1) * 100 : -100).toLocaleString("fr-FR", { maximumFractionDigits: 1, signDisplay: "exceptZero" })} % par an`],
          ["Versé", <span key="v" className="tnum">{eur(Math.round(paid))}</span>, `${since}, ${eur(Math.round(paid * perYear))} par an`],
        ].map(([l, v, sub]) => (
          <div key={String(l)} className="panel px-3 py-2.5 sm:px-4 sm:py-3 min-w-0">
            <dt className="text-[12px] text-ink-3 whitespace-nowrap">{l}</dt>
            <dd className="text-[16px] sm:text-[20px] font-bold tracking-[-0.02em] leading-tight mt-0.5 whitespace-nowrap">{v}</dd>
            <dd className="text-[11px] sm:text-[12px] text-ink-3 mt-0.5 tnum">{sub}</dd>
          </div>
        ))}
      </dl>
      <Curve points={points} />
    </div>
  );
}

function Curve({ points }: { points: Point[] }) {
  const [i, setI] = useState<number | null>(null);
  if (points.length < 2) return <p className="text-[14px] text-ink-2 mt-3">Pas assez d&apos;historique sur cette période.</p>;
  const W = 600, H = 120;
  const all = points.flatMap((p) => [p.value, p.cost]), min = Math.min(...all) * 0.97, max = Math.max(...all) * 1.02;
  const x = (k: number) => (k / (points.length - 1)) * W;
  const xy = (k: number, v: number) => `${x(k)},${H - ((v - min) / (max - min)) * H}`;
  const value = points.map((p, k) => xy(k, p.value));
  const cost = points.map((p, k) => xy(k, p.cost));
  const pick = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setI(Math.round(((e.clientX - r.left) / r.width) * (points.length - 1)));
  };
  const p = i == null ? null : points[Math.max(0, Math.min(points.length - 1, i))];
  const left = i == null ? 0 : (i / (points.length - 1)) * 100;
  return (
    <div className="relative mt-4 touch-pan-y select-none" onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setI(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32 block" preserveAspectRatio="none" role="img" aria-label="Valeur et montant versé sur la période">
        {/* Deux couches empilées : le versé (teinte légère) puis la plus-value par-dessus, pas de trou couleur de page. */}
        <polygon points={`0,${H} ${cost.join(" ")} ${W},${H}`} fill="var(--c-stock)" opacity="0.07" />
        <polygon points={[...value, ...[...cost].reverse()].join(" ")} fill="var(--c-stock)" opacity="0.2" />
        <polyline points={cost.join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <polyline points={value.join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {i != null && <line x1={x(i)} x2={x(i)} y1="0" y2={H} stroke="var(--accent)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
      </svg>
      {p && (
        <div className="absolute top-0 pointer-events-none panel px-2.5 py-1.5 text-[12px] whitespace-nowrap"
          style={{ left: `${left}%`, transform: `translateX(${left > 70 ? "calc(-100% - 8px)" : "8px"})` }}>
          <div className="text-ink-3">{dateFr(p.date)}</div>
          <div className="font-semibold tnum">{eur(p.value)}</div>
          <div className="text-ink-2 tnum">versé {eur(p.cost)}</div>
        </div>
      )}
    </div>
  );
}
