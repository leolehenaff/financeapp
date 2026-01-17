import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { AllocationObjectiveRow, rowToAllocationObjective } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const db = getDb();
    let sql = "SELECT * FROM allocation_objectives";
    const args: string[] = [];

    if (category) {
      sql += " WHERE category = ?";
      args.push(category);
    }

    sql += " ORDER BY category, key";

    const result = await db.execute({ sql, args });
    const objectives = result.rows.map((row) =>
      rowToAllocationObjective(row as unknown as AllocationObjectiveRow)
    );

    return NextResponse.json(objectives);
  } catch (error) {
    console.error("Error fetching objectives:", error);
    return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 });
  }
}
