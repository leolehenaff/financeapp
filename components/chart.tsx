"use client";
import { useState } from "react";
import { addDays, dateFr, eur, irr, today, type Flow } from "@/lib/format";
import { Delta } from "@/components/ui";

type Point = { date: string; value: number; cost: number };
const RANGES: [string, number][] = [["1 m", 30], ["3 m", 91], ["6 m", 182], ["1 an", 365], ["Max", 0]];

/** Trois KPI de la période (variation nette des versements, performance, versé), sélecteur de période, puis la courbe. */
/** `flows` : tous les apports externes datés, pour le TRI (en Max, ils remplacent la valeur de départ). */
type Move = { date: string; type: string; amount: number };
export function Chart({ points: all, flows, ledger }: { points: Point[]; flows: Flow[]; ledger: Move[] }) {
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
      <Bars ledger={ledger} from={days ? addDays(today(), -days) : ""} byYear={!days} />
    </div>
  );
}

/** Barres par mois (ou par an en Max) : apports nets, achats, ventes, dividendes. */
const SERIES: [string, string, string][] = [["contribution", "Versé", "var(--ink)"], ["buy", "Investi", "var(--c-stock)"], ["sell", "Revendu", "var(--c-crypto)"], ["dividend", "Dividendes", "var(--up)"]];
function Bars({ ledger, from, byYear }: { ledger: Move[]; from: string; byYear: boolean }) {
  const [i, setI] = useState<number | null>(null);
  const key = (d: string) => (byYear ? d.slice(0, 4) : d.slice(0, 7));
  const buckets = new Map<string, Record<string, number>>();
  for (const m of ledger) {
    if (m.date < from) continue;
    const k = key(m.date), b = buckets.get(k) ?? {};
    b[m.type] = (b[m.type] ?? 0) + m.amount;
    buckets.set(k, b);
  }
  const rows = [...buckets].sort();
  if (!rows.length) return <p className="text-[14px] text-ink-2 mt-3">Aucun mouvement sur cette période.</p>;
  const max = Math.max(1, ...rows.flatMap(([, b]) => SERIES.map(([t]) => Math.abs(b[t] ?? 0))));
  const W = 600, H = 140, gap = 6, gw = (W - gap * (rows.length - 1)) / rows.length, bw = gw / SERIES.length;
  const label = (k: string) => (byYear ? k : `${k.slice(5)}/${k.slice(2, 4)}`);
  const p = i == null ? null : rows[i];
  return (
    <div className="mt-4">
      <div className="relative select-none" onPointerLeave={() => setI(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36 block" preserveAspectRatio="none" role="img" aria-label="Mouvements par période">
          {rows.map(([k, b], r) => (
            <g key={k} onPointerEnter={() => setI(r)} onPointerDown={() => setI(r)}>
              <rect x={r * (gw + gap)} y={0} width={gw} height={H} fill={i === r ? "var(--surface-2)" : "transparent"} />
              {SERIES.map(([t, , color], s) => { const h = (Math.abs(b[t] ?? 0) / max) * H; return <rect key={t} x={r * (gw + gap) + s * bw} y={H - h} width={bw - 1} height={h} fill={color} rx="1" />; })}
            </g>
          ))}
        </svg>
        <div className="flex text-[11px] text-ink-3 tnum mt-1">{rows.map(([k]) => <span key={k} className="flex-1 text-center truncate">{rows.length > 14 && !byYear ? (k.endsWith("-01") ? k.slice(0, 4) : "") : label(k)}</span>)}</div>
        {p && (
          <div className="absolute top-0 pointer-events-none panel px-2.5 py-1.5 text-[12px] whitespace-nowrap" style={{ left: `${((i! + 0.5) / rows.length) * 100}%`, transform: `translateX(${i! > rows.length * 0.7 ? "calc(-100% - 8px)" : "8px"})` }}>
            <div className="text-ink-3">{byYear ? p[0] : label(p[0])}</div>
            {SERIES.map(([t, l]) => <div key={t} className="flex justify-between gap-4 tnum"><span className="text-ink-2">{l}</span><span>{eur(Math.round(p[1][t] ?? 0))}</span></div>)}
          </div>
        )}
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-3 mt-2">{SERIES.map(([t, l, color]) => <span key={t} className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: color }} />{l}</span>)}</p>
    </div>
  );
}
