/* eslint-disable @typescript-eslint/no-explicit-any */
// Recalcule snapshots.total_value du 17/01/2026 à hier : quantités = transactions datées, cours = Yahoo historique (clôture, report en avant) ou dernier prix manuel connu, cash et livrets à 1 €.
import { config } from "dotenv"; config({ path: ".env.local", quiet: true });
import YahooFinance from "yahoo-finance2";
const WRITE = process.argv[2] === "write", START = "2026-01-17";
const { db } = await import("../lib/db");
const yf = new YahooFinance();
const today = new Date().toISOString().slice(0, 10);
const ins = (await db.execute("SELECT id, name, ticker, kind, price_source FROM instruments WHERE id IN (SELECT instrument_id FROM transactions)")).rows as any[];
const txs = (await db.execute("SELECT date, instrument_id, type, quantity FROM transactions ORDER BY date")).rows as any[];
const manual = (await db.execute("SELECT instrument_id, date, price FROM prices ORDER BY date")).rows as any[];
const hist: Record<number, [string, number][]> = {};
async function series(sym: string) { const r = await yf.chart(sym, { period1: "2026-01-10", period2: today, interval: "1d" }); return r.quotes.filter((q: any) => q.close).map((q: any) => [new Date(q.date).toISOString().slice(0, 10), q.close] as [string, number]); }
const usd = new Map(await series("USDEUR=X"));
for (const i of ins) {
  if (i.ticker) { try { const s = await series(i.ticker); hist[i.id] = i.ticker.endsWith("-USD") ? s.map(([d, p]) => [d, p * ([...usd.entries()].filter(([k]) => k <= d).at(-1)?.[1] ?? 0.86)]) : s; } catch { console.error("Yahoo KO", i.ticker); hist[i.id] = []; } }
  else hist[i.id] = manual.filter((p) => p.instrument_id === i.id).map((p) => [p.date, Number(p.price)]);
  if (!hist[i.id].length) hist[i.id] = [[START, ["Livret", "Active Cash"].includes(i.kind) ? 1 : 0]];
}
const at = (id: number, d: string) => { const h = hist[id]; const b = h.filter(([k]) => k <= d).at(-1); return (b ?? h[0])[1]; };
const dates: string[] = []; for (let d = new Date(START); d.toISOString().slice(0, 10) < today; d.setDate(d.getDate() + 1)) dates.push(d.toISOString().slice(0, 10));
const old = new Map((await db.execute("SELECT snapshot_date d, total_value v FROM snapshots")).rows.map((r: any) => [r.d, Number(r.v)]));
const out: [string, number][] = [];
for (const d of dates) {
  const qty: Record<number, number> = {};
  for (const t of txs) { if (t.date > d) break; qty[t.instrument_id] = (qty[t.instrument_id] ?? 0) + (t.type === "buy" ? Number(t.quantity) : t.type === "sell" ? -Number(t.quantity) : 0); }
  let total = 0; for (const [id, q] of Object.entries(qty)) if (q > 1e-9) total += q * at(Number(id), d);
  out.push([d, Math.round(total * 100) / 100]);
}
for (const [d, v] of out) if (!old.has(d) || [START, dates[1], dates.at(-1)].includes(d) || Math.abs(v - (old.get(d) ?? 0)) > 15000) console.log(d, "ancien", old.get(d)?.toFixed(0) ?? "aucun", "nouveau", v.toFixed(0));
console.log(`${out.length} jours, ${out.filter(([d]) => !old.has(d)).length} nouveaux`);
if (!WRITE) process.exit(0);
const tx = await db.transaction("write");
for (const [d, v] of out) await tx.execute({ sql: "INSERT INTO snapshots (snapshot_date, total_value) VALUES (?, ?) ON CONFLICT(snapshot_date) DO UPDATE SET total_value=excluded.total_value", args: [d, v] });
await tx.commit(); console.log("écrit");
