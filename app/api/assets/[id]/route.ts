import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { AssetRow, rowToAsset, UpdateAssetInput } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM assets WHERE id = ?",
      args: [parseInt(id)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const asset = rowToAsset(result.rows[0] as unknown as AssetRow);
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateAssetInput = await request.json();
    const db = getDb();

    // Build dynamic update query
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.name !== undefined) {
      fields.push("name = ?");
      values.push(body.name);
    }
    if (body.ticker !== undefined) {
      fields.push("ticker = ?");
      values.push(body.ticker);
    }
    if (body.isin !== undefined) {
      fields.push("isin = ?");
      values.push(body.isin);
    }
    if (body.who !== undefined) {
      fields.push("who = ?");
      values.push(body.who);
    }
    if (body.asset_type !== undefined) {
      fields.push("asset_type = ?");
      values.push(body.asset_type);
    }
    if (body.geo !== undefined) {
      fields.push("geo = ?");
      values.push(body.geo);
    }
    if (body.quantity !== undefined) {
      fields.push("quantity = ?");
      values.push(body.quantity);
    }
    if (body.buying_value !== undefined) {
      fields.push("buying_value = ?");
      values.push(body.buying_value);
    }
    if (body.buying_amount !== undefined) {
      fields.push("buying_amount = ?");
      values.push(body.buying_amount);
    }
    if (body.current_value !== undefined) {
      fields.push("current_value = ?");
      values.push(body.current_value);
    }
    if (body.current_amount !== undefined) {
      fields.push("current_amount = ?");
      values.push(body.current_amount);
    }
    if (body.auto_refresh !== undefined) {
      fields.push("auto_refresh = ?");
      values.push(body.auto_refresh ? 1 : 0);
    }
    if (body.dividend_per_share !== undefined) {
      fields.push("dividend_per_share = ?");
      values.push(body.dividend_per_share);
    }
    if (body.notes !== undefined) {
      fields.push("notes = ?");
      values.push(body.notes);
    }
    if (body.startup_rating !== undefined) {
      fields.push("startup_rating = ?");
      values.push(body.startup_rating);
    }
    if (body.ir_reduction !== undefined) {
      fields.push("ir_reduction = ?");
      values.push(body.ir_reduction);
    }
    if (body.alert_high !== undefined) {
      fields.push("alert_high = ?");
      values.push(body.alert_high);
    }
    if (body.alert_low !== undefined) {
      fields.push("alert_low = ?");
      values.push(body.alert_low);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    fields.push("updated_at = datetime('now')");
    values.push(parseInt(id));

    const result = await db.execute({
      sql: `UPDATE assets SET ${fields.join(", ")} WHERE id = ? RETURNING *`,
      args: values,
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const asset = rowToAsset(result.rows[0] as unknown as AssetRow);
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const result = await db.execute({
      sql: "DELETE FROM assets WHERE id = ?",
      args: [parseInt(id)],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
