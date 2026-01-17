import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Dividend } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const assetId = searchParams.get("asset_id");

    const db = getDb();
    let sql = `
      SELECT d.*, a.name as asset_name, a.ticker, a.asset_type
      FROM dividends d
      JOIN assets a ON d.asset_id = a.id
    `;
    const args: (string | number)[] = [];
    const conditions: string[] = [];

    if (year) {
      conditions.push("d.year = ?");
      args.push(parseInt(year));
    }
    if (assetId) {
      conditions.push("d.asset_id = ?");
      args.push(parseInt(assetId));
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY d.year DESC, a.name";

    const result = await db.execute({ sql, args });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching dividends:", error);
    return NextResponse.json({ error: "Failed to fetch dividends" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asset_id, year, amount } = body;

    if (!asset_id || !year || amount === undefined) {
      return NextResponse.json(
        { error: "asset_id, year, and amount are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Use INSERT OR REPLACE to handle the unique constraint
    const result = await db.execute({
      sql: `INSERT INTO dividends (asset_id, year, amount)
            VALUES (?, ?, ?)
            ON CONFLICT(asset_id, year) DO UPDATE SET amount = excluded.amount
            RETURNING *`,
      args: [asset_id, year, amount],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Failed to save dividend" }, { status: 500 });
    }

    return NextResponse.json(result.rows[0] as unknown as Dividend);
  } catch (error) {
    console.error("Error saving dividend:", error);
    return NextResponse.json({ error: "Failed to save dividend" }, { status: 500 });
  }
}
