import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Hypothesis, AssetType } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute("SELECT * FROM hypotheses ORDER BY asset_type");
    const hypotheses = result.rows.map((row) => {
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
    return NextResponse.json(hypotheses);
  } catch (error) {
    console.error("Error fetching hypotheses:", error);
    return NextResponse.json({ error: "Failed to fetch hypotheses" }, { status: 500 });
  }
}
