import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Toronto Development Pipeline API",
    version: "1.0.0",
    description:
      "Normalized feed of Toronto's housing development pipeline: 2,391 planning applications with statuses, proposed units, wards and 158-model neighbourhoods, plus building-permit issuance times. Source: City of Toronto Open Data.",
  },
  paths: {
    "/api/v1/pipeline/search": {
      get: {
        summary: "Search development applications",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "Address, application id, or neighbourhood name" },
          { name: "status", in: "query", schema: { type: "string", enum: ["proposed", "active", "built"] } },
          { name: "ward", in: "query", schema: { type: "string" }, description: "Ward number, e.g. 10" },
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
        ],
        responses: { "200": { description: "Matching applications" } },
      },
    },
    "/api/v1/pipeline/lookup/{id}": {
      get: {
        summary: "One application by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Application record" }, "404": { description: "Unknown id" } },
      },
    },
    "/api/v1/pipeline/summary": {
      get: {
        summary: "Totals, units by status, built units by neighbourhood",
        responses: { "200": { description: "Summary statistics" } },
      },
    },
    "/api/v1/pipeline/permit_times": {
      get: {
        summary: "Median days from application to issuance, by permit type and year",
        parameters: [
          { name: "type", in: "query", schema: { type: "string" }, description: "Substring of permit type" },
          { name: "year", in: "query", schema: { type: "string" }, description: "Application year" },
        ],
        responses: { "200": { description: "Type-year rows with median/p25/p75 days" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
