"use client";
import { useState } from "react";
import { addDays, dateFr, eur, irr, today, type Flow } from "@/lib/format";
import { Delta } from "@/components/ui";

type Point = { date: string; value: number; cost: number };
const RANGES: [string, number][] = [["1 m", 30], ["3 m", 91], ["6 m", 182], ["1 an", 365], ["Max", 0]];

/** Trois KPI de la période (variation nette des versements, performance, versé), sélecteur de période, puis la courbe. */
/** `flows` : tous les apports externes datés, pour le TRI (en Max, ils remplacent la valeur de départ). */
type Move = { date: string; type: string; amount: number };
type Plan = { from: string; to: string | null; amount: number };
export function Chart({ points: all, flows, ledger, plan }: { points: Point[]; flows: Flow[]; ledger: Move[]; plan: Plan[] }) {
  const [days, setDays] = useState(365);
  const [view, setView] = useState<"rythme" | "gain">("rythme");
  const points = days ? all.filter((p) => p.date >= addDays(today(), -days)) : all;
  const first = points[0], last = points.at(-1);
  // Max = depuis le premier euro : base zéro, les KPI retombent sur « valeur moins coût ».
  const base = days && first ? first : { value: 0, cost: 0 };
  const paid = last ? last.cost - base.cost : 0;
  const net = last ? last.value - base.value - paid : 0;
  const engaged = base.value + paid;
  const since = days && first ? `depuis le ${dateFr(first.date)}` : "depuis le début";
  // Annualisé sur la durée réelle couverte : du premier point (ou du premier apport en Max) au dernier.
  const from = days && first ? first.date : flows[0]?.date ?? today();
  const span = last ? Math.max(1, (Date.parse(last.date) - Date.parse(from)) / 864e5) : 1;
  const perYear = 365 / span;
  const pctNet = engaged ? net / engaged : 0;
  // TRI : argent sorti de la poche (négatif) aux vraies dates, valeur finale en face. Hors Max, la valeur de départ est le premier flux.
  const tri = first && last ? irr([
    ...(days ? [{ date: first.date, amount: -first.value }] : []),
    ...flows.filter((f) => (days ? f.date > first.date : true) && f.date <= last.date).map((f) => ({ ...f, amount: -f.amount })),
    { date: last.date, amount: last.value },
  ]) : 0;
  const annual = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${eur(Math.round(Math.abs(n)))} par an`;
  return (
    <div>
      <div className="flex justify-between items-center mt-3 gap-3">
        <div className="flex gap-0.5 p-0.5 rounded-full bg-surface-2 text-[12px]" role="tablist" aria-label="Vue">
          {([["rythme", "Rythme"], ["gain", "Gain"]] as const).map(([v, l]) => (
            <button key={v} role="tab" aria-selected={v === view} onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-full transition-colors ${v === view ? "bg-surface font-semibold shadow-[var(--shadow)]" : "text-ink-2 hover:text-ink"}`}>{l}</button>
          ))}
        </div>
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
          ["Performance", <Delta key="p" value={pctNet * 100} suffix=" %" />, `TRI ${(tri * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1, signDisplay: "exceptZero" })} % par an`],
          ["Versé", <span key="v" className="tnum">{eur(Math.round(paid))}</span>, `${since}, ${eur(Math.round(paid * perYear))} par an`],
        ].map(([l, v, sub]) => (
          <div key={String(l)} className="panel px-3 py-2.5 sm:px-4 sm:py-3 min-w-0">
            <dt className="text-[12px] text-ink-3 whitespace-nowrap">{l}</dt>
            <dd className="text-[16px] sm:text-[20px] font-bold tracking-[-0.02em] leading-tight mt-0.5 whitespace-nowrap">{v}</dd>
            <dd className="text-[11px] sm:text-[12px] text-ink-3 mt-0.5 tnum">{sub}</dd>
          </div>
        ))}
      </dl>
      {view === "rythme" ? <Bars ledger={ledger} plan={plan} from={days ? addDays(today(), -days) : ""} byYear={!days} /> : <Gain points={points} />}
    </div>
  );
}

/** Rythme : versé net par mois (par an en Max), dividendes empilés par-dessus, trait de l'objectif du plan. */
function Bars({ ledger, plan, from, byYear }: { ledger: Move[]; plan: Plan[]; from: string; byYear: boolean }) {
  const [i, setI] = useState<number | null>(null);
  const key = (d: string) => (byYear ? d.slice(0, 4) : d.slice(0, 7));
  const buckets = new Map<string, { paid: number; div: number }>();
  for (const m of ledger) {
    if (m.date < from || (m.type !== "contribution" && m.type !== "dividend")) continue;
    const k = key(m.date), b = buckets.get(k) ?? { paid: 0, div: 0 };
    if (m.type === "contribution") b.paid += m.amount; else b.div += m.amount;
    buckets.set(k, b);
  }
  const rows = [...buckets].sort();
  if (!rows.length) return <p className="text-[14px] text-ink-2 mt-3">Aucun mouvement sur cette période.</p>;
  // Objectif de la période : somme des mois couverts par le plan (12 mois pour une année, jusqu'au mois courant pour l'année en cours).
  const target = (k: string) => {
    const months = byYear ? Array.from({ length: 12 }, (_, m) => `${k}-${String(m + 1).padStart(2, "0")}`).filter((ym) => ym <= today().slice(0, 7)) : [k];
    return months.reduce((s, ym) => s + plan.filter((p) => p.from <= ym && (!p.to || ym <= p.to)).reduce((t, p) => t + p.amount, 0), 0);
  };
  const max = Math.max(1, ...rows.map(([k, b]) => Math.max(b.paid + b.div, target(k))));
  const W = 600, H = 160, slot = W / rows.length, bw = slot * 0.62;
  const y = (v: number) => H - (v / max) * H;
  const label = (k: string) => (byYear ? k : `${k.slice(5)}/${k.slice(2, 4)}`);
  const p = i == null ? null : rows[i];
  return (
    <div className="mt-4">
      <div className="relative select-none" onPointerLeave={() => setI(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40 block" preserveAspectRatio="none" role="img" aria-label="Versements par période">
          {rows.map(([k, b], r) => {
            const x = r * slot + (slot - bw) / 2, t = target(k);
            return (
              <g key={k} onPointerEnter={() => setI(r)} onPointerDown={() => setI(r)}>
                <rect x={r * slot} y={0} width={slot} height={H} fill={i === r ? "var(--surface-2)" : "transparent"} />
                {b.paid > 0 && <rect x={x} y={y(b.paid)} width={bw} height={H - y(b.paid)} fill="var(--accent)" />}
                {b.paid < 0 && <rect x={x} y={H - 2} width={bw} height={2} fill="var(--down)" />}
                {b.div > 0 && <rect x={x} y={y(Math.max(0, b.paid) + b.div)} width={bw} height={(b.div / max) * H} fill="var(--up)" />}
                {t > 0 && <line x1={x - 3} x2={x + bw + 3} y1={y(t)} y2={y(t)} stroke="var(--ink)" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
              </g>
            );
          })}
        </svg>
        <div className="flex text-[11px] text-ink-3 tnum mt-1">{rows.map(([k]) => <span key={k} className="flex-1 text-center truncate">{rows.length > 14 && !byYear ? (k.endsWith("-01") ? k.slice(0, 4) : "") : label(k)}</span>)}</div>
        {p && (
          <div className="absolute top-0 pointer-events-none panel px-2.5 py-1.5 text-[12px] whitespace-nowrap" style={{ left: `${((i! + 0.5) / rows.length) * 100}%`, transform: `translateX(${i! > rows.length * 0.7 ? "calc(-100% - 8px)" : "8px"})` }}>
            <div className="text-ink-3">{byYear ? p[0] : label(p[0])}</div>
            <div className="flex justify-between gap-4 tnum"><span className="text-ink-2">Versé</span><span>{eur(Math.round(p[1].paid))}</span></div>
            <div className="flex justify-between gap-4 tnum"><span className="text-ink-2">Dividendes</span><span>{eur(Math.round(p[1].div))}</span></div>
            {target(p[0]) > 0 && <div className="flex justify-between gap-4 tnum"><span className="text-ink-2">Objectif</span><span>{eur(Math.round(target(p[0])))}</span></div>}
          </div>
        )}
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-3 mt-2">
        <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "var(--accent)" }} />Versé</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "var(--up)" }} />Dividendes</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 border-t-2 border-ink" />Objectif du plan</span>
      </p>
    </div>
  );
}

/** Gain : patrimoine (trait plein) et versé cumulé (pointillé), en valeurs absolues. */
function Gain({ points }: { points: Point[] }) {
  const [i, setI] = useState<number | null>(null);
  if (points.length < 2) return <p className="text-[14px] text-ink-2 mt-3">Pas assez d&apos;historique sur cette période.</p>;
  const W = 600, H = 160, all = points.flatMap((p) => [p.value, p.cost]), lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.08 || 1;
  const y = (n: number) => H - ((n - (lo - pad)) / (hi - lo + 2 * pad)) * H;
  const x = (k: number) => (k / (points.length - 1)) * W;
  const line = points.map((p, k) => `${x(k)},${y(p.value)}`).join(" "), paid = points.map((p, k) => `${x(k)},${y(p.cost)}`).join(" ");
  const pick = (e: React.PointerEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); setI(Math.round(((e.clientX - r.left) / r.width) * (points.length - 1))); };
  const k = i == null ? null : Math.max(0, Math.min(points.length - 1, i));
  const left = k == null ? 0 : (k / (points.length - 1)) * 100;
  return (
    <div className="relative mt-4 touch-pan-y select-none" onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setI(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40 block" preserveAspectRatio="none" role="img" aria-label="Patrimoine et versé cumulé">
        <polygon points={`${line} ${paid.split(" ").reverse().join(" ")}`} fill="var(--up)" opacity="0.15" />
        <polyline points={paid} fill="none" stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <polyline points={line} fill="none" stroke="var(--ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {k != null && <line x1={x(k)} x2={x(k)} y1="0" y2={H} stroke="var(--accent)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
      </svg>
      {k != null && (
        <div className="absolute top-0 pointer-events-none panel px-2.5 py-1.5 text-[12px] whitespace-nowrap" style={{ left: `${left}%`, transform: `translateX(${left > 70 ? "calc(-100% - 8px)" : "8px"})` }}>
          <div className="text-ink-3">{dateFr(points[k].date)}</div>
          <div className="font-semibold tnum">{eur(points[k].value)}</div>
          <div className="text-ink-2 tnum">versé {eur(points[k].cost)}, gain <Delta value={Math.round(points[k].value - points[k].cost)} suffix=" €" /></div>
        </div>
      )}
      <p className="flex gap-5 text-[12px] text-ink-3 mt-2"><span><span className="inline-block w-4 border-t-[1.5px] border-ink align-middle mr-1.5" />Patrimoine</span><span><span className="inline-block w-4 border-t border-dashed border-ink-3 align-middle mr-1.5" />Versé cumulé</span></p>
    </div>
  );
}
