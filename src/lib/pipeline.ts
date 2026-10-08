import { readFileSync } from "fs";
import { join } from "path";

const DATA = join(process.cwd(), "data");

export type PipelineRow = {
  id: string;
  address: string;
  ward: string;
  hoodCode: string;
  hoodName: string;
  statusRaw: string;
  status: "proposed" | "active" | "built" | "unknown";
  units: number;
  resGfa: string;
  nonresGfa: string;
  dateReceived: string;
  aicLink: string;
  lon: string;
  lat: string;
};

export type PermitTimeRow = {
  permit_type: string;
  year: number;
  n: number;
  median_days: number;
  p25_days: string;
  p75_days: string;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (c === "\r") { /* skip */ }
    else cur += c;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

let _pipeline: PipelineRow[] | null = null;
let _summary: any = null;
let _permitTimes: PermitTimeRow[] | null = null;
let _permitSummary: any = null;
let _hoods: any = null;

export function getPipeline(): PipelineRow[] {
  if (!_pipeline) {
    const text = readFileSync(join(DATA, "pipeline.csv"), "utf8");
    const rows = parseCsv(text);
    const h = rows[0];
    _pipeline = rows.slice(1).map((r) => {
      const o: Record<string, string> = {};
      h.forEach((k, i) => { o[k] = r[i] ?? ""; });
      return {
        id: o.id,
        address: o.address,
        ward: o.ward,
        hoodCode: o.neighbourhood_158_code,
        hoodName: o.neighbourhood_158_name,
        statusRaw: o.status_raw,
        status: (o.status || "unknown") as PipelineRow["status"],
        units: parseInt(o.proposed_units || "0", 10) || 0,
        resGfa: o.proposed_res_gfa,
        nonresGfa: o.proposed_nonres_gfa,
        dateReceived: o.date_received,
        aicLink: o.aic_link,
        lon: o.lon,
        lat: o.lat,
      };
    });
  }
  return _pipeline;
}

export function getSummary() {
  if (!_summary) _summary = JSON.parse(readFileSync(join(DATA, "summary.json"), "utf8"));
  return _summary;
}

export function getPermitTimes(): PermitTimeRow[] {
  if (!_permitTimes) {
    const text = readFileSync(join(DATA, "permit_times.csv"), "utf8");
    const rows = parseCsv(text);
    const h = rows[0];
    _permitTimes = rows.slice(1).map((r) => {
      const o: Record<string, string> = {};
      h.forEach((k, i) => { o[k] = r[i] ?? ""; });
      return {
        permit_type: o.permit_type,
        year: parseInt(o.year, 10),
        n: parseInt(o.n, 10),
        median_days: parseFloat(o.median_days),
        p25_days: o.p25_days,
        p75_days: o.p75_days,
      };
    });
  }
  return _permitTimes;
}

export function getPermitSummary() {
  if (!_permitSummary)
    _permitSummary = JSON.parse(readFileSync(join(DATA, "permit_times_summary.json"), "utf8"));
  return _permitSummary;
}

export function getHoods() {
  if (!_hoods) _hoods = JSON.parse(readFileSync(join(DATA, "neighbourhoods_158.geojson"), "utf8"));
  return _hoods;
}

export function searchPipeline(q: string, status: string, ward: string, limit = 50): PipelineRow[] {
  const needle = q.trim().toLowerCase();
  return getPipeline()
    .filter((r) => {
      if (status && r.status !== status) return false;
      if (ward && r.ward !== ward) return false;
      if (!needle) return true;
      return (
        r.address.toLowerCase().includes(needle) ||
        r.id.toLowerCase().includes(needle) ||
        r.hoodName.toLowerCase().includes(needle)
      );
    })
    .slice(0, limit);
}

export function lookupPipeline(id: string): PipelineRow | null {
  const norm = id.trim().toLowerCase().replace(/\s+/g, " ");
  return getPipeline().find((r) => r.id.toLowerCase() === norm) ?? null;
}
