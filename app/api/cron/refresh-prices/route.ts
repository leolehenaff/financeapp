import { NextResponse, type NextRequest } from "next/server";
import { refreshPrices } from "@/lib/prices";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await refreshPrices());
}
