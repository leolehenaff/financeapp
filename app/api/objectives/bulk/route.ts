import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { BulkAllocationObjectiveUpdate, AllocationObjectiveRow, rowToAllocationObjective } from "@/lib/types";

export async function PUT(request: NextRequest) {
  try {
    const body: BulkAllocationObjectiveUpdate = await request.json();
    const db = getDb();

    if (!body.category || !body.objectives || !Array.isArray(body.objectives)) {
      return NextResponse.json(
        { error: "category and objectives array are required" },
        { status: 400 }
      );
    }

    // Validate total adds up to 100
    const total = body.objectives.reduce((sum, obj) => sum + obj.target_percent, 0);
    if (Math.abs(total - 100) > 0.01) {
      return NextResponse.json(
        { error: `Percentages must sum to 100%. Current sum: ${total.toFixed(1)}%` },
        { status: 400 }
      );
    }

    // Update each objective
    for (const obj of body.objectives) {
      await db.execute({
        sql: `UPDATE allocation_objectives
              SET target_percent = ?, updated_at = datetime('now')
              WHERE category = ? AND key = ?`,
        args: [obj.target_percent, body.category, obj.key],
      });
    }

    // Fetch and return updated objectives
    const result = await db.execute({
      sql: "SELECT * FROM allocation_objectives WHERE category = ? ORDER BY key",
      args: [body.category],
    });

    const objectives = result.rows.map((row) =>
      rowToAllocationObjective(row as unknown as AllocationObjectiveRow)
    );

    return NextResponse.json(objectives);
  } catch (error) {
    console.error("Error bulk updating objectives:", error);
    return NextResponse.json({ error: "Failed to update objectives" }, { status: 500 });
  }
}
