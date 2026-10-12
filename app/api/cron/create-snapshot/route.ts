import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getPositions } from "@/lib/queries";
import { today } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const positions = await getPositions();
  const sum = (key: (p: (typeof positions)[number]) => string) =>
    positions.reduce<Record<string, number>>((acc, p) => ((acc[key(p)] = (acc[key(p)] ?? 0) + p.value), acc), {});
  const total = positions.reduce((s, p) => s + p.value, 0);
  const date = today();
  const data = JSON.stringify({ by_type: sum((p) => p.kind), by_owner: sum((p) => p.owner), cost: positions.reduce((s, p) => s + p.cost, 0) });
  await db.batch([
    { sql: "DELETE FROM snapshots WHERE snapshot_date = ?", args: [date] },
    { sql: "INSERT INTO snapshots (snapshot_date, total_value, data_json) VALUES (?,?,?)", args: [date, total, data] },
  ]);
  return NextResponse.json({ date, total });
}
