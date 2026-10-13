"use client";
import { useState } from "react";
import { ago, dateFr, eur } from "@/lib/format";
import { Delta, Dot, Empty, POCKET, Section, pocket } from "@/components/ui";
import type { Position } from "@/lib/queries";

type Key = "instrument" | "quantity" | "price" | "value" | "cost" | "perf" | "gain" | "tri" | "price_date";
const COLS: [Key, string, string][] = [
  ["instrument", "Instrument", "auto"], ["quantity", "Qté", "10%"], ["price", "Prix", "10%"], ["value", "Valeur", "11%"],
  ["cost", "Coût", "11%"], ["perf", "+/-", "8%"], ["gain", "Gain", "10%"], ["tri", "Par an", "8%"], ["price_date", "Actualisé", "11%"],
];
const perfOf = (p: Position) => (p.cost ? ((p.value - p.cost) / p.cost) * 100 : 0);
const val = (p: Position, k: Key) => (k === "perf" ? perfOf(p) : k === "tri" ? p.tri ?? -Infinity : k === "instrument" ? p.instrument.toLowerCase() : p[k] ?? "");

function group<T>(items: T[], by: (t: T) => string) {
  return items.reduce<Map<string, T[]>>((m, t) => (m.set(by(t), [...(m.get(by(t)) ?? []), t]), m), new Map());
}

/** Un tableau par compte (toutes personnes mêlées, filtre par personne à la demande) : colonnes à largeur fixe (alignées d'un tableau à l'autre), tri partagé au clic sur l'en-tête. */
export function Positions({ positions, closed }: { positions: Position[]; closed: Position[] }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "value", dir: -1 });
  const [q, setQ] = useState("");
  const [kinds, setKinds] = useState<string[]>([]);
  const [who, setWho] = useState("");
  const owners = [...new Set(positions.map((p) => p.owner))];
  const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const match = (p: Position) => (!who || p.owner === who) && (!kinds.length || kinds.includes(p.kind))
    && (!q || norm(`${p.instrument} ${p.account} ${p.geo ?? ""}`).includes(norm(q)));
  const shown = positions.filter(match), gone = closed.filter(match).sort((a, b) => (a.last_date < b.last_date ? 1 : -1));
  const toggle = (k: string) => setKinds((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]));
  const chip = (on: boolean) => `chip cursor-pointer transition-colors ${on ? "bg-ink text-surface" : "bg-surface-2 text-ink-2 hover:text-ink"}`;
  const click = (key: Key) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "instrument" ? 1 : -1 }));
  const sorted = (ps: Position[]) => [...ps].sort((a, b) => { const x = val(a, sort.key), y = val(b, sort.key); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir; });
  const sum = (ps: Position[], k: "value" | "cost") => ps.reduce((s, p) => s + p[k], 0);
  const perf = (ps: Position[]) => { const c = sum(ps, "cost"), v = sum(ps, "value"); return c ? ((v - c) / c) * 100 : 0; };

  return (
    <>
      <Section title={<>Positions <span className="text-ink-2 font-normal tnum">{eur(sum(shown, "value"))}</span></>} aside={<Delta value={perf(shown)} suffix=" %" />}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Instrument ou compte" aria-label="Rechercher une position" className="field !h-9 !w-full sm:!w-56 text-[13px]" />
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par poche">
            {Object.keys(POCKET).map((k) => <button key={k} type="button" aria-pressed={kinds.includes(k)} onClick={() => toggle(k)} className={chip(kinds.includes(k))}><Dot kind={k} className="mr-1.5" />{pocket(k).label}</button>)}
          </div>
          {owners.length > 1 && <div className="flex gap-1.5 sm:ml-auto" role="group" aria-label="Filtrer par personne">
            {owners.map((o) => <button key={o} type="button" aria-pressed={who === o} onClick={() => setWho(who === o ? "" : o)} className={chip(who === o)}>{o}</button>)}
          </div>}
        </div>
        {shown.length === 0 && <Empty>Aucune position ne correspond.</Empty>}
        <div className="space-y-4">
        {[...group(shown, (p) => p.account)].sort((a, b) => sum(b[1], "value") - sum(a[1], "value")).map(([account, aps]) => (
          <div key={account} className="panel overflow-x-auto">
            <table className="tbl min-w-[800px]" style={{ tableLayout: "fixed" }}>
              <colgroup>{COLS.map(([k, , w]) => <col key={k} style={{ width: w }} />)}</colgroup>
              <thead>
                <tr>
                  {COLS.map(([k, label], i) => (
                    <th key={k} className={i ? "num" : ""} aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
                      <button type="button" onClick={() => click(k)} className={`inline-flex items-center gap-1 uppercase hover:text-ink ${sort.key === k ? "text-ink" : ""}`}>
                        {i === 0 ? <>{account} <span className="text-ink-3 normal-case font-normal hidden sm:inline">{aps[0].owner}</span></> : label}
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
                    <td className="num" title="Valeur plus ventes et dividendes encaissés, moins tous les achats"><Delta value={Math.round(p.gain)} suffix=" €" /></td>
                    <td className="num text-[13px]" title="Taux de rendement interne annuel, achats, ventes et dividendes datés">{p.tri == null ? "" : <Delta value={p.tri * 100} suffix=" %" />}</td>
                    <td className="num text-ink-3 text-[12px]" title={dateFr(p.price_date)}>{ago(p.price_date)}</td>
                  </tr>
                ))}
                {aps.length > 1 && <tr className="total"><td>Total</td><td /><td /><td className="num">{eur(sum(aps, "value"))}</td><td className="num">{eur(sum(aps, "cost"))}</td><td className="num"><Delta value={perf(aps)} suffix=" %" /></td><td className="num"><Delta value={Math.round(aps.reduce((t, p) => t + p.gain, 0))} suffix=" €" /></td><td /><td /></tr>}
              </tbody>
            </table>
          </div>
        ))}
        </div>
        {gone.length > 0 && (
          <details className="mt-6">
            <summary className="cursor-pointer text-[13px] text-ink-2 hover:text-ink inline-block">Lignes soldées, {gone.length}, gain cumulé <Delta value={Math.round(gone.reduce((t, p) => t + p.gain, 0))} suffix=" €" /></summary>
            <div className="panel overflow-x-auto mt-3">
              <table className="tbl min-w-[640px]" style={{ tableLayout: "fixed" }}>
                <colgroup>{["auto", "16%", "13%", "13%", "13%", "11%"].map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
                <thead><tr><th>Instrument</th><th className="num">Soldée le</th><th className="num">Achats</th><th className="num">Ventes et div.</th><th className="num">Gain</th><th className="num">Par an</th></tr></thead>
                <tbody>
                  {gone.map((p) => (
                    <tr key={`${p.account_id}:${p.instrument_id}`}>
                      <td><div className="flex items-center gap-2 min-w-0"><Dot kind={p.kind} /><span className="truncate">{p.instrument}</span><span className="text-ink-3 text-[12px] truncate">{p.account}</span></div></td>
                      <td className="num text-ink-3 text-[12px]">{dateFr(p.last_date)}</td>
                      <td className="num text-ink-2">{eur(p.bought)}</td>
                      <td className="num text-ink-2">{eur(p.sold + p.dividends)}</td>
                      <td className="num font-medium"><Delta value={Math.round(p.gain)} suffix=" €" /></td>
                      <td className="num text-[13px]">{p.tri == null ? "" : <Delta value={p.tri * 100} suffix=" %" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </Section>
    </>
  );
}
