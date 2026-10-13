import { db } from "./db";
import { priceEur } from "./yahoo";
import { today } from "./format";

/** Rafraîchit le cours du jour de tous les instruments cotés (Yahoo). Partagé par le cron et le bouton Patrimoine. */
export async function refreshPrices() {
  const rows = (await db.execute("SELECT id, ticker FROM instruments WHERE price_source = 'yahoo' AND ticker IS NOT NULL"))
    .rows as unknown as { id: number; ticker: string }[];
  const date = today();
  const prices = await Promise.all(rows.map((r) => priceEur(r.ticker)));
  const writes = rows.flatMap((r, i) => prices[i] === null ? [] : [{ sql: "INSERT OR REPLACE INTO prices (instrument_id, date, price) VALUES (?,?,?)", args: [r.id, date, prices[i]] }]);
  if (writes.length) await db.batch(writes, "write");
  return { date, updated: writes.length, total: rows.length };
}
