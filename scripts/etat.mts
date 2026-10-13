/**
 * État du portefeuille pour les skills /mois et /trimestre : allocation, apports du mois précédent,
 * répartition PEA proposée, échéances récurrentes, lignes vives, actions à venir, valorisations périmées.
 * Usage : npm run etat
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

const { db } = await import("../lib/db");
const { getPositions, getAllocation, getMonthProgress, getActions, stale, PLAN } = await import("../lib/queries");
const { today, addDays } = await import("../lib/format");

const d = today();
const ym = d.slice(0, 7);
const prev = addDays(`${ym}-01`, -1).slice(0, 7);
const positions = await getPositions();
const alloc = await getAllocation(positions);
const total = positions.reduce((s, p) => s + p.value, 0);
const r = (n: number) => Math.round(n);

console.log(`# État au ${d} : patrimoine ${r(total)} €\n`);

console.log("## Écart aux cibles (gap = € à ajouter, négatif = en excès)");
for (const row of [...alloc.type, ...alloc.geo]) console.log(`${row.key.padEnd(12)} cible ${row.target} %  réel ${row.actual.toFixed(1)} %  gap ${r(row.gap)} €`);

console.log(`\n## Apports du mois précédent (${prev}) contre plan`);
for (const f of await getMonthProgress(prev)) console.log(`${f.owner.padEnd(6)} plan ${f.planned} €  versé ${r(f.done)} €  écart ${r(f.done - f.planned)} €`);
console.log(`Mois en cours (${ym}) :`);
for (const f of await getMonthProgress(ym)) console.log(`${f.owner.padEnd(6)} plan ${f.planned} €  versé ${r(f.done)} €`);

// Répartition PEA Léo : 1 350 € répartis au prorata des gaps géo positifs hors France, arrondis à 50 €.
const pea = PLAN.monthly["Léo"] - 250 - 250;
const open = alloc.geo.filter((g) => g.key !== "FR" && g.gap > 0);
const sum = open.reduce((s, g) => s + g.gap, 0);
const etf: Record<string, string> = { US: "S&P 500 (ESE)", EU: "STOXX 600 (ETZ)", OTHER: "EM Asia (PAEJ)" };
console.log(`\n## Répartition PEA Léo proposée (${pea} € au prorata des gaps géo hors FR)`);
let left = pea;
open.forEach((g, i) => {
  const amt = i === open.length - 1 ? left : Math.round((pea * g.gap) / sum / 50) * 50;
  left -= amt;
  console.log(`${etf[g.key].padEnd(18)} ${amt} €`);
});
console.log(`Julie : ${PLAN.monthly["Julie"]} € MSCI World (DCAM) sur PEA Trade Republic`);

console.log("\n## Échéances récurrentes");
const last = async (sql: string) => String((await db.execute(sql)).rows[0]?.d ?? "jamais");
console.log(`Dernier ticket start-up : ${await last("SELECT MAX(t.date) d FROM transactions t JOIN instruments i ON i.id = t.instrument_id WHERE i.kind = 'Start-up' AND t.type = 'buy' AND t.amount > 0")} (cadence 4 mois)`);
console.log(`Dernier transfert cold wallet : ${await last("SELECT MAX(t.date) d FROM transactions t JOIN accounts a ON a.id = t.account_id WHERE a.name = 'Cold wallet' AND t.type = 'buy'")} (cadence 6 mois)`);
console.log(`Dernier achat Bitstack : ${await last("SELECT MAX(t.date) d FROM transactions t JOIN accounts a ON a.id = t.account_id WHERE a.name = 'Bitstack' AND t.type = 'buy'")}`);

console.log("\n## Titres vifs (Stock avec ticker, hors ETF et fonds)");
const etfRe = /\b(S&P|MSCI|STOXX|Nasdaq|CAC 40|EM |Japon|Europe Defense|EMU|PEE|DNCA|Seeyond|Mirova)/;
for (const p of positions.filter((p) => p.kind === "Stock" && p.ticker && !etfRe.test(p.instrument)))
  console.log(`${p.instrument.padEnd(16)} ${p.geo}  ${r(p.value)} €  (${((p.value / total) * 100).toFixed(1)} % du patrimoine, gain ${r(p.gain)} €, prix du ${p.price_date})`);

console.log("\n## Actions datées à venir");
for (const a of (await getActions()).filter((a) => a.status === "todo")) console.log(`#${a.id} ${a.due_date} [${a.section}] ${a.title}`);

console.log("\n## Valorisations périmées");
for (const p of stale(positions)) console.log(`${p.instrument.padEnd(20)} ${p.account}  dernier prix ${p.price_date ?? "jamais"}`);
