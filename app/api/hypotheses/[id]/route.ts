import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Hypothesis, AssetType } from "@/lib/types";

interface UpdateHypothesisInput {
  pessimistic_rate?: number;
  avg_rate?: number;
  optimistic_rate?: number;
  monthly_contribution_leo?: number;
  monthly_contribution_julie?: number;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateHypothesisInput = await request.json();
    const db = getDb();

    const fields: string[] = [];
    const values: (number | null)[] = [];

    if (body.pessimistic_rate !== undefined) {
      fields.push("pessimistic_rate = ?");
      values.push(body.pessimistic_rate);
    }
    if (body.avg_rate !== undefined) {
      fields.push("avg_rate = ?");
      values.push(body.avg_rate);
    }
    if (body.optimistic_rate !== undefined) {
      fields.push("optimistic_rate = ?");
      values.push(body.optimistic_rate);
    }
    if (body.monthly_contribution_leo !== undefined) {
      fields.push("monthly_contribution_leo = ?");
      values.push(body.monthly_contribution_leo);
    }
    if (body.monthly_contribution_julie !== undefined) {
      fields.push("monthly_contribution_julie = ?");
      values.push(body.monthly_contribution_julie);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    fields.push("updated_at = datetime('now')");
    values.push(parseInt(id));

    const result = await db.execute({
      sql: `UPDATE hypotheses SET ${fields.join(", ")} WHERE id = ? RETURNING *`,
      args: values,
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Hypothesis not found" }, { status: 404 });
    }

    const row = result.rows[0] as unknown as Record<string, unknown>;
    const hypothesis: Hypothesis = {
      id: row.id as number,
      asset_type: row.asset_type as AssetType,
      pessimistic_rate: row.pessimistic_rate as number,
      avg_rate: row.avg_rate as number,
      optimistic_rate: row.optimistic_rate as number,
      monthly_contribution_leo: row.monthly_contribution_leo as number,
      monthly_contribution_julie: row.monthly_contribution_julie as number,
      updated_at: row.updated_at as string,
    };

    return NextResponse.json(hypothesis);
  } catch (error) {
    console.error("Error updating hypothesis:", error);
    return NextResponse.json({ error: "Failed to update hypothesis" }, { status: 500 });
  }
}
