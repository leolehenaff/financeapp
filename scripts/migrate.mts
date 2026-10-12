/**
 * Migration v1 → v2. Lit les anciennes tables (assets, dividends), remplit accounts, instruments,
 * transactions, prices, plan_flows, actions. Les anciennes tables sont conservées intactes.
 * Usage : npm run migrate
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
config({ path: ".env.local" });

const { db, SCHEMA } = await import("../lib/db");

type Asset = {
  id: number; name: string; ticker: string | null; who: string; asset_type: string; geo: string | null;
  quantity: number; buying_amount: number; current_value: number; current_amount: number;
  startup_rating: string | null; ir_reduction: string | null; notes: string | null; created_at: string; updated_at: string;
};

const ACCOUNTS: [owner: string, name: string, kind: string, opened_on: string | null][] = [
  ["Léo", "PEA Léo", "PEA", null], ["Léo", "Start-up Léo", "Startup", null], ["Léo", "Nexo", "Cash", null],
  ["Léo", "Bitstack", "Crypto", null], ["Léo", "Cold wallet", "Crypto", null], ["Léo", "Livret A Léo", "Livret", null],
  ["Léo", "AV Generali Léo", "AV", null],
  ["Julie", "PEA Trade Republic Julie", "PEA", "2025-10-01"], ["Julie", "PEE CIC Julie", "PEE", null],
  ["Julie", "Livret A Julie", "Livret", null], ["Julie", "AV Generali Julie", "AV", null],
];

function accountFor(a: Asset) {
  const av = a.name.toLowerCase().includes("assurance");
  if (a.who === "Julie") {
    if (a.asset_type === "Stock") return a.name.startsWith("PEE") ? "PEE CIC Julie" : "PEA Trade Republic Julie";
    return av ? "AV Generali Julie" : "Livret A Julie";
  }
  switch (a.asset_type) {
    case "Stock": return "PEA Léo";
    case "Start-up": return "Start-up Léo";
    case "Active Cash": return "Nexo";
    case "Crypto": return a.name.includes("Cold") ? "Cold wallet" : a.name.includes("NEXO") ? "Nexo" : "Bitstack";
    default: return av ? "AV Generali Léo" : "Livret A Léo";
  }
}

const RENAME: Record<string, string> = {
  "CW8.PA": "MSCI World (CW8)", "DCAM.PA": "MSCI World (DCAM)", "ESE.PA": "S&P 500 (ESE)", "ETZ.PA": "STOXX 600 (ETZ)",
  "PAEJ.PA": "EM Asia (PAEJ)", "PTPXE.PA": "Japon TOPIX (PTPXE)", "PALAT.PA": "EM Latin America (PALAT)",
  "PUST.PA": "Nasdaq 100 (PUST)", "GUARD.PA": "Europe Defense (GUARD)", "CAC.PA": "CAC 40 (CAC)",
  "PABZ.PA": "EMU Climate (PABZ)", "BTC-EUR": "Bitcoin", "NEXO-USD": "Token NEXO",
};

function instrumentFor(a: Asset) {
  const ticker = a.ticker?.trim() || null;
  const cashLike = a.asset_type === "Livret" || a.asset_type === "Active Cash";
  let name = ticker ? RENAME[ticker] ?? a.name : a.name;
  if (name.toLowerCase().includes("assurance")) name = `AV Generali ${a.who}`;
  else if (a.asset_type === "Livret") name = `${a.name} ${a.who}`;
  const notes = a.asset_type === "Start-up"
    ? [a.startup_rating && `note ${a.startup_rating}`, a.ir_reduction, a.notes !== a.ir_reduction && a.notes].filter(Boolean).join(", ")
    : a.notes;
  return { name, ticker, kind: a.asset_type, geo: a.geo, price_source: ticker ? "yahoo" : "manual", notes: notes || null, cashLike };
}

const MONTHS = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
function parseDue(text: string): string | null {
  const dmy = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const all = [...text.matchAll(/(janv|févr|mars|avr|mai|juin|juil|août|sept|oct|nov|déc)\w*\.?\s+(\d{4})/gi)];
  if (!all.length) return null;
  const last = all[all.length - 1];
  const m = MONTHS.indexOf(last[1].toLowerCase()) + 1;
  const end = new Date(Date.UTC(Number(last[2]), m, 0)).getUTCDate();
  return `${last[2]}-${String(m).padStart(2, "0")}-${end}`;
}

function parseActions(md: string) {
  const out: { section: string; title: string; due: string | null; done: boolean }[] = [];
  let section = "";
  for (const line of md.split("\n")) {
    if (line.startsWith("## ")) section = line.slice(3).trim();
    const m = line.match(/^- \[([ x])\] (.*)$/);
    if (!m || section === "Décisions prises" || !section) continue;
    const bold = m[2].match(/^\*\*([^*]+)\*\*\s*:\s*(.*)$/);
    const due = parseDue(bold ? bold[1] : "");
    out.push({ section, title: (bold && due ? bold[2] : m[2]).replace(/\*\*/g, "").trim(), due, done: m[1] === "x" });
  }
  return out;
}

const n = (await db.execute("SELECT COUNT(*) c FROM sqlite_master WHERE name = 'accounts'")).rows[0].c as number;
if (n && ((await db.execute("SELECT COUNT(*) c FROM accounts")).rows[0].c as number) > 0) {
  console.error("Tables v2 déjà remplies, abandon."); process.exit(1);
}
for (const s of SCHEMA) await db.execute(s);

for (const [owner, name, kind, opened] of ACCOUNTS)
  await db.execute({ sql: "INSERT INTO accounts (owner, name, kind, opened_on) VALUES (?,?,?,?)", args: [owner, name, kind, opened] });
const accountId = Object.fromEntries(((await db.execute("SELECT id, name FROM accounts")).rows as unknown as { id: number; name: string }[]).map((r) => [r.name, r.id]));

const assets = (await db.execute("SELECT * FROM assets ORDER BY id")).rows as unknown as Asset[];
const instrumentId: Record<string, number> = {};
const assetInstrument: Record<number, number> = {};
for (const a of assets) {
  const i = instrumentFor(a);
  if (!instrumentId[i.name]) {
    const r = await db.execute({
      sql: "INSERT INTO instruments (name, ticker, kind, geo, price_source, notes) VALUES (?,?,?,?,?,?)",
      args: [i.name, i.ticker, i.kind, i.geo, i.price_source, i.notes],
    });
    instrumentId[i.name] = Number(r.lastInsertRowid);
  }
  const iid = instrumentId[i.name];
  assetInstrument[a.id] = iid;
  const qty = i.cashLike ? a.current_amount : a.quantity;
  const price = i.cashLike ? 1 : a.current_value;
  await db.execute({
    sql: "INSERT INTO transactions (date, account_id, instrument_id, type, quantity, amount, note) VALUES (?,?,?,'buy',?,?,?)",
    args: [a.created_at.slice(0, 10), accountId[accountFor(a)], iid, qty, a.buying_amount, "Reprise v1"],
  });
  await db.execute({ sql: "INSERT OR REPLACE INTO prices (instrument_id, date, price) VALUES (?,?,?)", args: [iid, a.updated_at.slice(0, 10), price] });
}

const divs = (await db.execute("SELECT d.asset_id, d.year, d.amount, a.who FROM dividends d JOIN assets a ON a.id = d.asset_id")).rows as unknown as { asset_id: number; year: number; amount: number; who: string }[];
for (const d of divs) {
  const a = assets.find((x) => x.id === d.asset_id)!;
  await db.execute({
    sql: "INSERT INTO transactions (date, account_id, instrument_id, type, quantity, amount, note) VALUES (?,?,?,'dividend',0,?,?)",
    args: [`${d.year}-06-30`, accountId[accountFor(a)], assetInstrument[d.asset_id], d.amount, `Dividendes ${d.year} (reprise v1)`],
  });
}

const FLOWS: [owner: string, account: string, instrument: string | null, amount: number, label: string | null][] = [
  ["Léo", "PEA Léo", "S&P 500 (ESE)", 800, null], ["Léo", "PEA Léo", "STOXX 600 (ETZ)", 300, null],
  ["Léo", "PEA Léo", "EM Asia (PAEJ)", 250, null], ["Léo", "Start-up Léo", null, 250, "Start-up (1 000 € tous les 4 mois)"],
  ["Léo", "Bitstack", "Bitcoin", 250, null], ["Julie", "PEA Trade Republic Julie", "MSCI World (CW8)", 1850, null],
];
for (const [owner, account, instrument, amount, label] of FLOWS)
  await db.execute({
    sql: "INSERT INTO plan_flows (owner, account_id, instrument_id, monthly_amount, from_month, label) VALUES (?,?,?,?,'2026-10',?)",
    args: [owner, accountId[account], instrument ? instrumentId[instrument] : null, amount, label],
  });

for (const a of parseActions(readFileSync("docs/actions.md", "utf8")))
  await db.execute({
    sql: "INSERT INTO actions (section, title, due_date, status) VALUES (?,?,?,?)",
    args: [a.section, a.title, a.due, a.done ? "done" : "todo"],
  });

const v1 = assets.reduce((s, a) => s + a.current_amount, 0);
const { getPositions } = await import("../lib/queries");
const pos = await getPositions();
const v2 = pos.reduce((s, p) => s + p.value, 0);
console.log(`assets ${assets.length} → positions ${pos.length}, instruments ${Object.keys(instrumentId).length}`);
console.log(`valeur v1 ${Math.round(v1)} €, v2 ${Math.round(v2)} €, écart ${Math.round(v2 - v1)} €`);
console.table((await db.execute("SELECT section, COUNT(*) n, SUM(due_date IS NOT NULL) dated FROM actions GROUP BY 1")).rows);
