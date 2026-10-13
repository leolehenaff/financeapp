import { db } from "./db";
import { priceEur } from "./yahoo";
import { today } from "./format";

/** Rafraîchit le cours du jour de tous les instruments cotés (Yahoo). Partagé par le cron et le bouton Patrimoine. */
export async function refreshPrices() {
  const rows = (await db.execute("SELECT id, ticker FROM instruments WHERE price_source = 'yahoo' AND ticker IS NOT NULL"))
    .rows as unknown as { id: number; ticker: string }[];
  const date = today();
  let updated = 0;
  for (const r of rows) {
    const price = await priceEur(r.ticker);
    if (price === null) continue;
    await db.execute({ sql: "INSERT OR REPLACE INTO prices (instrument_id, date, price) VALUES (?,?,?)", args: [r.id, date, price] });
    updated++;
  }
  return { date, updated, total: rows.length };
}
