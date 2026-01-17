import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { AssetRow, rowToAsset, Hypothesis, AssetType } from "@/lib/types";
import { calculateProjections } from "@/lib/calculations";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const years = parseInt(searchParams.get("years") || "10");

    const db = getDb();

    // Get all assets
    const assetsResult = await db.execute("SELECT * FROM assets");
    const assets = assetsResult.rows.map((row) =>
      rowToAsset(row as unknown as AssetRow)
    );

    // Get hypotheses
    const hypothesesResult = await db.execute("SELECT * FROM hypotheses");
    const hypotheses = hypothesesResult.rows.map((row) => {
      const r = row as unknown as Record<string, unknown>;
      return {
        id: r.id as number,
        asset_type: r.asset_type as AssetType,
        pessimistic_rate: r.pessimistic_rate as number,
        avg_rate: r.avg_rate as number,
        optimistic_rate: r.optimistic_rate as number,
        monthly_contribution_leo: r.monthly_contribution_leo as number,
        monthly_contribution_julie: r.monthly_contribution_julie as number,
        updated_at: r.updated_at as string,
      } as Hypothesis;
    });

    // Calculate projections
    const projections = calculateProjections(assets, hypotheses, years);

    return NextResponse.json({
      projections,
      currentTotal: assets.reduce((sum, a) => sum + a.current_amount, 0),
      hypotheses,
    });
  } catch (error) {
    console.error("Error calculating projections:", error);
    return NextResponse.json({ error: "Failed to calculate projections" }, { status: 500 });
  }
}
