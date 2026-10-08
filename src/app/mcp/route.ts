import { NextResponse } from "next/server";
import { searchPipeline, lookupPipeline, getSummary, getPermitTimes } from "@/lib/pipeline";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "toronto-development-pipeline", version: "1.0.0" };

const TOOLS = [
  {
    name: "pipeline_search",
    description:
      "Search Toronto development applications by address, application id, or neighbourhood. Optional status (proposed/active/built) and ward filters.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Search text" },
        status: { type: "string", enum: ["proposed", "active", "built"] },
        ward: { type: "string", description: "Ward number" },
        limit: { type: "integer", default: 20 },
      },
    },
  },
  {
    name: "pipeline_summary",
    description:
      "Totals for the development pipeline: records, units by status (proposed/active/built), and built units by 158-model neighbourhood.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "permit_times",
    description:
      "Median calendar days from building-permit application to issuance, by permit type and application year, with p25/p75.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", description: "Substring of permit type, e.g. 'New Building'" },
        year: { type: "string", description: "Application year, e.g. '2024'" },
      },
    },
  },
];

type JsonRpc = { jsonrpc?: string; id?: unknown; method?: string; params?: any };

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: JsonRpc) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = msg.params ?? {};
      try {
        if (name === "pipeline_search") {
          const rows = searchPipeline(
            String(args?.q ?? ""),
            String(args?.status ?? ""),
            String(args?.ward ?? ""),
            Math.min(parseInt(String(args?.limit ?? "20"), 10) || 20, 200)
          );
          return ok(id, textResult({ count: rows.length, results: rows }));
        }
        if (name === "pipeline_summary") {
          return ok(id, textResult(getSummary()));
        }
        if (name === "permit_times") {
          let rows = getPermitTimes();
          const t = String(args?.type ?? "").toLowerCase();
          const y = String(args?.year ?? "");
          if (t) rows = rows.filter((r) => r.permit_type.toLowerCase().includes(t));
          if (y) rows = rows.filter((r) => String(r.year) === y);
          return ok(id, textResult({ count: rows.length, results: rows }));
        }
        return err(id, -32602, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool error: ${(e as Error).message}`);
      }
    }
    default:
      return err(id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: JsonRpc | JsonRpc[];
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  if (Array.isArray(body)) {
    const out = body.map(handle).filter((r) => r !== null);
    return NextResponse.json(out);
  }
  const out = handle(body);
  if (out === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(out);
}

export async function GET() {
  return NextResponse.json(
    { error: "This MCP server accepts JSON-RPC 2.0 via POST only." },
    { status: 405 }
  );
}

export async function DELETE() {
  return new NextResponse(null, { status: 405 });
}
