"use client";
import { useState } from "react";
import { dateFr, eur } from "@/lib/format";
import { Delta, Dot, Section } from "@/components/ui";
import type { Position } from "@/lib/queries";

type Key = "instrument" | "quantity" | "price" | "value" | "cost" | "perf" | "price_date";
const COLS: [Key, string, string][] = [
  ["instrument", "Instrument", "auto"], ["quantity", "Qté", "11%"], ["price", "Prix", "11%"], ["value", "Valeur", "12%"],
  ["cost", "Coût", "12%"], ["perf", "+/-", "10%"], ["price_date", "Au", "13%"],
];
const perfOf = (p: Position) => (p.cost ? ((p.value - p.cost) / p.cost) * 100 : 0);
const val = (p: Position, k: Key) => (k === "perf" ? perfOf(p) : k === "instrument" ? p.instrument.toLowerCase() : p[k] ?? "");

function group<T>(items: T[], by: (t: T) => string) {
  return items.reduce<Map<string, T[]>>((m, t) => (m.set(by(t), [...(m.get(by(t)) ?? []), t]), m), new Map());
}

/** Tableaux par personne et par compte : colonnes à largeur fixe (alignées d'un tableau à l'autre), tri partagé au clic sur l'en-tête. */
export function Positions({ positions }: { positions: Position[] }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "value", dir: -1 });
  const click = (key: Key) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "instrument" ? 1 : -1 }));
  const sorted = (ps: Position[]) => [...ps].sort((a, b) => { const x = val(a, sort.key), y = val(b, sort.key); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir; });
  const sum = (ps: Position[], k: "value" | "cost") => ps.reduce((s, p) => s + p[k], 0);
  const perf = (ps: Position[]) => { const c = sum(ps, "cost"), v = sum(ps, "value"); return c ? ((v - c) / c) * 100 : 0; };

  return (
    <>
      {[...group(positions, (p) => p.owner)].map(([owner, ps]) => (
        <Section key={owner} title={<>{owner} <span className="text-ink-2 font-normal tnum">{eur(sum(ps, "value"))}</span></>} aside={<Delta value={perf(ps)} suffix=" %" />}>
          <div className="space-y-4">
            {[...group(ps, (p) => p.account)].map(([account, aps]) => (
              <div key={account} className="panel overflow-x-auto">
                <table className="tbl min-w-[640px]" style={{ tableLayout: "fixed" }}>
                  <colgroup>{COLS.map(([k, , w]) => <col key={k} style={{ width: w }} />)}</colgroup>
                  <thead>
                    <tr>
                      {COLS.map(([k, label], i) => (
                        <th key={k} className={i ? "num" : ""} aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
                          <button type="button" onClick={() => click(k)} className={`inline-flex items-center gap-1 uppercase hover:text-ink ${sort.key === k ? "text-ink" : ""}`}>
                            {i === 0 ? account : label}
                            <span className="text-[9px] w-2">{sort.key === k ? (sort.dir === 1 ? "▲" : "▼") : ""}</span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted(aps).map((p) => (
                      <tr key={p.instrument_id}>
                        <td><div className="flex items-center gap-2 min-w-0"><Dot kind={p.kind} /><span className="truncate">{p.instrument}</span>{p.geo && <span className="text-ink-3 text-[12px]">{p.geo}</span>}</div></td>
                        <td className="num text-ink-2">{p.quantity.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</td>
                        <td className="num text-ink-2">{p.price?.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) ?? "?"}</td>
                        <td className="num font-medium">{eur(p.value)}</td>
                        <td className="num text-ink-2">{eur(p.cost)}</td>
                        <td className="num">{p.cost ? <Delta value={perfOf(p)} suffix=" %" /> : ""}</td>
                        <td className="num text-ink-3 text-[12px]">{dateFr(p.price_date)}</td>
                      </tr>
                    ))}
                    {aps.length > 1 && <tr className="total"><td>Total</td><td /><td /><td className="num">{eur(sum(aps, "value"))}</td><td className="num">{eur(sum(aps, "cost"))}</td><td className="num"><Delta value={perf(aps)} suffix=" %" /></td><td /></tr>}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
