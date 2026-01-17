import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { AssetRow, rowToAsset, CreateAssetInput } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute("SELECT * FROM assets ORDER BY current_amount DESC");
    const assets = result.rows.map((row) => rowToAsset(row as unknown as AssetRow));
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAssetInput = await request.json();
    const db = getDb();

    const result = await db.execute({
      sql: `INSERT INTO assets (
        name, ticker, isin, who, asset_type, geo, quantity,
        buying_value, buying_amount, current_value, current_amount,
        auto_refresh, dividend_per_share, notes, startup_rating,
        ir_reduction, alert_high, alert_low
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *`,
      args: [
        body.name,
        body.ticker || null,
        body.isin || null,
        body.who,
        body.asset_type,
        body.geo || null,
        body.quantity,
        body.buying_value,
        body.buying_amount,
        body.current_value,
        body.current_amount,
        body.auto_refresh ? 1 : 0,
        body.dividend_per_share || 0,
        body.notes || null,
        body.startup_rating || null,
        body.ir_reduction || null,
        body.alert_high || null,
        body.alert_low || null,
      ],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
    }

    const asset = rowToAsset(result.rows[0] as unknown as AssetRow);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
