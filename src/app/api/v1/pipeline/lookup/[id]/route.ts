import { NextResponse } from "next/server";
import { lookupPipeline } from "@/lib/pipeline";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const row = lookupPipeline(decodeURIComponent(id));
  if (!row) return NextResponse.json({ error: `Unknown application id ${id}` }, { status: 404 });
  return NextResponse.json(row);
}
