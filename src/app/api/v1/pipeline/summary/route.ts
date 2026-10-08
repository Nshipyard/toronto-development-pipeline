import { NextResponse } from "next/server";
import { getSummary } from "@/lib/pipeline";

export async function GET() {
  return NextResponse.json(getSummary());
}
