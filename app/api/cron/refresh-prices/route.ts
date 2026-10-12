import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { priceEur } from "@/lib/yahoo";
import { today } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  return NextResponse.json({ date, updated, total: rows.length });
}
