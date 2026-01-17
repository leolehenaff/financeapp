import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Asset } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const assetId = parseInt(id);
    if (isNaN(assetId)) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }

    // Get current asset to get the name
    const assetResult = await db.execute({
      sql: "SELECT name FROM assets WHERE id = ?",
      args: [assetId],
    });

    if (!assetResult.rows.length) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const assetName = (assetResult.rows[0] as unknown as { name: string }).name;

    // Get all snapshots with their data
    const result = await db.execute({
      sql: "SELECT snapshot_date, data_json FROM snapshots ORDER BY snapshot_date ASC",
      args: [],
    });

    const history: Array<{
      date: string;
      value: number;
      quantity: number;
      current_amount: number;
    }> = [];

    for (const row of result.rows) {
      const snapshotRow = row as unknown as { snapshot_date: string; data_json: string };
      try {
        const data = JSON.parse(snapshotRow.data_json);
        const asset = data.assets?.find(
          (a: Asset) => a.id === assetId || a.name === assetName
        );

        if (asset) {
          history.push({
            date: snapshotRow.snapshot_date,
            value: asset.current_value,
            quantity: asset.quantity,
            current_amount: asset.current_amount,
          });
        }
      } catch (error) {
        console.error("Error parsing snapshot data:", error);
      }
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching asset history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
