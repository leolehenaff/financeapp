import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { AllocationObjectiveRow, rowToAllocationObjective } from "@/lib/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    if (body.target_percent === undefined) {
      return NextResponse.json(
        { error: "target_percent is required" },
        { status: 400 }
      );
    }

    if (body.target_percent < 0 || body.target_percent > 100) {
      return NextResponse.json(
        { error: "target_percent must be between 0 and 100" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `UPDATE allocation_objectives
            SET target_percent = ?, updated_at = datetime('now')
            WHERE id = ?
            RETURNING *`,
      args: [body.target_percent, parseInt(id)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Objective not found" }, { status: 404 });
    }

    const objective = rowToAllocationObjective(
      result.rows[0] as unknown as AllocationObjectiveRow
    );
    return NextResponse.json(objective);
  } catch (error) {
    console.error("Error updating objective:", error);
    return NextResponse.json({ error: "Failed to update objective" }, { status: 500 });
  }
}
