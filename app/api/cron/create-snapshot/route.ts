import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { AssetRow, rowToAsset, SnapshotData, AssetType, WhoType } from "@/lib/types";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // Get all assets
    const assetsResult = await db.execute("SELECT * FROM assets");
    const assets = assetsResult.rows.map((row) =>
      rowToAsset(row as unknown as AssetRow)
    );

    // Calculate totals
    const totalValue = assets.reduce((sum, a) => sum + a.current_amount, 0);

    const byType: Record<string, number> = {};
    const byWho: Record<string, number> = {};
    const byGeo: Record<string, number> = {};

    for (const asset of assets) {
      byType[asset.asset_type] = (byType[asset.asset_type] || 0) + asset.current_amount;
      byWho[asset.who] = (byWho[asset.who] || 0) + asset.current_amount;
      if (asset.geo) {
        byGeo[asset.geo] = (byGeo[asset.geo] || 0) + asset.current_amount;
      }
    }

    const snapshotData: SnapshotData = {
      assets,
      by_type: byType as Record<AssetType, number>,
      by_who: byWho as Record<WhoType, number>,
      by_geo: byGeo,
    };

    const today = new Date().toISOString().split("T")[0];

    // Check if a snapshot for today already exists
    const existingResult = await db.execute({
      sql: "SELECT id FROM snapshots WHERE snapshot_date = ?",
      args: [today],
    });

    if (existingResult.rows.length > 0) {
      // Update existing snapshot
      await db.execute({
        sql: "UPDATE snapshots SET total_value = ?, data_json = ? WHERE snapshot_date = ?",
        args: [totalValue, JSON.stringify(snapshotData), today],
      });
    } else {
      // Insert new snapshot
      await db.execute({
        sql: "INSERT INTO snapshots (snapshot_date, total_value, data_json) VALUES (?, ?, ?)",
        args: [today, totalValue, JSON.stringify(snapshotData)],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Snapshot created via cron",
      date: today,
      totalValue,
    });
  } catch (error) {
    console.error("Error in cron create-snapshot:", error);
    return NextResponse.json({ error: "Failed to create snapshot" }, { status: 500 });
  }
}
