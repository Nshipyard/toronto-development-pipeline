import { NextResponse } from "next/server";
import { getPermitTimes, getPermitSummary } from "@/lib/pipeline";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const type = (u.searchParams.get("type") ?? "").toLowerCase();
  const year = u.searchParams.get("year") ?? "";
  let rows = getPermitTimes();
  if (type) rows = rows.filter((r) => r.permit_type.toLowerCase().includes(type));
  if (year) rows = rows.filter((r) => String(r.year) === year);
  return NextResponse.json({
    count: rows.length,
    caveats: getPermitSummary().caveats,
    by_type: getPermitSummary().by_type,
    results: rows,
  });
}
