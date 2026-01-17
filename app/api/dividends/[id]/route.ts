import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const result = await db.execute({
      sql: "DELETE FROM dividends WHERE id = ?",
      args: [parseInt(id)],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "Dividend not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dividend:", error);
    return NextResponse.json({ error: "Failed to delete dividend" }, { status: 500 });
  }
}
