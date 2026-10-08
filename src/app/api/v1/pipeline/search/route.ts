import { NextResponse } from "next/server";
import { searchPipeline } from "@/lib/pipeline";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const rows = searchPipeline(
    u.searchParams.get("q") ?? "",
    u.searchParams.get("status") ?? "",
    u.searchParams.get("ward") ?? "",
    Math.min(parseInt(u.searchParams.get("limit") ?? "50", 10) || 50, 200)
  );
  return NextResponse.json({ count: rows.length, results: rows });
}
